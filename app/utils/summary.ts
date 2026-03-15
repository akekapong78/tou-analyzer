import { Row, SummaryMap } from "../interface/data"

export function calculateSummary(rows: Row[]): SummaryMap {
  const result: SummaryMap = {}

  rows.forEach(r => {
    if (r.value == null) return

    if (!result[r.rate]) {
      result[r.rate] = {
        total: 0,
        max: -Infinity,
        maxDatetime: "",
      }
    }

    result[r.rate].total += r.value

    if (r.value > result[r.rate].max) {
      result[r.rate].max = r.value
      result[r.rate].maxDatetime = r.datetime
    }
  })

  return result
}