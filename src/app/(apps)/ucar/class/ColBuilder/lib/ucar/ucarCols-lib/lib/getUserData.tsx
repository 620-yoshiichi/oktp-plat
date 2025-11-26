

// export const getEditableTd = (props?: any) => {
//   const {width = 150} = props ?? {}
//   return {
//     //
//     withLabel: true,
//     editable: {style: {...absSize({width})}},
//   }
// }

// export const getUserData = ({session}) => {
//   const userData: colType[] = new Fields([
//     {
//       ...{id: 'storeId', label: '店舗'},
//       forSelect: {},
//       form: {disabled: true, defaultValue: session.storeId},
//       format: (value, row) => {
//         return <div className={` w-[70px]   truncate`}>{row?.Store?.name}</div>
//       },
//     },
//     {id: 'userId', label: 'ユーザー', forSelect: {}, form: {disabled: true, defaultValue: session.id}},

//     {
//       ...{id: 'destination', label: '仕分結果', form: {}},
//       td: {...getEditableTd({width: 120})},
//       forSelect: {
//         optionsOrOptionFetcher: UCAR_CODE.SHIWAKE.array,
//       },
//     },
//     {
//       ...{id: 'storeToSend', label: '配布店舗', form: {}},
//       td: {...getEditableTd({width: 120})},

//       forSelect: {
//         config: {
//           modelName: `store`,
//           orderBy: [{code: `asc`}],
//           where: () => {
//             return {OR: [{name: {contains: 'CHU BASE'}}, {name: {contains: 'ダイハツパーク'}}]}
//           },
//           nameChanger: op => ({...op, id: op.name, name: op.name}),
//         },
//       },
//     },
//   ])
//     .customAttributes(({col}) => {
//       return {...col, td: {withLabel: true}}
//     })
//     .aggregateOnSingleTd({}).plain

//   return userData
// }
