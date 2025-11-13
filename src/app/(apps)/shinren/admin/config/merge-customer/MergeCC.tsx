'use client'

import {MergeModal} from '@app/(apps)/shinren/admin/config/merge-customer/MergeModal/MergeModal'
import {useMergedCustomer} from '@app/(apps)/shinren/admin/config/merge-customer/MergeModal/useMergedCustomer'
import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import useModal from '@cm/components/utils/modal/useModal'

import {useEffect, useState} from 'react'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {HREF} from '@cm/lib/methods/urls'
import CustomerSearcher, {searchColKeys} from '@app/(apps)/shinren/admin/config/merge-customer/CustomerSearcher'
import {LeftTr, RightTr, tableHeaders} from '@app/(apps)/shinren/admin/config/merge-customer/mergeCC-constants'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import {SearchedItem} from '@cm/components/styles/common-components/SearchedItem'
import {Button} from '@cm/components/styles/common-components/Button'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {Alert} from '@cm/components/styles/common-components/Alert'

const MergeCC = props => {
  const {query, addQuery, session} = useGlobal()

  const {data: selectedCustomer} = useDoStandardPrisma(`rentaCustomer`, `findUnique`, {where: {id: Number(query.id ?? 0)}})

  const dataSpecified = query.id
    ? props.mergeRequiredAppCustomer.find(c => {
        return String(c.id) === String(query.id)
      })
    : undefined

  const defaults = {
    mergeRequiredAppCustomer: dataSpecified ? [dataSpecified] : props.mergeRequiredAppCustomer,
    currentKanriCustomer: props.currentKanriCustomer,
  }
  const [mergeRequiredAppCustomer, setmergeRequiredAppCustomer] = useState<any>(defaults.mergeRequiredAppCustomer)
  const [currentKanriCustomer, setcurrentKanriCustomer] = useState<any>(defaults.currentKanriCustomer)

  useEffect(() => {
    setmergeRequiredAppCustomer(defaults.mergeRequiredAppCustomer)
  }, [dataSpecified])

  // const {handleOpen, handleClose, Modal, open: CstmrFrom}
  const mergeModalObj = useModal<any>({defaultState: null})
  const candidateModalObj = useModal({})
  const {visitTypes} = Shinren.constants

  const {mergedData, setmergedData} = useMergedCustomer({
    CstmrFrom: mergeModalObj.open.CstmrFrom,
    CstmTo: mergeModalObj.open.CstmTo,
  })

  const [searchInputs, setsearchInputs] = useState({
    mergeRequiredAppCustomer: '',
    currentKanriCustomer: '',
  })

  //検索値によって配列をフィルター
  useChangeFilter({searchInputs, setsearchInputs, defaults, setmergeRequiredAppCustomer, setcurrentKanriCustomer})

  if (selectedCustomer && selectedCustomer.userId !== session?.id) {
    return <Alert color={`red`}>自分の担当顧客以外のデータを見ることはできません。</Alert>
  }

  return (
    <div>
      <candidateModalObj.Modal>
        <section className={`p-2`}>
          {candidateModalObj.open && (
            <C_Stack>
              <section>
                <R_Stack>
                  <small className={`text-error-main font-bold`}>
                    <div>
                      アプリ上の「名前」とNEO上の名称を簡易照合した候補を表示しています。
                      対象データが見つからない場合は、手動で顧客コードを入力して指定してください。
                    </div>
                  </small>
                  <Button
                    color="red"
                    onClick={() => {
                      candidateModalObj.handleClose(null)
                      mergeModalObj.handleOpen({
                        CstmrFrom: candidateModalObj.open,
                        CstmTo: undefined,
                      })
                    }}
                  >
                    手動で候補を検索
                  </Button>
                </R_Stack>
                <C_Stack>
                  {candidateModalObj.open.mergeCandidatesIds?.map(id => {
                    const customer = currentKanriCustomer.find(d => {
                      return d.id === id
                    })

                    const uniqueName = Shinren.rentaCustomer.getUniqueName(customer)
                    return (
                      <div key={id}>
                        <R_Stack className={`flex justify-between border-b-[1px] pb-1`}>
                          <div>
                            <MarkDownDisplay>{uniqueName}</MarkDownDisplay>
                          </div>
                          <Button
                            onClick={() => {
                              candidateModalObj.handleClose(null)
                              mergeModalObj.handleOpen({
                                CstmrFrom: candidateModalObj.open,
                                CstmTo: customer,
                              })
                            }}
                          >
                            統合
                          </Button>
                        </R_Stack>
                      </div>
                    )
                  })}
                </C_Stack>
              </section>
            </C_Stack>
          )}
        </section>
      </candidateModalObj.Modal>
      <mergeModalObj.Modal>
        <section className={`p-2`}>
          <MergeModal
            {...{
              mergeModalObj,
              mergedData,
              setmergedData,
            }}
          ></MergeModal>
        </section>
      </mergeModalObj.Modal>

      <R_Stack className={`items-start justify-around  gap-10`}>
        {/* 左のテーブル */}
        <section>
          <C_Stack>
            <R_Stack className={`justify-between`}>
              <div>
                <strong>統合前顧客</strong>
                <small>({mergeRequiredAppCustomer.length})件</small>
              </div>
              <CustomerSearcher {...{dataKey: 'mergeRequiredAppCustomer', searchInputs, setsearchInputs}}></CustomerSearcher>
            </R_Stack>
            <small>アプリ発行で、NEO顧客コード未入力のもの</small>
            {dataSpecified && (
              <div>
                <SearchedItem {...{value: dataSpecified.name, onClick: () => addQuery({id: undefined})}} />
              </div>
            )}
          </C_Stack>

          <div className={`table-wrapper max-h-[60vh] w-[600px]   `}>
            <table>
              <thead>
                <tr>
                  {tableHeaders.common.map(h => {
                    return <th key={h}>{h}</th>
                  })}
                  <th>統合</th>
                </tr>
              </thead>
              <tbody className={`[&_tr]:!border-y-[1px]`}>
                {mergeRequiredAppCustomer.map(c => {
                  return (
                    <LeftTr
                      key={c.id}
                      {...{
                        mergeModalObj,
                        setsearchInputs,
                        c,
                        query,
                        visitTypes,
                        getCustomerLinkHref,
                        candidateModalObj,
                      }}
                    ></LeftTr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 右のテーブル */}
        <section>
          <C_Stack>
            <R_Stack className={`justify-between`}>
              <div>
                <strong>NEO管理顧客</strong>
                <small>({currentKanriCustomer.length})件</small>
              </div>
              <CustomerSearcher {...{dataKey: `currentKanriCustomer`, searchInputs, setsearchInputs}}></CustomerSearcher>
            </R_Stack>

            <small>
              アプリに反映済みのNEO管理顧客
              <span className={`text-error-main ml-4 font-bold`}>週に1回更新</span>
            </small>
          </C_Stack>
          <div className={`table-wrapper max-h-[60vh]   w-[600px] `}>
            <table>
              <thead>
                <tr>
                  {tableHeaders.common.map(h => {
                    return <th key={h}>{h}</th>
                  })}
                </tr>
              </thead>
              <tbody className={`[&_tr]:!border-y-[1px]`}>
                {currentKanriCustomer.map(c => {
                  return <RightTr key={c.id} {...{c, visitTypes, query, getCustomerLinkHref}}></RightTr>
                })}
              </tbody>
            </table>
          </div>
        </section>
      </R_Stack>
    </div>
  )
}

const getCustomerLinkHref = ({custoemr, query}) => {
  return HREF(`/shinren/admin/config/rentaCustomer/${custoemr?.id}`, {}, query)
}
export default MergeCC

const Td = ({children}) => {
  return <td className={children ? `` : `text-xs text-gray-300`}>{children}</td>
}

const useChangeFilter = ({searchInputs, setsearchInputs, defaults, setmergeRequiredAppCustomer, setcurrentKanriCustomer}) => {
  useEffect(() => {
    const {mergeRequiredAppCustomer, currentKanriCustomer} = defaults
    if (mergeRequiredAppCustomer) {
      const filteredMergeRequiredAppCustomer = mergeRequiredAppCustomer.filter(c => {
        return searchColKeys.some(k => String(c[k])?.includes(String(searchInputs.mergeRequiredAppCustomer)))
      })
      setmergeRequiredAppCustomer(filteredMergeRequiredAppCustomer)
    } else {
      setmergeRequiredAppCustomer([])
    }

    if (currentKanriCustomer) {
      const filteredCurrentKanriCustomer = currentKanriCustomer.filter(c => {
        return searchColKeys.some(k => String(c[k])?.includes(String(searchInputs.currentKanriCustomer)))
      })
      setcurrentKanriCustomer(filteredCurrentKanriCustomer)
    } else {
      setcurrentKanriCustomer([])
    }
  }, [searchInputs])
}
