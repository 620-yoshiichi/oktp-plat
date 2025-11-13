'use client'
import React, {useState} from 'react'
import dynamic from 'next/dynamic'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useInitFormState from '@cm/hooks/useInitFormState'

import {ColBuilder} from '@app/(apps)/QRBP/class/ColBuilder'
import {PageBuilder} from '@app/(apps)/QRBP/class/PageBuilder'
import WaitingCarVisualizer from '@app/(apps)/QRBP/components/QRBP/Car/WaitingCarVisualizer'

import {MyTableType} from '@cm/types/types'
import {MyFormType} from '@cm/types/form-types'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {createCrCar, DamageSelectModal} from '@app/(apps)/QRBP/admin/car/forCr/forCr-methods'
import {ProcessCorrectionForm} from '@app/(apps)/QRBP/(public)/process/history/Table/Table'

import {DoubledBP} from '@app/(apps)/QRBP/class/doubledBpNumber'

import useSWR from 'swr'

import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import {useParams} from 'next/navigation'
import useRecords from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'
import {useSearchHandler} from '@cm/components/DataLogic/TFs/MyTable/components/SearchHandler/useSearchHandler/useSearchHandler'
import EasySearcher from '@cm/components/DataLogic/TFs/MyTable/components/EasySearcher/EasySearcher'
import TableForm from '@cm/components/DataLogic/TFs/PropAdjustor/components/TableForm'
import {getInitModelRecordsProps} from '@cm/components/DataLogic/TFs/Server/fetchers/getInitModelRecordsProps'

const StoreSelector = dynamic(() => import('@app/(apps)/QRBP/admin/car/forCr/StoreSelector'), {
  loading: () => <></>,
})
const CarDetailById = dynamic(() => import('@app/(apps)/QRBP/components/QRBP/forCr/CarDetailById'), {
  loading: () => <></>,
})

export default function CarForCrBase(props: {
  fetchTime
  waitingListObject
  serverFetchProps
  initialModelRecords: Awaited<ReturnType<typeof getInitModelRecordsProps>>
  storeQueryObj
}) {
  const {fetchTime, waitingListObject, serverFetchProps, initialModelRecords, storeQueryObj} = props

  const params = useParams() as any
  const useGlobalProps = useGlobal()

  const {toggleLoad, session, query, addQuery} = useGlobalProps

  const HK_USE_RECORDS = useRecords({
    fetchTime,
    serverFetchProps,
    initialModelRecords,
  })

  const dataModelName = 'car'

  const {formData, setformData} = useInitFormState(null, HK_USE_RECORDS?.records, false, 'forCrCarForm')
  const [showDamageSelector, setshowDamageSelector] = useState(false)

  const handleClose = () => {
    seteditModalOpen(null)
  }

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

  const [editModalOpen, seteditModalOpen] = useState(null)
  const columns = ColBuilder.carForCr({
    useGlobalProps,
    ColBuilderExtraProps: {
      setformData,
      editModalOpen,
      seteditModalOpen,
      subCarsInCurrentCars,
      setshowDamageSelector,
      handleClose,
    },
  })

  const myTable: MyTableType = {
    showHeader: false,
    delete: false,
    style: {minWidth: 1300, maxHeight: '70vh'},
    customActions: () => <WaitingCarVisualizer {...{waitingListObject}} />,
    pagination: {countPerPage: BP_Car.const.defaultCountPerPage},
  }

  const myForm: MyFormType = {
    alignMode: 'rowBlock',
    style: {minHeight: 350, minWidth: 1200, maxWidth: 1200},
    create: {
      executeUpdate: async ({latestFormData}) => {
        const res = await createCrCar({session, toggleLoad, latestFormData, formData, columns})

        return res
      },
    },
    delete: false,
  }

  const {records, setrecords, mutateRecords, deleteRecord, easySearchPrismaDataOnServer} = HK_USE_RECORDS

  const dataViewrProps: ClientPropsType2 = {
    params,
    totalCount: HK_USE_RECORDS.totalCount,
    records,
    setrecords,
    mutateRecords,
    deleteRecord,
    dataModelName,
    formData,
    setformData,
    columns,
    myTable,
    myForm,
    myModal: {style: {maxWidth: '95vw'}},
    useGlobalProps,
    additional: undefined,
    PageBuilder,
  }

  const {SearchingStatusMemo} = useSearchHandler({
    columns,
    dataModelName: `car`,
    useGlobalProps,
  })

  return (
    <div className={`p-2`}>
      <C_Stack className={` text-center`}>
        <ProcessCorrectionForm {...{Process: editModalOpen, editModalOpen, seteditModalOpen}} />
        <ShadModal open={showDamageSelector} onOpenChange={setshowDamageSelector}>
          <DamageSelectModal
            {...{
              showDamageSelector,
              setshowDamageSelector,
              toggleLoad: toggleLoad,
            }}
          ></DamageSelectModal>
        </ShadModal>

        {easySearchPrismaDataOnServer && (
          <>
            <EasySearcher
              {...{
                dataModelName: dataViewrProps.dataModelName,
                easySearchPrismaDataOnServer,
                useGlobalProps,
                UseRecordsReturn: HK_USE_RECORDS,
                hideEasySearch: dataViewrProps?.myTable?.hideEasySearch,
              }}
            />
          </>
        )}
        {SearchingStatusMemo}

        <R_Stack className={` mx-auto flex-nowrap items-start justify-center`}>
          <div>
            <StoreSelector {...{storeQueryObj, query, addQuery}} />
            <TableForm {...dataViewrProps} EditForm={CarDetailById} />
          </div>
        </R_Stack>
      </C_Stack>
    </div>
  )
}
