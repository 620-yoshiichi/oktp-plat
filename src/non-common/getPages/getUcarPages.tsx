import {getAppSwitchMenus} from 'src/non-common/appSwitchMenus'
import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const getUcarPages = (props: PageGetterType) => {
  const {session, rootPath, pathname, query, roles} = props
  const scopes = getScopes(session, {query, roles})

  const pathSource: pathItemType[] = [
    {tabId: 'zaikoTairyu', label: '在庫滞留状況', ROOT: [rootPath], exclusiveTo: scopes.login},

    {tabId: 'createQr', label: 'QR発行', ROOT: [rootPath], exclusiveTo: scopes.login},

    {
      tabId: 'ucar',
      label: 'Ucar一覧',
      link: {
        query: {displayColumns: '下取書類'},
      },
      exclusiveTo: scopes.login,
      ROOT: [rootPath],
      children: [
        {
          tabId: 'ucar',
          label: '車両一覧（拠点用）',
          link: {
            query: {displayColumns: '下取書類,商品化'},
          },
        },

        {
          tabId: 'ucar',
          label: '商品化',
          link: {query: {displayColumns: '商品化'}},
          children: [],
        },
        {
          tabId: 'ucar',
          label: '下取書類',
          link: {query: {displayColumns: '下取書類'}},
          children: [],
        },
        {
          tabId: 'ucar',
          label: '自動車税',
          link: {query: {displayColumns: '自動車税'}},
          children: [],
        },
      ],
    },

    {
      tabId: 'config',
      label: '設定',
      exclusiveTo: scopes.admin,
      ROOT: [rootPath],
      children: [
        {tabId: 'store', label: '拠点', link: {}, exclusiveTo: scopes.admin},
        {tabId: 'user', label: 'ユーザー', link: {}, exclusiveTo: scopes.admin},
        {tabId: 'ucarProcess', label: '作業記録', link: {}, exclusiveTo: scopes.admin},
        {tabId: 'bankMaster', label: '銀行', link: {}, exclusiveTo: scopes.admin},
        {tabId: `98list`, label: `98番号と売上`},
        {tabId: `ucarGarageLocationMaster`, label: '車庫一覧', exclusiveTo: scopes.admin, children: []},
        {tabId: `batch`, label: 'バッチ', exclusiveTo: scopes.admin, children: []},
      ],
    },
    getAppSwitchMenus(scopes),
  ]
  const {cleansedPathSource, navItems, breads, allPathsPattenrs} = CleansePathSource({
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
