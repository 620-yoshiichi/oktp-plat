import Tree from '@app/(apps)/shinren/admin/config/referral-tree/Tree'
import {getUserIdWhere} from '@app/(apps)/shinren/class/QueryBuilder'

import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {Padding} from '@cm/components/styles/common-components/common-components'

import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'

const ReferralTreePage = async props => {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const userIdWhere = getUserIdWhere({scopes, query})
  const allReferalHistory = await prisma.rentaReference.findMany({
    include: {
      RefFrom: {
        include: {
          RentaCustomer: {
            include: {User: {}},
          },
        },
      },
      RefTo: {
        include: {
          RentaCustomer: {
            include: {User: {}},
          },
        },
      },
    },
  })

  const topReferrer = {}
  const referralHistory = allReferalHistory.filter(referral => {
    const hit1 = userIdWhere.in.includes(referral?.RefFrom?.RentaCustomer?.userId)
    const customer = referral.RefFrom.RentaCustomer
    const hisReferralHistories = allReferalHistory.filter(referral => {
      return referral.rentaCustomerId === customer.id
    })

    const hit2 = hisReferralHistories.length > 0
    if (hit1 && hit2) {
      obj__initializeProperty(topReferrer, customer.id, {
        refereer: customer,
        referrals: [],
      })
      topReferrer[customer.id].referrals.push(referral)
    }
  })

  return (
    <Padding>
      <Tree {...{topReferrer, allReferalHistory, query}}></Tree>
    </Padding>
  )
}

export default ReferralTreePage
