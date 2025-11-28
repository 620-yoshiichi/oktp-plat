-- ============================================
-- ① UpassFamilyTreeのrootSateiIDを起点とした、Upassデータの連なり
-- 説明: 同じrootSateiIDを持つ査定データを、assessmentdatetimeでソートして連なりを表示
-- 例: 査定番号A, B, CがすべてrootSateiIDが「A」であれば、
--     A(assessmentdatetime) > B(assessmentdatetime) > C(assessmentdatetime)と表示
WITH
  RankedUpass AS (
    SELECT
      uft."rootSateiID",
      uft."sateiID",
      u."assessmentdatetime",
      ROW_NUMBER() OVER (
        PARTITION BY
          uft."rootSateiID"
        ORDER BY
          u."assessmentdatetime" desc NULLS LAST
      ) AS "rn"
    FROM
      "UpassFamilyTree" uft
      INNER JOIN "UPASS" u ON uft."sateiID" = u."sateiID"
    WHERE
      u."assessmentdatetime" IS NOT NULL
  ),
  GroupedUpass AS (
    SELECT
      "rootSateiID",
      STRING_AGG (
        "sateiID" || '(' || TO_CHAR ("assessmentdatetime", 'YYYY-MM-DD HH24:MI:SS') || ')',
        ' > '
        ORDER BY
          "assessmentdatetime" asc NULLS LAST
      ) AS "satei_chain"
    FROM
      RankedUpass
    GROUP BY
      "rootSateiID"
  )
SELECT
  "rootSateiID",
  "satei_chain" AS "査定番号の連なり"
FROM
  GroupedUpass
ORDER BY
  "rootSateiID" asc;
