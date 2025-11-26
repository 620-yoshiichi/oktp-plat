import SettlementTool from '@app/(apps)/QRBP/admin/settlementTool/SettlementTool'
import {DoubledBP} from '@app/(apps)/QRBP/class/doubledBpNumber'

const SettlementToolPage = async props => {
  const query = await props.searchParams
  const bpNumber = query.bpNumber ? `30 ` + query.bpNumber : null

  const omitProcessesTargets = [`やり直し`, `再調整`, `教育`]
  const commonProps = {
    orderBy: [{date: 'asc'}, {id: 'asc'}],
    include: {
      User: {},
      ProcessNameMaster: {},
    },
  }

  // すべての車を取得
  const allCars = bpNumber
    ? await DoubledBP.getAllCarsByBpNumber(bpNumber, {
        queryObject: {
          include: {
            Process: {where: {type: {notIn: omitProcessesTargets}}, ...commonProps},
          },
        },
      })
    : []

  const allCarsForShanaiJikan = bpNumber
    ? await DoubledBP.getAllCarsByBpNumber(bpNumber, {
        queryObject: {
          include: {
            Process: {where: {type: {in: omitProcessesTargets}}, ...commonProps},
          },
        },
      })
    : []

  // 最新の車（後方互換性のため）
  const Car = allCars[0] || null
  const CarForShanaiJikan = allCarsForShanaiJikan[0] || null

  return (
    <>
      <SettlementTool {...{Car, CarForShanaiJikan, allCars, allCarsForShanaiJikan}} />
    </>
  )
}

export default SettlementToolPage
