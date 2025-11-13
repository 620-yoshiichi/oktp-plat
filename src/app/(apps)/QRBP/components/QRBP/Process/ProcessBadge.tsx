import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getColorStyles} from '@cm/lib/methods/colors'

export default function ProcessBadge({car, process, children, onClickFunction, size = 'md'}) {
  const {name, color} = process?.ProcessNameMaster ?? {}
  return (
    <div className={`row-stack   scale-100 gap-0`}>
      <div
        onClick={e => {
          if (onClickFunction) {
            onClickFunction(car)
          }
        }}
      >
        {children ? (
          <div>{children}</div>
        ) : (
          <div>
            <div
              style={{
                ...getColorStyles(color),
              }}
              className={`t-badge col-stack   w-fit items-center gap-0 p-[2px]`}
            >
              <span className={`w-full`}>{name}</span>
              {size !== 'sm' && <span>{formatDate(process?.date, 'MM-DD')}</span>}
              {/* <span>{formatDate(process?.date, 'MM-DD')}</span> */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
