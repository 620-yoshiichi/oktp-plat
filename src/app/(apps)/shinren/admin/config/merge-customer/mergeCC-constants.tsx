'use client'

import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {UserIcon} from '@heroicons/react/20/solid'
import {breakLines} from '@cm/lib/value-handler'
import {IconBtnForSelect} from '@cm/components/styles/common-components/IconBtn'
import {SquarePen} from 'lucide-react'

export const tableHeaders = {
  common: [`担当`, `コード`, `詳細`, `名前`, `タイプ`, `結果`, `日報件数`, `代替件数`, `保険件数`, `記録件数`],
  right: [],
}

export const LeftTr = ({mergeModalObj, c, query, visitTypes, getCustomerLinkHref, candidateModalObj}) => {
  const {name, type, result, RentaDailyReport, ExtraInfo, AlternateInfo, InsuranceInfo, mergeCandidatesIds} = c
  const typeColor = visitTypes.find(v => v.value === type)?.color ?? ''

  return (
    <tr key={c.id} className={`text-center`}>
      <Td>{c.User?.name}</Td>
      <Td>{c.code}</Td>
      <Td>
        <T_LINK href={getCustomerLinkHref({custoemr: c, query})}>
          <SquarePen className={`h-5 w-5`}></SquarePen>
        </T_LINK>
      </Td>
      <Td>
        <div className={`[&_div]:!leading-6`}>{name}</div>
      </Td>

      <Td>
        <IconBtnForSelect color={typeColor}>{type}</IconBtnForSelect>
      </Td>
      <Td>{result}</Td>
      <Td>{RentaDailyReport?.length ?? 0}</Td>
      <Td>{AlternateInfo?.length ?? 0}</Td>
      <Td>{InsuranceInfo?.length ?? 0}</Td>
      <Td>{ExtraInfo?.length ?? 0}</Td>
      <Td>
        <div className={`text-sm`}>
          {mergeCandidatesIds.length > 0 ? (
            <Button
              className={`w-[60px] `}
              color={mergeCandidatesIds.length > 0 ? `red` : `gray`}
              onClick={() => {
                candidateModalObj.handleOpen(c)
              }}
            >
              <R_Stack className={`flex-nowrap   justify-center gap-0 `}>
                {mergeCandidatesIds.map((d, i) => {
                  return <UserIcon key={i} className={`h-5 w-5 text-white`}></UserIcon>
                })}
                {/* <span>({mergeCandidatesIds.length})</span> */}
              </R_Stack>
            </Button>
          ) : (
            <Button
              onClick={() => {
                candidateModalObj.handleOpen(c)
              }}
            >
              手動
            </Button>
          )}
        </div>
      </Td>
    </tr>
  )
}
export const RightTr = ({c, query, visitTypes, getCustomerLinkHref}) => {
  const {id, code, name, type, result, RentaDailyReport, User, ExtraInfo, AlternateInfo, InsuranceInfo} = c
  const uniqueName = Shinren.rentaCustomer.getUniqueName(c)
  const typeColor = visitTypes.find(v => v.value === type)?.color ?? ''

  return (
    <tr key={c.id} className={`text-center`}>
      <Td>{c.User?.name}</Td>
      <Td>{c.code}</Td>

      <Td>
        <T_LINK href={getCustomerLinkHref({custoemr: c, query})}>
          <SquarePen className={`h-5 w-5`}></SquarePen>
        </T_LINK>
      </Td>
      <Td>
        <div className={`[&_div]:!leading-6`}>{breakLines(uniqueName)}</div>
      </Td>
      <Td>
        <IconBtnForSelect color={typeColor}>{type}</IconBtnForSelect>
      </Td>
      <Td>{result}</Td>
      <Td>{RentaDailyReport?.length ?? 0}</Td>
      <Td>{AlternateInfo?.length ?? 0}</Td>
      <Td>{InsuranceInfo?.length ?? 0}</Td>
      <Td>{ExtraInfo?.length ?? 0}</Td>
    </tr>
  )
}

const Td = ({children}) => {
  return <td className={children ? `` : `text-xs text-gray-300`}>{children}</td>
}
