import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {newCarChainMethod} from '@app/(apps)/newCar/class/NewCarClass/newCarChain/newCarChainMethod'

import {requestResultType} from '@cm/types/types'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'

import {Prisma} from '@prisma/client'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export const torokuDatefinalizeUpdate = async ({res, queryObject}) => {
  const LIB = getMethods()
  const {success, message, result: updatedData} = res

  //エラー
  if (success === false) {
    return {
      success: false,
      message: [`管理者に連絡してください。`, `failed In "finalizeUpdate" `, message].join(`\n`),
      result: null,
    }
  }

  // ①既存の承認された登録希望日をキャンセル
  await LIB.setAllPreviousHistoryToNull({updatedData})

  const {result: newCar} = await doStandardPrisma(`newCar`, `findUnique`, {
    where: {id: updatedData.newCarId},
    include: {
      FuriateStatusOnApprovement: {},
      User: {},
      Store: {},
      DesiredTorokuDate: {},
    },
  })

  //②新車データを更新
  const latestNewCarData = await (await newCarChainMethod({newCar})).rows[0]

  const earliestHaisouDate = latestNewCarData?.earliestHaisouDate

  // /③メール送信
  const theStatus = NEW_CAR_CONST.TOROKU_STATUS_LIST.find(d => d.value === updatedData?.status)

  // 新規登録の場合は、承認メールを送信

  const createNew = !queryObject?.where?.id

  //ステータス変更があり、キャンセルではない場合
  const approvedStatusUpdated = [createNew === false, theStatus?.sendMail].every(d => d)

  //初回承認時の振当日を記録する。
  const {message: FuriateStatusOnApprovementMessage, createdFuriateStatusOnApprovement} =
    await doRecordFuriateStatusOnApprovement({
      newCar,
      approvedStatusUpdated,
      theStatus,
    })

  const args: Prisma.UserFindManyArgs = {
    where: {
      storeId: newCar?.storeId,
      UserRole: {
        some: {
          RoleMaster: {
            OR: [{name: `店長`}, {name: `副店長`}],
          },
        },
      },
    },
  }

  const {result: storeManagerList} = await doStandardPrisma(`user`, `findMany`, args)
  const mailToSales = [newCar?.User?.email, ...storeManagerList.map(d => d.email)].filter(d => d)

  //メール送付
  const emailMessage = createNew
    ? await LIB.sendToHq({newCar, updatedData, mailToSales})
    : approvedStatusUpdated
      ? await LIB.sendToStuff({newCar, updatedData, earliestHaisouDate, mailToSales})
      : 'メール送信はスキップされました'

  const result: requestResultType = {
    success: true,
    message:
      [
        //
        FuriateStatusOnApprovementMessage && '■ ' + FuriateStatusOnApprovementMessage,
        emailMessage && '■ ' + emailMessage,
      ]
        .filter(Boolean)
        .join(`\n\n`) ?? '',
    result: {createNew, approvedStatusUpdated},
  }

  return result
}

const getMethods = () => {
  const sendToHq = async ({newCar, updatedData, mailToSales}) => {
    const {result: torokuTantoList} = await doStandardPrisma(`user`, `findMany`, {
      where: {UserRole: {some: {RoleMaster: {name: `新車登録担当`}}}},
    })
    const mailToOrderSection = torokuTantoList.map(d => d.email)
    // const link = HREF(`${basePath}/newCar/desiredTorokuDate/${id}`, {}, {})
    // const aTag = `<a href="${link}">承認リンク</a>`
    const subject = `登録希望日申請がありました`
    const text = [
      [`店舗`, newCar?.Store?.name].join(`: `),
      [`スタッフ`, newCar?.User?.name].join(`: `),
      [`注文番号`, newCar?.NO_CYUMON].join(`: `),
      [`買主名`, newCar?.KJ_KAINMEI1].join(`: `),
      [`名義人`, newCar?.KJ_MEIGIME1].join(`: `),
      [`登録希望日`, formatDate(updatedData?.date)].join(`: `),
      [`備考`, updatedData?.remarks].join(`: `),
      // `下記リンクより、承認を実施してください。`,
      // aTag,
    ].join(`\n`)

    const mailRes = await knockEmailApi({
      subject,
      text,
      to: [...mailToOrderSection, ...mailToSales],
    })
    console.debug({mailRes})

    return `登録希望日申請: ${mailToOrderSection.join(`, `)} にメールを送信しました`
  }

  const sendToStuff = async ({newCar, updatedData, earliestHaisouDate, mailToSales}) => {
    const subject = `登録日申請の結果通知【${updatedData.status}】`
    const text = [
      [`店舗`, newCar?.Store.name].join(`: `),
      [`スタッフ`, newCar?.User.name].join(`: `),
      [`注文番号`, newCar?.NO_CYUMON].join(`: `),
      [`買主名`, newCar?.KJ_KAINMEI1].join(`: `),
      [`名義人`, newCar?.KJ_MEIGIME1].join(`: `),
      [`登録希望日`, formatDate(updatedData?.date)].join(`: `),
      [`配送可能日`, formatDate(earliestHaisouDate) + '以降'].join(`: `),
      ``,

      [`結果`, `【${updatedData.status}】`].join(`: `),
      [`備考`, updatedData?.remarks].join(`: `),
    ].join(`\n`)

    const mailRes = await knockEmailApi({subject, text, to: mailToSales})
    return `${mailToSales.join(`, `)} にメールを送信しました`
  }

  const setAllPreviousHistoryToNull = async ({updatedData}) => {
    const args: Prisma.DesiredTorokuDateUpdateManyArgs = {
      where: {status: null, newCarId: updatedData.newCarId, createdAt: {lt: updatedData.createdAt}},
      data: {status: `キャンセル`},
    }

    const {result: canceledHistory} = await doStandardPrisma(`desiredTorokuDate`, `updateMany`, args)

    if (canceledHistory.count > 0) {
      console.debug(`${canceledHistory.count}件の申請履歴をキャンセルしました。`)
    }
  }

  return {
    sendToHq,
    sendToStuff,
    setAllPreviousHistoryToNull,
  }
}

const doRecordFuriateStatusOnApprovement = async ({newCar, approvedStatusUpdated, theStatus}) => {
  let message, createdFuriateStatusOnApprovement

  if (approvedStatusUpdated && theStatus?.value === `承認` && !newCar.FuriateStatusOnApprovement) {
    createdFuriateStatusOnApprovement = await doStandardPrisma(`furiateStatusOnApprovement`, `create`, {
      data: {newCarId: newCar.id, DD_FR: newCar.DD_FR},
    })
    message = `初回承認時の振当日を記録しました。`
  }

  return {message, createdFuriateStatusOnApprovement}
}
