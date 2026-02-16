'use client'

import { useGlobalPropType } from '@cm/hooks/globalHooks/useGlobal'
import { formatDate } from '@cm/class/Days/date-utils/formatters'

import { BP_Car } from '@app/(apps)/QRBP/class/BP_Car'

import CarDetailById from '@app/(apps)/QRBP/components/QRBP/forCr/CarDetailById'
import { ColBuilder } from '@app/(apps)/QRBP/class/ColBuilder'
import { Button } from '@cm/components/styles/common-components/Button'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import { Fields } from '@cm/class/Fields/Fields'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import React from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import { useParams } from 'next/navigation'
import { knockEmailApi } from '@cm/lib/methods/knockEmailApi'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import useRecords from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

const PopOverBody = props => {
  const params = useParams() as any
  const { open, handleClose, handleOpen, Modal } = useModal()
  const useGlobalProps: useGlobalPropType = props.useGlobalProps
  const { car, setcarOnModal, activeCars } = props
  const { router, toggleLoad } = useGlobalProps
  const { records, setrecords, mutateRecords, deleteRecord, totalCount } = useRecords({
    dataModelName: 'car',
    serverFetchProps: {
      DetailePageId: undefined,
      dataModelName: 'car',
      additional: {},
      myTable: undefined,
      include: {},
      session: undefined,
      easySearchExtraProps: {},
      prismaDataExtractionQuery: {},
    },
    initialModelRecords: {
      queries: {
        easySearchObject: {},
        prismaDataExtractionQuery: {},
        EasySearcherQuery: {} as any,
      },
      data: {
        records: activeCars,
        totalCount: activeCars.length,
        easySearchPrismaDataOnServer: {} as any,
      },
    },
    fetchTime: car?.scheduledAt,
  })

  const reflectCrScheduled = async data => {
    const newDate = data.date
    const { scheduledAt } = car

    const scheduledAtToStr = scheduledAt ? formatDate(scheduledAt) : '未設定'
    const newDateToStr = newDate ? formatDate(newDate) : undefined

    if (!newDateToStr) {
      alert(`CRスケジュールが入力されていません`)
      return
    }

    if (confirm(`【${scheduledAtToStr}】 ➡︎ 【${newDateToStr}】へ更新します。よろしいですか？`)) {
      const sendEmail = false
      await toggleLoad(async () => {
        await doStandardPrisma('car', 'update', {
          where: { id: car?.id },
          data: { scheduledAt: formatDate(newDate, 'iso') },
        })
        if (sendEmail) {
          const subject = `BP予定変更通知`
          const text = `下記の車両の予定が変更されました。

【 ${formatDate(car.scheduledAt)}  > > > ${formatDate(newDate)}】
${new BP_Car(car).getCarInfoForEmail()}`
          const to = [car?.User?.email].filter(val => val)
          await knockEmailApi({ subject, text, to })
        }
      })
      setcarOnModal(false)
    }
  }

  const DateReflector = () => {
    const columns = Fields.transposeColumns([{ id: 'date', label: '拠点日付', type: 'date', form: {} }])
    const { BasicForm, latestFormData } = useBasicFormProps({ columns, formData: { date: car.crScheduledAt } })

    return (
      <ShadModal Trigger={<button className={`rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 transition-colors`}>拠点反映</button>}>
        <div className={`p-4`}>
          <BasicForm alignMode="col" latestFormData={latestFormData} onSubmit={reflectCrScheduled}>
            <Button>確定</Button>
          </BasicForm>
        </div>
      </ShadModal>
    )
  }

  const infoItems = [
    { label: 'BP番号', value: car?.bpNumber },
    { label: '車名', value: car?.carName },
    { label: 'ナンバー', value: car?.plate },
    { label: '顧客名', value: car?.customerName },
    { label: 'CR予定', value: formatDate(car?.crScheduledAt) },
    { label: '拠点予定', value: formatDate(car?.scheduledAt) },
  ]

  return (
    <div className={`max-w-[800px] w-full bg-white rounded-lg text-start text-gray-800`} style={{ zIndex: 9999 }}>
      <Modal {...{}}>
        <CarDetailById
          {...{
            totalCount,
            params,
            prismaDataExtractionQuery: {},
            records,
            setrecords,
            mutateRecords,
            deleteRecord,
            dataModelName: 'car',
            tableRecords: [],
            settableRecords: () => undefined,
            formData: car,
            additional: {},
            columns: ColBuilder.carForCr({ useGlobalProps }),
            useGlobalProps,
            prismaData: { records: [], totalCount: 0, noData: false, loading: false },
            setformData: () => undefined,
            myForm: {
              create: {
                finalizeUpdate: async ({ res: updateResult, formData }) => {
                  router.refresh()
                },
              },
            },
            myTable: undefined,
          }}
        />
      </Modal>

      {/* 車両基本情報 */}
      <div className={`border-b border-gray-100 p-4`}>
        <div className={`grid grid-cols-3 gap-x-6 gap-y-2`}>
          {infoItems.map(item => (
            <div key={item.label}>
              <div className={`text-[10px] text-gray-400`}>{item.label}</div>
              <div className={`text-sm font-medium`}>{item.value || '-'}</div>
            </div>
          ))}
        </div>
        <div className={`mt-3 flex items-center gap-2`}>
          <button
            onClick={handleOpen}
            className={`rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors`}
          >
            詳細を開く
          </button>
          <DateReflector />
        </div>
      </div>

      {/* 工程・メモ */}
      <div className={`grid grid-cols-2 gap-0 divide-x divide-gray-100`}>
        {/* 工程履歴 */}
        <div className={`p-4`}>
          <h4 className={`mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider`}>工程履歴</h4>
          <div className={`space-y-1`}>
            {(car?.Process ?? []).map((process, i) => (
              <div key={i} className={`flex items-center gap-2 rounded px-2 py-1 text-xs`}>
                <span
                  className={`inline-block h-2 w-2 rounded-full shrink-0`}
                  style={{ backgroundColor: process?.ProcessNameMaster?.color || '#ccc' }}
                />
                <span className={`font-medium text-gray-700 w-20 shrink-0`}>{process?.ProcessNameMaster?.name}</span>
                <span className={`text-gray-400`}>{formatDate(process?.createdAt)}</span>
                <span className={`text-gray-400 truncate`}>{process?.User?.name}</span>
              </div>
            ))}
            {(car?.Process ?? []).length === 0 && <p className={`text-xs text-gray-300`}>工程なし</p>}
          </div>
        </div>

        {/* メモ */}
        <div className={`p-4`}>
          <h4 className={`mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider`}>メモ・申請</h4>
          <div className={`space-y-1`}>
            {(car?.Notes ?? []).map((note, i) => (
              <div key={i} className={`rounded bg-gray-50 px-2 py-1.5 text-xs`}>
                <div className={`flex items-center gap-2`}>
                  <span
                    className={`inline-block h-2 w-2 rounded-full shrink-0`}
                    style={{ backgroundColor: note?.NoteNameMaster?.color || '#ccc' }}
                  />
                  <span className={`font-medium text-gray-700`}>{note?.NoteNameMaster?.name}</span>
                  <span className={`text-gray-400`}>{formatDate(note?.createdAt)}</span>
                  <span className={`text-gray-400`}>{note?.User?.name}</span>
                </div>
                {note?.content && <p className={`mt-0.5 pl-4 text-gray-600`}>{note.content}</p>}
              </div>
            ))}
            {(car?.Notes ?? []).length === 0 && <p className={`text-xs text-gray-300`}>メモなし</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopOverBody
