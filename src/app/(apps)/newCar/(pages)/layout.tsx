import {PageBuilder} from '@app/(apps)/newCar/class/PageBuilder'
import Admin from '@cm/components/layout/Admin/Admin'

export default async function NewCarLayout(props) {
  const {children} = props

  return (
    <Admin
      {...{
        AppName: '納期CS管理',
        PagesMethod: 'newCar_PAGES',
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
      }}
    >
      <div>{children}</div>
    </Admin>
  )
}
