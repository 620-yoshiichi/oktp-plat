import ClientWrapper from '@app/(apps)/QRBP/admin/delivery/ClientWrapper'
import {getBpCarData, getNewCarData} from '@app/(apps)/QRBP/admin/delivery/getter'

import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {getWhereQuery} from '@cm/lib/methods/redirect-method'
import {initServerComopnent} from 'src/non-common/serverSideFunction'
import prisma from 'src/lib/prisma'
import Redirector from '@cm/components/utils/Redirector'
import {Paper} from '@cm/components/styles/common-components/paper'

import {QrbpEasySearchBuilder} from 'src/non-common/EsCollection/QRBP_EasySearchBuilder'

const DeliveryPage = async props => {
  const query = await props.searchParams
  const {session} = await initServerComopnent({query})

  const today = new Date()
  const defaultQuery = {from: today}

  const {redirectPath, whereQuery: dateWhere} = await getWhereQuery({query, defaultQuery})

  if (redirectPath) {
    return <Redirector redirectPath={redirectPath} />
  }

  const waitingCarWhereCondition = await (await (await QrbpEasySearchBuilder()).car({session, query})).waitingForAccept?.CONDITION
  // getEasySearch()?.waitingForAccept?.CONDITION
  const newCar_DATA = await getNewCarData({dateWhere})
  const bpCar_DATA = await getBpCarData({waitingCarWhereCondition, dateWhere})

  const DeliverSchedule = await prisma.deliverSchedule.upsert({
    where: {
      date: formatDate(toUtc(query.from), 'iso'),
    },
    create: {date: formatDate(toUtc(query.from), 'iso')},
    update: {},
    include: {
      LoadingVehicle: {
        include: {
          Slot: {
            include: {
              Car: {},
              NewCar: {},
            },
          },
        },
      },
    },
  })

  const {result: stores} = await doStandardPrisma('store', 'findMany', {})

  return (
    <>
      <Paper>
        <NewDateSwitcher />
        <ClientWrapper {...{DeliverSchedule, CAR_DATA: {newCar_DATA, bpCar_DATA, DeliverSchedule}, stores}} />
      </Paper>
    </>
  )
}

export default DeliveryPage
