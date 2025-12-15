'use client'
import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import {QueryBuilder} from '@app/(apps)/ucar/class/QueryBuilder'

import {getTheSameProcess} from '@app/(apps)/ucar/(lib)/server-actions/Ucar-server-actions'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import {Button} from '@cm/components/styles/common-components/Button'
import {FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'

import {arrToLines} from '@cm/components/utils/texts/MarkdownDisplay'

import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'

import {ProcessApplicationForm} from '@app/(apps)/ucar/(pages)/create-process/UcarProcessCreateForm/ApplicationForm'
import {atomKey, useJotaiByKey} from '@cm/hooks/useJotai'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

export const UcarProcessCreateForm = ({UcarData, useGlobalProps}) => {
  const {session, addQuery, router, query} = useGlobalProps
  const ucarId = UcarData.id

  const [openClearnUp, setopenClearnUp] = useJotaiByKey<boolean>(`ucarProcessClearnUp` as atomKey, false)
  const {data: UcarProcess} = useDoStandardPrisma(
    `ucarProcess`,
    `findMany`,
    {
      where: {sateiID: UcarData.sateiID},
    },
    {deps: [ucarId]}
  )

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

  if (!UcarProcess || !session || !stores) return <PlaceHolder />

  const renderClearnUp = () => {
    return (
      <ShadModal open={openClearnUp} onOpenChange={setopenClearnUp}>
        <R_Stack className={`mx-auto gap-[30px]`}>
          <Button
            color="sub"
            onClick={() => {
              setopenClearnUp(false)

              router.back()
            }}
          >
            戻る
          </Button>
        </R_Stack>
      </ShadModal>
    )
  }

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

      {/* <AutoGridContainer className={`gap-16 p-4`} maxCols={{md: 2}}>
        <C_Stack>
          <div className={`text-2xl p-3 rounded bg-blue-500 text-white text-center font-bold w-full`}>新規登録</div>
          <ApplicationForm
            {...{
              columns,
              stores,
              UcarData,
              useGlobalProps,
              setopenClearnUp,
              processCode,
            }}
          />
        </C_Stack>
        <C_Stack>
          <div className={`text-2xl p-3 rounded bg-blue-500 text-white text-center font-bold w-full`}>登録済みの工程一覧</div>
          <div className={`w-fit`}>
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
          </div>
        </C_Stack>
      </AutoGridContainer> */}
    </FitMargin>
  )

  // return (
  //   <div className={`m-2 mx-auto w-fit p-2 `}>
  //     <C_Stack className={` items-start gap-10`}>
  //       <ShadAccordion
  //         {...{
  //           items: [
  //             {
  //               trigger: <div>新規項目</div>,
  //               children: (
  //                 <ApplicationForm
  //                   {...{
  //                     stores,
  //                     UcarData,
  //                     useGlobalProps,
  //                     setopenClearnUp,
  //                     processCode,
  //                   }}
  //                 />
  //               ),
  //             },
  //             {
  //               trigger: <div>工程履歴</div>,
  //               children: (
  //                 <ChildCreator
  //                   {...{
  //                     useGlobalProps,
  //                     columns: columns,
  //                     ParentData: UcarData,
  //                     models: {parent: 'ucar', children: 'ucarProcess'},
  //                     myForm: {
  //                       create: {
  //                         validateUpdate: async () => {
  //                           return {
  //                             success: confirm(`工程を登録しますか？`),
  //                             message: 'ok',
  //                           }
  //                         },
  //                       },
  //                     },
  //                     myTable: {
  //                       create: false,
  //                       style: {maxWidth: 600},
  //                     },
  //                     additional: {
  //                       where: {
  //                         sateiID: UcarData.sateiID,
  //                         ucarId: undefined,
  //                       },
  //                       orderBy: [{date: 'asc'}],
  //                       include: QueryBuilder.getInclude({}).ucarProcess?.include ?? {},
  //                     },
  //                   }}
  //                 />
  //               ),
  //             },
  //           ],
  //         }}
  //       />
  //     </C_Stack>
  //     {renderClearnUp()}
  //   </div>
  // )
}

export const checkIfProcessExists = async ({ucarProcessUpsertPayload, ucar}) => {
  const theSameProcessArr = await getTheSameProcess({
    processCode: ucarProcessUpsertPayload?.processCode,
    ucar: ucar,
  })

  if (theSameProcessArr.length > 0) {
    if (
      !confirm(
        arrToLines([
          `同じ工程が既に登録されていますが、続けて登録してもよろしいですか？`,
          theSameProcessArr
            .map(P => {
              const {date, processCode} = P

              const ProcessCodeItem = UcarProcessCl.CODE.byCode(processCode)

              return '・' + [ProcessCodeItem?.label, formatDate(date)].join('  ')
            })
            .join('\n'),
        ])
      )
    ) {
      return false
    }
  }

  return true
}
