





SELECT
    "Store"."name" AS "storeName",
    AVG("LeadTimes"."FR_TNOSYA")::INT AS "FR_TNOSYA",
    AVG("LeadTimes"."FR_HONBSYOK")::INT AS "FR_HONBSYOK",
    AVG("LeadTimes"."FR_TOUROKU")::INT AS "FR_TOUROKU",
    AVG("LeadTimes"."HAISKIBO_NOSYA")::INT AS "HAISKIBO_NOSYA",
    AVG("LeadTimes"."FR_HAISKIBO")::INT AS "FR_HAISKIBO"
FROM "NewCar"
    LEFT JOIN "Store" ON "Store"."id" = "NewCar"."storeId"
    LEFT JOIN "User" ON "User"."id" = "NewCar"."userId"


LEFT JOIN (
    SELECT
        "id",
        CASE
            WHEN "DD_NOSYA" IS NULL OR "DD_FR" IS NULL THEN NULL
            ELSE EXTRACT(DAY FROM AGE("DD_NOSYA", "DD_FR"))::INT
        END AS "FR_TNOSYA",

        CASE
            WHEN "DD_HONBSYOK" IS NULL OR "DD_FR" IS NULL THEN NULL
            ELSE EXTRACT(DAY FROM AGE("DD_HONBSYOK", "DD_FR"))::INT
        END AS "FR_HONBSYOK",

        CASE
            WHEN "DD_TOUROKU" IS NULL OR "DD_FR" IS NULL THEN NULL
            ELSE EXTRACT(DAY FROM AGE("DD_TOUROKU", "DD_FR"))::INT
        END AS "FR_TOUROKU",

        CASE
            WHEN "DD_NOSYA" IS NULL OR "DD_HAISKIBO" IS NULL THEN NULL
            ELSE EXTRACT(DAY FROM AGE("DD_NOSYA", "DD_HAISKIBO"))::INT
        END AS "HAISKIBO_NOSYA",

        CASE
            WHEN "DD_HAISKIBO" IS NULL OR "DD_FR" IS NULL THEN NULL
            ELSE EXTRACT(DAY FROM AGE("DD_HAISKIBO", "DD_FR"))::INT
        END AS "FR_HAISKIBO"
    FROM "NewCar"

) AS "LeadTimes" ON "LeadTimes"."id" = "NewCar"."id"





WHERE
    "DD_FR" >= $1

    AND
    "DD_FR" <= $2


GROUP BY
    "storeName"
ORDER BY
    "storeName"
LIMIT 5000;


