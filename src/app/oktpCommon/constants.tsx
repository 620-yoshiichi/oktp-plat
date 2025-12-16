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

  // Ucar
  | '中古車G'

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
  ucar: ['店長', `副店長`, `営業`, '中古車G', '本部管理者'],
  QRBP: ['拠点アドバイザ', `サービス副店長`, `営業`, `CRアドバイザ`, 'CRエンジニア', 'BP課長'],
  newCar: ['店長', `副店長`, `営業`, `需給担当者`, `本部管理者`, `新車登録担当`, `CR(新点)`],
}

export const workTypeConfigs: workTypeConfig = {
  室長: {
    apps: {
      newCar: {roles: [`本部管理者`]},
      ucar: {roles: [`本部管理者`]},
    },
  },
  専務: {
    apps: {
      newCar: {roles: [`本部管理者`]},
      ucar: {roles: [`本部管理者`]},
    },
  },
  部長: {
    apps: {
      newCar: {roles: [`本部管理者`]},
      ucar: {roles: [`本部管理者`]},
    },
  },
  'GM(グループマネージャー)': {
    apps: {
      newCar: {roles: [`本部管理者`]},
      ucar: {roles: [`本部管理者`]},
    },
  },
  'GM(ゼネラルマネージャー)': {
    apps: {
      newCar: {roles: [`店長`]},
      ucar: {roles: [`店長`]},
    },
  },
  店長: {
    apps: {
      newCar: {roles: [`店長`]},
      ucar: {roles: [`店長`]},
    },
  },
  販売副店長: {
    apps: {
      newCar: {roles: [`副店長`]},
      ucar: {roles: [`副店長`]},
    },
  },
  'チーフ(含・SCリーダー)': {
    apps: {
      newCar: {roles: [`営業`]},
      ucar: {roles: [`営業`]},
    },
  },
  業販スタッフ: {
    apps: {
      newCar: {roles: [`営業`]},
      ucar: {roles: [`営業`]},
    },
  },
  新車スタッフ: {
    apps: {
      newCar: {roles: [`営業`]},
      ucar: {roles: [`営業`]},
    },
  },
  'U-Carスタッフ': {
    apps: {
      newCar: {roles: [`営業`]},
      ucar: {roles: [`営業`]},
    },
  },
  セールスコンサルタント: {
    apps: {
      newCar: {roles: [`営業`]},
      ucar: {roles: [`営業`]},
    },
  },
  クルー: {
    apps: {
      newCar: {roles: [`営業`]},
      ucar: {roles: [`営業`]},
    },
  },
  法人営業スタッフ: {
    apps: {
      newCar: {roles: [`営業`]},
      ucar: {roles: [`営業`]},
    },
  },
  営業スタッフ: {
    apps: {
      newCar: {roles: [`営業`]},
      ucar: {roles: [`営業`]},
    },
  },

  // QRBP
  サービス副店長: {
    apps: {
      QRBP: {roles: ['拠点アドバイザ', 'サービス副店長']},
      newCar: {roles: ['拠点アドバイザ', 'サービス副店長']},
      ucar: {roles: ['拠点アドバイザ', 'サービス副店長']},
    },
  },
  ワークショップリーダー: {
    apps: {
      QRBP: {roles: [`拠点アドバイザ`, `サービス副店長`]},
      newCar: {roles: [`拠点アドバイザ`, `サービス副店長`]},
      ucar: {roles: [`拠点アドバイザ`, `サービス副店長`]},
    },
  },
  サービスアドバイザー: {
    apps: {
      QRBP: {roles: [`拠点アドバイザ`]},
      newCar: {roles: [`拠点アドバイザ`]},
      ucar: {roles: [`拠点アドバイザ`]},
    },
  },
  マネージャー: {
    apps: {
      QRBP: {roles: [`拠点アドバイザ`, '副店長']},
      newCar: {roles: [`拠点アドバイザ`, '副店長']},
      ucar: {roles: [`拠点アドバイザ`, '副店長']},
    },
  },
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
  storeCode?: number
  apps: appString[]
  userRoles: oktpRoleString[]
}[] = [
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
    // storeCode: 94,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //久山さん
  {
    code: 813030,
    // storeCode: 94,
    apps: [`ucar`],
    userRoles: ['中古車G'],
  }, //森山さん
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
