export type processNameStr =
  | 'QR発行'
  | '入庫'
  | '店長検収'
  | 'CR着'
  | '受入'
  | '検収'
  | '加修開始'
  | '加修終了'
  | 'まるくり'
  | '検査'
  | '写真終了'
  | 'GAZOO'
  | '拠点受取'
  | '書類送付'
  | '配送停止'
  | '現地処理'

export type postHandlerStr = 'スタッフ入庫検収' | '配送手配' | '配送停止' | '現地処理'

// export const PROCESS_MASTER: processMaster[] = [
//   {
//     bigQueryFieldKey: `datetime_0`,
//     value: 'QR発行',
//     color: '#ececec',
//     type: '営業',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_1`,
//     value: '入庫',
//     color: '#00802f',
//     type: '営業',
//     list: [`main`],
//     postHandler: `スタッフ入庫検収`,
//   },
//   {
//     bigQueryFieldKey: `datetime_2`,
//     value: '店長検収',
//     color: '#54b222',
//     type: '店長',
//     list: [`main`],
//     postHandler: `配送手配`,
//   },
//   {
//     bigQueryFieldKey: `datetime_3`,
//     value: 'CR着',
//     color: '#62f7ff',
//     type: '加修',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_4`,
//     value: '受入',
//     color: '#08a1a9',
//     type: '加修',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_6`,
//     value: '検収',
//     color: '#007a80',
//     type: '加修',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_7`,
//     value: '加修開始',
//     color: '#805e00',
//     type: '加修',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_8`,
//     value: '加修終了',
//     color: '#805300',
//     type: '加修',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_9`,
//     value: 'まるくり',
//     color: '#005380',
//     type: '加修',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_11`,
//     value: '検査',
//     color: '#110080',
//     type: '加修',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_12`,
//     value: '写真',
//     color: '#c7c41e',
//     type: '加修',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_13`,
//     value: 'GAZOO',
//     color: '#c5bc09',
//     type: '加修',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: `datetime_14`,
//     value: '拠点受取',
//     color: '#c54509',
//     type: '店長',
//     list: [`main`],
//   },
//   {
//     bigQueryFieldKey: ``,
//     value: '書類送付',
//     color: '#54b222',
//     type: '店長',
//     list: [`sub`],
//   },
//   {
//     bigQueryFieldKey: ``,
//     value: '配送停止',
//     color: '#686868',
//     type: '店長',
//     list: [`sub`],
//     postHandler: `配送停止`,
//   },
//   {
//     bigQueryFieldKey: ``,
//     value: '現地処理',
//     color: '#686868',
//     type: '店長',
//     list: [`sub`],
//     postHandler: `現地処理`,
//   },
// ]
