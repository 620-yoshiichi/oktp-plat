import {LeadTimeColumnList} from '@app/(apps)/newCar/(pages)/statistics/LeadTimePageCC/LeadTimeColumnsList'

import {BQ_parser} from '@app/api/google/big-query/bigQueryParser'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {sql} from '@cm/class/SqlBuilder/SqlBuilder'

export const newCarSql = {
  main: {
    getOrderCloneSql: (props: {LIMIT?: number; maxUpdateGte?: any; offset?: number}) => {
      const LIMIT_PHRASE = props.LIMIT ? sql`LIMIT ${props.LIMIT}` : ''
      const OFFSET_PHRASE = props.offset ? sql`OFFSET ${props.offset}` : ''

      return sql`
      --第一変換（日付と数値のパース）
      WITH convert AS (
        SELECT
          Cars.APPINDEX,
          Cars.NO_CYUMON,
          CD_HANSTAFF,
          CD_TENPO,
          KJ_KURUMAME,
          CD_NCSYAMEI,
          MJ_HANTENKT,
          NO_FRAME,
          KJ_KAINMEI1,
          KJ_MEIGIME1,
          KB_OSSSIN,
          MJ_OSSTSNST,
          ${BQ_parser.castStrToDate(`Cars.DD_JUCYU`)} AS DD_JUCYU,
          ${BQ_parser.castStrToDate(`Cars.DD_TORIKESI`)} AS DD_TORIKESI,
          ${BQ_parser.castStrToDate(`Cars.DD_JUCYUKE`)} AS DD_JUCYUKE,
          ${BQ_parser.castStrToDate(`Cars.DD_SYOUNIN1`)} AS DD_SYOUNIN1,
          ${BQ_parser.castStrToDate(`Cars.DD_SYOUNIN2`)} AS DD_SYOUNIN2,
          ${BQ_parser.castStrToDate(`Cars.DD_SYOUNIN3`)} AS DD_SYOUNIN3,
          ${BQ_parser.castStrToDate(`Cars.DD_TOROKIBO`)} AS DD_TOROKIBO,
          ${BQ_parser.castStrToDate(`Cars.DD_KIBONOKI`)} AS DD_KIBONOKI,
          ${BQ_parser.castStrToDate(`Cars.DD_KRHURI`)} AS DD_KRHURI,
          ${BQ_parser.castStrToDate(`Cars.DD_FR`)} AS DD_FR,
          ${BQ_parser.castStrToDate(`Cars.DD_TENPSYOK`)} AS DD_TENPSYOK,
          ${BQ_parser.castStrToDate(`Cars.DD_HONBSYOK`)} AS DD_HONBSYOK,
          ${BQ_parser.castStrToDate(`Cars.DD_MAKERSYU`)} AS DD_MAKERSYU,
          ${BQ_parser.castStrToDate(`Cars.DD_TOTYAKUY`)} AS DD_TOTYAKUY,
          ${BQ_parser.castStrToDate(`Cars.DD_CENTYOB`)} AS DD_CENTYOB,
          ${BQ_parser.castStrToDate(`Cars.DD_CENTTYAB`)} AS DD_CENTTYAB,
          ${BQ_parser.castStrToDate(`Cars.DD_HAISOYOT`)} AS DD_HAISOYOT,
          ${BQ_parser.castStrToDate(`Cars.DD_HAISKIBO`)} AS DD_HAISKIBO,
          ${BQ_parser.castStrToDate(`Cars.DD_HAISOU`)} AS DD_HAISOU,
          ${BQ_parser.castStrToDate(`Cars.DD_URIKZUMI`)} AS DD_URIKZUMI,
          ${BQ_parser.castStrToDate(`Cars.DD_TOUROKU`)} AS DD_TOUROKU,
          ${BQ_parser.castStrToDate(`Cars.DD_NOSYA`)} AS DD_NOSYA,
          ${BQ_parser.castStrToDate(`DD_KARINOKI`)} AS  DD_KARINOKI,
          ${BQ_parser.castStrToDate(`DD_KANSEI`)} AS  DD_KANSEI,
          ${BQ_parser.castStrToDate(`DD_HAISYYO`)} AS  DD_HAISYYO,
          ${BQ_parser.castStrToDate(`DD_SAGTYYO`)} AS  DD_SAGTYYO,
          ${BQ_parser.castStrToDate(`DD_CENTSYUB`)} AS  DD_CENTSYUB,
          ${BQ_parser.castStrToDate(`DD_GENSYNYK`)} AS  DD_GENSYNYK,
          ${BQ_parser.castStrToDate(`Cars.MAX_UPDATE`)} AS  DD_MAX_UPDATE,
          ${BQ_parser.castStrToDate(`JSLIM.tcrm__SeisanYoteiBi__c`)} AS  CUSTOM_DD_SEISANYOTEI,
          JSLIM.tcrm__SeisanYotei__c  AS CUSTOM_SEISANYOTEI,

          CAST(KI_MAEUNYUK AS INT ) AS KI_MAEUNYUK, --前受入金額
          CAST(KI_SHRIGK AS INT ) AS KI_SHRIGK, --支払金形
          CAST(KI_NYURUIKE AS INT ) AS KI_NYURUIKE,--入金累計
          CAST(KI_BETSIHAK AS INT ) AS KI_BETSIHAK,--別途支払い諸費用形
          CAST(KI_SITADORI AS INT ) AS KI_SITADORI, --下取車価格
          CAST(KI_SITZAN AS INT ) AS KI_SITZAN, --下取残債
          CAST(TM_TOTUTMKE AS INT ) AS TM_TOTUTMKE, --取り付け時間
          CAST(KI_SITANYKG AS INT ) AS KI_SITANYKG, --下取り入金額
          KB_DAIHYNAI,--作業難易度
          KB_ZAIKOJYO,--在庫状態

          -- 性別ラベル変換
          CASE
            WHEN Cars.KB_SEIBETU = "1" THEN '男'
            WHEN Cars.KB_SEIBETU = "2" THEN '女'
            WHEN Cars.KB_SEIBETU = "3" THEN '法人'
            ELSE Cars.KB_SEIBETU
          END  AS CUSTOM_KB_SEIBETU,

          -- 支払区分ラベル変換
          CASE
                WHEN Cars.KB_GYOCYOK = "1" THEN  '直販'
                WHEN Cars.KB_GYOCYOK = "2" THEN  '業販'
                WHEN Cars.KB_GYOCYOK = "3" THEN  '旧レンタ'
                WHEN Cars.KB_GYOCYOK = "4" THEN  '新レンタ'
                WHEN Cars.KB_GYOCYOK = "5" THEN  '他レンタ'
                WHEN Cars.KB_GYOCYOK = "6" THEN  '他社リース'
                WHEN Cars.KB_GYOCYOK = "7" THEN  'KINTO'
                WHEN Cars.KB_GYOCYOK = "9" THEN  'その他'
                ELSE Cars.KB_GYOCYOK
          END AS CUSTOM_KB_GYOCYOK,
        FROM  OrdersDB.Orders_Base  Cars
        LEFT JOIN OrdersDB.SF_JSLIM AS JSLIM ON Cars.APPINDEX = JSLIM.APPINDEX
        --LEFT JOIN OrdersDB.KOKYAKU_Base AS kokyaku ON Cars.CD_KOKYAKU = kokyaku.CD_KOKYAKU

        ${props.maxUpdateGte ? sql`WHERE Cars.MAX_UPDATE >= '${formatDate(props.maxUpdateGte)}'` : ''}
        ORDER BY Cars.MAX_UPDATE DESC
      ${LIMIT_PHRASE}
      ${OFFSET_PHRASE}
      ),

      --第二変換
      convert_two AS (
        SELECT
        convert.*,
          --仮 / 予
          CASE
            WHEN DD_KRHURI IS NOT NULL  THEN '仮'
            WHEN  DD_KARINOKI IS NOT NULL THEN '予'
            ELSE ''
          END AS CUSTOM_FR_KARI_NOTATION,


          --在庫状態区分表記
              CASE
              WHEN KB_ZAIKOJYO IN('0', '1','2','3') THEN "納期未定ファーム"
              WHEN KB_ZAIKOJYO IN('4','5') THEN "仮納期付ファーム（完成予定日なし）"
              WHEN KB_ZAIKOJYO ='6' THEN "確定納期付ファーム"
              WHEN KB_ZAIKOJYO ='7' THEN "現車"
              WHEN KB_ZAIKOJYO ='8' THEN "展示車"
              WHEN KB_ZAIKOJYO ='9' THEN "事故車（リペア中）"
              WHEN KB_ZAIKOJYO ='A' THEN "売上済未登録"
              WHEN KB_ZAIKOJYO ='B' THEN "確定出庫"
              WHEN KB_ZAIKOJYO ='C' THEN "配車連絡済オーダー譲渡"
            END AS CUSTOM_ZAIKO_KB_NOTATION,


          -- 業直ラベル変換
          CASE
              WHEN CUSTOM_KB_GYOCYOK = '直販' AND CUSTOM_KB_SEIBETU IN ('男', '女') THEN '直販個人'
              WHEN
                CUSTOM_KB_GYOCYOK = '業販'
                OR  (CUSTOM_KB_GYOCYOK = '直販' AND CUSTOM_KB_SEIBETU IN ('法人'))   THEN '業販/法人'
              ELSE 'その他'
          END  AS CUSTOM_paymentCheckCustomerType,


          CASE
                WHEN DD_FR IS NOT NULL THEN '完'
                WHEN DD_HAISYYO IS NOT NULL THEN  'A'
                WHEN DD_KARINOKI IS NOT NULL AND DD_KANSEI IS NOT NULL THEN  'B'
                WHEN DD_KANSEI IS  NULL AND DD_KARINOKI IS NOT NULL THEN 'C'
                WHEN KB_ZAIKOJYO ='7' THEN '現車'
                ELSE NULL
          END AS CUSTOM_FR_NOTATION_TYPE

        from convert
      )


      --メインクエリ
      SELECT

      convert_two.*,

      -- サフィックス部分
        CASE
          WHEN CUSTOM_FR_NOTATION_TYPE='完' THEN  '完'
          WHEN CUSTOM_FR_NOTATION_TYPE='A' THEN  'A'
          WHEN CUSTOM_FR_NOTATION_TYPE='B' THEN   'B'
          WHEN CUSTOM_FR_NOTATION_TYPE='C' THEN   'C'
          WHEN CUSTOM_FR_NOTATION_TYPE='現車' THEN '現車'
          ELSE NULL
        END AS CUSTOM_FR_SUFFIX,

        -- 日付部分
        CASE

          WHEN CUSTOM_FR_NOTATION_TYPE='完'
              THEN FORMAT_DATE('%Y.%m.%d', DD_FR)
          WHEN CUSTOM_FR_NOTATION_TYPE='A'
              THEN FORMAT_DATE('%Y.%m.%d', DATE_ADD(DD_HAISYYO, INTERVAL 1 DAY))
          WHEN CUSTOM_FR_NOTATION_TYPE='B'
              THEN FORMAT_DATE('%Y.%m.%d', DATE_ADD(DD_KANSEI, INTERVAL 1 DAY))
          WHEN CUSTOM_FR_NOTATION_TYPE='C'
              THEN FORMAT_DATE('%Y.%m.%d', DATE_ADD(DD_KARINOKI, INTERVAL 0 DAY))
          WHEN CUSTOM_FR_NOTATION_TYPE='現車'
              THEN FORMAT_DATE('%Y.%m.%d', CURRENT_DATE)
          ELSE NULL
        END AS CUSTOM_FR_DATE,

        -- プレフィックス部分
        CASE
          WHEN CUSTOM_FR_NOTATION_TYPE='完'   THEN   NULL
          WHEN CUSTOM_FR_NOTATION_TYPE='A'    THEN  CUSTOM_FR_KARI_NOTATION
          WHEN CUSTOM_FR_NOTATION_TYPE='B'    THEN  CUSTOM_FR_KARI_NOTATION
          WHEN CUSTOM_FR_NOTATION_TYPE='C'    THEN  NULL
          WHEN CUSTOM_FR_NOTATION_TYPE='現車'  THEN  CUSTOM_FR_KARI_NOTATION
          ELSE CUSTOM_FR_KARI_NOTATION
        END AS CUSTOM_FR_PREFIX,

        --支払いチェック
        CASE
          WHEN CUSTOM_paymentCheckCustomerType = '直販個人'
            THEN  KI_SHRIGK- (KI_SITADORI - KI_SITZAN) <= (KI_NYURUIKE - KI_SITANYKG)

          WHEN CUSTOM_paymentCheckCustomerType = '業販/法人'
            THEN  KI_BETSIHAK <= (KI_NYURUIKE - KI_SITANYKG)
          ELSE null
        END AS CUSTOM_paymentCheck,

        KI_SITADORI - KI_SITZAN AS CUSTOM_NET_SHITADORI_PRICE

      FROM convert_two
        `
    },
  },

  subQuery: {
    getleadTimeFields: () => sql`
     SELECT
       "id",
       ${LeadTimeColumnList.map(d => {
         const {from, to, avgDataKey} = d
         return sql`
             CASE
              WHEN
              "${to.fieldKey}" IS NULL OR "${from.fieldKey}" IS NULL
              THEN NULL
              ELSE EXTRACT(DAY FROM ("${to.fieldKey}"- "${from.fieldKey}"))::INT
             END AS "${avgDataKey}"\n`
       }).join(',')}
      FROM "NewCar"
      `,
  },

  customField: {},
}

export const leadTimeSql = {
  getLeadTimeFields: () => {
    //平均AVGのリストを作る
    return LeadTimeColumnList.map(d => {
      const {avgDataKey} = d
      return sql`"${avgDataKey}"\n`
    }).join(',')
  },
  getAvgOrMedianCols: (type: `median` | `average`) => {
    if (type === `average`) {
      //平均AVGのリストを作る
      const AvgSelectStringList = LeadTimeColumnList.map(d => {
        const {avgDataKey} = d
        return sql`AVG("LeadTimes"."${avgDataKey}")::INT AS "${avgDataKey}"\n`
      }).join(',')

      return AvgSelectStringList
    } else if (type === `median`) {
      const MedianSelectStringList = LeadTimeColumnList.map(d => {
        const {avgDataKey} = d
        return sql`
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "LeadTimes"."${avgDataKey}") FILTER (WHERE "LeadTimes"."${avgDataKey}" IS NOT NULL)::INT AS "${avgDataKey}"`
      }).join(',')
      return MedianSelectStringList
    }
  },
}
