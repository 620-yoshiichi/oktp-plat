import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {ColBuilder} from '@app/(apps)/QRBP/class/ColBuilder'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
IconBtn
import {LabelValue} from '@cm/components/styles/common-components/ParameterCard'

import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobalOrigin'
import {Paper} from '@cm/components/styles/common-components/paper'
import {updateSimply} from '@cm/lib/formMethods/updateSimply'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

export default function CarProcessChildCreator({formData: car, useGlobalProps}) {
  const {session, toggleLoad, accessScopes} = useGlobalProps as useGlobalPropType

  const columns = ColBuilder.processForCertainCar({
    useGlobalProps,
    ColBuilderExtraProps: {
      car,
    },
  })

  const keyValues = [
    {key: 'BP番号', value: car.bpNumber},
    {key: '車名', value: car.carName},
    {key: 'プレート', value: car.plate},
    {key: 'お客様', value: car.customerName},
  ]

  const maxWidth = '80vw'
  const width = 400

  return (
    <C_Stack className={`items-center gap-2`}>
      <Paper>
        <R_Stack className={`max-w-[400px] items-start gap-0 gap-y-1 p-0.5`}>
          {keyValues.map(key => {
            const {key: keyName, value} = key
            return (
              <div key={keyName} className={`w-1/2`}>
                <LabelValue {...{label: keyName}}>{value}</LabelValue>
                {/* <ParameterCard
                  styling={{
                    styles: {
                      wrapper: {
                        padding: `0 10px`,
                        width: 130,
                      },
                    },
                  }}
                  label={keyName}
                  value={value}
                /> */}
              </div>
            )
          })}
        </R_Stack>
      </Paper>

      <Paper>
        <ChildCreator
          {...{
            useGlobalProps,
            ParentData: car,
            models: {parent: 'car', children: 'process'},
            columns,

            myForm: {
              alignMode: 'console',
              showHeader: formData => (
                <div className={`w-fit`}>
                  <small className={`row-stack gap-x-1`}>
                    <IconBtn>{car.bpNumber} </IconBtn>
                    <IconBtn>{car.carName} </IconBtn>
                    <IconBtn>{car.customerName}</IconBtn>
                  </small>
                  <hr />
                </div>
              ),
              create: {
                executeUpdate: async ({latestFormData}) => {
                  const isUpdate = latestFormData?.id !== 0
                  if (isUpdate && !accessScopes().getQrbpProps().cr) {
                    alert('工程の上書きはできません')
                    return
                  }

                  const res = await toggleLoad(
                    async () => {
                      // 車両のupdatedAtも更新をかける
                      await doStandardPrisma('car', 'update', {
                        where: {id: car.id},
                        data: {processLastUpdatedAt: formatDate(new Date(), 'iso')},
                      })

                      const res = await updateSimply({
                        extraFormState: {},
                        dataModelName: 'process',
                        columns,
                        latestFormData,
                        additionalPayload: {
                          carId: car.id,
                          storeId: car?.storeId,
                        },
                        initialModelData: car,
                        additionalInclude: {
                          Car: {},
                          ProcessNameMaster: {},
                          User: {},
                        },
                      })

                      const washProcess = await BP_Car.getProcessNameMasterByName('洗車')
                      // const completionProcess = await BP_Car.getProcessNameMasterByName('作業完了')

                      /**自動で作業完了をつけるフラグ */
                      const setWashProcess =
                        washProcess.id === latestFormData.processNameMasterId && !new BP_Car(car).findProcessByName('作業完了')

                      if (setWashProcess) {
                        const res = await new BP_Car(car).setProcess(session, '作業完了', false)
                        return res
                      }

                      return res
                    },
                    {refresh: true, mutate: true}
                  )
                  return res
                },
              },
            },

            myTable: {
              style: {maxHeight: '45vh', maxWidth, width},
            },
            additional: {
              toggleLoadFunc: async cb => {
                return await toggleLoad(cb, {refresh: true, mutate: true})
              },
              orderBy: BP_Car.const.ProcessOrderBy,
              include: {
                Car: {},
                ProcessNameMaster: {},
                User: {},
              },
            },
            nonRelativeColumns: [],
          }}
        />
      </Paper>
    </C_Stack>
  )
}
