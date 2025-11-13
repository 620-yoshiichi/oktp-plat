'use client'
import PaperWorkNoteCreator from '@app/(apps)/ucar/class/DetailPage/PaperWorkNoteCreator'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import {atomTypes} from '@cm/hooks/useJotai'

const useSelectedUcarNotesGMF = () => {
  return useGlobalModalForm<atomTypes[`selectedUcarNotes`]>(`selectedUcarNotes`, null, {
    mainJsx: props => {
      const {GMF_OPEN, setGMF_OPEN, close} = props
      const {UcarData, mutateRecords} = GMF_OPEN
      return <PaperWorkNoteCreator {...{UcarData, mutateRecords}} />
    },
  })
}

export default useSelectedUcarNotesGMF
