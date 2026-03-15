import { Row } from "../interface/data"
import { calculateSummary } from "../utils/summary"

type Props = {
  rows: Row[]
}

export default function Summary({ rows }: Props) {

  const summary = calculateSummary(rows)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {Object.entries(summary)
      .sort(([rateA], [rateB]) => {
        const rateOrder = ["P", "OP", "H"];
        return rateOrder.indexOf(rateA) - rateOrder.indexOf(rateB);
      })
      
      .map(([rate, data]) => (
        <div
          key={rate}
          className="rounded-xl border border-purple-100 bg-white p-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-purple-700 mb-2">
            Rate: {rate}
          </h3>

          <div className="text-sm text-gray-700 space-y-1">
            <div>
              Total: <span className="font-semibold">{data.total.toFixed(3)} kW</span>
            </div>

            <div>
              Max: <span className="font-semibold">{data.max.toFixed(3)} kW</span>
            </div>

            <div className="text-xs text-gray-500">
              at {data.maxDatetime}
            </div>
          </div>
        </div>
      ))}

    </div>
  )
}