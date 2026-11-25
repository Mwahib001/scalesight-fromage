export type Sku = "FR-MC" | "FR-VB" | "FR-SC";
export type CaseId = "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7";
export const fixture = {
  version: "FROMAGE-P1-v1.0",
  snapshot: "2026-11-30",
  timezone: "America/Vancouver",
  products: [
    {
      id: "FR-MC" as Sku,
      name: "Milky Chocolate",
      short: "Chocolate",
      opening: 360,
      reserved: 90,
      cost: 400,
      recurring: 30,
      history: [96, 108, 108, 120, 114, 120, 120, 126],
    },
    {
      id: "FR-VB" as Sku,
      name: "Vanilla Bean",
      short: "Vanilla",
      opening: 270,
      reserved: 72,
      cost: 420,
      recurring: 24,
      history: [72, 78, 84, 84, 90, 84, 90, 96],
    },
    {
      id: "FR-SC" as Sku,
      name: "Strawberries & Cream",
      short: "Strawberry",
      opening: 180,
      reserved: 48,
      cost: 440,
      recurring: 18,
      history: [48, 54, 54, 60, 54, 60, 60, 66],
    },
  ],
  catalogue: [
    {
      id: "FR-CC",
      name: "Cocoa Cookie",
      opening: null,
      cost: null,
      history: null,
    },
    {
      id: "FR-LC",
      name: "Lemon Crumb",
      opening: null,
      cost: null,
      history: null,
    },
  ],
  accounts: [
    { id: "AC-01", name: "Illustrative BC Account A" },
    { id: "AC-02", name: "Illustrative BC Account B" },
    { id: "AC-03", name: "Illustrative BC Account C" },
    { id: "AC-04", name: "Illustrative Expansion Group" },
  ],
  historyDates: [
    "2026-10-05",
    "2026-10-12",
    "2026-10-19",
    "2026-10-26",
    "2026-11-02",
    "2026-11-09",
    "2026-11-16",
    "2026-11-23",
  ],
  weeks: [
    "2026-11-30",
    "2026-12-07",
    "2026-12-14",
    "2026-12-21",
    "2026-12-28",
    "2027-01-04",
    "2027-01-11",
    "2027-01-18",
    "2027-01-25",
    "2027-02-01",
    "2027-02-08",
    "2027-02-15",
  ],
  rules: {
    minimum: 1200,
    increment: 6,
    popsPerPack: 3,
    packsPerCase: 6,
    slotCapacity: 3600,
    capacity: 6000,
    leadWeeks: 6,
    bufferWeeks: 2,
    storageCents: 4,
    depositFraction: 0.5,
    stores: 10,
    fillPerStore: 12,
    repeatWeek: 9,
    bookingWeek: 3,
    usableUntil: {
      opening: "2027-05-31",
      initial: "2027-06-30",
      repeat: "2027-07-31",
    },
  },
  orderGroups: [
    {
      week: 1,
      orders: [
        ["AC-01", 48, 36, 24],
        ["AC-02", 24, 18, 12],
        ["AC-03", 18, 18, 12],
      ],
    },
    {
      week: 2,
      orders: [
        ["AC-01", 48, 36, 24],
        ["AC-02", 24, 18, 12],
        ["AC-03", 18, 18, 12],
      ],
    },
    { week: 3, orders: [["AC-01", 48, 36, 24]] },
  ],
} as const;
export type Scenario = {
  id: CaseId;
  name: string;
  multiplier: number;
  expansion: 0 | 5 | 9;
  initialWeek: 3 | 5;
  repeat: "none" | "chocolate" | "all";
};
export const scenarios: Scenario[] = [
  {
    id: "S0",
    name: "Existing retail only",
    multiplier: 1,
    expansion: 0,
    initialWeek: 3,
    repeat: "none",
  },
  {
    id: "S1",
    name: "Proposed expansion",
    multiplier: 1,
    expansion: 5,
    initialWeek: 3,
    repeat: "none",
  },
  {
    id: "S2",
    name: "Chocolate-only repeat",
    multiplier: 1,
    expansion: 5,
    initialWeek: 3,
    repeat: "chocolate",
  },
  {
    id: "S3",
    name: "Repeat all three",
    multiplier: 1,
    expansion: 5,
    initialWeek: 3,
    repeat: "all",
  },
  {
    id: "S4",
    name: "Slower existing demand",
    multiplier: 0.8,
    expansion: 5,
    initialWeek: 3,
    repeat: "none",
  },
  {
    id: "S5",
    name: "Stronger existing demand",
    multiplier: 1.2,
    expansion: 5,
    initialWeek: 3,
    repeat: "none",
  },
  {
    id: "S6",
    name: "First run arrives later",
    multiplier: 1,
    expansion: 5,
    initialWeek: 5,
    repeat: "none",
  },
  {
    id: "S7",
    name: "New-store opening moves later",
    multiplier: 1,
    expansion: 9,
    initialWeek: 3,
    repeat: "none",
  },
];
export const decisions = [
  {
    id: "DEC-01",
    deadline: "2026-12-14",
    cashCommitment: fixture.rules.minimum * fixture.products[0].cost,
    scenarios: ["S1", "S2"],
    skus: ["FR-MC"],
    action: "Review a W9 Chocolate repeat; confirm slot by W3.",
    confirmation:
      "Separate flavour production and lead time need confirmation.",
  },
  {
    id: "DEC-02",
    deadline: null,
    cashCommitment: null,
    scenarios: ["S2", "S3"],
    skus: ["FR-MC", "FR-VB", "FR-SC"],
    action:
      "Avoid automatically repeating Vanilla and Strawberry with Chocolate.",
    confirmation: "A shared-batch requirement could make S2 infeasible.",
  },
  {
    id: "DEC-03",
    deadline: null,
    cashCommitment: null,
    scenarios: ["S1", "S7"],
    skus: ["FR-MC", "FR-VB", "FR-SC"],
    action:
      "Assess expansion against existing requirements before promising timing.",
    confirmation: "Expansion is prospective, not confirmed.",
  },
  {
    id: "DEC-04",
    deadline: null,
    cashCommitment: null,
    scenarios: ["S1", "S2"],
    skus: ["FR-VB"],
    action: "Investigate repeat demand and Vanilla’s next commitment.",
    confirmation:
      "Extend the horizon before concluding no further production is needed.",
  },
].map((d) => ({
  ...d,
  owner: {
    analysis: "ScaleSight demonstration",
    commercial: "Fiona/Nuala",
    execution: "Fromage and its partners",
  },
  reviewStatus: "ILLUSTRATIVE_ANALYSIS_NOT_CLIENT_APPROVED",
  evidenceIds: ["EV-05", "EV-06"],
  assumptions: ["Illustrative manufacturing terms"],
  confirmationNeeded: true,
}));
