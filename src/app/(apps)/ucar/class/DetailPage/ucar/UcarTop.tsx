'use client'

import EditModeSelector from '@app/(apps)/ucar/class/DetailPage/ucar/EditModeSelector'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {DocumentDuplicateIcon} from '@heroicons/react/20/solid'
import {toast} from 'react-toastify'

import {Alert} from '@cm/components/styles/common-components/Alert'
import {getAvailable98NumbersReturn} from '@app/(apps)/ucar/(lib)/num98/getAvailable98Numbers'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {Button} from '@cm/components/styles/common-components/Button'
import useUcarDetailUpdatorGMF from '@app/(apps)/ucar/(parts)/templateHooks/useUcarDetailUpdatorGMF'
import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

export const UcarTop = ({
  useRecordsReturn,
  getAvailable98NumbersReturn,
}: {
  useRecordsReturn?: UseRecordsReturn
  getAvailable98NumbersReturn: getAvailable98NumbersReturn
}) => {
  const useUcarDetailUpdatorGMFReturn = useUcarDetailUpdatorGMF()
  const nextNumber98 = getAvailable98NumbersReturn?.nextNumber98

  const Next98 = () => {
    if (!getAvailable98NumbersReturn?.nextNumber98) {
      return <Alert color="red">98番号がいっぱいです</Alert>
    }
    return (
      <R_Stack
        onClick={e => {
          navigator.clipboard.writeText(String(nextNumber98 ?? ''))
          toast.success('コピーしました', {autoClose: 1000})
        }}
      >
        <span>次98: </span>
        <div className={`icon-btn row-stack gap-0 `}>
          <DocumentDuplicateIcon className={`w-6`} />
          {nextNumber98}
        </div>
      </R_Stack>
    )
  }

  return (
    <C_Stack>
      <section>
        <R_Stack>
          <Button
            size="sm"
            onClick={() =>
              useUcarDetailUpdatorGMFReturn.setGMF_OPEN({
                sateiID: '',
                getAvailable98NumbersReturn: getAvailable98NumbersReturn,
                useRecordsReturn,
              })
            }
          >
            新規作成
          </Button>
          <Next98 />
          <EditModeSelector />
          <T_LINK
            target="_blank"
            href={'https://docs.google.com/spreadsheets/d/1nzwUOAGbEx2Ye9X2SyLKzM8hehcbE1uBfsVwOubveQs/edit?gid=0#gid=0'}
          >
            不要査定ID登録
          </T_LINK>
        </R_Stack>
      </section>
    </C_Stack>
  )
}
