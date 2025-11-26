'use client'

import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getColorStyles} from '@cm/lib/methods/colors'

import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
// import { knockEmailApi } from '@cm/lib/methods/knockEmailApi'

import CarDetailById from '@app/(apps)/QRBP/components/QRBP/forCr/CarDetailById'
import {ColBuilder} from '@app/(apps)/QRBP/class/ColBuilder'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@cm/class/Fields/Fields'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import SimpleTable from '@cm/components/utils/SimpleTable'

import React from 'react'
import useModal from '@cm/components/utils/modal/useModal'
import {PaperLarge} from '@cm/components/styles/common-components/paper'
import {useParams} from 'next/navigation'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import useRecords from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
const PopOverBody = props => {
  const params = useParams() as any
  const {open, handleClose, handleOpen, Modal} = useModal()
  const useGlobalProps: useGlobalPropType = props.useGlobalProps
  const {car, setcarOnModal, activeCars} = props
  const {router, toggleLoad} = useGlobalProps
  const {records, setrecords, mutateRecords, deleteRecord, totalCount} = useRecords({
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
    const {scheduledAt} = car

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
          where: {id: car?.id},
          data: {scheduledAt: formatDate(newDate, 'iso')},
        })
        if (sendEmail) {
          const subject = `BP予定変更通知`
          const text = `下記の車両の予定が変更されました。

【 ${formatDate(car.scheduledAt)}  > > > ${formatDate(newDate)}】
${new BP_Car(car).getCarInfoForEmail()}`
          const to = [car?.User?.email].filter(val => val)
          await knockEmailApi({subject, text, to})
        }
      })
      setcarOnModal(false)
    }
  }

  const DateReflector = () => {
    const columns = Fields.transposeColumns([{id: 'date', label: '拠点日付', type: 'date', form: {}}])
    const {BasicForm, latestFormData} = useBasicFormProps({columns, formData: {date: car.crScheduledAt}})

    return (
      <ShadModal Trigger={<Button className={`bg-error-main`}>拠点反映</Button>}>
        <div className={`p-4`}>
          <BasicForm alignMode="col" latestFormData={latestFormData} onSubmit={reflectCrScheduled}>
            <Button>確定</Button>
          </BasicForm>
        </div>
      </ShadModal>
    )
  }

  return (
    <div className={` t-paper w-[800px] text-start  text-black `} style={{zIndex: 9999}}>
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
            columns: ColBuilder.carForCr({useGlobalProps}),
            useGlobalProps,
            prismaData: {records: [], totalCount: 0, noData: false, loading: false},
            setformData: () => undefined,
            myForm: {
              create: {
                finalizeUpdate: async ({res: updateResult, formData}) => {
                  router.refresh()
                },
              },
            },
            myTable: undefined,
          }}
        />
      </Modal>
      <C_Stack>
        <PaperLarge>
          <SimpleTable
            {...{
              style: {width: 'fit-content'},
              headerArr: ['BP番号', '車名', 'ナンバー', '顧客名', 'CR予定', '拠点予定', '詳細', '拠点反映'],

              bodyArr: [
                [
                  car?.bpNumber,
                  car?.carName,
                  car?.plate,
                  car?.customerName,
                  formatDate(car?.crScheduledAt),

                  formatDate(car?.scheduledAt),
                  <Button color="green" onClick={handleOpen}>
                    詳細
                  </Button>,
                  <DateReflector />,
                ],
              ],
            }}
          />

          <div className={`flex justify-between`}></div>
        </PaperLarge>
        <PaperLarge>
          <R_Stack className={`items-start`}>
            <div className={`t-paper `}>
              <div className={`table-wrapper `}>
                <SimpleTable
                  {...{
                    style: {width: 'fit-content'},
                    headerArr: ['工程', '日時', '作業者'],

                    bodyArr: car?.Process?.map((process, index) => {
                      return [
                        <div className={`p-1 `} style={{...getColorStyles(process?.ProcessNameMaster?.color)}}>
                          {process?.ProcessNameMaster?.name}
                        </div>,
                        <div className={`p-1`}>{formatDate(process?.createdAt)}</div>,
                        <div className={`p-1`}>{process?.User?.name}</div>,
                      ]
                    }),
                  }}
                />
              </div>
            </div>
            <div className={`t-paper `}>
              メモ等
              <div className={`table-wrapper `}>
                <SimpleTable
                  {...{
                    style: {width: 420},
                    headerArr: ['工程', '日時', '作業者', '内容'],
                    bodyArr: car?.Notes?.map((note, index) => {
                      return [
                        <div className={`p-1 `} style={{...getColorStyles(note?.NoteNameMaster?.color)}}>
                          {note?.NoteNameMaster?.name}
                        </div>,
                        <div className={`p-1`}>{formatDate(note?.createdAt)}</div>,
                        <div className={`p-1`}>{note?.User?.name}</div>,
                        <div className={`p-1`}>{note?.content}</div>,
                      ]
                    }),
                  }}
                />
              </div>
            </div>
          </R_Stack>
        </PaperLarge>
      </C_Stack>
    </div>
  )
}

export default PopOverBody
