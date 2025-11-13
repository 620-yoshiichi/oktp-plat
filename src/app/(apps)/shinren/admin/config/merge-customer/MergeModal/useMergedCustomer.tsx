import {allCustomerCols} from '@app/(apps)/shinren/admin/config/merge-customer/MergeModal/MergeImageDisplay'
import {obj__cleanObject} from '@cm/class/ObjHandler/transformers'
import {useEffect, useState} from 'react'

export const useMergedCustomer = ({CstmrFrom, CstmTo}) => {
  const [mergedData, setmergedData] = useState({})

  useEffect(() => {
    if (!CstmrFrom || !CstmTo) return
    const data = {}
    allCustomerCols.forEach(col => {
      if (col.source === `app`) {
        data[col.id] = CstmrFrom[col.id]
      } else {
        data[col.id] = CstmTo[col.id]
      }
    })
    const cleanedData = obj__cleanObject(data)
    setmergedData(cleanedData)
  }, [CstmrFrom, CstmTo])

  return {mergedData, setmergedData}
}
