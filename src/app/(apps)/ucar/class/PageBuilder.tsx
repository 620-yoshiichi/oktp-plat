'use client'

import UcarDetail from '@app/(apps)/ucar/class/DetailPage/ucar/UcarDetailForm'

import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {DetailPagePropType} from '@cm/types/types'

import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import {CommonGlobalIdSelector} from '@app/oktpCommon/CommonGlobalIdSelector'
import {UCAR_CONSTANTS} from '@app/(apps)/ucar/(constants)/ucar-constants'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export class PageBuilder {
  static ucarGarageLocationMaster = {
    form: (props: DetailPagePropType) => {
      return (
        <div>
          <C_Stack className={` items-stretch `}>
            <strong>{props.formData?.name}</strong>
            {/* <MyForm
              {...{
                ...props,
                myForm: {
                  ...props.myForm,
                  alignMode: 'row',
                },
              }}
            /> */}

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
                        Ucar: {
                          include: {
                            OldCars_Base: {
                              select: {KI_HANKAKA: true},
                            },
                          },
                        },
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
          </C_Stack>
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
