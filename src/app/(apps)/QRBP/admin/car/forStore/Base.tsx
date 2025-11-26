'use client'
import React from 'react'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useInitFormState from '@cm/hooks/useInitFormState'

import {ColBuilder} from '@app/(apps)/QRBP/class/ColBuilder'
import {PageBuilder} from '@app/(apps)/QRBP/class/PageBuilder'
import WaitingCarVisualizer from '@app/(apps)/QRBP/components/QRBP/Car/WaitingCarVisualizer'

import {C_Stack, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import {PrismaModelNames} from '@cm/types/prisma-types'

import useSWR from 'swr'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {DoubledBP} from '@app/(apps)/QRBP/class/doubledBpNumber'

import {useParams} from 'next/navigation'

import {Paper} from '@cm/components/styles/common-components/paper'
import useRecords from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import EasySearcher from '@cm/components/DataLogic/TFs/MyTable/components/EasySearcher/EasySearcher'
import TableForm from '@cm/components/DataLogic/TFs/PropAdjustor/components/TableForm'
import {getInitModelRecordsProps} from '@cm/components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'
import {MyFormType} from '@cm/types/form-types'
import CarDetailById from '@app/(apps)/QRBP/components/QRBP/forCr/CarDetailById'

export default function CarForStoreBase(props: {
  waitingListObject
  serverFetchProps
  initialModelRecords: Awaited<ReturnType<typeof getInitModelRecordsProps>>
}) {
  const {waitingListObject, serverFetchProps, initialModelRecords} = props

  const params = useParams() as any
  const dataModelName: PrismaModelNames = `car`
  const useGlobalProps = useGlobal()

  // const {prismaData, easySearchPrismaDataOnServer, prismaDataExtractionQuery, easySearchWhereAnd, easySearchObject} =
  //   serverFetchihngData as serverFetchihngDataType

  const HK_USE_RECORDS = useRecords({serverFetchProps, initialModelRecords})

  const {formData, setformData} = useInitFormState(null, HK_USE_RECORDS?.records, false, 'car')

  const bpNumbersInTable = (HK_USE_RECORDS?.records ?? []).map(record => {
    return DoubledBP.goodbyCode.make(record)
  })
  const {data: subCarsInCurrentCars = []} = useSWR(`/`, async () => {
    const {result} = await doStandardPrisma(`car`, `findMany`, {
      where: {representativeCarBpNumber: {in: bpNumbersInTable}},
      include: {
        Process: {include: {Car: {}, ProcessNameMaster: true}},
      },
    })
    return result
  })

  const columns = ColBuilder.carForStore({
    useGlobalProps,
    ColBuilderExtraProps: {subCarsInCurrentCars},
  })

  const commonProps = {
    editType: {type: 'modal'},
    dataModelName,
    formData,
    setformData,
    columns,
  }
  /**わたすpropsたち */
  const myTable = {
    header: false,
    style: {minWidth: 1300, height: '70vh'},
    create: false,
    delete: false,
    pagination: {countPerPage: 15},

    customActions: () => <WaitingCarVisualizer {...{waitingListObject}} />,
  }

  const myForm: MyFormType = {
    alignMode: 'rowBlock',
    style: {minHeight: 350, minWidth: 1200, maxWidth: 1200},
    create: false,
    delete: false,
  }

  const {records, setrecords, mutateRecords, deleteRecord, easySearchPrismaDataOnServer, prismaDataExtractionQuery} =
    HK_USE_RECORDS

  const dataViewrProps: ClientPropsType2 = {
    params,
    totalCount: HK_USE_RECORDS.totalCount,

    // easySearchObject: initialModelRecords.easySearchObject
    ...commonProps,
    PageBuilder,
    records,
    setrecords,
    mutateRecords,
    deleteRecord,
    myTable,
    myForm,
    additional: {},
    useGlobalProps,
    editType: {type: 'modal'},
  }

  return (
    <Padding>
      <C_Stack className={`mx-auto w-fit`}>
        {easySearchPrismaDataOnServer && (
          <Paper>
            <EasySearcher
              {...{
                dataModelName: dataViewrProps.dataModelName,
                prismaDataExtractionQuery: dataViewrProps.prismaDataExtractionQuery,
                easySearchPrismaDataOnServer,
                useGlobalProps,
                HK_USE_RECORDS: HK_USE_RECORDS,
              }}
            />
          </Paper>
        )}

        <R_Stack style={{maxWidth: 1200, width: 1200, margin: 'auto'}} className={`justify-center`}>
          <TableForm {...dataViewrProps} EditForm={CarDetailById} />
        </R_Stack>
      </C_Stack>
    </Padding>
  )
}
