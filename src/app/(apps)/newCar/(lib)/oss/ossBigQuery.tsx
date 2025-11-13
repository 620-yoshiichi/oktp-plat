'use server'

import {bigQuery__select} from '@app/api/google/big-query/bigQueryApi'

import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {arr__uniqArray} from '@cm/class/ArrHandler/array-utils/basic-operations'

export type BQ_OSS_SHINSEI_DATA = {
  // OSS申請データのデフォルト値
  APPINDEX: String
  NM_MEIGININ: String
  MJ_MEDAIKNA: String
  NO_POST_MEIGININ: String
  NO_TEL_MEIGININ: String
  CD_JYUSYO_MEIGININ: String
  KJ_JUSYOKJ1_MEIGININ: String
  KJ_JUSYOKJ2_MEIGININ: String
  KJ_JUSYOKJ3_MEIGININ: String
  KJ_SIYOHONK: String
  MJ_HOKAADD: String
  KB_SYOYUKE2: String
  CD_ZNTNOHYO: String
  KB_ZNTNOSYA: String
  CD_ZNTNOGYO: String
  NO_ZNTNOSEI: String
  KB_HOKASIND: String
  l: number
  w: number
  h: number

  KB_OEM: String
  MJ_HANTENKT: String
}

export type BQ_KOKYAKU_DATA = {
  APPINDEX: String //'202506-01 08564-2'
  APPINDEX_FKEY: String //'202506-01 08564'
  NO_CYUMON: String //'01 08564'
  NO_CYUMONED: String //''
  KB_KOKYAKU: String //'2'
  CD_KOKYAKU: String //'170200531'
  KN_SEI: String //'ｼﾞｸﾔ'
  KN_MEI: String //'ﾏｻﾕｷ'
  NO_POST: String //'7000013'
  CD_JYUSYO: String //'330010176'
  CD_JKOAZA: String //'000'
  CD_JEDABAN: String //'00'
  NO_TEL: String //'086-251-3227'
  KB_SEIBETU: String //'1'
  KN_JUSYO1: String //'ｵｶﾔﾏｼｷﾀｸ'
  KN_JUSYO2: String //'ｲﾌｸﾁﾖｳ2-11-13-1'
  KN_JUSYO3: String //''
  KJ_JUSYOKJ1: String //'岡山市北区'
  KJ_JUSYOKJ2: String //'伊福町２丁目１１－１３－１'
  KJ_JUSYOKJ3: String //''
  KJ_KINMUSM: String //''
  KN_KINMUMEI: String //''
  CD_KINJUSYO: String //''
  CD_KINJUSY4: String //''
  CD_KINJUSY5: String //''
  KJ_KINJUSY1: String //''
  KJ_KINJUSY2: String //''
  KJ_KINJUSY3: String //''
  NO_KINMUTEL: String //''
  DD_SEINEN: String //'S51 3 8'
  NU_NENREI: String //'49'
  CD_GYOUSYU: String //''
  CD_SYOKUGYO: String //'10'
  CD_PKYAKU: String //''
  NO_KEITAI: String //'070-5522-4052'
  NO_FAX: String //''
  MJ_EMAIL: String //'mjiku308@gmail.com'
  MJ_EMAIL2: String //''
  MJ_EMAIL3: String //''
  MJ_TYUEMAIL: String //'mjiku308@gmail.com'
  MJ_SASINTAN: String //'C198X144'
  DD_JUCYU: String //'2025-06-06'
  DD_TORIKESI: String //''
  ORDERS_UPDATE: String //'2025-06-12 23:11:30'
  KOKYAKU_UPDATE: String //'2025-06-12 17:22:11'
  MAX_UPDATE: String //'2025-06-12 23:11:30'
  KB_CR: String //'2'
  KB_DM: String //'1'
  KB_GYOCYOK: String //'1'
}

// select

//   from masta.KAZEIHYOUJUN masta

// and MJ_MAKERKAT = '' and CD_SYAMNEI = ''

export const getOssShinseiData = async ({APPINDEX}) => {
  // 新車データ取る OPコードこみ
  const newCarRes = await bigQuery__select({
    datasetId: `OrdersDB`,
    tableId: `Orders_Base`,
    sqlString: sql`
    SELECT car.*,
    oss.NU_ZENTYO as l,
    oss.NU_ZENHABA as w,
    oss.NU_ZENKO as h

    FROM okayamatoyopet.OrdersDB.Orders_Base car
    left join okayamatoyopet.OfficeDB.OSS_Base_tmp oss
      on oss.APPINDEX = car.APPINDEX



    WHERE car.APPINDEX = '${APPINDEX}'
    `,
  })
  const theCar = newCarRes[0]
  const kokyakuRes = await bigQuery__select({
    datasetId: `OrdersDB`,
    tableId: `KOKYAKU_Base`,
    sqlString: sql`
    SELECT *  FROM OrdersDB.KOKYAKU_Base k
    WHERE  k.APPINDEX_FKEY = '${APPINDEX}' and k.KB_KOKYAKU = '2'
    `,
  })

  const firstKokyaku = kokyakuRes[0]

  // MJ_HANTENKT, CD_NCSYAMEI
  const {MJ_HANTENKT, CD_NCSYAMEI} = theCar

  // 販売店型式と新車車名コードで、JOIN
  const kaizhyojunListRes = await bigQuery__select({
    datasetId: `masta`,
    tableId: `KAZEIHYOUJUN`,
    sqlString: sql`
    SELECT
    masta.*,
    case
      when NU_ZENTYOCM = '0' or NU_ZENTYOCM = MJ_SYOGENL then MJ_SYOGENL
      when MJ_SYOGENL = '0' then NU_ZENTYOCM
      else '-' end
      || '-' ||

    case
      when NU_ZENHABCM = '0' or NU_ZENHABCM = MJ_SYOGENW then MJ_SYOGENW
      when MJ_SYOGENW = '0' then NU_ZENHABCM
      else '-' end



      || '-' ||

    case
      when NU_ZENKOCM = '0' or NU_ZENKOCM = MJ_SYOGENH then MJ_SYOGENH
      when MJ_SYOGENH = '0' then NU_ZENKOCM
      else '-' end

    as FKEY_LHW,
    concat(
      MJ_SPEC2,','
      ,MJ_SPEC3,','
      ,MJ_SPEC4,','
      ,MJ_SPEC5,','
      ,MJ_SPEC6,','
      ,MJ_SPEC7,','
      ,MJ_SPEC8,','
      ,MJ_SPEC9,','
      ,MJ_SPEC10,','
      ,MJ_SPEC11,','
      ,MJ_SPEC12,','
      ,MJ_SPEC13,','
      ,MJ_SPEC14,','
      ,MJ_SPEC15,','
      ,MJ_SPEC16,','
      ,MJ_SPEC17,','
      ,MJ_SPEC18,','
      ,MJ_SPEC19,','
      ,MJ_SPEC20,','
      ,MJ_SPEC21,','
      ,MJ_SPEC22,','
      ,MJ_SPEC23,','
      ,MJ_SPEC24,','
      ,MJ_SPEC25,','
      ,MJ_SPEC26,','
      ,MJ_SPEC27,','
      ,MJ_SPEC28,','
      ,MJ_SPEC29,','
      ,MJ_SPEC30,','
      ,MJ_SPEC31,','
      ,MJ_SPEC32
    ) as OPSTR


     FROM okayamatoyopet.masta.KAZEIHYOUJUN masta

    WHERE
    CD_SYAMEI = '${CD_NCSYAMEI}' and MJ_MAKERKAT = '${MJ_HANTENKT}'
    and not ( NU_ZENHABCM = '0' and MJ_SYOGENW = '0')


    `,
  })

  const opCodeList: string[] = []
  for (let i = 1; i <= 16; i++) {
    const opcodeKey = `MJ_MAKEOP${i}`
    const opCode = newCarRes[0][opcodeKey]
    if (opCode) {
      opCodeList.push(opCode.substring(0, 3))
    }
  }

  const uniquedKazeiHyojunList = arr__uniqArray(kaizhyojunListRes.map(kaizhyojun => kaizhyojun.FKEY_LHW))

  const tmp = {}

  const emptyDiffList = {}

  kaizhyojunListRes.forEach((kazeiHyojun, i) => {
    uniquedKazeiHyojunList.forEach((FKEY_LHW, j) => {
      if (tmp[FKEY_LHW] === undefined) {
        tmp[FKEY_LHW] = {
          key: FKEY_LHW,
          NO_SITERUIB: kazeiHyojun.NO_SITERUIB,
          match: [],
          unmatch: [],
        }
      }

      const opStrArry = kazeiHyojun.OPSTR.split(',').filter(op => op !== '')

      if (FKEY_LHW === kazeiHyojun.FKEY_LHW) {
        //ユニーク配列に一致
        opStrArry.forEach(op => {
          tmp[FKEY_LHW].match.push(op)
        })
      } else {
        // 一致しない
        opStrArry.forEach(op => {
          tmp[FKEY_LHW].unmatch.push(op)
        })
      }
    })
  })

  const maxLHW = {
    l: 0,
    w: 0,
    h: 0,
  }

  console.log('------------------------------')
  console.log({
    NO_CYUMON: theCar.NO_CYUMON,
    opCodeList,
  })

  // NU_ZENTYO,NU_ZENHABA,NU_ZENKO
  const tmpSuvivor0_from_OSS_base = [theCar.l, theCar.w, theCar.h].join(`-`)

  const tmpSuvivor1 = Object.keys(tmp).find((key, i) => {
    const [l, w, h] = key.split('-').map(x => Number(x))
    if (l > maxLHW.l) {
      maxLHW.l = l
    }
    if (w > maxLHW.w) {
      maxLHW.w = w
    }
    if (h > maxLHW.h) {
      maxLHW.h = h
    }
    const match = arr__uniqArray(tmp[key].match)
    const unmatch = arr__uniqArray(tmp[key].unmatch)

    tmp[key].match = match
    tmp[key].unmatch = unmatch

    console.log({
      回数: `tmp${i + 1}周目`,
      SR: tmp[key].NO_SITERUIB,
      FKEY_LHW: key,
      match,
      unmatch,
    })

    const diff = match.filter(x => !unmatch.includes(x))

    const condition1 = diff.length > 0

    if (diff.length === 0) {
      emptyDiffList[key] = tmp[key]
    }

    const condition2 = opCodeList.some(op => diff.includes(op))

    return condition1 && condition2
  })

  const tmpSuvivor2 = Object.keys(emptyDiffList)[0]
  const tmpSuvivor3 = Object.keys(tmp)[0]

  const tmpSuvivor0_from_OSS_baseIsAvailable = !['', '-', '0'].includes(tmpSuvivor0_from_OSS_base.split(`-`)[0])

  console.log('結果', {
    NO_CYUMON: theCar.NO_CYUMON,
    KJ_KURUMAME: theCar.KJ_KURUMAME,
    tmpSuvivor0_from_OSS_baseIsAvailable,
    tmpSuvivor0_from_OSS_base,
    tmpSuvivor1,
    tmpSuvivor2,
    uniquedKazeiHyojunList,
  })

  const suvivor = tmpSuvivor0_from_OSS_baseIsAvailable ? tmpSuvivor0_from_OSS_base : (tmpSuvivor1 ?? tmpSuvivor2 ?? tmpSuvivor3)

  const [l, w, h] = String(suvivor)
    .split(`-`)
    .map(x => Number(x))

  const res = await bigQuery__select({
    datasetId: `OrdersDB`,
    tableId: `Orders_Base`,
    sqlString: sql`
SELECT
o.NO_CYUMON ,
s.KJ_MEIGIME1,
s.KJ_MEIGIME2,
KN_SEI_MEIGININ,
KN_MEI_MEIGININ,
MJ_MEDAIKJI,
MJ_MEDAIKNA,
NO_POST_MEIGININ,
NO_TEL_MEIGININ,
CD_JYUSYO_MEIGININ,
KJ_JUSYOKJ1_MEIGININ,
KJ_JUSYOKJ2_MEIGININ,
KJ_JUSYOKJ3_MEIGININ,
KJ_SIYOHONK,
MJ_HOKAADD,
CASE
  WHEN KB_SYOYUKE2 = '1' THEN '自己所有'
  WHEN KB_SYOYUKE2 = '2' THEN '所有権留保'
  WHEN KB_SYOYUKE2 = '4' THEN 'リース車'
  ELSE '不明'
END as KB_SYOYUKE2,

CASE
  WHEN CD_ZNTNOHYO = '7412' THEN '岡山'
  WHEN CD_ZNTNOHYO = '741A' THEN '倉敷'
  ELSE CD_ZNTNOHYO
END as CD_ZNTNOHYO,
KB_ZNTNOSYA,
CD_ZNTNOGYO,
NO_ZNTNOSEI,
CASE
  WHEN KB_HOKASIND = '1' THEN '代替え'
  WHEN KB_HOKASIND = '2' THEN '新規'
  ELSE '不明'
END as KB_HOKASIND,
CASE
  WHEN m.KB_OEM = '6' THEN 'レクサス'
  ELSE 'トヨタ'
END as KB_OEM,
o.MJ_SITKATA,
KB_SIYOHDIT, --使用本拠同一区分
KB_HOKADOU --保管場所同一区分



FROM okayamatoyopet.OrdersDB.Orders_Base o
left join okayamatoyopet.OfficeDB.OSS_Base_tmp s
  on o.APPINDEX = s.APPINDEX
left join okayamatoyopet.masta.SYAMEI_Base m
  on o.CD_NCSYAMEI = m.CD_NCSYAMEI
    and o.CD_21SYAMEI = m.CD_21SYAMEI

WHERE  o.APPINDEX = '${APPINDEX}' `,
  })

  const BQ_OSS_SHINSEI_DATA = res?.[0] as BQ_OSS_SHINSEI_DATA
  const BQ_KOKYAKU_DATA = firstKokyaku as BQ_KOKYAKU_DATA

  const data: {
    BQ_OSS_SHINSEI_DATA: BQ_OSS_SHINSEI_DATA
    BQ_KOKYAKU_DATA: BQ_KOKYAKU_DATA
    l: number
    w: number
    h: number
  } = {
    BQ_OSS_SHINSEI_DATA,
    BQ_KOKYAKU_DATA,
    l,
    w,
    h,
  }
  return data
}
