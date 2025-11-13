import {Fields} from '@cm/class/Fields/Fields'
import {colType} from '@cm/types/col-types'
import {useGlobalPropType} from '@cm/hooks/globalHooks/useGlobal'

import {getForSelectWhere} from '@app/(apps)/newCar/(constants)/forSelectConfig'
import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'

export const CommonGlobalIdSelector = (props: {useGlobalProps: useGlobalPropType; width}) => {
  const {useGlobalProps} = props
  const {query, session} = useGlobalProps
  const admin = useGlobalProps.accessScopes().admin
  const {isHQ, isStoreManager} = useGlobalProps.accessScopes().getNewCarProps()
  const storeId = isStoreManager ? session.storeId : query.g_storeId ? Number(query.g_storeId) : undefined

  return () => {
    const colSource: colType[] = []

    if (isHQ) {
      colSource.push({id: 'g_storeId', label: '拠点', forSelect: {}})
    }

    if (isHQ || isStoreManager) {
      colSource.push({
        id: 'g_selectedUserId',
        forSelect: {config: getForSelectWhere({storeId})},
        label: 'ユーザ',
      })
    }

    if (admin) {
      colSource.push({
        id: 'g_userId',
        forSelect: {},
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
