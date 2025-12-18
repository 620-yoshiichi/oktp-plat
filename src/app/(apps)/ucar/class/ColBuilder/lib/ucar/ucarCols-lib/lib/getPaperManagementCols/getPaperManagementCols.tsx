import {Fields} from '@cm/class/Fields/Fields'

import InlineGarageEditor from '../../InlineGarageEditor'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {FubiActionTrigger} from '@app/(apps)/ucar/(pages)/paperProcess/Summay/UcarAlertButtonSummay'

export const getPaperManagementCols = ({
  UseRecordsReturn,
  isChukoshaGroup,
}: {
  UseRecordsReturn: any
  isChukoshaGroup?: boolean
}) => {
  const acceptProcessCols = new Fields([
    ...new Fields([
      {id: 'arrivedAt', label: '本部着', type: `date`, form: {}},

      {
        id: 'purchaseType',
        label: '下/買区分',
        forSelect: {
          codeMaster: UCAR_CODE.PURCHASE_TYPES,
        },

        // format: (value, row) => {
        //   const purchaseTypeOption = UCAR_CODE.PURCHASE_TYPES.byCode(row['purchaseType'])
        //   const processedAsOption = UCAR_CODE.PROCESSED_AS.byCode(row['processedAs'])
        //   return (
        //     <R_Stack className={`text-xs gap-0.5 flex-nowrap  justify-between `}>
        //       <Coloring mode="text" className={`text-xs p-0.5`} color={purchaseTypeOption?.color}>
        //         {purchaseTypeOption?.label}
        //       </Coloring>
        //       <Coloring mode="text" className={`text-xs p-0.5`} color={processedAsOption?.color}>
        //         {processedAsOption?.label}
        //       </Coloring>
        //     </R_Stack>
        //   )
        // },
      },
      {
        id: 'processedAs',
        label: '名抹区分',
        forSelect: {
          codeMaster: UCAR_CODE.PROCESSED_AS,
        },
      },

      {
        id: 'meihenBi',
        label: '名変日',
        type: 'date',
        form: {},
      },
      {
        id: 'masshoBi',
        label: '抹消日',
        type: 'date',
        form: {},
      },

      {
        id: 'secondMeihenbi',
        label: '二次登録日',
        type: 'date',
        form: {},
      },
      {
        id: `remarksHq`,
        label: `本部メモ`,
        type: `textarea`,
        format: (value, row) => <span className={`text-xs`}>{row.remarksHq}</span>,
      },
    ]).buildFormGroup({groupName: `抹消・名義変更`}).plain,
  ])
    .showSummaryInTd({wrapperWidthPx: 200, editable: isChukoshaGroup})
    .buildFormGroup({groupName: `書類基本情報`})

  const processeFinishedCols = new Fields([
    ...new Fields([
      //td非表示
      {
        id: 'inkanAlternate',
        label: '印鑑別記',
        forSelect: {
          codeMaster: UCAR_CODE.INKAN_ALTERNATES,
        },
        // td: {hidden: true},
      },
      {
        id: 'inkanCertificateExpiredAt',
        label: '印鑑証明期限',
        type: 'date',
        // td: {hidden: true},
      },
      {
        id: 'inspectionAlternate',
        label: '車検別記',
        forSelect: {
          codeMaster: UCAR_CODE.INSPECTION_ALTERNATE,
        },
        // td: {hidden: true},
      },
      {
        id: 'inspectionExpiredAt',
        label: '車検日',
        type: 'date',
        // td: {hidden: true},
      },

      //表示用

      // {
      //   id: '車検証',
      //   form: {hidden: true},
      //   label: '車検証',
      //   format: (value, row) => {
      //     const inspectionAlternateOption = UCAR_CODE.INSPECTION_ALTERNATE.byCode(row.inspectionAlternate)

      //     return (
      //       <R_Stack className={`text-xs w-full gap-0.5`}>
      //         <Coloring mode="text" className={`text-xs`} color={inspectionAlternateOption?.color}>
      //           {inspectionAlternateOption?.label}
      //         </Coloring>
      //         <span>{formatDate(row.inspectionExpiredAt)}</span>
      //       </R_Stack>
      //     )
      //   },
      // },

      // {
      //   id: '印鑑証明',
      //   form: {hidden: true},
      //   label: '印鑑証明',
      //   format: (value, row) => {
      //     const inkanAlternateOption = UCAR_CODE.INKAN_ALTERNATES.byCode(row.inkanAlternate)
      //     return (
      //       <R_Stack className={`text-xs w-full gap-0.5`}>
      //         <Coloring mode="text" className={`text-xs`} color={inkanAlternateOption?.color}>
      //           {inkanAlternateOption?.label}
      //         </Coloring>
      //         <span>{formatDate(row.inkanCertificateExpiredAt)}</span>
      //       </R_Stack>
      //     )
      //   },
      // },
      {
        id: 'fubi',
        label: '不備通知',
        type: 'date',
        form: {hidden: true},
        format: (value, row) => {
          return (
            <FubiActionTrigger
              {...{
                UcarData: row,
                mutateRecords: UseRecordsReturn.mutateRecords,
              }}
            />
          )
        },
      },
      {
        id: 'garageCreateor',
        label: '車庫証明',
        type: 'date',
        form: {hidden: true},
        format: (value, row) => {
          return <InlineGarageEditor row={row} />
        },
      },
    ]).buildFormGroup({groupName: `印鑑証明/車検`}).plain,
  ]).showSummaryInTd({
    wrapperWidthPx: 200,
    editable: isChukoshaGroup,
  })

  const colArr = {acceptProcessCols, processeFinishedCols}

  return colArr
}
