import { StrictMode, useEffect, useReducer, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import { scenarios } from "./data/fixture";
import {
  parseState,
  stateSearch,
  transition,
  type Action,
} from "./engine/state";
import { safeCalculate } from "./engine/model";
import { Workspace, type Drawer } from "./context";
import { literal as L } from "./copy/literal";
import { drafted as D } from "./copy/drafted";
import {
  Brief,
  Demand,
  Production,
  Expansion,
  Options,
} from "./components/Pages";
import { Drawers } from "./components/Drawers";
import { Icon, Note } from "./components/ui";
import "./style.css";
const nav = [
  ["/brief", "Planning Brief", "brief"],
  ["/demand-stock", "Demand & Stock", "demand"],
  ["/production", "Production Plan", "production"],
  ["/expansion", "Retail Expansion", "expansion"],
  ["/options", "Options & Cash", "options"],
];
function App() {
  const location = useLocation(),
    navigate = useNavigate();
  const stateFromUrl = parseState(location.search);
  const [state, rawDispatch] = useReducer(transition, stateFromUrl);
  const [drawer, setDrawer] = useState<Drawer>(null),
    [menu, setMenu] = useState(false),
    [feedback, setFeedback] = useState("");
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 768px)").matches,
  );
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(location.pathname);
  const actual = { ...state, ...stateFromUrl, account: state.account };
  const dispatch = (action: Action) => {
    const next = transition(actual, action);
    rawDispatch(action);
    navigate({ pathname: location.pathname, search: stateSearch(next) });
    setFeedback(
      action.type === "opening"
        ? L.openingReset
        : action.type === "case" || action.type === "reset"
          ? L.updated
          : action.type === "runs"
            ? next.runs
              ? "Separate flavour runs assumed available."
              : L.infeasibleTitle
            : "",
    );
  };
  const calculation = safeCalculate(actual.caseId);
  useEffect(() => {
    const page =
      nav.find((n) => n[0] === location.pathname)?.[1] ?? "Planning Brief";
    document.title = `${page} · Fromage planning workspace · Prepared by ScaleSight`;
    setMenu(false);
    if (previousPath.current !== location.pathname) {
      window.scrollTo(0, 0);
      document
        .querySelector<HTMLElement>("main h1")
        ?.focus({ preventScroll: true });
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px)");
    const onChange = () => {
      setMobile(query.matches);
      if (!query.matches) setMenu(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    if (!menu || !mobile) return;
    const openedPath = window.location.pathname;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar.current?.querySelector<HTMLButtonElement>(".nav-close")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "Escape") setMenu(false);
      if (e.key === "Tab") {
        const items = Array.from(
          sidebar.current?.querySelectorAll<HTMLElement>("a, button") ?? [],
        ).filter((item) => item.getClientRects().length > 0);
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = oldOverflow;
      if (window.location.pathname === openedPath)
        menuButton.current?.focus({ preventScroll: true });
    };
  }, [menu, mobile]);
  const activeName = scenarios.find((s) => s.id === actual.caseId)!.name;
  return (
    <Workspace.Provider
      value={{
        state: actual,
        dispatch,
        result: calculation.result!,
        openDrawer: setDrawer,
      }}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside
        ref={sidebar}
        id="planning-navigation"
        className={`sidebar ${menu ? "menu-open" : ""}`}
        role={mobile && menu ? "dialog" : undefined}
        aria-modal={mobile && menu ? true : undefined}
        aria-label={mobile && menu ? "Planning navigation" : undefined}
        inert={mobile && !menu}
      >
        <div className="mobile-nav-header">
          <button
            className="nav-close"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="brand">
          <b>Fromage</b>
          <span>Planning workspace</span>
          <small>Prepared by ScaleSight</small>
        </div>
        <div className="nav-heading">THE PLANNING WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map(([path, label, icon]) => (
            <NavLink
              key={path}
              aria-label={label}
              title={label}
              to={path + stateSearch(actual)}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            title="This week’s review"
            aria-label="This week’s review"
            onClick={() => {
              setDrawer("review");
            }}
          >
            <Icon name="clock" />
            <span>This week’s review</span>
          </button>
          <button
            title="Sources & assumptions"
            aria-label="Sources & assumptions"
            onClick={() => {
              setDrawer("sources");
            }}
          >
            <Icon name="book" />
            <span>Sources & assumptions</span>
          </button>
          <button
            title="About this example"
            aria-label="About this example"
            onClick={() => {
              setDrawer("about");
            }}
          >
            <Icon name="info" />
            <span>About this example</span>
          </button>
          <div className="sidebar-caption">
            PRIVATE ILLUSTRATIVE CONCEPT
            <br />
            <span>Analysis for discussion.</span>
          </div>
        </div>
      </aside>
      <div
        className="workspace"
        inert={mobile && menu}
        aria-hidden={mobile && menu ? true : undefined}
      >
        <header className="topbar">
          <button
            ref={menuButton}
            className="menu-button"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            aria-controls="planning-navigation"
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? "close" : "menu"} />
          </button>
          <span>
            <Icon name="clock" size={16} />
            {L.snapshot}
          </span>
          <span>{L.units}</span>
        </header>
        <div className="disclosure">
          <Icon name="info" size={16} />
          <span>{L.disclosure}</span>
          <button onClick={() => setDrawer("sources")}>
            What’s illustrative?
          </button>
        </div>
        <main id="main">
          <div className="case-toolbar">
            <label>
              Inspect a scenario
              <select
                aria-label="Scenario preset"
                value={actual.caseId}
                onChange={(e) =>
                  dispatch({
                    type: "case",
                    id: e.target.value as typeof actual.caseId,
                  })
                }
              >
                {scenarios.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    disabled={
                      s.id === "S2" && !actual.runs && actual.caseId !== "S2"
                    }
                  >
                    {s.id} · {s.name}
                    {s.id === "S2" && !actual.runs ? " · Infeasible" : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="reset-button"
              onClick={() => dispatch({ type: "reset" })}
            >
              <span aria-hidden="true">↺</span>
              {L.reset}
            </button>
          </div>
          <div className="case-context">
            <span>
              <b>{actual.caseId === "S1" ? "Baseline plan" : "Exploring"}</b> ·{" "}
              {actual.caseId} · {activeName}
            </span>
            <span className="snapshot-chip">Illustrative snapshot</span>
          </div>
          <div
            role="status"
            aria-live="polite"
            className={feedback ? "feedback" : "sr-only"}
          >
            {feedback}
          </div>
          {!actual.runs && actual.caseId === "S2" && (
            <Note risk>
              <strong>{D.infeasibleLabel}</strong>
              <p>{L.infeasible}</p>
            </Note>
          )}
          {calculation.error ? (
            <Note risk>
              <h1>{L.failure}</h1>
              <button onClick={() => dispatch({ type: "reset" })}>
                {L.reset}
              </button>
            </Note>
          ) : (
            <Routes>
              <Route path="/brief" element={<Brief />} />
              <Route path="/demand-stock" element={<Demand />} />
              <Route path="/production" element={<Production />} />
              <Route path="/expansion" element={<Expansion />} />
              <Route path="/options" element={<Options />} />
              <Route
                path="*"
                element={
                  <Navigate replace to={"/brief" + stateSearch(actual)} />
                }
              />
            </Routes>
          )}
          <footer className="page-footer">
            <span>Fromage planning workspace</span>
            <span>Prepared by ScaleSight · {L.illustrative}</span>
          </footer>
        </main>
      </div>
      <Drawers name={drawer} close={() => setDrawer(null)} />
    </Workspace.Provider>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
