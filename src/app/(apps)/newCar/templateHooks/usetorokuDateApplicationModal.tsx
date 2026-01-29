import DesiredTorokuDateChildCreator from '@app/(apps)/newCar/(parts)/DesiredTorokuDate/DesiredTorokuDateChildCreator'
import { useGlobalModalForm } from '@cm/components/utils/modal/useGlobalModalForm'
import { torokuDateApplicationForm } from '@app/(apps)/newCar/(parts)/DesiredTorokuDate/DesiredTorokuDateRegister'


export const usetorokuDateApplicationModal = () => {
  return useGlobalModalForm<torokuDateApplicationForm>(`torokuDateApplicationForm`, null, {
    mainJsx: props => {
      const { newCar } = props.GMF_OPEN
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
