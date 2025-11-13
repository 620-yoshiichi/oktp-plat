import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'

import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMaxDate} from '@cm/class/Days/date-utils/calculations'
import {checkPoint} from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

export const m1: checkPoint = {
  alertKey: `m1Status`,
  label: `1ヶ月前`,
  actionName: `書類（登録/下取り）＆車両代回収日確定`,
  description: `書類（登録/下取）回収と車両代お支払い日を決めてください`,
  getRemarks: ({newCar}) => {
    const remarks = [
      newCar.m1_deadline_paper ? `書類:${formatDate(newCar.m1_deadline_paper)}` : undefined,
      newCar.m1_deadline_money ? `車両代:${formatDate(newCar.m1_deadline_money)}` : undefined,
      newCar.m1_toroku_prediction ? `登録見込:${formatDate(newCar.m1_toroku_prediction)}` : undefined,
      newCar.m1_remarks,
    ].filter(Boolean)
    return remarks
  },
  getColumns: ({newCar}) => [
    {
      ...{id: `m1_deadline_paper`, label: `書類回収日`, type: `date`},
      form: {
        descriptionNoteAfter: (value, row) => {
          const deadline = new NewCarClass(newCar).getFuriateOrSEISANYOTEI()
          return (
            <div>
              <R_Stack>
                <span>締切日(生産予定or振当日):</span>
                <span className={` font-bold text-orange-500`}>{deadline && formatDate(deadline)}</span>
              </R_Stack>
            </div>
          )
        },
        ...defaultRegister,
      },
    },
    {
      ...{id: `m1_deadline_money`, label: `支払日`, type: `date`},
      form: {...defaultRegister},
    },

    {
      id: `m1_remarks`,
      label: `備考・メモ`,
      type: `textarea`,
      form: {
        register: {
          validate: (value, formValues) => {
            const deadLine = new NewCarClass(newCar).getFuriateOrSEISANYOTEI() as Date

            const {m1_deadline_paper} = formValues

            const biggestDate = getMaxDate(
              [`m1_deadline_paper`]
                .map(key => formValues[key])
                .filter(d => d)
                .map(d => new Date(d))
            )

            const withinDeadLine = m1_deadline_paper && deadLine && biggestDate && biggestDate <= new Date(deadLine)
            return withinDeadLine || !!value ? undefined : `締切日までに回収できない場合は、理由を入力してください。`
          },
        },
      },
    },
  ],

  conditions: {
    alert: '生産予定日1ヶ月前に点灯。',
    complete: `書類回収日/支払日の申告にて消滅。申告期限にて、書類回収ができていない場合、「遅れ」アラートが点灯します。`,
  },
}
