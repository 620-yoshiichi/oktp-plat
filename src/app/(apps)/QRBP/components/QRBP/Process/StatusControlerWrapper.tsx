import React from 'react'

import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import {toast} from 'react-toastify'
import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'
import {Button} from '@cm/components/styles/common-components/Button'

const StatusControlerWrapper = (props: {car: any; useGlobalProps: useGlobalPropType}) => {
  const {car, useGlobalProps} = props
  const {toggleLoad, session, accessScopes} = useGlobalProps

  const BP_CAR_CLASS = new BP_Car(car)

  // const waitingProcesses = Object.keys(BP_CAR_CLASS.isWaiting() ?? {}).filter(key => {

  const QRBP = accessScopes().getQrbpProps()

  return (
    <div className={`relative w-full`}>
      <div className={` flex  flex-row   flex-wrap  gap-1  p-1  `}>
        <section>
          <Button
            disabled={!BP_CAR_CLASS.allowChakkoKyoka()}
            size="xs"
            onClick={async e => {
              if (BP_CAR_CLASS.allowChakkoKyoka()) {
                toggleLoad(
                  async () => {
                    const res = await BP_CAR_CLASS.setProcess(session, '着工許可')
                    res.success ? toast.success(`更新しました。`) : toast[res?.toastType ?? ''](`${res.message}`)
                  },
                  {refresh: true, mutate: true}
                )
              }
            }}
          >
            着工許可
          </Button>
        </section>

        {QRBP?.cr && (
          <section>
            <Button
              disabled={!BP_CAR_CLASS.allowStandBy()}
              size="xs"
              onClick={async e => {
                toggleLoad(
                  async () => {
                    const res = await BP_CAR_CLASS.setProcess(session, '着工指示')
                    res.success ? toast.success(`更新しました。`) : toast[res?.toastType ?? ''](`${res.message}`)
                  },
                  {refresh: true, mutate: true}
                )
              }}
            >
              着工指示
            </Button>
          </section>
        )}
        {QRBP?.cr && (
          <section>
            <Button
              disabled={!BP_CAR_CLASS.allowCompleteInput()}
              size="xs"
              onClick={async e => {
                toggleLoad(
                  async () => {
                    const res = await BP_CAR_CLASS.setProcess(session, '作業完了')
                    res.success ? toast.success(`更新しました。`) : toast[res?.toastType ?? ''](`${res.message}`)
                  },
                  {refresh: true, mutate: true}
                )
              }}
            >
              作業完了
            </Button>
          </section>
        )}

        <section>
          <Button
            size="xs"
            disabled={!BP_CAR_CLASS.allowAcceptionAtStore()}
            onClick={async e => {
              toggleLoad(
                async () => {
                  const res = await BP_CAR_CLASS.setProcess(session, '拠点受取')
                  res.success ? toast.success(`更新しました。`) : toast[res?.toastType ?? ''](`${res.message}`)
                },
                {refresh: true, mutate: true}
              )
            }}
          >
            拠点受取
          </Button>
        </section>
        {QRBP?.cr && (
          <section>
            <Button
              size="xs"
              onClick={async e => {
                toggleLoad(
                  async () => {
                    const res = await BP_CAR_CLASS.setProcess(session, '外注')
                    res.success ? toast.success(`更新しました。`) : toast[res?.toastType ?? ''](`${res.message}`)
                  },
                  {refresh: true, mutate: true}
                )
              }}
            >
              外注
            </Button>
          </section>
        )}
      </div>
    </div>
  )
}

export default StatusControlerWrapper
