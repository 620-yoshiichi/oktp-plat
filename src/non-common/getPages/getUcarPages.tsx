import {getAppSwitchMenus} from 'src/non-common/appSwitchMenus'
import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const getUcarPages = (props: PageGetterType) => {
  const {session, rootPath, pathname, query, roles} = props
  const scopes = getScopes(session, {query, roles})

  const ucarProps = scopes.getUcarProps()

  const {isUcarMember, isHQ} = ucarProps

  const pathSource: pathItemType[] = [
    {
      tabId: 'ucar',
      label: '中古車業務',

      exclusiveTo: isUcarMember,
      ROOT: [rootPath],
      children: [
        {tabId: 'createQr', label: 'QR発行', ROOT: [rootPath], exclusiveTo: isUcarMember},
        {
          tabId: 'ucar',
          label: '車両一覧',
          link: {
            query: {displayColumns: '下取書類,商品化'},
          },
        },

        {
          tabId: 'sateiIdConverter',
          label: '査定ID変換',
          ROOT: [rootPath],
        },
        {
          tabId: 'familyTree',
          label: 'ファミリーツリー',
          ROOT: [rootPath],
        },
      ],
    },
    {
      tabId: '',
      label: '中古車G',
      exclusiveTo: isHQ,
      ROOT: [rootPath],
      children: [
        {
          tabId: 'ucar',
          label: '書類管理',
          link: {
            query: {displayColumns: '下取書類,商品化'},
          },
        },
        {
          tabId: 'ucar',
          label: '自動車税業務',
          link: {
            query: {displayColumns: '自動車税'},
          },
        },
        {tabId: 'tax-keiri', label: '自動車税 - 依頼中', ROOT: [rootPath]},
        {tabId: 'tax-keiri', label: '自動車税 - 経理', ROOT: [rootPath]},
      ],
    },
    {
      tabId: '',
      label: '本部',
      exclusiveTo: isHQ,
      ROOT: [rootPath],
      children: [
        {tabId: 'kouteiKanri', label: '工程管理', ROOT: [rootPath]},
        {tabId: 'zaikoTairyu', label: '在庫滞留状況', ROOT: [rootPath]},
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
