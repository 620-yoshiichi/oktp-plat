'use server'

import {easySearchType} from '@cm/class/builders/QueryBuilderVariables'

import {ucarEasySearchBuilderAtom} from 'src/non-common/EsCollection/ucarEasySearchBuilderAtom'

export const ucarEasySearchBuilder = async () => {
  const ucar = async (props: easySearchType) => {
    const {groups} = await ucarEasySearchBuilderAtom(props)

    return groups
  }

  return {ucar}
}
