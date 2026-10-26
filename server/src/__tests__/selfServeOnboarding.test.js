"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildSelfServeOnboarding, BOOKS_V33_ENGINE_LABEL } = require("../selfServeOnboarding.js");

test("open-tickets Self-Serve Onboarding & @openscaffold/books v3.3.0 (t88u / t109u)", () => {
  const res = buildSelfServeOnboarding({ organizationName: "Test open-tickets" });
  assert.equal(res.ok, true);
  assert.equal(res.appId, "com.openscaffoldlabs.opentickets");
  assert.equal(res.parallelProofGuarantee.dailyHumanDoubleEntryMinutes, 0);
  assert.equal(res.parallelProofGuarantee.day1ImportMinutes, 15);
  assert.equal(res.parallelProofGuarantee.weeklyVarianceScoreboardCheckMinutes, 2);
  assert.equal(res.valueProposition.plainLanguageVerified, true);
  assert.equal(res.booksEngine, BOOKS_V33_ENGINE_LABEL);
  assert.equal(res.booksVersion, "3.3.0");
  assert.equal(res.booksV33.verticalId, "open-tickets");
  assert.equal(Object.keys(res.booksV33.enterpriseParityPillars).length, 5);
  assert.equal(Object.keys(res.booksV33.fourBookParallelEngine).length, 4);
  assert.equal(res.booksV33.zeroPbcAuditPortal.testOfOneEligible, true);
  assert.equal(res.booksV33.doc12DualBotDashboard.standardVersion, "DOC-12-UNIFIED-DUAL-BOT-DASHBOARD-V1");
});
