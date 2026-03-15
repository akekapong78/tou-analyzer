export type Row = {
  datetime: string;
  rate: "P" | "OP" | "H" | "error";
  value?: number | null;
};

export type Summary = {
  total: number
  max: number
  maxDatetime: string
}

export type ChartData = {
  datetime: string;
  date: string;
  kw: number;
  kwP: number | null;
  kwOP: number | null;
  kwH: number | null;
  kwh: number;
}

export type MonthSummary = {
  month: string;
  maxKW: number;
  maxKWRate: "P" | "OP" | "H" | "KWH";
  maxDatetime: string;
  kwh: {
    P: number;
    OP: number;
    H: number;
  };
  chart: ChartData[];
};


export type SummaryMap = Record<string, Summary>