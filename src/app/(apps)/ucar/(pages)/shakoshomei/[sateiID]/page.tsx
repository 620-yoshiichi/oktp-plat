'use client'
import {UcarCL, ucarData} from '@app/(apps)/ucar/class/UcarCL'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import React from 'react'
import useSWR from 'swr'
import {useParams} from 'next/navigation'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import {Button} from '@cm/components/styles/common-components/Button'

export default function Page() {
  const {toggleLoad} = useGlobal()
  const params = useParams()
  const sateiID = params?.sateiID as string
  const key = [sateiID, 'shakoshomei'].join('_')
  const {data} = useSWR(key, async () => {
    const ucar = await UcarCL.fetcher.getUcarDataBySateiId(sateiID)

    const locationName = ucar?.AppliedUcarGarageSlot?.UcarGarageSlotMaster?.UcarGarageLocationMaster?.name
    const locationKey = locationName === '倉敷' ? 'kurashiki' : locationName === '岡山' ? 'okayama' : ''
    const slotNumber = ucar?.AppliedUcarGarageSlot?.UcarGarageSlotMaster?.garageNumber
    return {ucar, locationKey, slotNumber}
  })

  if (!data) {
    return <PlaceHolder />
  }

  const ucarInstance = new UcarCL(data?.ucar as ucarData)

  const today = new Date()

  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()

  // API呼び出し用関数
  const generatePDF = async (formData: any) => {
    const credentials = btoa('admin:password1234')
    const response = await fetch('https://asia-northeast1-qr-pdf-support.cloudfunctions.net/generatePDF2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error('PDF生成に失敗しました')
    }
    return response
  }

  const {brandName, modelName, chassisNumber, type, length, width, height} = ucarInstance.notation
  // // 固定のフォームデータ
  const formData = {
    location: data?.locationKey,
    position: String(data?.slotNumber),
    textbox1: brandName || 'トヨタ',
    textbox2: type || 'DAA-AZK10',
    textbox3: chassisNumber || 'AZK10-2087691',
    textbox4: String(length) || '469',
    textbox5: String(width) || '177',
    textbox6: String(height) || '148',
    textbox7: '倉敷市中島668',
    textbox8: '同上',
    textbox9: '',
    textbox10: '倉敷 警察署長 殿',
    textbox11: String(year),
    textbox12: String(month),
    textbox13: String(day),
    textbox14: '岡山市北区伊福町1丁目20番12号',
    textbox15: '086',
    textbox16: '897',
    textbox17: '1004',
    textbox18: '岡山トヨペット株式会社',
    textbox19: '代表取締役 末長 一範',
    textbox20: '岡山トヨペット株式会社',
    textbox21: '897',
    textbox22: '1004',
  }

  // // 固定のフォームデータ
  // const formData = {
  //   location: 'kurashiki',
  //   position: '1',
  //   textbox1: 'トヨタ',
  //   textbox2: 'DAA-AZK10',
  //   textbox3: 'AZK10-2087691',
  //   textbox4: '469',
  //   textbox5: '177',
  //   textbox6: '148',
  //   textbox7: '倉敷市中島668',
  //   textbox8: '同上',
  //   textbox9: '',
  //   textbox10: '倉敷 警察署長 殿',
  //   textbox11: '2022',
  //   textbox12: '5',
  //   textbox13: '10',
  //   textbox14: '岡山市北区伊福町1丁目20番12号',
  //   textbox15: '086',
  //   textbox16: '897',
  //   textbox17: '1004',
  //   textbox18: '岡山トヨペット株式会社',
  //   textbox19: '代表取締役 末長 一範',
  //   textbox20: '岡山トヨペット株式会社',
  //   textbox21: '897',
  //   textbox22: '1004',
  // }

  // プレビュー処理
  const handlePreview = async () => {
    toggleLoad(async () => {
      try {
        const response = await generatePDF(formData)
        const blob = await response.blob()
        // 新規ウィンドウでPDFを表示
        window.open(URL.createObjectURL(blob), '_blank')
      } catch (error) {
        console.error('エラー:', error)
        alert('PDFのプレビューに失敗しました')
      }
    })
  }

  // // ダウンロード処理
  // const handleDownload = async () => {
  //   // await toggleLoad(async () => {
  //   try {
  //     const response = await generatePDF(formData)
  //     const blob = await response.blob()
  //     // ダウンロード用のURLを生成してクリックイベントを発火
  //     const url = URL.createObjectURL(blob)
  //     const a = document.createElement('a')
  //     a.style.display = 'none'
  //     a.href = url
  //     a.download = 'certificate.pdf'
  //     document.body.appendChild(a)
  //     a.click()
  //     document.body.removeChild(a)
  //     URL.revokeObjectURL(url)
  //   } catch (error) {
  //     console.error('エラー:', error)
  //     alert('PDFのダウンロードに失敗しました')
  //   }
  //   // })
  // }

  return (
    <div style={{padding: '20px'}}>
      <h1>自動車保管場所証明申請書 PDF生成</h1>
      <div style={{marginTop: '20px'}}>
        <Button onClick={handlePreview}>PDFを表示</Button>
      </div>
    </div>
  )
}
