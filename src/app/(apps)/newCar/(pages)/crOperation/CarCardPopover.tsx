'use client'

import {NEW_CAR_CONST} from '@app/(apps)/newCar/(constants)/newCar-constants'
import {NewCarClass} from '@app/(apps)/newCar/class/NewCarClass/NewCarClass'
import {useCrScheduleSwitcherModal} from '@app/(apps)/newCar/templateHooks/useCrScheduleSwitcherModal'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {Paper} from '@cm/components/styles/common-components/paper'
import {LabelValue} from '@cm/components/styles/common-components/ParameterCard'

import useModal from '@cm/components/utils/modal/useModal'
import MyPopover from '@cm/components/utils/popover/MyPopover'

import {DocumentIcon, InformationCircleIcon} from '@heroicons/react/20/solid'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import {cl, isDev, shorten} from '@cm/lib/methods/common'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'

export default function CarCardPopover(props: {
  CrScheduleSwitcherModal_HK: ReturnType<typeof useCrScheduleSwitcherModal>
  theCar
  cellProps
}) {
  const {CrScheduleSwitcherModal_HK, theCar, cellProps} = props
  const {
    NO_CYUMON,
    lastApprovedDesiredTorokuDate,
    KJ_KURUMAME,
    User,
    Store,
    NO_FRAME,
    KJ_KAINMEI1,
    DD_TOUROKU,
    DD_SAGTYYO,
    DD_HAISKIBO,
    DD_HAISOYOT,
    DD_TORIKESI,
  } = theCar ?? {}

  if (DD_TORIKESI) {
    throw new Error(`DD_TORIKESI`)
  }
  const lastHistory = new NewCarClass(theCar).chakko.getLatestCrInspectionHistory()

  // const torokuDone = DD_TOUROKU ? <StarIcon className={`w-5 text-red-500`} /> : null

  const smallTextClass = `text-[11px] text-gray-500 flex flex-nowrap items-center`
  const largeTextClass = `text-[15px] bont-bold text-black`

  const PopOverButton = () => {
    return (
      <MyPopover
        {...{
          button: (
            <span>
              <InformationCircleIcon className={`h-4 text-gray-700`} />
            </span>
          ),
          // mode: `click`,
        }}
      >
        <Paper>
          <LabelValue
            {...{
              label: `ユーザー名`,
              value: User?.name,
            }}
          />
          <LabelValue
            {...{
              label: `店舗名`,
              value: Store?.name,
            }}
          />
          <LabelValue
            {...{
              label: `注文番号`,
              value: NO_CYUMON,
            }}
          />
          <LabelValue
            {...{
              label: `フレーム番号`,
              value: NO_FRAME,
            }}
          />
          <LabelValue
            {...{
              label: `車名`,
              value: KJ_KURUMAME,
            }}
          />
          <LabelValue
            {...{
              label: `買主`,
              value: KJ_KAINMEI1,
            }}
          />
          <LabelValue
            {...{
              label: `登録希望申請日`,
              value: formatDate(lastApprovedDesiredTorokuDate),
            }}
          />
          <LabelValue
            {...{
              label: `登録日`,
              value: formatDate(DD_TOUROKU),
            }}
          />
          <LabelValue
            {...{
              label: `作業着工日(当初)`,
              value: formatDate(DD_SAGTYYO),
            }}
          />
          <LabelValue
            {...{
              label: `配送希望日`,
              value: formatDate(DD_HAISKIBO),
            }}
          />
          <LabelValue
            {...{
              label: `配送予定日`,
              value: formatDate(DD_HAISOYOT),
            }}
          />
        </Paper>
      </MyPopover>
    )
  }

  const ModalButton = ({children}) => {
    const {query} = useGlobal()
    return (
      <div
        {...{
          className: `onHover`,

          onClick: e => {
            // if (e.ctrlKey) {
            //   const href = HREF(`newCar/newCar?search=NEWCAR[contains:NO_CYUMON=${theCar.NO_CYUMON}`, {}, query)
            //   window.open(href, '_blank')
            //   return
            // }

            CrScheduleSwitcherModal_HK.setGMF_OPEN({theCar, lastHistory})
          },
        }}
      >
        {children}
      </div>
    )
  }

  const master: any = NEW_CAR_CONST.CR_OPERATION.STATUS_COLORS.find(s => s.value === lastHistory?.status) ?? {}
  const style = {
    background: cellProps?.style.background + '40',
    border: `1px solid ${cellProps?.style.background}`,
    padding: 4,
    height: 160,
    width: 160,
  }

  const MemoButton = () => {
    const {Modal, handleOpen, handleClose} = useModal()
    const MemoForm = () => {
      const {toggleLoad} = useGlobal()
      const {BasicForm, latestFormData} = useBasicFormProps({
        formData: {crOperationRemarks: theCar.crOperationRemarks},
        columns: new Fields([
          //
          {id: `crOperationRemarks`, label: `備考`, type: `textarea`, form: {}},
        ]).transposeColumns(),
      })

      return (
        <>
          <BasicForm
            latestFormData={latestFormData}
            onSubmit={async data => {
              toggleLoad(async () => {
                const res = await doStandardPrisma(`newCar`, `update`, {
                  where: {id: theCar.id},
                  data: {
                    crOperationRemarks: data.crOperationRemarks,
                  },
                })
                toastByResult(res)
                handleClose()
              })
            }}
          >
            <Button>登録</Button>
          </BasicForm>
        </>
      )
    }

    return (
      <div>
        <div {...{onClick: handleOpen}} className={`text-sm text-gray-500`}>
          <DocumentIcon
            className={`
            w-4
            ${theCar.crOperationRemarks ? 'text-yellow-500' : 'opacity-30'}`}
          />
        </div>
        <Modal>
          <>
            <MemoForm />
          </>
        </Modal>
      </div>
    )
  }

  const Info = () => {
    const workDay = new NewCarClass(theCar)?.chakko.getPendingDateOrDD_SAGTYYO()

    const notInTime = lastApprovedDesiredTorokuDate === null || (workDay && lastApprovedDesiredTorokuDate >= workDay)

    return (
      <div {...{className: `relative `}}>
        <C_Stack {...{className: ` gap-0 items-start`}}>
          <div {...{className: `absolute !bottom-0 !right-1`}}>
            {isDev && theCar.haisou_tooEarly && <Button color={`red`}>NG</Button>}
          </div>
          <div className={smallTextClass}>
            <span>車名:</span>
            <span className={largeTextClass}>{shorten(KJ_KURUMAME, 6)}</span>
          </div>
          {lastHistory && lastHistory?.status !== `着工` && (
            <div className={`${smallTextClass} text-error-main font-bold`}>
              <span>保留先:</span>
              <span className={largeTextClass}>{formatDate(lastHistory?.date ?? lastHistory?.date, 'MM/DD(ddd)')}</span>
            </div>
          )}
          <div className={cl(smallTextClass, notInTime ? 'bg-error-main/20 ' : '')}>
            <span>登録予定:</span>
            <span className={largeTextClass}>
              {lastApprovedDesiredTorokuDate ? formatDate(lastApprovedDesiredTorokuDate, 'MM/DD(ddd)') : '未定'}
            </span>
          </div>
          <div className={smallTextClass}>
            <span>配送:</span>
            <span className={largeTextClass}>{formatDate(DD_HAISOYOT ?? DD_HAISKIBO, 'MM/DD(ddd)')}</span>
          </div>
          <div className={smallTextClass}>
            <span>難易度:</span>
            <span className={largeTextClass}>{theCar.KB_DAIHYNAI}</span>
          </div>
          <div className={smallTextClass}>
            <span>取付時間:</span>
            <span className={largeTextClass}>{theCar.TM_TOTUTMKE}</span>
          </div>

          <div className={smallTextClass}>
            <span>買主:</span>
            <span className={largeTextClass + ' w-[100px]  truncate text-start text-sm'}>{theCar.KJ_KAINMEI1}</span>
          </div>
        </C_Stack>
      </div>
    )
  }

  return (
    <div {...{...cellProps, style}}>
      <div>
        <C_Stack className={` items-start gap-0 leading-4`}>
          <R_Stack className={`w-full justify-between gap-0.5 text-sm`}>
            <R_Stack className={` flex-nowrap gap-0.5  text-xs`}>
              <ModalButton>
                <div className={`text-[1rem] font-bold text-black`}>{NO_CYUMON}</div>
              </ModalButton>
              <PopOverButton />
              <MemoButton></MemoButton>
            </R_Stack>

            {/* <span>{torokuDone}</span> */}
          </R_Stack>
          <Info />
        </C_Stack>
      </div>
    </div>
  )
}
