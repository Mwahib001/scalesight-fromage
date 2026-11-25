// Authoritative task addendum anchors; agent-authored variants require Arman’s copy approval.
export const drafted = {
  status: "DRAFT_NEEDS_APPROVAL",
  headings: {
    S0: "Existing retail alone does not create a modelled shortage.",
    S3: "Repeating all three covers the central case through W12.",
    S4: "Slower existing demand does not create a modelled shortage.",
    S5: "Stronger existing demand creates unmet requirements without a repeat.",
    S6: "A later first receipt creates a temporary service gap.",
    S7: "A later opening does not remove Chocolate’s gap.",
  },
  unavailable: "Unavailable under this assumption",
  infeasibleLabel: "Comparison only · infeasible under this assumption",
  noRunsHeading:
    "A Chocolate-only repeat is unavailable under this assumption.",
  noRunsComparison:
    "Repeating all three flavours would commit {commitment} — confirm what the manufacturer can actually offer.",
  noRunsOptions:
    "Under this assumption the Chocolate-only option is not available. Repeating all three commits {commitment} and leaves {physical} packs at the end of the example. Confirm what the manufacturer can actually offer.",
  noExpansion:
    "This case excludes the new-store opening, so it adds no packs to the requirement.",
  delayedExpansion:
    "The delayed opening adds {packs} packs inside the twelve-week example. It does not remove Chocolate’s gap.",
  centralProposal: "Central-case proposal for comparison",
  untested:
    "This case has no separately tested Chocolate-repeat response under its changed conditions.",
} as const;
