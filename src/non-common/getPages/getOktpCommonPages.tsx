import {getAppSwitchMenus} from 'src/non-common/appSwitchMenus'
import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const getOktpCommonPages = (props: PageGetterType) => {
  const {session, rootPath, pathname, query, roles} = props

  const scopes = getScopes(session, {query, roles})
  const {admin} = scopes

  const pathSource: pathItemType[] = [
    {
      tabId: 'admin',
      label: 'TOP',
      ROOT: [rootPath],
      hide: true,
    },
    {
      tabId: '',
      label: '設定',
      exclusiveTo: admin,
      ROOT: [rootPath],
      children: [
        {
          tabId: '',
          label: '共通マスタ',
          ROOT: ['common', 'admin'],
          children: [
            {tabId: 'store', label: '拠点', link: {}},
            {tabId: 'user', label: 'ユーザー', link: {}},
          ],
        },
      ],
    },
    {
      tabId: 'batch',
      label: 'バッチ',
      exclusiveTo: admin,
      ROOT: ['common', 'admin'],
      link: {},
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
