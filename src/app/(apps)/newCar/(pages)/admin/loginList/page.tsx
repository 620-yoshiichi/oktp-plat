'use client'
import React from 'react'

export default function LoginCheckPage({searchParams: query}) {
  return <div></div>
  // const {data: stores = []} = useDoStandardPrisma(`store`, `findMany`, {
  //   include: {
  //     User: {
  //       where: userForselectConfig.where,
  //       orderBy: [{code: `asc`}],
  //     },
  //   },
  //   where: {name: targetStoreWhere.name},
  //   orderBy: targetStoreWhere.orderBy,
  // })

  // return (
  //   <CenterScreen>
  //     <R_Stack className={`items-start`}>
  //       <TableWrapper className={`max-h-[80vh]`}>
  //         <TableBordered>
  //           <thead>
  //             <tr>
  //               <th>店舗名</th>
  //               <th>完了数</th>
  //               <th>対象数</th>
  //               <th>着手率</th>
  //             </tr>
  //           </thead>
  //           {stores.map(d => {
  //             const numbers = calcNumbers(d.User)
  //             const alertColor = numbers.ratio >= 100 ? '#809e7e' : ''
  //             return (
  //               <Fragment key={d.id}>
  //                 <tr style={{...getColorStyles(alertColor)}}>
  //                   <td>
  //                     <R_Stack className={`items-start`}>{d.name}</R_Stack>
  //                   </td>
  //                   <td>{numbers.loginSuccess}</td>
  //                   <td>{numbers.allUsers}</td>
  //                   <td>{numbers.ratio}%</td>
  //                 </tr>
  //               </Fragment>
  //             )
  //           })}
  //         </TableBordered>
  //       </TableWrapper>
  //       <TableWrapper className={`max-h-[80vh]`}>
  //         <TableBordered>
  //           <thead>
  //             <tr>
  //               <th>店舗名</th>
  //               <th>社員コード</th>
  //               <th>氏名</th>
  //               <th>完了</th>
  //             </tr>
  //           </thead>
  //           {stores.map(d => {
  //             return (
  //               <Fragment key={d.id}>
  //                 {d.User.map(u => {
  //                   return (
  //                     <tr key={u.id} className={u.loginCheck ? '' : 'bg-error-light'}>
  //                       <td>
  //                         <R_Stack className={`items-start`}>{d.name}</R_Stack>
  //                       </td>
  //                       <td>{u.code}</td>
  //                       <td>{u.name}</td>
  //                       <td>{u.loginCheck ? '完了' : ''}</td>
  //                     </tr>
  //                   )
  //                 })}
  //               </Fragment>
  //             )
  //           })}
  //         </TableBordered>
  //       </TableWrapper>
  //     </R_Stack>
  //   </CenterScreen>
  // )
}

const calcNumbers = users => {
  const allUsers = users.length
  const loginSuccess = users.filter(u => u.loginCheck).length
  const ratio = Math.round((loginSuccess / allUsers) * 100)

  return {allUsers, loginSuccess, ratio}
}
