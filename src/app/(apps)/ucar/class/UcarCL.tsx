import { doStandardPrisma } from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {
  BankMaster,
  AppliedUcarGarageSlot,
  Store,
  UcarPaperWorkNotes,
  UcarProcess,
  BankBranchMaster,
  Ucar,
  UPASS,
  Number98,
  User,
  UcarGarageSlotMaster,
  UcarGarageLocationMaster,
  OldCars_Base,
  UpassFamilyTree,
  Prisma,
  ZAIKO_Base,
} from '@prisma/generated/prisma/client'
import { roleIs } from 'src/non-common/scope-lib/judgeIsAdmin'
import { QueryBuilder } from '@app/(apps)/ucar/class/QueryBuilder'

import { IconBtn } from '@cm/components/styles/common-components/IconBtn'
import { Alert } from '@cm/components/styles/common-components/Alert'
import { R_Stack } from '@cm/components/styles/common-components/common-components'
import { globalIds } from 'src/non-common/searchParamStr'

export type UpassStandardType = UPASS & {
  MyUpassTree: UpassFamilyTree & {
    RootUpass: UpassFamilyTree & {
      UPASS: UPASS
    }
  }
}
export type ucarData = Ucar & {
  DestinationStore: Store
  OldCars_Base: OldCars_Base & {
    ZAIKO_Base: ZAIKO_Base
  }

  UPASS: UpassStandardType
  Number98: Number98
  User: User
  Store: Store
  UcarProcess: (UcarProcess & { User: User })[]
  UcarPaperWorkNotes: UcarPaperWorkNotes & { User: User }
  AppliedUcarGarageSlot: AppliedUcarGarageSlot & {
    UcarGarageSlotMaster: UcarGarageSlotMaster & {
      UcarGarageLocationMaster: UcarGarageLocationMaster
    }
  }
  BankMaster: BankMaster
  BankBranchMaster: BankBranchMaster & { User: User }
}

export class UcarCL {
  data: ucarData
  constructor(ucar: ucarData) {

    this.data = ucar
  }

  static testSateiID = '163012511000005'

  static getUpassFaimilyTree = async ({ sateiID }) => {
    const { result: upass } = await doStandardPrisma('uPASS', 'findUnique', {
      where: { sateiID: sateiID },
    })

    const { result: myTree } = await doStandardPrisma('upassFamilyTree', 'findUnique', {
      where: {
        sateiID: sateiID,
      },
    })

    const { result: familyTree } = await doStandardPrisma('upassFamilyTree', 'findMany', {
      where: {
        rootSateiID: myTree?.rootSateiID ?? '',
      },
      orderBy: { sateiDate: 'asc' },
    })

    const lastSateiId = upass?.dataSource === 'aisatei' ? upass.sateiID : familyTree[familyTree.length - 1]?.sateiID
    const isLastSateiId = upass?.dataSource === 'aisatei' ? true : lastSateiId === sateiID

    const CopyButton = (
      <R_Stack>
        最新の査定番号は、
        <IconBtn
          color="blue"
          onClick={e => {
            navigator.clipboard.writeText(lastSateiId)
            alert('コピーしました')
          }}
        >
          {lastSateiId}
        </IconBtn>
        です。
      </R_Stack>
    )
    const AlertComponent = lastSateiId ? (
      <>
        {isLastSateiId ? (
          <Alert color="green">
            <div>最新の査定IDです</div>
            <div>{CopyButton}</div>
          </Alert>
        ) : (
          <Alert color="yellow">
            <div>最新の査定IDではありません。</div>
            <div>{CopyButton}</div>
          </Alert>
        )}
      </>
    ) : upass ? (
      <Alert color="red">査定IDが見つかりません</Alert>
    ) : null

    return {
      Tree: familyTree.sort((a, b) => {
        return new Date(a.sateiDate).getTime() - new Date(b.sateiDate).getTime()
      }),
      isLastSateiId,
      lastSateiId,
      AlertComponent,
    }
  }
  static checkSateiIdIsLatest = async (sateiID: string) => {
    const { result: upass } = await doStandardPrisma('uPASS', 'findUnique', {
      where: { sateiID },
      include: {
        MyUpassTree: true,
        RootUpass: true,
      },
    })

    const { RootUpass, MyUpassTree } = upass

    if (RootUpass) {
      return true
    }
    return false
  }

  static getLatestUPASS(currentUPASS: UpassStandardType) {
    // dataSource === 'aisatei' の場合は現在のUPASSをそのまま使用
    if (!currentUPASS) {
      return null
    }

    if (currentUPASS?.dataSource === 'aisatei') {
      return currentUPASS
    }

    return currentUPASS?.MyUpassTree?.RootUpass
  }

  get ai21Data() {
    return {
      DD_SIIRE: this.data?.OldCars_Base?.DD_SIIRE, //仕入日
      KI_SIIREKA: this.data?.OldCars_Base?.KI_SIIREKA, //仕入価格
      DD_URIAGE: this.data?.OldCars_Base?.DD_URIAGE, //売上日
      CD_TENJTENP: this.data?.OldCars_Base?.ZAIKO_Base?.CD_TENJTENP ?? '', //在庫店舗
      MJ_ZAIKOST: this.data?.OldCars_Base?.ZAIKO_Base?.MJ_ZAIKOST ?? '', //展示店舗
      KI_HANKAKA: this.data?.OldCars_Base?.KI_HANKAKA ?? 0,
      //売上金額
    }
  }

  static getNotationFromUpassModel = (UPASS: UPASS, tmpUcarData: any) => {

    const plate = [
      UPASS.landAffairsName,
      UPASS.registrationClassNumber,
      UPASS.registrationKana,
      UPASS.registrationSerialNumber,
    ].join('') || [
      tmpUcarData.tmpLandAffairsName,
      tmpUcarData.tmpRegistrationClassNumber,
      tmpUcarData.tmpRegistrationKana,
      tmpUcarData.tmpPlate
    ].join('')

    const nenshiki = UPASS.modelYear ? new Date().getFullYear() - Number(UPASS?.modelYear) : ''

    return {
      sateiID: UPASS.sateiID,

      storeName: tmpUcarData?.Store?.name,
      staffName: tmpUcarData?.User?.name,
      nenshiki: nenshiki || tmpUcarData.tmpModelYear,
      plate,
      grade: UPASS.grade || tmpUcarData.tmpGrade || '',
      customerName: UPASS.customerName,
      modelName: UPASS.modelName || tmpUcarData.tmpModelName || '',
      modelYear: (UPASS.modelYear || tmpUcarData.tmpModelYear || '').replace('発売モデル', ''),
      exteriorColor: UPASS.exteriorColor || tmpUcarData.tmpColor || '',
      type: UPASS.type || tmpUcarData.tmpType || '',
      chassisNumber: UPASS.chassisNumber || tmpUcarData.tmpChassisNumber || '',
      length: UPASS.length ? UPASS.dataSource === 'aisatei' ? Number(UPASS.length) / 10 : Number(UPASS.length) : '',
      width: UPASS.width ? UPASS.dataSource === 'aisatei' ? Number(UPASS.width) / 10 : Number(UPASS.width) : '',
      height: UPASS.height ? UPASS.dataSource === 'aisatei' ? Number(UPASS.height) / 10 : Number(UPASS.height) : '',

      commonType: UPASS.commonType || tmpUcarData.tmpCommonType || '',
      engineType: UPASS.engineType || '',
      vehicleHistory: UPASS.vehicleHistory || '',
      capacityMin: UPASS.capacityMin || '',
      capacityMax: UPASS.capacityMax || '',
      maxLoad: UPASS.maxLoad || '',
      weight: UPASS.weight || '',
      frameNumber: UPASS.chassisNumber || tmpUcarData.tmpFrameNumber || '',
      brandName: UPASS.brandName || tmpUcarData.tmpBrandName || '',
      registrationClassNumber: UPASS.registrationClassNumber || tmpUcarData.tmpRegistrationClassNumber || '',
      registrationKana: UPASS.registrationKana || tmpUcarData.tmpRegistrationKana || '',
      registrationSerialNumber: UPASS.registrationSerialNumber || tmpUcarData.tmpPlate || '',

      assessmentdatetime: UPASS.assessmentdatetime,
      assessmentprice: UPASS.assessmentPrice,
      pickupScheduledDate: UPASS.pickupScheduledDate,
    }
  }
  get notation() {
    return UcarCL.getNotationFromUpassModel(this.data.UPASS ?? {}, this.data)
    const UPASS = (UcarCL.getLatestUPASS(this.data.UPASS ?? {})) as UPASS
    const plate = [
      UPASS.landAffairsName,
      UPASS.registrationClassNumber,
      UPASS.registrationKana,
      UPASS.registrationSerialNumber,
    ].join('') || [
      this.data.tmpLandAffairsName,
      this.data.tmpRegistrationClassNumber,
      this.data.tmpRegistrationKana,
      this.data.tmpPlate
    ].join('')

    const nenshiki = UPASS.modelYear ? new Date().getFullYear() - Number(UPASS?.modelYear) : ''

    return {
      sateiID: this.data.sateiID,
      storeName: this.data?.Store?.name,
      staffName: this.data?.User?.name,
      nenshiki: nenshiki || this.data.tmpModelYear,
      plate,
      grade: UPASS.grade || this.data.tmpGrade || '',
      customerName: UPASS.customerName,
      modelName: UPASS.modelName || this.data.tmpModelName || '',
      modelYear: (UPASS.modelYear || this.data.tmpModelYear || '').replace('発売モデル', ''),
      exteriorColor: UPASS.exteriorColor || this.data.tmpColor || '',
      type: UPASS.type || this.data.tmpType || '',
      chassisNumber: UPASS.chassisNumber || this.data.tmpChassisNumber || '',
      length: UPASS.length || '',
      width: UPASS.width || '',
      height: UPASS.height || '',

      commonType: UPASS.commonType || this.data.tmpCommonType || '',
      engineType: UPASS.engineType || '',
      vehicleHistory: UPASS.vehicleHistory || '',
      capacityMin: UPASS.capacityMin || '',
      capacityMax: UPASS.capacityMax || '',
      maxLoad: UPASS.maxLoad || '',
      weight: UPASS.weight || '',
      frameNumber: UPASS.chassisNumber || this.data.tmpFrameNumber || '',
      brandName: UPASS.brandName || this.data.tmpBrandName || '',
      registrationClassNumber: UPASS.registrationClassNumber || this.data.tmpRegistrationClassNumber || '',
      registrationKana: UPASS.registrationKana || this.data.tmpRegistrationKana || '',
      registrationSerialNumber: UPASS.registrationSerialNumber || this.data.tmpPlate || '',

      assessmentdatetime: UPASS.assessmentdatetime,
      assessmentprice: UPASS.assessmentPrice,
      pickupScheduledDate: UPASS.pickupScheduledDate,
    }
  }

  get builder() {
    const email = {
      carInfoText: [
        `店舗名: ${this.notation.storeName ?? '-'}`,
        `スタッフ名: ${this.notation.staffName ?? '-'}`,
        `査定ID: ${this.notation.sateiID ?? '-'}`,
        `車名: ${this.notation.modelName ?? '-'}`,
        `車台番号: ${this.notation.frameNumber ?? '-'}`,
        `お客様: ${this.notation.customerName ?? '-'}`,
      ].join('\n'),
    }
    return {
      email,
    }
  }

  static converter = {
    shapeNumber98: (string: string) => {
      const left2 = string.slice(0, 2)
      const mid5 = string.slice(2, 7)
      return `${left2} ${mid5}`
    },
  }

  static col = {
    userIdColumn: {
      label: 'スタッフ',
      id: globalIds.globalUserId,
      form: {},
      forSelect: {
        config: {
          where: {
            rentaStoreId: { not: null },
          },
        },
      },
      search: {},
    },
  }

  static colConst = () => {
    const getUcarBasicCols = () => {
      return [
        { id: `Number98.number`, label: `98番号` },
        { id: `Assessment_ID`, label: `査定ID` },
        { id: `Model_name`, label: `車名` },
        { id: `Barracks`, label: `車台番号` },
        { id: `KI_HANKAKA`, label: `販売価格` },
        { id: `CD_ZAIKOTEN_NAME`, label: `在庫店舗名` },
      ]
    }

    return { getUcarBasicCols }
  }

  static getUserId = ({ session, query }) => {
    const schoolId = roleIs(['管理者'], session) ? Number(query?.userId ?? session?.id ?? 0) : Number(session?.id ?? 0)

    return schoolId
  }

  static isLatestSateiID = async sateiID => {
    const { result: upass } = await doStandardPrisma('uPASS', 'findUnique', {
      where: { sateiID },
      include: {
        RootUpass: true,
        MyUpassTree: {
          include: {
            UPASS: true,
          },
        },
      },
    })

    const faimilyTree = upass?.MyUpassTree ?? []

    return faimilyTree.length === 0
  }
  static fetcher = {
    getUcarDataList: async (props: {
      where: Prisma.UcarWhereInput
      orderBy: Prisma.UcarOrderByWithRelationInput | Prisma.UcarOrderByWithRelationInput[]
      take?: number
      skip?: number
      include?: Prisma.UcarInclude
    }) => {
      const { where, take, skip, include, orderBy } = props
      const { result: ucar } = await doStandardPrisma(`ucar`, `findMany`, {
        include: include ?? QueryBuilder.getInclude({}).ucar.include,
        where,
        take,
        skip,
        orderBy,
      })

      return ucar as ucarData[]
    },

    getUcarDataBySateiId: async (sateiID: string) => {
      const { result: ucar } = await doStandardPrisma(`ucar`, `findUnique`, {
        where: { sateiID },
        include: QueryBuilder.getInclude({}).ucar.include,
      })

      return ucar as ucarData
    },

    getTenchoListBySateiId: async (sateiID: string) => {
      const { result: tenchoList } = await doStandardPrisma(`user`, `findMany`, {
        where: {
          Store: { Ucar: { some: { sateiID } } },
          UserRole: {
            some: {
              OR: [
                { RoleMaster: { name: '店長' } },
                { RoleMaster: { name: '副店長' } },
              ]
            }
          },
        },
      })
      return { tenchoList }
    },
  }
}
