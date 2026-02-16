'use server'

import {revalidatePath} from 'next/cache'
import prisma from 'src/lib/prisma'
import {isServerActionAccessAllowed} from '@app/api/prisma/isAllowed'
import {requestResultType} from '@cm/types/types'

export type ScheduleBoardMode = 'cr' | 'engineer'

type ScheduleBoardChange = {
  id: number
  damageNameMasterId: number
  crScheduledAt: string | null
}

type EngineerBoardChange = {
  id: number
  engineerScheduledAt: string | null
}

/**
 * CRスケジュールボードの変更を一括保存する
 */
export async function saveScheduleBoard(changes: ScheduleBoardChange[]): Promise<requestResultType> {
  const isAllowed = await isServerActionAccessAllowed()
  if (!isAllowed) {
    return {success: false, message: 'アクセスが禁止されています', error: 'Unauthorized', result: null}
  }

  if (changes.length === 0) {
    return {success: false, message: '更新するデータがありません', result: null}
  }

  try {
    await prisma.$transaction(
      changes.map(c =>
        prisma.car.update({
          where: {id: c.id},
          data: {
            damageNameMasterId: c.damageNameMasterId,
            crScheduledAt: c.crScheduledAt ? new Date(c.crScheduledAt) : null,
          },
        })
      )
    )

    revalidatePath('/QRBP/admin/car/scheduled')
    return {success: true, message: `${changes.length}件を更新しました`, result: null}
  } catch (error) {
    console.error('saveScheduleBoard error:', error)
    return {success: false, message: '保存に失敗しました', error: String(error), result: null}
  }
}

/**
 * エンジニアスケジュールボードの変更を一括保存する
 * engineerScheduledAt のみ更新（crScheduledAt, scheduledAt は変更しない）
 */
export async function saveEngineerScheduleBoard(changes: EngineerBoardChange[]): Promise<requestResultType> {
  const isAllowed = await isServerActionAccessAllowed()
  if (!isAllowed) {
    return {success: false, message: 'アクセスが禁止されています', error: 'Unauthorized', result: null}
  }

  if (changes.length === 0) {
    return {success: false, message: '更新するデータがありません', result: null}
  }

  try {
    await prisma.$transaction(
      changes.map(c =>
        prisma.car.update({
          where: {id: c.id},
          data: {
            engineerScheduledAt: c.engineerScheduledAt ? new Date(c.engineerScheduledAt) : null,
          },
        })
      )
    )

    revalidatePath('/QRBP/admin/car/engineerScheduled')
    return {success: true, message: `${changes.length}件を更新しました`, result: null}
  } catch (error) {
    console.error('saveEngineerScheduleBoard error:', error)
    return {success: false, message: '保存に失敗しました', error: String(error), result: null}
  }
}

/**
 * 拠点反映: crScheduledAt の日付を scheduledAt に反映する
 */
export async function reflectScheduledAt(carId: number, newScheduledAt: string): Promise<requestResultType> {
  const isAllowed = await isServerActionAccessAllowed()
  if (!isAllowed) {
    return {success: false, message: 'アクセスが禁止されています', error: 'Unauthorized', result: null}
  }

  try {
    await prisma.car.update({
      where: {id: carId},
      data: {scheduledAt: new Date(newScheduledAt)},
    })

    revalidatePath('/QRBP/admin/car/scheduled')
    return {success: true, message: '拠点予定を更新しました', result: null}
  } catch (error) {
    console.error('reflectScheduledAt error:', error)
    return {success: false, message: '更新に失敗しました', error: String(error), result: null}
  }
}
