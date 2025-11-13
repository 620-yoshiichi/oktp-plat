import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {getMonthBoundaries, findPredicate} from '@app/(apps)/newCar/(lib)/statistics/conditionRegistry'
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

export const GET = async (req: NextRequest) => {
  // 認可: cron または 管理者

  try {
    const {searchParams} = new URL(req.url)
    const key = searchParams.get('filterKey') || ''
    const storeIdParam = searchParams.get('storeId') || 'all'
    const userIdParam = searchParams.get('userId') || 'all'
    const monthParam = searchParams.get('month') || undefined
    const pageParam = Number(searchParams.get('page') || 1)
    const takeParam = Number(searchParams.get('take') || 50)

    // 入力バリデーション
    if (!key) return NextResponse.json({success: false, message: 'filterKey is required'}, {status: 400})
    if (!isValidMonth(monthParam)) return NextResponse.json({success: false, message: 'month is invalid'}, {status: 400})

    const storeId = storeIdParam === 'all' ? 'all' : Number(storeIdParam)
    const userId = userIdParam === 'all' ? 'all' : Number(userIdParam)
    if (storeId !== 'all' && Number.isNaN(storeId))
      return NextResponse.json({success: false, message: 'storeId is invalid'}, {status: 400})
    if (userId !== 'all' && Number.isNaN(userId))
      return NextResponse.json({success: false, message: 'userId is invalid'}, {status: 400})
    if (pageParam < 1 || takeParam < 1 || takeParam > 500)
      return NextResponse.json({success: false, message: 'paging is invalid'}, {status: 400})

    const {firstDayDate, nextFirstDayDate} = getMonthBoundaries(monthParam ? new Date(monthParam) : undefined)

    const predicate = findPredicate(key)
    if (!predicate) return NextResponse.json({success: false, message: `Unknown filterKey: ${key}`}, {status: 400})

    const whereBase = predicate.getWhere({
      baseMonth: firstDayDate,
      storeId: storeId as any,
      userId: userId as any,
      firstDay: firstDayDate,
      nextFirstDay: nextFirstDayDate,
    })

    const where = {
      AND: [
        whereBase,
        // 全数からの除外: 先月以前に登録完了
        {OR: [{DD_TOUROKU: null}, {DD_TOUROKU: {gte: firstDayDate}}]},
        ...(storeId === 'all' ? [] : [{storeId}]),
        ...(userId === 'all' ? [] : [{userId}]),
      ],
    }

    const skip = (pageParam - 1) * takeParam

    const [rows, total] = await Promise.all([
      prisma.newCar.findMany({
        where,
        take: takeParam,
        skip,
        orderBy: {id: 'desc'},
      }),
      prisma.newCar.count({where}),
    ])

    return NextResponse.json({success: true, rows, total, page: pageParam, take: takeParam})
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({success: false, message: e.message ?? 'error'}, {status: 500})
  }
}
