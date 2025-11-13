'use client'

const GlobalIdSelector = dynamic(() => import('@cm/components/GlobalIdSelector/GlobalIdSelector'), {})
import dynamic from 'next/dynamic'
import {Fields} from '@cm/class/Fields/Fields'
import {roleMaster} from '@cm/class/builders/PageBuilderVariables'

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
            id: 'g_userId',
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

      return (
        <GlobalIdSelector
          {...{
            useGlobalProps,
            columns,
          }}
        />
      )
    }
  }
}
