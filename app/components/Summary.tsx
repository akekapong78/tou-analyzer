"use client";

import dayjs from "dayjs";
import { MonthSummary, Row } from "../interface/data";
import { ALL_PARSE_FORMATS } from "../utils/tou";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  CartesianGrid,
  Legend,
} from "recharts";
import { useMemo, useState } from "react";

type Props = {
  rows: Row[];
};

const rateColor = {
  P: "#ef4444",
  OP: "#3b82f6",
  H: "#10b981",
  KWH: "#f59e0b",
};

const ALL_MONTHS_KEY = "all";

function buildMonthSummary(month: string, data: Row[]): MonthSummary {
  const peakRows = data.filter((r) => r.rate === "P");

  const max =
    peakRows.length > 0
      ? peakRows.reduce((a, b) =>
        (a.value ?? 0) > (b.value ?? 0) ? a : b
      )
      : data.reduce((a, b) =>
        (a.value ?? 0) > (b.value ?? 0) ? a : b
      );

  let cumulative = 0;

  const chart = data.map((r) => {
    const kw = r.value ?? 0;
    const kwh = kw / 4;

    cumulative += kwh;

    return {
      datetime: r.datetime,
      date: dayjs(r.datetime, ALL_PARSE_FORMATS, true).format("MM/DD HH:mm"),
      kw,
      kwP: r.rate === "P" ? kw : null,
      kwOP: r.rate === "OP" ? kw : null,
      kwH: r.rate === "H" ? kw : null,
      kwh: cumulative,
    };
  });

  const kwhRate = { P: 0, OP: 0, H: 0 };

  data.forEach((r) => {
    const energy = (r.value ?? 0) / 4;

    if (r.rate === "P") kwhRate.P += energy;
    if (r.rate === "OP") kwhRate.OP += energy;
    if (r.rate === "H") kwhRate.H += energy;
  });

  return {
    month,
    maxKW: max.value ?? 0,
    maxKWRate: max.rate as "P" | "OP" | "H" | "KWH",
    maxDatetime: max.datetime,
    kwh: kwhRate,
    chart,
  };
}

function groupByMonth(rows: Row[]): MonthSummary[] {
  const map: Record<string, Row[]> = {};

  rows.forEach((r) => {
    if (r.value == null) return;

    const parsed = dayjs(r.datetime, ALL_PARSE_FORMATS, true);
    const m = parsed.isValid() ? parsed.format("YYYY-MM") : r.datetime;

    if (!map[m]) map[m] = [];

    map[m].push(r);
  });

  return Object.entries(map).map(([month, data]) => buildMonthSummary(month, data));
}

function buildAllMonthsSummary(rows: Row[]): MonthSummary | null {
  const data = rows.filter((r) => r.value != null);
  if (data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => {
    const da = dayjs(a.datetime, ALL_PARSE_FORMATS, true);
    const db = dayjs(b.datetime, ALL_PARSE_FORMATS, true);

    if (!da.isValid() || !db.isValid()) return 0;
    return da.diff(db);
  });

  return buildMonthSummary(ALL_MONTHS_KEY, sortedData);
}

export default function Summary({ rows }: Props) {
  const months = useMemo(() => groupByMonth(rows), [rows]);

  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_MONTHS_KEY);
  const current = useMemo(
    () =>
      selectedMonth === ALL_MONTHS_KEY
        ? buildAllMonthsSummary(rows)
        : months.find((m) => m.month === selectedMonth),
    [months, rows, selectedMonth]
  );


  if (!current) return null;

  const maxPoint = current.chart.find((c) => c.kw === current.maxKW);

  return (
    <div className="bg-white border border-purple-100 rounded-xl p-6 shadow-sm space-y-6">

      {/* Month selector */}
      {months.length > 1 && (
        <select
          className="border rounded px-3 py-2 text-lg font-bold text-purple-800 ring-2 ring-purple-400"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value={ALL_MONTHS_KEY}>รวมทั้งหมด</option>
          {months.map((m) => (
            <option key={m.month} value={m.month}>
              {dayjs(m.month).format("MMMM YYYY")}
            </option>
          ))}
        </select>
      )}

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-6 text-sm">

        <div>
          <div className="text-gray-600 font-bold">
            Max Demand ({current.maxKWRate})
          </div>
          <div className="text-xl font-semibold" style={{ color: rateColor[current.maxKWRate] }}>
            {current.maxKW > 1 ? current.maxKW.toLocaleString('en-US', { minimumFractionDigits: 4 }) : current.maxKW.toFixed(6)} kW
          </div>
          <div className="text-gray-600 text-xs">
            (on {dayjs(current.maxDatetime).format("DD/MM/YYYY HH:mm")})
          </div>
        </div>

        <div>
          <div className="text-gray-600 font-bold">Energy by TOU</div>

          <ul className="mt-1 space-y-1">

            <li style={{ color: rateColor.P }}>
              P : <b>{current.kwh.P.toLocaleString('en-US', { minimumFractionDigits: 4 })}</b> kWh
            </li>

            <li style={{ color: rateColor.OP }}>
              OP : <b>{current.kwh.OP.toLocaleString('en-US', { minimumFractionDigits: 4 })}</b> kWh
            </li>

            <li style={{ color: rateColor.H }}>
              H : <b>{current.kwh.H.toLocaleString('en-US', { minimumFractionDigits: 4 })}</b> kWh
            </li>

          </ul>

          <div className="text-xs text-gray-600 mt-1">
            (Formula: kWh = Σ(kW / 4))
          </div>
        </div>

        <div>
          <div className="text-gray-600 font-bold">Total Energy</div>
          <div className="text-xl font-bold text-orange-500">
            {(current.kwh.P + current.kwh.OP + current.kwh.H).toLocaleString('en-US', { minimumFractionDigits: 4 })} kWh
          </div>
        </div>

      </div>

      {/* Chart */}
      <div className="h-96">

        <ResponsiveContainer>

          <LineChart
            data={current.chart}
            margin={{
              top: 20,
              right: 40,
              left: 10,
              bottom: 20
            }}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="datetime"
              tickFormatter={(v) => dayjs(v).format("DD MMM")}
              interval={96 * 4}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />

            <YAxis
              yAxisId="kw"
              tick={{ fill: "#6b7280" }}
              label={{ value: "kW", angle: -90, fill: "#6b7280" }}
            />

            <YAxis
              yAxisId="kwh"
              orientation="right"
              tick={{ fill: "#6b7280" }}
              label={{ value: "kWh", angle: 90, fill: "#6b7280" }}
            />

            <Tooltip
              labelFormatter={(v) => dayjs(v).format("DD/MM/YYYY HH:mm")}
              labelClassName="text-gray-500"
              formatter={(value, name) => {
                if (typeof value === "number") {
                  if (name === "Cumulative kWh") {
                    return [`${value.toFixed(2)} kWh`, name];
                  }
                  return [`${value.toFixed(2)} kW`, name];
                }
                return [value, name];
              }}
            />

            <Legend
              formatter={(value) => {
                const colorMap: Record<string, string> = {
                  "Peak (P)": rateColor.P,
                  "OffPeak (OP)": rateColor.OP,
                  "Holiday (H)": rateColor.H,
                  "Cumulative kWh": rateColor.KWH,
                };

                return (
                  <span style={{ color: colorMap[value] || "#374151" }}>
                    {value}
                  </span>
                );
              }}
            />

            {/* Peak */}
            <Line
              yAxisId="kw"
              type="monotone"
              dataKey="kwP"
              stroke={rateColor.P}
              strokeWidth={2}
              dot={false}
              name="Peak (P)"
            />

            {/* OffPeak */}
            <Line
              yAxisId="kw"
              type="monotone"
              dataKey="kwOP"
              stroke={rateColor.OP}
              strokeWidth={2}
              dot={false}
              name="OffPeak (OP)"
            />

            {/* Holiday */}
            <Line
              yAxisId="kw"
              type="monotone"
              dataKey="kwH"
              stroke={rateColor.H}
              strokeWidth={2}
              dot={false}
              name="Holiday (H)"
            />

            {/* Cumulative */}
            <Line
              yAxisId="kwh"
              type="monotone"
              dataKey="kwh"
              stroke={rateColor.KWH}
              strokeWidth={2}
              dot={false}
              name="Cumulative kWh"
            />

            {/* Max marker */}
            {maxPoint && (
              <ReferenceDot
                yAxisId="kw"
                x={maxPoint.datetime}
                y={maxPoint.kw}
                r={8}
                stroke="white"
                strokeWidth={2}
                fill="#ef4444"
                label={{
                  value: "MAX",
                  position: "top",
                  fill: "#ef4444",
                  fontWeight: 600
                }}
              />
            )}

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}