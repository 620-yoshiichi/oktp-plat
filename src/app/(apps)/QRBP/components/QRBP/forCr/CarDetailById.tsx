'use client'
import React from 'react'

import dynamic from 'next/dynamic'
import {basePath} from '@cm/lib/methods/common'
import {toast} from 'react-toastify'
import {BP_Car} from '@app/(apps)/QRBP/class/BP_Car'

import {ColBuilder} from '@app/(apps)/QRBP/class/ColBuilder'

import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

// import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'

import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import {updateSimply} from '@cm/lib/formMethods/updateSimply'
import {ClientPropsType2} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

const BasicTabs = dynamic(() => import('@cm/components/utils/tabs/BasicTabs'), {
  loading: () => <></>,
})

const CarProcessChildCreator = dynamic(() => import('./CarProcessChildCreator'), {
  loading: () => <></>,
})

export default function CarDetailById(dataViewrProps: ClientPropsType2) {
  const {useGlobalProps} = dataViewrProps
  const {toggleLoad, session, pathname, accessScopes} = useGlobalProps

  const columns = ColBuilder.carForCr({useGlobalProps})

  const {dataModelName, formData, setformData, myForm} = dataViewrProps

  const isAccepted = new BP_Car(formData ?? {}).findProcessByName('CR受入')
  const dataExist = !!formData?.id
  const renderProcessCreator = () => {
    return {
      exclusiveTo: dataExist && isAccepted && accessScopes()?.getQrbpProps()?.cr && !pathname.includes('forStore'),
      label: '工程チェック',
      component: (
        <div>
          <CarProcessChildCreator {...{formData, useGlobalProps}} />
        </div>
      ),
    }
  }

  const renderNoteCreator = () => {
    return {
      exclusiveTo: dataExist && isAccepted,
      label: '各種申請',

      component: (
        <div>
          <ChildCreator
            {...{
              useGlobalProps,
              ParentData: formData ?? {},
              models: {parent: 'car', children: 'notes'},
              columns: ColBuilder.notes({useGlobalProps}),
              myForm: {
                create: {
                  executeUpdate: async ({latestFormData}) => {
                    const {noteNameMasterId} = latestFormData
                    return await toggleLoad(async () => {
                      if (confirm('対象のアドバイザへメール通知が行きます。よろしいですか？')) {
                        const upsertType = latestFormData.id ? 'update' : 'create'

                        const res = await doStandardPrisma('noteNameMaster', 'findUnique', {
                          where: {id: noteNameMasterId},
                        })
                        const {result: noteNameMaster} = res

                        //1回目のみ中断工程を登録する。
                        if (upsertType === 'create') {
                          if (noteNameMaster.name === '中断' || noteNameMaster?.name === 'キャンセル') {
                            new BP_Car(formData ?? {}).setProcess(session, noteNameMaster.name, false)
                          }
                        }

                        const {result: user} = await doStandardPrisma(`user`, `findUnique`, {
                          where: {id: session.id},
                          include: {UserRole: {include: {RoleMaster: true}}},
                        })

                        const senderType = user?.UserRole?.find(r => r.RoleMaster.name === 'CRアドバイザ')
                          ? 'CRアドバイザ'
                          : user?.UserRole?.find(r => r.RoleMaster.name === '拠点アドバイザ')
                            ? '拠点アドバイザ'
                            : ''

                        const {subject, text, to} = getMailInfo({
                          car: formData,
                          latestFormData,
                          noteNameMaster,
                          session,
                          senderType,
                        })

                        // メールを送付する。
                        knockEmailApi({
                          to,
                          subject: subject,
                          text: text,
                        })

                        await updateSimply({
                          extraFormState: {},
                          columns,
                          latestFormData,
                          dataModelName: 'notes',
                          additionalPayload: {
                            carId: formData?.id,
                            userId: session?.id,
                          },
                          initialModelData: formData,
                        })

                        toast.warning(`伝言を登録し、担当者へメール通知を行いました。`)
                        setformData(null)
                        return res
                      }
                    })
                  },
                },
              },
              myTable: {pagination: undefined, search: false, style: {minWidth: 300}},
              additional: {},
              nonRelativeColumns: [],
            }}
          />
        </div>
      ),
    }
  }

  return (
    <div>
      <BasicTabs
        id={`carDetailById`}
        showAll={false}
        style={{minWidth: 600}}
        headingText={
          <div className={`row-stack t-heading mx-auto gap-6`}>
            <span>{formData?.customerName}</span>
            <span>{formData?.carName}</span>
            <span>{formData?.Store?.name}</span>
            <span>{formData?.User?.name}</span>
            <span>{formData?.CrUser?.User?.name}</span>
          </div>
        }
        TabComponentArray={[
          {
            exclusiveTo: pathname?.includes('forCr') || pathname?.includes('scheduled'),
            label: '基本情報',
            style: {width: 600},
            component: (
              <div>
                <MyForm
                  {...{
                    ...dataViewrProps,

                    dataModelName,
                    formData,
                    setformData,
                    columns,
                    myForm: {
                      ...myForm,
                      showHeader: car => {
                        return (
                          <div>
                            {!isAccepted && (
                              <div className={`text-error-main text-center font-bold`}>
                                現車確認の上、必要事項を入力し、受け入れを完了してください
                              </div>
                            )}
                            <div className={`row-stack gap-8`}>
                              <p>
                                <span className={`font-bold`}>BP番号: </span>
                                <span>{car?.bpNumber}</span>
                              </p>
                              <p>
                                <span className={`font-bold`}>車名: </span>
                                <span>{car?.carName}</span>
                              </p>
                              <p>
                                <span className={`font-bold`}>お客様名: </span>
                                <span>{car?.customerName}</span>
                              </p>
                            </div>
                          </div>
                        )
                      },
                    },
                  }}
                />
              </div>
            ),
          },

          /**プロセス */

          renderProcessCreator(),

          /**各種申請 */
          renderNoteCreator(),
        ]}
      />
    </div>
  )
}

function getMailInfo({car, latestFormData, noteNameMaster, session, senderType}) {
  const {carName, plate, customerName} = car
  const {content} = latestFormData
  const noteType = noteNameMaster.name
  const sender = session

  const subject = `(自動送信)BP「${noteType}」通知 ${sender.name}より [${carName}:${customerName}]に関する通知`
  const text = `下記の車両について申請事項の通知があります。
  詳しくは、こちらから閲覧できます。

  ${basePath}/QRBP/admin/car/forCr?where-car-id-equals-number=${car?.id}
  通知種別:【${noteType}】
  車名: ${carName}
  お客様名: ${customerName}
  プレート: ${plate}
  送信者: ${sender.name}

  -----申請内容-----
  ${content}
  -----------------`

  const to = [`mutsuo_yoshiichi@okayama-toyopet.jp`]
  if (senderType === 'CRアドバイザ') {
    to.push(car?.User?.email)
  } else {
    to.push(car?.CrUser?.User?.email)
  }

  console.info('伝言登録時メール送信', to)
  return {subject, text, to}
}
