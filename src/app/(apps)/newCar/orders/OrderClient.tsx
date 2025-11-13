'use client'
import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {fetchAlt} from '@cm/lib/http/fetch-client'
import {basePath} from '@cm/lib/methods/common'
import React from 'react'

export default function OrderClient() {
  const {toggleLoad} = useGlobal()
  return (
    <div>
      <div>
        <Button
          onClick={async () => {
            toggleLoad(async () => {
              const res = await fetchAlt(`${basePath}/api/google/sheet`, {
                spreadsheetId: `1uCksPyf8gw_33eW3Y18gZuNfaRbuoXlGvI7tIQY_cnI`,
                range: 'TO_DATE_TYPE!A2:C',
              })
            })
          }}
        >
          読み込む
        </Button>
      </div>
    </div>
  )
}
