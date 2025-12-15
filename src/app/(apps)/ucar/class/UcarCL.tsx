import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

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
} from '@prisma/generated/prisma/client'
import {roleIs} from 'src/non-common/scope-lib/judgeIsAdmin'
import {QueryBuilder} from '@app/(apps)/ucar/class/QueryBuilder'

import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {globalIds} from 'src/non-common/searchParamStr'

export type UpassStandardType = UPASS & {
  MyUpassTree: UpassFamilyTree & {
    RootUpass: UpassFamilyTree & {
      UPASS: UPASS
    }
  }
}
export type ucarData = Ucar & {
  OldCars_Base: OldCars_Base
  UPASS: UpassStandardType
  Number98: Number98
  User: User
  Store: Store
  UcarProcess: (UcarProcess & {User: User})[]
  UcarPaperWorkNotes: UcarPaperWorkNotes & {User: User}
  AppliedUcarGarageSlot: AppliedUcarGarageSlot & {
    UcarGarageSlotMaster: UcarGarageSlotMaster & {
      UcarGarageLocationMaster: UcarGarageLocationMaster
    }
  }
  BankMaster: BankMaster
  BankBranchMaster: BankBranchMaster & {User: User}
}

export class UcarCL {
  data: ucarData
  constructor(ucar: ucarData) {
    this.data = ucar
  }

  static testSateiID = '163012511000005'

  static getUpassFaimilyTree = async ({sateiID}) => {
    const {result: upass} = await doStandardPrisma('uPASS', 'findUnique', {
      where: {
        sateiID: sateiID,
      },
    })

    const {result: myTree} = await doStandardPrisma('upassFamilyTree', 'findUnique', {
      where: {
        sateiID: sateiID,
      },
    })

    const {result: familyTree} = await doStandardPrisma('upassFamilyTree', 'findMany', {
      where: {
        rootSateiID: myTree?.rootSateiID ?? '',
      },
      orderBy: {sateiDate: 'asc'},
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
    ) : (
      <Alert color="red">査定IDが見つかりません</Alert>
    )
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
    const {result: upass} = await doStandardPrisma('uPASS', 'findUnique', {
      where: {sateiID},
      include: {
        MyUpassTree: true,
        RootUpass: true,
      },
    })

    const {RootUpass, MyUpassTree} = upass

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

  get notation() {
    const UPASS = (UcarCL.getLatestUPASS(this.data.UPASS) ?? {}) as UPASS

    const plate = [
      UPASS.landAffairsName,
      UPASS.registrationClassNumber,
      UPASS.registrationKana,
      UPASS.registrationSerialNumber,
    ].join('')

    const nenshiki = UPASS.modelYear ? new Date().getFullYear() - Number(UPASS?.modelYear) : ' '

    return {
      sateiID: this.data.sateiID,
      storeName: this.data?.Store?.name,
      staffName: this.data?.User?.name,

      nenshiki,
      plate,
      grade: UPASS.grade || this.data.tmpGrade || ' ',
      customerName: UPASS.customerName,
      modelName: UPASS.modelName,
      modelYear: (UPASS.modelYear || this.data.tmpModelYear || ' ').replace('発売モデル', ''),
      exteriorColor: UPASS.exteriorColor,
      type: UPASS.type || this.data.tmpType || ' ',
      chassisNumber: UPASS.chassisNumber || ' ',
      length: UPASS.length || ' ',
      width: UPASS.width || ' ',
      height: UPASS.height || ' ',

      commonType: UPASS.commonType || this.data.tmpCommonType || ' ',
      engineType: UPASS.engineType || ' ',
      vehicleHistory: UPASS.vehicleHistory || ' ',
      capacityMin: UPASS.capacityMin || ' ',
      capacityMax: UPASS.capacityMax || ' ',
      maxLoad: UPASS.maxLoad || ' ',
      weight: UPASS.weight || ' ',
      frameNumber: UPASS.chassisNumber || this.data.tmpFrameNumber || ' ',
      brandName: UPASS.brandName || this.data.tmpBrandName || ' ',
      registrationClassNumber: UPASS.registrationClassNumber || this.data.tmpRegistrationClassNumber || ' ',
      registrationKana: UPASS.registrationKana || this.data.tmpRegistrationKana || ' ',
      registrationSerialNumber: UPASS.registrationSerialNumber || this.data.tmpPlate || ' ',

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
            rentaStoreId: {not: null},
          },
        },
      },
      search: {},
    },
  }

  static colConst = () => {
    const getUcarBasicCols = () => {
      return [
        {id: `Number98.number`, label: `98番号`},
        {id: `Assessment_ID`, label: `査定ID`},
        {id: `Model_name`, label: `車名`},
        {id: `Barracks`, label: `車台番号`},
        {id: `KI_HANKAKA`, label: `販売価格`},
        {id: `CD_ZAIKOTEN_NAME`, label: `在庫店舗名`},
      ]
    }

    return {getUcarBasicCols}
  }

  static getUserId = ({session, query}) => {
    const schoolId = roleIs(['管理者'], session) ? Number(query?.userId ?? session?.id ?? 0) : Number(session?.id ?? 0)

    return schoolId
  }

  static isLatestSateiID = async sateiID => {
    const {result: upass} = await doStandardPrisma('uPASS', 'findUnique', {
      where: {sateiID},
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
    getUcarDataList: async (props: {where: Prisma.UcarWhereInput; take?: number; skip?: number}) => {
      const {where, take, skip} = props
      const {result: ucar} = await doStandardPrisma(`ucar`, `findMany`, {
        include: QueryBuilder.getInclude({}).ucar.include,
        where,
        take,
        skip,
      })

      return ucar as ucarData[]
    },

    getUcarDataBySateiId: async (sateiID: string) => {
      const {result: ucar} = await doStandardPrisma(`ucar`, `findUnique`, {
        where: {sateiID},
        include: QueryBuilder.getInclude({}).ucar.include,
      })

      return ucar as ucarData
    },

    getTenchoListBySateiId: async (sateiID: string) => {
      const {result: tenchoList} = await doStandardPrisma(`user`, `findMany`, {
        where: {
          Store: {Ucar: {some: {sateiID}}},
        },
      })
      return {tenchoList}
    },
  }
}
