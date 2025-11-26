'use client'

import React from 'react'

import {useEffect} from 'react'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import {Fields} from '@cm/class/Fields/Fields'

import {FitMargin} from '@cm/components/styles/common-components/common-components'
import {UserIcon} from '@heroicons/react/20/solid'
import {CircledIcon} from '@cm/components/styles/common-components/IconBtn'
import ShadModal from '@cm/shadcn/ui/Organisms/ShadModal'
export const WhoAreYou = ({addQuery, query}) => {
  const columns = Fields.transposeColumns([
    {
      id: 'userId',
      label: '',
      form: {},
      forSelect: {
        config: {
          where: {
            active: {not: false},
            UserRole: {some: {RoleMaster: {name: 'CRエンジニア'}}},
          },
        },
      },
    },
    {
      id: 'favorite',
      label: '★',
      type: 'boolean',
      form: {},
    },
  ])

  const {BasicForm, latestFormData, ReactHookForm} = useBasicFormProps({
    columns,
    formData: {userId: query.userId, favorite: query.favorite},
  })

  const {userId, favorite} = latestFormData

  useEffect(() => {
    if (query) {
      let newQuery: any = {}
      if (userId !== query.userId) {
        newQuery = {...newQuery, userId}
      }
      if (favorite !== query.favorite) {
        newQuery = {...newQuery, favorite}
      }
      if (Object.keys(newQuery).length === 0) return

      if (Object.keys(newQuery).length === 0) return

      addQuery({...query, ...newQuery})
    }
  }, [userId, favorite, query])

  const userSelected = query?.userId
  const Main = () => {
    return (
      <>
        <FitMargin>
          <div className={`mx-auto max-w-sm gap-2`}>
            <BasicForm
              {...{
                latestFormData,
                alignMode: 'row',
                ControlOptions: {ControlStyle: {width: 130}},
              }}
            />
          </div>
        </FitMargin>
      </>
    )
  }
  if (userSelected) {
    return (
      <>
        <ShadModal
          {...{
            Trigger: (
              <CircledIcon>
                <UserIcon />
              </CircledIcon>
            ),
          }}
        >
          <div className={`py-4`}>
            <Main />
          </div>
        </ShadModal>
      </>
    )
  } else {
    return <Main />
  }
}
