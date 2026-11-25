import { scenarios, type CaseId, type Sku, fixture } from "../data/fixture";
export type State = {
  caseId: CaseId;
  runs: boolean;
  sku: Sku;
  account: string;
};
export function parseState(search: string): State {
  const p = new URLSearchParams(search);
  return {
    caseId: scenarios.find((s) => s.id === p.get("case"))?.id ?? "S1",
    runs: p.get("runs") !== "no",
    sku: fixture.products.find((s) => s.id === p.get("sku"))?.id ?? "FR-MC",
    account: "all",
  };
}
export type Action =
  | { type: "case" | "opening"; id: CaseId }
  | { type: "runs"; value: boolean }
  | { type: "sku"; value: Sku }
  | { type: "account"; value: string }
  | { type: "reset" };
export function transition(state: State, action: Action): State {
  switch (action.type) {
    case "case":
    case "opening":
      return { ...state, caseId: action.id };
    case "runs":
      return { ...state, runs: action.value };
    case "sku":
      return { ...state, sku: action.value };
    case "account":
      return { ...state, account: action.value };
    case "reset":
      return { ...state, caseId: "S1", runs: true };
  }
}
export function stateSearch(state: State) {
  return `?${new URLSearchParams({ case: state.caseId, runs: state.runs ? "yes" : "no", sku: state.sku })}`;
}
