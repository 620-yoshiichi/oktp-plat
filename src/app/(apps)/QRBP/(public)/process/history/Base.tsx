'use client'

import React from 'react'

const CarBoard = dynamic(() => import('@app/(apps)/QRBP/components/QRBP/ProcessHistoryViwer/CarBoard'))
const ProcessChart = dynamic(() => import('@app/(apps)/QRBP/components/QRBP/ProcessHistoryViwer/ProcessChart'))

import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import dynamic from 'next/dynamic'

import ProcessTable from '@app/(apps)/QRBP/components/QRBP/ProcessHistoryViwer/ProcessTable'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobalOrigin'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

export default function Base(props) {
  const useGlobalProps: useGlobalPropType = useGlobal()

  const {prismaProcess} = props

  const prepareData = () => {
    const targetProcesesses = ['板金', '塗装', '仕上げ']

    const {data: processMaster} = useDoStandardPrisma(
      'processNameMaster',
      'findMany',
      {
        where: {
          type: {in: [...targetProcesesses]},
        },
      },
      {deps: [targetProcesesses]}
    )

    const {data: engineerMaster} = useDoStandardPrisma(
      'user',
      'findMany',
      {where: {UserRole: {some: {RoleMaster: {name: 'CRエンジニア'}}}}},
      {deps: []}
    )

    const ProcessArray = prismaProcess?.filter(p => {
      return p?.ProcessNameMaster?.onEnginerProcess === true
    })
    const ProcessByStuffObject = {}
    const ProcessByCar = {}

    engineerMaster?.forEach(user => {
      obj__initializeProperty(ProcessByStuffObject, user.id, {
        User: user,
        processArrayForUser: [],
      })
    })

    ProcessArray?.forEach(process => {
      const {userId, Car} = process

      obj__initializeProperty(ProcessByCar, Car?.id, {
        Car,
        processArrayForCar: [],
      })

      // 車両別データ作成
      if (Car?.id) {
        ProcessByCar[Car?.id].processArrayForCar.push(process)
      }

      ProcessByStuffObject[userId]?.processArrayForUser.push(process)
    })

    return {
      processMaster,
      ProcessByStuffObject,
      ProcessByCar,
    }
  }

  const {processMaster, ProcessByStuffObject, ProcessByCar} = prepareData()

  return (
    <div className={` AlignJustCenter p-2`}>
      <div>
        <BasicTabs
          {...{
            id: 'processHistoryPage',
            showAll: false,
            TabComponentArray: [
              {
                label: 'グラフ',
                component: (
                  <ProcessChart
                    {...{
                      ProcessByStuffObject,
                      useGlobalProps,
                    }}
                  />
                ),
              },
              {
                label: '表',
                component: <ProcessTable {...{ProcessByStuffObject, processMaster, useGlobalProps}} />,
              },

              {
                label: '車種別',
                component: <CarBoard {...{ProcessByCar, useGlobalProps}} />,
              },
            ],
          }}
        />
      </div>
    </div>
  )
}
