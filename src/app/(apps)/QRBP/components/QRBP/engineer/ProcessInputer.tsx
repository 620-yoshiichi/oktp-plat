'use client'

import React from 'react'

// const CarProcessChildCreator = dynamic(() => import('@app/(apps)/QRBP/components/QRBP/forCr/CarProcessChildCreator'), {
//   loading: () => <></>,
// })

import {ColBuilder} from '@app/(apps)/QRBP/class/ColBuilder'
import {PageBuilder} from '@app/(apps)/QRBP/class/PageBuilder'

import FavButton from '@app/(apps)/QRBP/components/QRBP/forCr/FavButton'

import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import useRecords from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
import {useSearchHandler} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/useSearchHandler/useSearchHandler'
import TableForm from '@cm/components/DataLogic/TFs/PropAdjustor/components/TableForm'
import {useParams} from 'next/navigation'
import useInitFormState from '@cm/hooks/useInitFormState'
import CarProcessChildCreator from '@app/(apps)/QRBP/components/QRBP/forCr/CarProcessChildCreator'

export default function ProcessInputer({
  serverFetchProps,
  initialModelRecords,
  MEMO_WhoAreYou,

  useGlobalProps,
}) {
  const params = useParams() as any
  const myTable = {create: false, delete: false, style: {maxHeight: '90vh'}}

  // const {prismaData: prismaCars} = usePrismaDataSwr({dataModelName: `car`, prismaDataExtractionQuery})
  const {records, setrecords, mutateRecords, deleteRecord, totalCount} = useRecords({serverFetchProps, initialModelRecords})

  const columns = ColBuilder.carListForEngineer({useGlobalProps})
  const {formData, setformData} = useInitFormState(null, records, false, 'car')

  const {query} = useMyNavigation()

  const {SearchedItemListMemo} = useSearchHandler({
    columns,
    dataModelName: `car`,
    useGlobalProps,
  })

  return (
    <div>
      {SearchedItemListMemo}
      <TableForm
        {...{
          totalCount: totalCount,
          params,
          PageBuilder,
          records,
          setrecords,
          mutateRecords,
          deleteRecord,
          dataModelName: 'car',
          formData,
          setformData,
          columns,
          additional: {},
          myForm: {alignMode: 'console'},
          myTable: {
            ...myTable,
            customActions: () => {
              return <>{MEMO_WhoAreYou}</>
            },
            header: false,

            AdditionalActionButtonObject: {
              favBtn: props => {
                return <FavButton {...{car: props?.record, useGlobalProps, userId: Number(query.userId)}} />
              },
            },
          },
          editType: {type: 'modal'},
          EditForm: CarProcessChildCreator,
          useGlobalProps,
        }}
      />
    </div>
  )
}
