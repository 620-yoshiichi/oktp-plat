import {NextRequest, NextResponse} from 'next/server'
import * as fs from 'fs'

import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import path from 'path'

export const POST = async (req: NextRequest) => {
  let result

  const filePath = path.join(process.cwd(), `src/app/(apps)/ucar/(pages)/api/seeder/bank/bankMaster.csv`)
  const tsv = fs.readFileSync(filePath, 'utf-8')

  const headers = ['bankCode', 'branchCode', 'bankName', 'branchNameShort', 'branchName', 'branchKana', 'searchKana']

  const toArray = tsv.split('\n').map(row => row.split('\t'))

  const data = toArray
    .slice(1)
    .map(row => {
      return Object.fromEntries(row.map((value, idx) => [headers[idx], value]))
    })
    .filter(row => row.bankCode !== '' && row.branchCode !== '' && row.bankName !== '' && row.branchName !== '')

  const bankQuery: transactionQuery<'bankMaster' | 'bankBranchMaster', 'upsert'>[] = []

  data.forEach(d => {
    const {bankCode: rawBankCode, branchCode: rawBranchCode, bankName, branchNameShort, branchName, branchKana, searchKana} = d
    // 銀行コードは4桁、支店コードは3桁にパディング
    const bankCode = String(rawBankCode).padStart(4, '0')

    const data = {
      code: bankCode,
      name: bankName,
    }

    bankQuery.push({
      model: 'bankMaster',
      method: 'upsert',
      queryObject: {
        where: {code: bankCode},
        create: data,
        update: data,
      },
    })
  })
  const {result: upsertedBanks} = await doTransaction({transactionQueryList: bankQuery})

  data.forEach(d => {
    const {bankCode: rawBankCode, branchCode: rawBranchCode, bankName, branchNameShort, branchName, branchKana, searchKana} = d
    // 銀行コードは4桁、支店コードは3桁にパディング
    const bankCode = String(rawBankCode).padStart(4, '0')
    const branchCode = String(rawBranchCode).padStart(3, '0')

    const data = {
      code: branchCode,
      name: branchName,
      branchNameShort,
      branchKana,
      searchKana,
      bankCode,
    }

    bankQuery.push({
      model: `bankBranchMaster`,
      method: 'upsert',
      queryObject: {
        where: {
          unique_code_bankCode: {code: branchCode, bankCode},
        },
        create: data,
        update: data,
      },
    })
  })
  const {result: upsertedBranch} = await doTransaction({transactionQueryList: bankQuery})

  return NextResponse.json({result, upsertedBanks: upsertedBanks.length, upsertedBranch: upsertedBranch.length})
}
