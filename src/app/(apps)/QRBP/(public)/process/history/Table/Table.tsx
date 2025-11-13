'use client'
import {cl} from '@cm/lib/methods/common'
import {Fragment, useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

import UserInfo from '@app/(apps)/QRBP/(public)/process/history/Table/UserInfo'
import ProcessCell from '@app/(apps)/QRBP/(public)/process/history/Table/ProcessCell'
import ProcessDetailOnUser from '@app/(apps)/QRBP/(public)/process/history/Table/ProcessDetailOnUser'
import Btns from '@app/(apps)/QRBP/(public)/process/history/Table/Btns'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {ColBuilder} from '@app/(apps)/QRBP/class/ColBuilder'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {ColoredText} from '@cm/components/styles/common-components/colors'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'

const Table = ({processNameMasterArr, STUFF_PROCESS, query}) => {
  const thStyle = {
    fontSize: 16,
    padding: 0.5,
    margin: 'auto',
    height: 30,
    overflow: 'hidden',
    borderRadius: 0,
  }

  const [editModalOpen, seteditModalOpen] = useState(null)

  return (
    <div>
      <ProcessCorrectionForm
        {...{
          Process: editModalOpen,
          editModalOpen,
          seteditModalOpen,
        }}
      />

      <Btns />
      <div className={cl(`table-wrapper overflow-auto   first-letter:mx-auto`, `h-[70vh] `)}>
        <table className={`print-target [&_td]:border [&_th]:border `}>
          <thead className={`bg-sub-light  `}>
            <tr>
              {[
                '班',
                '氏名',
                // '合計',
                ...processNameMasterArr.map(p => {
                  return (
                    <div key={p.id}>
                      <ColoredText bgColor={p.color} style={{...thStyle}}>
                        {p.name}
                      </ColoredText>
                    </div>
                  )
                }),
              ].map((h, i) => {
                return (
                  <th key={i} style={{...thStyle}}>
                    <div>{h}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {Object.keys(STUFF_PROCESS).map((key, i) => {
              const oddRow = i % 2 === 0
              const {User, processArrayForUser, time, count, totalTime, totalCount} = STUFF_PROCESS[key]

              const {type2, DamageNameMaster} = User

              const detailOpen = query.fullOpen
              const rowColor = oddRow ? 'bg-white' : 'bg-gray-200 '
              const teamColorOrigin = BP_Car.const.engineerTeamType.find(item => item.value === type2)?.color
              const teamColor = teamColorOrigin

              const damageColor = DamageNameMaster?.color ? DamageNameMaster?.color : ''

              return (
                <Fragment key={User.id}>
                  <tr className={cl(rowColor, query.fullOpen ? 'border-t-4' : '')} style={{background: teamColor}}>
                    <th
                      style={{
                        ...thStyle,
                        position: 'sticky',
                        left: 0,
                        zIndex: 100,
                        background: teamColorOrigin,
                      }}
                      className={`w-[140px]`}
                    >
                      <R_Stack className={` flex-nowrap gap-0 w-[140px] p-2`}>
                        <>
                          <span>{String(User.type2).replace('チーム', '')}</span>
                        </>

                        <IconBtn style={{...thStyle, background: teamColorOrigin}} color={damageColor}>
                          {DamageNameMaster?.name}
                        </IconBtn>
                      </R_Stack>
                    </th>

                    <th style={{...thStyle, background: teamColorOrigin}}>
                      <UserInfo {...{User, processArrayForUser, editModalOpen, seteditModalOpen}}></UserInfo>
                    </th>

                    {processNameMasterArr.map((p, i) => {
                      const roundedTime = Math.round(Number(time[p.id] ?? 0) * 10) / 10
                      const roundedCount = Math.round(Number(count[p.id] ?? 0) * 10) / 10

                      return (
                        <td key={i}>
                          <div>
                            <ProcessCell
                              {...{
                                User: User,
                                roundedCount,
                                roundedTime,
                                processArrayForUser,
                              }}
                            />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                  {detailOpen && (
                    <Fragment>
                      <tr key={i} className={rowColor}>
                        <td colSpan={processNameMasterArr.length + 2}>
                          <ProcessDetailOnUser {...{processArrayForUser, editModalOpen, seteditModalOpen}} />
                        </td>
                      </tr>
                    </Fragment>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table

export const ProcessCorrectionForm = ({editModalOpen, seteditModalOpen}) => {
  const Process = editModalOpen
  if (Process === null) return null
  const useGlobalProps = useGlobal()
  const {session, toggleLoad, query} = useGlobalProps
  const {data: Car} = useDoStandardPrisma(`car`, 'findUnique', {where: {id: Process.carId}}, {deps: [Process.carId]})

  const columns = ColBuilder.processForCertainCar({useGlobalProps})
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: columns,
    formData: Process,
  })

  const onSubmit = async payload => {
    toggleLoad(async () => {
      const res = await doStandardPrisma(`process`, 'upsert', {
        where: {id: Process.id ?? 0},
        ...payload,
        carId: Car.id,
      })
      toastByResult(res)
      seteditModalOpen(null)
    })
  }
  if (!Car) {
    return <PlaceHolder />
  }
  const hasData = !!Process?.id
  return (
    <div>
      <ShadModal {...{open: !!editModalOpen, onOpenChange: seteditModalOpen}}>
        <h1 className={`text-center`}>
          <div>{Car.bpNumber}</div>
          <div>{Car?.carName}</div>
        </h1>
        <BasicForm onSubmit={onSubmit} latestFormData={latestFormData}>
          <R_Stack className={` justify-around gap-4`}>
            {hasData && (
              <div
                color="blue"
                onClick={() => {
                  seteditModalOpen(null)
                  setTimeout(() => {
                    seteditModalOpen({carId: Car.id})
                  }, 500)
                }}
              >
                <small className={`t-link`}>新規データ作成</small>
              </div>
            )}
            <Button color={hasData ? 'blue' : 'red'}>{hasData ? '更新' : '新規登録'}</Button>
          </R_Stack>
        </BasicForm>
      </ShadModal>
    </div>
  )
}
