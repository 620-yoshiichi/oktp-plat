'use client'
import React, { useEffect, useState, useRef } from 'react'
import { basePath } from '@cm/lib/methods/common'
import QRCode from 'qrcode'
import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { HREF } from '@cm/lib/methods/urls'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import { useReactToPrint } from 'react-to-print'

import Link from 'next/link'
import { upassCols } from '@app/(apps)/ucar/files/upass/upass-columns'
import { UcarProcessCl } from '@app/(apps)/ucar/class/UcarProcessCl'
import { UcarCL } from '@app/(apps)/ucar/class/UcarCL'
import { Button } from '@cm/components/styles/common-components/Button'
import { UCAR_CODE } from '@app/(apps)/ucar/class/UCAR_CODE'

// 新しいHTML/CSSベースのQRシートコンポーネント
const UcarQrSheet = ({ ucar }) => {
  const { query } = useGlobal()
  const printRef = useRef<HTMLDivElement>(null)

  const src = HREF(`/${basePath}/ucar/create-process`, { sateiID: ucar?.sateiID }, query)
  const [srcDataUrlObject, setsrcDataUrlObject] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QRシート_${ucar?.sateiID}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0;
        padding: 0;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          margin: 0;
          padding: 0;
        }
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

        const commonQuery = { sateiID: ucar?.sateiID }

        const srcObject = {
          STORE_NYUKO: {
            src: HREF(`${basePath}/ucar/create-process`, { ...commonQuery, processCode: STORE_NYUKO.code }, query),
            label: '拠点入庫',
            sheetNumber: 1,
            target: '営業スタッフ',
          },
          STORE_TENCHO_KENSHU: {
            src: HREF(`${basePath}/ucar/create-process`, { ...commonQuery, processCode: STORE_TENCHO_KENSHU.code }, query),
            label: '店長検収',
            sheetNumber: 1,
            target: '店長',
          },
          CR_CHAKU: {
            src: HREF(`${basePath}/ucar/create-process`, { ...commonQuery, processCode: CR_CHAKU.code }, query),
            label: '仕分/到着',
            sheetNumber: 1,
            target: 'CR',
          },
          repair: {
            src: HREF(`${basePath}/ucar/create-process`, { ...commonQuery, processCode: null }, query),
            label: 'CR各種',
            sheetNumber: 1,
            target: 'CR',
          },

          CR_HAISO: {
            src: HREF(`${basePath}/ucar/create-process`, { ...commonQuery, processCode: CR_HAISO.code }, query),
            label: '商品車受取',
            sheetNumber: 1,
            target: '店長',
          },
          STORE_DELIVERY_STOP: {
            src: HREF(`${basePath}/ucar/create-process`, { ...commonQuery, processCode: STORE_DELIVERY_STOP.code }, query),
            label: '配送キャンセル',
            sheetNumber: 1,
            target: '店長',
            description: 'CRへの配送',
          },
          INFO_EDIT: {
            src: HREF(`${basePath}/ucar/edit-info`, commonQuery, query),
            label: '情報変更',
            sheetNumber: 1,
            target: '中古車G',
          },

          STORE_SHORUI_SOUHU: {
            src: HREF(`${basePath}/ucar/create-process`, { ...commonQuery, processCode: STORE_SHORUI_SOUHU.code }, query),
            label: '書類送付',
            sheetNumber: 2,
            target: '店長',
          },
        }

        const srcDataUrl = await Promise.all(
          Object.keys(srcObject).map(async key => {
            const { src, label, sheetNumber, target } = srcObject[key]
            const qrCode = await QRCode.toDataURL(srcObject[key].src)
            return { key, qrCode, src, label, sheetNumber, target }
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
    <C_Stack className="ucar-qr-sheet w-fit mx-auto">
      {renderButtons({ src, ucar, handlePrint })}
      <div className={`h-[80vh] overflow-auto shadow-lg border`}>{renderMain({ ucar, srcDataUrlObject, printRef })}</div>
    </C_Stack>
  )
}

export default UcarQrSheet

const renderButtons = ({ src, ucar, handlePrint }) => {
  return (
    <R_Stack className="no-print mb-4">
      <Button onClick={handlePrint}>印刷</Button>
    </R_Stack>
  )
}

const renderMain = ({ ucar, srcDataUrlObject, printRef }) => {
  return (
    <div className="">
      <div ref={printRef} className="print-target">
        <Page1 ucar={ucar} srcDataUrlObject={srcDataUrlObject} />
        <Page2 ucar={ucar} srcDataUrlObject={srcDataUrlObject} />
      </div>
    </div>
  )
}

// レクサス用情報ボックス
const LexusInfoBox = () => {
  return (
    <table
      className="lexus-info-box"
      style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #333', fontSize: '10px' }}
    >
      <tbody>
        <tr>
          <td
            style={{
              border: '1px solid #333',
              padding: '4px 6px',
              textAlign: 'center',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
            }}
          >
            レクサス用
          </td>
          <td
            colSpan={3}
            style={{
              border: '1px solid #333',
              padding: '4px 6px',
              textAlign: 'center',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
            }}
          >
            CPO・U-CAR・オークション
          </td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', fontSize: '9px' }}>返却希望日</td>
          <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', fontSize: '9px', width: '25%' }}>
            まるクリ
          </td>
          <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', fontSize: '9px', width: '25%' }}>加修</td>
          <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', fontSize: '9px', width: '25%' }}>
            サーチアップ
          </td>
        </tr>
        <tr style={{ height: 60 }}>
          <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', height: '20px' }}>/</td>
          <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', height: '20px', width: '25%' }}></td>
          <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', height: '20px', width: '25%' }}></td>
          <td style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'center', height: '20px', width: '25%' }}></td>
        </tr>
        <tr>
          <td
            colSpan={4}
            style={{
              border: '1px solid #333',
              padding: '4px 6px',
              textAlign: 'center',
              fontSize: '9px',
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
            }}
          >
            備考欄
          </td>
        </tr>
        <tr style={{ height: 40 }}>
          <td colSpan={4} style={{ border: '1px solid #333', padding: '4px 6px', height: '40px' }}></td>
        </tr>
      </tbody>
    </table>
  )
}

// ページ1: 車両情報 + QRコード（6個）
const Page1 = ({ ucar, srcDataUrlObject }) => {

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

  const QRcodeOnSheet1 = srcDataUrlObject.filter(d => d.sheetNumber === 1)
  const firstRow = QRcodeOnSheet1.slice(0, 5)
  const secondRow = QRcodeOnSheet1.slice(5)
  //

  return (
    <div className="qr-sheet-page page-1">
      {/* 車両情報テーブルと右上の情報枠 */}
      <div className="car-info-section" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <CarInfoTable ucar={ucar} />
        </div>
        <div style={{ width: '280px', flexShrink: 0 }}>
          <LexusInfoBox />
        </div>
      </div>

      {/* QRコード（シート1用） */}
      <C_Stack className={`gap-8 qr-codes-section-page1`}>
        <R_Stack className={` gap-0   mx-auto w-full `}>
          {firstRow.map(({ key, qrCode, src, label, target }) => (
            <div key={key} className="qr-code-item w-1/5">
              <R_Stack className={`w-full mb-1 justify-between`}>
                <Link className={`font-bold text-base`} href={src} target="_blank">
                  <div>{label}</div>
                </Link>

                <span className="text-sm font-bold text-gray-800 bg-yellow-100 px-2 py-0.5 rounded block">({target})</span>
              </R_Stack>

              <img src={qrCode} alt={label} className="qr-image " />
            </div>
          ))}
        </R_Stack>

        <hr className="print-hr" />

        <div className={`bg-gray-200/50 p-2 second-row-section`}>
          <span className={`text-center text-gray-500`}>下記は、必要な場合のみ使用してください</span>

          <R_Stack className={` gap-0   mx-auto w-full `}>
            {secondRow.map(({ key, qrCode, src, label, target }) => (
              <div key={key} className="qr-code-item w-1/5 scale-90 ">
                <R_Stack className={`w-full mb-1 justify-between`}>
                  <Link className={`font-bold text-base`} href={src} target="_blank">
                    <div>{label}</div>
                  </Link>

                  <span className="text-sm font-bold text-gray-800 bg-yellow-100 px-2 py-0.5 rounded block">({target})</span>
                </R_Stack>

                <img src={qrCode} alt={label} className="qr-image" />
              </div>
            ))}
          </R_Stack>
        </div>
      </C_Stack>
    </div>
  )
}

// ページ2: 手書き情報 + 車両情報 + QRコード（1個） + チェックリスト
const Page2 = ({ ucar, srcDataUrlObject }) => {
  const ucarInst = new UcarCL(ucar)

  // QR発行プロセス（STORE_QR_ISSUE）のUser名を取得
  const { STORE_QR_ISSUE } = UcarProcessCl.CODE.raw
  const qrIssueProcess = ucar.UcarProcess?.find(process => process?.processCode === STORE_QR_ISSUE.code)
  const qrIssueUserName = qrIssueProcess?.User?.name ?? ''
  const notation = ucarInst.notation
  const checklist = [
    { group: '下取り関係', label: '自賠責証明', type: 'checkbox' },
    { group: '下取り関係', label: '（自賠責）譲渡通知書', type: 'checkbox' },
    { group: '下取り関係', label: 'リサイクル券', type: 'checkbox' },
    { group: '下取り関係', label: '検査証', type: 'checkbox' },
    { group: '下取り関係', label: '登録事項等証明書', type: 'checkbox' },
    { group: '下取り関係', label: '登録識別情報等通知書（抹消済み）', type: 'checkbox' },
    { group: '下取り関係', label: '譲渡証明書', type: 'checkbox' },
    { group: '下取り関係', label: '登録簿紗本（附票）', type: 'checkbox' },
    { group: '下取り関係', label: '戸籍謄本・紗本', type: 'checkbox' },
    { group: '下取り関係', label: '住民票', type: 'checkbox' },
    { group: '下取り関係', label: '印鑑証明書', type: 'checkbox' },
    { group: '下取り関係', label: '委任状（普通）/ 申請依頼書（軽四)', type: 'checkbox' },
    { group: '下取り関係', label: '自動車買取（下取）承諾書', type: 'checkbox' },
    { group: '自動車税', label: 'お客様確認書', type: 'checkbox' },
    { group: '自動車税', label: '納付書', type: 'checkbox' },
    { group: '自動車税', label: '領収書(完納証明書)', type: 'checkbox' },
    { group: '債権書類', label: '債券譲渡通知書（実印付）', type: 'checkbox' },
    { group: '債権書類', label: '印鑑証明書（写し）', type: 'checkbox' },
    { group: '債権書類', label: '住民票（写し）', type: 'checkbox' },
    { group: '債権書類', label: '戸籍謄本・紗本（写し）', type: 'checkbox' },
    { group: '債権書類', label: '戸籍謄本・改製原戸籍・相続人代表者届出書', type: 'checkbox' },
    { group: '債権書類', label: '査定書', type: 'checkbox' },
    { group: '連絡事項', label: '', type: 'checkbox' },
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
                      <td className="writable-cell">{ucar.number98}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="info-column">
                <table className="writable-table">
                  <tbody>
                    <tr>
                      <td className="label-cell">お客様名</td>
                      <td className="writable-cell">{ucar.taxCustomerName}</td>
                    </tr>
                    <tr>
                      <td className="label-cell">スタッフ</td>
                      <td className="writable-cell">{qrIssueUserName}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="writable-table">
                  <tbody>
                    <tr>
                      <td className="label-cell">区分</td>
                      <td className="writable-cell">{UCAR_CODE.SHITADORI_KBN.byCode(ucar.shitadoriKbn)?.label ?? '---'}</td>
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
              .map(({ key, qrCode, src, label, target }) => (
                <div key={key} className="qr-code-item w-fit mx-auto">
                  <R_Stack className={`w-full mb-1 justify-between`}>
                    <Link className={`font-bold text-base`} href={src} target="_blank">
                      <div>{label}</div>
                    </Link>

                    <span className="text-sm font-bold text-gray-800 bg-yellow-100 px-2 py-0.5 rounded block">({target})</span>
                  </R_Stack>

                  <img src={qrCode} alt={label} className="qr-image " />
                </div>
              ))}
          </div>
        </div>

        {/* 右側: チェックリスト */}
        <div className="right-section">
          <table className="checklist-table">
            <tbody>
              {checklist.map(({ group, label, type }, i) => {
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
const CarInfoTable = ({ ucar }) => {
  const cols = [
    ...upassCols.filter(col => col.showIn?.qrCreate),
    {
      en: 'runnable',
      showIn: { qrCreate: { label: '自力走行可' } },
      format: carData => UCAR_CODE.RUNNABLE.byCode(carData?.runnable)?.label,
    },
    {
      en: 'remarks',
      showIn: { qrCreate: { label: '店舗特記事項' } },
      format: carData => carData?.remarks,
    },
  ].map(col => ({ ...col, label: col.showIn?.qrCreate?.label }))

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
      NO_SYARYOU: 'tmpChassisNumber',
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
              let value = col?.format ? col.format(ucar) : (ucar[col.en] ?? ucar?.UPASS?.[col.en])


              if (!value) {
                const tmpFieldName = getTmpFieldName(col.en)
                if (tmpFieldName) {
                  value = ucar[tmpFieldName]
                }
              }
              return (
                <React.Fragment key={j}>
                  <td className="label-cell">{col.label}</td>
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
