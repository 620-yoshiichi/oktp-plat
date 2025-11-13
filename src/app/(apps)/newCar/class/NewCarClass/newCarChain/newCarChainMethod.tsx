import {sql} from '@cm/class/SqlBuilder/SqlBuilder'
import {useRawSql} from '@cm/class/SqlBuilder/useRawSql'

export const newCarChainMethod = async ({newCar}) => {
  const sqlResult = await useRawSql({sql: getChainSql({carId: newCar.id})})
  return sqlResult
}

export const getChainSql = ({carId}) => {
  return sql`
WITH
-- 最新の承認された登録希望日
"SQ_SAISHIN_SYONIN" AS (
    SELECT d."date"  AS "date", d."status"
    FROM "DesiredTorokuDate" d
    WHERE d."newCarId" = ${carId} AND d."status"='承認'
    ORDER BY d."createdAt" DESC
    LIMIT 1
),


"SQ_WorkingDays" AS (
    SELECT
        c."date"
    FROM "Calendar" c
    WHERE c."cr" <>TRUE
    order BY c."date" ASC
),


"SQ_haisou_tooEarly_Criteria" AS (
    SELECT
      d."id",
      (
        SELECT wd."date"
        FROM "SQ_WorkingDays" wd
        WHERE wd."date" > (SELECT "date" FROM "SQ_SAISHIN_SYONIN")
        ORDER BY wd."date" ASC
        OFFSET 4 ROWS -- 稼働日で5日目(0ベースで4)
        LIMIT 1
      ) AS "earliestHaisouDate",


      CASE
        WHEN d."DD_HAISOYOT" IS NOT NULL
          THEN d."DD_HAISOYOT"
        ELSE d."DD_HAISKIBO"
      END AS "DD_LATEST_HAISOU"


    FROM "NewCar" d
    WHERE d."id" = ${carId}
  ),

  -- アクションステータスの更新
  "checkPointAlert" AS (
    SELECT
        d.id AS id,
        CASE
            WHEN d."CUSTOM_DD_SEISANYOTEI" IS NOT NULL AND DATE_PART('day', d."CUSTOM_DD_SEISANYOTEI" - (CURRENT_DATE )) <= 60
            THEN d."CUSTOM_DD_SEISANYOTEI" - INTERVAL '60 days'
            ELSE NULL
        END AS "m2Alert",
        CASE
            WHEN d."CUSTOM_DD_SEISANYOTEI" IS NOT NULL AND DATE_PART('day', d."CUSTOM_DD_SEISANYOTEI" - (CURRENT_DATE )) <= 30
            THEN d."CUSTOM_DD_SEISANYOTEI" - INTERVAL '30 days'
            ELSE NULL
        END AS "m1Alert"
    FROM "NewCar" d
    WHERE d.id = ${carId}
  ),

-- アクションステータスの更新
"updatedActionStatus" AS (
  SELECT
    -- m2Status
    CASE
      WHEN "checkPointAlert"."m2Alert" IS NOT NULL THEN
        CASE WHEN "m2_date" IS  NOT NULL
          THEN '対処済み'
          ELSE
            CASE WHEN "checkPointAlert"."m1Alert" IS NOT NULL
              THEN '未活動'
              ELSE  '対象'
            END
        END
      ELSE '生産予定未定'
    END  AS "m2Status",


    --m1Status
    CASE
      WHEN "checkPointAlert"."m1Alert" IS NOT NULL THEN
        CASE WHEN "m1_deadline_paper" IS  NOT NULL AND "m1_deadline_money" IS NOT NULL
          THEN
            CASE WHEN
              (
                "DD_HONBSYOK" IS NULL
                AND  (CURRENT_DATE >  "m1_deadline_paper" OR CURRENT_DATE > "m1_deadline_money")
              )

              THEN '遅れ'
              ELSE '対処済み'
            END
          ELSE
            CASE WHEN "DD_FR" IS NOT NULL
              THEN '未活動'
              ELSE  '対象'
            END
        END
      ELSE '生産予定未定'
    END  AS "m1Status",

    --m0Status
    CASE
      WHEN "DD_FR" IS NOT NULL THEN
        CASE WHEN "m0_deadline_nousya" IS  NOT NULL
          THEN
            CASE WHEN
              (
                 "DD_NOSYA" IS NULL
                 AND  CURRENT_DATE > "m0_deadline_nousya"
              )

              THEN '遅れ'
              ELSE '対処済み'
            END
          ELSE
            CASE WHEN "DD_NOSYA" IS NOT NULL
              THEN '未活動'
              ELSE  '対象'
            END
        END
      ELSE '生産予定未定'
    END  AS "m0Status"
  FROM "NewCar" d
  LEFT JOIN  "checkPointAlert" on  d.id = "checkPointAlert".id
  where  d.id = ${carId}
),

-- 登録申請が必要かどうかの判定
"SQ_updatedTorokuApplicationRequired" AS (
 SELECT
     CASE
         WHEN
          d."lastApprovedDesiredTorokuDate" IS NULL
          AND "DD_FR" IS NOT NULL
          AND "DD_HAISKIBO" IS NOT NULL
          AND "DD_TOUROKU" IS NULL
         THEN TRUE
         ELSE FALSE
     END AS "torokuApplicationRequired"
 FROM "NewCar" d
 WHERE d.id = ${carId}
),


--査定データ入庫日期限超過
"AlertSateiData" AS (
  SELECT
  "UPASS"."sateiID",
  "UPASS"."pickupScheduledDate"
   FROM "JuchuShitadoriDb"
  left join "NewCar" on "JuchuShitadoriDb"."APPINDEX_FKEY" = "NewCar"."APPINDEX"
  left join "UPASS" on "JuchuShitadoriDb"."NO_SATEISYO" = "UPASS"."sateiID"
  where "NewCar"."id" = ${carId}

  AND (

    CASE WHEN  "NewCar"."m0_deadline_nousya"  IS NULL THEN "NewCar"."CUSTOM_DD_SEISANYOTEI" ELSE  "NewCar"."m0_deadline_nousya" END

    > "UPASS"."pickupScheduledDate"

  )
)




-- 更新クエリ
UPDATE "NewCar"
SET
"shitadoriAlertCount"=(SELECT COUNT(*) FROM "AlertSateiData"),

"DD_LATEST_HAISOU" = (SELECT "DD_LATEST_HAISOU" FROM "SQ_haisou_tooEarly_Criteria"),

 "lastApprovedDesiredTorokuDate" = (SELECT "date" FROM "SQ_SAISHIN_SYONIN"),

 "earliestHaisouDate" =(SELECT "earliestHaisouDate" FROM "SQ_haisou_tooEarly_Criteria"),
 --"haisou_tooEarly" = (SELECT "haisou_tooEarly" FROM "SQ_haisou_tooEarly_Criteria"),
 "haisou_tooEarly" =
    CASE
        WHEN "DD_NOSYA"  IS NOT NULL THEN FALSE
        WHEN (SELECT "DD_LATEST_HAISOU" FROM  "SQ_haisou_tooEarly_Criteria") IS NULL THEN FALSE
        WHEN "DD_CENTSYUB" IS NOT NULL THEN FALSE
        WHEN (SELECT "earliestHaisouDate" FROM "SQ_haisou_tooEarly_Criteria") IS NULL THEN FALSE
        WHEN (SELECT "date" FROM "SQ_SAISHIN_SYONIN") < '2024-11-01' THEN FALSE
        WHEN
          (SELECT "DD_LATEST_HAISOU" FROM  "SQ_haisou_tooEarly_Criteria") --配送日
            < (SELECT "earliestHaisouDate" FROM "SQ_haisou_tooEarly_Criteria") --配送可能日
          THEN TRUE
        ELSE FALSE
    END,
 "m2Alert" = (SELECT "m2Alert" FROM "checkPointAlert"),
 "m1Alert" = (SELECT "m1Alert" FROM "checkPointAlert"),
 "m0Status" = (SELECT "m0Status" FROM "updatedActionStatus"),
 "m1Status" = (SELECT "m1Status" FROM "updatedActionStatus"),
 "m2Status" = (SELECT "m2Status" FROM "updatedActionStatus"),
 "torokuApplicationRequired" = (SELECT "torokuApplicationRequired" FROM "SQ_updatedTorokuApplicationRequired")
WHERE id = ${carId}
RETURNING
"id",
"m2Alert",
"m1Alert",
"m0Status",
"m1Status",
"m2Status",
"torokuApplicationRequired"
"haisou_tooEarly",
"earliestHaisouDate",
"DD_HAISOYOT",
"DD_HAISKIBO"
"lastApprovedDesiredTorokuDate",
"NO_CYUMON",
(SELECT "haisou_tooEarly" FROM "SQ_haisou_tooEarly_Criteria") AS FOO




;`
}
