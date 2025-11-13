'use server'

import {BQ_KOKYAKU_DATA, BQ_OSS_SHINSEI_DATA} from '@app/(apps)/newCar/(lib)/oss/ossBigQuery'
import {SheetRequests} from '@app/api/google/actions/SheetRequests'
import {GoogleDrive_CopyFile} from '@app/api/google/actions/driveAPI'
import {GoogleSheet_Append, GoogleSheet_BatchUpdate} from '@app/api/google/actions/sheetAPI'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {isDev} from '@cm/lib/methods/common'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {NewCar, Store, User} from '@prisma/client'

export async function createOssShinseiSpread({
  NewCar,
  BQ_OSS_SHINSEI_DATA,
  BQ_KOKYAKU_DATA,
  l,
  w,
  h,
  companyStoreName,
  address,
  tel,
  fax,
  userName,
}: {
  NewCar: NewCar & {User: User; Store: Store}
  BQ_OSS_SHINSEI_DATA: BQ_OSS_SHINSEI_DATA
  BQ_KOKYAKU_DATA: BQ_KOKYAKU_DATA
  l: number
  w: number
  h: number
  companyStoreName: string
  address: string
  tel: string
  fax: string
  userName: string
}) {
  try {
    const keys = {
      NO_CYUMON: {
        first: String(BQ_OSS_SHINSEI_DATA['NO_CYUMON'] ?? ''),
        second: '',
      },
      KJ_MEIGIME: {
        first: String(BQ_OSS_SHINSEI_DATA['KJ_MEIGIME1'] ?? '') + String(BQ_OSS_SHINSEI_DATA['KJ_MEIGIME2'] ?? ''),
        second: NewCar.KJ_MEIGIME1,
      },

      KN_SEI_MEIGININ: {
        first: String(BQ_OSS_SHINSEI_DATA['KN_SEI_MEIGININ'] ?? ''),
        second: BQ_KOKYAKU_DATA.KN_SEI ?? '',
      },
      KN_MEI_MEIGININ: {
        first: String(BQ_OSS_SHINSEI_DATA['KN_MEI_MEIGININ'] ?? ''),
        second: BQ_KOKYAKU_DATA.KN_MEI,
      },
      MJ_MEDAIKJI: {
        first: String(BQ_OSS_SHINSEI_DATA['MJ_MEDAIKJI'] ?? ''),
        second: '',
      },

      MJ_MEDAIKNA: {
        first: String(BQ_OSS_SHINSEI_DATA['MJ_MEDAIKNA'] ?? ''),
        second: '',
      },
      NO_POST_MEIGININ: {
        first: String(BQ_OSS_SHINSEI_DATA['NO_POST_MEIGININ'] ?? ''),
        second: BQ_KOKYAKU_DATA.NO_POST,
      },
      NO_TEL_MEIGININ: {
        first: String(BQ_OSS_SHINSEI_DATA['NO_TEL_MEIGININ'] ?? ''),
        second: BQ_KOKYAKU_DATA.NO_TEL,
      },
      CD_JYUSYO_MEIGININ: {
        first: String(BQ_OSS_SHINSEI_DATA['CD_JYUSYO_MEIGININ'] ?? ''),
        second: BQ_KOKYAKU_DATA.CD_JYUSYO,
      },
      KJ_JUSYOKJ1_MEIGININ: {
        first: String(BQ_OSS_SHINSEI_DATA['KJ_JUSYOKJ1_MEIGININ'] ?? ''),
        second: BQ_KOKYAKU_DATA.KJ_JUSYOKJ1,
      },
      KJ_JUSYOKJ2_MEIGININ: {
        first: String(BQ_OSS_SHINSEI_DATA['KJ_JUSYOKJ2_MEIGININ'] ?? ''),
        second: BQ_KOKYAKU_DATA.KJ_JUSYOKJ2,
      },
      KJ_JUSYOKJ3_MEIGININ: {
        first: String(BQ_OSS_SHINSEI_DATA['KJ_JUSYOKJ3_MEIGININ'] ?? ''),
        second: BQ_KOKYAKU_DATA.KJ_JUSYOKJ3,
      },
      KJ_SIYOHONK: {
        first: String(BQ_OSS_SHINSEI_DATA['KJ_SIYOHONK'] ?? ''),
        second: '',
      },
      MJ_HOKAADD: {
        first: String(BQ_OSS_SHINSEI_DATA['MJ_HOKAADD'] ?? ''),
        second: '',
      },
      KB_SYOYUKE2: {
        first: String(BQ_OSS_SHINSEI_DATA['KB_SYOYUKE2'] ?? ''),
        second: '',
      },
      CD_ZNTNOHYO: {
        first: String(BQ_OSS_SHINSEI_DATA['CD_ZNTNOHYO'] ?? ''),
        second: '',
      },
      KB_ZNTNOSYA: {
        first: String(BQ_OSS_SHINSEI_DATA['KB_ZNTNOSYA'] ?? ''),
        second: '',
      },
      CD_ZNTNOGYO: {
        first: String(BQ_OSS_SHINSEI_DATA['CD_ZNTNOGYO'] ?? ''),
        second: '',
      },
      NO_ZNTNOSEI: {
        first: String(BQ_OSS_SHINSEI_DATA['NO_ZNTNOSEI'] ?? ''),
        second: '',
      },
      KB_HOKASIND: {
        first: String(BQ_OSS_SHINSEI_DATA['KB_HOKASIND'] ?? ''),
        second: '',
      },
      KB_OEM: {
        first: String(BQ_OSS_SHINSEI_DATA['KB_OEM'] ?? ''),
        second: '',
      },
      MJ_SITKATA: {
        first: String(BQ_OSS_SHINSEI_DATA['MJ_SITKATA'] ?? ''),
        second: '',
      },
      MJ_SYOGENL: {
        first: String(BQ_OSS_SHINSEI_DATA['MJ_SYOGENL'] ?? ''),
        second: l,
      },
      MJ_SYOGENW: {
        first: String(BQ_OSS_SHINSEI_DATA['MJ_SYOGENW'] ?? ''),
        second: w,
      },
      MJ_SYOGENH: {
        first: String(BQ_OSS_SHINSEI_DATA['MJ_SYOGENH'] ?? ''),
        second: h,
      },
      KB_SIYOHDIT: {
        first: String(BQ_OSS_SHINSEI_DATA['KB_SIYOHDIT'] ?? ''),
        second: '',
      },
      KB_HOKADOU: {
        first: String(BQ_OSS_SHINSEI_DATA['KB_HOKADOU'] ?? ''),
        second: '',
      },
    }

    const fileName = [
      //
      isDev ? `dev` : ``,
      `OSS申請書`,
      new Date().toDateString(),
      NewCar['NO_CYUMON'],
      NewCar[`APPINDEX`],
    ].join(`_`)

    const {NO_CYUMON, DD_JUCYU, KJ_KURUMAME, KJ_KAINMEI1, KJ_MEIGIME1, User, Store} = NewCar

    const array = [
      //
      NO_CYUMON,
      formatDate(DD_JUCYU),
      KJ_KURUMAME,
      KJ_KAINMEI1,
      KJ_MEIGIME1,
      User.name,
      Store.name,
      l,
      w,
      h,

      ...Object.keys(keys).map((key, i) => {
        const {first, second} = keys[key]
        const value = first || second

        return String(value ?? '')
      }),
    ]

    await GoogleSheet_Append({
      spreadsheetId: 'https://docs.google.com/spreadsheets/d/18cKawfEPYRwp10PfTv2pt82kTpwZdrKbcd0VDvLQU0Y/edit?gid=0#gid=0',
      range: '2025/06/23!A1',
      values: [array] as string[][],
    })

    const requests = [
      //
      //発行者情報
      SheetRequests.updateCell(1353380407, 2, 22, companyStoreName),
      SheetRequests.updateCell(1353380407, 3, 22, address ?? `未登録`),
      SheetRequests.updateCell(1353380407, 4, 22, `TEL:${tel ?? `未登録`} FAX:${fax ?? `未登録`}`),
      SheetRequests.updateCell(1353380407, 5, 22, userName),

      ...Object.keys(keys).map((key, i) => {
        const {first, second} = keys[key]
        const value = first || second

        return SheetRequests.updateCell(1353380407, 6 + i, 22, String(value ?? ''))
      }),
    ]

    const copyFromOrigin = await GoogleDrive_CopyFile({
      fileId: `https://docs.google.com/spreadsheets/d/18xgbLdMMa-9YZGPRHEmzzkFascuDi49FQfzA922ycec/edit?gid=1353380407#gid=1353380407`,
      newName: fileName,
      parentFolderId: `https://drive.google.com/drive/folders/1hImbGH6Becx59lw6cRXJ_P2cHYStFPM0`,
    })

    if (copyFromOrigin.id) {
      const res = await GoogleSheet_BatchUpdate({
        spreadsheetId: copyFromOrigin.id ?? ``,
        requests,
      })

      if (res.spreadsheetId) {
        const ossSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/${res.spreadsheetId}/edit?gid=1353380407#gid=1353380407`
        await doStandardPrisma(`newCar`, `update`, {
          where: {id: NewCar.id},
          data: {ossSpreadsheetUrl: ossSpreadsheetUrl},
        })
        return {
          success: true,
          result: {
            fileName,
            url: ossSpreadsheetUrl,
          },
          message: `OSS申請書を作成しました`,
        }
      }
    }

    return {
      success: false,
      result: {fileName, url: ``},
      message: `OSS申請書を作成できませんでした`,
    }
  } catch (error) {
    console.error(error) //////////
    return {
      success: false,
      result: {error},
      message: `OSS申請書中にサーバーエラーが生じました。`,
    }
  }
}
