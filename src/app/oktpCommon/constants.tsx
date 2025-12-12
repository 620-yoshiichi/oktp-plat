export type appString = 'ucar' | `newCar` | `QRBP`
export type oktpRoleString =
  //newCar
  | '店長'
  | `副店長`
  | `サービス副店長`
  | `営業`
  | `需給担当者`
  | `本部管理者`
  | `新車登録担当`
  | `CR(新点)`

  //QRBP
  | '拠点アドバイザ'
  | 'CRアドバイザ'
  | 'CRエンジニア'
  | 'BP課長'

type workTypeConfig = {
  [role: string]: {
    apps: {
      [app in appString]?: {roles: oktpRoleString[]}
    }
  }
}

export const oktpRoles: {
  [app: string]: oktpRoleString[]
} = {
  ucar: [],
  QRBP: ['拠点アドバイザ', `サービス副店長`, `営業`, `CRアドバイザ`, 'CRエンジニア', 'BP課長'],
  newCar: ['店長', `副店長`, `営業`, `需給担当者`, `本部管理者`, `新車登録担当`, `CR(新点)`],
}

export const workTypeConfigs: workTypeConfig = {
  室長: {apps: {newCar: {roles: [`本部管理者`]}}},
  専務: {apps: {newCar: {roles: [`本部管理者`]}}},
  部長: {apps: {newCar: {roles: [`本部管理者`]}}},
  'GM(グループマネージャー)': {apps: {newCar: {roles: [`本部管理者`]}}},
  'GM(ゼネラルマネージャー)': {apps: {newCar: {roles: [`店長`]}}},
  店長: {apps: {newCar: {roles: [`店長`]}}},
  販売副店長: {apps: {newCar: {roles: [`副店長`]}}},
  'チーフ(含・SCリーダー)': {apps: {newCar: {roles: [`営業`]}}},
  業販スタッフ: {apps: {newCar: {roles: [`営業`]}}},
  新車スタッフ: {apps: {newCar: {roles: [`営業`]}}},
  'U-Carスタッフ': {apps: {newCar: {roles: [`営業`]}}},
  セールスコンサルタント: {apps: {newCar: {roles: [`営業`]}}},
  クルー: {apps: {newCar: {roles: [`営業`]}}},
  法人営業スタッフ: {apps: {newCar: {roles: [`営業`]}}},
  営業スタッフ: {apps: {newCar: {roles: [`営業`]}}},

  // QRBP
  サービス副店長: {apps: {QRBP: {roles: ['拠点アドバイザ', 'サービス副店長']}}},
  ワークショップリーダー: {apps: {QRBP: {roles: [`拠点アドバイザ`, `サービス副店長`]}}},
  サービスアドバイザー: {apps: {QRBP: {roles: [`拠点アドバイザ`]}}},
  マネージャー: {apps: {QRBP: {roles: [`拠点アドバイザ`, '副店長']}}},
  // 課長: {apps: {QRBP: {roles: ['CRアドバイザ', `BP課長`]}}},

  // 社長: {apps: {}},
  // その他: {apps: {}},
  // MSGエンジニア: {apps: {}},
  // エンジニアリーダー: {apps: {}},
  // レセプションスタッフ: {apps: {}},
  // 常務: {apps: {}},
  // CSスタッフ: {apps: {}},
  // アシスタント: {apps: {}},
  // 専任課長: {apps: {}},
  // 専任室長: {apps: {}},
  // センター長: {apps: {}},
  // 会長: {apps: {}},
  // 本部一般職: {apps: {}},
  // サービスエンジニア: {apps: {}},
  // サポートスタッフ: {apps: {}},

  // '洗車・回送係': {apps: {}},
  // CSマネージャー: {apps: {}},
}
export const allOktpRoles: oktpRoleString[] = Object.keys(oktpRoles).flatMap(app => oktpRoles[app])

export const forcedUsers: {
  code: number
  storeCode: number
  apps: appString[]
  userRoles: oktpRoleString[]
}[] = [
  // {code: 817442, storeCode: 20, apps: [`newCar`], userRoles: ['副店長']}, //レクサス岸本さん
  // {code: 813285, storeCode: 20, apps: [`newCar`], userRoles: ['副店長']}, //レクサス藤村さん
  {code: 827916, storeCode: 98, apps: [`newCar`], userRoles: ['本部管理者']}, //西本さん

  {code: 815059, storeCode: 97, apps: [`newCar`], userRoles: ['店長']}, //上野さん
  {code: 818767, storeCode: 97, apps: [`newCar`], userRoles: ['営業']}, //横野さん
  {code: 820362, storeCode: 97, apps: [`newCar`], userRoles: ['営業']}, //水畑さん
  {code: 818473, storeCode: 98, apps: [`newCar`], userRoles: ['新車登録担当']}, //中川さん
  {code: 814443, storeCode: 98, apps: [`newCar`], userRoles: ['店長']}, //板谷さん
  {code: 809997, storeCode: 30, apps: [`newCar`], userRoles: ['CR(新点)']}, //延谷さん
  {code: 811967, storeCode: 30, apps: [`newCar`], userRoles: ['CR(新点)']}, //藤森さん
  {code: 813803, storeCode: 30, apps: [`newCar`], userRoles: ['CR(新点)']}, //神馬
  {code: 812823, storeCode: 30, apps: [`newCar`], userRoles: ['CR(新点)']}, //渡辺 広三さん
  {code: 99999930, storeCode: 30, apps: [`newCar`], userRoles: ['CR(新点)']}, //CRエンジニア

  {code: 810201, storeCode: 30, apps: [`QRBP`], userRoles: ['CRアドバイザ']}, //市川 朋由さん
  {code: 816039, storeCode: 30, apps: [`QRBP`], userRoles: ['CRアドバイザ']}, //江田 憲彦さん
  {code: 815270, storeCode: 30, apps: [`QRBP`], userRoles: ['CRアドバイザ']}, //鷹取 学さん
  {code: 819003, storeCode: 30, apps: [`QRBP`], userRoles: ['CRアドバイザ']}, //伊東 聡士さん
  {code: 816543, storeCode: 30, apps: [`QRBP`], userRoles: ['CRアドバイザ']}, //高渕 敏樹さん
  {code: 822080, storeCode: 30, apps: [`QRBP`], userRoles: ['CRアドバイザ']}, //小川 圭介さん
  {code: 808397, storeCode: 30, apps: [`QRBP`], userRoles: ['CRアドバイザ']}, //黒田 訓好さん
  {code: 811975, storeCode: 30, apps: [`QRBP`], userRoles: ['CRアドバイザ', 'BP課長']}, //谷本 充広さん

  {code: 811975, storeCode: 30, apps: [`QRBP`], userRoles: ['CRアドバイザ', 'BP課長']}, //谷本 充広さん
  {code: 823957, storeCode: 94, apps: [`QRBP`], userRoles: ['拠点アドバイザ']}, //谷本 充広さん

  // {code: 813161, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //高国 健二さん
  // {code: 814699, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //高槻 誠司さん
  // {code: 814761, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //利広 住夫さん
  // {code: 816675, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //安原 寛二さん
  // {code: 818236, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //上山 和志さん
  // {code: 819348, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //竹内 健二さん
  // {code: 820303, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //藤原 廣次さん
  // {code: 817027, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //槌田 圭吾さん
  // {code: 822331, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //船橋 正紀さん
  // {code: 822683, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //福原 理枝さん
  // {code: 824996, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //大野 理さん
  // {code: 824813, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //戸川 貴照さん
  // {code: 825429, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //ｸﾞｪﾝｳﾞｧﾝﾅﾑさん
  // {code: 821041, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //三木 健司さん
  // {code: 820591, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //藤原 友宏さん
  // {code: 825739, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //下山 倫生さん
  // {code: 826018, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //岩井 建二さん
  // {code: 826522, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //吉田 久樹さん
  // {code: 826026, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //中島 瞭さん
  // {code: 826123, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //坂本 泰一さん
  // {code: 823043, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //大村 凌也さん
  // {code: 827171, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //小郷 克剛さん
  // {code: 824872, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //山脇 雄さん
  // {code: 826514, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //岡﨑 結香さん
  // {code: 818554, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //竹端 貴弘さん
  // {code: 827938, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //武久 文哉さん
  // {code: 827939, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //家野 永遠さん
  // {code: 826972, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //藤田 冬生さん
  // {code: 827022, storeCode: 30, apps: ['QRBP'], userRoles: [`CRエンジニア`]}, //杉本 将麻さん
]

export const KB_SEIBETU_LABEL = {1: '男', 2: '女', 3: '法人'}
export const GYOCHOKU = {
  1: `直販`,
  2: `業販`,
  3: `旧レンタ`,
  4: `新レンタ`,
  5: `他レンタ`,
  6: `他社リース`,
  7: `KINTO`,
  9: `その他`,
}

export const OKTP_CONSTANTS = {
  where: {
    storeManagerWhere: {
      UserRole: {
        some: {
          RoleMaster: {
            OR: [{name: `店長`}, {name: `副店長`}],
          },
        },
      },
    },
  },
}
