import { useState } from "react";
import { Link } from "react-router-dom";
import { fixture, scenarios, type CaseId, type Sku } from "../data/fixture";
import {
  calculate,
  baseline,
  shipmentHistory,
  sum,
  productionTimeline,
  bookingDeadline,
} from "../engine/model";
import { money, number, week, date } from "../engine/format";
import { stateSearch } from "../engine/state";
import { useWorkspace } from "../context";
import { literal as L } from "../copy/literal";
import { drafted as D } from "../copy/drafted";
import { activeCopy } from "../copy/selectors";
import { Card, Icon, Note, Table, Tip } from "./ui";
import {
  BacklogChart,
  ChartTable,
  LineChart,
  PaymentChart,
  StackedBars,
  WeeklyRequirement,
  palette,
} from "./Charts";
export function RouteLink({
  to,
  children,
  primary = false,
}: {
  to: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const { state } = useWorkspace();
  return (
    <Link
      className={`button ${primary ? "primary" : ""}`}
      to={to + stateSearch(state)}
    >
      {children}
    </Link>
  );
}
export function PageHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <header className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 tabIndex={-1}>{title}</h1>
        <p>{sub}</p>
      </div>
      <span className="context-chip">{L.context}</span>
    </header>
  );
}
export function CaseLabel() {
  const { result } = useWorkspace();
  return (
    <span className="chart-context">
      {result.scenario.id} · {result.scenario.name}
    </span>
  );
}
export function RunsControl() {
  const { state, dispatch } = useWorkspace();
  return (
    <fieldset className="runs-control">
      <legend>{L.runsQuestion}</legend>
      <div className="segmented">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            aria-pressed={state.runs === v}
            onClick={() => dispatch({ type: "runs", value: v })}
          >
            {v ? "Assumed yes" : "Assume no"}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
export function InfeasibleNote() {
  return (
    <Note risk>
      <strong>{L.infeasibleTitle}</strong>
      <p>{L.infeasible}</p>
    </Note>
  );
}
export function Brief() {
  const { result: r, state, openDrawer } = useWorkspace(),
    copy = activeCopy(r);
  const central = calculate("S2"),
    all = calculate("S3");
  const relevant = !["S0", "S4"].includes(state.caseId);
  return (
    <>
      <PageHeader
        eyebrow="PLANNING BRIEF"
        title={L.briefTitle}
        sub={L.briefSub}
      />
      <section className="opening-panel">
        <span className="eyebrow">THE PLANNING QUESTION</span>
        <h2>{L.opening}</h2>
        <p>{L.openingSub}</p>
        <span className="opening-stamp">MINIMUM-RUN & RETAIL GROWTH</span>
      </section>
      {state.caseId !== "S1" && (
        <div className="baseline-note">
          Baseline S1: Proposed expansion · unchanged production{" "}
          <span>Exploring: {r.scenario.name}</span>
        </div>
      )}
      <div className={`grid ${relevant ? "three" : "one"}`}>
        <Card className="metric">
          <span>First unmet requirement</span>
          <strong className={r.firstUnmet ? "risk-text" : "success-text"}>
            {copy.first}
          </strong>
          <p>{copy.support}</p>
          <Icon name={r.firstUnmet ? "warning" : "check"} />
        </Card>
        {relevant && (
          <>
            <Card className="metric">
              <span>Booking date to review</span>
              <strong>
                {date(
                  bookingDeadline(fixture.weeks[fixture.rules.repeatWeek - 1]),
                )}
              </strong>
              <p>
                For an illustrative{" "}
                {date(fixture.weeks[fixture.rules.repeatWeek - 1])} receipt.
              </p>
              <small>
                {state.caseId === "S1"
                  ? "Proposed response"
                  : state.caseId === "S2"
                    ? "Modelled repeat in the active case"
                    : D.centralProposal}
              </small>
              <Icon name="clock" />
            </Card>
            <Card className="metric">
              <span>Selective repeat commitment</span>
              <strong className={!state.runs ? "unavailable-amount" : ""}>
                {state.runs ? money(central.repeatCommitment) : D.unavailable}
              </strong>
              <p>Conditional on a separate Chocolate run.</p>
              <small>
                {state.caseId === "S1"
                  ? "Proposed response"
                  : state.caseId === "S2"
                    ? "Modelled repeat in the active case"
                    : D.centralProposal}
              </small>
              <Icon name="production" />
            </Card>
          </>
        )}
      </div>
      <Card className="decision-main">
        <div className="decision-kicker">
          <span className="eyebrow">PRODUCTION REVIEW</span>
          <span>DEC-01 · For discussion</span>
        </div>
        <h2>{!state.runs && relevant ? D.noRunsHeading : copy.heading}</h2>
        <p>{!state.runs && relevant ? L.infeasible : copy.explanation}</p>
        {!state.runs && relevant ? (
          <p>
            {D.noRunsComparison.replace(
              "{commitment}",
              money(all.repeatCommitment),
            )}
          </p>
        ) : (
          relevant && (
            <p className="financial-note">
              {state.caseId === "S1" || state.caseId === "S2"
                ? L.financial
                    .replace("CAD 4,800", money(central.repeatCommitment))
                    .replace("CAD 15,120", money(all.repeatCommitment))
                : `${D.centralProposal}: ${money(central.repeatCommitment)} for a Chocolate-only repeat; ${money(all.repeatCommitment)} for all three.`}
            </p>
          )
        )}
        {["S5", "S6", "S7"].includes(state.caseId) && (
          <p className="small">{D.untested}</p>
        )}
        {relevant && (
          <div className="confirmation">
            <Icon name="info" />
            <span>
              <b>First confirm:</b> {L.qualification}
            </span>
          </div>
        )}
        <div className="actions">
          <RouteLink to="/production" primary>
            See the production plan
          </RouteLink>
          <RouteLink to="/options">Compare the options</RouteLink>
        </div>
      </Card>
      <div className="grid two">
        <Card>
          <div className="decision-kicker">
            <span className="eyebrow">EXPANSION</span>
            <span>DEC-03</span>
          </div>
          <h3>{L.expansionHeading}</h3>
          <p>{copy.expansion}</p>
          <RouteLink to="/expansion">Review the opening</RouteLink>
        </Card>
        <Card>
          <div className="decision-kicker">
            <span className="eyebrow">EVIDENCE</span>
            <span>DEC-04</span>
          </div>
          <h3>{L.evidenceHeading}</h3>
          <p>{L.evidenceBody}</p>
          <RouteLink to="/demand-stock">Inspect the evidence</RouteLink>
        </Card>
      </div>
      <section className="service-strip">
        <Icon name="book" size={28} />
        <div>
          <h3>{L.maintained}</h3>
          <p>{L.maintainedBody}</p>
        </div>
        <button onClick={() => openDrawer("review")}>This week’s review</button>
      </section>
      <p className="footer-caption">{L.caption}</p>
    </>
  );
}
export function Demand() {
  const { result: r, state, dispatch, openDrawer } = useWorkspace();
  const [layers, setLayers] = useState({ existing: true, expansion: true });
  const p = fixture.products.find((p) => p.id === state.sku)!;
  const rows = r.rows.filter((row) => row.sku === p.id);
  const base = baseline(p.id);
  const shipments = shipmentHistory();
  const hist = fixture.historyDates.map((d) =>
    sum(
      shipments
        .filter(
          (s) =>
            s.sku_id === p.id &&
            s.week_start === d &&
            (state.account === "all" || s.account_id === state.account),
        )
        .map((s) => s.shipped_packs),
    ),
  );
  const labels = [
    ...fixture.historyDates.map((d) => date(d)),
    ...fixture.weeks.map((_, i) => `W${i + 1}`),
  ];
  return (
    <>
      <PageHeader
        eyebrow="DEMAND & STOCK"
        title={L.demandTitle}
        sub={L.demandSub}
      />
      <div className="filter-row">
        <label>
          Product
          <select
            value={state.sku}
            onChange={(e) =>
              dispatch({ type: "sku", value: e.target.value as Sku })
            }
          >
            {fixture.products.map((p) => (
              <option value={p.id} key={p.id}>
                {p.short}
              </option>
            ))}
          </select>
        </label>
        <label>
          History account
          <select
            value={state.account}
            onChange={(e) =>
              dispatch({ type: "account", value: e.target.value })
            }
          >
            <option value="all">All existing accounts</option>
            {fixture.accounts.slice(0, 3).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => openDrawer("catalogue")}>
          Public range and example selection
        </button>
      </div>
      <div className="evidence-labels">
        <span>
          <b>Available in example</b> Eight weeks of synthetic shipments.
        </span>
        <span>
          <b>Not supplied</b> Retailer sell-through.
        </span>
        <span>
          <b>Needs context</b> Feedback, availability and future account plans.
        </span>
      </div>
      <Card>
        <div className="section-heading">
          <h2>{L.historyChart}</h2>
          <CaseLabel />
        </div>
        <p className="small">Retail packs per week · {p.short}</p>
        <LineChart
          labels={labels}
          historyCount={8}
          caption={`${L.historyChart} · ${p.short} · ${r.scenario.name}. Account filter applies to history only.`}
          tooltips={labels.map((_, i) =>
            i < 8
              ? `Week of ${date(fixture.historyDates[i], true)} · ${p.short} · ${number(hist[i])} packs shipped · Illustrative data`
              : `Four-week shipment average · ${number(base)} packs/week · Projection, not confirmed orders`,
          )}
          series={[
            {
              label: "Brand shipments",
              values: [...hist, ...Array(12).fill(base)],
              colour: "#705739",
            },
            {
              label: "Forward baseline",
              values: [...Array(8).fill(base), ...Array(12).fill(base)],
              colour: "#CE0080",
              dashed: true,
            },
          ]}
        />
        <ChartTable>
          <Table
            headers={["Week", "Brand shipments", "Forward baseline"]}
            rows={labels.map((l, i) => [
              l,
              i < 8 ? number(hist[i]) : "Not modelled in this example",
              i < 8 ? "Not modelled in this example" : number(base),
            ])}
          />
        </ChartTable>
        <p className="small">
          The account filter applies to historical shipments only.{" "}
          {L.groupForecast} {L.filterNote}
        </p>
        <div className="calculation-box">
          <h3>
            {L.forecastCalculation} <Tip label="forecast">{L.forecast}</Tip>
          </h3>
          <p>
            The latest four illustrative weeks are{" "}
            {p.history.slice(-4).slice(0, 3).join(", ")} and {p.history.at(-1)}{" "}
            packs. Their average is {number(base)} packs per week.
          </p>
          <p>{L.sensitivity}</p>
        </div>
      </Card>
      <Card>
        <h2>Opening stock</h2>
        <Table
          headers={[
            "Product",
            "Physical stock",
            "Reserved for W1 orders",
            "Unreserved stock",
          ]}
          rows={fixture.products.map((p) => [
            p.name,
            number(p.opening),
            number(p.reserved),
            number(p.opening - p.reserved),
          ])}
        />
        <p className="small">{L.reservations}</p>
      </Card>
      <Card>
        <div className="section-heading">
          <h2>{L.stockChart}</h2>
          <CaseLabel />
        </div>
        <p className="small">
          {p.short} · Retail packs · Receipts usable at the start of the week
        </p>
        <div className="layer-controls">
          <b>Demand layers</b>
          {(["existing", "expansion"] as const).map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={(e) =>
                  setLayers({ ...layers, [key]: e.target.checked })
                }
              />
              {key === "existing" ? "Existing retail" : "New-store"}
            </label>
          ))}
          <small>
            Visibility only. Select S0 to exclude expansion from the model.
          </small>
        </div>
        <LineChart
          labels={fixture.weeks.map((_, i) => `W${i + 1}`)}
          caption={`Physical closing stock and planning buffer · ${p.short} · ${r.scenario.name}`}
          receipts={rows.flatMap((row, i) => (row.receipt ? [i] : []))}
          series={[
            {
              label: "Physical closing stock",
              values: rows.map((r) => r.physical),
              colour: "#CE0080",
            },
            {
              label: "Planning buffer",
              values: rows.map((r) => r.buffer),
              colour: "#705739",
              dashed: true,
            },
            ...(layers.existing
              ? [
                  {
                    label: "Existing retail",
                    values: rows.map((r) => r.existing),
                    colour: "#21613B",
                    dashed: true,
                  },
                ]
              : []),
            ...(layers.expansion
              ? [
                  {
                    label: "New-store requirement",
                    values: rows.map((r) => r.fill + r.recurring),
                    colour: "#635F59",
                    dashed: true,
                  },
                ]
              : []),
          ]}
        />
        <BacklogChart
          rows={rows}
          caption={`Unmet requirement by week · ${p.short} · ${r.scenario.name}`}
        />
        {rows.find((row) => row.backlog > 0) && (
          <p className="risk-text">
            <b>
              W{rows.find((row) => row.backlog > 0)!.week}:{" "}
              {number(rows.find((row) => row.backlog > 0)!.backlog)} packs of
              unmet requirement.
            </b>
          </p>
        )}
        <div className="section-heading">
          <h3>Weekly ledger</h3>
          <span>
            Planning buffer{" "}
            <Tip label="planning buffer">
              {L.buffer} Formula: 2 × (existing retail + recurring expansion);
              opening fill excluded.
            </Tip>{" "}
            · Unmet requirement <Tip label="unmet requirement">{L.backlog}</Tip>
          </span>
        </div>
        <Table
          caption={`${p.short} · ${r.scenario.name} · Chart data table`}
          headers={[
            "Week",
            "Existing retail",
            "New-store requirement",
            "Requirement",
            "Usable receipt",
            "Closing stock",
            "Unmet requirement",
            "Planning buffer",
            "Post-receipt buffer breach",
          ]}
          rows={rows.map((row) => [
            week(row.week),
            number(row.existing),
            number(row.fill + row.recurring),
            number(row.requirement),
            number(row.receipt),
            number(row.physical),
            <span className={row.backlog ? "risk-text" : ""}>
              {number(row.backlog)}
            </span>,
            number(row.buffer),
            row.postReceiptBreach
              ? "⚠ Below buffer"
              : row.week < r.scenario.initialWeek
                ? row.breach
                  ? "Initial bridge · Below buffer"
                  : "Initial bridge · At or above buffer"
                : "At or above buffer",
          ])}
        />
        <p className="small">
          The initial stock bridge remains visible in W1/W2. Physical closing
          stock uses strict &lt; for buffer warnings.
        </p>
      </Card>
      <Note>
        <p>{activeCopy(r).explanation}</p>
        <p>{L.stockInterpretation}</p>
        <p>{L.limitation}</p>
      </Note>
    </>
  );
}
export function Production() {
  const { result: r, state, dispatch, openDrawer } = useWorkspace();
  const s2 = calculate("S2"),
    s3 = calculate("S3");
  const comparison = !["S1", "S2"].includes(state.caseId);
  return (
    <>
      <PageHeader
        eyebrow="PRODUCTION PLAN"
        title={L.productionTitle}
        sub={L.productionSub}
      />
      <div className="constraint-strip">
        {[
          ["Minimum per flavour", `${number(fixture.rules.minimum)} packs`],
          ["Booking to usable receipt", `${fixture.rules.leadWeeks} weeks`],
          [
            "Separate flavour runs",
            state.runs ? "Assumed available" : "Assume no",
          ],
          ["Initial receipt", week(r.scenario.initialWeek)],
        ].map(([k, v]) => (
          <div key={k}>
            <span>{k}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <p className="small caution">
        <Icon name="info" size={16} />
        {L.manufacturing}
      </p>
      <Card>
        <h2>{L.initialRun}</h2>
        <Table
          headers={[
            "Product",
            "Incoming packs",
            "Available date",
            "Commitment value · CAD",
          ]}
          rows={fixture.products.map((p) => [
            p.name,
            number(fixture.rules.minimum),
            week(r.scenario.initialWeek, true),
            money(fixture.rules.minimum * p.cost).replace("CAD ", ""),
          ])}
        />
        <div className="table-total">
          {number(fixture.rules.minimum * fixture.products.length)} packs ·{" "}
          {number(
            fixture.rules.minimum *
              fixture.products.length *
              fixture.rules.popsPerPack,
          )}{" "}
          pops · {money(r.initialCommitment)}
        </div>
        <p className="small">{L.initialCaption}</p>
      </Card>
      <Card>
        <div className="section-heading">
          <h2>{L.timeline}</h2>
          <CaseLabel />
        </div>
        <ol className="timeline">
          {productionTimeline(r).map((event, i) => (
            <li key={i}>
              <span
                className={`timeline-pin ${event.kind === "warning" ? "warning-pin" : event.kind === "risk" ? "risk-pin" : ""}`}
              />
              <div>
                <strong>{event.label}</strong>
                <p>{week(event.week, true)}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="small">
          Active case only. No repeat receipt is included in cases with
          unchanged production. Initial W1/W2 buffer conditions remain visible
          in Demand & Stock.
        </p>
      </Card>
      {!["S0", "S4"].includes(state.caseId) && (
        <Card>
          <div className="section-heading">
            <h2>{L.selective}</h2>
            <span className="badge">
              {state.caseId === "S2"
                ? "Modelled repeat in the active case"
                : comparison
                  ? D.centralProposal
                  : "Proposed response"}
            </span>
          </div>
          {!state.runs ? (
            <InfeasibleNote />
          ) : (
            <>
              <Table
                headers={[
                  "Product",
                  "Proposed repeat",
                  "Receipt",
                  "Additional commitment · CAD",
                ]}
                rows={[
                  [
                    fixture.products[0].name,
                    `${number(fixture.rules.minimum)} packs`,
                    week(fixture.rules.repeatWeek, true),
                    money(s2.repeatCommitment).replace("CAD ", ""),
                  ],
                ]}
              />
              <p>{L.selectiveBody}</p>
            </>
          )}
          {["S5", "S6", "S7"].includes(state.caseId) && (
            <p className="small">{D.untested}</p>
          )}
          <div className="actions">
            <button
              className="primary"
              disabled={!state.runs}
              onClick={() => dispatch({ type: "case", id: "S2" })}
            >
              Preview Chocolate-only repeat
            </button>
            <RouteLink to="/options">Compare repeating all three</RouteLink>
          </div>
        </Card>
      )}
      <Card>
        <RunsControl />
        {!state.runs && (
          <>
            <InfeasibleNote />
            <p>
              {D.noRunsComparison.replace(
                "{commitment}",
                money(s3.repeatCommitment),
              )}
            </p>
          </>
        )}
      </Card>
      <Card>
        <h2>Check the path, not just the ending stock</h2>
        <button onClick={() => dispatch({ type: "case", id: "S6" })}>
          {L.delay}
        </button>
        {state.caseId === "S6" && (
          <Note risk>
            <strong>
              {number(
                sum(
                  r.rows
                    .filter((row) => row.week === 4)
                    .map((row) => row.backlog),
                ),
              )}{" "}
              packs temporarily unfulfilled in W4
            </strong>
            <p>{L.delayBody}</p>
          </Note>
        )}
      </Card>
      <div className="grid two">
        <Card>
          <h3>Payment timing</h3>
          {state.runs && ["S1", "S2"].includes(state.caseId) && (
            <p>
              <b>
                {state.caseId === "S1"
                  ? "Proposed response"
                  : "Modelled repeat in the active case"}
              </b>
              <br />
              {L.repeatPayment.replaceAll(
                "CAD 2,400",
                money(s2.repeatCommitment * fixture.rules.depositFraction),
              )}
            </p>
          )}
          <p className="small">
            Payments in the active case · {r.scenario.name}
          </p>
          {!state.runs && state.caseId === "S2" ? (
            <p>{D.unavailable}</p>
          ) : (
            r.payments.map((p) => (
              <div className="payment-row" key={p.id}>
                <span>
                  {week(p.week)}
                  <small>{p.kind}</small>
                </span>
                <b>{money(p.cents)}</b>
              </div>
            ))
          )}
          <p className="small">{L.paymentCaption}</p>
        </Card>
        <Card>
          <h3>Storage check</h3>
          <strong className="large-value">
            {number(r.peak)} <small>packs</small>
          </strong>
          <p>Receipt-time peak · before weekly requirements</p>
          <p>{L.storage}</p>
          <p className="small">
            Storage proxy: {money(r.storageProxy, 2)} ·{" "}
            {money(fixture.rules.storageCents, 2)} × physical closing packs each
            week
          </p>
          <button className="text-button" onClick={() => openDrawer("sources")}>
            Inspect the assumptions
          </button>
        </Card>
      </div>
    </>
  );
}
export function Expansion() {
  const { result: r, dispatch } = useWorkspace();
  const opening = r.scenario.expansion;
  const totals = fixture.products.map((p) => {
    const rows = r.rows.filter((row) => row.sku === p.id);
    return {
      name: p.short,
      fill: sum(rows.map((x) => x.fill)),
      recurring: sum(rows.map((x) => x.recurring)),
    };
  });
  return (
    <>
      <PageHeader
        eyebrow="RETAIL EXPANSION"
        title={L.expansionTitle}
        sub={L.expansionSub}
      />
      <Card className="prospect">
        <div>
          <span className="badge">{L.prospective}</span>
          <h2>{fixture.accounts[3].name}</h2>
          <p>
            {fixture.rules.stores} example stores · {fixture.rules.fillPerStore}{" "}
            packs per product per store · {fixture.products.length} example
            flavours
          </p>
          <b>
            {opening
              ? `Opening ${week(opening, true)}`
              : "Opening excluded from this case"}
          </b>
        </div>
        <label>
          Opening case
          <select
            value={opening === 0 ? "S0" : opening === 9 ? "S7" : "S1"}
            onChange={(e) =>
              dispatch({ type: "opening", id: e.target.value as CaseId })
            }
          >
            <option value="S0">Exclude opening — S0</option>
            <option value="S1">Open in W5 — S1</option>
            <option value="S7">Move opening to W9 — S7</option>
          </select>
        </label>
      </Card>
      <Card>
        <div className="section-heading">
          <h2>Opening versus repeat requirement</h2>
          <CaseLabel />
        </div>
        <StackedBars
          labels={totals.map((t) => t.name)}
          series={[
            {
              label: "Opening fill",
              values: totals.map((t) => t.fill),
              colour: palette.fill,
            },
            {
              label: "Recurring replenishment",
              values: totals.map((t) => t.recurring),
              colour: palette.existing,
            },
          ]}
          caption={`Expansion requirement by flavour · ${r.scenario.name}`}
        />
        <ChartTable>
          <Table
            headers={[
              "Product",
              "Opening fill",
              "Recurring requirement",
              "Total",
            ]}
            rows={[
              ...totals.map((t) => [
                t.name,
                number(t.fill),
                number(t.recurring),
                number(t.fill + t.recurring),
              ]),
              [
                "Total",
                number(sum(totals.map((t) => t.fill))),
                number(sum(totals.map((t) => t.recurring))),
                number(r.expansionRequirement),
              ],
            ]}
          />
        </ChartTable>
        <p>{L.expansionCaption}</p>
      </Card>
      <Card>
        <div className="section-heading">
          <h2>{L.requirementChart}</h2>
          <CaseLabel />
        </div>
        <WeeklyRequirement result={r} />
      </Card>
      <Card>
        <h2>Opening-date comparison</h2>
        <p className="small">
          Central demand · unchanged production · S1 versus S7
        </p>
        <Table
          headers={[
            "Opening case",
            "Chocolate unmet at W12",
            "Vanilla closing stock",
            "Strawberry closing stock",
          ]}
          rows={(["S1", "S7"] as const).map((id) => {
            const c = calculate(id);
            return [
              `W${c.scenario.expansion} opening`,
              number(c.ending[0].backlog),
              number(c.ending[1].physical),
              number(c.ending[2].physical),
            ];
          })}
        />
        <p>{L.delayedOpening}</p>
      </Card>
      <Card className="decision-main">
        <span className="eyebrow">EXPANSION · DEC-03</span>
        <h2>{L.openingDecision}</h2>
        <p>{L.openingDecisionBody}</p>
        <RouteLink to="/options" primary>
          Compare the production responses
        </RouteLink>
      </Card>
    </>
  );
}
export function Options() {
  const { state, result: r, dispatch } = useWorkspace();
  const options = [calculate("S1"), calculate("S2"), calculate("S3")];
  const [s1, s2, s3] = options;
  const metrics = [
    [
      "Additional repeat commitment",
      (r: typeof s1) => money(r.repeatCommitment),
    ],
    ["Total production payments", (r: typeof s1) => money(r.totalPayments)],
    ["W12 unmet requirement", (r: typeof s1) => `${number(r.backlog)} packs`],
    ["W12 physical stock", (r: typeof s1) => `${number(r.physical)} packs`],
    ["W12 inventory value", (r: typeof s1) => money(r.inventoryValue)],
    ["Storage proxy", (r: typeof s1) => money(r.storageProxy, 2)],
  ] as const;
  return (
    <>
      <PageHeader
        eyebrow="OPTIONS & CASH"
        title={L.optionsTitle}
        sub={L.optionsSub}
      />
      <p className="small">{L.window}</p>
      <section className="comparison-section">
        <div className="section-heading">
          <h2>Three production responses</h2>
          <span className="badge">Central demand · W5 opening</span>
        </div>
        <div className="option-cards">
          {options.map((o, i) => (
            <Card
              key={o.scenario.id}
              className={`option-card ${state.caseId === o.scenario.id ? "inspected" : ""}`}
            >
              <span className="eyebrow">{o.scenario.id} · CENTRAL CASE</span>
              <h3>
                {
                  [
                    "Keep production unchanged",
                    "Repeat Chocolate only",
                    "Repeat all three",
                  ][i]
                }
              </h3>
              <div className="option-status">
                {i === 1 ? (
                  state.runs ? (
                    <span>{L.worthReviewing}</span>
                  ) : (
                    <b>{D.unavailable}</b>
                  )
                ) : (
                  <span>
                    {i === 0
                      ? "No additional production"
                      : "One repeat of each flavour"}
                  </span>
                )}
              </div>
              <dl>
                {metrics.map(([label, format]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{i === 1 && !state.runs ? "—" : format(o)}</dd>
                  </div>
                ))}
              </dl>
              <button
                className={
                  state.caseId === o.scenario.id ? "selected-button" : ""
                }
                disabled={i === 1 && !state.runs}
                onClick={() => dispatch({ type: "case", id: o.scenario.id })}
              >
                {state.caseId === o.scenario.id
                  ? "Inspecting this case"
                  : "Inspect this case"}
              </button>
            </Card>
          ))}
        </div>
      </section>
      <Card className="interpretation">
        <div className="decision-kicker">
          <span className="eyebrow">THE TRADE-OFF</span>
          <span>DEC-02 · For discussion</span>
        </div>
        {state.runs ? (
          <>
            <h2>{L.comparisonHeading}</h2>
            <p>
              {L.comparisonBody
                .replace(
                  "CAD 10,320",
                  money(s3.repeatCommitment - s2.repeatCommitment),
                )
                .replace("2,400", number(s3.physical - s2.physical))}
            </p>
            <p className="small">{L.comparisonQualification}</p>
            <p className="small">
              Storage proxy difference, S3 versus S2:{" "}
              {money(s3.storageProxy - s2.storageProxy, 2)}. A comparison, not
              an invoice or realised saving.
            </p>
          </>
        ) : (
          <>
            <h2>{L.infeasibleTitle}</h2>
            <p>
              {D.noRunsOptions
                .replace("{commitment}", money(s3.repeatCommitment))
                .replace("{physical}", number(s3.physical))}
            </p>
            <p>{L.infeasible}</p>
          </>
        )}
        <RunsControl />
      </Card>
      {!state.runs && (
        <Card className="infeasible-explanation">
          <h3>{D.infeasibleLabel}</h3>
          <p>
            S2 · Chocolate-only repeat: {money(s2.repeatCommitment)} modelled
            repeat commitment; {number(s2.physical)} physical packs and{" "}
            {number(s2.backlog)} packs of unmet requirement at W12. This option
            is unavailable under the current assumption.
          </p>
        </Card>
      )}
      <Card>
        <div className="section-heading">
          <h2>Production payment timing</h2>
          <span className="chart-context">
            Central demand · W5 opening
            {!state.runs ? " · S2 excluded: infeasible" : ""}
          </span>
        </div>
        <PaymentChart results={state.runs ? options : [s1, s3]} />
        <p className="small">{L.paymentCaption}</p>
      </Card>
      <Card>
        <h2>What happens under different conditions?</h2>
        <Note>
          <strong>{L.stress}</strong>
        </Note>
        <div className="stress-cases">
          {scenarios.slice(4).map((s) => {
            const result = calculate(s.id);
            const copy = activeCopy(result);
            return (
              <button
                key={s.id}
                aria-pressed={state.caseId === s.id}
                onClick={() => dispatch({ type: "case", id: s.id })}
              >
                <span>
                  <b>
                    {s.id} · {s.name}
                  </b>
                  <small>{copy.explanation}</small>
                </span>
                <span>{state.caseId === s.id ? "Inspecting" : "Inspect"}</span>
              </button>
            );
          })}
        </div>
        <p>
          <b>Active case: {r.scenario.name}.</b> {activeCopy(r).explanation}
        </p>
        <p className="small">
          The primary comparison above remains S1/S2/S3 under central demand and
          W5 opening.
        </p>
        <Table
          headers={[
            "Flavour",
            "Net stock position at W12",
            "Physical closing stock",
            "Unmet requirement",
          ]}
          rows={r.ending.map((row) => [
            fixture.products.find((p) => p.id === row.sku)!.short,
            number(row.net),
            number(row.physical),
            number(row.backlog),
          ])}
        />
      </Card>
      <Note>
        <h3>{L.horizon}</h3>
        <p>{L.horizonBody}</p>
      </Note>
    </>
  );
}
