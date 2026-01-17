/**
 * vercel.jsonをBATCH_MASTERから動的に生成するスクリプト
 *
 * 使用方法:
 *   node scripts/generateVercelJson.js
 *
 * または package.json の prebuild スクリプトで自動実行
 */

const fs = require('fs')
const path = require('path')

// TypeScriptファイルを実行するためにts-nodeまたはtsxを使用
// または、BATCH_MASTERをJavaScriptに変換する必要がある
// ここでは、動的インポートを使用してTypeScriptファイルを読み込む

async function generateVercelJson() {
  try {
    // TypeScriptファイルを読み込むために、tsxまたはts-nodeが必要
    // 簡易的な方法として、BATCH_MASTERの設定を直接読み込む
    // ただし、Node.jsでTypeScriptを直接実行するには追加の設定が必要

    // 別の方法: BATCH_MASTERの設定をJSONファイルとしてエクスポートする
    // または、このスクリプト自体をTypeScriptに変換する

    // ここでは、既存のvercel.jsonを読み込んで、crons部分だけを更新する方法を採用
    const vercelJsonPath = path.join(__dirname, '../vercel.json')
    const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'))

    // BATCH_MASTERからcrons設定を取得
    // TypeScriptファイルを実行するために、tsxを使用
    const {execSync} = require('child_process')

    // tsxを使ってTypeScriptファイルを実行し、crons設定を取得
    const batchMasterPath = path.join(__dirname, '../src/non-common/cron/batchMaster.ts')

    // 一時的なスクリプトを作成してcrons設定を取得
    const tempScript = `
      const {getVercelCronsConfig} = require('../src/non-common/cron/batchMaster.ts')
      console.log(JSON.stringify(getVercelCronsConfig()))
    `

    // より簡単な方法: BATCH_MASTERの設定を直接読み込む
    // TypeScriptファイルをJavaScriptにコンパイルするか、tsxを使用

    // 実際の実装: vercel.jsonのcrons部分をBATCH_MASTERから生成
    // ここでは、手動で同期するのではなく、スクリプトで自動生成

    // 既存のvercel.jsonの構造を保持しつつ、crons部分だけを更新
    const cronsConfig = [
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

    // BATCH_MASTERから動的に取得する方法
    // tsxを使用してTypeScriptファイルを実行
    try {
      const tsx = require.resolve('tsx')
      const batchMasterCode = `
        import {getVercelCronsConfig} from '../src/non-common/cron/batchMaster.ts'
        console.log(JSON.stringify(getVercelCronsConfig()))
      `

      const result = execSync(`npx tsx -e "${batchMasterCode.replace(/"/g, '\\"')}"`, {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
      })

      const dynamicCrons = JSON.parse(result.trim())
      vercelJson.crons = dynamicCrons
    } catch (error) {
      console.warn('tsxを使用した動的生成に失敗しました。手動設定を使用します。', error.message)
      // tsxが利用できない場合は、手動設定を使用
      vercelJson.crons = cronsConfig
    }

    // vercel.jsonを更新
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelJson, null, 1) + '\n', 'utf8')
    console.log('✅ vercel.jsonを更新しました')
    console.log(`   ${vercelJson.crons.length}個のcronジョブを設定しました`)
  } catch (error) {
    console.error('❌ vercel.jsonの生成に失敗しました:', error)
    process.exit(1)
  }
}

generateVercelJson()
