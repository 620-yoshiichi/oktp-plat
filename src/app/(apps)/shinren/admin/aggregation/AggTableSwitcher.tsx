'use client'

import {R_Stack} from '@cm/components/styles/common-components/common-components'

import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import {Button} from '@cm/components/styles/common-components/Button'
import {PaperLarge} from '@cm/components/styles/common-components/paper'
const AggTableSwitcher = ({modes}) => {
  const {query, addQuery} = useMyNavigation()

  const {tableMode = 'byUser'} = query
  const currentMode = modes.find(({value}) => value === tableMode)

  return (
    <>
      <PaperLarge>
        <R_Stack className={`gap-4`}>
          {modes.map(({label, value, component}) => {
            const active = tableMode === value

            return (
              <Button
                key={value}
                active={active}
                onClick={() => {
                  addQuery({tableMode: value})
                }}
              >
                {label}
              </Button>
            )
          })}
        </R_Stack>
      </PaperLarge>
      <PaperLarge>{currentMode?.component}</PaperLarge>
    </>
  )
}

export default AggTableSwitcher
