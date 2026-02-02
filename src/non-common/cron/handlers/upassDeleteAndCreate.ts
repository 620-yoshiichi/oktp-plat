'use server'

import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {upassCols} from '@app/(apps)/ucar/files/upass/upass-columns'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import prisma from 'src/lib/prisma'

/**
 * U-PASS Rawデータ取り込みバッチ
 * BigQueryからU-PASSデータを同期する
 */
export const executeUpassDeleteAndCreate = async () => {
  const deleteAndInsertResult = await deleteAndInsertUpassData()
  const createFamilyTreeResult = await createUpassFamilyTree()

  const totalCount = deleteAndInsertResult.count + createFamilyTreeResult.count

  return {
    success: true,
    message: `U-PASSデータ取り込み完了 ${totalCount}件（データ: ${deleteAndInsertResult.count}件、ツリー: ${createFamilyTreeResult.count}件）`,
    result: {
      totalCount,
      upassDataCount: deleteAndInsertResult.count,
      familyTreeCount: createFamilyTreeResult.count,
    },
  }
}

const deleteAndInsertUpassData = async () => {
  const body = await bigQuery__select({
    datasetId: 'Ucar_QR',
    tableId: 'UPASS_RAW',
    sqlString: sql`
    select * from okayamatoyopet.Ucar_QR.UPASS_RAW
    `,
  })

  // upassColsで定義されたヘッダーデータのみを取得し、{en: value}の形の配列に変換
  // importできないため、必要なデータをここで取得

  const necessaryDataList: any = body.map(row => {
    const obj = Object.fromEntries(
      upassCols.map((col, idx) => {
        // const colIndex = header.indexOf(col.jp)

        const value = String(row[col.jp])

        if (col.type === 'date') {
          return [col.en, value ? toUtc(formatDate(new Date(value), 'YYYY-MM-DD HH:mm:ss')) : null]
        }

        return [col.en, value]
      })
    )

    return obj
  })

  const dataSource = 'upass'
  await useRawSql({sql: sql`delete from "UPASS" where "dataSource" = '${dataSource}' `})

  const created = await doTransaction({
    transactionQueryList: necessaryDataList.map(item => {
      const sateiID = item.sateiID

      return {
        model: 'UPASS',
        method: 'create',
        queryObject: {
          data: {
            ...item,
            dataSource: dataSource,
            shitadoriRelationAssessmentNumber: item.palAssessmentNumber ? item.palAssessmentNumber : undefined,
          },
        },
      }
    }),
  })

  return {
    count: necessaryDataList.length,
  }
}

const createUpassFamilyTree = async () => {
  let totalTreeCount = 0

  // 初回ファミリーツリーの作成
  const firstUpassDataList = await prisma.uPASS.findMany({
    where: {
      AND: [
        {dataSource: 'upass'},
        {MyUpassTree: null},
        {
          OR: [
            //
            {previousAssessmentnumber: ''},
            {previousAssessmentnumber: null},
          ],
        },
      ],
    },
  })

  for (let i = 0; i < firstUpassDataList.length; i++) {
    const satei = firstUpassDataList[i]

    let current: string | undefined = satei.sateiID

    const tree: Array<{sateiID: string; assessmentdatetime: Date | null}> = []

    while (current) {
      const currentSatei = await prisma.uPASS.findUnique({
        where: {sateiID: current},
        select: {sateiID: true, assessmentdatetime: true},
      })

      if (currentSatei) {
        tree.push({
          sateiID: currentSatei.sateiID,
          assessmentdatetime: currentSatei.assessmentdatetime,
        })

        const child = await prisma.uPASS.findFirst({
          where: {previousAssessmentnumber: current},
        })

        current = child?.sateiID
      } else {
        break
      }
    }

    await prisma.upassFamilyTree.createMany({
      data: tree.map(({sateiID, assessmentdatetime}) => ({
        sateiID,
        sateiDate: assessmentdatetime,
        rootSateiID: satei.sateiID,
      })),
    })

    totalTreeCount += tree.length
  }

  //途中から参加するメンバー

  const middleUpassDataList = await prisma.uPASS.findMany({
    where: {
      AND: [{dataSource: 'upass'}, {MyUpassTree: {is: null}}],
    },
  })

  for (let i = 0; i < middleUpassDataList.length; i++) {
    const satei = middleUpassDataList[i]

    const myPreviousAssessmentnumber = satei.previousAssessmentnumber

    const previousSateiFamilyTree = await prisma.upassFamilyTree.findFirst({
      where: {sateiID: myPreviousAssessmentnumber ?? ''},
    })
    const myRootSateiId = previousSateiFamilyTree?.rootSateiID

    if (myRootSateiId) {
      await prisma.upassFamilyTree.create({
        data: {
          sateiID: satei.sateiID,
          rootSateiID: myRootSateiId,
          sateiDate: satei.assessmentdatetime,
        },
      })
      totalTreeCount++
    }
  }

  return {
    count: totalTreeCount,
  }
}
