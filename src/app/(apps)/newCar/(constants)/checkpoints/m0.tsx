import {checkPoint} from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export const furiate: checkPoint = {
  alertKey: `m0Status`,
  label: `振当て`,
  actionName: `登録日/納車日の確定`,
  description: `お客様と登録日と納車日を決めていただき、配送希望日をご入力ください`,
  getRemarks: ({newCar}) => {
    const remarks = [
      newCar.m0_deadline_nousya ? `納車:${formatDate(newCar.m0_deadline_nousya)}` : undefined,
      newCar.m0_remarks,
    ].filter(Boolean)

    return remarks
  },
  getColumns: ({newCar}) => {
    return [
      {id: `m0_deadline_nousya`, label: `納車日予定日`, type: `date`, form: {}},

      {
        id: `m0_remarks`,
        label: `備考・メモ`,
        type: `textarea`,
        form: {
          register: {
            validate: (value, formValues) => {
              const result =
                // formValues[`m0_deadline_toroku`]&&
                formValues[`m0_deadline_nousya`] || value ? undefined : `日程が定まらない場合は、理由を入力してください`

              return result
            },
          },
        },
      },
    ]
  },

  conditions: {
    alert: `振当時に点灯。`,
    complete: `登録日/納車日の申告にて消滅。申告期限にて、登録ができていない場合、「遅れ」アラートが再点灯。`,
  },
}
