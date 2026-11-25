// Literal interface copy, PDF pages 34–37, 42–66. Delimiting quotation marks removed.
export const literal = {
  snapshot: "Planning snapshot · 30 Nov 2026",
  units: "12-week view · CAD · Retail packs",
  disclosure:
    "Illustrative planning example. Operating numbers and selected production flavours are synthetic.",
  illustrative:
    "Illustrative operating data. Not Fromage’s actual sales, costs or production plan.",
  updated: "Example updated. Stock, timing and cash now reflect this case.",
  reset: "Reset to proposed expansion",
  failure:
    "The example could not be updated. Reset to the baseline to continue.",
  loading: "Updating the example…",
  backlog:
    "Demand the example cannot fulfil by this point. It is carried forward in the model; it is not an estimate of permanently lost sales.",
  buffer:
    "Two weeks of recurring requirements in this example. This is an illustrative policy, not Fromage’s confirmed target.",
  forecast:
    "A projection based on the illustrative shipment history. It is not a confirmed customer order.",
  unavailableData: "Not supplied in this example.",
  unmodelled:
    "This flavour is part of the public range but is not included in the operating scenario.",
  briefTitle: "Your next production decision",
  briefSub:
    "What the minimum run could support, where attention is needed and what to check before committing again.",
  context: "Prepared example · Awaiting business context",
  opening:
    "The minimum sets the starting quantity. The next decision depends on what happens after it.",
  openingSub:
    "This example connects existing retail requirements, a possible new-store opening and the timing of another production run.",
  recommendation:
    "Review a Chocolate-only repeat before repeating the whole range.",
  repeatBody:
    "With the proposed opening included, Chocolate falls below the example’s planning buffer in W9 and develops unmet requirements in W11. A 1,200-pack receipt in W9 covers the modelled requirement through W12.",
  financial:
    "That repeat commits CAD 4,800. Repeating all three flavours commits CAD 15,120.",
  qualification:
    "Can the manufacturer run flavours separately, and is the six-week lead time realistic?",
  expansionHeading: "Check the opening against existing retail requirements.",
  expansionBody:
    "The proposed ten-store opening adds 864 packs over the twelve-week example. Moving the opening later reduces the requirement inside this window, but does not remove Chocolate’s gap.",
  evidenceHeading: "Keep the forecast open to challenge.",
  evidenceBody:
    "The example uses shipments to retailers. Retail sell-through and Fromage’s actual manufacturing terms have not been supplied.",
  maintained: "Maintained analysis. Decisions owned by your team.",
  maintainedBody:
    "ScaleSight would update the analysis, investigate changes and prepare recommendations. You and Nuala would add business context and approve the next steps.",
  caption: "This demonstration is illustrative; no client data is connected.",
  demandTitle: "What is moving—and what is available?",
  demandSub:
    "Inspect the shipment history, the forecast and the stock position behind the brief.",
  filterNote:
    "Forward requirements are modelled for existing retail as a group.",
  groupForecast:
    "Forward forecast maintained at existing-retail group level in this example.",
  historyChart: "Retail shipments and the forward baseline",
  forecastCalculation: "How this forecast was formed",
  sensitivity:
    "The sensitivity cases test slower or stronger existing-account requirements. They do not assign probabilities.",
  reservations:
    "Reservations sit within physical stock. They are not deducted twice from the projection.",
  stockChart: "When could each flavour need attention?",
  stockInterpretation:
    "Chocolate’s projected requirement is higher than the other flavours, but the first run is equal across the three. The same production quantity therefore creates different stock coverage.",
  limitation:
    "This illustrates a planning question. It does not establish Fromage’s actual flavour ranking.",
  catalogue: "Public range and example selection",
  selected: "Selected for illustration",
  catalogueOnly: "Public catalogue · Operating data not modelled",
  productionTitle: "Plan around the minimum",
  productionSub:
    "Connect the manufacturing constraint with stock coverage, booking dates and payment commitments.",
  manufacturing: "Manufacturing terms are illustrative and need confirmation.",
  initialRun: "The starting commitment",
  initialCaption:
    "Landed production cost in this example. Ongoing storage and tax are excluded.",
  timeline: "The dates behind the decision",
  selective: "A selective repeat to review",
  selectiveBody:
    "Under the central case, this receipt covers Chocolate’s modelled requirement through W12. It does not establish the best long-term quantity beyond this window.",
  runsQuestion: "Can flavours be repeated separately?",
  infeasibleTitle: "Chocolate-only repeat unavailable under this assumption",
  infeasible:
    "The selective option is not feasible if the manufacturer requires all three flavours in the repeat. Review the full-run exposure and confirm what alternatives can actually be negotiated.",
  delay: "Test a later first receipt",
  delayBody:
    "The later receipt clears the illustrative backlog in W5. The end-of-horizon totals match the original case, but the service path is different.",
  repeatPayment:
    "A W9 Chocolate repeat places a CAD 2,400 deposit in W3 and a CAD 2,400 balance in W9.",
  storage:
    "The illustrated options remain within the assumed 6,000-pack capacity. Capacity and usable shelf life need confirmation.",
  expansionTitle: "What could the next opening require?",
  expansionSub:
    "Separate the stock needed to fill new shelves from the replenishment that may follow.",
  prospective: "Prospective · Not a confirmed order",
  openingReset:
    "Opening case selected. Earlier scenario changes have been reset.",
  expansionCaption:
    "Recurring shipments begin one week after the illustrative opening. These are scenario assumptions, not measured consumer purchase rates.",
  requirementChart: "The requirement the stock would need to cover",
  delayedOpening:
    "A later opening reduces the requirement inside this twelve-week window. It does not eliminate Chocolate’s need for another planning response.",
  openingDecision: "What to establish before promising an opening",
  openingDecisionBody:
    "Confirm the opening quantity, replenishment expectations, delivery timing and production availability. Then assess them alongside existing-account requirements.",
  optionsTitle: "Compare before committing",
  optionsSub:
    "Review availability, stock remaining and production payments together.",
  window: "Comparisons cover this twelve-week example.",
  worthReviewing: "Worth reviewing if separate runs are available",
  comparisonHeading:
    "Both repeat options cover the central case through W12. They commit different amounts of cash.",
  comparisonBody:
    "The Chocolate-only option commits CAD 10,320 less than repeating all three flavours and leaves 2,400 fewer packs at the end of the example.",
  comparisonQualification:
    "This is a modelled difference between options, not realised savings. The selective option depends on manufacturing feasibility.",
  paymentCaption:
    "Production payments only. Customer receipts, available cash and financing are not supplied.",
  stress: "Stress cases test the unchanged production plan.",
  horizon: "The horizon is a boundary, not the end of the business.",
  horizonBody:
    "Vanilla falls below the example’s planning buffer in W11 under the central selective-repeat case. Extend the planning window before concluding that no further run is needed.",
  sourcesIntro:
    "Public information provides context. Operating quantities, costs and scenarios were created to demonstrate the planning approach.",
  thread: "Fiona’s replies supplied by the outreach team.",
  reviewTitle: "What we would review together",
  reviewIntro: "The analysis needs the context only your team can provide.",
  reviewQuestions: [
    "Which three flavours are selected?",
    "Does the minimum apply separately to each flavour?",
    "Can flavours be repeated independently?",
    "What production dates and lead times are realistic?",
    "Which retail openings are confirmed?",
    "What recent sales or shipment records are available?",
  ],
  serviceTitle: "How ScaleSight would maintain the work",
  serviceBody:
    "We would update the agreed data, investigate changes and prepare a weekly decision brief with quantities, timing and cash implications. Every two weeks, we would review the business context with your team and adapt the analysis as priorities change.",
  ownership:
    "Your team approves commitments and executes through its existing arrangements.",
  reviewStatus: "Demonstration only · No ongoing client review has taken place",
  aboutTitle: "Built around the decision in front of you",
  aboutBody:
    "This example starts with a minimum-led production run. Another commitment could require different analysis: a new account, a flavour change, a production delay or a different manufacturing arrangement.",
  aboutService:
    "The workspace is how we present the work. ScaleSight’s service is maintaining the analysis and preparing recommendations around your business.",
  aboutDisclosure:
    "Fromage’s public products and business context are used for illustration. This is not an approved Fromage plan, a client case study or evidence of achieved results.",
} as const;
// PDF 12.A, p.39 — canonical case copy; templates are tested against these literal values.
export const caseCopy = {
  S0: {
    first: "None through W12",
    support: "No modelled unmet requirement within this window.",
    explanation:
      "Existing retail is covered through W12 in this example. Chocolate ends with 120 packs; the next period still needs review.",
  },
  S1: {
    first: "Chocolate · W11",
    support: "60 packs unfulfilled by 8 Feb.",
    explanation:
      "Chocolate has 60 packs unfulfilled in W11 and 210 outstanding at W12. Review the separate-run assumption before considering the proposed repeat.",
  },
  S2: {
    first: "None through W12",
    support: "No modelled unmet requirement within this window.",
    explanation:
      "The Chocolate repeat covers the modelled requirement through W12. Vanilla still falls below its planning buffer in W11.",
  },
  S3: {
    first: "None through W12",
    support: "No modelled unmet requirement within this window.",
    explanation:
      "Repeating all three covers the central case through W12 and leaves 3,906 physical packs. This commits CAD 10,320 more than the Chocolate-only option.",
  },
  S4: {
    first: "None through W12",
    support: "No modelled unmet requirement within this window.",
    explanation:
      "Slower existing demand produces no backlog through W12 without a repeat. Chocolate ends with 78 packs.",
  },
  S5: {
    first: "Chocolate · W10",
    support: "150 Chocolate packs unfulfilled by 1 Feb.",
    explanation:
      "Stronger existing demand leaves 612 packs outstanding at W12: 498 Chocolate and 114 Vanilla. This case contains no repeat.",
  },
  S6: {
    first: "Three flavours · W4",
    support:
      "120 Chocolate, 90 Vanilla and 60 Strawberry packs temporarily unfulfilled.",
    explanation:
      "The later first receipt leaves 270 packs temporarily unfulfilled in W4. W5 receipt clears that backlog; Chocolate ends W12 with 210 packs outstanding.",
  },
  S7: {
    first: "Chocolate · W12",
    support: "90 Chocolate packs unfulfilled by 15 Feb.",
    explanation:
      "Moving the opening to W9 leaves 90 Chocolate packs outstanding at W12. A later opening does not remove the gap.",
  },
} as const;
