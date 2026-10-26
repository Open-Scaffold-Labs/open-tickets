"use strict";
const { BOOKS_V33_ENGINE_LABEL, BOOKS_V33_VERSION, evaluateVerticalBooksV33Suite } = require("./booksV33VerticalEngine.js");
const BASE = {
  "ok": true,
  "vertical": "open-tickets",
  "appName": "Open Tickets",
  "appId": "com.openscaffoldlabs.opentickets",
  "productionUrl": "https://open-tickets-lake.vercel.app",
  "organizationName": "Demo Open Tickets Workspace",
  "onboardingStatus": "READY_FOR_IMMEDIATE_USE",
  "interactiveDemoUrl": "https://open-tickets-lake.vercel.app/?demo=1",
  "parallelProofGuarantee": {
    "enabled": true,
    "durationDays": 60,
    "day1ImportMinutes": 15,
    "dailyHumanDoubleEntryMinutes": 0,
    "weeklyVarianceScoreboardCheckMinutes": 2,
    "cutoverDay": 60,
    "customerPromise": "Zero Double-Entry — 15-Minute Day-1 Import, Automated Shadow Sync (0 minutes of daily double data entry), and a 2-Minute Weekly $0.00 Variance Scoreboard Check before canceling legacy software on Day 60."
  },
  "valueProposition": {
    "headline": "Zero-Gouge Venue Ticketing, Reserved Seating, Gate Scanning, and Instant Box-Office Settlement.",
    "effortlessConvenience": "One login replaces your fragmented patchwork of point solutions—every screen, mobile app, payment, and ledger entry works together automatically.",
    "aiRoleSupport": "Built-in Box Office & Promoter Co-Pilot",
    "plainLanguageVerified": true
  },
  "designTokens": {
    "canvasWarmTan": "#e7d9c1",
    "surfaceWarmIvory": "#fbf7ef",
    "railForestGreen": "#1f2b22",
    "headingGold": "#c9ab66"
  }
};
function buildSelfServeOnboarding(input = {}) {
  const organizationName = input.organizationName || BASE.organizationName;
  const booksV33 = evaluateVerticalBooksV33Suite({
    verticalId: "open-tickets",
    organizationName,
    rolePersona: input.rolePersona || "cfo_treasurer_cpa",
    period: input.period || "2026-10",
  });
  return {
    ...BASE,
    organizationName,
    booksEngine: BOOKS_V33_ENGINE_LABEL,
    booksVersion: BOOKS_V33_VERSION,
    booksV33,
  };
}
module.exports = {
  buildSelfServeOnboarding,
  evaluateVerticalBooksV33Suite,
  BOOKS_V33_ENGINE_LABEL,
  BOOKS_V33_VERSION,
};
