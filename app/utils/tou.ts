import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import holidays from "@/app/data/holidays.json";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { normalize24 } from "./helper";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const holidaySet = new Set<string>(
  holidays.map(h => h.date) // "YYYY-MM-DD"
);

export const DATE_FORMATS: Record<string, string[]> = {
  "DD/MM/YYYY HH:mm": [
    "DD/MM/YYYY HH:mm",
    "DD/MM/YY HH:mm",
    "D/M/YYYY HH:mm",
    "D/M/YY HH:mm",
    "DD/M/YYYY HH:mm",
    "DD/M/YY HH:mm",
    "D/MM/YYYY HH:mm",
    "D/MM/YY HH:mm",

    "DD/MM/YYYY H:mm",
    "DD/MM/YY H:mm",
    "D/M/YYYY H:mm",
    "D/M/YY H:mm",
    "DD/M/YYYY H:mm",
    "DD/M/YY H:mm",
    "D/MM/YYYY H:mm",
    "D/MM/YY H:mm",

    "DD/MM/YYYY HH.mm",
    "DD/MM/YY HH.mm",
    "D/M/YYYY HH.mm",
    "D/M/YY HH.mm",
    "DD/M/YYYY HH.mm",
    "DD/M/YY HH.mm",
    "D/MM/YYYY HH.mm",
    "D/MM/YY HH.mm",

    "DD/MM/YYYY H.mm",
    "DD/MM/YY H.mm",
    "D/M/YYYY H.mm",
    "D/M/YY H.mm",
    "DD/M/YYYY H.mm",
    "DD/M/YY H.mm",
    "D/MM/YYYY H.mm",
    "D/MM/YY H.mm",
  ],
  "MM/DD/YYYY HH:mm": [
    "MM/DD/YYYY HH:mm",
    "MM/DD/YY HH:mm",
    "M/D/YYYY HH:mm",
    "M/D/YY HH:mm",
    "MM/D/YYYY HH:mm",
    "MM/D/YY HH:mm",
    "M/DD/YYYY HH:mm",
    "M/DD/YY HH:mm",

    "MM/DD/YYYY H:mm",
    "MM/DD/YY H:mm",
    "M/D/YYYY H:mm",
    "M/D/YY H:mm",
    "MM/D/YYYY H:mm",
    "MM/D/YY H:mm",
    "M/DD/YYYY H:mm",
    "M/DD/YY H:mm",

    "MM/DD/YYYY HH.mm",
    "MM/DD/YY HH.mm",
    "M/D/YYYY HH.mm",
    "M/D/YY HH.mm",
    "MM/D/YYYY HH.mm",
    "MM/D/YY HH.mm",
    "M/DD/YYYY HH.mm",
    "M/DD/YY HH.mm",

    "MM/DD/YYYY H.mm",
    "MM/DD/YY H.mm",
    "M/D/YYYY H.mm",
    "M/D/YY H.mm",
    "MM/D/YYYY H.mm",
    "MM/D/YY H.mm",
    "M/DD/YYYY H.mm",
    "M/DD/YY H.mm",
  ],
  "YYYY-MM-DD HH:mm": [
    "YYYY-MM-DD HH:mm",
    "YY-MM-DD HH:mm",
    "YYYY-M-D HH:mm",
    "YY-M-D HH:mm",
    "YYYY-MM-D HH:mm",
    "YY-MM-D HH:mm",
    "YYYY-M-DD HH:mm",
    "YY-M-DD HH:mm",

    "YYYY-MM-DD H:mm",
    "YY-MM-DD H:mm",
    "YYYY-M-D H:mm",
    "YY-M-D H:mm",
    "YYYY-MM-D H:mm",
    "YY-MM-D H:mm",
    "YYYY-M-DD H:mm",
    "YY-M-DD H:mm",

    "YYYY-MM-DD HH.mm",
    "YY-MM-DD HH.mm",
    "YYYY-M-D HH.mm",
    "YY-M-D HH.mm",
    "YYYY-MM-D HH.mm",
    "YY-MM-D HH.mm",
    "YYYY-M-DD HH.mm",
    "YY-M-DD HH.mm",

    "YYYY-MM-DD H.mm",
    "YY-MM-DD H.mm",
    "YYYY-M-D H.mm",
    "YY-M-D H.mm",
    "YYYY-MM-D H.mm",
    "YY-MM-D H.mm",
    "YYYY-M-DD H.mm",
    "YY-M-DD H.mm",
  ],
  "DD-MM-YYYY HH:mm": [
    "DD-MM-YYYY HH:mm",
    "DD-MM-YY HH:mm",
    "D-M-YYYY HH:mm",
    "D-M-YY HH:mm",
    "DD-M-YYYY HH:mm",
    "DD-M-YY HH:mm",
    "D-MM-YYYY HH:mm",
    "D-MM-YY HH:mm",

    "DD-MM-YYYY H:mm",
    "DD-MM-YY H:mm",
    "D-M-YYYY H:mm",
    "D-M-YY H:mm",
    "DD-M-YYYY H:mm",
    "DD-M-YY H:mm",
    "D-MM-YYYY H:mm",
    "D-MM-YY H:mm",

    "DD-MM-YYYY HH.mm",
    "DD-MM-YY HH.mm",
    "D-M-YYYY HH.mm",
    "D-M-YY HH.mm",
    "DD-M-YYYY HH.mm",
    "DD-M-YY HH.mm",
    "D-MM-YYYY HH.mm",
    "D-MM-YY HH.mm",

    "DD-MM-YYYY H.mm",
    "DD-MM-YY H.mm",
    "D-M-YYYY H.mm",
    "D-M-YY H.mm",
    "DD-M-YYYY H.mm",
    "DD-M-YY H.mm",
    "D-MM-YYYY H.mm",
    "D-MM-YY H.mm",
  ],
};

export const ALL_PARSE_FORMATS = Object.values(DATE_FORMATS).flat();

export function parseDatetimeToISO(dateStr: string, dateFormat: string): string | null {
  let normalized = dateStr
    .replace(/\u00A0/g, " ") // nbsp
    .replace(/\t/g, " ")     // TAB จาก Excel
    .replace(/\s+/g, " ")    // multiple spaces
    .trim()
    .replace(/\./g, ":");

  normalized = normalize24(normalized);
  const formats = DATE_FORMATS[dateFormat] ?? DATE_FORMATS["DD/MM/YYYY HH:mm"];
  const d = dayjs(normalized, formats, true);
  return d.isValid() ? d.format("YYYY-MM-DD HH:mm") : null;
}

export function getRateTOU(dateStr: string, dateFormat: string): "P" | "OP" | "H" | "error" {
  // handle only datetime
  let normalized = dateStr
    .replace(/\u00A0/g, " ") // nbsp
    .replace(/\t/g, " ")     // 🔑 TAB จาก Excel
    .replace(/\s+/g, " ")    // กันหลายช่อง
    .trim();

  const formating = DATE_FORMATS[dateFormat] ?? DATE_FORMATS["DD/MM/YYYY HH:mm"];

  normalized = normalize24(normalized);
  const d = dayjs(normalized, formating, true);
  if (!d.isValid()) {
    console.log("Invalid date:", normalized);
    return "error"; // หรือ throw error
  }

  const dateOnly = d.format("YYYY-MM-DD");
  const day = d.day(); // 0=Sun, 6=Sat
  const time = d.format("HH:mm");

  // H: weekend or special holiday
  if (day === 0 || day === 6 || holidaySet.has(dateOnly)) {
    return "H";
  }

  // P: 09:15 - 22:00
  if (time >= "09:15" && time <= "22:00") {
    return "P";
  }

  // OP: rest
  return "OP";
}