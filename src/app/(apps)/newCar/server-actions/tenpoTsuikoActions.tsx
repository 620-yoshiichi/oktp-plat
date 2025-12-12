'use server'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'
import {Prisma} from '@prisma/generated/prisma/client'
import {isDev} from '@cm/lib/methods/common'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

const getRedirectUrl = (newCarId: number) => {
  return process.env.NEXT_PUBLIC_BASEPATH + '/newCar?rootPath=newCar/tenpo-tsuiko-shinsei/' + newCarId
}

/**
 * 店舗追工対象車両データを取得
 */
export async function getTenpoTsuikoData(
  searchNoCyumon?: string,
  statusFilter?: 'all' | '未申請' | '申請中' | '承認完了' | '却下'
) {
  try {
    const startDate = getMidnight(new Date(2025, 9, 1))

    // 検索条件を構築
    const whereCondition: {AND: Prisma.NewCarWhereInput[]} = {
      AND: [
        {
          DD_HAISKIBO: {gte: startDate},
        },
      ],
    }

    // 受注番号で検索する場合
    if (searchNoCyumon && searchNoCyumon.trim()) {
      whereCondition.AND.push({
        NO_CYUMON: {
          contains: searchNoCyumon.trim(),
          mode: 'insensitive', // 大文字小文字を区別しない
        },
        TenpoTsuikoData: {some: {id: {gte: 0}}},
      })
    } else {
      whereCondition.AND.push({
        TenpoTsuikoData: {some: {id: {gte: 0}}},
      })
    }

    // ステータスフィルターを適用
    if (statusFilter && statusFilter !== 'all') {
      switch (statusFilter) {
        case '未申請':
          // 申請履歴がない、またはアクティブな申請がない車両
          whereCondition.AND.push({
            OR: [{TenpoTsuikoShinseiHeader: {none: {}}}, {TenpoTsuikoShinseiHeader: {none: {active: true}}}],
          })
          break
        case '申請中':
          // 承認待ち状態がある車両
          whereCondition.AND.push({
            TenpoTsuikoShinseiHeader: {
              some: {
                active: true,
                TenpoTsuikoShinseiDetail: {
                  some: {status: 'pending'},
                },
              },
            },
          })
          break
        case '承認完了':
          // 全ての承認が完了した車両
          whereCondition.AND.push({
            TenpoTsuikoShinseiHeader: {
              some: {
                active: true,
                TenpoTsuikoShinseiDetail: {
                  every: {status: 'approved'},
                },
              },
            },
          })
          break
        case '却下':
          // 拒否された車両
          whereCondition.AND.push({
            TenpoTsuikoShinseiHeader: {
              some: {
                active: true,
                TenpoTsuikoShinseiDetail: {
                  some: {status: 'rejected'},
                },
              },
            },
          })
          break
      }
    }

    // 追工データがある車両を取得（車両ベース）
    const {result: carsWithTsuiko} = await doStandardPrisma('newCar', 'findMany', {
      where: whereCondition,
      include: {
        Store: {select: {id: true, name: true, code: true}},
        User: {select: {id: true, name: true, email: true}},
        TenpoTsuikoShinseiHeader: {
          include: {TenpoTsuikoShinseiDetail: {include: {User: true}}},
          orderBy: {createdAt: 'desc'},
        },
        TenpoTsuikoData: {
          where: {},
          orderBy: {createdAt: 'desc'},
        },
      },
      orderBy: {createdAt: 'desc'},
      take: 100,
    })

    return {
      success: true,
      data: carsWithTsuiko,
      count: carsWithTsuiko.length,
    }
  } catch (error) {
    console.error('店舗追工データ取得エラー:', error)
    return {
      success: false,
      message: 'データ取得中にエラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'),
      data: [],
      count: 0,
    }
  }
}

/**
 * 店舗追工申請を作成
 */
export const createTenpoTsuikoShinsei = async (params: {newCarId: number}) => {
  try {
    const {newCarId} = params

    // 1. NewCarデータと関連店舗情報、既存申請を取得
    const {result: newCar} = await doStandardPrisma('newCar', 'findUnique', {
      where: {id: newCarId},
      include: {
        Store: true,
        User: true,
        TenpoTsuikoData: {
          where: {
            processed: false,
          },
        },
        TenpoTsuikoShinseiHeader: {
          where: {active: true},
          include: {
            TenpoTsuikoShinseiDetail: true,
          },
        },
      },
    })

    if (!newCar) {
      return {
        success: false,
        message: '車両データが見つかりません',
      }
    }

    // 3. 既存のアクティブな申請を無効化
    if (newCar.TenpoTsuikoShinseiHeader.length > 0) {
      await doStandardPrisma('tenpoTsuikoShinseiHeader', 'updateMany', {
        where: {
          newCarId: newCarId,
          active: true,
        },
        data: {
          active: false,
        },
      })
    }

    // 4. 承認者リストを作成（店長→担当スタッフ→サービス副店長の順）
    const approvers = await getApproverList(newCar.storeId, newCar.userId)

    if (approvers.length === 0) {
      return {
        success: false,
        message: '承認者が見つかりません',
      }
    }

    // 5. TenpoTsuikoShinseiHeaderを作成
    const {result: header} = await doStandardPrisma('tenpoTsuikoShinseiHeader', 'create', {
      data: {
        date: new Date(),
        newCarId: newCar.id,
        approvalOrder: 1,
        active: true,
      },
    })

    // 6. TenpoTsuikoShinseiDetailを作成（承認者分）
    const detailCreatePromises = approvers.map((approver, index) =>
      doStandardPrisma('tenpoTsuikoShinseiDetail', 'create', {
        data: {
          userId: approver.id,
          status: index === 0 ? 'pending' : 'waiting',
          approvalOrder: index + 1,
          tenpoTsuikoShinseiHeaderId: header.id,
        },
      })
    )

    await Promise.all(detailCreatePromises)

    // 7. 該当車両の全ての追工データを処理済みに変更
    await doStandardPrisma('tenpoTsuikoData', 'updateMany', {
      where: {
        APPINDEX_FKEY: newCar.APPINDEX,
        processed: false,
      },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    })

    // 8. 最初の承認者にメール送信
    await sendNotificationEmail({
      approver: approvers[0],
      newCar,
      type: 'initial',
    })

    return {
      success: true,
      message: '店舗連絡を作成し、初回承認者にメールを送信しました',
      headerId: header.id,
      approvers: approvers.map(a => ({id: a.id, name: a.name, email: a.email})),
    }
  } catch (error) {
    console.error('店舗連絡作成エラー:', error)
    return {
      success: false,
      message: 'エラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'),
    }
  }
}

/**
 * 承認処理
 */
export async function processApproval(params: {
  detailId: number
  status: 'approved' | 'rejected'
  comment?: string
  userId: number
}) {
  try {
    const {detailId, status, comment, userId} = params

    // 権限確認
    const {result: detail} = await doStandardPrisma('tenpoTsuikoShinseiDetail', 'findUnique', {
      where: {id: detailId},
      include: {
        User: true,
        TenpoTsuikoShinseiHeader: {
          include: {
            NewCar: {include: {User: true, Store: true}},
            TenpoTsuikoShinseiDetail: {
              include: {User: true},
              orderBy: {approvalOrder: 'asc'},
            },
          },
        },
      },
    })

    if (!detail) {
      return {
        success: false,
        message: '承認データが見つかりません',
      }
    }

    if (detail.userId !== userId && !isDev) {
      return {
        success: false,
        message: '承認権限がありません',
      }
    }

    if (detail.status !== 'pending') {
      return {
        success: false,
        message: 'この承認は既に処理済みです',
      }
    }

    // 1. 承認詳細を更新
    const {result: updatedDetail} = await doStandardPrisma('tenpoTsuikoShinseiDetail', 'update', {
      where: {id: detailId},
      data: {
        status,
        comment,
        processedAt: new Date(),
      },
      include: {
        User: true,
        TenpoTsuikoShinseiHeader: {
          include: {
            NewCar: {include: {User: true, Store: true}},
            TenpoTsuikoShinseiDetail: {
              include: {User: true},
              orderBy: {approvalOrder: 'asc'},
            },
          },
        },
      },
    })

    const header = updatedDetail.TenpoTsuikoShinseiHeader
    const allDetails = header.TenpoTsuikoShinseiDetail

    if (status === 'rejected') {
      // 拒否の場合、関係者全員にメール送信
      await sendRejectionNotification(header, updatedDetail)

      return {
        success: true,
        message: '承認を拒否しました。関係者にメールを送信しました。',
      }
    }

    if (status === 'approved') {
      // 次の承認者を探す
      const nextDetail = allDetails
        .filter(d => d.approvalOrder > updatedDetail.approvalOrder && d.status === 'waiting')
        .sort((a, b) => a.approvalOrder - b.approvalOrder)[0]

      if (nextDetail) {
        // 次の承認者を有効化
        await doStandardPrisma('tenpoTsuikoShinseiDetail', 'update', {
          where: {id: nextDetail.id},
          data: {status: 'pending'},
        })

        // 次の承認者にメール送信
        await sendApprovalNotification(header, nextDetail.User)

        return {
          success: true,
          message: '承認しました。次の承認者にメールを送信しました。',
        }
      } else {
        // 全承認完了
        await sendCompletionNotification(header)

        return {
          success: true,
          message: '全ての承認が完了しました。関係者全員にメールを送信しました。',
        }
      }
    }

    return {
      success: false,
      message: '無効なステータスです',
    }
  } catch (error) {
    console.error('承認処理エラー:', error)
    return {
      success: false,
      message: 'エラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'),
    }
  }
}

/**
 * 承認履歴を取得
 */
export async function getTenpoTsuikoHistory(newCarId: number) {
  try {
    // 指定された車両の店舗追工申請履歴を取得
    const {result: histories} = await doStandardPrisma('tenpoTsuikoShinseiHeader', 'findMany', {
      where: {newCarId},
      include: {
        NewCar: {
          include: {
            Store: true,
            User: true,
          },
        },
        TenpoTsuikoShinseiDetail: {
          include: {User: true},
          orderBy: {approvalOrder: 'asc'},
        },
      },
      take: 1,
      orderBy: {createdAt: 'desc'},
    })

    return {
      success: true,
      data: histories,
      count: histories.length,
    }
  } catch (error) {
    console.error('履歴取得エラー:', error)
    return {
      success: false,
      message: 'データ取得中にエラーが発生しました: ' + error.message,
      data: [],
      count: 0,
    }
  }
}

/**
 * 車両データを取得
 */
export async function getNewCarData(newCarId: number) {
  try {
    // 車両データを取得
    const {result: newCar} = await doStandardPrisma('newCar', 'findUnique', {
      where: {id: newCarId},
      include: {
        Store: {select: {id: true, name: true, code: true}},
        User: {select: {id: true, name: true, email: true}},
        TenpoTsuikoData: {orderBy: {createdAt: 'desc'}},
      },
    })

    if (!newCar) {
      return {
        success: false,
        message: '車両データが見つかりません',
        data: null,
      }
    }

    return {
      success: true,
      data: newCar,
    }
  } catch (error) {
    console.error('車両データ取得エラー:', error)
    return {
      success: false,
      message: 'データ取得中にエラーが発生しました: ' + error.message,
      data: null,
    }
  }
}

// ===================== ヘルパー関数 =====================

// 承認者リスト取得関数
async function getApproverList(storeId: number, staffUserId: number) {
  try {
    // 店長取得
    const {result: managers} = await doStandardPrisma('user', 'findMany', {
      where: {
        storeId,
        active: true,
        UserRole: {
          some: {
            RoleMaster: {name: '店長'},
          },
        },
      },
    })

    // 担当スタッフ取得
    const {result: staff} = await doStandardPrisma('user', 'findUnique', {
      where: {id: staffUserId},
    })

    // サービス副店長取得
    const {result: serviceManagers} = await doStandardPrisma('user', 'findMany', {
      where: {
        storeId,
        active: true,
        UserRole: {
          some: {
            RoleMaster: {name: 'サービス副店長'},
          },
        },
      },
    })

    const approvers = [
      managers[0], // 店長（最初）
      staff, // 担当スタッフ
      serviceManagers[0], // サービス副店長（最後）
    ].filter(Boolean)

    return approvers
  } catch (error) {
    console.error('承認者リスト取得エラー:', error)
    return []
  }
}

// メール送信関数
async function sendNotificationEmail({approver, newCar, type}) {
  try {
    if (!approver?.email) {
      console.warn('承認者のメールアドレスが設定されていません:', approver?.name)
      return
    }

    const subject = `【店舗追工連絡】承認依頼 - ${newCar.KJ_KURUMAME} (${newCar.NO_CYUMON})`
    const text = `
${approver.name} 様

店舗追工連絡の承認依頼が届いています。

車両情報:
- 車名: ${newCar.KJ_KURUMAME || '未設定'}
- 注文番号: ${newCar.NO_CYUMON || '未設定'}
- 担当者: ${newCar.User?.name || '未設定'}
- 店舗: ${newCar.Store?.name || '未設定'}

以下のリンクから承認処理を行ってください:
  ${getRedirectUrl(newCar.id)}

※このメールは自動送信です。
`

    const result = await knockEmailApi({
      to: [approver.email],
      subject,
      text,
    })

    console.log('メール送信結果:', result)
  } catch (error) {
    console.error('メール送信エラー:', error)
  }
}

async function sendRejectionNotification(header: any, rejectedDetail: any) {
  try {
    const allUsers = header.TenpoTsuikoShinseiDetail.map((d: any) => d.User)
    const emailList = allUsers.map((u: any) => u.email).filter(Boolean)

    if (emailList.length === 0) {
      console.warn('送信先メールアドレスがありません')
      return
    }

    await knockEmailApi({
      to: emailList,
      subject: `【店舗追工連絡】承認拒否のお知らせ - ${header.NewCar.KJ_KURUMAME}`,
      text: `
店舗追工連絡が拒否されました。

車両情報:
- 車名: ${header.NewCar.KJ_KURUMAME || '未設定'}
- 注文番号: ${header.NewCar.NO_CYUMON || '未設定'}
- 担当者: ${header.NewCar.User?.name || '未設定'}

拒否詳細:
- 拒否者: ${rejectedDetail.User.name}
- 拒否理由: ${rejectedDetail.comment || '理由なし'}
- 拒否日時: ${new Date(rejectedDetail.processedAt).toLocaleString('ja-JP')}

※このメールは自動送信です。
`,
    })
  } catch (error) {
    console.error('拒否通知メール送信エラー:', error)
  }
}

async function sendApprovalNotification(header: any, nextApprover: any) {
  try {
    if (!nextApprover?.email) {
      console.warn('次の承認者のメールアドレスが設定されていません:', nextApprover?.name)
      return
    }

    await knockEmailApi({
      to: [nextApprover.email],
      subject: `【店舗追工連絡】承認依頼 - ${header.NewCar.KJ_KURUMAME}`,
      text: `
${nextApprover.name} 様

店舗追工連絡の承認依頼が回ってきました。

車両情報:
- 車名: ${header.NewCar.KJ_KURUMAME || '未設定'}
- 注文番号: ${header.NewCar.NO_CYUMON || '未設定'}
- 担当者: ${header.NewCar.User?.name || '未設定'}
- 店舗: ${header.NewCar.Store?.name || '未設定'}

以下のリンクから承認処理を行ってください:
${getRedirectUrl(header.NewCar.id)}


※このメールは自動送信です。
`,
    })
  } catch (error) {
    console.error('承認通知メール送信エラー:', error)
  }
}

async function sendCompletionNotification(header: any) {
  try {
    const allUsers = header.TenpoTsuikoShinseiDetail.map((d: any) => d.User)
    const emailList = allUsers.map((u: any) => u.email).filter(Boolean)

    if (emailList.length === 0) {
      console.warn('送信先メールアドレスがありません')
      return
    }

    await knockEmailApi({
      to: emailList,
      subject: `【店舗追工連絡】承認完了のお知らせ - ${header.NewCar.KJ_KURUMAME}`,
      text: `
店舗追工連絡の承認が完了しました。

車両情報:
- 車名: ${header.NewCar.KJ_KURUMAME || '未設定'}
- 注文番号: ${header.NewCar.NO_CYUMON || '未設定'}
- 担当者: ${header.NewCar.User?.name || '未設定'}
- 店舗: ${header.NewCar.Store?.name || '未設定'}

全ての承認者による承認が完了いたしました。
完了日時: ${new Date().toLocaleString('ja-JP')}

※このメールは自動送信です。
`,
    })
  } catch (error) {
    console.error('完了通知メール送信エラー:', error)
  }
}
