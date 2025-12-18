export const getAppSwitchMenus = (scopes: any) => {
  const {isNewCarMember} = scopes.getNewCarProps()
  const {isUcarMember} = scopes.getUcarProps()
  const {isQrbpMember} = scopes.getQrbpProps()
  return {
    tabId: ``,
    label: `アプリ`,
    children: [
      {tabId: 'newCar', label: '納期CS', exclusiveTo: isNewCarMember},
      {tabId: 'QRBP', label: 'BP', exclusiveTo: isQrbpMember},
      {tabId: 'ucar', label: 'QRシステム', exclusiveTo: isUcarMember},
    ],

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
