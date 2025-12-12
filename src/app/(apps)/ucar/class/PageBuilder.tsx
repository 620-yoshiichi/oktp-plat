'use client'

import UcarDetail from '@app/(apps)/ucar/class/DetailPage/ucar/UcarDetailForm'

import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {DetailPagePropType} from '@cm/types/types'
import Accordion from '@cm/components/utils/Accordions/Accordion'

import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'

import {CommonGlobalIdSelector} from '@app/oktpCommon/CommonGlobalIdSelector'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export class PageBuilder {
  static ucarGarageLocationMaster = {
    form: (props: DetailPagePropType) => {
      return (
        <div>
          <R_Stack className={` items-start`}>
            <Accordion {...{label: `車庫場所`, closable: false}}>
              <MyForm
                {...{
                  ...props,
                  myForm: {
                    ...props.myForm,
                    alignMode: 'row',
                  },
                }}
              />
            </Accordion>
            <Accordion {...{label: `車庫`, closable: false}}>
              <ChildCreator
                {...{
                  ParentData: props.formData ?? {},
                  myTable: {
                    delete: false,
                    create: false,
                    style: {maxHeight: undefined},
                  },
                  models: {parent: `ucarGarageLocationMaster`, children: `ucarGarageSlotMaster`},
                  additional: {
                    orderBy: [{garageNumber: 'asc'}],
                    include: {
                      UcarGarageLocationMaster: {},
                      AppliedUcarGarageSlot: {
                        include: {
                          Ucar: {},
                        },
                      },
                    },
                  },
                  columns: ColBuilder.ucarGarageSlotMaster({
                    ...props,
                  }),
                  useGlobalProps: props.useGlobalProps,
                }}
              />
            </Accordion>
          </R_Stack>
        </div>
      )
    },
  }
  static ucar = {
    top: () => (
      <div>
        フィルターは：「本部着」が
        <span className={`font-bold text-red-500`}>{formatDate(UCAR_CONSTANTS.commonQuery.THRESHOLD_DATE)}</span>
        以降のものにのみ適用されます。
      </div>
    ),
    form: UcarDetail,
  }

  static getGlobalIdSelector = CommonGlobalIdSelector
}
