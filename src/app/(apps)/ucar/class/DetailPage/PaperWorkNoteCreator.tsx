import React from 'react'
import {toast} from 'react-toastify'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'
import {limitEditting} from '@cm/constants/defaults'
import {ColBuilder} from '@app/(apps)/ucar/class/ColBuilder/ColBuilder'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import {QueryBuilder} from '@app/(apps)/ucar/class/QueryBuilder'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {atomTypes} from '@cm/hooks/useJotai'
import {UCAR_CODE} from '@app/(apps)/ucar/class/UCAR_CODE'

export default function PaperWorkNoteCreator(props: atomTypes[`selectedUcarNotes`]) {
  const {UcarData, mutateRecords} = props
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

              if (TypeObj?.notifyByEmail) {
                const {result: targetUsers} = await doStandardPrisma(`user`, `findMany`, {
                  where: {
                    OR: [{id: UcarData.userId}, {AND: [{storeId: UcarData.storeId}, {role: {in: [`店長`]}}]}],
                  },
                })

                await knockEmailApi({
                  subject: `QRシステム書類不備`,
                  text: content,
                  to: targetUsers.map(user => user.email),
                })
                toast.info('メールを送信しました')
              }

              const LatestUcarPaperWorkNotes = [
                ...UcarData.UcarPaperWorkNotes.filter(d => d.id !== ucarPaperWorkNotes.id),
                ucarPaperWorkNotes,
              ].sort((a, b) => {
                return a.createdAt > b.createdAt ? -1 : 1
              })

              mutateRecords({
                record: {
                  ...UcarData,
                  UcarPaperWorkNotes: LatestUcarPaperWorkNotes,
                },
              })

              router.refresh()
              //
            },
          },
        },
      }}
    />
  )
}
