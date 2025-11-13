import {isDev} from '@cm/lib/methods/common'

export const getAppSwitchMenus = (scopes: any) => {
  return {
    tabId: ``,
    label: `アプリ`,
    children: [
      {tabId: 'newCar', label: '納期CS', exclusiveTo: scopes.admin},
      {tabId: 'QRBP', label: 'BP', exclusiveTo: scopes.admin},
      isDev ? {tabId: 'ucar', label: 'QRシステム', exclusiveTo: scopes.admin} : undefined,
    ].filter(Boolean),
    ROOT: [],
    exclusiveTo: !!(scopes.getNewCarProps().isStoreManager || scopes.admin),
  } as any
}

export const getLoginMenus = (scopes: any, rootPath: string) => {
  return {
    tabId: `logout?rootPath=${rootPath}`,
    label: `ログアウト`,
    ROOT: [],
    exclusiveTo: scopes.login,
  } as any
}
