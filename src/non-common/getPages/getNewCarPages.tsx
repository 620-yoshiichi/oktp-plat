import { getAppSwitchMenus } from 'src/non-common/appSwitchMenus'
import { pathItemType } from 'src/non-common/path-title-constsnts'

import { CleansePathSource, PageGetterType } from 'src/non-common/path-title-constsnts'
import { getScopes } from 'src/non-common/scope-lib/getScopes'

export const getNewCarPages = (props: PageGetterType) => {
  const { session, query, rootPath, pathname, roles } = props

  const scopes = getScopes(session, { query, roles })

  const { login, admin } = scopes

  const linkToMyData = { link: { query: { g_userIdArr: session?.id } } }

  const loginOnly = { exclusiveTo: login, ROOT: [rootPath] }
  const commons = { ...loginOnly, ...linkToMyData }

  const { isHQ, isCR, isNewCarMember, isStoreManager } = scopes.getNewCarProps()

  const pathSource: pathItemType[] = [
    {
      tabId: '',
      label: 'CR',
      exclusiveTo: isNewCarMember && (isHQ || isCR),
      ROOT: [rootPath],
      children: [
        //
        {
          tabId: 'crOperation',
          label: 'CR着工確認',
          link: {
            query: { pending: true, not_registered: true },
          },
        },
        {
          tabId: 'vehicleTransfer',
          label: '車両移動補助',
          link: { query: { transferType: `可能`, trasferStutus: `移動なし` } },
        },
        { tabId: 'tenpo-tsuiko-renraku', label: '店舗追工連絡' },
      ],
    },
    {
      tabId: '',
      label: '店舗',
      ...commons,
      children: [
        {
          tabId: 'newCar',
          label: '注残管理',
          ...commons,
          link: {

          },
        },


        { tabId: 'prediction', label: '集計', ...commons },
        // { tabId: 'furiate-mitouroku', label: '振当後未登録リスト', ...commons, },

      ],
      exclusiveTo: isNewCarMember,
    },

    {
      tabId: '',
      label: '本部',
      exclusiveTo: isNewCarMember && isHQ,
      ROOT: [rootPath],
      children: [
        { tabId: 'torokuList', label: '登希履歴', link: { query: { pending: true, not_registered: true } } },
        // {tabId: `paymentCheck`, label: `支払確認`, exclusiveTo: isHQ},
        { tabId: 'calendar', label: '稼働スケジュール' },
        { tabId: 'statistics', label: 'LT' },
        { tabId: 'tairyuList', label: '滞留リスト' },
      ],
    },


    getAppSwitchMenus(scopes),
  ]

  return {
    ...CleansePathSource({
      rootPath,
      pathSource,
      pathname,
      session,
    }),
  }
}
