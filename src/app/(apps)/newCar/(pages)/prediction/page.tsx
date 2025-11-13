import MikomiTableSC from '@app/(apps)/newCar/class/NewCarPredictionTable/MikomiTable/MikomiTableSC'

import ProgressReport from '@app/(apps)/newCar/class/ProgressReport/ProgressReport'
import {C_Stack, FitMargin, Padding, R_Stack} from '@cm/components/styles/common-components/common-components'
import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@cm/components/utils/Redirector'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import {dateSwitcherTemplate} from '@cm/lib/methods/redirect-method'

export default async function Page(props) {
  const query = await props.searchParams
  const {redirectPath} = await dateSwitcherTemplate({query})
  if (redirectPath) return <Redirector {...{redirectPath}} />

  return (
    <Padding>
      <C_Stack className={`mx-auto `}>
        <R_Stack className={`mx-auto w-fit`}>
          <NewDateSwitcher {...{monthOnly: true}} />
        </R_Stack>
        <FitMargin {...{style: {width: 1250, margin: `auto`}}}>
          <BasicTabs
            {...{
              id: `newCarPredictionTable`,
              showAll: false,
              TabComponentArray: [
                // {
                //   label: `登録見込み早見表`,
                //   component: <FitMargin>{<NewMikomiTableSC {...{query}} />}</FitMargin>,
                // },
                {
                  label: `登録見込み早見表`,
                  component: <FitMargin>{<MikomiTableSC {...{query}} />}</FitMargin>,
                },
                {
                  label: `書類回収進捗`,
                  component: <FitMargin>{<ProgressReport {...{query}} />}</FitMargin>,
                },
              ],
            }}
          />
        </FitMargin>
      </C_Stack>
    </Padding>
  )
}
