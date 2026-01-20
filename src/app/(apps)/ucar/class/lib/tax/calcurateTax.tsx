import { UCAR_CODE } from '@app/(apps)/ucar/class/UCAR_CODE'
import { ucarData } from '@app/(apps)/ucar/class/UcarCL'

export { }

export type payBackObjType = {
  Total: { month: number; price: number }
  Pref: { month: number; price: number }
  TOYOPET: { month: number; price: number }
}

export const calcurateTax = (props: { row: any }) => {
  console.log("calcurateTax")  //logs

  const row = props.row as ucarData

  const { processedAs, masshoBi, meihenBi, annualTax } = row

  const refYear = row.earlyYear ? row.earlyYear : undefined
  const refMonth = row.earlyMonth ? row.earlyMonth : undefined
  const RowDataObj = {
    processedAs,
    masshoBi,
    annualTax: annualTax,
    refYear,
    refMonth,
  }

  // 入力チェック
  if (processedAs === UCAR_CODE.PROCESSED_AS.raw.MASSESHO.code && !masshoBi) {
    throw new Error('抹消日が入力されていません。')
  }

  if (!refYear || !refMonth || !annualTax) {
    throw new Error('入庫/登録の年月または年間支払い税額が入力されていません。')
  }


  const result: payBackObjType = {
    TOYOPET: { month: 0, price: 0 },
    Pref: { month: 0, price: 0 },
    Total: { month: 0, price: 0 },
  }

  const messageArr: string[] = []

  // 基本計算式
  const monthlyTax = annualTax / 12

  // 経過税額を計算（100円未満切り捨て）
  const calcElapsedTax = (months: number) => {
    return Math.floor((monthlyTax * months) / 100) * 100
  }

  // 還付額を計算
  const calcRefund = (months: number) => {
    return annualTax - calcElapsedTax(months)
  }

  // 4月からX月までの月数を計算（含む形式）
  // X月が4-12月なら X - 3、X月が1-3月なら X + 9
  const calcMonthsFromApril = (year: number, month: number) => {
    if (month >= 4) {
      return month - 3 // 例: 5月 → 2ヶ月（4月、5月）
    } else {
      return month + 9 // 例: 1月 → 10ヶ月（前年4月から当年1月まで）
    }
  }

  // X月から翌3月までの月数を計算
  // X月が4-12月なら 12 - X + 3、X月が1-3月なら 3 - X
  const calcMonthsUntilMarch = (month: number) => {
    if (month >= 4) {
      return 12 - month + 3 // 例: 6月 → 9ヶ月（7,8,9,10,11,12,1,2,3）
    } else {
      return 3 - month // 例: 1月 → 2ヶ月（2,3月）
    }
  }

  // パターン判定と計算
  if (RowDataObj.processedAs === UCAR_CODE.PROCESSED_AS.raw.MEIGIHENKO.code) {
    // 【パターンC】 名義変更
    // 県からの還付なし、当社が全額支払う
    const elapsedMonths = calcMonthsFromApril(refYear, refMonth)
    const refundAmount = calcRefund(elapsedMonths)
    const monthsUntilMarch = calcMonthsUntilMarch(refMonth)

    result.Pref = { month: 0, price: 0 }
    result.TOYOPET = {
      month: monthsUntilMarch,
      price: refundAmount,
    }

    messageArr.push('名義変更のため、全額トヨペットが負担')
  } else if (RowDataObj.processedAs === UCAR_CODE.PROCESSED_AS.raw.MASSESHO.code) {
    // 抹消の場合
    if (!masshoBi) {
      throw new Error('抹消日が入力されていません。')
    }

    const masshoDate = new Date(masshoBi)
    const masshoYear = masshoDate.getFullYear()
    const masshoMonth = masshoDate.getMonth() + 1 // 1-12の形式に変換


    // 入庫月と抹消月の差分を計算（同じ年・月かどうか）
    const refDateMonth = refYear * 12 + refMonth
    const masshoDateMonth = masshoYear * 12 + masshoMonth
    const monthDiff = masshoDateMonth - refDateMonth
    console.log({ masshoYear, masshoMonth, refDateMonth, monthDiff })

    if (monthDiff < 0) {
      throw new Error('抹消月 が 入庫/登録月より前に設定されています。正しく入力してください。')
    }

    if (monthDiff === 0) {
      // 【パターンA】 抹消・通常（入庫月 = 抹消月）
      // 県が全額還付、当社支払いなし
      const elapsedMonths = calcMonthsFromApril(masshoYear, masshoMonth)
      const refundAmount = calcRefund(elapsedMonths)
      const monthsUntilMarch = calcMonthsUntilMarch(masshoMonth)

      result.Pref = {
        month: monthsUntilMarch,
        price: refundAmount,
      }
      result.TOYOPET = { month: 0, price: 0 }

      messageArr.push('抹消月 と 入庫/登録月が一致 ➡︎ 全額県税から返金')
    } else {
      // 【パターンB】 抹消・遅延（入庫月 < 抹消月）
      // 県からは一部、差額を当社が支払う
      const idealElapsedMonths = calcMonthsFromApril(refYear, refMonth) // 本来の経過月数

      const actualElapsedMonths = calcMonthsFromApril(masshoYear, masshoMonth) // 実際の経過月数

      const idealRefund = calcRefund(idealElapsedMonths) // 本来の還付額
      const actualRefund = calcRefund(actualElapsedMonths) // 実際の県還付額

      console.log({ idealRefund, actualRefund })  //logs
      const companyPayment = idealRefund - actualRefund // 当社支払額
      const monthsUntilMarch = calcMonthsUntilMarch(masshoMonth)

      result.Pref = {
        month: monthsUntilMarch,
        price: actualRefund,
      }
      result.TOYOPET = {
        month: monthDiff, // 抹消月 - 入庫月
        price: companyPayment,
      }

      messageArr.push(`TOYOPET: ${monthDiff}ヶ月分 ➡︎ ${companyPayment}円`)
      messageArr.push(`県税: ${monthsUntilMarch}ヶ月分 ➡︎ ${actualRefund}円`)
      messageArr.push(`抹消月 と 入庫/登録月が異なるため、一部トヨペットが返金`)
    }
  }

  // Totalを計算
  result.Total = {
    month: result.Pref.month + result.TOYOPET.month,
    price: result.Pref.price + result.TOYOPET.price,
  }

  return { result, message: messageArr.join(`\n`) }
}
