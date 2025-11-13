import Admin from '@cm/components/layout/Admin/Admin'
import {PageBuilder} from '@app/(apps)/QRBP/class/PageBuilder'
import {Metadata} from 'next'

const AppName = 'QRBP'
export const metadata: Metadata = {title: AppName}
export default async function QRBP_Layout({children}) {
  return (
    <Admin
      {...{
        AppName: AppName,
        PagesMethod: 'QRBP_PAGES',
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
      }}
    >
      <div>{children}</div>
    </Admin>
  )
}
