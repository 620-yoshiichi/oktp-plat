-- ============================================
-- ② Upassデータを元にしたSQL（最新の査定IDを取得）
-- ============================================
-- 説明: UpassFamilyTreeにおける最新の査定IDを取得
-- 各rootSateiIDグループごとに、assessmentdatetimeが最新のsateiIDを返す
WITH
 LatestSatei AS (
  SELECT
   uft."rootSateiID",
   uft."sateiID",
   u."assessmentdatetime",
   ROW_NUMBER() OVER (
    PARTITION BY
     uft."rootSateiID"
    ORDER BY
     u."assessmentdatetime" DESC NULLS LAST,
     uft."sateiID" DESC
   ) AS "rn"
  FROM
   "UpassFamilyTree" uft
   INNER JOIN "UPASS" u ON uft."sateiID" = u."sateiID"
  WHERE
   u."assessmentdatetime" IS NOT NULL
 )
SELECT
 "rootSateiID" AS "ルート査定ID",
 "sateiID" AS "最新の査定ID",
 "assessmentdatetime" AS "最新の査定日時"
FROM
 LatestSatei
WHERE
 "rn" = 1
ORDER BY
 "rootSateiID";
