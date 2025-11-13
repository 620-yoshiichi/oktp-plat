import SettlementTool from '@app/(apps)/QRBP/admin/settlementTool/SettlementTool'
import {DoubledBP} from '@app/(apps)/QRBP/class/doubledBpNumber'

const SettlementToolPage = async props => {
  const query = await props.searchParams;
  const bpNumber = `30 ` + query.bpNumber

  const omitProcessesTargets = [`やり直し`, `再調整`, `教育`]
  const commonProps = {
    orderBy: [{date: 'asc'}, {id: 'asc'}],
    include: {
      User: {},
      ProcessNameMaster: {},
    },
  }

  const Car = await DoubledBP.getLatestCarByBpNumber(bpNumber, {
    queryObject: {
      include: {
        Process: {where: {type: {notIn: omitProcessesTargets}}, ...commonProps},
      },
    },
  })

  const CarForShanaiJikan = await DoubledBP.getLatestCarByBpNumber(bpNumber, {
    queryObject: {
      include: {
        Process: {where: {type: {in: omitProcessesTargets}}, ...commonProps},
      },
    },
  })

  return (
    <>
      <SettlementTool {...{Car, CarForShanaiJikan}} />
    </>
  )
}

export default SettlementToolPage
