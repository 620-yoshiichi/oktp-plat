import {getColorStyles} from '@cm/lib/methods/colors'
import {Fragment} from 'react'
import TableRowForUser from './TableRowForUser'
const ProcessTable = ({ProcessByStuffObject, useGlobalProps, processMaster}) => {
  return (
    <div className={`table-wrapper  `} style={{maxWidth: '90vw'}}>
      <table className={`text-center`}>
        <thead>
          <tr>
            <th></th>
            {processMaster?.map(data => (
              <th key={data.id} colSpan={2} style={{...getColorStyles(data.color)}}>
                {data.name}
              </th>
            ))}
          </tr>
          <tr>
            <th></th>
            {processMaster?.map((data, i) => (
              <Fragment key={i}>
                <th style={{...getColorStyles(data.color)}}>件数</th>
                <th style={{...getColorStyles(data.color)}}>時間</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(ProcessByStuffObject).map((userId, i) => {
            const {User, processArrayForUser} = ProcessByStuffObject[userId]

            return <TableRowForUser key={i} {...{User, processArrayForUser, processMaster}} />
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ProcessTable
