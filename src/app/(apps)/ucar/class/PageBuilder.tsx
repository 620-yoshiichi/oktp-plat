'use client'

import UcarDetail from '@app/(apps)/ucar/class/DetailPage/ucar/UcarDetailForm'

import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {DetailPagePropType} from '@cm/types/types'
import Accordion from '@cm/components/utils/Accordions/Accordion'

import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'

import {CommonGlobalIdSelector} from '@app/oktpCommon/CommonGlobalIdSelector'

export class PageBuilder {
  static ucarGarageLocationMaster = {
    form: (props: DetailPagePropType) => {
      return (
        <div>
          <R_Stack className={` items-start`}>
            <Accordion {...{label: `車庫場所`, closable: false}}>
              <MyForm {...{...props}} />
            </Accordion>
            <Accordion {...{label: `車庫`, closable: false}}>
              <ChildCreator
                {...{
                  ParentData: props.formData ?? {},
                  myTable: {delete: false, create: false, style: {maxHeight: `70vh`}},
                  models: {parent: `ucarGarageLocationMaster`, children: `ucarGarageSlotMaster`},
                  additional: {
                    include: {
                      UcarGarageLocationMaster: {},
                      AppliedUcarGarageSlot: {
                        include: {Ucar: {}},
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
    form: UcarDetail,
  }

  static getGlobalIdSelector = CommonGlobalIdSelector
}
