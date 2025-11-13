'use client'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import React from 'react'

export default function Counter(props) {
  const {number, setnumber} = props
  const countUp = () => {
    setnumber(number + 1)
  }
  return (
    <R_Stack>
      <div>{number}</div>
      <Button onClick={countUp}>＋</Button>
    </R_Stack>
  )
}
