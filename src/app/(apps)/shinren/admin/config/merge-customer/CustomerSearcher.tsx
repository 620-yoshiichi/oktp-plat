import React from 'react'

export const searchColKeys = [`code`, `name`, `nameTop`, `nameBottom`, `address1`, `kana`]
export default function CustomerSearcher({searchInputs, setsearchInputs, dataKey}) {
  return (
    <div>
      <label>
        検索
        <input
          value={searchInputs[dataKey]}
          onChange={e => {
            setsearchInputs(prev => ({...prev, [dataKey]: e.target.value}))
          }}
          className={`myFormControl w-[200px]`}
        />
      </label>
    </div>
  )
}
