'use server'

import {isDelayed, isRequired} from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'

import {
  EasySearchObject,
  EasySearchObjectExclusiveGroup,
  easySearchType,
  Ex_exclusive0,
  makeEasySearchGroups,
  makeEasySearchGroupsProp,
  toRowGroup,
} from '@cm/class/builders/QueryBuilderVariables'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'

import {Prisma} from '@prisma/client'

export const NewCarEasySearchBuilder = async () => {
  const newCar = async (props: easySearchType) => {
    'use server'
    const {isHQ, isTestUser} = props?.easySearchExtraProps ?? {}

    const {firstDayOfMonth, lastDayOfMonth} = Days.month.getMonthDatum(getMidnight(new Date()))

    type exclusiveKeyStrings =
      | 'reset'
      | `m2`
      | `m1`
      | `m0`
      | `m2_done`
      | `ｍ2_delay`
      | `m2_failed`
      | `m1_done`
      | `m1_delay`
      | `m1_failed`
      | `m0_done`
      | `m0_delay`
      | `m0_failed`
      | `mikomi_input`
      | `mikomi_overdue`
      | `mikomi_undefined`
      | `mikomi_to_update`
      | `torokuKibou_approved`
      | `torokuKibou_Progress`
      | `torokuKibou_null`
      | `mikomiOnMonth`
      | `haisoAvailable`
      | `haisouRequired`
      | `m0_remarks`
      | `furiate`
      | `not_furiate`
      | `not_nousya`
      | `nousya`
      | `not_touroku`
      | `touroku`
      | `naramotoRegisterd`
      | `naramotoNonRegisterd`
      | `toroku_nonFr`
      | `paymentUndone`
      | `paymentDone`
      | `haisoTooEarly`
      | `tenpoTsuiko_pending`
      | `tenpoTsuiko_Finished`
      | `shitadoriAri`
      | `sateiNyukoYoteiKeikoku`

    type CONDITION_TYPE = Prisma.NewCarWhereInput
    type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings, CONDITION_TYPE>

    type keys = {
      [key in exclusiveKeyStrings]: EasySearchObject
    }

    const Ex_m2: exclusiveGroups = {
      m2: {
        notify: true,
        label: `対\n象`,
        description: `「生産予定2ヶ月前」活動対象リストです。`,
        CONDITION: {
          m2Alert: {not: null}, // m2アラートが存在する
          ...isRequired('m2Status'), // m2ステータスが必須
        },
      },
    }

    const Ex_m1: exclusiveGroups = {
      m1: {
        notify: true,
        label: `対\n象`,
        description: `「生産予定1ヶ月前」活動対象リストです。`,
        CONDITION: {
          m1Alert: {not: null}, // m1アラートが存在する
          ...isRequired('m1Status'), // m1ステータスが必須
        },
      },
      m1_delay: {
        notify: true,
        description: `「生産予定1ヶ月前」の書類回収活動に遅れているリストです。`,
        label: `遅\nれ`,
        CONDITION: {
          AND: [
            {m1Alert: {not: null}}, // m1アラートが存在する
            isDelayed('m1Status'), // m1ステータスが遅延している
          ],
        },
      },
    }

    const Ex_m0: exclusiveGroups = {
      m0: {
        notify: true,
        label: `対\n象`,
        description: `振当時活動対象リストです。`,
        CONDITION: {
          DD_FR: {not: null}, // 振当日が存在する
          ...isRequired('m0Status'), // m0ステータスが必須
        },
      },
      m0_delay: {
        notify: true,
        label: `遅\nれ`,
        description: `納車予定日に遅れているリストです。`,
        CONDITION: {
          AND: [
            {m2Alert: {not: null}}, // m2アラートが存在する
            isDelayed('m0Status'), // m0ステータスが遅延している
          ],
        },
      },
    }

    const Ex_mikomi: exclusiveGroups = {
      mikomi_undefined: {
        notify: true,
        label: `見込\n未入力`,
        description: `「生産予定1ヶ月前」を切っても、見込み入力がされていないリストです。`,
        CONDITION: {
          lastApprovedDesiredTorokuDate: null, // 最後に承認された登録希望日が存在しない
          DD_TOUROKU: null, // 登録日が存在しない
          m1Alert: {not: null}, // m1アラートが存在する
          m1_toroku_prediction: null, // m1登録予測が存在しない
        },
      },
      mikomi_to_update: {
        notify: true,
        label: `見込\n要修正`,
        description: `過去に見込みを入れていたが、その月に登録できなかった車」が表示されます。`,
        CONDITION: {
          lastApprovedDesiredTorokuDate: null, // 最後に承認された登録希望日が存在しない
          DD_TOUROKU: null, // 登録日が存在しない
          m1Alert: {not: null}, // m1アラートが存在する
          m1_toroku_prediction: {lt: firstDayOfMonth}, // m1登録予測が月初より前
        },
      },
    }

    const FR_BUT_NOT_TOUROKU = {
      DD_FR: {not: null}, // 振当日が存在する
      DD_TOUROKU: null, // 登録日が存在しないｄしない
    }

    const thisMonthWhere = {
      gte: firstDayOfMonth, // 月初以降
      lte: lastDayOfMonth, // 月末より前
    }

    const torokuKibou: exclusiveGroups = {
      torokuKibou_null: {
        notify: true,
        label: `登録\n申請前`,
        description: `振り当て後、未登録で、登録申請前のものです。`,
        CONDITION: {
          DD_TOUROKU: null, // 登録日が存在しない
          DD_FR: {not: null}, // 振当日が存在する
          lastApprovedDesiredTorokuDate: null, // 最後に承認された登録希望日が存在しない
        },
      },
      haisouRequired: {
        label: `至急\n申請`,
        description: `配送希望が入っており、登録申請がなされていないものです。`,
        notify: stressedNotify,
        CONDITION: {torokuApplicationRequired: true}, // 登録申請が必要
      },

      torokuKibou_Progress: {
        notify: true,
        label: `登録\n申請中`,
        description: `登録申請中のリストです。`,
        CONDITION: {
          DD_TOUROKU: null, // 登録日が存在しない
          DesiredTorokuDate: {some: {status: null}}, // 登録希望日が存在し、ステータスが未設定
        },
      },

      // torokuKibou_approved: {
      //   label: `承認済\n未登録`,
      //   description: `登録申請が承認されたリストです。`,
      //   CONDITION: {
      //     lastApprovedDesiredTorokuDate: {not: null}, // 最後に承認された登録希望日が存在する
      //     DD_TOUROKU: null, // 登録日が存在しない
      //   },
      // },

      mikomiOnMonth: {
        label: `今月\n登録予定`,
        description: `「今月の登録済み」「申請済み」「見込み」の総数です。\n画面左上の「納車済み」をチェックすると、今月納車のものも含めてカウントした数字が出ます。。
        `,
        notify: {background: '#407eb9', color: `white`},
        CONDITION: {
          OR: [
            {DD_TOUROKU: thisMonthWhere}, // 登録日が今月
            {
              DD_TOUROKU: null, // 登録日が存在しない
              lastApprovedDesiredTorokuDate: thisMonthWhere, // 最後に承認された登録希望日が今月
            },
            {
              DD_TOUROKU: null, // 登録日が存在しない
              lastApprovedDesiredTorokuDate: null, // 最後に承認された登録希望日が存在しない
              m1_toroku_prediction: thisMonthWhere, // m1登録予測が今月
            },
          ],
        },
      },
    }

    const Ex_Delivery: exclusiveGroups = {
      haisoAvailable: {
        label: `配送\n入力`,
        notify: true,
        description: `登録申請承認済みで配送希望が入っていないものです。`,
        CONDITION: {
          ...FR_BUT_NOT_TOUROKU, // 振当日が存在し、登録日が存在しない
          DD_HAISKIBO: null, // 配送希望日が存在しない
          DesiredTorokuDate: {some: {status: '承認'}}, // 登録希望日が存在し、ステータスが承認
        },
      },

      haisoTooEarly: {
        label: `配送\n変更`,
        notify: stressedNotify,
        description: `登録申請済みで、配送希望が速すぎるものです。CRでの付帯作業までに登録が間に合わないため、CRへ配送日の変更連絡をしてください。`,
        CONDITION: {
          haisou_tooEarly: true, // 配送希望が速すぎる
        },
      },
    }
    const Ex_Notes: exclusiveGroups = {
      m0_remarks: {
        label: `メモあり`,
        CONDITION: {
          OR: [
            {m0_remarks: {not: null}}, // m0メモが存在する
            {m1_remarks: {not: null}}, // m1メモが存在する
            {m2_remarks: {not: null}}, // m2メモが存在する
          ],
        },
      },
    }

    const Ex_FR: exclusiveGroups = {
      furiate: {label: `済`, CONDITION: {DD_FR: {not: null}}}, // 振当日が存在する
      not_furiate: {label: `未`, CONDITION: {DD_FR: null}}, // 振当日が存在しない
    }

    const Ex_Nousya: exclusiveGroups = {
      not_nousya: {
        label: `未`,
        CONDITION: {
          DD_FR: {not: null}, // 振当日が存在する
          DD_NOSYA: null, // 納車日が存在しない
        },
      },
      nousya: {
        label: `済`,
        CONDITION: {
          DD_FR: {not: null}, // 振当日が存在する
          DD_NOSYA: {not: null}, // 納車日が存在する
        },
      },
    }
    const Ex_TOROKU_NONFR: exclusiveGroups = {
      toroku_nonFr: {
        label: `登録済かつ未納車`,
        CONDITION: {
          DD_TOUROKU: {not: null}, // 登録日が存在する
          DD_NOSYA: null, // 納車日が存在しない
        },
      },
    }

    const Ex_Touroku: exclusiveGroups = {
      not_touroku: {
        label: `未`,
        CONDITION: {
          DD_FR: {not: null}, // 振当日が存在する
          DD_TOUROKU: null, // 登録日が存在しない
        },
      },
      touroku: {
        label: `済`,
        CONDITION: {
          DD_FR: {not: null}, // 振当日が存在する
          DD_TOUROKU: {not: null}, // 登録日が存在する
        },
      },
    }

    const Ex_Payment: exclusiveGroups = {
      paymentUndone: {
        label: `未`,
        notify: true,
        description: `登録申請済みのもので、入金条件を満たしていないものが表示されます。`,
        CONDITION: {
          lastApprovedDesiredTorokuDate: {not: null}, // 登録予定日あり
          CUSTOM_paymentCheck: false, // 入金条件を満たしていない
        },
      },
    }
    const Ex_Tsuiko: exclusiveGroups = {
      tenpoTsuiko_pending: {
        label: `未処理`,
        notify: true,
        description: `申請済みで未決定なものです。`,
        CONDITION: {
          TenpoTsuikoShinseiHeader: {
            some: {
              active: true, // アクティブな申請が存在する
              TenpoTsuikoShinseiDetail: {
                some: {
                  status: {notIn: ['approved']},
                },
              }, // 承認状態が保留中か承認済み
            },
          },
        },
      },
      tenpoTsuiko_Finished: {
        label: `承認済`,

        description: `申請済みで承認されたものです。`,
        CONDITION: {
          TenpoTsuikoShinseiHeader: {
            some: {
              active: true, // アクティブな申請が存在する
              TenpoTsuikoShinseiDetail: {
                some: {
                  status: {in: ['approved']},
                },
              }, // 承認状態が保留中か承認済み
            },
          },
        },
      },
    }

    //入庫予定日
    const Ex_SateiNyukoYotei: exclusiveGroups = {
      shitadoriAri: {
        label: `下取有`,
        notify: false,
        CONDITION: {
          JuchuShitadoriDb: {
            some: {
              APPINDEX_FKEY: {not: null},
            },
          },
        },
      },
      sateiNyukoYoteiKeikoku: {
        label: `未処理`,
        notify: true,
        description: `下取入庫予定が接近しているものです。`,
        CONDITION: {
          shitadoriAlertCount: {gte: 1},
        },
      },
    }

    const dataArr: makeEasySearchGroupsProp[] = []
    toRowGroup(
      1,
      dataArr,
      [
        {exclusiveGroup: Ex_exclusive0, name: `全て`},
        {exclusiveGroup: Ex_m2, name: `2ヶ月前`},
        {exclusiveGroup: Ex_m1, name: `1ヶ月前`},
        {exclusiveGroup: Ex_m0, name: `振当時`},

        {exclusiveGroup: Ex_mikomi, name: `見込み`},
        {exclusiveGroup: torokuKibou, name: `登録希望日申請`},
        {exclusiveGroup: Ex_Delivery, name: `配送配送`},
        {exclusiveGroup: Ex_Payment, name: `入金状況`},
        {exclusiveGroup: Ex_Tsuiko, name: `追工申請`},
        // {exclusiveGroup: Ex_SateiNyukoYotei, name: `下取入庫予定`},
      ]
        .filter(Boolean)
        .map(d => ({...d, additionalProps: {refresh: true}}))
    )

    toRowGroup(
      2,
      dataArr,
      [
        {exclusiveGroup: Ex_FR, name: `振当状況`},
        {exclusiveGroup: Ex_Touroku, name: `登録状況`},
        // {exclusiveGroup: Ex_Nousya, name: `納車状況`},
        {exclusiveGroup: Ex_TOROKU_NONFR, name: `登録済かつ未納車`},
        {exclusiveGroup: Ex_Notes, name: `メモ`},
      ].map(d => ({...d, additionalProps: {refresh: true, defaultOpen: false}}))
    )

    const result = makeEasySearchGroups(dataArr) as keys

    return result
  }

  return {newCar}
}

const stressedNotify = {border: `3px solid red`, padding: 3, color: `red`, background: `#ffeeb5`}
