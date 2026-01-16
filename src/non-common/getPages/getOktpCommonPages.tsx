import {getAppSwitchMenus} from 'src/non-common/appSwitchMenus'
import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const getOktpCommonPages = (props: PageGetterType) => {
  const {session, rootPath, pathname, query, roles} = props

  const scopes = getScopes(session, {query, roles})
  const {admin} = scopes

  const pathSource: pathItemType[] = [
    {
      tabId: '',
      ROOT: [rootPath, 'admin'],
      label: '共通マスタ',
      children: [
        {tabId: 'store', label: '拠点'},
        {tabId: 'user', label: 'ユーザー'},
        {tabId: 'roleMaster', label: '役割マスタ'},
      ],
    },
    {
      tabId: 'batch',
      label: 'バッチ',
      exclusiveTo: admin,
      ROOT: [rootPath, 'admin'],
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
