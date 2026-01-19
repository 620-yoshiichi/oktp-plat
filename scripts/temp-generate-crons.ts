import {getCommonActions, getUcarActions, getNewCarActions, getQRBPActions} from '../src/app/(apps)/common/admin/batch/batchActions'

const offset = 0
const limit = 5000

const batch = {
  common: getCommonActions(),
  ucar: getUcarActions(offset, limit),
  newCar: getNewCarActions(),
  qrbp: getQRBPActions(),
}

// effectOnが'batch'のアクションを抽出し、cron設定を生成
const cronJobs = []

for (const appActions of Object.values(batch)) {
  for (const action of appActions) {
    if (action.effectOn === 'batch' && action.schedule && action.description) {
      // descriptionからAPIパスを取得（前後の空白を削除）
      const apiPath = action.description.trim()
      cronJobs.push({
        path: apiPath,
        schedule: action.schedule,
      })
    }
  }
}

// パスでソート（一貫性のため）
cronJobs.sort((a, b) => a.path.localeCompare(b.path))

console.log(JSON.stringify(cronJobs))
