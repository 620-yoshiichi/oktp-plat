import {atomKey} from '@cm/hooks/useJotai'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import TenpoTsuikoHistoryModal from '@app/(apps)/newCar/(pages)/tenpo-tsuiko-renraku/TenpoTsuikoHistoryModal'

export default function useTempoTsuikoGMF() {
  return useGlobalModalForm<{
    newCar: any
    usedIn: 'crPage' | 'newCarList'
    onRefresh: () => void
  }>(`useTempoTsuikoGMF` as atomKey, null, {
    mainJsx: props => {
      const {newCar, usedIn, onRefresh} = props?.GMF_OPEN

      return (
        <TenpoTsuikoHistoryModal
          {...{
            usedIn,
            carData: newCar,
            onRefresh: () => {
              props.close()
              onRefresh()
            },
          }}
        />
      )
    },
  })
}
