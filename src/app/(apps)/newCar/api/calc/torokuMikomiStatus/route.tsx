import {newCarWhereArgs} from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/constants'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {Prisma} from '@prisma/client'
import {NextResponse} from 'next/server'

export const POST = async () => {
  const {nestedFields, flatFields, updatedData} = await getTorokuConditions()

  return NextResponse.json({updatedData: updatedData.result.length, flatFields, nestedFields})
}
const getTorokuConditions = async () => {
  type aggregationField = {
    key: string
    label: string
    whereArgs: newCarWhereArgs | null
    children?: aggregationField[]
  }

  const flatFields: aggregationField[] = []
  const aggregationFieldsTop = {
    key: `totalPrediction`,
    label: `総計`,
    whereArgs: null,
    children: [
      {
        key: `predictionStrong`,
        label: `確定`,
        whereArgs: null,
        children: [
          {
            key: `registered`,
            label: `登録済`,
            whereArgs: {DD_TOUROKU: {not: null}},
          },
          {
            key: `applicationCompleted`,
            label: `申請済`,
            whereArgs: null,
            children: [
              {
                key: `fr`,
                label: `振当済`,
                whereArgs: {
                  DD_TOUROKU: null,
                  lastApprovedDesiredTorokuDate: {not: null},
                  DD_FR: {not: null},
                },
              },
              {
                key: `noFr`,
                label: `未当済`,
                whereArgs: {
                  DD_TOUROKU: null,
                  lastApprovedDesiredTorokuDate: {not: null},
                  DD_FR: null,
                },
              },
            ],
          },
        ],
      },

      {
        key: `weekPrediction`,
        label: `見込`,
        whereArgs: null,
        children: [
          {
            key: `fr`,
            label: `振当済`,
            whereArgs: {
              DD_TOUROKU: null,
              m1_toroku_prediction: {not: null},
              DD_FR: {not: null},
            },
          },
          {
            key: `noFr`,
            label: `未当済`,
            whereArgs: {
              DD_TOUROKU: null,
              m1_toroku_prediction: {not: null},
              DD_FR: null,
            },
          },
        ],
      },
    ],
  }

  const nestCreateWhereArgs = (field: aggregationField, children?: aggregationField[]) => {
    if (field.whereArgs) {
      flatFields.push(field)
      return field
    } else {
      if (children) {
        field.whereArgs = {
          OR: children?.map(child => {
            child.key = [field.key, child.key].join('_')
            child.label = [field.label, child.label].join('_')

            return nestCreateWhereArgs(child, child.children)?.whereArgs ?? {}
          }),
        }
      }
      flatFields.push(field)
      return field
    }
  }

  const nestedFields = nestCreateWhereArgs(aggregationFieldsTop, aggregationFieldsTop.children)

  const transactionQueryList: transactionQuery[] = []

  const result = await Promise.all(
    flatFields.map(async field => {
      const updateTrueManyArgs: Prisma.NewCarUpdateManyArgs = {
        where: field.whereArgs ?? {},
        data: {[field.key]: true},
      }

      transactionQueryList.push({
        model: `newCar`,
        method: `updateMany`,
        queryObject: {
          ...updateTrueManyArgs,
        },
      })

      // const trueList = await prisma.newCar.updateMany(updateTrueManyArgs)

      const updateFalseManyArgs: Prisma.NewCarUpdateManyArgs = {
        where: {NOT: field.whereArgs ?? {}},
        data: {[field.key]: false},
      }
      transactionQueryList.push({
        model: `newCar`,
        method: `updateMany`,
        queryObject: {
          ...updateFalseManyArgs,
        },
      })

      // const falseList = await prisma.newCar.updateMany(updateFalseManyArgs)
    })
  )

  const updatedData = await doTransaction({transactionQueryList})

  return {nestedFields, flatFields, updatedData}
}
