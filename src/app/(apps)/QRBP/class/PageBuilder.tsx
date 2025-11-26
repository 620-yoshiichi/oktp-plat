'use client'

import {Fields} from '@cm/class/Fields/Fields'
import {roleMaster} from '@cm/class/builders/PageBuilderVariables'
import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import {globalIds} from 'src/non-common/searchParamStr'

export class PageBuilder {
  static roleMaster = roleMaster
  static getGlobalIdSelector = ({useGlobalProps}) => {
    const admin = useGlobalProps.accessScopes().admin

    return () => {
      if (!admin) {
        return <></>
      }

      const columns = Fields.transposeColumns([])
      if (admin) {
        columns.push([
          {
            label: 'ス',
            id: globalIds.globalUserId,
            form: {},
            forSelect: {
              config: {
                modelName: `user`,
                where: {
                  // storeId: {not: null},
                  // OR: [{type: {contains: 'CR'}}, {type: {contains: '拠点'}}],
                },
              },
            },
          },
        ])
      }

      return <GlobalIdSelector {...{useGlobalProps, columns}} />
    }
  }
}
