'use client'

import {LEAD_TIME_CRITERIA} from '@app/(apps)/newCar/class/LeadTime'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'
import {defaultRegister} from '@cm/class/builders/ColBuilderVariables'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

import {Paper} from '@cm/components/styles/common-components/paper'
import MyPopover from '@cm/components/utils/popover/MyPopover'
import {ChevronDoubleRightIcon} from '@heroicons/react/20/solid'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {columnGetterType} from '@cm/types/types'

import {cl} from '@cm/lib/methods/common'

import {getNewCarCols} from '@app/(apps)/newCar/class/Colbuilder/getNewCarCols'
import {getDesiredTorokuDate} from '@app/(apps)/newCar/class/Colbuilder/getDesiredTorokuDate'
import {allOktpRoles} from '@app/oktpCommon/constants'

export class ColBuilder {
  static roleMaster = (props: columnGetterType) => {
    return new Fields([
      {
        id: `name`,
        label: `役割名称`,
        form: {},
        forSelect: {
          optionsOrOptionFetcher: allOktpRoles,
        },
        format: (value, row) => {
          return (
            <div>
              {value}
              <small>({row.UserRole.length})</small>
            </div>
          )
        },
      },
    ]).transposeColumns()
  }
  static userRole = (props: columnGetterType) => {
    return new Fields([
      {id: `userId`, label: `ユーザー`, forSelect: {}},
      {id: `roleMasterId`, label: `ユーザー`, forSelect: {}},
    ]).transposeColumns()
  }
  static desiredTorokuDate = getDesiredTorokuDate
  static newCar = getNewCarCols

  static store = (props: columnGetterType) => {
    return new Fields([
      {id: `code`, label: `コード`, type: `number`, form: {}},
      {id: `name`, label: `店舗名`, form: {}},
      {id: `tel`, label: `TEL`, form: {}},
      {id: `fax`, label: `FAX`, form: {}},
      {id: `address`, label: `住所`, form: {}},
    ]).transposeColumns()
  }
  static user = (props: columnGetterType) => {
    return new Fields([
      // {id: `test`, label: `galsgsa`, type: `boolean`, form: {}},
      {
        ...{id: 'active', label: 'アクティブ', type: `boolean`},
        form: {},
        sort: {},
      },
      {
        ...{id: 'code', label: 'コード', type: `int`},
        form: {...defaultRegister},
        sort: {},
        search: {},
      },
      {
        ...{id: 'storeId', label: '拠点'},
        forSelect: {},

        form: {...defaultRegister},
        search: {},
        sort: {},
      },
      {...{id: 'name', label: '名称'}, form: {...defaultRegister}, search: {}},
      {...{id: 'email', label: 'Email'}, form: {...defaultRegister}},
      {...{id: 'password', label: 'パスワード', type: `password`}, form: {}},
      {...{id: 'type', label: 'タイプ'}, form: {}},
      {
        ...{id: 'apps', label: 'APPS', type: `array`},
        form: {...defaultRegister},
        format: value => {
          return (
            <R_Stack>
              {value.map(d => (
                <IconBtn key={d}>{d}</IconBtn>
              ))}
            </R_Stack>
          )
        },
      },
    ]).transposeColumns()
  }
}

const dateFormatterWithLeadTime = (value, car, col) => {
  const {query} = useGlobal()
  if (col.type === `date`) {
    const dateDisplay = formatDate(value, 'YY年M月D日')
    const LT_CRITERIA = LEAD_TIME_CRITERIA.find(c => c.toKey === col.id)

    if (LT_CRITERIA) {
      const {bgColor, LT, from, to} = new NewCarClass(car).calcLeadTime(LT_CRITERIA)

      const {fromLabel, toLabel} = LT_CRITERIA
      const PopoverBtn = () => {
        // const isFiltered =

        const active = query[LT_CRITERIA.id]

        return (
          <R_Stack className={cl(active ? 'border-sub-main scale-110 rounded-md border-2 p-0.5 shadow' : 'opacity-60')}>
            <IconBtn className={`!w-fit text-xs`} color={bgColor}>
              <span>{dateDisplay} </span>
              {LT && <IconBtn className={`ml-1 rounded-full  text-xs`}>{LT}</IconBtn>}
            </IconBtn>
          </R_Stack>
        )
      }

      return (
        <MyPopover button={<PopoverBtn />}>
          <Paper>
            <C_Stack>
              <div>
                <strong>{LT_CRITERIA.name}</strong>の基準値は、<strong>{LT_CRITERIA.max}</strong>日です。
              </div>
              <table>
                <tbody>
                  <tr>
                    <td>{fromLabel}</td>
                    <td></td>
                    <td>{toLabel}</td>
                  </tr>
                  <tr>
                    <td>{formatDate(from)}</td>
                    <td>
                      <R_Stack>
                        <ChevronDoubleRightIcon className={`w-6`} />
                        <IconBtn className={`!w-fit`} color={bgColor}>
                          {LT}日
                        </IconBtn>
                        <ChevronDoubleRightIcon className={`w-6`} />
                      </R_Stack>
                    </td>
                    <td>{formatDate(to)}</td>
                  </tr>
                </tbody>
              </table>
            </C_Stack>
          </Paper>
        </MyPopover>
      )
    } else {
      return <>{dateDisplay}</>
    }
  } else {
    return value
  }
}
