import {checkPoint} from '@app/(apps)/newCar/(constants)/checkpoints/checkpoints'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'

export const m2: checkPoint = {
  alertKey: `m2Status`,
  label: `2ヵ月前`,
  actionName: `事前のお声掛け`,
  description: [
    `付属品・下取り車について変更がないかご確認ください。`,
    `また、以下をお伝え、心づもりをしていただいてください。`,
    `①2か月後の生産予定になったことと、1ヶ月後にあらためて生産状況と併せ書類回収、お支払いについて連絡をする旨をお伝え`,
    `②注文内容（付属品・下取車）と納車時期に変更がないか必ず確認`,
  ].join(`\n`),

  getRemarks: ({newCar}) => {
    const remarks = [newCar.m2_remarks].filter(Boolean)
    return remarks
  },
  getColumns: () => [
    {id: `m2_date`, label: `連絡日（お客様と会話した日）`, type: `date`, form: {...defaultRegister}},
    {
      id: `m2_check1`,
      label: `①2か月後の生産予定になったことと、1ヶ月後にあらためて生産状況と併せ書類回収、お支払いについて連絡をする旨をお伝えした`,
      type: `boolean`,
      form: {
        register: {
          validate: value => (!!value === true ? undefined : `要チェック`),
        },
      },
    },
    {
      id: `m2_check2`,
      label: `②注文内容（付属品・下取車）と納車時期に変更がないか必ず確認した`,
      type: `boolean`,
      form: {
        register: {
          validate: value => (!!value === true ? undefined : `要チェック`),
        },
      },
    },
    {id: `m2_remarks`, label: `備考・メモ`, type: `textarea`, form: {}},
  ],

  conditions: {
    complete: `連絡日（お客様と会話した日）の入力にて消滅`,
    alert: `生産予定日2ヶ月前に点灯。`,
  },
}
