import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  calculate,
  baseline,
  shipmentHistory,
  orders,
  sum,
  feasible,
  safeCalculate,
  productionTimeline,
  bookingDeadline,
} from "../src/engine/model";
import {
  fixture,
  scenarios,
  decisions,
  type CaseId,
} from "../src/data/fixture";
import { parseState, transition, stateSearch } from "../src/engine/state";
import { activeCopy } from "../src/copy/selectors";
import { literal, caseCopy } from "../src/copy/literal";
import goldenNet from "./golden/net.json";
import goldenLedger from "./golden/ledger.json";
import goldenShipments from "./golden/shipments.json";
const results = scenarios.map((s) => calculate(s.id));
const [s0, s1, s2, s3, , s5, s6] = results;
const flatten = (x: unknown): string[] =>
  typeof x === "string"
    ? [x]
    : Array.isArray(x)
      ? x.flatMap(flatten)
      : x && typeof x === "object"
        ? Object.values(x).flatMap(flatten)
        : [];
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) =>
    statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)],
  );
const normalize = (s: string) =>
  s
    .replace(/[“”‘’"']/g, "")
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
describe("PDF golden fixtures", () => {
  it("matches all 288 net positions", () => {
    expect(goldenNet).toHaveLength(288);
    for (const g of goldenNet)
      expect(
        calculate(g.scenario as CaseId).rows.find(
          (r) => r.week === g.week && r.sku === g.sku,
        )?.net,
      ).toBe(g.net);
  });
  it("matches all 1,728 independently supplied ledger cells", () => {
    expect(goldenLedger).toHaveLength(288);
    for (const g of goldenLedger) {
      const r = calculate(g.scenario as CaseId).rows.find(
        (r) => r.week === g.week && r.sku === g.sku,
      )!;
      for (const key of [
        "requirement",
        "receipt",
        "net",
        "physical",
        "backlog",
        "buffer",
      ] as const)
        expect(r[key]).toBe(g[key]);
    }
  });
  it("matches all 72 shipment records", () => {
    const actual = shipmentHistory();
    expect(actual).toHaveLength(72);
    for (const g of goldenShipments)
      expect(
        actual.find(
          (r) =>
            r.week_start === g.week_start &&
            r.account_id === g.account_id &&
            r.sku_id === g.sku_id,
        )?.shipped_packs,
      ).toBe(g.shipped_packs);
  });
  it("matches the eight financial summaries", () => {
    const values = [
      [1512000, 502200, 98640],
      [1512000, 225000, 80136],
      [1992000, 621000, 98256],
      [3024000, 1653000, 136656],
      [1512000, 410280, 95904],
      [1512000, 118800, 66552],
      [1512000, 225000, 52416],
      [1512000, 297000, 91512],
    ];
    results.forEach((r, i) =>
      expect([r.totalPayments, r.inventoryValue, r.storageProxy]).toEqual(
        values[i],
      ),
    );
  });
});
describe("20 named release checks", () => {
  it("01 history totals 2,046", () =>
    expect(sum(shipmentHistory().map((s) => s.shipped_packs))).toBe(2046));
  it("02 latest-four averages 120/90/60", () =>
    expect(fixture.products.map((p) => baseline(p.id))).toEqual([120, 90, 60]));
  it("03 account rows reconcile by SKU/week", () => {
    for (const p of fixture.products)
      p.history.forEach((q, i) =>
        expect(
          sum(
            shipmentHistory()
              .filter(
                (s) =>
                  s.sku_id === p.id && s.week_start === fixture.historyDates[i],
              )
              .map((s) => s.shipped_packs),
          ),
        ).toBe(q),
      );
  });
  it("04 opening stock 810", () =>
    expect(sum(fixture.products.map((p) => p.opening))).toBe(810));
  it("05 initial incoming 3,600", () =>
    expect(sum(s1.rows.map((r) => r.receipt))).toBe(3600));
  it("06 confirmed orders consume forecasts", () => {
    expect(orders()).toHaveLength(21);
    for (const r of s1.rows) expect(r.existing).toBe(baseline(r.sku));
  });
  it("07 S1 requirement 4,104", () => expect(s1.totalRequirement).toBe(4104));
  it("08 S1 end physical 516 backlog 210", () =>
    expect([s1.physical, s1.backlog]).toEqual([516, 210]));
  it("09 S2 commitment CAD 19,920", () =>
    expect(s2.totalPayments).toBe(1992000));
  it("10 S3 commitment CAD 30,240", () =>
    expect(s3.totalPayments).toBe(3024000));
  it("11 full vs selective difference CAD 10,320", () =>
    expect(s3.repeatCommitment - s2.repeatCommitment).toBe(1032000));
  it("12 physical stock nonnegative and net recurrence", () => {
    for (const result of results)
      for (const p of fixture.products) {
        let prior: number = p.opening;
        for (const row of result.rows.filter((r) => r.sku === p.id)) {
          expect(row.net).toBe(prior + row.receipt - row.requirement);
          expect(row.physical).toBeGreaterThanOrEqual(0);
          expect(row.physical - row.backlog).toBe(row.net);
          prior = row.net;
        }
      }
  });
  it("13 S6 W4 gap 270 despite same ending positions", () => {
    expect(sum(s6.rows.filter((r) => r.week === 4).map((r) => r.backlog))).toBe(
      270,
    );
    expect(sum(s6.rows.filter((r) => r.week === 5).map((r) => r.backlog))).toBe(
      0,
    );
    expect(s6.ending).toEqual(s1.ending);
  });
  it("14 receipt-time peaks before demand 3,870/5,274", () =>
    expect([s1.peak, s2.peak, s3.peak]).toEqual([3870, 3870, 5274]));
  it("15 catalogue-only operating data remains null", () => {
    for (const p of fixture.catalogue)
      expect([p.opening, p.cost, p.history]).toEqual([null, null, null]);
  });
  it("16 receipts and payments switch together", () => {
    expect(s6.payments[1].week).toBe(5);
    expect(s6.rows.find((r) => r.receipt > 0)?.week).toBe(5);
    expect(
      s2.payments
        .filter((p) => p.id === "PAY-03" || p.id === "PAY-04")
        .map((p) => p.week),
    ).toEqual([3, 9]);
  });
  it("17 S2 becomes infeasible without changing active case", () => {
    const s = transition(
      { ...parseState("?case=S2"), runs: true },
      { type: "runs", value: false },
    );
    expect(s.caseId).toBe("S2");
    expect(feasible(s.caseId, s.runs)).toBe(false);
  });
  it("18 public retailers never inherit synthetic operating data", () => {
    const operating = JSON.stringify({
      fixture,
      shipments: shipmentHistory(),
      orders: orders(),
    });
    expect(operating).not.toMatch(/Aura|Fresh St\. Market/);
  });
  it("19 sensitivity never presented as statistical intervals", () => {
    const text = files("src")
      .filter((p) => /tsx?$/.test(p))
      .map((p) => readFileSync(p, "utf8"))
      .join(" ");
    expect(text).not.toMatch(
      /confidence interval|probability interval|AI confidence/i,
    );
  });
  it("20 source and build forbidden-phrase scan", () => {
    const forbidden = [
      "Place order",
      "Approve production",
      "Sync ERP",
      "Deploy AI",
      "AI confidence",
      "optimised profit",
      "revenue unlocked",
      "guaranteed savings",
      "savings achieved",
      "ScaleSight saves",
      "specialist-approved",
      "since our last meeting",
      "Connected to Fromage",
      "ScaleSight x Fromage",
      "Cash balance",
    ];
    for (const dir of ["src", ...(existsSync("dist") ? ["dist"] : [])])
      for (const p of files(dir).filter((p) =>
        /\.(tsx?|js|html|css)$/.test(p),
      )) {
        const text = readFileSync(p, "utf8").toLowerCase();
        for (const phrase of forbidden)
          expect(text, `${p}: ${phrase}`).not.toContain(phrase.toLowerCase());
      }
  });
});
describe("timing, state and copy", () => {
  it("strict < buffer warnings include the initial bridge", () => {
    expect(s1.rows[0].breach).toBe(false);
    expect(results[4].rows[0].breach).toBe(false);
    expect(s5.rows[0].breach).toBe(true);
    for (const r of results)
      expect(r.rows.filter((x) => x.week === 2).every((x) => x.breach)).toBe(
        true,
      );
    expect(
      s1.rows.find((r) => r.sku === "FR-MC" && r.postReceiptBreach)?.week,
    ).toBe(9);
    expect(s1.firstUnmet?.week).toBe(11);
  });
  it("S2 avoids Chocolate post-receipt breach but Vanilla breaches W11", () => {
    expect(s2.rows.some((r) => r.sku === "FR-MC" && r.postReceiptBreach)).toBe(
      false,
    );
    expect(
      s2.rows.find((r) => r.sku === "FR-VB" && r.postReceiptBreach)?.week,
    ).toBe(11);
  });
  it("all eight first-unmet cards and computed explanations equal PDF literals", () => {
    for (const r of results) {
      const copy = activeCopy(r);
      expect(copy.first).toBe(caseCopy[r.scenario.id].first);
      expect(copy.support).toBe(caseCopy[r.scenario.id].support);
      expect(copy.explanation).toBe(caseCopy[r.scenario.id].explanation);
    }
  });
  it("literal copy has PDF provenance", () => {
    const pdf = normalize(readFileSync("docs/spec.txt", "utf8"));
    for (const text of flatten({ literal, caseCopy }))
      expect(pdf, text).toContain(normalize(text));
  });
  it("preset and opening choice preserve independent feasibility and harmless filters", () => {
    let s = { ...parseState("?case=S2&runs=no&sku=FR-VB"), account: "AC-02" };
    s = transition(s, { type: "case", id: "S6" });
    expect(s).toMatchObject({
      runs: false,
      sku: "FR-VB",
      account: "AC-02",
      caseId: "S6",
    });
    s = transition(s, { type: "opening", id: "S7" });
    expect(s.runs).toBe(false);
    s = transition(s, { type: "reset" });
    expect(s).toMatchObject({
      caseId: "S1",
      runs: true,
      sku: "FR-VB",
      account: "AC-02",
    });
  });
  it("URL defaults and round-trip preserve canonical case/runs/sku", () => {
    expect(parseState("")).toMatchObject({
      caseId: "S1",
      runs: true,
      sku: "FR-MC",
    });
    const s = parseState("?case=S2&runs=no&sku=FR-SC");
    expect(parseState(stateSearch(s))).toEqual(s);
  });
  it("calculation failure suppresses result", () =>
    expect(
      safeCalculate("S1", () => {
        throw Error("test");
      }),
    ).toEqual({ result: null, error: true }));
  it("all four decision records retained and only DEC-01 has commitment/deadline", () => {
    expect(decisions).toHaveLength(4);
    expect(
      decisions
        .slice(1)
        .every((d) => d.deadline === null && d.cashCommitment === null),
    ).toBe(true);
  });
  it("expansion is 0 / 864 / 576 packs and storage difference is CAD 384.00", () => {
    expect([
      s0.expansionRequirement,
      s1.expansionRequirement,
      results[7].expansionRequirement,
    ]).toEqual([0, 864, 576]);
    expect(s3.storageProxy - s2.storageProxy).toBe(38400);
  });
});
function luminance(hex: string) {
  const rgb = hex
    .replace("#", "")
    .match(/../g)!
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
const contrast = (a: string, b: string) => {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
it("AA contrast for every text token and actual used backgrounds; focus ≥3:1", () => {
  const backgrounds = [
    "#FFFFFF",
    "#FFFFE6",
    "#F9DC78",
    "#FFE6EB",
    "#fff7d9",
    "#faf9f4",
    "#f4f0df",
    "#fffdf3",
    "#fff9df",
    "#f7edbf",
    "#fff0f1",
  ];
  const foregrounds = [
    "#12110F",
    "#635F59",
    "#CE0080",
    "#A92838",
    "#825600",
    "#21613B",
    "#694c14",
    "#852431",
    "#68521e",
    "#624d1d",
    "#6b5016",
  ];
  for (const bg of backgrounds) {
    for (const fg of foregrounds) {
      if (fg === "#CE0080" && ["#F9DC78", "#f7edbf"].includes(bg)) continue;
      expect(contrast(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast("#12110F", bg)).toBeGreaterThanOrEqual(3);
  }
  expect(contrast("#FFFFFF", "#CE0080")).toBeGreaterThanOrEqual(4.5);
});

it("timeline follows the active case chronologically and booking subtracts six calendar weeks", () => {
  expect(bookingDeadline("2027-01-25")).toBe("2026-12-14");
  expect(bookingDeadline("2027-02-01")).toBe("2026-12-21");
  for (const r of results) {
    const events = productionTimeline(r);
    expect(events.map((e) => e.week)).toEqual(
      events.map((e) => e.week).sort((a, b) => a - b),
    );
    expect(
      events.some((e) => e.label.startsWith("Modelled repeat receipt")),
    ).toBe(r.scenario.repeat !== "none");
  }
  expect(productionTimeline(s6)[0].week).toBe(4);
});
