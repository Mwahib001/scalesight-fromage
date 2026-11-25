import { fixture } from "../data/fixture";
export const number = (n: number) =>
  new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 }).format(n);
export const money = (cents: number, precision = 0) =>
  `CAD ${new Intl.NumberFormat("en-CA", { minimumFractionDigits: precision, maximumFractionDigits: precision }).format(cents / 100)}`;
export const date = (value: string, year = false) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(year ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(value + "T12:00:00Z"));
export const week = (n: number, year = false) =>
  `W${n} · ${date(fixture.weeks[n - 1], year)}`;
