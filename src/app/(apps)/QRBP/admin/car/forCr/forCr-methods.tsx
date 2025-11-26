'use client'

import {toast} from 'react-toastify'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

import {arrToLines} from '@cm/components/utils/texts/MarkdownDisplay'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@cm/class/Fields/Fields'
import {Prisma} from '@prisma/client'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Days} from '@cm/class/Days/Days'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {separateFormData} from '@cm/lib/formMethods/separateFormData'

export const createCrCar = async ({session, toggleLoad, latestFormData, formData: oldFormData, columns}) => {
  if (!String(latestFormData?.bpNumber).startsWith('30')) {
    latestFormData.bpNumber = `30 ${String(latestFormData?.bpNumber).replace(/\s/g, '')}`
  }
  const regex = /^30\s\d{5}$/
  const isValidBpNumber = String(latestFormData.bpNumber).match(regex)
  if (!isValidBpNumber) {
    alert('BP番号が正しくありません')
    return {result: oldFormData, success: false, message: 'BP番号が正しくありません'}
  }

  const allProcesses = await (await BP_Car.getProcessNameMasters()).asArray
  const acceptionProcess = allProcesses.find(process => process.name === 'CR受入')
  const allowanceProcess = allProcesses.find(process => process.name === '着工許可')

  const startProcess = allProcesses.find(process => process.name === '着工指示')
  let CreateNewAcception: any = {}
  const accepted = new BP_Car(latestFormData).findProcessByName('CR受入')

  if (!accepted) {
    if (confirm(`${latestFormData.bpNumber}を受け入れますか？`)) {
      CreateNewAcception = {
        Process: {
          createMany: {
            data: [
              {
                name: acceptionProcess.name,
                processNameMasterId: Number(acceptionProcess.id),
                userId: session?.id,
                storeId: latestFormData?.storeId,
              },
            ],
          },
        },
      }

      if (latestFormData.prePermission === true) {
        if (confirm('事前着工許可をしてもよろしいですか？')) {
          CreateNewAcception?.Process.createMany.data.push({
            name: allowanceProcess.name,
            processNameMasterId: Number(allowanceProcess.id),
            userId: session?.id,
            storeId: latestFormData?.storeId,
          })
        }
      }
      if (latestFormData.preStart === true) {
        if (confirm('事前着工指示をしてもよろしいですか？')) {
          CreateNewAcception?.Process.createMany.data.push({
            name: startProcess.name,
            processNameMasterId: Number(startProcess.id),
            userId: session?.id,
            storeId: latestFormData?.storeId,
          })
        }
      }
    } else {
      return
    }
  }

  const res = await toggleLoad(async () => {
    const {modelBasicData} = separateFormData({
      dataModelName: 'car',
      latestFormData,
      additionalPayload: {},
      columns,
    })

    const complexKey = `${modelBasicData?.bpNumber}_${formatDate(modelBasicData?.orderedAt)}`

    let id = latestFormData?.id
    const where = id > 0 ? {id} : {complexKey}

    const upsertCarWhenNewDateCreationRes = await doStandardPrisma('car', 'upsert', {
      where: where,
      ...createUpdate({...modelBasicData, complexKey}),
      include: {
        User: {},
        Process: {
          include: {
            ProcessNameMaster: {},
          },
        },
      },
    })

    if (upsertCarWhenNewDateCreationRes.error) {
      toast.error(upsertCarWhenNewDateCreationRes.message)
      return {result: oldFormData, success: false, message: upsertCarWhenNewDateCreationRes.message}
    }

    id = upsertCarWhenNewDateCreationRes?.result?.id

    const payload = {
      ...modelBasicData,
      // ...relationIds,
      ...CreateNewAcception,
    }

    const {result: oldCar} = await doStandardPrisma('car', 'upsert', {
      where: {id},
      include: {User: {}},
      ...createUpdate({...modelBasicData}),
    })

    const oldScheduledAt = oldFormData?.scheduledAt ? new Date(oldFormData?.scheduledAt) : undefined

    const newScheduledAt = new Date(payload?.scheduledAt)

    const ScheduledHasChanged = oldScheduledAt && !Days.validate.isSameDate(oldScheduledAt, newScheduledAt)

    if (ScheduledHasChanged) {
      const msg = arrToLines([
        `予定が変更されると、課長と拠点アドバイザーにメールが送信されます。よろしいですか？`,
        `${formatDate(oldScheduledAt)} => ${formatDate(newScheduledAt)}`,
      ])
      if (!confirm(msg)) return

      const {result} = await doStandardPrisma('user', 'findMany', {
        where: {UserRole: {some: {RoleMaster: {name: `BP課長`}}}},
      })
      const notifyTargets = [result[0]?.email]

      const text = `車両の到着予約日が変更されました。${formatDate(oldScheduledAt)} => ${formatDate(newScheduledAt)}`
      notifyTargets.push(oldCar.User.email)
      await knockEmailApi({
        subject: 'BPシステム【日程変更】のお知らせ',
        to: notifyTargets,
        text: [
          text,
          `【BP番号:${oldCar.bpNumber}】`,
          `【車名:${oldCar.carName}】`,
          `【お客様:${oldCar.customerName}】`,
          `【プレート:${oldCar.plate}】`,
          `【フレーム:${oldCar.frame}】`,
          `【型式:${oldCar.katashiki}】`,
        ].join(`\n`),
      })

      toast.info(text)
    }

    const res = await doStandardPrisma('car', 'update', {
      where: {id},
      data: {...payload},
      include: {
        Process: {
          include: {
            ProcessNameMaster: {},
          },
        },
      },
    })

    const crUserId = modelBasicData?.crUserId

    const args: Prisma.CrUserUpsertArgs = {
      where: {carId: id},
      create: {carId: id, userId: crUserId},
      update: {userId: crUserId},
    }
    const {result: createdCrUser} = await doStandardPrisma(`crUser`, 'upsert', args)

    return res
  })

  return res
}

export const DamageSelectModal = ({showDamageSelector, setshowDamageSelector, toggleLoad}) => {
  const columns = Fields.transposeColumns([
    {
      id: 'damageNameMasterId',
      label: 'ダメージ',
      forSelect: {},
      form: {},
    },
  ])
  const {id} = showDamageSelector

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns,
    formData: showDamageSelector,
    onFormItemBlur: async props => {
      const {name, value, newlatestFormData} = props

      toggleLoad(
        async () => {
          await doStandardPrisma('car', 'update', {where: {id}, data: {[name]: value}})
        },
        {refresh: true}
      )
      setshowDamageSelector(false)
    },
  })

  if (!showDamageSelector) return <div></div>
  return (
    <BasicForm
      {...{
        alignMode: 'col',
        latestFormData,
      }}
    ></BasicForm>
  )
}
