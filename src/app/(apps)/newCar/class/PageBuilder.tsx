'use client'

import {ColBuilder} from '@app/(apps)/newCar/class/Colbuilder/ColBuilder'
import DesiredTorokuDateChildCreator from '@app/(apps)/newCar/(parts)/DesiredTorokuDate/DesiredTorokuDateChildCreator'

import {roleMaster} from '@cm/class/builders/PageBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper, Wrapper} from '@cm/components/styles/common-components/paper'
import {LabelValue} from '@cm/components/styles/common-components/ParameterCard'
import Accordion from '@cm/components/utils/Accordions/Accordion'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {DetailPagePropType} from '@cm/types/types'
import {Alert} from '@cm/components/styles/common-components/Alert'
import useSWR from 'swr'

import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {Button} from '@cm/components/styles/common-components/Button'
import {fieldNameKeyValueMapping} from '@app/(apps)/newCar/class/ProgressReport/(lib)/getWheres'
import {get_progressReportQ_additionalWhere} from '@app/(apps)/newCar/(pages)/[dataModelName]/get_progressReportQ_additionalWhere'
import {usetorokuDateApplicationModal} from '@app/(apps)/newCar/templateHooks/usetorokuDateApplicationModal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {CommonGlobalIdSelector} from '@app/oktpCommon/CommonGlobalIdSelector'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

export class PageBuilder {
  static desiredTorokuDate = {
    form: (props: DetailPagePropType) => {
      const {setGMF_OPEN: settorokuDateApplicationFormOpen} = usetorokuDateApplicationModal()
      const {useGlobalProps} = props
      const newCarId = props?.formData?.newCarId
      const History = ({newCarId}) => {
        const {data: newCar = {}} = useDoStandardPrisma(`newCar`, `findUnique`, {
          where: {id: newCarId},
          include: {
            DesiredTorokuDate: {},
          },
        })
        const styling = {styles: {wrapper: {width: 400}, label: {width: 80}}}
        return (
          <C_Stack>
            <section>
              <LabelValue
                {...{
                  styling,
                  value: newCar[`APPINDEX`],
                  label: `管理No`,
                }}
              />
              <LabelValue
                {...{
                  styling,
                  value: newCar[`NO_CYUMON`],
                  label: `注文No`,
                }}
              />
              <LabelValue
                {...{
                  styling,
                  value: newCar[`KJ_KURUMAME`],
                  label: `車名`,
                }}
              />
              <LabelValue
                {...{
                  styling,
                  value: newCar[`MJ_HANTENKT`],
                  label: `販売店型式`,
                }}
              />
              <LabelValue
                {...{
                  styling,
                  value: newCar[`NO_FRAME`],
                  label: `フレームNo`,
                }}
              />
            </section>

            <section>
              <DesiredTorokuDateChildCreator
                {...{
                  settorokuDateApplicationFormOpen,
                  newCar,
                  additionalWhere: {},
                }}
              />
            </section>
          </C_Stack>
        )
      }

      return (
        <div>
          <R_Stack className={` items-start`}>
            {!!newCarId && (
              <Accordion {...{label: `過去の申請履歴`, defaultOpen: true, closable: false}}>
                <Paper>
                  <History {...{newCarId}} />
                </Paper>
              </Accordion>
            )}

            <Accordion {...{label: `申請状況`, defaultOpen: true, closable: false}}>
              <Paper>
                <MyForm {...props} />
              </Paper>
            </Accordion>
          </R_Stack>
        </div>
      )
    },
  }
  static roleMaster = roleMaster
  static newCar = {
    top: (props: DetailPagePropType) => {
      const {toggleLoad, addQuery, query, accessScopes} = props.useGlobalProps
      const newCarWhere = accessScopes().getNewCarProps().newCarWhere

      const ProgressReportQ = () => {
        if (query[`progressReportQ`]) {
          const {data} = useSWR(`/`, async () => {
            return await get_progressReportQ_additionalWhere({query, newCarWhere})
          })

          const {month, theCondition, fieldName} = data ?? {}

          const [timing, type] = String(fieldNameKeyValueMapping[fieldName]).split(`_`)

          const displayValue = (
            <R_Stack>
              <Button
                {...{
                  onClick: () => addQuery({progressReportQ: undefined}),
                  color: `red`,
                }}
              >
                絞り込み解除
              </Button>
              書類回収進捗
              <IconBtn>{formatDate(month, 'YYYY年MM月')}</IconBtn>月
              {timing && (
                <>
                  <IconBtn>{timing}</IconBtn>の
                </>
              )}
              {type && <IconBtn>{type}</IconBtn>}
              データを表示しています
            </R_Stack>
          )

          return (
            <Alert color={`red`}>
              <R_Stack className={`text-error-main`}>{displayValue}</R_Stack>
            </Alert>
          )
        }
        return <></>
      }

      const MikomiS = () => {
        if (query[`mikomiS`]) {
          const [storeIdStr, monthLabel, theFourSourceLabel, dataLabel, jpLabel, storeName] = query[`mikomiS`].split(`__`)

          const displayValue = (
            <R_Stack>
              <Button
                {...{
                  onClick: () => addQuery({mikomiS: undefined}),
                  color: `red`,
                }}
              >
                絞り込み解除
              </Button>
              書類回収進捗
              {storeName && <IconBtn>{storeName}</IconBtn>}
              {monthLabel && <IconBtn>{monthLabel}</IconBtn>}
              {jpLabel && <IconBtn>{jpLabel}</IconBtn>}
              データを表示しています
            </R_Stack>
          )

          return (
            <Alert color={`red`}>
              <R_Stack className={`text-error-main`}>{displayValue}</R_Stack>
            </Alert>
          )
        }
        return <></>
      }

      const Swither = () => {
        const {BasicForm, latestFormData} = useBasicFormProps({
          onFormItemBlur: props => {
            addQuery(props.newlatestFormData)
          },
          formData: query,
          columns: new Fields([
            //
            {
              id: `showNosya`,
              label: `納車済`,
              form: {defaultValue: false},
              type: `boolean`,
            },
            {
              id: `orderBy`,
              label: `並び替え`,
              form: {...defaultRegister},
              forSelect: {
                optionsOrOptionFetcher: [
                  {id: 'NO_CYUMON', label: '注文番号'},
                  {id: 'DD_JUCYU', label: '受注日'},
                  {id: 'CUSTOM_DD_SEISANYOTEI', label: '生産予定日'},
                  {id: 'DD_FR', label: '振当日'},
                  {id: 'DD_TOUROKU', label: '登録日'},
                  {id: 'DD_NOSYA', label: '納車日'},
                ],
              },
            },
            {
              id: `orderDirection`,
              label: `並び順`,
              form: {...defaultRegister},
              forSelect: {
                optionsOrOptionFetcher: [
                  {id: 'asc', label: '過去から（昇順）'},
                  {id: 'desc', label: '最新から（降順）'},
                ],
              },
            },
          ]).transposeColumns(),
        })
        return (
          <>
            <BasicForm {...{latestFormData, alignMode: `row`}} />
          </>
        )
      }

      return (
        <div className={``}>
          {query[`progressReportQ`] && (
            <Wrapper className={` w-fit `}>
              <ProgressReportQ />
            </Wrapper>
          )}

          {query[`mikomiS`] && (
            <Wrapper className={` w-fit `}>
              <MikomiS />
            </Wrapper>
          )}

          <Wrapper className={` w-fit `}>
            <Swither />
          </Wrapper>
        </div>
      )
    },
    form: (props: DetailPagePropType) => {
      const {useGlobalProps} = props
      return (
        <div>
          <R_Stack className={` items-start`}>
            <Accordion {...{label: `注文情報`, defaultOpen: true, closable: false}}>
              <Paper>
                <MyForm {...props} />
              </Paper>
            </Accordion>
            <Accordion {...{label: `登録希望日申請`, defaultOpen: true, closable: false}}>
              <Paper>
                <ChildCreator
                  {...{
                    ParentData: props?.formData ?? {},
                    models: {parent: `newCar`, children: `desiredTorokuDate`},
                    columns: ColBuilder.desiredTorokuDate({useGlobalProps}),
                    useGlobalProps,
                    myTable: {
                      delete: false,
                      update: false,
                    },
                    additional: {
                      orderBy: [{id: `desc`}],
                    },
                  }}
                />
              </Paper>
            </Accordion>
          </R_Stack>
        </div>
      )
    },
  }

  static getGlobalIdSelector = CommonGlobalIdSelector
}
