import {isDev} from '@cm/lib/methods/common'

export const getAppSwitchMenus = (scopes: any) => {
  return {
    tabId: ``,
    label: `アプリ`,
    children: [
      {tabId: 'newCar', label: '納期CS'},
      {tabId: 'QRBP', label: 'BP'},
      isDev ? {tabId: 'ucar', label: 'QRシステム', exclusiveTo: scopes.admin} : undefined,
    ].filter(Boolean),
    ROOT: [],
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
