'use client'

import {Shinren} from '@app/(apps)/shinren/class/Shinren'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'
import Accordion from '@cm/components/utils/Accordions/Accordion'

const Tree = ({allReferalHistory, query, topReferrer}) => {
  const shownData: any[] = []
  const ReferralTree = ({referralHistory}) => {
    const sort = [...referralHistory].sort((a, b) => {
      let aCount = 0
      let bCount = 0
      for (const referral of allReferalHistory) {
        if (referral.rentaCustomerId === a?.RefTo.rentaCustomerId) {
          aCount++
        }
        if (referral.rentaCustomerId === b?.RefTo.rentaCustomerId) {
          bCount++
        }
      }

      return bCount - aCount
    })

    return (
      <>
        <C_Stack className={`gap-0  `}>
          {sort.map((referral, i) => {
            const customer = referral.RefTo.RentaCustomer

            const link = Shinren.rentaCustomer.getCustomerDetailLink({customer, query, mode: `detail`})

            const hisReferralHistories = allReferalHistory.filter(referral => referral.rentaCustomerId === customer.id)

            const accLabel = (
              <R_Stack>
                <strong>{hisReferralHistories.length}</strong>
                <small className={`text-xs`}>件紹介</small>
              </R_Stack>
            )
            // const accValue = ``
            const accValue = <ReferralTree {...{refereer: customer, referralHistory: hisReferralHistories}} />
            shownData.push(customer.id)
            return (
              <div key={i} className={`ml-12 w-fit min-w-[280px]  border-4 border-r-0 border-t-0 border-double p-2`}>
                <Paper className={`w-fit`}>
                  <R_Stack className={`items-start`}>
                    <div className={`w-fit`}>{link}</div>

                    {hisReferralHistories.length > 0 && (
                      <Accordion
                        {...{
                          styling: {
                            classes: {
                              value: `mt-0`,
                              label: `border-none p-0 mt-0`,
                            },
                          },
                        }}
                        label={accLabel}
                      >
                        {accValue}
                      </Accordion>
                    )}
                  </R_Stack>
                  <span className={`ml-5 font-bold `}>({customer.User?.name})</span>
                </Paper>
              </div>
            )
          })}
        </C_Stack>
      </>
    )
  }

  return (
    <C_Stack className={`gap-10 `}>
      {Object.keys(topReferrer).map((id, i) => {
        const {refereer, referrals} = topReferrer[id]

        const hasReferred = allReferalHistory.some(referral => {
          return referral.RefTo.rentaCustomerId === refereer.id
        })
        if (hasReferred) return
        const link = Shinren.rentaCustomer.getCustomerDetailLink({customer: refereer, query, mode: `detail`})

        return (
          <div key={i}>
            <Paper className={`w-fit`}>
              {link}

              <span className={`ml-5 font-bold `}>({refereer.User?.name})</span>
            </Paper>
            <ReferralTree {...{referralHistory: referrals}} />
          </div>
        )
      })}
    </C_Stack>
  )
}

export default Tree
