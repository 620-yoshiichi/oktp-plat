'use client'

import {Tds} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/Tds'
import {Ths1} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/Ths1'
import {Ths2} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/Ths2'
import {countCagetory, UserData} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/types'

const RentaAggTableByUser = ({userWithCount}) => {
  const {id, name, RentaStore, ...theadCols} = userWithCount[0] ?? {}

  return (
    <>
      <div className={`table-wrapper no-padding-y no-padding-x  text-center`}>
        <table className={`[&_td]:!border-[1px] [&_th]:!border-[1px]`}>
          <thead>
            <tr>
              <th
                rowSpan={2}
                style={{
                  width: 80,
                }}
              >
                スタッフ
              </th>
              {Object.keys(theadCols).map((datakey, i) => {
                const object = theadCols[datakey] as countCagetory
                const {columnOrigin, categoryName} = object
                return (
                  <Ths1 key={i} colSpan={columnOrigin.length}>
                    {categoryName}
                  </Ths1>
                )
              })}
            </tr>
            <tr className={`align-td-width`}>
              {Object.keys(theadCols).map((datakey, i) => {
                const object = theadCols[datakey] as countCagetory
                const {columnOrigin, categoryName} = object
                return <Ths2 key={i} columnOrigin={columnOrigin} categoryName={categoryName} />
              })}
            </tr>
          </thead>
          <tbody>
            {userWithCount.map((user: UserData, i) => {
              const {id, name, RentaStore, ...restCountObject} = user

              const userName = user?.name as string

              return (
                <tr key={user.id ?? i}>
                  <th className={`sticky  left-0  `} style={{minWidth: 120}}>
                    <div>{userName}</div>
                  </th>
                  {Object.keys(restCountObject).map((dataKey, i) => {
                    const object = restCountObject[dataKey] as countCagetory
                    const {columnOrigin} = object

                    const tdsProps = {
                      dataKey: dataKey,
                      columnOrigin,
                      dataCountArrForUser: object.groupByArr,
                    }

                    return <Tds key={i} {...tdsProps} />
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default RentaAggTableByUser
