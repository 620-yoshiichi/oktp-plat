import {Absolute} from '@cm/components/styles/common-components/common-components'
import {T_LINK} from '@cm/components/styles/common-components/links'

import Redirector from '@cm/components/utils/Redirector'

const ShinrenTop = () => {
  return <Redirector redirectPath={`/shinren/admin/config/rentaDailyReport`} />
  return (
    <div>
      <Absolute>
        <T_LINK href="/shinren/admin/config/rentaDailyReport">日報一覧へ</T_LINK>
      </Absolute>
    </div>
  )
}

export default ShinrenTop
