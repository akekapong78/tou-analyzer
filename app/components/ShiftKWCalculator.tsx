"use client";

import { useState } from "react";
import { Row } from "../interface/data";
import { FORMAT_OPTIONS } from "../constanst/datetime";
import { getRateTOU } from "../utils/tou";
import HolidayModal from "./HolidayModal";
import { AlertModal } from "./AlertModal";
import { AlertMessage } from "../interface/modal";
import holidays from "@/app/data/holidays.json";
import { CalendarDays, Eye } from "lucide-react";
import { detectDefaultFormat } from "@/app/utils/helper";
import DownloadCSV from "./ExportDataButton";
import ResultTable from "./ResultTable";
import Summary from "./Summary";

export default function ShiftKWCalculator() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [openHoliday, setOpenHoliday] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [dateFormat, setDateFormat] = useState(() => detectDefaultFormat());

  const [alert, setAlert] = useState<AlertMessage>({
    type: "success",
    title: "",
    message: "",
  })

  const handleReset = () => {
    setRows([]);
    setInput("");
  }

  const handleProcess = () => {
    if (!input) {
      setAlert({
        type: "warning",
        title: "Warning",
        message: "Please input datetime and value",
      });
      setOpenAlert(true);
      return;
    }

    const parsed = input
      .split(/\r?\n/)
      .map(line => {
        const parts = line
          .replace(/\u00A0/g, " ")
          .replace(/\t/g, " ")
          .trim()
          .split(/\s+/);

        if (parts.length < 3) return null;

        parts[1] = parts[1].replace(".", ":"); // for : dayjs can parse "23/04/2025 08.00" but not "23/04/2025 08:00"
        const datetime = parts[0] + " " + parts[1];
        const value = Number(parts[2]);

        return { datetime, value };
      })
      .filter(Boolean);

    if (parsed.length === 0) {
      setAlert({
        type: "warning",
        title: "Warning",
        message: "No valid data found. Please check your input format.",
      });
      setOpenAlert(true);
      return;
    }

    const nonZero = parsed.filter(r => r!.value !== 0);
    const result: Row[] = parsed.map((r, i) => ({
      datetime: r!.datetime,
      value: i >= parsed.length - nonZero.length
        ? nonZero[i - (parsed.length - nonZero.length)]!.value
        : null,
      rate: getRateTOU(r!.datetime, dateFormat),
    }));

    setRows(result);

    if (result.some(r => r.rate == "error")) {
      setAlert({
        type: "error",
        title: "Invalid input",
        message: "Please check your datetime or value",
      });
      setOpenAlert(true);
      return;
    }

    // open modal
    setAlert({
      type: "success",
      title: "Success",
      message: "Result is ready",
    })
    setOpenAlert(true);
  };

  return (
    <>
      <section className="w-full">
        <div className="mx-auto space-y-6">
          {/* Header */}
          <header className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100">
              <div className="flex items-center gap-3">
                {/* Top title */}
                <h1 className="text-2xl font-bold text-purple-800">
                  2️⃣ Shift kW Calculator
                </h1>
                
                {/* Calendar icon */}
                <a
                  href="https://www.pea.co.th/announcements/off-peak-calendar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-purple-200 p-2
                            text-purple-700 hover:bg-purple-50 transition"
                  title="PEA Off-Peak Calendar"
                  aria-label="PEA Off-Peak Calendar"
                >
                  <CalendarDays size={20} />
                </a>

                {/* Eye icon */}
                <button
                  onClick={() => setOpenHoliday(true)}
                  className="rounded-xl border border-purple-200 p-2 cursor-pointer
                            text-purple-700 hover:bg-purple-50 transition"
                  title="Preview Holiday List"
                  aria-label="Preview Holiday List"
                >
                  <Eye size={20} />
                </button>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                เลื่อนค่า kW ให้มีความต่อเนื่องกับ Datetime ล่าสุด หลังจากมีการ Reset เวลาใหม่ พร้อมแยก Rate TOU (P / OP / H) จากข้อมูล Datetime ใหม่นั้น ๆ 
              </p>
          </header>

          {/* Input */}
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100 space-y-4">
            <div className="flex gap-3 justify-between">
              {/* format dropdown */}
              <label className="block text-sm font-medium text-purple-700">
                <b>Input Datetime and Value</b>  
                <div className="text-gray-500">copy คอลัมน์ Datetime พร้อมกับคอลัมน์ kW จาก Excel ที่โหลดโปรไฟล์มา</div>
              </label>

              <div className="flex align-center items-center gap-2">
                <label className="text-sm font-medium text-purple-700 mb-1">
                  Choose Date Format
                </label>

                <select
                  value={dateFormat}
                  onChange={e => setDateFormat(e.target.value)}
                  className="rounded-xl border border-purple-200
                            bg-white p-2 text-sm text-gray-500
                            focus:ring-2 focus:ring-purple-400"
                >
                  {FORMAT_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              className="w-full h-64 resize-none rounded-xl border border-purple-200 
                        p-3 font-mono text-sm text-gray-800
                        focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder={`ตัวอย่าง:
23/04/2025 08:00	0.006618
23/04/2025 08:15	0.010062
23/04/2025 08:30	0.008264
23/04/2025 08:45	0.025086
23/04/2025 09:00	0
23/04/2025 09:15	0
23/04/2025 09:30	0
23/04/2025 09:45	0
23/04/2025 10:00	0
23/04/2025 10:15	0.012919
...`}
              value={input}
              onChange={e => setInput(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="rounded-xl bg-gray-700 px-6 py-2.5
                          text-sm font-semibold text-white
                          hover:bg-purple-400 cursor-pointer
                          transition mr-2"
                title="Reset"
                aria-label="Reset Data"
              >
                Reset
              </button>
              <button
                onClick={handleProcess}
                className="rounded-xl bg-purple-700 px-6 py-2.5
                          text-sm font-semibold text-white
                          hover:bg-purple-800 cursor-pointer
                          transition"
                title="Process"
                aria-label="Process"
              >
                Process
              </button>
            </div>

          </section>


          {/* Summary */}
          {rows.length > 0 && (
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100 space-y-4">

              <h2 className="text-lg font-semibold text-purple-800">
                Summary
              </h2>

              <Summary rows={rows} />

            </section>
          )}

          {/* Result Table */}
          {rows.length > 0 && (
            <section className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-purple-800">
                  Result ({rows.length.toLocaleString()} records)
                </h2>
                <DownloadCSV rows={rows} />
              </div>

              <ResultTable rows={rows} />
            </section>
          )}
        </div>
      </section>

      <HolidayModal
        open={openHoliday}
        onClose={() => setOpenHoliday(false)}
        holidays={holidays}
      />
      <AlertModal
        open={openAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={() => console.log("confirmed")}
        onClose={() => setOpenAlert(false)}
      />;
    </>
  );
}