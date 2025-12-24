import React from 'react'
import {toast} from 'react-toastify'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'
import {limitEditting} from '@cm/constants/defaults'
import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import {QueryBuilder} from '@app/(apps)/ucar/class/QueryBuilder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'
import {OKTP_CONSTANTS} from '@app/oktpCommon/constants'
import {UcarCL, ucarData} from '@app/(apps)/ucar/class/UcarCL'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {UseRecordsReturn} from '@cm/components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'

export default function PaperWorkNoteCreator(props: {UcarData: ucarData; UseRecordsReturn: UseRecordsReturn}) {
  const {UcarData, UseRecordsReturn} = props
  const useGlobalProps = useGlobal()
  const {router, accessScopes, session, query, toggleLoad} = useGlobalProps
  const scopes = accessScopes()
  const include = QueryBuilder.getInclude({session, query}).ucarPaperWorkNotes.include as any

  if (!UcarData) return <></>
  return (
    <ChildCreator
      {...{
        columns: ColBuilder.UcarPaperWorkNotes({useGlobalProps}),
        ParentData: UcarData,
        models: {parent: 'ucar', children: 'ucarPaperWorkNotes'},
        additional: {
          payload: {ucarId: UcarData.id, userId: session?.id},
          include,
          orderBy: [{createdAt: `desc`}],
        },
        useGlobalProps,
        ...limitEditting({exclusiveTo: scopes.admin}),
        myForm: {
          create: {
            executeUpdate: undefined,
            finalizeUpdate: async props => {
              const {content} = props.res.result
              const ucarPaperWorkNotes = props.res.result

              const TypeObj = UCAR_CODE.PAPER_WORK_NOTE_TYPES.byCode(ucarPaperWorkNotes.type)

              // 不備が申請された場合（解決日が空欄の場合）の処理
              if (TypeObj?.notifyByEmail && !ucarPaperWorkNotes.resolvedAt) {
                const storeManagerWhere = OKTP_CONSTANTS.where.storeManagerWhere

                const {result: SenderUser} = await doStandardPrisma(`user`, `findUnique`, {
                  where: {id: ucarPaperWorkNotes.userId},
                })

                const {result: UcarUser} = await doStandardPrisma(`user`, `findUnique`, {
                  where: {id: UcarData.userId},
                })

                const {result: StoreManagerUsers} = await doStandardPrisma(`user`, `findMany`, {
                  where: {
                    AND: [
                      //
                      storeManagerWhere,
                      {storeId: UcarData.storeId},
                    ],
                  },
                })

                // 不備区分のラベルを取得
                const inadequacyTypeLabel = TypeObj.label || ''
                const ucarData = await UcarCL.fetcher.getUcarDataBySateiId(UcarData.sateiID)
                const ucarInst = new UcarCL(ucarData)

                const text = [
                  `査定番号: ${ucarInst.notation.sateiID}`,
                  `お客様名: ${ucarInst.notation.customerName}`,
                  `車名: ${ucarInst.notation.modelName}`,
                  `印鑑証明期限: ${formatDate(ucarInst.data.inkanCertificateExpiredAt)}`,
                  ``,
                  `不備区分: ${inadequacyTypeLabel}`,
                  `不備申請者: ${SenderUser?.name}`,
                  `不備内容: ${content}`,
                ].join('\n')

                await knockEmailApi({
                  subject: `QRシステム書類不備通知`,
                  text,
                  to: [UcarUser?.email],
                  cc: [SenderUser?.email, ...StoreManagerUsers.map(user => user.email)],
                  attachments: [],
                })

                toast.info('メールを送信しました')
                window.open(`/ucar/fubiHensoHyo/${ucarPaperWorkNotes.id}`, '_blank')
              }

              // const LatestUcarPaperWorkNotes = [
              //   ...UcarData.UcarPaperWorkNotes.filter(d => d.id !== ucarPaperWorkNotes.id),
              //   ucarPaperWorkNotes,
              // ].sort((a, b) => {
              //   return a.createdAt > b.createdAt ? -1 : 1
              // })

              // mutateRecords({
              //   record: {
              //     ...UcarData,
              //     UcarPaperWorkNotes: LatestUcarPaperWorkNotes,
              //   },
              // })

              // router.refresh()
              //

              await UseRecordsReturn?.refreshSingleRecord({
                findUniqueWhereArgs: {
                  sateiID: UcarData.sateiID,
                },
              })
            },
          },
        },
      }}
    />
  )
}
