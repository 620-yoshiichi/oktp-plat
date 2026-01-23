

import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { knockEmailApi } from '@cm/lib/methods/knockEmailApi'
import { formatDate } from '@cm/class/Days/date-utils/formatters'
import { UCAR_CODE } from './UCAR_CODE'
import { UcarRequest, User, Ucar } from '@prisma/generated/prisma/client'

export type UcarRequestData = UcarRequest & {
  User: User
  Ucar: Ucar
  ApprovedBy?: User | null
}

export class UcarRequestCl {
  data: UcarRequestData

  constructor(data: UcarRequestData) {
    this.data = data
  }

  /**
   * 申請を承諾する
   */
  static async approve(props: { requestId: number; approvedById: number }): Promise<{ success: boolean; message: string }> {
    const { requestId, approvedById } = props

    try {
      // 申請データを取得
      const { result: request } = await doStandardPrisma('ucarRequest', 'findUnique', {
        where: { id: requestId },
        include: { Ucar: true, User: true },
      })


      if (!request) {
        return { success: false, message: '申請データが見つかりません' }
      }

      if (request.status !== 'pending') {
        return { success: false, message: 'この申請は既に処理済みです' }
      }

      // 申請ステータスを更新
      await doStandardPrisma('ucarRequest', 'update', {
        where: { id: requestId },
        data: {
          status: 'approved',
          approvedAt: new Date(),
          approvedById,
        },
      })

      // 申請区分に応じた処理
      const requestTypeObj = UCAR_CODE.REQUEST_TYPES.byCode(request.requestType)

      if (requestTypeObj?.onApprove === 'setInactive') {

        // 非表示申請の場合、Ucarをactive=falseに更新
        await doStandardPrisma('ucar', 'update', {
          where: { id: request.ucarId },
          data: { active: false },
        })
      }

      // 申請者にメール通知
      if (request.User?.email) {
        const text = [
          `【Ucar申請承諾通知】`,
          ``,
          `以下の申請が承諾されました。`,
          ``,
          `■ 申請情報`,
          `申請区分: ${requestTypeObj?.label || ''}`,
          `申請理由: ${request.reason || ''}`,
          `査定番号: ${request.sateiID}`,
          `承諾日時: ${formatDate(new Date(), 'YYYY/MM/DD HH:mm')}`,
        ].join('\n')

        await knockEmailApi({
          subject: `【Ucar申請承諾】${request.sateiID}`,
          text,
          to: [request.User.email],
        })
      }

      return { success: true, message: '申請を承諾しました' }
    } catch (error) {
      console.error('承諾処理エラー:', error)
      return { success: false, message: '承諾処理に失敗しました' }
    }
  }

  /**
   * 申請を却下する
   */
  static async reject(props: {
    requestId: number
    approvedById: number
    rejectedReason?: string
  }): Promise<{ success: boolean; message: string }> {
    const { requestId, approvedById, rejectedReason } = props

    try {
      // 申請データを取得
      const { result: request } = await doStandardPrisma('ucarRequest', 'findUnique', {
        where: { id: requestId },
        include: { Ucar: true, User: true },
      })

      if (!request) {
        return { success: false, message: '申請データが見つかりません' }
      }

      if (request.status !== 'pending') {
        return { success: false, message: 'この申請は既に処理済みです' }
      }

      // 申請ステータスを更新
      await doStandardPrisma('ucarRequest', 'update', {
        where: { id: requestId },
        data: {
          status: 'rejected',
          approvedAt: new Date(),
          approvedById,
          rejectedReason,
        },
      })

      const requestTypeObj = UCAR_CODE.REQUEST_TYPES.byCode(request.requestType)

      // 申請者にメール通知
      if (request.User?.email) {
        const text = [
          `【Ucar申請却下通知】`,
          ``,
          `以下の申請が却下されました。`,
          ``,
          `■ 申請情報`,
          `申請区分: ${requestTypeObj?.label || ''}`,
          `申請理由: ${request.reason || ''}`,
          `査定番号: ${request.sateiID}`,
          `却下日時: ${formatDate(new Date(), 'YYYY/MM/DD HH:mm')}`,
          rejectedReason ? `却下理由: ${rejectedReason}` : '',
        ]
          .filter(Boolean)
          .join('\n')

        await knockEmailApi({
          subject: `【Ucar申請却下】${request.sateiID}`,
          text,
          to: [request.User.email],
        })
      }

      return { success: true, message: '申請を却下しました' }
    } catch (error) {
      console.error('却下処理エラー:', error)
      return { success: false, message: '却下処理に失敗しました' }
    }
  }

  /**
   * 申請一覧を取得
   */
  static async getList(props: { status?: string; take?: number; skip?: number }) {
    const { status, take = 50, skip = 0 } = props

    const where: any = {}
    if (status) {
      where.status = status
    }

    const { result: requests } = await doStandardPrisma('ucarRequest', 'findMany', {
      where,
      include: {
        User: { select: { id: true, name: true, email: true } },
        Ucar: {
          select: {
            id: true,
            sateiID: true,
            Store: { select: { name: true } },
          },
        },
        ApprovedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    })

    return requests || []
  }

  /**
   * システム管理者のメールアドレスリストを取得
   */
  static async getAdminEmails(): Promise<string[]> {
    const { result: adminUsers } = await doStandardPrisma('user', 'findMany', {
      where: { role: '管理者' },
      select: { email: true },
    })

    return (adminUsers || []).filter(u => u.email).map(u => u.email as string)
  }
}
