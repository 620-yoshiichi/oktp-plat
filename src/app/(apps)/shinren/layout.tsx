import {PageBuilder} from '@app/(apps)/shinren/class/PageBuilder'
import {Metadata} from 'next'
import Admin from '@cm/components/layout/Admin/Admin'

const AppName = 'R日報'
export const metadata: Metadata = {title: AppName}
export default async function Layout({children}) {
  return (
    <Admin
      {...{
        AppName,
        PagesMethod: 'shinren_PAGES',
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
      }}
    >
      {children}
    </Admin>
  )
}
