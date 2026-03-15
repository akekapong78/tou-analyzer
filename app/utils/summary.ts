import dayjs from "dayjs"
import { Row, SummaryMap } from "../interface/data"



export function buildSummary(rows: Row[]) {
  const map: Record<string, Row[]> = {}

  rows.forEach(r => {
    const m = dayjs(r.datetime).format("YYYY-MM")
    if (!map[m]) map[m] = []
    map[m].push(r)
  })

  return Object.entries(map).map(([month, data]) => {

    const valid = data.filter(r => r.value !== null)

    const max = valid.reduce((a, b) =>
      (a.value ?? 0) > (b.value ?? 0) ? a : b
    )

    const kwh = {
      P: 0,
      OP: 0,
      H: 0
    }

    valid.forEach(r => {
      const energy = (r.value ?? 0) / 4
      if (r.rate === "P") kwh.P += energy
      if (r.rate === "OP") kwh.OP += energy
      if (r.rate === "H") kwh.H += energy
    })

    return {
      month,
      maxKW: max.value,
      maxDatetime: max.datetime,
      kwh
    }
  })
}

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
