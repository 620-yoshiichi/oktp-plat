import {appString, oktpRoleString} from '@app/oktpCommon/constants'

/**
 * 強制ユーザー設定の型定義
 * Kaonaviにデータがないユーザーでも、この設定からUPSERTできるようにする
 */
export type ForcedUser = {
  code: number
  name?: string // Kaonaviにデータがない場合に必要
  email?: string // Kaonaviにデータがない場合に必要
  storeCode?: number
  apps: appString[]
  userRoles: oktpRoleString[]
}

/**
 * 強制ユーザー設定のリスト
 * Kaonaviのデータに存在しないユーザーでも、ここに追加することでUPSERTできる
 */
export const forcedUsers: ForcedUser[] = [
  {
    code: 827916,
    storeCode: 98,
    apps: [`newCar`],
    userRoles: ['本部管理者'],
  }, //西本さん

  {
    code: 815059,
    storeCode: 97,
    apps: [`newCar`],
    userRoles: ['店長'],
  }, //上野さん
  {
    code: 818767,
    storeCode: 97,
    apps: [`newCar`],
    userRoles: ['営業'],
  }, //横野さん
  {
    code: 820362,
    storeCode: 97,
    apps: [`newCar`],
    userRoles: ['営業'],
  }, //水畑さん
  {
    code: 818473,
    storeCode: 98,
    apps: [`newCar`],
    userRoles: ['新車登録担当'],
  }, //中川さん
  {
    code: 814443,
    storeCode: 98,
    apps: [`newCar`],
    userRoles: ['店長'],
  }, //板谷さん
  {
    code: 809997,
    storeCode: 30,
    apps: [`newCar`],
    userRoles: ['CR(新点)'],
  }, //延谷さん
  {
    code: 811967,
    storeCode: 30,
    apps: [`newCar`],
    userRoles: ['CR(新点)'],
  }, //藤森さん
  {
    code: 813803,
    storeCode: 30,
    apps: [`newCar`],
    userRoles: ['CR(新点)'],
  }, //神馬
  {
    code: 812823,
    storeCode: 30,
    apps: [`newCar`],
    userRoles: ['CR(新点)'],
  }, //渡辺 広三さん
  {
    code: 99999930,
    name: 'CRエンジニア',
    email: 'cr_service@okayama-toyopet.jp',
    storeCode: 30,
    apps: [`newCar`],
    userRoles: ['CR(新点)'],
  }, //CRエンジニア

  {
    code: 810201,
    storeCode: 30,
    apps: [`QRBP`],
    userRoles: ['CRアドバイザ'],
  }, //市川 朋由さん
  {
    code: 816039,
    storeCode: 30,
    apps: [`QRBP`],
    userRoles: ['CRアドバイザ'],
  }, //江田 憲彦さん
  {
    code: 815270,
    storeCode: 30,
    apps: [`QRBP`],
    userRoles: ['CRアドバイザ'],
  }, //鷹取 学さん
  {
    code: 819003,
    storeCode: 30,
    apps: [`QRBP`],
    userRoles: ['CRアドバイザ'],
  }, //伊東 聡士さん
  {
    code: 816543,
    storeCode: 30,
    apps: [`QRBP`],
    userRoles: ['CRアドバイザ'],
  }, //高渕 敏樹さん
  {
    code: 822080,
    storeCode: 30,
    apps: [`QRBP`],
    userRoles: ['CRアドバイザ'],
  }, //小川 圭介さん
  {
    code: 808397,
    storeCode: 30,
    apps: [`QRBP`],
    userRoles: ['CRアドバイザ'],
  }, //黒田 訓好さん
  {
    code: 811975,
    storeCode: 30,
    apps: [`QRBP`],
    userRoles: ['CRアドバイザ', 'BP課長'],
  }, //谷本 充広さん

  {
    code: 811975,
    storeCode: 30,
    apps: [`QRBP`],
    userRoles: ['CRアドバイザ', 'BP課長'],
  }, //谷本 充広さん
  {
    code: 823957,
    storeCode: 94,
    apps: [`QRBP`],
    userRoles: ['拠点アドバイザ'],
  }, //谷本 充広さん

  {
    code: 815113,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //久山さん
  {
    code: 813030,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //森山さん
  {
    code: 813676,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //渡辺恵美さん
  {
    code: 826051,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //下江さん
  {
    code: 815997,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //馬場さん
  {
    code: 825241,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //加藤さん
  {
    code: 811461,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //島田さん
  {
    code: 827634,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //多賀さん
  {
    code: 817400,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //柳瀬さん
  {
    code: 99999931,
    name: '中古車仕入れグループ',
    email: 'shiire@okayama-toyopet.jp',
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //仕入れグループさん
]
