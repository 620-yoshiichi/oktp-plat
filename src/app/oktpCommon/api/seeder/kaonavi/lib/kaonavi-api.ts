import {KaonaviUserType} from '../kaonabi-types'

/**
 * Kaonavi API認証情報の定数
 * TODO: 環境変数に移行することを推奨
 */
const KAONAVI_API_CONFIG = {
  consumerKey: 'f40b50b07ef780720b51d511bcedf6',
  consumerSecret: '2885a8ec422087f0b2674a888e0089a3c991ab8ff6e97dd5375b3daa60fe4b79',
  tokenUrl: 'https://api.kaonavi.jp/api/v2.0/token',
  membersUrl: 'https://api.kaonavi.jp/api/v2.0/members',
} as const

/**
 * 文字列をBase64エンコードする純粋関数
 */
function base64Encode(str: string): string {
  return Buffer.from(str, 'ascii').toString('base64')
}

/**
 * Kaonavi APIからアクセストークンを取得する
 */
async function getKaonaviAccessToken(): Promise<string> {
  const credentials = base64Encode(`${KAONAVI_API_CONFIG.consumerKey}:${KAONAVI_API_CONFIG.consumerSecret}`)

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  }

  const jsonData = await fetch(KAONAVI_API_CONFIG.tokenUrl, options).then(response => response.json())
  return jsonData.access_token
}

/**
 * Kaonavi APIからメンバー一覧を取得する
 */
export async function getKaonaviMemberArray(): Promise<{
  update_at: string
  member_data: KaonaviUserType[]
}> {
  const accessToken = await getKaonaviAccessToken()

  const requestOptions = {
    method: 'GET',
    headers: {
      'Kaonavi-Token': accessToken,
    },
  }

  const responseJson = await fetch(KAONAVI_API_CONFIG.membersUrl, requestOptions).then(res => res.json())

  const {update_at, member_data} = responseJson
  return {
    update_at,
    member_data,
  }
}
