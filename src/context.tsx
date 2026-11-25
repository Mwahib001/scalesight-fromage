import { createContext, useContext, type Dispatch } from "react";
import { type State, type Action } from "./engine/state";
import { type Result } from "./engine/model";
export type Drawer = "sources" | "review" | "about" | "catalogue" | null;
export const Workspace = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
  result: Result;
  openDrawer: (name: Drawer) => void;
}>(null!);
export const useWorkspace = () => useContext(Workspace);
