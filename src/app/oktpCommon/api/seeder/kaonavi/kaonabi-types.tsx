export type kaonaviCustomFieldStr =
  | '職務'
  | '雇用形態'
  | '資格等級'
  | '組合'
  | '入社形態'
  | '短時間'
  | '所属滞留年数'
  | '資格滞留年数'

export type workTypeStr =
  | '会長'
  | '本部一般職'
  | 'サポートスタッフ'
  | '室長'
  | 'サービスアドバイザー'
  | '課長'
  | '洗車・回送係'
  | '部長'
  | 'CSマネージャー'
  | 'センター長'
  | '業販スタッフ'
  | 'サービスエンジニア'
  | 'GM(ゼネラルマネージャー)'
  | '新車スタッフ'
  | 'サービス副店長'
  | 'U-Carスタッフ'
  | '店長'
  | 'GM(グループマネージャー)'
  | 'クルー'
  | 'マネージャー'
  | 'チーフ(含・SCリーダー)'
  | 'セールスコンサルタント'
  | '販売副店長'
  | 'その他'
  | '法人営業スタッフ'
  | 'ワークショップリーダー'
  | 'MSGエンジニア'
  | '社長'
  | 'エンジニアリーダー'
  | 'レセプションスタッフ'
  | '常務'
  | 'CSスタッフ'
  | '営業スタッフ'
  | 'アシスタント'
  | '専任課長'
  | '専任室長'
  | '専務'

export type KaonaviUserType = {
  id: number
  code: string
  name: string
  name_kana: string
  mail: string
  entered_date: string
  retired_date: string
  gender: string
  birthday: string
  age: number
  years_of_service: string
  department: any
  sub_departments: unknown[]
  custom_fields: {
    id: number
    name: kaonaviCustomFieldStr
    values: any[]
  }[]
}
