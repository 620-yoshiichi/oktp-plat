import {NextRequest, NextResponse} from 'next/server'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'
import {findPredicate, getMonthBoundaries} from '@app/(apps)/newCar/(lib)/statistics/conditionRegistry'
import {sessionOnServer, fetchUserRole} from 'src/non-common/serverSideFunction'

function isValidMonth(input?: string | null) {
  if (!input) return true
  const d = new Date(input)
  return !isNaN(d.getTime())
}

async function isAdminUser() {
  const {session} = await sessionOnServer()
  const {roles} = await fetchUserRole({session})
  return roles?.some((r: any) => r?.name === '管理者') === true
}

// 例: /api/statistics/aggregateByRegistry?keys=registeredThisMonth,frThisMonth&storeId=all&month=2025-10-01
export const GET = async (req: NextRequest) => {
  // 認可: cron または 管理者

  try {
    const {searchParams} = new URL(req.url)
    const keysParam = searchParams.get('keys') || ''
    const storeIdParam = searchParams.get('storeId') || 'all'
    const monthParam = searchParams.get('month') || undefined

    // 入力バリデーション
    if (!isValidMonth(monthParam)) return NextResponse.json({success: false, message: 'month is invalid'}, {status: 400})

    const storeId = storeIdParam === 'all' ? 'all' : Number(storeIdParam)
    const baseMonth = monthParam ? new Date(monthParam) : undefined

    const {firstDay, nextFirstDay, firstDayDate, nextFirstDayDate} = getMonthBoundaries(baseMonth)
    const monthStr = firstDay.slice(0, 7)

    const keys = keysParam
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (keys.length === 0) {
      return NextResponse.json({success: true, rows: []})
    }

    // 条件式（COUNT FILTER用）を生成
    const filterClauses = keys.map(key => {
      const p = findPredicate(key)

      if (!p) throw new Error(`Unknown predicate key: ${key}`)
      const clause = p.getSql({
        baseMonth: baseMonth ?? firstDayDate,
        storeId: storeId as any,
        userId: 'all',
        firstDay,
        nextFirstDay,
      })

      return {
        key,
        clause: clause,
      }
    })

    // SELECT句（COUNT(*) FILTER ...）を横持ちで生成
    const selectCounts = filterClauses.map(f => `COUNT(*) FILTER (WHERE ${f.clause})::INT AS "${f.key}"`).join(',\n      ')

    // 全数からの除外: 先月以前に登録完了（BCの前、すなわち firstDay より前の登録）があるものは除外
    // ベースWHERE
    const baseWhere = sql`WHERE ("DD_TOUROKU" IS NULL OR "DD_TOUROKU" >= '${firstDay}') `
    const whereStore = storeId === 'all' ? baseWhere : sql`${baseWhere} AND "storeId" = ${storeId}`

    const sqlString = sql`
      SELECT
        ${selectCounts}
      FROM "NewCar"
      ${whereStore}
    `

    const {rows} = await useRawSql({sql: sqlString})

    const whereClause = filterClauses.map(f => f.clause).join(' AND ')

    // rows は1行想定（横持ち集計）
    return NextResponse.json({success: true, rows})
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({success: false, message: e.message ?? 'error'}, {status: 500})
  }
}
