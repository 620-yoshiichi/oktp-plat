'use client'
import Counter from '@app/(apps)/newCar/benkyokai/page2/Counter'
import Form from '@app/(apps)/newCar/benkyokai/page2/Form'
import {Center, C_Stack} from '@cm/components/styles/common-components/common-components'
import React, {useState} from 'react'

export default function Page2() {
  const [number, setnumber] = useState<number>(1)
  const [active, setactive] = useState(false)

  const sevrverData = {name: '吉市'}

  const [formState, change] = useState<any>(sevrverData)

  return (
    <Center>
      <C_Stack>
        <Counter number={number} setnumber={setnumber} />
        <Form formState={formState} number={number} change={change}></Form>
      </C_Stack>
    </Center>
  )
}
