import DesiredTorokuDateChildCreator from '@app/(apps)/newCar/(parts)/DesiredTorokuDate/DesiredTorokuDateChildCreator'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import {atomTypes} from '@cm/hooks/useJotai'

export const usetorokuDateApplicationModal = () => {
  return useGlobalModalForm<atomTypes[`torokuDateApplicationForm`]>(`torokuDateApplicationForm`, null, {
    mainJsx: props => {
      const {newCar} = props.GMF_OPEN
      return (
        <DesiredTorokuDateChildCreator
          {...{
            settorokuDateApplicationFormOpen: props.setGMF_OPEN,
            newCar,
            additionalWhere: {},
          }}
        />
      )
    },
  })
}
