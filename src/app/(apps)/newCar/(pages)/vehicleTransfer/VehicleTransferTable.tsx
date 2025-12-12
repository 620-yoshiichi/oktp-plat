'use client'
import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {KeyValue} from '@cm/components/styles/common-components/ParameterCard'
import EmptyPlaceholder from '@cm/components/utils/loader/EmptyPlaceHolder'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {cl} from '@cm/lib/methods/common'

import {CarTransferHistory, NewCar} from '@prisma/generated/prisma/client'
import {differenceInDays} from 'date-fns'
import React, {useState} from 'react'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'

export default function VehicleTransferTable({cars}) {
  const [formData, setFormData] = useState<any>(null)

  if (cars.length === 0) {
    return <EmptyPlaceholder>検索結果はありません</EmptyPlaceholder>
  }

  return (
    <>
      {formData && <Form {...{formData, setFormData}} />}
      <Table {...{cars, formData, setFormData}} />
    </>
  )
}

const Table = ({cars, formData, setFormData}) => {
  const CsvTableHK = CsvTable({
    records: cars.map(
      (
        d: NewCar & {
          CarTransferHistory: CarTransferHistory[]
          Store: {name: string}
          User: {name: string}
        }
      ) => {
        const {transferType, CarTransferHistory, DD_LATEST_HAISOU} = d
        const lastHistory = CarTransferHistory[0] as CarTransferHistory

        const within14Days = DD_LATEST_HAISOU && differenceInDays(DD_LATEST_HAISOU, getMidnight()) <= 14

        const beingTransferred = lastHistory?.transferredAt !== null && lastHistory?.recoveredAt === null

        const beingRecovered = lastHistory && lastHistory?.recoveredAt !== null

        const rowColor = cl(within14Days && beingTransferred ? `bg-red-200` : beingRecovered ? `bg-green-200` : ``)

        return {
          className: cl(`hover:opacity-60 cursor-pointer `, formData?.newCarId === d.id ? `bg-yellow-200` : ``, rowColor),
          onClick: e => {
            setFormData({
              newCarId: d.id,
              transferType: d.transferType,
              lastHistory,
            })
          },
          csvTableRow: [
            {label: `注文番号`, cellValue: d.NO_CYUMON},
            {
              label: `型式\nフレーム`,
              cellValue: (
                <>
                  <KeyValue label="">{d.MJ_HANTENKT}</KeyValue>
                  <KeyValue label="">{d.NO_FRAME}</KeyValue>
                </>
              ),
            },
            {
              label: `車名\nお客様`,
              cellValue: (
                <>
                  <KeyValue label="">{d.KJ_KURUMAME}</KeyValue>
                  <KeyValue label="">{d.KJ_MEIGIME1}</KeyValue>
                </>
              ),
            },

            {
              label: `店舗\nスタッフ`,
              cellValue: (
                <>
                  <KeyValue label="">{d.Store.name}</KeyValue>
                  <KeyValue label="">{d.User.name}</KeyValue>
                </>
              ),
            },

            {
              label: `登録予定`,
              cellValue: (
                <>
                  <KeyValue label="見込み">{formatDate(d.m1_toroku_prediction, `.YY年M月`)}</KeyValue>
                  <KeyValue label="承認">{formatDate(d.lastApprovedDesiredTorokuDate, `short`)}</KeyValue>
                </>
              ),
            },

            {
              label: `登録実績\n振当`,
              cellValue: (
                <>
                  <KeyValue label="">{formatDate(d.DD_TOUROKU, `short`)}</KeyValue>
                  <KeyValue label="">{formatDate(d.DD_FR, `short`)}</KeyValue>
                </>
              ),
            },
            {
              label: `移動可否`,
              cellValue: transferType,
            },
            {label: `配送`, cellValue: formatDate(d.DD_LATEST_HAISOU, `short`)},
            {
              label: `移動先\n移動日\nai21入力`,
              style: {width: 130},
              cellValue: (
                <div>
                  {lastHistory?.transferredAt && (
                    <small className={`row-stack flex-nowrap gap-0.5`}>
                      <span>{lastHistory.location}</span>
                      <span>{formatDate(lastHistory.transferredAt, 'short')}</span>
                      <span>
                        <IconBtn color={lastHistory.transferConfirmedOnAi21 ? 'green' : 'red'}>
                          {lastHistory.transferConfirmedOnAi21 ? '済' : '未'}
                        </IconBtn>
                      </span>
                    </small>
                  )}
                </div>
              ),
            },
            {
              label: `CR回収日\nai21入力`,
              style: {width: 130},
              cellValue: (
                <div>
                  {lastHistory?.recoveredAt && (
                    <small className={`row-stack flex-nowrap gap-0.5`}>
                      <span>{formatDate(lastHistory.recoveredAt, 'short')}</span>
                      <IconBtn color={lastHistory.recoveredConfirmedOnAi21 ? 'green' : 'red'}>
                        {lastHistory.transferConfirmedOnAi21 ? '済' : '未'}
                      </IconBtn>
                    </small>
                  )}
                </div>
              ),
            },
            {label: `備考`, cellValue: <MarkDownDisplay className={`text-sm`}>{lastHistory?.remarks}</MarkDownDisplay>},
          ],
        }
      }
    ),
  })

  return (
    <>
      {<CsvTableHK.Downloader />}
      <small>上位{cars.length}件を表示</small>
      {CsvTableHK.WithWrapper({className: `max-h-[70vh] t-paper`})}
    </>
  )
}

const Form = ({formData, setFormData}) => {
  const {toggleLoad} = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    formData: {
      ...formData?.lastHistory,
      transferType: formData?.transferType,
    },
    columns: new Fields([
      //
      ...new Fields([
        {
          id: `transferType`,
          label: `移動可能`,
          forSelect: {
            optionsOrOptionFetcher: [
              {label: `可能`, value: `可能`},
              {label: `不可`, value: `不可`},
            ],
          },
        },
        {
          id: `location`,
          label: `移動先`,
          form: {},
          forSelect: {
            optionsOrOptionFetcher: NEW_CAR_CONST.CAR_TRANSFER.CAR_TRANSFER_HISTORY_LOCATIONS,
          },
        },
        {
          id: `transferredAt`,
          label: `移動日`,
          form: {},
          type: `date`,
        },
        {
          id: `transferConfirmedOnAi21`,
          label: `移動日ai21入力`,
          form: {},
          type: `boolean`,
        },
      ]).buildFormGroup({groupName: `移動`}).plain,

      ...new Fields([
        {
          id: `recoveredAt`,
          label: `回収日`,
          form: {},
          type: `date`,
        },
        {
          id: `recoveredConfirmedOnAi21`,
          label: `回収日ai21入力`,
          form: {},
          type: `boolean`,
        },
      ]).buildFormGroup({groupName: `回収`}).plain,
      ...new Fields([
        {
          id: `remarks`,
          label: `備考`,
          form: {},
          type: `textarea`,
        },
      ]).buildFormGroup({groupName: `備考`}).plain,
    ]).transposeColumns(),
  })
  return (
    <ShadModal
      {...{
        alertOnClose: true,
        open: formData,
        onOpenChange: () => setFormData(null),
      }}
    >
      <div className={` `}>
        <BasicForm
          {...{
            alignMode: 'rowBlock',
            latestFormData,
            onSubmit: async data => {
              toggleLoad(async () => {
                const {
                  location,
                  transferredAt,
                  transferConfirmedOnAi21,
                  recoveredAt,
                  recoveredConfirmedOnAi21,
                  remarks,
                  transferType,
                } = data
                const newCarId = formData.newCarId

                const {result: lastHistoryInDB} = await doStandardPrisma(`carTransferHistory`, `findFirst`, {
                  where: {newCarId},
                })

                const create = {
                  location,
                  transferredAt,
                  transferConfirmedOnAi21,
                  recoveredAt,
                  recoveredConfirmedOnAi21,
                  remarks,
                  newCarId,
                }

                const res = await doStandardPrisma(`carTransferHistory`, `upsert`, {
                  where: {id: lastHistoryInDB?.id ?? 0},
                  create: create,
                  update: create,
                })

                await doStandardPrisma(`newCar`, `update`, {
                  where: {id: newCarId},
                  data: {transferType},
                })

                toastByResult(res)
                setFormData(null)
              })
            },
          }}
        >
          <Button>確定</Button>
        </BasicForm>
      </div>
    </ShadModal>
  )
}
