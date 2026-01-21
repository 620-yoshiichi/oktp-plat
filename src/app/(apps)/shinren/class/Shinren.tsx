import { C_Stack, R_Stack } from '@cm/components/styles/common-components/common-components'
import { arrToLines } from '@cm/components/utils/texts/MarkdownDisplay'
import { T_LINK } from '@cm/components/styles/common-components/links'

import { HREF } from '@cm/lib/methods/urls'
import { breakLines } from '@cm/lib/value-handler'

import { PencilSquareIcon } from '@heroicons/react/20/solid'
import { roleIs } from 'src/non-common/scope-lib/judgeIsAdmin'
import { forSelectConfig } from '@cm/types/select-types'

export class Shinren {
  static col = {

    userIdColumn: {
      label: 'スタッフ',
      id: 'userId',
      form: {},
      forSelect: {
        config: {
          where: {
            app: 'shinren',
          },
          orderBy: [
            {
              RentaStore: { code: 'asc' },
            },
            { code: 'asc' },
          ],
        },
      },
    },
  }
  static constants = {
    resultTypes: [
      { value: '継続する', color: '#008000' },
      { value: '継続しない', color: '#B22222' },
    ],
    approachTypes: [
      { value: '訪問[面談]', color: '#B22222' },
      { value: '訪問[不在]', color: '#FFD700' },
      { value: '電話', color: '#008000' },
      { value: 'その他', color: '#b8b8b8' },
    ],
    visitTypes: [
      { value: '新規[継続]', color: '#B22222' },
      { value: '新規', color: '#e0a63a' },
      { value: '管理', color: '#FFD700' },
      // {value: '管理[緊急措置]', color: '#0b0b0b'},
      { value: 'その他', color: '#008000' },
    ],
    userTypes: [
      { value: '本社', color: '#B22222' },
      { value: 'マネージャー', color: '#FFD700' },
      { value: '営業', color: '#008000' },
    ],

    dealType: [
      { value: `新規`, color: '#B22222' },
      { value: `増車`, color: '#FFD700' },
      { value: `更新`, color: '#008000' },
      { value: `再`, color: '#1E90FF' },
    ],

    purposeType: [
      { value: `促進`, color: '#008000' },
      { value: `雑用`, color: '#b8b8b8' },
    ],

    alternateType: [
      { value: `車検満了`, color: '#B22222' },
      { value: `他社リースアップ`, color: '#FFD700' },
      { value: `自社リース更新`, color: '#008000' },
    ],

    insuranceCompany: [
      { value: '東海' },
      { value: 'あいおい' },
      { value: '三井' },
      { value: '損保J' },
      { value: 'JA共済' },
      { value: 'ネット' },
      { value: 'その他' },
    ],

    HvEvFc: [
      { value: 'HV', color: '#B22222' },
      { value: 'EV', color: '#FFD700' },
      { value: 'FC', color: '#008000' },
    ],

    matOptions: [
      { value: '未発注', color: 'gray' },
      { value: '発注済み', color: 'skyblue' },
    ],

    calendarDataTypes: [
      { name: '代替', value: 'AlternateInfo', color: '#c0d1a5' },
      { name: '保険', value: 'InsuranceInfo', color: '#ffea60' },
      { name: '顧客記録', value: 'ExtraInfo', color: '#ffa1a1' },
    ],
  }

  static rentaCustomer = {
    getForSelectConfig: ({ session }) => {
      const option = { style: { width: 280, fontSize: 14 } }
      const config: forSelectConfig = {
        modelName: 'rentaCustomer',
        select: {
          code: `text`,
          name: `text`,
          nameTop: `text`,
          nameBottom: `text`,
          address1: `text`,
          kana: `text`,
        },
        where: { userId: session?.id },
        nameChanger: (op: any) => {
          const label = Shinren.rentaCustomer.getUniqueName(op)
          return { ...op, label }
        },
      }
      return { option, config }
    },
    getCustomerDetailLink: ({ customer, query, mode = 'detail' }) => {
      let name = undefined
      if (mode === `simple`) {
        name = arrToLines([customer.code, customer.name])
      } else if (mode === `detail`) {
        name = Shinren.rentaCustomer.getUniqueName(customer)
      }
      name = breakLines(name)
      const detailLink = HREF(`/shinren/admin/config/rentaCustomer/${customer?.id}`, {}, query)

      return (
        <R_Stack className={`items-start gap-0.5`}>
          <T_LINK className={`onHover`} href={detailLink}>
            <PencilSquareIcon className={`w-5`} />
          </T_LINK>
          <C_Stack>{name}</C_Stack>
        </R_Stack>
      )
    },
    getUniqueName: cstmr => {
      const { code, name, nameTop, nameBottom, address1, kana } = cstmr ?? {}

      if (!nameTop && !nameBottom && !address1) return cstmr?.name

      const data = arrToLines([
        // こちらに変更
        `[CD]${code ? code : ''}`,
        `[略] ${name ? name : ''}`,
        `[住]${address1 ? address1 : ''}`,
      ])
      // const data = arrToLines([
      //   `[CD]${code ? code : ''}`,
      //   `[上]${nameTop ? nameTop : ''}`,
      //   `[下]${nameBottom ? nameBottom : ''}`,
      //   `[住]${address1 ? address1 : ''}`,
      //   `[カナ]${kana ? kana : ''}`,
      // ])

      return data
    },
    getRepresentative: cstmr => {
      const preFix = cstmr?.repPos ? `[${cstmr.repPos}]` : ''
      const affix = cstmr?.repName ? cstmr.repName : ''
      return preFix + affix
    },
    hasNeoData: cstmr => {
      const { code, nameTop } = cstmr
      return code && nameTop
    },

    merge: () => {
      const checkIsMergeAvailavle = ({ mergeRequiredAppCustomer, currentKanriCustomer }) => {
        return mergeRequiredAppCustomer
          .map(c => {
            const mergeCandidates = currentKanriCustomer.filter(k => {
              const hitbyNmae = k?.name?.includes(c?.name)
              const hitbyUser = c?.User.code === k.User.code

              return hitbyNmae && hitbyUser
            })

            return {
              ...c,
              mergeCandidates: mergeCandidates,
            }
          })
          .sort((a, b) => {
            return a.mergeCandidates ? -1 : 1
          })
      }
      const kanriCustomerWhere = {
        type: `管理`,
        code: { not: null },
      }

      // const mergeRequiredCustomerWhere = {
      //   ...QueryBuilder.EasySearch({})?.rentaCustomer?.().notInNeoSystem?.CONDITION,
      // }

      return {
        kanriCustomerWhere,
        checkIsMergeAvailavle,
        // mergeRequiredCustomerWhere,
      }
    },
  }

  static getUserId = ({ session, query }) => {
    const schoolId = roleIs(['管理者'], session) ? Number(query?.userId ?? session?.id ?? 0) : Number(session?.id ?? 0)

    return schoolId
  }
}
