import {Fields} from '@cm/class/Fields/Fields'
import {colType} from '@cm/types/col-types'
import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'

import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import {globalIds} from 'src/non-common/searchParamStr'

export const CommonGlobalIdSelector = (props: {useGlobalProps: useGlobalPropType; width}) => {
  const {useGlobalProps} = props
  const {query, session} = useGlobalProps
  const admin = useGlobalProps.accessScopes().admin
  const {isHQ, isStoreManager} = useGlobalProps.accessScopes().getNewCarProps()
  const storeId = isStoreManager
    ? session.storeId
    : query?.[globalIds.globalStoreId]
      ? Number(query?.[globalIds.globalStoreId])
      : undefined

  return () => {
    const colSource: colType[] = []

    if (isHQ) {
      colSource.push({
        id: globalIds.globalStoreId,
        label: '拠点',
        forSelect: {
          config: {
            modelName: 'store',
          },
        },
      })
    }

    if (isHQ || isStoreManager) {
      colSource.push({
        id: globalIds.globalSelectedUserId,
        forSelect: {
          // where: getForSelectWhere({storeId}),
          config: {
            modelName: 'user',
          },
        },
        label: 'ユーザ',
      })
    }

    if (admin) {
      colSource.push({
        id: globalIds.globalUserId,
        forSelect: {
          config: {
            modelName: 'user',
          },
        },
        label: 'As',
      })
    }
    const columns = new Fields(colSource)
      .customAttributes(item => {
        return {form: {style: {width: 100, height: 40}}}
      })
      .transposeColumns()

    return (
      <div className={`hidden md:block`}>
        <GlobalIdSelector {...{useGlobalProps, columns}} />
      </div>
    )

    return <></>
  }
}
