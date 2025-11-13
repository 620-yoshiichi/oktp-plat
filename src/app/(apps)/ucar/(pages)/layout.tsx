import {PageBuilder} from '@app/(apps)/ucar/class/PageBuilder'
import {Metadata} from 'next'
import {ModelBuilder} from '@app/(apps)/ucar/class/ModelBuilder'
import Admin from '@cm/components/layout/Admin/Admin'

const AppName = 'Ucar QR'
export const metadata: Metadata = {title: AppName}
export default function QRBP_Layout({children}) {
  return (
    <Admin
      {...{
        AppName,
        PagesMethod: 'ucar_PAGES',
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
        additionalHeaders: [],
        ModelBuilder,
      }}
    >
      {children}
    </Admin>
  )
}
