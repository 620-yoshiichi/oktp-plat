'use client'
import {ucarData} from '@app/(apps)/ucar/class/UcarCL'
import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import UcarRequestForm from '@app/(apps)/ucar/(parts)/RequestButton/UcarRequestForm'

export type UcarRequestGMFType = {
  UcarData: ucarData
  session: any
  UseRecordsReturn?: UseRecordsReturn
}

const useUcarRequestGMF = () => {
  return useGlobalModalForm<UcarRequestGMFType>(`ucarRequestGMF`, null, {
    mainJsx: props => {
      const {GMF_OPEN, close} = props
      const {UcarData, session, UseRecordsReturn} = GMF_OPEN
      return <UcarRequestForm {...{UcarData, session, onClose: close, UseRecordsReturn}} />
    },
  })
}

export default useUcarRequestGMF
