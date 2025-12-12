import {ucarData} from '@app/(apps)/ucar/class/UcarCL'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {requestResultType} from '@cm/types/types'
import {differenceInMonths} from 'date-fns'

export {}

export const validateData = ({processedAs, masshoBi, annualTax, refYear, refMonth}) => {
  const errors: any[] = []
  if (processedAs === '抹消' && !masshoBi) {
    errors.push('抹消日が入力されていません。')
  }

  if (!refYear || !refMonth || !annualTax) {
    errors.push('入庫/登録の年月または年間支払い税額が入力されていません。')
  }

  return errors
}

export type payBackObjType = {
  Total: {month: number; price: number}
  Pref: {month: number; price: number}
  TOYOPET: {month: number; price: number}
}

export const calculatePayback = ({annualTax, meihen, refDate, refMonth}) => {
  meihen = meihen ? new Date(meihen) : refDate

  const DeregistrationMonth = meihen.getMonth() + 1

  const aprilOnTheYear = DeregistrationMonth <= 2 ? new Date(meihen.getFullYear() - 1, 3) : new Date(meihen.getFullYear(), 3)

  const monthlyTax = annualTax / 12

  const monthTillDeregistration = differenceInMonths(meihen, aprilOnTheYear) + 1

  const restMonthCountForPayback = 12 - monthTillDeregistration
  const customerPayingMonth = diffMonth(refDate, aprilOnTheYear, `customerPayingMonth`) + 1

  const customerPayingAmount = monthlyTax * customerPayingMonth
  const totalPaybackAmount = annualTax - Math.floor(customerPayingAmount / 100) * 100

  const paybackObj: payBackObjType = {
    Total: {month: refMonth === 3 ? 0 : 12 - monthTillDeregistration, price: totalPaybackAmount},
    Pref: {month: 0, price: 0},
    TOYOPET: {month: 0, price: 0},
  }

  const payedAmount = Math.floor((monthlyTax * monthTillDeregistration) / 100) * 100

  paybackObj.Pref.price = annualTax - payedAmount
  paybackObj.TOYOPET.price = totalPaybackAmount - paybackObj.Pref.price

  return {monthlyTax, payedAmount, restMonthCountForPayback, monthTillDeregistration, paybackObj, meihen}
}

export const calcurateTax = (props: {row: any}) => {
  const row = props.row as ucarData

  let res: requestResultType = {
    success: false,
    result: undefined,
    message: ``,
  }

  const {processedAs, masshoBi, annualTax} = row

  const refYear = row.earlyYear ? row.earlyYear : undefined
  const refMonth = row.earlyMonth ? row.earlyMonth : undefined
  const RowDataObj = {
    processedAs,
    masshoBi,
    annualTax: annualTax,
    refYear,
    refMonth,
  }

  const errors = validateData(RowDataObj)
  if (errors.length > 0) {
    res = {
      success: false,
      result: undefined,
      message: errors.join(''),
    }
    return res
  }

  if (refYear && refMonth) {
    const refDate = new Date(refYear, refMonth - 1, 1)

    const result: payBackObjType = {
      TOYOPET: {
        month: 0,
        price: 0,
      },
      Pref: {
        month: 0,
        price: 0,
      },
      Total: {
        month: 0,
        price: 0,
      },
    }

    const {restMonthCountForPayback, paybackObj, meihen} = calculatePayback({
      annualTax: RowDataObj.annualTax,
      meihen: RowDataObj.masshoBi,
      refDate,
      refMonth: RowDataObj.refMonth,
    })

    const messageArr: string[] = []

    // トーストメッセージの表示
    if (RowDataObj.processedAs === '名義変更') {
      messageArr.push('名義変更のため、全額トヨペットが負担')
      result.TOYOPET = {
        month: restMonthCountForPayback,
        price: paybackObj.Total.price,
      }
    } else if (RowDataObj.processedAs === '抹消') {
      const monthDiff = diffMonth(meihen, refDate, `monthDiff`) //抹消月と入庫/登録年月の差分月数

      /** 抹消月 = 入庫月  ➡︎ 県税から帰る */
      if (monthDiff === 0) {
        messageArr.push('抹消月 と 入庫/登録月が一致  ➡︎ 全額県税から返金')

        result.Pref = {
          month: restMonthCountForPayback,
          price: paybackObj.Total.price,
        }
      } else if (monthDiff < 0) {
        res = {
          success: false,
          result: undefined,
          message: '抹消月 が 入庫/登録月より前に設定されています。正しく入力してください。',
        }
        return res
      } else if (monthDiff > 0) {
        /** 抹消月 !== 入庫月  ➡︎ (抹消 - 入庫) ヶ月分がトヨペット返金残りは県税 */

        const pref = {
          paybackAmount: paybackObj.Pref.price,
          monthCount: restMonthCountForPayback - monthDiff + 1,
        }

        const TOYOPET = {
          paybackAmount: paybackObj.TOYOPET.price,
          monthCount: restMonthCountForPayback - pref.monthCount + 1,
        }

        const rest = paybackObj.Total.price - (pref.paybackAmount + TOYOPET.paybackAmount)

        messageArr.push(`TOYOPET: ${TOYOPET.monthCount}ヶ月分 ➡︎ ${TOYOPET.paybackAmount}円`)
        messageArr.push(`県税: ${pref.monthCount}ヶ月分 ➡︎ ${pref.paybackAmount}円`)

        if (rest > 0) {
          messageArr.push(`差額${rest}はTOYOPETに加算`)

          TOYOPET.paybackAmount += rest
        }

        result.TOYOPET = {
          month: TOYOPET.monthCount,
          price: TOYOPET.paybackAmount,
        }
        result.Pref = {
          month: pref.monthCount,
          price: pref.paybackAmount,
        }

        messageArr.push(`抹消月 と 入庫/登録月が異なるため、一部トヨペットが返金`)
      }
    }

    // 特殊ケースのトーストメッセージ
    if (RowDataObj.refMonth === 3) {
      messageArr.push('登録が3月のため、月と金額を0に設定します。')
    }

    // const paybackObj = result.paybackObj as payBackObjType

    res = {
      success: true,
      result,
      message: messageArr.join(`\n`),
    }

    return res
  }
  return res
}

const diffMonth = (d1, d2, key) => {
  const d1Month = formatDate(d1, 'YYYYMM')
  const d2Month = formatDate(d2, 'YYYYMM')

  const result = Number(d1Month) - Number(d2Month)

  return result
}
