'use client'
import {MergeImageDisplay} from '@app/(apps)/shinren/admin/config/merge-customer/MergeModal/MergeImageDisplay'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'
import {Button} from '@cm/components/styles/common-components/Button'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import {toast} from 'react-toastify'
import {createRelationalDataUpdateQueries} from '@app/(apps)/shinren/admin/config/merge-customer/MergeModal/createRelationalDataUpdateQueries'
import {useState} from 'react'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

export const MergeModal = ({mergeModalObj, mergedData, setmergedData}) => {
  const {CstmrFrom, CstmTo} = mergeModalObj.open
  const {toggleLoad} = useGlobal()

  const [input, setinput] = useState({
    code: CstmrFrom?.mergeCandidates?.code ?? undefined,
  })

  const onSubmit = async () => {
    const {result: CstmTo} = await doStandardPrisma(`rentaCustomer`, `findUnique`, {
      where: {code: String(input.code)},
      include: {
        User: {},
        RentaStore: {},
      },
    })

    mergeModalObj.handleOpen(prev => {
      return {
        ...prev,
        CstmTo,
      }
    })
  }

  const merge = async () => {
    if (confirm(`統合しますか？`)) {
      toggleLoad(async () => {
        const transactionQueryList = await createRelationalDataUpdateQueries({CstmrFrom, CstmTo})
        await doTransaction({transactionQueryList})

        const res = await doStandardPrisma(`rentaCustomer`, `update`, {
          where: {id: CstmTo.id},
          data: mergedData,
        })
        if (res.success) {
          await doStandardPrisma(`rentaCustomer`, `delete`, {
            where: {id: CstmrFrom.id},
          })
          toast.info(`統合しました`)
        } else {
          toast.error(`統合に失敗しました`)
        }

        mergeModalObj.handleClose()
      })
    }
  }

  return (
    <C_Stack>
      <Paper>
        <C_Stack>
          <R_Stack>
            <label>
              <input
                className={`myFormControl`}
                value={input.code ?? ``}
                onChange={e => {
                  setinput({code: e.target.value})
                }}
              />
            </label>

            <Button onClick={onSubmit}>統合先コードを指定する</Button>

            {CstmTo && (
              <Button color="red" onClick={merge}>
                統合する
              </Button>
            )}
          </R_Stack>
        </C_Stack>
      </Paper>
      <Paper>
        <MergeImageDisplay {...{CstmrFrom, CstmTo, mergedData, setmergedData}} />
      </Paper>
    </C_Stack>
  )
}

const testCstmTo = {
  id: 7509,
  createdAt: '2023-11-21T01:29:05.884Z',
  sortOrder: 0,
  name: '原田　英樹',
  code: '5006789000',
  userId: 317,
  pic: null,
  carCount: null,
  leaseCompanyName: null,
  type: '管理',
  address1: '岡山県倉敷市中島1730-6',
  address2: '',
  fax: '',
  industryCode: null,
  industryCodeName: null,
  kana: 'ﾊﾗﾀﾞﾋﾃﾞｷ',
  nameBottom: '',
  nameTop: '原田　英樹',
  phone: '090-8066-7733',
  postalCode: '7100803',
  rentaStoreId: 11,
  repKana: '',
  repName: '',
  repPos: '',
  result: null,
  maintenanceDestination: null,
  remarks: null,
  User: {
    id: 317,
    code: 790,
    createdAt: '2023-11-21T01:26:06.262Z',
    active: true,
    sortOrder: 150,
    name: '早藤洋月',
    kana: '',
    email: 'm.hayafuji@toyotarl-s-okayama.jp',
    password: '790',
    type: '営業',
    role: 'ユーザー',
    tempResetCode: null,
    tempResetCodeExpired: null,
    storeId: null,
    schoolId: null,
    rentaStoreId: 11,
    type2: null,
    shopId: null,
    membershipName: null,
    damageNameMasterId: null,
    color: null,
    tell: null,
    app: 'shinren',
  },
  RentaStore: {
    id: 11,
    createdAt: '2024-01-23T07:32:56.168Z',
    active: true,
    sortOrder: 0,
    code: 672,
    name: '東岡山CL営業',
  },
}
