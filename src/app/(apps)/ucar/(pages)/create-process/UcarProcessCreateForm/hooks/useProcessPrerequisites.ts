'use client'
import {useState, useEffect} from 'react'
import {UcarProcessCl} from '@app/(apps)/ucar/class/UcarProcessCl'

/**
 * プロセスタイプに応じた前提条件のチェックと管理を行う
 */
export const useProcessPrerequisites = ({processCode, UcarData}) => {
  const ProcessCodeItem = UcarProcessCl.CODE.byCode(processCode)
  const isCrChakuProcess = ProcessCodeItem?.code === UcarProcessCl.CODE.raw.CR_CHAKU.code
  const isPaperSendProcess = ProcessCodeItem?.code === UcarProcessCl.CODE.raw.STORE_SHORUI_SOUHU.code

  // 書類送付プロセスの場合：返金有無の選択状態を管理
  // henkinRequired: null=未選択, true=返金あり, false=返金なし
  const [henkinRequiredState, setHenkinRequiredState] = useState<boolean | null>(UcarData.henkinRequired)

  // 返金有無が選択されているか
  const taxRefundSelected = henkinRequiredState !== null

  // 書類送付プロセスの場合：返金ありの場合はお客様情報フォームを表示
  const showCustomerInfoForm = isPaperSendProcess && henkinRequiredState === true

  // 書類送付プロセスの場合：返金ありの場合のみお客様情報が必要（前提条件判定用）
  // 返金なし(henkinRequired=false)の場合はスキップ
  const needsCustomerInfo = isPaperSendProcess && henkinRequiredState === true && !UcarData.taxCustomerName
  const [customerInfoRegistered, setCustomerInfoRegistered] = useState(!needsCustomerInfo)

  // CR着プロセスの場合：仕分け先が必要
  const needsDestination = isCrChakuProcess && !UcarData.destination
  const [DestinationRegistered, setDestinationRegistered] = useState(!needsDestination)

  // UcarDataが更新されたときに状態を更新
  useEffect(() => {
    if (isPaperSendProcess) {
      setHenkinRequiredState(UcarData.henkinRequired)
    }
  }, [UcarData.henkinRequired, isPaperSendProcess])

  useEffect(() => {
    if (isPaperSendProcess && henkinRequiredState === true) {
      setCustomerInfoRegistered(!!UcarData.taxCustomerName)
    } else if (isPaperSendProcess && henkinRequiredState === false) {
      // 返金なしの場合はお客様情報登録済みとみなす
      setCustomerInfoRegistered(true)
    }
  }, [UcarData.taxCustomerName, henkinRequiredState, isPaperSendProcess])

  useEffect(() => {
    if (isCrChakuProcess) {
      setDestinationRegistered(!!UcarData.destination)
    }
  }, [UcarData.destination, isCrChakuProcess])

  // 前提条件が満たされているか
  let prerequisitesMet = true
  if (isPaperSendProcess) {
    prerequisitesMet = taxRefundSelected && customerInfoRegistered && DestinationRegistered
  }
  if (isCrChakuProcess) {
    prerequisitesMet = DestinationRegistered
  }

  return {
    isCrChakuProcess,
    isPaperSendProcess,
    henkinRequiredState,
    showCustomerInfoForm,
    needsCustomerInfo,
    needsDestination,
    taxRefundSelected,
    customerInfoRegistered,
    DestinationRegistered,
    prerequisitesMet,
    setHenkinRequiredState,
    setCustomerInfoRegistered,
    setDestinationRegistered,
    ProcessCodeItem,
  }
}
