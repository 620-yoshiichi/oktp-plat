import {userForselectConfig} from '@app/(apps)/newCar/(constants)/forSelectConfig'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {Prisma} from '@prisma/generated/prisma/client'
import React from 'react'

export default function StuffSwitcher(props: {newCar}) {
  const {router} = useGlobal()
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      {
        id: `userId`,
        label: `担当スタッフ`,
        forSelect: {
          config: {
            where: userForselectConfig.where ?? {},
          },
        },
      },
    ]).transposeColumns(),
    formData: {userId: props.newCar.userId},
  })

  const onSubmit = async data => {
    if (props.newCar.orderSwitchingHisotoryId) {
      const args: Prisma.NewCarUpdateArgs = {
        where: {
          id: props.newCar.id,
        },
        data: {
          OrderSwitchingHisotory: {
            upsert: {
              where: {id: props.newCar.orderSwitchingHisotoryId ?? 0},
              create: {userId: data.userId},
              update: {userId: data.userId},
            },
          },
        },
      }
      const res = await doStandardPrisma(`newCar`, `update`, args)
      toastByResult(res)
    } else {
      const res = await doStandardPrisma(`orderSwitchingHisotory`, `create`, {
        data: {
          User: {connect: {id: data.userId}},
          NewCar: {connect: {id: props.newCar.id}},
        },
      })
      toastByResult(res)
    }

    await doStandardPrisma(`newCar`, `update`, {
      where: {id: props.newCar.id},
      data: {userId: data.userId},
    })

    router.refresh()
  }
  return (
    <div>
      <small className={`text-error-main`}>
        <span>担当スタッフを変更する際は、必ず店長同士で確認を取り合ってください。</span>
        <span>変更は、このアプリ内のみで実施され,ai21上の注文データ上は、受注時のスタッフ、店舗のまま変更ありません。</span>
      </small>
      <BasicForm
        {...{
          alignMode: 'col',
          onSubmit,
          latestFormData,
        }}
      >
        <Button>変更</Button>
      </BasicForm>
    </div>
  )
}
