import {getToken} from 'next-auth/jwt'
import {NextRequest, NextResponse} from 'next/server'

const defaultPathValidateConfig = {
  isValid: session => session?.email,
  redirect: (origin, rootPath) => `${origin}/not-found?rootPath=${rootPath}`,
}
type rootPath = {
  rootPath: string
  paths: {
    matcher: string
    isValid: (session: any) => boolean
    redirect: (origin: string, rootPath: string) => string
  }[]
}

const getFreePathsMathcer = (rootPath, pathArray) => {
  const defaultFreePaths = [`/.*api`, `/seeder`]
  return `/${rootPath}(?!${[...defaultFreePaths, ...pathArray].join(`|`)})/.+`
}
export const rootPaths: rootPath[] = [
  {
    rootPath: 'newCar',
    paths: [{matcher: getFreePathsMathcer(`newCar`, [`/`]), ...defaultPathValidateConfig}],
  },
  {
    rootPath: 'QRBP',
    paths: [
      {
        matcher: getFreePathsMathcer(`QRBP`, ['/', `/engineer`, `/process/history`]),
        ...defaultPathValidateConfig,
      },
    ],
  },
  {
    rootPath: 'shinren',
    paths: [
      {
        matcher: getFreePathsMathcer(`shinren`, []),
        ...defaultPathValidateConfig,
      },
    ],
  },
  {
    rootPath: 'ucar',
    paths: [
      {
        matcher: getFreePathsMathcer(`ucar`, [
          //
          '/',
          '/sateiIdConverter',
          `/admin/InstantQr`,
        ]),
        ...defaultPathValidateConfig,
      },
    ],
  },
]

export async function middleware(req: NextRequest) {
  // get session from next auth
  const session = await getToken({req})

  /**必要情報 */
  const {pathname, origin, search, href} = req.nextUrl

  const isTargetPath = rootPaths.find(d => {
    const reg = new RegExp(`^/${d.rootPath}`)
    return reg.test(pathname)
  })

  if (isTargetPath) {
    const match = isTargetPath.paths.length > 0 && isTargetPath.paths.find(d => new RegExp(d.matcher).test(pathname))
    if (match && !match.isValid(session)) {
      const redirectUrl = match.redirect(origin, isTargetPath.rootPath)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}
const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
