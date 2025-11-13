'use client'
import ProcessDetailOnUser from '@app/(apps)/QRBP/(public)/process/history/Table/ProcessDetailOnUser'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
IconBtn

import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {Alert} from '@cm/components/styles/common-components/Alert'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Paper} from '@cm/components/styles/common-components/paper'
import ShadPopover from '@cm/shadcn/ui/Organisms/ShadPopover'

import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

const UserInfo = ({User, processArrayForUser, editModalOpen, seteditModalOpen}) => {
  const {query, session, toggleLoad} = useGlobal()

  const Btn = <Paper className={`w-[120px] text-center p-1`}>{User.name}</Paper>

  const ProcessConfirmBtn = () => {
    const date = query.from ? toUtc(query.from) : new Date()

    const ProcessConfirmationOnDate = User.UserProcessConfirmation.find(data => {
      const isSameDate = Days.validate.isSameDate(data.date, date)
      return isSameDate
    })

    const checked = ProcessConfirmationOnDate?.checked

    return (
      <Alert
        className={`onHover p-0.5 text-[12px] `}
        onClick={async () => {
          toggleLoad(
            async () => {
              ConfirmProcess({date, User, ProcessConfirmationOnDate, checked})
            },
            {refresh: true}
          )
        }}
        color={checked ? 'green' : 'red'}
        disabled={query.selectPeriod}
      >
        {checked ? '取消' : '確定'}
      </Alert>
    )
  }

  return (
    <R_Stack className={`justify-between gap-y-4 p-2  w-[200px]`}>
      <ShadPopover
        {...{
          mode: 'click',
          // positionFree: false,
          // mode: 'click',
          PopoverTrigger: Btn,
        }}
      >
        <div className={`wrap-break-word text-center max-w-[80vw] mx-auto`}>
          <h3>{User?.name}の作業内容</h3>
          <ProcessDetailOnUser {...{processArrayForUser, editModalOpen, seteditModalOpen}} />
        </div>
      </ShadPopover>
      <ProcessConfirmBtn />
    </R_Stack>
  )
}

export default UserInfo

const ConfirmProcess = async ({date, User, ProcessConfirmationOnDate, checked}) => {
  const id = ProcessConfirmationOnDate?.id ?? 0

  await doStandardPrisma('userProcessConfirmation', 'upsert', {
    where: {id},
    ...createUpdate({date: formatDate(date, 'iso'), userId: User.id, checked: checked ? false : true}),
  })
}
