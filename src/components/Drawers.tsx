import { useEffect, useRef, useState } from "react";
import { type Drawer, useWorkspace } from "../context";
import { literal as L } from "../copy/literal";
import { fixture } from "../data/fixture";
import { baseline, calculate, sum } from "../engine/model";
import { money, number } from "../engine/format";
import { Icon, Note, Table } from "./ui";
import sourceLinks from "../../docs/source-links.json";
const sources = [
  [
    "Fromage website",
    "Cottage-cheese frozen pops, five publicly displayed flavours and retail positioning.",
    "No internal sales, stock or production quantities.",
  ],
  [
    "Fiona’s LinkedIn",
    "Founder identity and public co-manufacturing/growth discussion.",
    "Indexed posts may be older; no assumed current production date.",
  ],
  [
    "Nuala’s LinkedIn",
    "Co-founder identity and public brand/funding activity.",
    "No assumption that her expertise excludes a need for analytical support.",
  ],
  [
    "CanadianSME founder interview",
    "Founder backgrounds, cart origins and stated intention to use funding for co-manufacturing and expansion beyond BC.",
    "Published August 2026; intentions are not confirmation of current execution.",
  ],
  [
    "Mastercard recipients",
    "Fromage’s inclusion among 2026 recipients.",
    "Funding is not a proxy for available cash or affordability.",
  ],
  [
    "Aura: Vanilla Bean",
    "Public product listing and 3 × 108 ml retail format.",
    "No wholesale price, sell-through or store count inference.",
  ],
  [
    "Aura: frozen desserts",
    "Listings across the Fromage range.",
    "Availability badges do not diagnose demand or supply problems.",
  ],
  [
    "Fresh St. Market listing",
    "Another public retail listing.",
    "Its format description does not override the demo’s explicitly selected unit convention.",
  ],
];
export function Drawers({ name, close }: { name: Drawer; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState("Business context");
  const { result } = useWorkspace();
  useEffect(() => {
    if (!name) return;
    const dialog = ref.current!,
      trigger = document.activeElement as HTMLElement;
    dialog.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = old;
      trigger?.focus();
    };
  }, [name]);
  if (!name) return null;
  const title =
    name === "sources"
      ? "Sources & assumptions"
      : name === "review"
        ? L.reviewTitle
        : name === "catalogue"
          ? L.catalogue
          : L.aboutTitle;
  const inputs = [
    {
      group: "Selected flavours",
      rows: fixture.products.map((p) => [
        p.name,
        L.selected,
        "SYNTHETIC",
        "Confirm the actual three selected flavours.",
      ]),
    },
    {
      group: "Shipments and forecast",
      rows: [
        [
          "Eight-week shipments",
          `${number(sum(fixture.products.map((p) => sum(p.history))))} packs`,
          "SYNTHETIC",
          "Supply recent actual shipments.",
        ],
        [
          "Forward baseline",
          fixture.products
            .map((p) => `${p.short}: ${baseline(p.id)}`)
            .join(" · ") + " packs/week",
          "DERIVED",
          "Review seasonality and sell-through.",
        ],
        [
          "Retailer sell-through",
          "Not supplied",
          "UNKNOWN",
          "Request consumer purchase records.",
        ],
      ],
    },
    {
      group: "Stock and orders",
      rows: [
        [
          "Opening physical stock",
          `${number(sum(fixture.products.map((p) => p.opening)))} packs`,
          "SYNTHETIC",
          "Confirm usable stock and reservations.",
        ],
        [
          "Confirmed orders",
          "Confirmed within the illustrative scenario",
          "SYNTHETIC",
          "Supply the actual open order book.",
        ],
      ],
    },
    {
      group: "Manufacturing terms",
      rows: [
        [
          "Minimum per flavour",
          `${number(fixture.rules.minimum)} packs`,
          "SYNTHETIC",
          "Confirm whether minimum is per flavour or shared batch.",
        ],
        [
          "Separate flavour runs",
          "Assumed available; tested with global control",
          "SYNTHETIC",
          "Confirm feasibility with manufacturer.",
        ],
        [
          "Booking to usable receipt",
          `${fixture.rules.leadWeeks} calendar weeks`,
          "SYNTHETIC",
          "Confirm dates and actual supplier slots.",
        ],
        [
          "Capacity",
          `${number(fixture.rules.capacity)} packs`,
          "SYNTHETIC",
          "Confirm frozen storage capacity.",
        ],
        [
          "Usable-until dates",
          Object.entries(fixture.rules.usableUntil)
            .map(([k, v]) => `${k}: ${v}`)
            .join("; "),
          "SYNTHETIC",
          "Illustrative only; confirm actual usable shelf life.",
        ],
      ],
    },
    {
      group: "Expansion",
      rows: [
        [
          "Prospect",
          `${fixture.rules.stores} illustrative stores · ${number(result.expansionRequirement)} packs in the active case`,
          "SYNTHETIC",
          "Confirm opening quantities, timing and recurring requirements.",
        ],
      ],
    },
    {
      group: "Costs and payments",
      rows: [
        ...fixture.products.map((p) => [
          p.name,
          `${money(p.cost, 2)} per pack`,
          "SYNTHETIC",
          "Confirm landed production cost and tax.",
        ]),
        [
          "Initial commitment",
          money(calculate("S1").initialCommitment),
          "DERIVED",
          "Confirm commercial terms and payment milestones.",
        ],
        [
          "Storage proxy",
          `${money(fixture.rules.storageCents, 2)} × weekly physical closing packs`,
          "SYNTHETIC",
          "Comparison only; not a warehouse invoice.",
        ],
      ],
    },
  ];
  const calculations = [
    [
      "Forecast formation",
      "Average the latest four weeks of illustrative brand shipments; hold that baseline constant. This is a four-week moving-average shipment baseline.",
    ],
    [
      "Orders consuming forecast",
      "Use the larger of the existing forecast and confirmed existing orders per SKU/week, then add explicit prospective expansion. Orders are not added twice.",
    ],
    [
      "Stock projection",
      "Prior net closing stock + usable receipts − current requirement. Physical closing stock = max(0, net stock position). Receipts are available at the start of the week.",
    ],
    [
      "Backlog",
      L.backlog + " Outstanding requirement = max(0, −net stock position).",
    ],
    [
      "Planning buffer",
      L.buffer +
        " Formula: 2 × (existing requirement + recurring expansion). One-time opening fill is excluded. A breach uses strict <.",
    ],
    [
      "Booking deadline",
      "Required usable receipt date minus six calendar weeks. A W9 receipt implies a W3 booking, conditional on availability.",
    ],
    [
      "Production commitments",
      "Packs × integer CAD cents per pack. Initial deposit occurs in W1; initial balance follows the initial usable receipt. Repeat deposit is W3 and repeat balance W9.",
    ],
    [
      "Storage proxy",
      "CAD 0.04 × the sum of physical closing packs over twelve weeks and three flavours. This uses closing stock, not daily average occupancy.",
    ],
  ];
  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="drawer-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (e.clientX < rect.left) close();
        }
      }}
    >
      <div className="drawer-head">
        <span className="eyebrow">FROMAGE · PLANNING WORKSPACE</span>
        <button onClick={close} aria-label="Close drawer">
          <Icon name="close" />
        </button>
      </div>
      <h2 id="drawer-title">{title}</h2>
      {name === "sources" && (
        <>
          <p>{L.sourcesIntro}</p>
          <div
            className="drawer-tabs"
            role="tablist"
            aria-label="Sources sections"
          >
            {["Business context", "Illustrative inputs", "Calculations"].map(
              (t, i) => (
                <button
                  key={t}
                  id={`tab-${i}`}
                  role="tab"
                  aria-selected={tab === t}
                  aria-controls={`panel-${i}`}
                  tabIndex={tab === t ? 0 : -1}
                  onClick={() => setTab(t)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      const j = (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                      setTab(
                        [
                          "Business context",
                          "Illustrative inputs",
                          "Calculations",
                        ][j],
                      );
                      document.getElementById(`tab-${j}`)?.focus();
                    }
                  }}
                >
                  {t}
                </button>
              ),
            )}
          </div>
          <div
            role="tabpanel"
            id={`panel-${["Business context", "Illustrative inputs", "Calculations"].indexOf(tab)}`}
            aria-labelledby={`tab-${["Business context", "Illustrative inputs", "Calculations"].indexOf(tab)}`}
          >
            {tab === "Business context" && (
              <>
                <Note>
                  Public sources were checked in the supplied research session
                  dated 25 Nov 2026. This workspace does not claim a fresh
                  verification.
                </Note>
                {sources.map(([name, fact, limit], i) => (
                  <article className="source-item" key={name}>
                    <span className="classification">
                      PUBLIC · SRC-0{i + 1}
                    </span>
                    <h3>
                      <a href={sourceLinks[i]} target="_blank" rel="noreferrer">
                        {name}
                      </a>
                    </h3>
                    <p>{fact}</p>
                    <p className="small">{limit}</p>
                  </article>
                ))}
                <article className="source-item">
                  <span className="classification">THREAD</span>
                  <h3>Business context</h3>
                  <p>{L.thread}</p>
                  <ul>
                    <li>
                      The initial range will reduce from five flavours to three.
                    </li>
                    <li>
                      Minimum quantities will drive initial production
                      decisions.
                    </li>
                    <li>Co-manufacturing options are limited.</li>
                    <li>Fromage already sells in BC retail.</li>
                    <li>Customer feedback matters to the team.</li>
                  </ul>
                </article>
              </>
            )}
            {tab === "Illustrative inputs" &&
              inputs.map((g) => (
                <section key={g.group}>
                  <h3>{g.group}</h3>
                  {g.rows.map(([name, value, classification, confirmation]) => (
                    <article className="input-item" key={name}>
                      <span className="classification">{classification}</span>
                      <b>{name}</b>
                      <p>{value}</p>
                      <p className="small">
                        Needs confirmation: {confirmation}
                      </p>
                    </article>
                  ))}
                </section>
              ))}
            {tab === "Calculations" &&
              calculations.map(([name, body]) => (
                <details className="formula" key={name}>
                  <summary>
                    {name} <span className="classification">DERIVED</span>
                  </summary>
                  <p>{body}</p>
                </details>
              ))}
          </div>
        </>
      )}
      {name === "review" && (
        <>
          <p>{L.reviewIntro}</p>
          <ol className="review-questions">
            {L.reviewQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
          <div className="calculation-box">
            <h3>{L.serviceTitle}</h3>
            <p>{L.serviceBody}</p>
          </div>
          <p>{L.ownership}</p>
          <Note>{L.reviewStatus}</Note>
        </>
      )}
      {name === "about" && (
        <>
          <p>{L.aboutBody}</p>
          <p>{L.aboutService}</p>
          <Note>{L.aboutDisclosure}</Note>
        </>
      )}
      {name === "catalogue" && (
        <>
          <p>
            The public range is context. The operating selection is
            illustrative.
          </p>
          <Table
            headers={["Public flavour", "Example status"]}
            rows={[
              ...fixture.products.map((p) => [p.name, L.selected]),
              ...fixture.catalogue.map((p) => [
                p.name,
                <>
                  <b>{L.catalogueOnly}</b>
                  <p>{L.unmodelled}</p>
                </>,
              ]),
            ]}
          />
        </>
      )}
    </dialog>
  );
}
