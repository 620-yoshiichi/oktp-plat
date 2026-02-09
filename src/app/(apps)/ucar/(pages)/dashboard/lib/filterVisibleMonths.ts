/**
 * 指定期間に含まれる「年」のデータをすべて表示する。
 *
 * 例: periodStart=2025-03-01, periodEnd=2025-05-31
 *   → 2025年の全月（25-01 〜 25-12）を表示対象とする。
 *
 * 期間が年をまたぐ場合はその全年分を含める。
 * 例: periodStart=2025-11-01, periodEnd=2026-02-28
 *   → 2025年 + 2026年（25-01 〜 26-12）を表示対象とする。
 *
 * @param allMonths    データに存在する全月キー（YY-MM 形式、ソート済み）
 * @param periodStart  YYYY-MM-DD 形式の開始日
 * @param periodEnd    YYYY-MM-DD 形式の終了日
 * @returns  表示対象の月キー配列（ソート済み）
 */
export function filterVisibleMonths(allMonths: string[], periodStart: string, periodEnd: string): string[] {
  const startDate = new Date(periodStart)
  const endDate = new Date(periodEnd)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return allMonths
  }

  // 指定範囲に含まれる年を収集
  const years = new Set<number>()
  for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
    years.add(y)
  }

  /** YY-MM → 西暦年 */
  function monthKeyToYear(mk: string): number {
    const yy = Number(mk.split('-')[0])
    return yy < 50 ? 2000 + yy : 1900 + yy
  }

  return allMonths.filter(mk => years.has(monthKeyToYear(mk)))
}
