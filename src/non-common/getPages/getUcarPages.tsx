import {getAppSwitchMenus} from 'src/non-common/appSwitchMenus'
import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const getUcarPages = (props: PageGetterType) => {
  const {session, rootPath, pathname, query, roles} = props

  const scopes = getScopes(session, {query, roles})

  const ucarProps = scopes.getUcarProps()

  const {isUcarMember, isHQ, isChukoshaGroup} = ucarProps

  const pathSource: pathItemType[] = [
    {
      tabId: 'ucar',
      label: 'Ucar業務',

      // exclusiveTo: isUcarMember,
      ROOT: [rootPath],
      children: [
        {tabId: 'createQr', label: 'QR発行', ROOT: [rootPath]},
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
      ],
    },
    {
      tabId: '',
      label: '中古車G',

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

        {
          tabId: 'familyTree',
          label: 'ファミリーツリー',
          ROOT: [rootPath],
        },
      ],
      // exclusiveTo: isHQ || isChukoshaGroup,
    },
    {
      tabId: '',
      label: '本部',
      // exclusiveTo: isHQ,
      ROOT: [rootPath],
      children: [
        {tabId: 'kouteiKanri', label: '工程管理', ROOT: [rootPath]},
        {tabId: 'zaikoTairyu', label: '在庫滞留状況', ROOT: [rootPath]},
      ],
    },

    {
      tabId: '',
      label: '設定',
      // exclusiveTo: scopes.admin,
      ROOT: [rootPath],
      children: [
        {tabId: 'store', label: '拠点', link: {}},
        {tabId: 'user', label: 'ユーザー', link: {}},
        {tabId: 'ucarProcess', label: '作業記録', link: {}},
        {tabId: 'bankMaster', label: '銀行', link: {}},
        {tabId: `98list`, label: `98番号と売上`},
        {tabId: `ucarGarageLocationMaster`, label: '車庫一覧', children: []},
        {tabId: `roleMaster`, label: '権限設定', children: []},
        {tabId: `batch`, label: 'バッチ', children: []},
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
