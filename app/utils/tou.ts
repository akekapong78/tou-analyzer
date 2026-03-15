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

export function getRateTOU(dateStr: string, dateFormat: string): "P" | "OP" | "H" | "error" {
  // handle only datetime
  let normalized = dateStr
    .replace(/\u00A0/g, " ") // nbsp
    .replace(/\t/g, " ")     // 🔑 TAB จาก Excel
    .replace(/\s+/g, " ")    // กันหลายช่อง
    .trim();

  let formating = [];

  switch (dateFormat) {
    case "DD/MM/YYYY HH:mm":
      formating = [
        "DD/MM/YYYY HH:mm",
        "DD/MM/YY HH:mm",
        "D/M/YYYY HH:mm",
        "D/M/YY HH:mm",

        "DD/MM/YYYY HH.mm",
        "DD/MM/YY HH.mm",
        "D/M/YYYY HH.mm",
        "D/M/YY HH.mm",
      ];
      break;
    case "MM/DD/YYYY HH:mm":
      formating = [
        "MM/DD/YYYY HH:mm",
        "MM/DD/YY HH:mm",
        "M/D/YYYY HH:mm",
        "M/D/YY HH:mm",

        "MM/DD/YYYY HH.mm",
        "MM/DD/YY HH.mm",
        "M/D/YYYY HH.mm",
        "M/D/YY HH.mm",
      ];
      break;
    case "YYYY-MM-DD HH:mm":
      formating = [
        "YYYY-MM-DD HH:mm",
        "YY-MM-DD HH:mm",
        "YYYY-M-D HH:mm",
        "YY-M-D HH:mm",

        "YYYY-MM-DD HH.mm",
        "YY-MM-DD HH.mm",
        "YYYY-M-D HH.mm",
        "YY-M-D HH.mm",
      ];
      break;
    case "DD-MM-YYYY HH:mm":
      formating = [
        "DD-MM-YYYY HH:mm",
        "DD-MM-YY HH:mm",
        "D-M-YYYY HH:mm",
        "D-M-YY HH:mm",

        "DD-MM-YYYY HH.mm",
        "DD-MM-YY HH.mm",
        "D-M-YYYY HH.mm",
        "D-M-YY HH.mm",
      ];
      break;
    default:
      formating = ["DD/MM/YYYY HH:mm"];
  }

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