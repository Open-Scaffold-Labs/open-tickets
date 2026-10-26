"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildSelfServeOnboarding } = require("../selfServeOnboarding.js");

test("Open Tickets Commercial Launch & 60-Day Parallel Proof Self-Serve Onboarding (t88u)", () => {
  const res = buildSelfServeOnboarding({ organizationName: "Test Open Tickets" });
  assert.equal(res.ok, true);
  assert.equal(res.appId, "com.openscaffoldlabs.opentickets");
  assert.equal(res.parallelProofGuarantee.dailyHumanDoubleEntryMinutes, 0);
  assert.equal(res.parallelProofGuarantee.day1ImportMinutes, 15);
  assert.equal(res.parallelProofGuarantee.weeklyVarianceScoreboardCheckMinutes, 2);
  assert.equal(res.valueProposition.plainLanguageVerified, true);
});
