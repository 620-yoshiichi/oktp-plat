'use client'
import {PaymentStatusButton} from '@app/(apps)/newCar/(parts)/DesiredTorokuDate/PaymentStatusButton'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'

import {colorVariants} from '@cm/lib/methods/colorVariants'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {useJotaiByKey, atomTypes} from '@cm/hooks/useJotai'
import {twMerge} from 'tailwind-merge'

export const btnClass = `rounded   py-0.5 px-0.5 text-xs `
export const DesiredTorokuDateRegister = ({newCar, isHQ}) => {
  const newCarCl = new NewCarClass(newCar)

  const TorokuMikomiButton = () => {
    const [torokuMikomiApplicationForm, settorokuMikomiApplicationForm] = useJotaiByKey<atomTypes[`torokuMikomiApplicationForm`]>(
      `torokuMikomiApplicationForm`,
      null
    )

    const status = newCarCl.status.getTorokuMikomiStatus(newCar)
    return (
      <>
        <small className={` text-xs`}>見込み</small>
        {status.label && (
          <IconBtn
            color={status.color as colorVariants}
            onClick={() => settorokuMikomiApplicationForm({newCar})}
            className={twMerge(btnClass, ' onHover')}
          >
            {status.label}
          </IconBtn>
        )}
      </>
    )
  }

  const TorokuRegisterButton = () => {
    const [torokuDateApplicationFormOpen, settorokuDateApplicationFormOpen] = useJotaiByKey<
      atomTypes[`torokuDateApplicationForm`]
    >(`torokuDateApplicationForm`, null)
    const status = newCarCl.status.getTorokuApplicationStatus()
    return (
      <>
        <small className={` text-xs`}>登録申請</small>
        {status.label && (
          <IconBtn
            color={status.color as colorVariants}
            onClick={() => settorokuDateApplicationFormOpen({newCar})}
            className={twMerge(btnClass, ' onHover')}
          >
            {status.label}
          </IconBtn>
        )}
      </>
    )
  }
  const HaisouStatusButton = () => {
    const status = newCarCl.status.getHaisouStatus({newCar})
    return (
      <>
        <small className={` text-xs`}>配送</small>
        {status.label && (
          <IconBtn
            onClick={() => alert(`ai21で入力を完了してください。翌日のバッチ処理で、本アプリに反映されます。`)}
            color={status.color as colorVariants}
            className={twMerge(btnClass, ' ')}
          >
            {status.label}
          </IconBtn>
        )}
      </>
    )
  }

  const Wrapper = ({children}) => {
    return <R_Stack className={` w-full items-center  justify-between gap-0 border-b border-dashed py-0.5`}>{children}</R_Stack>
  }

  return (
    <div>
      <C_Stack className={` gap-0.5 `}>
        <Wrapper>
          <TorokuMikomiButton />
        </Wrapper>
        <Wrapper>
          <TorokuRegisterButton />
        </Wrapper>
        <Wrapper>
          <HaisouStatusButton />
        </Wrapper>
        <Wrapper>
          <small className={` text-xs`}>入金状況</small>
          <PaymentStatusButton {...{newCar, isHQ}} />
        </Wrapper>
      </C_Stack>
    </div>
  )
}
