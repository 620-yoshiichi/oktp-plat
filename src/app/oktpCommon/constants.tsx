
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

// forcedUsersは別ファイルに移動しました。後方互換性のため再エクスポート
export {forcedUsers} from '@app/oktpCommon/api/seeder/kaonavi/lib/forced-users'

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
