'use client'

import React from 'react'

export default function page() {
  const name = '吉市'
  const list = [1, 2, 3]

  const test = list.map((data: number) => {
    return <div key={data}>{data}</div>
  })

  const style1 = `text-error-main text-[50px] font-bold italic`

  return (
    <div className={`mx-auto p-2`}>
      <div className={style1}>あいうえお</div>
      <div className={style1 + 'mx-[12.5px] p-[calc(12.5px/2)] [&_td]:p-2 '}>かきくけこ</div>

      <button className={`t-btn !bg-red-500`}>ボタン</button>

      {/* <label htmlFor="name">name</label>
        <input id="name" className={`border`} />
        {name}
        {test} */}
    </div>
  )
}
