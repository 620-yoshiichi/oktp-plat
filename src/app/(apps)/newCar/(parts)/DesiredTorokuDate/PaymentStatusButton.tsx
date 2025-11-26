'use client'
import {btnClass} from '@app/(apps)/newCar/(parts)/DesiredTorokuDate/DesiredTorokuDateRegister'
import PaymentVisualization from '@app/(apps)/newCar/(parts)/DesiredTorokuDate/PaymentVisualization'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import MyPopover from '@cm/components/utils/popover/MyPopover'

export const PaymentStatusButton = ({newCar, isHQ}) => {
  const {KI_BETSIHAK, CUSTOM_paymentCheck, KI_NYURUIKE, KI_SHRIGK, DD_FR, CUSTOM_paymentCheckCustomerType} = newCar
  const status = {label: ``, color: ``}
  if (CUSTOM_paymentCheck === false) {
    status.color = `yellow`
    status.label = '未'
  } else if (CUSTOM_paymentCheck === true) {
    status.color = `gray`
    status.label = '済'
  }

  return (
    <>
      <R_Stack className={` items-center`}>
        <small>{CUSTOM_paymentCheckCustomerType}</small>
        <small>
          {status.label && (
            <div>
              <MyPopover
                {...{
                  button: (
                    <IconBtn
                      {...{
                        // onClick: () => alert(`経理での入金処理後、翌日バッチで反映されます。`),
                        className: btnClass,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </IconBtn>
                  ),
                }}
              >
                <div className={` fixed left-[100px] top-[10px]`}>
                  <div className={` rounded-md !border-4 !border-double bg-gray-100 p-4 pb-20 shadow-md`}>
                    <PaymentVisualization {...{newCar}} />
                  </div>
                </div>
              </MyPopover>
            </div>
          )}
        </small>
      </R_Stack>
    </>
  )
}
