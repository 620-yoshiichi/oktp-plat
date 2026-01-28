import { getAppSwitchMenus } from 'src/non-common/appSwitchMenus'
import { CleansePathSource, PageGetterType, pathItemType } from 'src/non-common/path-title-constsnts'
import { getScopes } from 'src/non-common/scope-lib/getScopes'

export const getUcarPages = (props: PageGetterType) => {
  const { session, rootPath, pathname, query, roles } = props

  const scopes = getScopes(session, { query, roles })
  const { admin } = scopes
  const ucarProps = scopes.getUcarProps()

  const { isUcarMember, isHQ, isChukoshaGroup } = ucarProps

  const pathSource: pathItemType[] = [
    {
      tabId: 'ucar',
      label: 'QRメイン機能',

      ROOT: [rootPath],
      children: [
        {
          tabId: 'createQr',
          label: 'QR発行/再発行',
          ROOT: [rootPath],
          exclusiveTo: isUcarMember,
        },
        {
          tabId: 'ucar',
          label: 'QRシート発行履歴',
          link: {
            query: { displayColumns: '下取書類,商品化' },
          },
          exclusiveTo: isUcarMember,
        },

        {
          tabId: 'sateiIdConverter',
          label: '査定ID変換',
          ROOT: [rootPath],
        },
        {
          tabId: 'search',
          label: '商品予定車検索',
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
          link: { query: { displayColumns: '下取書類,商品化' } },
          exclusiveTo: isHQ || isChukoshaGroup || admin,
        },
        {
          tabId: 'ucar',
          label: '自動車税業務',
          link: {
            query: { displayColumns: '自動車税' },
          },
          exclusiveTo: isHQ || isChukoshaGroup || admin,
        },
        {
          tabId: 'tax-keiri',
          label: '自動車税 - 依頼中',
          ROOT: [rootPath],
          exclusiveTo: isHQ || isChukoshaGroup || admin,
        },
        {
          tabId: 'tax-keiri',
          label: '自動車税 - 経理',
          ROOT: [rootPath],
          exclusiveTo: isHQ || isChukoshaGroup || admin,
        },

        {
          tabId: 'familyTree',
          label: 'ファミリーツリー',
          ROOT: [rootPath],
          exclusiveTo: isHQ || isChukoshaGroup || admin,
        },
        { tabId: `98list`, label: `98番号チェック` },
      ],
    },
    {
      tabId: '',
      label: '本部',
      exclusiveTo: isHQ || isChukoshaGroup || admin,
      ROOT: [rootPath],
      children: [
        { tabId: 'kouteiKanri', label: '工程管理', ROOT: [rootPath] },
        { tabId: 'zaikoTairyu', label: '在庫滞留状況', ROOT: [rootPath] },
        { tabId: 'request-admin', label: '申請管理', ROOT: [rootPath] },
      ],
    },

    {
      tabId: '',
      label: '設定',
      exclusiveTo: admin,
      ROOT: [rootPath],
      children: [
        { tabId: 'ucarProcess', label: '作業記録', link: {} },
        { tabId: 'bankMaster', label: '銀行', link: {} },

        { tabId: `ucarGarageLocationMaster`, label: '車庫一覧', children: [] },
      ],
    },

    getAppSwitchMenus(scopes),
  ]
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
