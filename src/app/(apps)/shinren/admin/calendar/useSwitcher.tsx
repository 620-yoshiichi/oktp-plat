'use client'

import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {cl} from '@cm/lib/methods/common'

import {useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
export type ViewType = {name: string; value: string}

export const useSwitcher = ({viewMasters}) => {
  const [view, setview] = useState<ViewType | null>({
    name: 'リスト',
    value: 'list',
  })
  const Switcher = () => {
    return (
      <R_Stack>
        {viewMasters.map((data, index) => {
          const isActive = view?.value === data.value
          return (
            <Button className={cl(isActive ? '' : 'opacity-50', `text-responsive`)} key={index} onClick={() => setview(data)}>
              {data.name}
            </Button>
          )
        })}
      </R_Stack>
    )
  }

  return {Switcher, view, setview}
}
