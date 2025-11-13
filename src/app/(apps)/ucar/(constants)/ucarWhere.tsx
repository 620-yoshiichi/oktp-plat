
export const ucarWhere = {
  ucarStores: {
    OR: [
      {name: {contains: `CHU BASE`}},
      {name: {contains: `中古車`}},
      {name: {contains: `レクサス`}},
      {name: {contains: `ダイハツ`}},
    ],
  },
}
