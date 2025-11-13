import {CleansePathSource, PageGetterType, pathItemType} from 'src/non-common/path-title-constsnts'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const getShinrenPages = (props: PageGetterType) => {
  const {session, query, rootPath, pathname, roles} = props
  const scopes = getScopes(session, {query, roles})
  const {login, admin} = scopes
  const linkToMyData = {link: {query: {g_userIdArr: session?.id}}}

  const configRoot = {ROOT: [rootPath, 'admin', 'config']}
  const loginOnly = {exclusiveTo: login}

  const commons = {
    ...loginOnly,
    ...linkToMyData,
  }

  const queryFromToMapper = array => {
    return [...array].map(d => {
      const newQuery = {
        from: query.from,
        to: query.to,
        ...d?.link?.query,
      }
      const link = d.link !== false ? {...d.link, query: newQuery} : undefined
      const result = {...d, link}

      return result
    })
  }

  const pathSource: pathItemType[] = queryFromToMapper([
    {tabId: 'admin', label: 'TOP', ROOT: [rootPath], hide: true, ...commons},
    {
      tabId: 'config',
      label: '設定',
      ...configRoot,
      exclusiveTo: admin ? true : false,
      children: queryFromToMapper([
        {tabId: 'rentaStore', label: '営業所'},
        {tabId: 'user', label: 'スタッフ'},
        {tabId: 'purposeMaster', label: '用件オプション'},
        {tabId: 'outcomeMaster', label: '成果オプション'},
      ]),
    },
    {
      tabId: 'rentaDailyReport',
      label: '日報',
      ...configRoot,
      ...commons,
    },

    {
      tabId: 'rentaCustomer',
      label: '顧客',

      ...configRoot,
      ...commons,
      children: queryFromToMapper([
        {tabId: 'rentaCustomer', label: '顧客マスタ', ...commons},
        {tabId: 'non-visit-customers', label: '未訪問客', ...commons},
        {tabId: 'referral-tree', label: '紹介ツリー', ...commons},
        {tabId: 'merge-customer', label: '顧客統合処理', ...commons},
      ]),
    },

    {tabId: 'calendar', label: '重要情報', ROOT: [rootPath, 'admin'], ...commons},
    {tabId: 'aggregation', label: '集計', ROOT: [rootPath, 'admin'], ...commons},
  ])

  // const loadingRoles = roles === undefined
  return {
    ...CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      session,
    }),
  }
}
