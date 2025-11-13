type uPassColGroup =
  | 'ID'
  | 'PLATE' //プレート
  | 'CAR_INFO' //年式・車台番号・車両情報
  | 'GRADE' //型式・グレードなど
  | 'SIZE' //定員、重量、サイズなど
  | 'CUSTOMER' //所有者・使用者・aiお客様データ
  | 'DOCUMENT' //付属品
  | 'JIBAN' //自賠責等
  | 'RECYCLING' //リサイクル、シュレッダー、フロンなど
  | 'BODY_INFO' //車体情報
  | 'REPAIR' //修復歴等
  | 'EQUIPMENT' //装備品
  | 'ADVANCED_EQUIPMENT' //先進装備
  | 'ADDITIONAL_EQUIPMENT' //追加装備
  | 'ASSESSMENT_IMPLEMETATION' //査定実施情報
  | 'ASSESSMENT_RESULT' //査定結果

type aiSateIColGroup = ''

type upassColumn = {
  jp: string
  en: string
  type?: 'date'
  sampleData: string | null
  category?: uPassColGroup | aiSateIColGroup
  showIn?: {
    qrCreate?: {label: string}
    ucarMainTable?: {label: string}
  }
}
