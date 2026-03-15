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

export type SummaryMap = Record<string, Summary>