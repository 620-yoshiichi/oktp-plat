import {includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'

import {Prisma} from '@prisma/client'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const {session, query} = includeProps

    const ucarPaperWorkNotes: Prisma.UcarPaperWorkNotesFindManyArgs = {
      include: {
        User: {},
      },
    }
    const ucar: Prisma.UcarFindManyArgs = {
      omit: {
        sortOrder: true,
        updatedAt: true,
        active: true,
      },

      include: {
        TmpRentalStore: {},
        DestinationStore: {},
        UPASS: {},
        Number98: {
          select: {id: true, number: true},
        },
        UcarProcess: {
          select: {
            id: true,
            date: true,
            processCode: true,
            User: {select: {name: true}},
          },
        },
        User: {select: {name: true}},
        Store: {select: {name: true}},
        UcarPaperWorkNotes: {
          select: {
            id: true,
            content: true,
            type: true,
            resolvedAt: true,
            User: {select: {id: true, name: true}},
          },

          orderBy: [{createdAt: `desc`}],
        },
        AppliedUcarGarageSlot: {
          select: {
            id: true,
            createdAt: true,
            finishedAt: true,
            UcarGarageSlotMaster: {
              select: {
                id: true,
                garageNumber: true,
                UcarGarageLocationMaster: {select: {id: true, name: true}},
              },
            },
          },
        },
        BankMaster: {select: {id: true, name: true}},
        BankBranchMaster: {select: {id: true, name: true}},
      },
    }

    const ucarProcess: Prisma.UcarProcessFindManyArgs = {
      include: {User: {}},
    }
    const bankMaster: Prisma.BankMasterFindManyArgs = {
      include: {
        BankBranchMaster: {},
      },
    }
    const ucarGarageSlotMaster: Prisma.UcarGarageSlotMasterFindManyArgs = {
      include: {
        UcarGarageLocationMaster: {},
      },
    }
    const ucarGarageLocationMaster: Prisma.UcarGarageLocationMasterFindManyArgs = {
      include: {
        UcarGarageSlotMaster: {
          include: {
            AppliedUcarGarageSlot: {
              include: {Ucar: {}},
            },
          },
        },
      },
    }

    const include = {
      ucar,
      ucarPaperWorkNotes,
      ucarProcess,
      bankMaster,
      ucarGarageLocationMaster,
      ucarGarageSlotMaster,
    }

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}

const ucarOmmit = {
  Latest_assessment_date: true,
  Initial_assessment_date: true,
  QR_reading_or_not: true,
  Approval_state: true,
  Latest_assessment_price: true,
  Malary_profit_correction_after_price: true,
  Model_specification_No: true,
  Classic_NO: true,
  Country_name: true,
  brand_name: true,
  Model_name: true,
  Model_year: true,
  Model_cycle_name: true,
  First_registration_year_1: true,
  First_registration_year_2: true,
  Initial_registration_date: true,
  Model: true,
  Common_name_model: true,
  Certified_type: true,
  Grade_name: true,
  Mission_name: true,
  Capacity: true,
  Door_name: true,
  Displacement: true,
  Driving: true,
  Vehicle_length: true,
  Vehicle_width: true,
  Vehicle_height: true,
  handle: true,
  Category_domestic_or_import: true,
  Import_category: true,
  Number_Place_name: true,
  Number_classification_number: true,
  Number_Hiragana: true,
  number: true,
  Barracks: true,
  Date_of_registration_date_issued: true,
  Vehicle_inspection_year: true,
  Vehicle_inspection_month: true,
  Vehicle_inspection_date: true,
  Owner_Name: true,
  User_Name: true,
  Serial_NO: true,
  Recycling_deposit_flag: true,
  Shredder_dust_fee: true,
  Airbag_fee_fee: true,
  Freon_fee: true,
  Information_management_fee: true,
  Total_recycling_deposits: true,
  Car_history: true,
  Body_color: true,
  Color_based_name: true,
  Color_code: true,
  Interior_color: true,
  Mileage: true,
  Mileage_unit: true,
  sunroof: true,
  Leather_seat: true,
  Navi_yes_or_no: true,
  Display_type: true,
  Navigation: true,
  Navi_remarks: true,
  Interior_state: true,
  institution: true,
  Electrical_equipment: true,
  fuel: true,
  Evaluation_points: true,
  Store_name: true,
  Assessment_person_in_charge: true,
}

const commonOmits = {
  active: true,
  updatedAt: true,
  sortOrder: true,
}

export const ucarQuery: Prisma.UcarFindManyArgs = {
  omit: {...commonOmits, ...ucarOmmit},
  include: {
    User: {omit: commonOmits},
    Store: {omit: commonOmits},
    UcarProcess: {},
    AppliedUcarGarageSlot: {
      omit: commonOmits,
      include: {
        UcarGarageSlotMaster: {
          omit: commonOmits,
          include: {
            UcarGarageLocationMaster: {
              omit: commonOmits,
            },
          },
        },
      },
    },
  },
}
export const ucarSelect: Prisma.UcarSelect = {
  User: {omit: commonOmits},
  Store: {omit: commonOmits},
  UcarProcess: {},
  AppliedUcarGarageSlot: {
    omit: commonOmits,
    include: {
      UcarGarageSlotMaster: {
        omit: commonOmits,
        include: {
          UcarGarageLocationMaster: {
            omit: commonOmits,
          },
        },
      },
    },
  },
}
