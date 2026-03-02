'use client'

import { UcarCL, ucarData } from '@app/(apps)/ucar/class/UcarCL'
import { RetentionCarDetail } from '@app/(apps)/ucar/(pages)/dashboard/server-actions'
import { UcarProcessTable } from '@app/(apps)/ucar/(pages)/dashboard/components/UcarProcessTable'

type KouteiKanriTableProps = {
  results: any[]
  isLoading: boolean
}

/** ucarData → RetentionCarDetail 変換 */
function toRetentionCarDetail(car: ucarData): RetentionCarDetail {
  const ucarInst = new UcarCL(car)
  const processMap: Record<string, string | null> = {}

  for (const p of car.UcarProcess ?? []) {
    processMap[p.processCode] = p.date?.toISOString() ?? null
  }

  return {
    ...car,
    storeName: car.Store?.name ?? null,
    userName: car.User?.name ?? null,
    number98: car.number98 ?? null,
    hasOldCarsLink: car.OldCars_Base != null,
    ai21: {
      DD_URIAGE: ucarInst.ai21Data.DD_URIAGE ?? null,
      CD_ZAIKOTEN: ucarInst.ai21Data.CD_ZAIKOTEN ?? null,
      KI_HANKAKA: ucarInst.ai21Data.KI_HANKAKA ?? null,
    },
    processMap,
  }
}

export function KouteiKanriTable({ results, isLoading }: KouteiKanriTableProps) {
  const transformedCars = results.map(car => toRetentionCarDetail(car as unknown as ucarData))

  return (
    <UcarProcessTable
      cars={transformedCars}
      isLoading={isLoading}
      options={{
        showLTBadge: true,
        highlightToday: true,
        pulseCurrentProcess: true,
      }}
    />
  )
}
