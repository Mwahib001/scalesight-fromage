import { fixture, scenarios, type CaseId, type Sku } from "../data/fixture";
export const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
export const baseline = (sku: Sku) =>
  sum(fixture.products.find((p) => p.id === sku)!.history.slice(-4)) / 4;
export function shipmentHistory() {
  return fixture.products.flatMap((p) =>
    p.history.flatMap((q, i) => {
      const c = fixture.rules.packsPerCase;
      const a = c * Math.floor((q * 0.5) / c),
        b = c * Math.floor((q * 0.3) / c);
      return [a, b, q - a - b].map((quantity, j) => ({
        week_start: fixture.historyDates[i],
        account_id: fixture.accounts[j].id,
        sku_id: p.id,
        shipped_packs: quantity,
        source_type: "SYNTHETIC",
        availability_status: "AVAILABLE_IN_ILLUSTRATIVE_HISTORY",
        sell_through_packs: null,
        note: "Brand shipments; consumer purchases not supplied",
      }));
    }),
  );
}
export function orders() {
  let n = 0;
  return fixture.orderGroups.flatMap((g) =>
    g.orders.flatMap((order) => {
      n++;
      return fixture.products.map((p, i) => ({
        id: `SO-${String(n).padStart(3, "0")}`,
        week: g.week,
        account: order[0],
        sku: p.id,
        packs: Number(order[i + 1]),
      }));
    }),
  );
}
export type Row = {
  week: number;
  sku: Sku;
  existing: number;
  fill: number;
  recurring: number;
  requirement: number;
  receipt: number;
  net: number;
  physical: number;
  backlog: number;
  buffer: number;
  breach: boolean;
  postReceiptBreach: boolean;
  fulfilled: number;
  receiptPeak: number;
};
export function calculate(id: CaseId) {
  const scenario = scenarios.find((s) => s.id === id);
  if (!scenario) throw Error("Unknown case");
  const allOrders = orders();
  const rows: Row[] = [];
  for (const p of fixture.products) {
    let net: number = p.opening;
    for (let week = 1; week <= fixture.weeks.length; week++) {
      const physicalOpening = Math.max(0, net),
        backlogOpening = Math.max(0, -net);
      const existing = Math.max(
        baseline(p.id) * scenario.multiplier,
        sum(
          allOrders
            .filter((o) => o.week === week && o.sku === p.id)
            .map((o) => o.packs),
        ),
      );
      const fill =
        scenario.expansion === week
          ? fixture.rules.stores * fixture.rules.fillPerStore
          : 0;
      const recurring =
        scenario.expansion && week > scenario.expansion ? p.recurring : 0;
      const requirement = existing + fill + recurring;
      const receipt =
        (week === scenario.initialWeek ? fixture.rules.minimum : 0) +
        (week === fixture.rules.repeatWeek &&
        (scenario.repeat === "all" ||
          (scenario.repeat === "chocolate" && p.id === "FR-MC"))
          ? fixture.rules.minimum
          : 0);
      net += receipt - requirement;
      const physical = Math.max(0, net),
        buffer = fixture.rules.bufferWeeks * (existing + recurring);
      rows.push({
        week,
        sku: p.id,
        existing,
        fill,
        recurring,
        requirement,
        receipt,
        net,
        physical,
        backlog: Math.max(0, -net),
        buffer,
        breach: physical < buffer,
        postReceiptBreach: week >= scenario.initialWeek && physical < buffer,
        fulfilled: Math.min(
          physicalOpening + receipt,
          backlogOpening + requirement,
        ),
        receiptPeak: physicalOpening + receipt,
      });
    }
  }
  rows.sort(
    (a, b) =>
      a.week - b.week ||
      fixture.products.findIndex((p) => p.id === a.sku) -
        fixture.products.findIndex((p) => p.id === b.sku),
  );
  const initialCommitment = sum(
    fixture.products.map((p) => fixture.rules.minimum * p.cost),
  );
  const repeatCommitment = sum(
    fixture.products.map((p) =>
      scenario.repeat === "all" ||
      (scenario.repeat === "chocolate" && p.id === "FR-MC")
        ? fixture.rules.minimum * p.cost
        : 0,
    ),
  );
  const payments = [
    {
      id: "PAY-01",
      week: 1,
      kind: "Initial deposit",
      cents: initialCommitment * fixture.rules.depositFraction,
    },
    {
      id: "PAY-02",
      week: scenario.initialWeek,
      kind: "Initial balance",
      cents: initialCommitment * fixture.rules.depositFraction,
    },
    ...(repeatCommitment
      ? [
          {
            id: scenario.repeat === "all" ? "PAY-05" : "PAY-03",
            week: 3,
            kind: "Repeat deposit",
            cents: repeatCommitment * fixture.rules.depositFraction,
          },
          {
            id: scenario.repeat === "all" ? "PAY-06" : "PAY-04",
            week: 9,
            kind: "Repeat balance",
            cents: repeatCommitment * fixture.rules.depositFraction,
          },
        ]
      : []),
  ];
  const ending = rows.filter((r) => r.week === 12);
  return {
    scenario,
    rows,
    payments,
    ending,
    initialCommitment,
    repeatCommitment,
    totalPayments: sum(payments.map((p) => p.cents)),
    totalRequirement: sum(rows.map((r) => r.requirement)),
    expansionRequirement: sum(rows.map((r) => r.fill + r.recurring)),
    physical: sum(ending.map((r) => r.physical)),
    backlog: sum(ending.map((r) => r.backlog)),
    inventoryValue: sum(
      ending.map(
        (r) => r.physical * fixture.products.find((p) => p.id === r.sku)!.cost,
      ),
    ),
    storageProxy: fixture.rules.storageCents * sum(rows.map((r) => r.physical)),
    peak: Math.max(
      ...fixture.weeks.map((_, i) =>
        sum(rows.filter((r) => r.week === i + 1).map((r) => r.receiptPeak)),
      ),
    ),
    firstUnmet: rows.find((r) => r.backlog > 0),
  };
}
export type Result = ReturnType<typeof calculate>;
export const feasible = (id: CaseId, runs: boolean) => id !== "S2" || runs;
export function safeCalculate(
  id: CaseId,
  selector = calculate,
): { result: Result | null; error: boolean } {
  try {
    return { result: selector(id), error: false };
  } catch {
    return { result: null, error: true };
  }
}
export function bookingDeadline(receiptDate: string) {
  const d = new Date(receiptDate + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - fixture.rules.leadWeeks * 7);
  return d.toISOString().slice(0, 10);
}
export function productionTimeline(result: Result) {
  const rows = result.rows.filter((row) => row.sku === "FR-MC"),
    breach = rows.find((r) => r.postReceiptBreach),
    first = rows.find((r) => r.backlog);
  const events: {
    week: number;
    label: string;
    kind: "normal" | "warning" | "risk";
  }[] = [
    {
      week: result.scenario.initialWeek,
      label: "Initial production receipt",
      kind: "normal",
    },
  ];
  if (result.scenario.repeat !== "none")
    events.push(
      {
        week: fixture.rules.bookingWeek,
        label:
          "Modelled repeat booking · illustrative, conditional on slot availability",
        kind: "normal",
      },
      {
        week: fixture.rules.repeatWeek,
        label: `Modelled repeat receipt · ${result.scenario.repeat === "all" ? "All three flavours" : "Chocolate"}`,
        kind: "normal",
      },
    );
  if (breach)
    events.push({
      week: breach.week,
      label: "Post-receipt buffer breach · Chocolate",
      kind: "warning",
    });
  if (first)
    events.push({
      week: first.week,
      label: "First unmet Chocolate requirement",
      kind: "risk",
    });
  return events.sort((a, b) => a.week - b.week);
}
