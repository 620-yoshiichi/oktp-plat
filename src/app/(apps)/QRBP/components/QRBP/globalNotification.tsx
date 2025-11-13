'use client'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
import React, {useState} from 'react'
import ReactMarkdown from 'react-markdown'

const GlobalNotification = () => {
  const shouldShow = new Date() <= new Date('2023-8-1')

  const [open, setopen] = useState(shouldShow)

  return (
    <ShadModal open={open} onOpenChange={setopen}>
      <Nofitication />
    </ShadModal>
  )
}

export default GlobalNotification

export const Nofitication = () => {
  const md = `
  # 直近の仕様変更について
  ---
  ## 2023-7-31
  1. (CR向け) 同一車両で、BP番号が分かれる時、**代表車両に紐づける機能[通称、グッバイボタン]**を追加しました。紐づけられた車両は、受入前リストから消えます
  ---
  ## 2023-7-27
  1. 洗車 / 作業完了の行程が登録された際に、通知メールが届くようになりました。
  2. CR予定が更新されたときに、通知メールが届くようになりました。
  ---
  ## 2023-7-24
  1. 拠点ページにて、注文番号を追加、検索できるようになりました。
  ---
  `

  return (
    <div className={`react-markdown`}>
      <ReactMarkdown>{md}</ReactMarkdown>
    </div>
  )
}
