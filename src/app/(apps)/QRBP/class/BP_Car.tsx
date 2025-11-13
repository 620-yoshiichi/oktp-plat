import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {basePath, handleDB} from '@cm/lib/methods/common'
import {knockEmailApi} from '@cm/lib/methods/knockEmailApi'

import {addDays, differenceInDays} from 'date-fns'

import {anyObject} from '@cm/types/utility-types'
import {NumHandler} from '@cm/class/NumHandler'
import {getMidnight, toUtc} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {arr__sortByKey} from '@cm/class/ArrHandler/array-utils/sorting'
export class BP_Car {
  car: anyObject
  constructor(car: anyObject) {
    this.car = car
  }

  static const = {
    defaultCountPerPage: 10,
    ProcessOrderBy: [
      //
      {date: 'asc'},
      {ProcessNameMaster: {sortOrder: 'asc'}},
      {id: 'asc'},
    ],
    carTypes: [
      {value: '新車', color: '#509e32'},
      {value: '中古車', color: '#e96c6c'},
      {value: 'BP', color: '#f2b05a'},
    ],
    userTypes: [
      {value: 'CRアドバイザ', color: '#90BCE4'},
      {value: '拠点アドバイザ', color: '#A7C853'},
      {value: 'CRエンジニア', color: '#FAE34C'},
    ],
    engineerTeamType: [
      {value: `塗装チーム`, color: '#99BBE0'},
      {value: `板金チーム`, color: '#ADC764'},
      {value: `仕上げ`, color: '#a364c7'},
    ],

    gender: ['男性', '女性'],
    insuranceTypes: [{value: '対物'}, {value: '車両'}, {value: '無し'}, {value: 'その他'}],
    insuranceCompanyTypes: [
      {value: '東海'},
      {value: 'あいおい'},
      {value: '三井'},
      {value: '損保J'},
      {value: 'JA共済'},
      {value: 'ネット'},
      {value: 'その他'},
    ],

    timeTypes: [
      ...new Array(500).fill('').map((dummy, idx) => {
        const value = NumHandler.round((Number(idx + 1) * 10) / 100, 1).toFixed(1)

        return {id: value, value, name: value}
      }),
    ],

    processTypes: [
      {value: `通常`, color: '#c2c2c2'},
      {value: `やり直し`, color: '#c7b864'},
      {value: `再調整`, color: '#c78064'},
      {value: `教育`, color: '#fd5e5e'},
    ],
  }

  static goodby = {}

  getCarInfoForEmail = () => {
    const {carName, bpNumber, customerName, DamageNameMaster, scheduledAt, currentEstimate, plate, frame, katashiki} = this.car

    const carInfo = `
【BP番号:${bpNumber}】
【車名:${carName}】
【お客様:${customerName}】
【プレート:${plate}】
【フレーム:${frame}】
【型式:${katashiki}】`

    return carInfo
  }
  calcScheduledDiff = () => {
    const car = this.car
    const diff: number = car.crScheduledAt ? differenceInDays(new Date(car.crScheduledAt), new Date(car.scheduledAt)) : 0

    return diff
  }

  getLastProcess = () => {
    const ProcessByDate = (this.car?.Process ?? []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const result: anyObject = this.car?.Process?.length > 0 ? this.car?.Process[this.car?.Process?.length - 1] : undefined
    return result
  }
  getDataIncludingRelations = async () => {
    const {result: car} = await doStandardPrisma('car', 'findUnique', {
      where: {id: this.car.id},
      include: {
        CrUser: {
          include: {User: {}},
        },
        User: true,
        Process: {
          orderBy: [{date: 'asc'}, {ProcessNameMaster: {sortOrder: 'asc'}}],
          include: {
            ProcessNameMaster: true,
          },
        },
      },
    })

    return car
  }

  findProcessByName = processName => {
    return this.car?.Process?.find(p => p?.ProcessNameMaster?.name === processName)
  }

  /**プロセスをセットする */
  setProcess = async (session, processName, showAlert = true) => {
    const validRole = BP_Car.getValidRole(processName)?.validRole

    const fromRegularUser = validRole && session.type === validRole

    if (showAlert && fromRegularUser === false) {
      const msg = `【${processName}】の正規の入力者は【${validRole}】です。\n【${session?.type}】として強制入力を実施してよろしいですか？`
      if (!confirm(msg)) {
        return {
          success: false,
          message: '処理を中断しました。',
          toastType: 'warning',
        }
      }
    }

    const theProcess = await (await BP_Car.getProcessNameMasters()).asObject[processName]

    const {Process} = await this.getDataIncludingRelations()
    const theSameProcesses = Process.filter(p => p?.ProcessNameMaster?.name === processName)

    const {repetitionLimit} = theProcess

    const invalid = repetitionLimit && theSameProcesses && repetitionLimit <= theSameProcesses.length

    if (invalid) {
      alert(`その工程は${repetitionLimit}回しか登録できません`)
      return {
        success: false,
        message: '処理を中断しました。',
        toastType: 'warning',
      }
    }

    if (showAlert) {
      if (!confirm(`工程:[${processName}]を記録しますか`)) {
        return {
          success: false,
          message: '処理を中断しました。',
          toastType: 'warning',
        }
      }
    }

    if (['作業完了'].includes(processName)) {
      await this.notifyByEmail({processName})
    }

    const res = await handleDB(async () => {
      const res = await doStandardPrisma('car', 'update', {
        where: {id: this.car.id},
        data: {
          Process: {
            create: {
              name: theProcess.name,
              processNameMasterId: theProcess?.id,
              userId: session?.id,
              storeId: this.car?.storeId,
              type: '通常',
              date: getMidnight(new Date()),
            },
          },
        },
      })
      return res
    })

    return res
  }

  notifyByEmail = async (props: {processName: string}) => {
    const {processName} = props
    const {carName, bpNumber, customerName, plate, frame, katashiki, User} = this.car

    const to = [User?.email].filter(val => val)

    const detailPageUrl = encodeURI(`${basePath}/QRBP/admin/car/forStore?where-car-bpNumber-contains-text=${bpNumber}`)

    const subject = `工程登録通知 /【工程:${processName}】【車名:${carName}】【お客様:${customerName}】`

    const text = `
      下記の通り工程が登録されました。
      【完了工程:${processName}】

      【BP番号:${bpNumber}】
      【車名:${carName}】
      【お客様:${customerName}】
      【プレート:${plate}】
      【フレーム:${frame}】
      【型式:${katashiki}】

      車両詳細は下記URLからご確認ください。
      ${detailPageUrl}


      *本メールは、CR受入 / 洗車 / 作業完了の行程が登録された際に、自動で送信されます。
      *それ以外の工程完了時は、メール通知はありませんので、アプリ上でご確認ください。


      `
    await knockEmailApi({subject, text, to})
  }

  //備考登録の際に、中断を勝手に書き込む
  setInterruptionProcessIfNoteTypeEqualsInterruption = async ({noteNameMasterId, session}) => {
    const {result: noteNameMaster} = await doStandardPrisma('noteNameMaster', 'findUnique', {
      where: {id: noteNameMasterId},
    })

    if (noteNameMaster?.name === '中断' || noteNameMaster?.name === 'キャンセル') {
      this.setProcess(session, noteNameMaster, false)
      return {
        success: true,
        message: `${noteNameMaster}工程を自動登録しました。`,
        noteNameMaster,
      }
    } else {
      return {noteNameMaster}
    }
  }

  isWaiting = () => {
    const obj = {
      着工許可: this.findProcessByName('CR受入') && this.findProcessByName('着工許可') === undefined,
      着工指示: this.findProcessByName('着工許可') && this.findProcessByName('着工指示') === undefined,
      拠点受取:
        (this.findProcessByName('完成検査') || this.findProcessByName('洗車')) &&
        this.findProcessByName('拠点受取') === undefined,
    }
    return obj
  }

  allowChakkoKyoka = () => {
    return this.findProcessByName('CR受入') && this.findProcessByName('着工許可') === undefined
  }
  allowStandBy = () => {
    return this.findProcessByName('着工許可') && this.findProcessByName('着工指示') === undefined
  }
  allowCompleteInput = () => {
    return this.findProcessByName('CR受入') && this.findProcessByName('作業完了') === undefined
  }

  allowAcceptionAtStore = () => {
    return (this.findProcessByName('作業完了') || this.findProcessByName('洗車')) && !this.findProcessByName('拠点受取')
  }

  /**プロセスマスタを全取得 */
  static getProcessNameMasters = async () => {
    const {result: processNameMasters} = await doStandardPrisma('processNameMaster', 'findMany', {})

    const object = Object.fromEntries(
      (processNameMasters ?? []).map(obj => {
        return [obj.name, obj]
      })
    )
    return {asArray: processNameMasters, asObject: object}
  }

  static getProcessNameMasterByName = async name => {
    const processNameMasters = await BP_Car.getProcessNameMasters()
    return processNameMasters.asObject[name]
  }

  /**本来の有効な入力者 */
  static validProcessSenderRules = [
    {processName: 'CR受入', validRole: 'CRアドバイザ', msg: ''},
    {processName: '着工許可', validRole: '拠点アドバイザ', msg: ''},
    {processName: '着工指示', validRole: 'CRアドバイザ', msg: ''},
    {processName: '拠点受取', validRole: '拠点アドバイザ', msg: ''},

    {processName: '塗装下処理', validRole: 'CRエンジニア', msg: ''},
  ]

  /**プロセス名称から有効な入力者を特定 */
  static getValidRole = NameFromProcessNameMaster => {
    const {validRole, msg, processName} =
      BP_Car?.validProcessSenderRules?.find(rule => {
        return rule.processName === NameFromProcessNameMaster
      }) ?? {}
    return {validRole, msg, processName}
  }

  static calcDelivelySchedule = car => {
    const Process = car?.Process ?? []

    const ProcessWillFinishLast = arr__sortByKey(Process, 'createdAt', 'desc').find(p => {
      return p?.ProcessNameMaster?.type === '仕上げ'
    })

    const ProcessWillFinishLastDate = toUtc(formatDate(ProcessWillFinishLast?.date))

    const deliverlyFrom = addDays(new Date(ProcessWillFinishLastDate), 1)

    const deliverlyTo = addDays(new Date(deliverlyFrom), 2)
    const accepted = Process.find(p => {
      return p?.ProcessNameMaster?.type === '拠点受取'
    })

    const showDelivelyScheduld = ProcessWillFinishLast && !accepted

    return {showDelivelyScheduld, deliverlyFrom, deliverlyTo}
  }
}
