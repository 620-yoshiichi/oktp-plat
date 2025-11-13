'use client'
import {useDataTypeToggler} from '@app/(apps)/shinren/admin/calendar/useDataTypeToggler'

import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'

import dynamic from 'next/dynamic'

import {useSwitcher, ViewType} from '@app/(apps)/shinren/admin/calendar/useSwitcher'
import {useMemo} from 'react'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {makePortal} from '@cm/lib/methods/portal'
import Accordion from '@cm/components/utils/Accordions/Accordion'
import {RentaCustomDateSwithcer} from '@app/(apps)/shinren/AdminLayoutController/AdminLayoutController-methods'
import useWindowSize from '@cm/hooks/useWindowSize'

const CalendarTable = dynamic(() => import('@app/(apps)/shinren/admin/calendar/CalendarTable/CalendarTable'), {
  loading: () => <></>,
  ssr: false,
})

const KeyInformations = dynamic(() => import('@app/(apps)/shinren/admin/calendar/KeyInformations/KeyInformations'), {
  loading: () => <></>,
  ssr: false,
})

const ViewSwitcher = ({AlterNateInfo, InsuranceInfo, ExtraInfo, CalendarInfo}) => {
  const useGlobalProps = useGlobal()
  const {activeInfoType, DataTypeToggler} = useDataTypeToggler()

  const viewMasters: ViewType[] = [
    {name: 'カレンダー', value: 'calendar'},
    {name: 'リスト', value: 'list'},
  ]

  const {Switcher, view, setview} = useSwitcher({viewMasters})

  let component
  switch (view?.value) {
    case 'calendar': {
      component = <CalendarTable {...{CalendarInfo, activeInfoType}} />
      break
    }
    case 'list': {
      component = <KeyInformations {...{AlterNateInfo, InsuranceInfo, ExtraInfo, CalendarInfo}} />
      break
    }
  }

  const {device} = useWindowSize()
  const {pathname} = useGlobalProps
  const TogglerMemo = useMemo(() => {
    return (
      <div className={`mx-auto`}>
        {/* <StuffSelector {...{useGlobalProps}} /> */}
        <R_Stack className="mx-auto items-stretch gap-2">
          <Paper>
            <Switcher />
          </Paper>
          <Paper>
            <DataTypeToggler />
          </Paper>

          <RentaCustomDateSwithcer pathname={pathname}></RentaCustomDateSwithcer>
        </R_Stack>
        <div className={`text-center`}>
          <small className={`text-error-main `}>基準月の月初から、360日先までのデータを表示</small>
        </div>
      </div>
    )
  }, [view, pathname, activeInfoType, device])

  if (device.SP) {
    const portaled = makePortal({
      JsxElement: <Accordion label={`表示設定`}>{TogglerMemo}</Accordion>,
      rootId: 'portal-root-bottom-fixed',
    })
    return (
      <>
        {portaled}
        {component}
      </>
    )
  }

  return (
    <>
      {TogglerMemo}

      {component}
    </>
  )
}

export default ViewSwitcher
