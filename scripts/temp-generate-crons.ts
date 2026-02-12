import {BATCH_MASTER} from '../src/non-common/cron/batchMaster'

// effectOnが'batch'のアクションを抽出し、cron設定を生成
const cronJobs = []

for (const batch of Object.values(BATCH_MASTER)) {
  if (batch.effectOn === 'batch' && batch.schedule && batch.description) {
    // descriptionからAPIパスを取得（前後の空白を削除）
    const apiPath = batch.description.trim()
    cronJobs.push({
      path: apiPath,
      schedule: batch.schedule,
    })
  }
}

// パスでソート（一貫性のため）
cronJobs.sort((a, b) => a.path.localeCompare(b.path))

console.log(JSON.stringify(cronJobs))
