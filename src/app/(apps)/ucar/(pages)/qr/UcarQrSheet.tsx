'use client'
import React, {useEffect, useState, useRef} from 'react'
import {basePath, isDev} from '@cm/lib/methods/common'
import QRCode from 'qrcode'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {HREF} from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {useReactToPrint} from 'react-to-print'

import Link from 'next/link'
import {upassCols} from '@app/(apps)/ucar/files/upass/upass-columns'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'
import {UcarCL} from '@app/(apps)/ucar/class/UcarCL'
import {Button} from '@cm/components/styles/common-components/Button'

// 新しいHTML/CSSベースのQRシートコンポーネント
const UcarQrSheet = ({ucar}) => {
  const {query} = useGlobal()
  const printRef = useRef<HTMLDivElement>(null)

  const src = HREF(`/${basePath}/ucar/create-process`, {sateiID: ucar?.sateiID}, query)
  const [srcDataUrlObject, setsrcDataUrlObject] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QRシート_${ucar?.sateiID}`,
    pageStyle: `
      @page {
        size: A4 landscape;
      }

    `,
  })

  useEffect(() => {
    const init = async () => {
      try {
        const {
          STORE_NYUKO,
          STORE_TENCHO_KENSHU,
          CR_CHAKU,
          CR_KENSHU,
          CR_KASHU_KAISHI,
          CR_MARUKURI,
          CR_KENSA,
          CR_SHASHIN,
          CR_GAZOO,
          CR_HAISO,
          STORE_SHORUI_SOUHU,
          STORE_DELIVERY_STOP,
          CR_GENCHI_SHORI_YOSEI,
        } = UcarProcessCl.CODE.raw

        const commonQuery = {sateiID: ucar?.sateiID}

        const srcObject = {
          STORE_NYUKO: {
            src: HREF(`${basePath}/ucar/create-process`, {...commonQuery, processCode: STORE_NYUKO.code}, query),
            label: '拠点入庫',
            sheetNumber: 1,
          },
          STORE_TENCHO_KENSHU: {
            src: HREF(`${basePath}/ucar/create-process`, {...commonQuery, processCode: STORE_TENCHO_KENSHU.code}, query),
            label: '店長検収',
            sheetNumber: 1,
          },
          CR_CHAKU: {
            src: HREF(`${basePath}/ucar/create-process`, {...commonQuery, processCode: CR_CHAKU.code}, query),
            label: '仕分/到着',
            sheetNumber: 1,
          },
          repair: {
            src: HREF(`${basePath}/ucar/create-process`, {...commonQuery, processCode: null}, query),
            label: 'CR',
            sheetNumber: 1,
          },

          STORE_DELIVERY_STOP: {
            src: HREF(`${basePath}/ucar/create-process`, {...commonQuery, processCode: STORE_DELIVERY_STOP.code}, query),
            label: '配送停止',
            sheetNumber: 1,
          },
          CR_GENCHI_SHORI_YOSEI: {
            src: HREF(`${basePath}/ucar/create-process`, {...commonQuery, processCode: CR_GENCHI_SHORI_YOSEI.code}, query),
            label: '現地処理',
            sheetNumber: 1,
          },
          STORE_SHORUI_SOUHU: {
            src: HREF(`${basePath}/ucar/create-process`, {...commonQuery, processCode: STORE_SHORUI_SOUHU.code}, query),
            label: '書類送付',
            sheetNumber: 2,
          },
        }

        const srcDataUrl = await Promise.all(
          Object.keys(srcObject).map(async key => {
            const {src, label, sheetNumber} = srcObject[key]
            const qrCode = await QRCode.toDataURL(srcObject[key].src)
            return {key, qrCode, src, label, sheetNumber}
          })
        )

        setsrcDataUrlObject(srcDataUrl)
      } catch (error) {
        console.error('QRコードの生成に失敗しました:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [ucar])

  if (isLoading) return <div>読み込み中...</div>
  if (!srcDataUrlObject.length) return <div>QRコードの生成に失敗しました</div>

  return (
    <C_Stack className="ucar-qr-sheet">
      {renderButtons({src, ucar, handlePrint})}
      {renderMain({ucar, srcDataUrlObject, printRef})}
    </C_Stack>
  )
}

export default UcarQrSheet

const renderButtons = ({src, ucar, handlePrint}) => {
  return (
    <R_Stack className="no-print mb-4">
      <Button onClick={handlePrint}>印刷</Button>
      {/* <T_LINK href={src}>QRコードのリンク先</T_LINK> */}
    </R_Stack>
  )
}

const renderMain = ({ucar, srcDataUrlObject, printRef}) => {
  return (
    <div className="">
      <div ref={printRef} className="print-target">
        <Page1 ucar={ucar} srcDataUrlObject={srcDataUrlObject} />
        <Page2 ucar={ucar} srcDataUrlObject={srcDataUrlObject} />
      </div>
    </div>
  )
}

// ページ1: 車両情報 + QRコード（6個）
const Page1 = ({ucar, srcDataUrlObject}) => {
  const cols = [
    {id: 'UPASS.sateiID', label: '査定No'},
    {id: 'UPASS.sateiID', label: 'QR読み取り有無'},
    {id: 'UPASS.modelName', label: 'ブランド名'},
    {id: 'UPASS.plate', label: '車種名'},
    {id: 'UPASS.NO_SIRETOSE', label: '通称型式'},
    {id: 'UPASS.customerName', label: '認定型式'},
    {id: 'staffName', label: 'グレード名'},
  ]
  const splitByTwoColumns = upassCols
    .filter(col => col.showIn?.qrCreate)
    .reduce((acc: any[], col, i) => {
      if (i % 2 === 0) {
        acc.push([col])
      } else {
        acc[acc.length - 1].push(col)
      }
      return acc
    }, [])

  return (
    <div className="qr-sheet-page page-1">
      {/* 車両情報テーブル */}
      <div className="car-info-section ">
        <CarInfoTable ucar={ucar} />
      </div>

      {/* QRコード（シート1用） */}
      <div>
        <div className={`grid grid-cols-4 gap-8 mx-auto w-full`}>
          {srcDataUrlObject
            .filter(d => d.sheetNumber === 1)
            .map(({key, qrCode, src, label}) => (
              <div key={key} className="qr-code-item ">
                <Link href={src} target="_blank" className={isDev ? 't-link' : ''}>
                  <div className="qr-label">{label}</div>
                </Link>
                <img src={qrCode} alt={label} className="qr-image " />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ページ2: 手書き情報 + 車両情報 + QRコード（1個） + チェックリスト
const Page2 = ({ucar, srcDataUrlObject}) => {
  const ucarInst = new UcarCL(ucar)
  const notation = ucarInst.notation
  const checklist = [
    {group: '下取り関係', label: '自賠責証明', type: 'checkbox'},
    {group: '下取り関係', label: '（自賠責）譲渡通知書', type: 'checkbox'},
    {group: '下取り関係', label: 'リサイクル券', type: 'checkbox'},
    {group: '下取り関係', label: '検査証', type: 'checkbox'},
    {group: '下取り関係', label: '登録事項等証明書', type: 'checkbox'},
    {group: '下取り関係', label: '登録識別情報等通知書（抹消済み）', type: 'checkbox'},
    {group: '下取り関係', label: '譲渡証明書', type: 'checkbox'},
    {group: '下取り関係', label: '登録簿紗本（附票）', type: 'checkbox'},
    {group: '下取り関係', label: '戸籍謄本・紗本', type: 'checkbox'},
    {group: '下取り関係', label: '住民票', type: 'checkbox'},
    {group: '下取り関係', label: '印鑑証明書', type: 'checkbox'},
    {group: '下取り関係', label: '委任状（普通）/ 申請依頼書（軽四)', type: 'checkbox'},
    {group: '下取り関係', label: '自動車買取（下取）承諾書', type: 'checkbox'},
    {group: '自動車税', label: 'お客様確認書', type: 'checkbox'},
    {group: '自動車税', label: '納付書', type: 'checkbox'},
    {group: '自動車税', label: '領収書(完納証明書)', type: 'checkbox'},
    {group: '債権書類', label: '債券譲渡通知書（実印付）', type: 'checkbox'},
    {group: '債権書類', label: '印鑑証明書（写し）', type: 'checkbox'},
    {group: '債権書類', label: '住民票（写し）', type: 'checkbox'},
    {group: '債権書類', label: '戸籍謄本・紗本（写し）', type: 'checkbox'},
    {group: '債権書類', label: '戸籍謄本・改製原戸籍・相続人代表者届出書', type: 'checkbox'},
    {group: '債権書類', label: '査定書', type: 'checkbox'},
    {group: '連絡事項', label: '', type: 'checkbox'},
  ]

  return (
    <div className="qr-sheet-page page-2">
      <div className="page-2-content">
        {/* 左側: 手書き情報 + 車両情報 + QRコード */}
        <div className="left-section">
          {/* 手書き情報 */}
          <div className="writable-info-section">
            <div className="writable-info-grid">
              <div className="info-column">
                <table className="writable-table">
                  <tbody>
                    <tr>
                      <td className="label-cell">車名</td>
                      <td className="writable-cell">{notation.modelName}</td>
                    </tr>
                    <tr>
                      <td className="label-cell">登録番号</td>
                      <td className="writable-cell">{notation.plate}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="writable-table">
                  <tbody>
                    <tr>
                      <td className="label-cell">査定No</td>
                      <td className="writable-cell">{notation.sateiID}</td>
                    </tr>
                    <tr>
                      <td className="label-cell">中古車No</td>
                      <td className="writable-cell">{/* 枠だけ設置 */}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="info-column">
                <table className="writable-table">
                  <tbody>
                    <tr>
                      <td className="label-cell">お客様名</td>
                      <td className="writable-cell">{notation.customerName}</td>
                    </tr>
                    <tr>
                      <td className="label-cell">スタッフ</td>
                      <td className="writable-cell">{ucar?.UPASS?.assessmentStaffName}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="writable-table">
                  <tbody>
                    <tr>
                      <td className="label-cell">区分</td>
                      <td className="writable-cell">{'---'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 車両情報（簡易版） */}
          <div className="car-info-compact text-[10px]">
            <CarInfoTable ucar={ucar} />
          </div>

          {/* QRコード（シート2用） */}
          <div>
            {srcDataUrlObject
              .filter(d => d.sheetNumber === 2)
              .map(({key, qrCode, src, label}) => (
                <div key={key} className="qr-code-item ">
                  <Link href={src} className={isDev ? 't-link' : ''}>
                    <div className="qr-label">{label}</div>
                  </Link>
                  <img src={qrCode} alt={label} className="qr-image " />
                </div>
              ))}
          </div>
        </div>

        {/* 右側: チェックリスト */}
        <div className="right-section">
          <table className="checklist-table">
            <tbody>
              {checklist.map(({group, label, type}, i) => {
                const isGroupRow = i === 0 || checklist[i - 1].group !== group
                const groupNotation = isGroupRow ? group : '-'

                return (
                  <tr key={i}>
                    <td className="group-cell">{groupNotation}</td>
                    <td className="item-cell">{label}</td>
                    <td className="checkbox-cell">□</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// 車両情報コンパクト版
const CarInfoTable = ({ucar}) => {
  const cols = upassCols.filter(col => col.showIn?.qrCreate)
  const splitByTwoColumns = cols.reduce((acc: any[], col, i) => {
    if (i % 2 === 0) {
      acc.push([col])
    } else {
      acc[acc.length - 1].push(col)
    }
    return acc
  }, [])

  // UPASSフィールド名からtmpフィールド名へのマッピング
  const getTmpFieldName = (upassFieldName: string): string | null => {
    const mapping: Record<string, string> = {
      registrationSerialNumber: 'tmpPlate',
      NO_SYARYOU: 'tmpVehicleNo',
      exteriorColor: 'tmpColor',
      modelYear: 'tmpModelYear',
      brandName: 'tmpBrandName',
      modelName: 'tmpModelName',
      grade: 'tmpGrade',
      type: 'tmpType',
      commonType: 'tmpCommonType',
      frameNumber: 'tmpFrameNumber',
      transmissionType: 'tmpTransmissionType',
      registrationClassNumber: 'tmpRegistrationClassNumber',
      registrationKana: 'tmpRegistrationKana',
      landAffairsName: 'tmpLandAffairsName',
    }
    return mapping[upassFieldName] || null
  }

  return (
    <table className="car-info-table ">
      <tbody>
        {splitByTwoColumns.map((cols, i) => (
          <tr key={i}>
            {cols.map((col, j) => {
              // 値の取得優先順位: ucar[col.en] > ucar.UPASS[col.en] > ucar[tmpフィールド]
              let value = ucar[col.en] ?? ucar?.UPASS?.[col.en]
              if (!value) {
                const tmpFieldName = getTmpFieldName(col.en)
                if (tmpFieldName) {
                  value = ucar[tmpFieldName]
                }
              }
              return (
                <React.Fragment key={j}>
                  <td className="label-cell">{col.showIn?.qrCreate?.label}</td>
                  <td className="value-cell">{value || ''}</td>
                </React.Fragment>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
