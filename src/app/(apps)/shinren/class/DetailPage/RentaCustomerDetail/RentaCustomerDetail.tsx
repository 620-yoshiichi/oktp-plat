'use client'

import {C_Stack} from '@cm/components/styles/common-components/common-components'

import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

import {DetailPagePropType} from '@cm/types/types'
import {makeChildCreatorProps} from '@app/(apps)/shinren/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/shinren/class/ColBuilder'
import {QueryBuilder} from '@app/(apps)/shinren/class/QueryBuilder'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import ReferenceTable from '@app/(apps)/shinren/class/DetailPage/RentaCustomerDetail/ReferenceTable'

const RentaCustomerDetail = (props: DetailPagePropType) => {
  const {formData, useGlobalProps} = props
  const {toggleLoad, query} = useGlobalProps
  const rentaCustomer = formData ?? {}
  const isEditMode = !!rentaCustomer?.id

  return (
    <div>
      <BasicTabs
        {...{
          id: 'rentaCustomerDetail',
          showAll: false,

          TabComponentArray: [
            {label: '基本情報', component: <MyForm {...{...props}} />},

            {
              exclusiveTo: isEditMode,
              label: '代替予定',
              component: (
                <ChildCreator
                  {...{
                    ParentData: rentaCustomer,
                    models: {
                      parent: 'rentaCustomer',
                      children: 'alternateInfo',
                    },
                    ...makeChildCreatorProps({
                      dailyReort: undefined,
                      rentaCustomer,
                      useGlobalProps,
                      childrenModelName: 'alternateInfo',
                    }),
                  }}
                />
              ),
            },
            {
              exclusiveTo: isEditMode,
              label: '保険情報',
              component: (
                <ChildCreator
                  {...{
                    ParentData: rentaCustomer,
                    models: {
                      parent: 'rentaCustomer',
                      children: 'insuranceInfo',
                    },
                    ...makeChildCreatorProps({
                      dailyReort: undefined,
                      rentaCustomer,
                      useGlobalProps,
                      childrenModelName: 'insuranceInfo',
                    }),
                  }}
                />
              ),
            },

            {
              label: '顧客記録',
              component: (
                <>
                  <C_Stack>
                    <ChildCreator
                      {...{
                        ParentData: rentaCustomer,
                        models: {
                          parent: 'rentaCustomer',
                          children: 'extraInfo',
                        },
                        ...makeChildCreatorProps({
                          dailyReort: undefined,
                          rentaCustomer,
                          useGlobalProps,
                          childrenModelName: 'extraInfo',
                        }),
                      }}
                    />
                  </C_Stack>
                </>
              ),
            },
            {
              label: '日報一覧',
              component: (
                <ChildCreator
                  {...{
                    additional: {
                      include: QueryBuilder.getInclude({...useGlobalProps}).rentaDailyReport.include,
                    },
                    ParentData: rentaCustomer,
                    models: {
                      parent: 'rentaCustomer',
                      children: 'rentaDailyReport',
                    },
                    useGlobalProps,
                    columns: ColBuilder.rentaDailyReport({useGlobalProps}),
                  }}
                />
              ),
            },
            {
              label: '紹介/被紹介',
              component: <ReferenceTable {...{rentaCustomer, formData, useGlobalProps, toggleLoad, query}} />,
            },
          ],
        }}
      />
    </div>
  )
}
export default RentaCustomerDetail
