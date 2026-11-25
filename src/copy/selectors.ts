import { calculate, type Result } from "../engine/model";
import { number, date, money } from "../engine/format";
import { fixture } from "../data/fixture";
import { literal, caseCopy } from "./literal";
import { drafted } from "./drafted";
export function activeCopy(r: Result) {
  const id = r.scenario.id,
    mc = r.ending[0],
    vb = r.ending[1],
    first = r.firstUnmet;
  const firstWeek = first?.week;
  const firstRows = r.rows.filter(
    (row) => row.week === firstWeek && row.backlog > 0,
  );
  const firstLabel = first
    ? (firstRows.length > 1
        ? "Three flavours"
        : fixture.products.find((p) => p.id === first.sku)!.short) +
      ` · W${first.week}`
    : "None through W12";
  let explanation: string = caseCopy[id].explanation;
  switch (id) {
    case "S0":
      explanation = `Existing retail is covered through W12 in this example. Chocolate ends with ${number(mc.physical)} packs; the next period still needs review.`;
      break;
    case "S1":
      explanation = `Chocolate has ${number(first!.backlog)} packs unfulfilled in W${first!.week} and ${number(mc.backlog)} outstanding at W12. Review the separate-run assumption before considering the proposed repeat.`;
      break;
    case "S3":
      explanation = `Repeating all three covers the central case through W12 and leaves ${number(r.physical)} physical packs. This commits ${money(r.totalPayments - calculate("S2").totalPayments)} more than the Chocolate-only option.`;
      break;
    case "S4":
      explanation = `Slower existing demand produces no backlog through W12 without a repeat. Chocolate ends with ${number(mc.physical)} packs.`;
      break;
    case "S5":
      explanation = `Stronger existing demand leaves ${number(r.backlog)} packs outstanding at W12: ${number(mc.backlog)} Chocolate and ${number(vb.backlog)} Vanilla. This case contains no repeat.`;
      break;
    case "S6":
      explanation = `The later first receipt leaves ${number(firstRows.reduce((n, x) => n + x.backlog, 0))} packs temporarily unfulfilled in W${first!.week}. W${r.scenario.initialWeek} receipt clears that backlog; Chocolate ends W12 with ${number(mc.backlog)} packs outstanding.`;
      break;
    case "S7":
      explanation = `Moving the opening to W${r.scenario.expansion} leaves ${number(mc.backlog)} Chocolate packs outstanding at W12. A later opening does not remove the gap.`;
      break;
  }
  const support = first
    ? id === "S6"
      ? firstRows
          .map(
            (row, i) => `${number(row.backlog)} ${fixture.products[i].short}`,
          )
          .join(", ")
          .replace(/, ([^,]+)$/, " and $1") + " packs temporarily unfulfilled."
      : `${number(first.backlog)}${id === "S1" ? "" : " Chocolate"} packs unfulfilled by ${date(fixture.weeks[first.week - 1])}.`
    : caseCopy[id].support;
  return {
    first: firstLabel,
    support,
    explanation,
    heading:
      id === "S1"
        ? literal.recommendation
        : id === "S2"
          ? caseCopy.S2.explanation.split(". ")[0] + "."
          : drafted.headings[id],
    expansion:
      id === "S0"
        ? drafted.noExpansion
        : id === "S7"
          ? drafted.delayedExpansion.replace(
              "{packs}",
              number(r.expansionRequirement),
            )
          : literal.expansionBody.replace(
              "864",
              number(r.expansionRequirement),
            ),
  };
}
