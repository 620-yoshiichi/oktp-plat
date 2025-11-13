'use client'

import {C_Stack} from '@cm/components/styles/common-components/common-components'

import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

import {DetailPagePropType} from '@cm/types/types'
import {makeChildCreatorProps} from '@app/(apps)/shinren/class/PageBuilder'
import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

const RentaDailyReportDetailPage = (props: DetailPagePropType) => {
  const {formData, useGlobalProps} = props
  const {pathname, query, rootPath} = useGlobalProps
  const dailyReort = formData ?? {}

  const isEditMode = !!dailyReort.id

  const TabComponentArray = [
    {label: '日報', component: <MyForm {...{...props}} />},

    {
      exclusiveTo: isEditMode,
      label: '代替予定',
      component: (
        <ChildCreator
          {...{
            ParentData: dailyReort,
            models: {
              parent: 'rentaDailyReport',
              children: 'alternateInfo',
            },
            ...makeChildCreatorProps({
              dailyReort,
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
            ParentData: dailyReort,
            models: {
              parent: 'rentaDailyReport',
              children: 'insuranceInfo',
            },
            ...makeChildCreatorProps({
              dailyReort,
              useGlobalProps,
              childrenModelName: 'insuranceInfo',
            }),
          }}
        />
      ),
    },

    {
      exclusiveTo: isEditMode,
      label: '顧客記録',
      component: (
        <>
          <C_Stack>
            <ChildCreator
              {...{
                ParentData: dailyReort?.RentaCustomer,
                models: {
                  parent: 'rentaCustomer',
                  children: 'extraInfo',
                },
                ...makeChildCreatorProps({
                  dailyReort,
                  useGlobalProps,
                  childrenModelName: 'extraInfo',
                }),
              }}
            />
          </C_Stack>
        </>
      ),
    },
  ]

  return (
    <C_Stack className={`mx-auto max-w-3xl gap-4 `}>
      <BasicTabs
        {...{
          id: 'RentaDailyReportDetailPage',
          showAll: false,
          TabComponentArray,
        }}
      />
    </C_Stack>
  )
}

export default RentaDailyReportDetailPage
