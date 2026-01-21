'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { Button } from '@cm/components/styles/common-components/Button'

interface SearchFormProps {
  initialValues: {
    searchSateiID: string
    searchModelName: string
    searchColor: string
    searchFrame: string
  }
}

export function SearchForm({ initialValues }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState(initialValues)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams?.toString())

    // 検索値を設定（空の場合は削除）
    if (formData.searchSateiID.trim()) {
      params.set('searchSateiID', formData.searchSateiID.trim())
    } else {
      params.delete('searchSateiID')
    }

    if (formData.searchModelName.trim()) {
      params.set('searchModelName', formData.searchModelName.trim())
    } else {
      params.delete('searchModelName')
    }

    if (formData.searchColor.trim()) {
      params.set('searchColor', formData.searchColor.trim())
    } else {
      params.delete('searchColor')
    }

    if (formData.searchFrame.trim()) {
      params.set('searchFrame', formData.searchFrame.trim())
    } else {
      params.delete('searchFrame')
    }

    router.push(`?${params.toString()}`)
  }

  const handleReset = () => {
    setFormData({
      searchSateiID: '',
      searchModelName: '',
      searchColor: '',
      searchFrame: '',
    })
    router.push(window.location.pathname)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-2">
      <R_Stack className="gap-2 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
          <div className={`flex`}>
            {/* <label className="block text-sm font-medium text-gray-700 ">
              査定ID
            </label> */}
            <input
              type="text"
              value={formData.searchSateiID}
              onChange={e => setFormData({ ...formData, searchSateiID: e.target.value })}
              className="w-full p-0.5 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="査定IDで検索"
            />
          </div>
          <div className={`flex`}>
            {/* <label className="block text-sm font-medium text-gray-700 ">
              車名
            </label> */}
            <input
              type="text"
              value={formData.searchModelName}
              onChange={e => setFormData({ ...formData, searchModelName: e.target.value })}
              className="w-full p-0.5 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="車名で検索"
            />
          </div>
          <div className={`flex`}>
            {/* <label className="block text-sm font-medium text-gray-700 ">
              カラー
            </label> */}
            <input
              type="text"
              value={formData.searchColor}
              onChange={e => setFormData({ ...formData, searchColor: e.target.value })}
              className="w-full p-0.5 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="カラーで検索"
            />
          </div>
          <div className={`flex`}>
            {/* <label className="block text-sm font-medium text-gray-700 ">
              フレーム
            </label> */}
            <input
              type="text"
              value={formData.searchFrame}
              onChange={e => setFormData({ ...formData, searchFrame: e.target.value })}
              className="w-full p-0.5 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="フレームで検索"
            />
          </div>

        </div>
        <Button type="submit" size='sm'>検索</Button>
        <Button type="button" size='sm' onClick={handleReset} >
          リセット
        </Button>
      </R_Stack>
    </form >
  )
}
