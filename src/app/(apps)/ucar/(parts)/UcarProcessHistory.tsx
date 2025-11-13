import {cl} from '@cm/lib/methods/common'
import {HREF} from '@cm/lib/methods/urls'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {codeItem} from '@cm/class/Code'
import MyPopover from '@cm/components/utils/popover/MyPopover'
import {Paper} from '@cm/components/styles/common-components/paper'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {ucarData} from '@app/(apps)/ucar/class/UcarCL'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

const UcarProcessHistory = ({
  ucar,
  query,
  className,
  processMasters,
}: {
  ucar: ucarData
  query: any
  className: string
  processMasters: codeItem[]
}) => {
  if (Array.isArray(ucar.UcarProcess) === false) return <></>

  return (
    <div className={`mx-auto ${className}`}>
      <div className={` gap-0  grid grid-cols-4 `}>
        {processMasters?.map(p => {
          const {label, color, code} = p
          const theProcesses = ucar.UcarProcess?.filter(up => up.processCode === code)

          const active = theProcesses?.length > 0
          const {sateiID} = ucar

          const href = HREF(`/ucar/create-process`, {sateiID, processCode: code}, query)

          const className = cl(`w-[50px] p-0.5 text-[9px]`, `  cursor-pointer`)

          return (
            <div key={p.dataKey} className={className}>
              <MyPopover button={<PopoverButton {...{href, label: p.label, color, active}} />}>
                {active && (
                  <Paper className={`text-lg`}>
                    <R_Stack>
                      <IconBtn color={color}>{label}</IconBtn>
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th>日時</th>
                            <th>スタッフ</th>
                            <th>備考</th>
                          </tr>
                        </thead>
                        <tbody>
                          {theProcesses.map(p => {
                            return (
                              <tr key={p.id}>
                                <td>{formatDate(p.date, 'YY-MM-DD(ddd) HH:mm')}</td>
                                <td>{p.User?.name}</td>
                                <td>{p.remarks}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </R_Stack>
                  </Paper>
                )}
              </MyPopover>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UcarProcessHistory

const PopoverButton = ({href, label, color, active}) => {
  return (
    <div>
      <T_LINK href={href} className={` text-inherit no-underline`} target="_blank">
        <div
          className={cl(active ? '' : ' bg-gray-200  opacity-30 scale-80')}
          style={{
            fontWeight: active ? 'bold' : 'normal',
            fontSize: 10,
            height: 16,
            padding: 0,
            width: 60,
            textAlign: 'center',
            backgroundColor: active ? color : '',
          }}
          // active={active}
        >
          {label}
        </div>
      </T_LINK>
    </div>
  )
}
