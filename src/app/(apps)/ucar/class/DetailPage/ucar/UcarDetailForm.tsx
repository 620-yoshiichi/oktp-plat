import {DetailPagePropType} from '@cm/types/types'

import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'

import UcarTop from '@app/(apps)/ucar/class/DetailPage/ucar/EditModeSelector'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import Accordion from '@cm/components/utils/Accordions/Accordion'
import useWindowSize from '@cm/hooks/useWindowSize'

const UcarDetail = (props: DetailPagePropType) => {
  const {width} = useWindowSize()

  const pageWidth = Math.max(1200, width * 0.85)
  const TabComponentArray = [
    // {
    //   exclusiveTo: dataExists,
    //   label: '不備履歴',
    //   defaultOpen: UcarData.PaperWorkNotes?.length > 0,
    //   component: (
    //     <PaperWorkNoteCreator
    //       {...{
    //         UcarData,
    //         mutateRecords: () => undefined,
    //       }}
    //     />
    //   ),
    // },
    {
      label: '車両基本情報',
      defaultOpen: true,
      component: (
        <div className={` max-h-[550px] overflow-auto  `}>
          <MyForm {...props} />
        </div>
      ),
    },
    // {
    //   exclusiveTo: dataExists,
    //   label: '車両プロセス',
    //   component: (
    //     <div>
    //       一旦非表示
    //       {/* <UcarProcessInputter {...{UcarData, }} /> */}
    //     </div>
    //   ),
    // },
  ]
  return (
    <div className={`mx-auto w-fit`}>
      <C_Stack style={{width: 'fit-content', maxWidth: pageWidth}}>
        <UcarTop />

        <div>
          {TabComponentArray.map((d, i) => {
            const {label, component, defaultOpen} = d

            return (
              <div key={i}>
                <div className={`shadow-xs `}>
                  <Accordion {...{label, defaultOpen}}>{component}</Accordion>
                </div>
              </div>
            )
          })}
        </div>

        {/* <BasicTabs
          {...{
            id: 'ucarDetail',
            style: {width: pageWidth},
            showAll: false,
            TabComponentArray,
          }}
        /> */}
      </C_Stack>
    </div>
  )
}

export default UcarDetail
