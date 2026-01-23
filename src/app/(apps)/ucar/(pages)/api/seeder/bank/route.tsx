import { NextRequest, NextResponse } from 'next/server'
import prisma from 'src/lib/prisma'
import { handlePrismaError } from '@cm/lib/prisma-helper'
import { processBatchWithRetry } from '@cm/lib/server-actions/common-server-actions/processBatchWithRetry'

/**
 * 銀行マスタと支店マスタを外部APIから取得して登録するバッチ処理
 * 外部API: https://bank.teraren.com
 */
export const POST = async (req: NextRequest) => {
  console.time(req.nextUrl.pathname)

  const result = {
    banksCreated: 0,
    banksUpdated: 0,
    branchesCreated: 0,
    branchesUpdated: 0,
    errors: [] as string[],
  }

  try {
    // 1. 銀行データを取得
    console.log('銀行データ取得開始...')
    const banksResponse = await fetch('https://bank.teraren.com/banks.json?page=1&per=2000')
    if (!banksResponse.ok) {
      throw new Error(`銀行データ取得に失敗: ${banksResponse.status}`)
    }
    const bankList = await banksResponse.json()
    console.log(`取得した銀行数: ${bankList.length}`)

    // 2. 各銀行の支店データを取得
    console.log('支店データ取得開始...')
    const allBranches: Array<{
      bankCode: string
      code: string
      name: string
      branchKana: string
      searchKana: string
    }> = []

    // 並行処理で支店データを取得（10件ずつ）
    const batchSize = 10
    for (let i = 0; i < bankList.length; i += batchSize) {
      const bankBatch = bankList.slice(i, i + batchSize)
      
      await Promise.all(
        bankBatch.map(async (bank: any, idx: number) => {
          try {
            console.log(`支店取得: ${i + idx + 1}/${bankList.length} - ${bank.normalize.name}`)
            
            const branchesUrl = bank.branches_url + '?page=1&per=2000'
            const branchesResponse = await fetch(branchesUrl)
            
            if (!branchesResponse.ok) {
              result.errors.push(`支店データ取得失敗: ${bank.normalize.name} (${bank.code})`)
              return
            }

            const branchesList = await branchesResponse.json()
            
            branchesList.forEach((branch: any) => {
              allBranches.push({
                bankCode: bank.code,
                code: branch.code,
                name: branch.normalize.name,
                branchKana: branch.normalize.kana,
                searchKana: branch.normalize.hira,
              })
            })
          } catch (error: any) {
            const errorMessage = error.message || String(error)
            result.errors.push(`支店データ取得エラー: ${bank.normalize.name} - ${errorMessage}`)
            console.error(`支店データ取得エラー: ${bank.normalize.name}`, error)
          }
        })
      )
    }

    console.log(`取得した支店数: ${allBranches.length}`)

    // 3. 銀行マスタを一括upsert
    console.log('銀行マスタ登録開始...')
    await processBatchWithRetry({
      soruceList: bankList,
      options: { batchSize: 100, retries: 1 },
      mainProcess: async batch => {
        await Promise.all(
          batch.map(async (bank: any) => {
            try {
              const data = {
                code: bank.code,
                name: bank.normalize.name,
              }

              // 既存レコードの確認
              const existing = await prisma.bankMaster.findUnique({
                where: { code: bank.code },
              })

              await prisma.bankMaster.upsert({
                where: { code: bank.code },
                create: data,
                update: data,
              })

              if (existing) {
                result.banksUpdated++
              } else {
                result.banksCreated++
              }
            } catch (error: any) {
              const errorMessage = handlePrismaError(error)
              result.errors.push(`銀行登録エラー: ${bank.normalize.name} (${bank.code}) - ${errorMessage}`)
              console.error(`銀行登録エラー: ${bank.code}`, errorMessage)
            }
          })
        )
      },
    })

    console.log(`銀行マスタ登録完了: 新規${result.banksCreated}件, 更新${result.banksUpdated}件`)

    // 4. 支店マスタを一括upsert
    console.log('支店マスタ登録開始...')
    await processBatchWithRetry({
      soruceList: allBranches,
      options: { batchSize: 500, retries: 1 },
      mainProcess: async batch => {
        await Promise.all(
          batch.map(async (branch: any) => {
            try {
              const data = {
                code: branch.code,
                name: branch.name,
                bankCode: branch.bankCode,
                branchKana: branch.branchKana,
                searchKana: branch.searchKana,
              }

              // 既存レコードの確認
              const existing = await prisma.bankBranchMaster.findUnique({
                where: {
                  unique_code_bankCode: {
                    code: branch.code,
                    bankCode: branch.bankCode,
                  },
                },
              })

              await prisma.bankBranchMaster.upsert({
                where: {
                  unique_code_bankCode: {
                    code: branch.code,
                    bankCode: branch.bankCode,
                  },
                },
                create: data,
                update: data,
              })

              if (existing) {
                result.branchesUpdated++
              } else {
                result.branchesCreated++
              }
            } catch (error: any) {
              const errorMessage = handlePrismaError(error)
              result.errors.push(
                `支店登録エラー: ${branch.name} (${branch.bankCode}-${branch.code}) - ${errorMessage}`
              )
              console.error(`支店登録エラー: ${branch.bankCode}-${branch.code}`, errorMessage)
            }
          })
        )
      },
    })

    console.log(`支店マスタ登録完了: 新規${result.branchesCreated}件, 更新${result.branchesUpdated}件`)

    console.timeEnd(req.nextUrl.pathname)

    return NextResponse.json({
      success: true,
      message: '銀行マスタを更新しました',
      result: {
        banks: {
          created: result.banksCreated,
          updated: result.banksUpdated,
          total: result.banksCreated + result.banksUpdated,
        },
        branches: {
          created: result.branchesCreated,
          updated: result.branchesUpdated,
          total: result.branchesCreated + result.branchesUpdated,
        },
        errors: result.errors.length > 0 ? result.errors : undefined,
      },
    })
  } catch (error: any) {
    console.error('銀行マスタ更新でエラーが発生しました', error)
    console.timeEnd(req.nextUrl.pathname)

    return NextResponse.json(
      {
        success: false,
        message: `銀行マスタ更新でエラーが発生しました: ${error.message}`,
        result,
      },
      { status: 500 }
    )
  }
}
