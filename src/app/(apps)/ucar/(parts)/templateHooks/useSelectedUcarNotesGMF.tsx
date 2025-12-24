'use client'
import PaperWorkNoteCreator from '@app/(apps)/ucar/class/DetailPage/PaperWorkNoteCreator'
import {ucarData} from '@app/(apps)/ucar/class/UcarCL'
import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'

const useSelectedUcarNotesGMF = () => {
  return useGlobalModalForm<{
    UcarData: ucarData
    UseRecordsReturn: UseRecordsReturn
  }>(`selectedUcarNotes`, null, {
    mainJsx: props => {
      const {GMF_OPEN, setGMF_OPEN, close} = props
      const {UcarData, UseRecordsReturn} = GMF_OPEN
      return <PaperWorkNoteCreator {...{UcarData, UseRecordsReturn}} />
    },
  })
}

export default useSelectedUcarNotesGMF
