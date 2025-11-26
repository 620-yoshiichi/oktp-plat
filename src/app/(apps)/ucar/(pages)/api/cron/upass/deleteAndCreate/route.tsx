// kobutsu = 古物台帳
// 古物台帳のデータを同期するためのAPI

import {NextRequest, NextResponse} from 'next/server'
import {isCron} from 'src/non-common/serverSideFunction'
import {createUpassFamilyTree} from '@app/(apps)/ucar/(pages)/api/cron/upass/deleteAndCreate/createUpassFamilyTree'

export const GET = async (req: NextRequest) => {
  const result: any = {}
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  // result['deleteAndInsertUpassData'] = await deleteAndInsertUpassData()

  result['createUpassFamilyTree'] = await createUpassFamilyTree()

  return NextResponse.json(result)
}
