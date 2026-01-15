'use client'

import {columnGetterType} from '@cm/types/types'
import {colType} from '@cm/types/col-types'
import {Fields} from '@cm/class/Fields/Fields'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {PencilSquareIcon} from '@heroicons/react/20/solid'
import useRoleGMF from '@cm/hooks/useRoleGMF'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {allOktpRoles} from '@app/oktpCommon/constants'
import AppsArraySelector from '@app/(apps)/common/user/components/AppsArraySelector'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

export class ColBuilder {
  static store = (props: columnGetterType) => {
    const data: colType[] = [
      {
        id: 'code',
        label: '拠点コード',
        type: 'number',
        td: {},
        form: {register: {required: '必須'}},
        search: {},
        sort: {},
      },
      {
        id: 'name',
        label: '名前',
        form: {register: {required: '必須'}},
        search: {},
        sort: {},
      },
      {
        id: 'tel',
        label: '電話番号',
        form: {register: {}},
        search: {},
      },
      {
        id: 'fax',
        label: 'FAX番号',
        form: {register: {}},
        search: {},
      },
      {
        id: 'address',
        label: '住所',
        form: {register: {}},
        search: {},
      },
      {
        id: 'areaId',
        label: '配送エリア区分',
        form: {register: {}},
        forSelect: {},
        search: {},
      },
      {
        id: 'active',
        label: 'アクティブ',
        type: 'boolean',
        form: {},
        sort: {},
      },
      {
        id: 'sortOrder',
        label: '並び順',
        type: 'number',
        form: {},
        sort: {},
      },
    ]

    return Fields.transposeColumns(data)
  }

  static user = (props: columnGetterType) => {
    const {useGlobalProps} = props
    const {session} = useGlobalProps
    const scopes = getScopes(session)

    // 共通カラム（常に表示）
    const commonCols: colType[] = [
      {
        id: 'active',
        label: 'アクティブ',
        type: 'boolean',
        form: {},
        sort: {},
      },
      {
        id: 'code',
        type: 'number',
        label: 'コード',
        form: {
          register: {required: '必須'},
          disabled: !scopes.admin,
        },
        sort: {},
        search: {},
      },
      {
        id: 'storeId',
        label: '拠点',
        forSelect: {},
        form: {
          register: {required: '必須'},
          disabled: !scopes.admin,
        },
        sort: {},
        search: {},
      },
      {
        id: 'name',
        label: '氏名',
        form: {
          register: {required: '必須'},
          disabled: !scopes.admin,
        },
        sort: {},
        search: {},
      },
      {
        id: 'kana',
        label: 'カナ',
        form: {
          disabled: !scopes.admin,
        },
        search: {},
        sort: {},
      },
      {
        id: 'email',
        label: 'メールアドレス',
        form: {
          register: {required: '必須'},
          disabled: !scopes.admin,
        },
        sort: {},
        search: {},
        type: 'email',
      },
      {
        id: 'password',
        label: 'パスワード',
        type: 'password',
        form: {
          disabled: !scopes.admin,
        },
        td: {hidden: true},
      },
      {
        id: 'apps',
        label: 'アプリ',
        type: 'array',
        form: {
          disabled: !scopes.admin,
          editFormat: props => {
            return <AppsArraySelector {...props} />
          },
        },
        format: (value, row) => {
          return value?.join(' / ') || ''
        },
        sort: {},
      },
      {
        id: 'userRoles',
        label: '権限',
        format: (value, row: any) => {
          const {setGMF_OPEN} = useRoleGMF()
          return (
            <R_Stack {...{className: `onHover flex-nowrap gap-0.5`, onClick: () => setGMF_OPEN({user: row})}}>
              <PencilSquareIcon className={`min-w-4 h-4`} />
              <small>{row.UserRole?.map(role => role.RoleMaster.name).join(' / ') || '権限なし'}</small>
            </R_Stack>
          )
        },
        form: {hidden: true},
        sort: {},
      },
      {
        id: 'role',
        label: '権限（旧・非推奨）',
        format: value => value || '',
        form: {
          disabled: true, // 編集不可（UserRole経由で管理）
        },
        sort: {},
        search: {},
      },
    ]

    // QRBP固有のカラム（条件付き表示）
    // 注意: td.hiddenはbooleanのみ対応のため、format関数内で条件分岐して空文字を返す
    const qrbpCols: colType[] = [
      {
        id: 'type2',
        label: '区分2（エンジニアチーム）',
        form: {disabled: !scopes.admin},
        search: {},
        sort: {},
        forSelect: {
          optionsOrOptionFetcher: BP_Car.const.engineerTeamType,
        },
        format: (value, row) => {
          // QRBPアプリのユーザーのみ表示
          if (!row.apps?.includes('QRBP')) return ''
          return value || ''
        },
      },
      {
        id: 'damageNameMasterId',
        label: 'ダメージ区分',
        forSelect: {},
        form: {
          disabled: !scopes.admin,
        },
        search: {},
        sort: {},
        format: (value, row) => {
          // QRBPアプリのユーザーのみ表示
          if (!row.apps?.includes('QRBP')) return ''
          return row.DamageNameMaster?.name || ''
        },
      },
    ]

    const data: colType[] = [...commonCols, ...qrbpCols]

    return Fields.transposeColumns(data)
  }

  static roleMaster = (props: columnGetterType) => {
    return new Fields([
      {
        id: 'name',
        label: '役割名称',
        form: {
          register: {required: '必須'},
        },
        forSelect: {
          optionsOrOptionFetcher: allOktpRoles,
        },
        format: (value, row) => {
          return (
            <div>
              {value}
              <small className="text-gray-500"> ({row.UserRole?.length || 0}人)</small>
            </div>
          )
        },
        sort: {},
        search: {},
      },
      {
        id: 'description',
        label: '説明',
        form: {},
        search: {},
      },
      {
        id: 'color',
        label: '色',
        type: 'color',
        form: {},
        sort: {},
      },
      {
        id: 'apps',
        label: 'アプリ',
        type: 'array',
        form: {
          editFormat: props => {
            return <AppsArraySelector {...props} />
          },
        },
        format: (value, row) => {
          return value?.join(' / ') || ''
        },
        sort: {},
      },
    ]).transposeColumns()
  }
}
