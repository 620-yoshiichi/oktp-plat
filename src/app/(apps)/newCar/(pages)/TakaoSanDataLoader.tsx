import {arr__arrToCsv} from '@cm/class/ArrHandler/array-utils/basic-operations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Button} from '@cm/components/styles/common-components/Button'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {NewCar, Store, User} from '@prisma/generated/prisma/client'
import React from 'react'

export default function TakaoSanDataLoader() {
  return (
    <div className={` fixed bottom-1 left-0 w-full bg-gray-400 p-2`}>
      <div className={` flex justify-center text-xl`}>
        <Button
          onClick={async data => {
            const header = [
              '店舗',
              '店舗コード',
              'スタッフ',
              'スタッフコード',
              '注文No',
              '受注日',
              '買主名',
              '名義人名',
              '車名',
              '振当日',
              '登録日',
              '配送希望日',
              '納車日',
            ]
            let {result: cars} = await doStandardPrisma(`newCar`, 'findMany', {
              include: {
                Store: true,
                User: true,
              },
              where: {
                AND: [
                  {DD_TORIKESI: null},
                  {
                    OR: [
                      //
                      {KJ_MEIGIME1: {contains: 'トヨタレンタリース'}},
                      {KJ_KAINMEI1: {contains: 'トヨタレンタリース'}},
                      {KJ_MEIGIME1: {contains: 'トヨタモビリティ'}},
                      {KJ_KAINMEI1: {contains: 'トヨタモビリティ'}},
                    ],
                  },
                  {
                    OR: [
                      //
                      {DD_TOUROKU: null},
                      {DD_TOUROKU: {gte: new Date(2025, 3, 1)}},
                    ],
                  },
                ],
              },
            })

            cars = cars.map((data: NewCar & {Store: Store; User: User}) => {
              const {
                Store,
                User,
                NO_CYUMON,
                DD_JUCYU,
                KJ_KAINMEI1,
                KJ_MEIGIME1,
                KJ_KURUMAME,
                DD_FR,
                DD_TOUROKU,
                DD_HAISKIBO,
                DD_NOSYA,
              } = data

              return [
                Store.name,
                Store.code,
                User.name,
                User.code,
                NO_CYUMON,
                formatDate(DD_JUCYU),
                KJ_KAINMEI1,
                KJ_MEIGIME1,
                KJ_KURUMAME,
                formatDate(DD_FR),
                formatDate(DD_TOUROKU),
                formatDate(DD_HAISKIBO),
                formatDate(DD_NOSYA),
              ]
            })

            const csv = [header, ...cars]
            const toCsv = arr__arrToCsv(csv)
            const a = document.createElement('a')
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(toCsv)
            a.download = 'cars.csv'
            a.click()
          }}
        >
          実行
        </Button>
      </div>
    </div>
  )
}
