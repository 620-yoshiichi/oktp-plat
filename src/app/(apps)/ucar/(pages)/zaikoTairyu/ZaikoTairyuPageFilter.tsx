'use client'

import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import React from 'react'

export default function ZaikoTairyuPageFilter({ucarProcessMaster}) {
  const {addQuery, toggleLoad, query} = useGlobal()
  const selected = query.targetProcessIds ? String(query.targetProcessIds).split(`,`) : []

  return (
    <div>
      <small>最終工程でフィルタします</small>
      <R_Stack className={`gap-4`}>
        {ucarProcessMaster.map(data => {
          const active = selected.includes(data.id.toString())
          return (
            <IconBtn
              vivid
              key={data.id}
              {...{
                color: active ? 'blue' : 'disabled',
                // className: active ? '' : ' opacity-30',
                // style: {color: getColorStyles(data.color).color},
                onClick: () => {
                  let nextList = [...selected]
                  if (active) {
                    nextList = nextList.filter(id => id !== data.id.toString())
                  } else {
                    nextList.push(data.id.toString())
                  }

                  addQuery({targetProcessIds: nextList.join(`,`)})
                },
              }}
            >
              {data.name}
            </IconBtn>
          )
        })}
      </R_Stack>
    </div>
  )
}
