'use client'
import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import {QueryBuilder} from '@app/(apps)/ucar/class/QueryBuilder'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import {FitMargin} from '@cm/components/styles/common-components/common-components'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

import {ProcessApplicationForm} from '@app/(apps)/ucar/(pages)/create-process/UcarProcessCreateForm/ApplicationForm'
import {atomKey, useJotaiByKey} from '@cm/hooks/useJotai'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

export const UcarProcessCreateForm = ({UcarData, useGlobalProps}) => {
  const {session, query} = useGlobalProps

  const [, setopenClearnUp] = useJotaiByKey<boolean>(`ucarProcessClearnUp` as atomKey, false)

  const {data: stores} = useDoStandardPrisma(`store`, `findMany`, {orderBy: {sortOrder: 'asc'}}, {deps: []})
  const processCode = query.processCode

  const columns = ColBuilder.ucarProcess({
    useGlobalProps,
    ColBuilderExtraProps: {
      carId: UcarData.id,
      sateiID: UcarData.sateiID,
      storeId: UcarData.storeId,
      userId: UcarData.userId,
      processCode: query.processCode,
      stores,
    },
  })

  if (!session || !stores) return <PlaceHolder />

  return (
    <FitMargin className={`p-4`}>
      <BasicTabs
        {...{
          id: 'ucarProcessCreateForm',
          showAll: false,
          TabComponentArray: [
            {
              label: '新規登録',
              component: (
                <ProcessApplicationForm
                  {...{
                    columns,
                    stores,
                    UcarData,
                    useGlobalProps,
                    setopenClearnUp,
                    processCode,
                  }}
                />
              ),
            },
            {
              label: '過去登録情報',
              component: (
                <ChildCreator
                  {...{
                    useGlobalProps,
                    columns: columns,
                    ParentData: UcarData,
                    models: {parent: 'ucar', children: 'ucarProcess'},

                    myForm: {
                      create: {
                        validateUpdate: async () => {
                          return {
                            success: confirm(`工程を登録しますか？`),
                            message: 'ok',
                          }
                        },
                      },
                    },
                    myTable: {
                      create: false,
                      style: {maxWidth: '90vw'},
                    },
                    additional: {
                      where: {
                        sateiID: UcarData.sateiID,
                        ucarId: undefined,
                      },
                      orderBy: [{date: 'asc'}],
                      include: QueryBuilder.getInclude({}).ucarProcess?.include ?? {},
                    },
                  }}
                />
              ),
            },
          ],
        }}
      />
    </FitMargin>
  )
}
