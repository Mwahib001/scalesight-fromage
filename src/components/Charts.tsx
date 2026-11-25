import { type ReactNode } from "react";
import { number, money, week } from "../engine/format";
import { type Result, type Row, sum } from "../engine/model";
import { fixture } from "../data/fixture";
import { Table } from "./ui";
export type Series = {
  label: string;
  values: number[];
  colour: string;
  dashed?: boolean;
};
export function LineChart({
  series,
  labels,
  caption,
  receipts = [],
  historyCount = 0,
  tooltips,
}: {
  series: Series[];
  labels: string[];
  caption: string;
  receipts?: number[];
  historyCount?: number;
  tooltips?: string[];
}) {
  const width = 920,
    height = 285,
    left = 48,
    right = 178,
    top = 30,
    bottom = 42,
    plot = width - left - right;
  const max = Math.max(1, ...series.flatMap((s) => s.values)) * 1.12;
  const x = (i: number) => left + (i * plot) / (labels.length - 1),
    y = (n: number) => height - bottom - (n / max) * (height - top - bottom);
  return (
    <div
      className="chart-scroll"
      tabIndex={0}
      role="region"
      aria-label="Scrollable chart"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="line-chart"
        role="img"
        aria-label={caption}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line
              x1={left}
              x2={width - right}
              y1={y(max * v)}
              y2={y(max * v)}
              stroke="#E3DFD3"
            />
            <text x={left - 9} y={y(max * v) + 4} textAnchor="end">
              {number(max * v)}
            </text>
          </g>
        ))}
        {labels.map((label, i) => (
          <text key={i} x={x(i)} y={height - 15} textAnchor="middle">
            {label}
          </text>
        ))}
        {historyCount > 0 && (
          <g>
            <line
              x1={x(historyCount) - 14}
              x2={x(historyCount) - 14}
              y1={top}
              y2={height - bottom}
              stroke="#635F59"
              strokeDasharray="4 4"
            />
            <text x={x(historyCount)} y={16}>
              Forecast begins
            </text>
          </g>
        )}
        {series.map((s, si) => (
          <g key={s.label}>
            {historyCount && si === 0 ? (
              s.values.slice(0, historyCount).map((n, i) => (
                <rect
                  key={i}
                  x={x(i) - 9}
                  y={y(n)}
                  width="18"
                  height={y(0) - y(n)}
                  rx="3"
                  fill={s.colour}
                >
                  <title>
                    {tooltips?.[i] ?? `${labels[i]} · ${s.label}: ${number(n)}`}
                  </title>
                </rect>
              ))
            ) : (
              <>
                <polyline
                  points={s.values
                    .map((n, i) =>
                      historyCount && i < historyCount
                        ? null
                        : `${x(i)},${y(n)}`,
                    )
                    .filter(Boolean)
                    .join(" ")}
                  fill="none"
                  stroke={s.colour}
                  strokeWidth="2.5"
                  strokeDasharray={s.dashed ? "6 5" : undefined}
                />
                {s.values.map((n, i) =>
                  historyCount && i < historyCount ? null : (
                    <circle
                      key={i}
                      cx={x(i)}
                      cy={y(n)}
                      r={s.dashed ? 2.5 : 3.5}
                      fill="white"
                      stroke={s.colour}
                      strokeWidth="2"
                    >
                      <title>
                        {tooltips?.[i] ??
                          `${labels[i]} · ${s.label}: ${number(n)}`}
                      </title>
                    </circle>
                  ),
                )}
              </>
            )}
            <text x={width - right + 14} y={34 + si * 23} fill={s.colour}>
              {s.dashed ? "┄" : "━"} {s.label}
            </text>
          </g>
        ))}
        {receipts.map((i) => (
          <g key={i}>
            <line
              x1={x(i)}
              x2={x(i)}
              y1={top}
              y2={height - bottom}
              stroke="#825600"
              strokeDasharray="2 4"
            />
            <text x={x(i) + 5} y={top + 12}>
              ◆ Receipt
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
export function BacklogChart({
  rows,
  caption,
}: {
  rows: Row[];
  caption: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.backlog));
  return (
    <div className="backlog-strip" role="img" aria-label={caption}>
      <span>Unmet requirement</span>
      <div className="backlog-bars">
        {rows.map((r) => (
          <div key={r.week}>
            <b
              style={{
                height: r.backlog ? `${14 + (36 * r.backlog) / max}px` : "2px",
              }}
            />
            <small>{r.backlog ? number(r.backlog) : "—"}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ChartTable({ children }: { children: ReactNode }) {
  return (
    <details className="chart-table">
      <summary>View as table</summary>
      {children}
    </details>
  );
}
export function StackedBars({
  labels,
  series,
  caption,
  format = number,
}: {
  labels: string[];
  series: Series[];
  caption: string;
  format?: (n: number) => string;
}) {
  const max = Math.max(
    1,
    ...labels.map((_, i) => sum(series.map((s) => s.values[i]))),
  );
  return (
    <div
      className="chart-scroll"
      tabIndex={0}
      role="region"
      aria-label="Scrollable chart"
    >
      <div className="stack-chart" role="img" aria-label={caption}>
        <div className="stack-legend">
          {series.map((s, i) => (
            <span key={s.label}>
              <i
                className={`pattern-${i}`}
                style={{ backgroundColor: s.colour }}
              />
              {s.label}
            </span>
          ))}
        </div>
        <div className="stacks">
          {labels.map((l, i) => (
            <div className="bar-group" key={l}>
              <strong>{format(sum(series.map((s) => s.values[i])))}</strong>
              <div
                className="stack"
                style={{
                  height: `${(sum(series.map((s) => s.values[i])) / max) * 170}px`,
                }}
              >
                {series.map((s, j) => (
                  <div
                    key={s.label}
                    className={`pattern-${j}`}
                    style={{ backgroundColor: s.colour, flex: s.values[i] }}
                  >
                    <title>
                      {l} · {s.label}: {format(s.values[i])}
                    </title>
                  </div>
                ))}
              </div>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export function PaymentChart({ results }: { results: Result[] }) {
  const weeks = [1, 3, 9];
  const max = Math.max(
    ...results.flatMap((r) =>
      weeks.map((w) =>
        sum(r.payments.filter((p) => p.week === w).map((p) => p.cents)),
      ),
    ),
  );
  return (
    <>
      <div
        className="chart-scroll"
        tabIndex={0}
        role="region"
        aria-label="Scrollable chart"
      >
        <div
          className="payment-chart"
          role="img"
          aria-label="Central demand · W5 opening. Production payments by option and week; deposits and balances shown separately."
        >
          <div className="stack-legend">
            <span>
              <i style={{ backgroundColor: "#CE0080" }} />
              Deposit
            </span>
            <span>
              <i className="pattern-1" style={{ backgroundColor: "#705739" }} />
              Balance
            </span>
          </div>
          <div className="payment-groups">
            {weeks.map((w) => (
              <div className="payment-week" key={w}>
                <div className="payment-options">
                  {results.map((r) => {
                    const ps = r.payments.filter((p) => p.week === w),
                      total = sum(ps.map((p) => p.cents));
                    return (
                      <div className="bar-group" key={r.scenario.id}>
                        <strong>{money(total)}</strong>
                        <div
                          className="stack"
                          style={{ height: `${(total / max) * 170}px` }}
                        >
                          {ps.map((p) => (
                            <div
                              key={p.id}
                              className={
                                p.kind.includes("balance") ? "pattern-1" : ""
                              }
                              style={{
                                flex: p.cents,
                                backgroundColor: p.kind.includes("balance")
                                  ? "#705739"
                                  : "#CE0080",
                              }}
                            >
                              <title>
                                {r.scenario.name} · {p.kind}: {money(p.cents)}
                              </title>
                            </div>
                          ))}
                        </div>
                        <span>{r.scenario.id}</span>
                      </div>
                    );
                  })}
                </div>
                <b>{week(w)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ChartTable>
        <Table
          headers={["Option", "Week", "Payment", "CAD"]}
          rows={results.flatMap((r) =>
            r.payments.map((p) => [
              r.scenario.name,
              week(p.week),
              p.kind,
              money(p.cents).replace("CAD ", ""),
            ]),
          )}
        />
      </ChartTable>
    </>
  );
}
export const palette = {
  existing: "#705739",
  fill: "#CE0080",
  recurring: "#637357",
};
export function WeeklyRequirement({ result }: { result: Result }) {
  const series = [
    {
      label: "Existing retail",
      values: fixture.weeks.map((_, i) =>
        sum(result.rows.filter((r) => r.week === i + 1).map((r) => r.existing)),
      ),
      colour: palette.existing,
    },
    {
      label: "New-store opening fill",
      values: fixture.weeks.map((_, i) =>
        sum(result.rows.filter((r) => r.week === i + 1).map((r) => r.fill)),
      ),
      colour: palette.fill,
    },
    {
      label: "New-store recurring requirement",
      values: fixture.weeks.map((_, i) =>
        sum(
          result.rows.filter((r) => r.week === i + 1).map((r) => r.recurring),
        ),
      ),
      colour: palette.recurring,
    },
  ];
  return (
    <>
      <StackedBars
        labels={fixture.weeks.map((_, i) => `W${i + 1}`)}
        series={series}
        caption={`Weekly requirement · ${result.scenario.name}`}
      />
      <ChartTable>
        <Table
          headers={["Week", ...series.map((s) => s.label), "Total"]}
          rows={fixture.weeks.map((_, i) => [
            week(i + 1),
            ...series.map((s) => number(s.values[i])),
            number(sum(series.map((s) => s.values[i]))),
          ])}
        />
      </ChartTable>
    </>
  );
}
