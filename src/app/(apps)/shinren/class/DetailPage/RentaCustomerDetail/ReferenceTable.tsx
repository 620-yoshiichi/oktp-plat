'use client'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'

import {ColBuilder} from '@app/(apps)/shinren/class/ColBuilder'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'

import {Shinren} from '@app/(apps)/shinren/class/Shinren'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import {Prisma} from '@prisma/generated/prisma/client'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {toast} from 'react-toastify'

const ReferenceTable = ({rentaCustomer, formData, useGlobalProps, toggleLoad, query}) => {
  const Refinclude = {
    RefFrom: {include: {RentaCustomer: {}}},
    RefTo: {include: {RentaCustomer: {}}},
  }
  const args: Prisma.RentaReferenceFindManyArgs = {
    include: Refinclude,
    where: {
      RefTo: {
        rentaCustomerId: rentaCustomer?.id,
      },
    },
  }

  const {data: referredBy} = useDoStandardPrisma(`rentaReference`, `findMany`, args, {deps: []})

  return (
    <>
      <C_Stack>
        <Paper>
          被紹介客
          <R_Stack>
            {referredBy?.map(d => {
              const customer = d?.RefFrom?.RentaCustomer

              const link = Shinren.rentaCustomer.getCustomerDetailLink({customer, query})
              return <div key={d.id}>{link}</div>
            })}
          </R_Stack>
        </Paper>
        <Paper>
          紹介客
          <ChildCreator
            {...{
              ParentData: rentaCustomer,
              models: {
                parent: 'rentaCustomer',
                children: 'rentaReference',
              },
              additional: {
                include: Refinclude,
              },
              columns: ColBuilder.rentaReference({
                useGlobalProps,
                ColBuilderExtraProps: {
                  rentaCustomerId: rentaCustomer?.id,
                },
              }),
              useGlobalProps,
              myForm: {
                create: {
                  executeUpdate: async props => {
                    return await toggleLoad(async () => {
                      const {latestFormData} = props
                      const {refToId, date, remarks} = latestFormData
                      const rentaCustomerId = formData?.id

                      // 自己選択は不可能
                      if (rentaCustomerId === refToId) {
                        toast.error('紹介元と紹介先が同じになっています。')
                        return
                      }
                      //条件分岐
                      const res = await doStandardPrisma(`rentaReference`, `create`, {
                        data: {
                          date: formatDate(date, `iso`),
                          remarks,
                          RentaCustomer: {
                            connect: {id: rentaCustomerId},
                          },
                          RefFrom: {create: {rentaCustomerId}},
                          RefTo: {create: {rentaCustomerId: refToId}},
                        },
                      })
                      toastByResult(res)
                      return res
                    })
                  },
                },
              },
            }}
          />
        </Paper>
      </C_Stack>
    </>
  )
}

export default ReferenceTable
