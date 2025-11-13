import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {atomTypes} from '@cm/hooks/useJotai'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export const useTorokuMikomiFormModal = () => {
  return useGlobalModalForm<atomTypes[`torokuMikomiApplicationForm`]>(`torokuMikomiApplicationForm`, null, {
    mainJsx: props => {
      const {router} = useGlobal()
      const {GMF_OPEN, setGMF_OPEN, close} = props
      const {newCar} = GMF_OPEN
      const {BasicForm, latestFormData} = useBasicFormProps({
        formData: {
          m1_toroku_prediction: newCar?.m1_toroku_prediction,
        },
        columns: new Fields([
          {
            ...{id: `m1_toroku_prediction`, label: `登録見込`, type: `month`},
            form: {},
          },
        ]).transposeColumns(),
      })

      const onSubmit = async data => {
        await doStandardPrisma(`newCar`, `update`, {
          where: {id: newCar.id},
          data: {m1_toroku_prediction: data.m1_toroku_prediction},
        })
        router.refresh()
        close()
      }

      return (
        <BasicForm {...{latestFormData, onSubmit}}>
          <Button>変更</Button>
        </BasicForm>
      )
    },
  })
}
