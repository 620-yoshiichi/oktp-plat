/**
 * vercel.jsonをBATCH_MASTERから動的に生成するスクリプト
 *
 * 使用方法:
 *   node scripts/generateVercelJson.mjs
 *   または
 *   npm run generate:vercel
 *
 * ビルド前に自動実行されるように package.json の prebuild に設定済み
 */

import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'
import {execSync} from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generateVercelJson() {
  try {
    const vercelJsonPath = path.join(__dirname, '../vercel.json')
    const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'))

    // BATCH_MASTERからcrons設定を取得
    let dynamicCrons = null

    try {
      // tsxでTypeScriptファイルを実行してcrons設定を取得
      const batchMasterPath = path.resolve(__dirname, '../src/non-common/cron/batchMaster.ts')

      // tsxを使用してgetVercelCronsConfigを実行
      // 相対パスでインポートする必要がある
      const code = `
        import {getVercelCronsConfig} from '${batchMasterPath.replace(/\\/g, '/')}'
        console.log(JSON.stringify(getVercelCronsConfig()))
      `

      // 一時ファイルを作成
      const tempFile = path.join(__dirname, 'temp-get-crons.mjs')
      fs.writeFileSync(tempFile, code, 'utf8')

      try {
        const result = execSync(`npx --yes tsx "${tempFile}"`, {
          cwd: path.join(__dirname, '..'),
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        dynamicCrons = JSON.parse(result.trim())
        console.log('✅ BATCH_MASTERからcrons設定を取得しました')
      } finally {
        // 一時ファイルを削除
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile)
        }
      }
    } catch (error) {
      console.warn('⚠️  tsxを使用した動的生成に失敗しました。手動設定を使用します。')
      console.warn(`   エラー: ${error.message}`)

      // フォールバック: 手動設定を使用（BATCH_MASTERと同期する必要がある）
      dynamicCrons = [
        {path: '/api/cron/execute/orderUpsert', schedule: '0 21,3 * * *'},
        {path: '/api/cron/execute/tenpoTsuikoUpsert', schedule: '0 22-23,0-10 * * *'},
        {path: '/api/cron/execute/fetchSeisanYoteiDiff', schedule: '15 1 * * *'},
        {path: '/api/cron/execute/notifySeisanYoteiDiff', schedule: '0,30 * * * *'},
        {path: '/api/cron/execute/aggregateProgress', schedule: '0 11 28-31 * *'},
        {path: '/api/cron/execute/oldCarsDeleteAndCreate', schedule: '0 22 * * *'},
        {path: '/api/cron/execute/zaikoDeleteAndCreate', schedule: '0 22 * * *'},
        {path: '/api/cron/execute/aisateiDeleteAndCreate', schedule: '0 22 * * *'},
        {path: '/api/cron/execute/upassDeleteAndCreate', schedule: '0 22 * * *'},
        {path: '/api/cron/execute/juchuShitadoriDbDeleteAndCreate', schedule: '0 22 * * *'},
      ]
      console.warn('   手動設定を使用しています。BATCH_MASTERと同期してください。')
    }

    // vercel.jsonを更新
    vercelJson.crons = dynamicCrons
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelJson, null, 1) + '\n', 'utf8')

    console.log('✅ vercel.jsonを更新しました')
    console.log(`   ${vercelJson.crons.length}個のcronジョブを設定しました`)

    // 各cronジョブを表示
    vercelJson.crons.forEach((cron, index) => {
      console.log(`   ${index + 1}. ${cron.path} - ${cron.schedule}`)
    })
  } catch (error) {
    console.error('❌ vercel.jsonの生成に失敗しました:', error)
    process.exit(1)
  }
}

generateVercelJson()
