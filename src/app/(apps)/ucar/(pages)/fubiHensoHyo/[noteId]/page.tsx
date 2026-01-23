'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { InadequacyPdf } from '@app/(apps)/ucar/class/DetailPage/InadequacyPdf'
import { UCAR_CODE } from '@app/(apps)/ucar/class/UCAR_CODE'
import { UcarCL } from '@app/(apps)/ucar/class/UcarCL'
import { OKTP_CONSTANTS } from '@app/oktpCommon/constants'
import PlaceHolder from '@cm/components/utils/loader/PlaceHolder'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { Button } from '@cm/components/styles/common-components/Button'
import { Paper } from '@cm/components/styles/common-components/paper'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export default function FubiHensoHyoPage() {
  const params = useParams()
  const noteId = params?.noteId as string
  const { session } = useGlobal()

  const { data, error } = useSWR(noteId ? [`ucarPaperWorkNote`, noteId] : null, async () => {
    // UcarPaperWorkNoteを取得
    const { result: note } = await doStandardPrisma(`ucarPaperWorkNotes`, `findUnique`, {
      where: { id: Number(noteId) },
      include: {
        User: { select: { id: true, name: true } },
        Ucar: {
          include: {
            User: { select: { id: true, name: true } },
            Store: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!note) {
      throw new Error('不備申請が見つかりません')
    }

    // Ucarデータを取得
    const ucarData = await UcarCL.fetcher.getUcarDataBySateiId(note.Ucar.sateiID)
    const ucarInst = new UcarCL(ucarData)

    // 店長を取得
    const storeManagerWhere = OKTP_CONSTANTS.where.storeManagerWhere
    const { result: storeManager } = await doStandardPrisma(`user`, `findFirst`, {
      where: {
        AND: [storeManagerWhere, { storeId: ucarData.storeId }],
      },
    })

    // 不備区分のラベルを取得
    const TypeObj = UCAR_CODE.PAPER_WORK_NOTE_TYPES.byCode(note.type)
    const inadequacyTypeLabel = TypeObj?.label || ''

    return {
      note,
      ucarData,
      ucarInst,
      storeManager,
      inadequacyTypeLabel,
    }
  })

  if (!noteId) {
    return <div>不備申請IDが指定されていません</div>
  }

  if (error) {
    return <div>エラーが発生しました: {error.message}</div>
  }

  if (!data) {
    return <PlaceHolder />
  }

  const { note, ucarData, ucarInst, storeManager, inadequacyTypeLabel } = data

  const pdfProps = {
    storeManagerName: storeManager?.name || '',
    staffName: note.Ucar?.User?.name || '',
    sateiID: ucarInst.notation.sateiID || '',
    carName: ucarInst.notation.modelName || '',
    customerName: ucarInst.notation.customerName || '',
    inkanCertificateExpiredAt: ucarData.inkanCertificateExpiredAt,
    returnDate: note.createdAt,
    inadequacyType: inadequacyTypeLabel,
    hqReceptionistName: session?.name || '',
    content: note.content || '',
  }

  const pdfFileName = `不備返送票_${ucarInst.notation.sateiID || ''}.pdf`

  return (
    <C_Stack style={{ padding: '20px' }}>
      <R_Stack style={{ marginBottom: '20px', gap: '10px' }}>
        <PDFDownloadLink document={<InadequacyPdf {...pdfProps} />} fileName={pdfFileName}>
          {({ blob, url, loading, error }) => <Button disabled={loading}>{loading ? 'PDF生成中...' : 'PDFダウンロード'}</Button>}
        </PDFDownloadLink>
      </R_Stack>

      <Paper>
        <PDFViewer style={{ width: '100%', height: '80vh' }}>
          <InadequacyPdf {...pdfProps} />
        </PDFViewer>
      </Paper>
    </C_Stack>
  )
}
