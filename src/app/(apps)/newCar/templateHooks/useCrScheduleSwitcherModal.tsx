import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'

import {Fields} from '@cm/class/Fields/Fields'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Button} from '@cm/components/styles/common-components/Button'
import {ColoredText} from '@cm/components/styles/common-components/colors'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'
import {TableBordered, TableWrapper} from '@cm/components/styles/common-components/Table'
import Accordion from '@cm/components/utils/Accordions/Accordion'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {atomTypes} from '@cm/hooks/useJotai'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'

export const useCrScheduleSwitcherModal = () => {
  return useGlobalModalForm<atomTypes[`crScheduleSwitcherModal`]>(`crScheduleSwitcherModal`, null, {
    mainJsx: props => {
      const {session, toggleLoad} = useGlobal()
      const {theCar, lastHistory} = props.GMF_OPEN
      return (
        <R_Stack className={`items-start gap-8`}>
          <Accordion {...{label: `変更`, defaultOpen: true, closable: false}}>
            <Form {...{theCar, lastHistory, close: props.close, session, toggleLoad}} />
          </Accordion>

          <Accordion {...{label: `変更履歴`, defaultOpen: true, closable: false}}>
            <HistoryTable {...{theCar}} />
          </Accordion>
        </R_Stack>
      )
    },
  })
}

const Form = ({theCar, lastHistory, close, session, toggleLoad}) => {
  const onSubmit = async data => {
    toggleLoad(
      async () => {
        const payload = {
          NewCar: {connect: {id: theCar.id}},
          User: {connect: {id: session?.id}},
          status: data.status,
          date: data.date,
        }

        const historyCreateRes = await doStandardPrisma(`crInspectionHistory`, `create`, {
          data: payload,
        })

        toastByResult(historyCreateRes)
        close()
      },
      {refresh: true}
    )
  }

  const {BasicForm, latestFormData} = useBasicFormProps({
    // formData: lastHistory,
    columns: new Fields([
      {
        id: `status`,
        label: `区分`,
        form: {...defaultRegister, defaultValue: theCar.DD_TOUROKU ? `着工` : undefined},
        forSelect: {
          optionsOrOptionFetcher: NEW_CAR_CONST.CR_OPERATION.STATUS_COLORS,
        },
      },
      {
        id: `date`,
        label: `着工予定日`,
        type: `date`,
        form: {defaultValue: theCar.DD_TOUROKU ? getMidnight() : undefined},
      },
      {id: ``, label: `入力者`},
    ]).transposeColumns(),
  })

  return (
    <BasicForm onSubmit={onSubmit} latestFormData={latestFormData}>
      <Button>確定</Button>
    </BasicForm>
  )
}

const HistoryTable = ({theCar}) => {
  const {data: CrInspectionHistory} = useDoStandardPrisma(`crInspectionHistory`, `findMany`, {
    where: {NewCar: {id: theCar.id}},
    orderBy: {createdAt: `desc`},
    include: {
      User: true,
    },
  })

  if (!CrInspectionHistory) return <PlaceHolder />
  const TABLE = CsvTable({
    records: CrInspectionHistory.map(d => {
      const master: any = NEW_CAR_CONST.CR_OPERATION.STATUS_COLORS.find(s => s.value === d?.status) ?? {}

      return {
        csvTableRow: [
          {label: '変更日', cellValue: formatDate(d.createdAt, 'MM/DD(ddd)')},
          {label: '区分', cellValue: <ColoredText {...{bgColor: master.color}}>{master?.value}</ColoredText>},
          {label: '着工日', cellValue: formatDate(d.date, 'MM/DD(ddd)')},
          {label: '変更者', cellValue: d?.User?.name},
        ],
      }
    }),
  })
  return (
    <TableWrapper>
      <TableBordered>{TABLE.WithWrapper({})}</TableBordered>
    </TableWrapper>
  )
}
