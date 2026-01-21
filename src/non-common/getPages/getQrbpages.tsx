import { getAppSwitchMenus } from 'src/non-common/appSwitchMenus'
import { CleansePathSource, PageGetterType } from 'src/non-common/path-title-constsnts'
import { getScopes } from 'src/non-common/scope-lib/getScopes'

export const getQrbpPages = (props: PageGetterType) => {
  const { session, rootPath, pathname, query, roles } = props

  const scopes = getScopes(session, { query, roles })
  const { login } = scopes
  const QRBP = scopes.getQrbpProps()

  const newCar = scopes.getNewCarProps()

  const qrBpMember = QRBP?.isQrbpMember

  const pathSource = [
    {
      tabId: 'car',
      label: '車両一覧',
      ROOT: [rootPath, 'admin', 'car'],
      exclusiveTo: qrBpMember,
      children: [
        {
          tabId: 'forCr',
          label: 'CR台帳',
          exclusiveTo: QRBP?.cr,
          link: {
            query: scopes.admin
              ? {}
              : {
                isMyCrCar: true,
                orderBy: 'orderedAt',
                orderDirection: 'desc',
              },
          },
          children: [
            {
              tabId: 'qrsheet',
              label: 'QRコード',
              exclusiveTo: QRBP?.cr,
            },
          ],
        },
        {
          tabId: 'scheduled',
          label: 'スケジュールボード',
          exclusiveTo: QRBP?.cr,
          children: [
            {
              tabId: 'qrsheet',
              label: 'QRコード',
              exclusiveTo: QRBP?.cr,
            },
          ],
        },
        {
          tabId: 'forStore',
          label: '拠点用リスト',
          exclusiveTo: QRBP?.store || newCar.isStoreManager,
          link: {
            query: {
              isMyOrder: newCar.isStoreManager ? undefined : true,
              onProcess: true,
            },
          },
        },
        {
          ROOT: [rootPath, 'admin', 'config'],
          tabId: 'damageNameMaster',
          label: 'ダメージ区分',
          link: {},
          exclusiveTo: QRBP?.cr,
        },
        {
          ROOT: [rootPath, 'admin'],
          tabId: 'settlementTool',
          label: '精算ツール',
          link: {},
          exclusiveTo: QRBP?.cr,
        },
      ],
    },

    {
      tabId: '',
      ROOT: [rootPath],
      label: `工程入力`,
      exclusiveTo: !login || scopes.admin ? true : qrBpMember && (QRBP?.store || newCar.isStoreManager ? false : true),
      children: [
        {
          tabId: 'engineer',
          label: `工程入力`,
          link: {},
        },
      ],
    },
    {
      tabId: 'history',
      ROOT: [rootPath, 'process'],
      label: '履歴',
      exclusiveTo: !login ? true : qrBpMember && (QRBP?.store || newCar.isStoreManager ? false : true),
    },
    // {
    //   tabId: 'summary',
    //   ROOT: [rootPath, 'admin'],
    //   label: '滞留履歴',
    //   exclusiveTo: scopes?.admin,
    // },

    {
      tabId: 'config',
      label: '設定',
      ROOT: [rootPath, 'admin', 'config'],
      exclusiveTo: scopes.admin,
      children: [

        { tabId: 'area', label: 'エリア', link: {}, exclusiveTo: scopes.admin },
        { tabId: 'processNameMaster', label: '工程', link: {}, exclusiveTo: scopes.admin },
        { tabId: 'noteNameMaster', label: '備考区分', link: {}, exclusiveTo: scopes.admin },
      ],
    },
    login ? getAppSwitchMenus(scopes) : undefined,
  ].filter(Boolean)
  const { cleansedPathSource, navItems, breads, allPathsPattenrs } = CleansePathSource({
    rootPath,
    pathSource,
    pathname,
    session,
  })

  return {
    allPathsPattenrs,
    pathSource: cleansedPathSource,
    navItems,
    breads,
  }
}
