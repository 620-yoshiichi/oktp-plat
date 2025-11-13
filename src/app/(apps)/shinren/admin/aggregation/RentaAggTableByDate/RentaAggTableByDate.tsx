import {Tds} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/Tds'
import {Ths1} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/Ths1'
import {Ths2} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/Ths2'
import {countCagetory, RowByUserProps, UserData} from '@app/(apps)/shinren/admin/aggregation/RentaAggTableByDate/types'
import RowByUser from '@app/(apps)/shinren/admin/aggregation/RowByUser'

import {Z_INDEX} from '@cm/lib/constants/constants'

import {Fragment} from 'react'

const RentaAggTableByDate = ({query, userWithCount, outcomeMasters, purposeMaters, days}) => {
  const {id, name, RentaStore, ...theadCols} = userWithCount[0] ?? {}

  return (
    <div className={`p-2`}>
      <div style={{maxHeight: '75vh'}} className={` table-wrapper  mx-auto  text-center`}>
        <table className={`no-padding-x no-padding-y  table-fixed [&_td]:!border-[1px] [&_th]:!border-[1px] `}>
          <thead>
            <tr>
              <th rowSpan={2} className={`!z-auto w-[100px] bg-white`}>
                日時
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
              return (
                <Fragment key={i}>
                  {days.map((day, d) => {
                    const RowByUserProps: RowByUserProps = {
                      query,
                      day,
                      user,
                      outcomeMasters,
                      purposeMaters,
                    }
                    return <RowByUser key={d} {...RowByUserProps} />
                  })}

                  <tr key={id}></tr>
                </Fragment>
              )
            })}
          </tbody>
          <tfoot
            style={{position: 'sticky', bottom: 0, zIndex: Z_INDEX.thead}}
            className={`bg-white font-bold [&_td]:!z-[9999]
            `}
          >
            {userWithCount.map((user, i) => {
              const {name, id, RentaStore, ...restCountObject} = user

              return (
                <Fragment key={i}>
                  <tr>
                    <th className={`!z-auto w-[100px] bg-white `}>TOTAL</th>

                    {Object.keys(restCountObject).map((dataKey, i) => {
                      const object = restCountObject[dataKey] as countCagetory

                      const {columnOrigin} = object

                      return (
                        <Tds
                          key={i}
                          {...{
                            dataKey: dataKey,
                            columnOrigin,
                            dataCountArrForUser: object.groupByArr,
                          }}
                        />
                      )
                    })}
                  </tr>
                </Fragment>
              )
            })}
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default RentaAggTableByDate
