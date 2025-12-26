'use client'

import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {DetailPagePropType} from '@cm/types/types'

import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import {CommonGlobalIdSelector} from '@app/oktpCommon/CommonGlobalIdSelector'
import {roleMaster} from '@cm/class/builders/PageBuilderVariables'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'

export class PageBuilder {
  static roleMaster = roleMaster
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
    top: (props: DetailPagePropType) => {
      const {query, addQuery} = props.useGlobalProps
      const {BasicForm, latestFormData} = useBasicFormProps({
        columns: new Fields([
          //
          {
            id: `__search__sateiID`,
            label: `査定ID`,
            inputProps: {placeholder: ''},
            form: {defaultValue: query.__search__sateiID},
          },
          {
            id: `__search__number98`,
            label: `98番号`,
            inputProps: {placeholder: '5桁の番号'},
            form: {defaultValue: query.__search__number98},
          },
        ]).transposeColumns(),
      })
      return (
        <BasicForm
          {...{
            alignMode: 'row',
            latestFormData,
            ControlOptions: {
              ControlStyle: {
                width: 120,
                fontSize: 12,
                height: 24,
              },
            },
            onSubmit: async data => {
              const {__search__sateiID, __search__number98} = data
              addQuery({__search__sateiID, __search__number98})
            },
          }}
        >
          <Button size="sm">検索</Button>
        </BasicForm>
      )
      return <div></div>
    },
  }

  static getGlobalIdSelector = CommonGlobalIdSelector
}
