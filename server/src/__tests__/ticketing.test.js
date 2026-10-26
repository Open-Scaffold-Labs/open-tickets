'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  PAYMENT_RAIL_MODES,
  FIVE_SUSTAINABILITY_PILLARS,
  ANTITRUST_AND_REGULATORY_TAILWINDS,
  validateTenantEventAccess,
  calculateCheckoutComparison,
  generateRotatingTotpQrPayload,
  verifyGateScanOrScreenshot,
  evaluateFaceValueTransferOrReturn,
  calculateCommonsSustainabilityModel,
  generateBooksDoubleEntryJournal,
  generateWellKnownOpenTicketsManifest,
  getOpenTicketsMcpTools,
} = require('../lib/ticketing.js');

test('1. Tenant isolation enforces org_id match', () => {
  const allowed = validateTenantEventAccess({ userOrgId: 'org-red-rocks', recordOrgId: 'org-red-rocks' });
  assert.equal(allowed.allowed, true);

  const denied = validateTenantEventAccess({ userOrgId: 'org-red-rocks', recordOrgId: 'org-other' });
  assert.equal(denied.allowed, false);
  assert.match(denied.reason, /TENANT_ISOLATION_VIOLATION/);
});

test('2. Checkout comparison calculates $0.00 Open Tickets fee + $0.20 ACH vs Ticketmaster junk fees', () => {
  const comp = calculateCheckoutComparison({
    faceValueCents: 8500,
    quantity: 2,
    paymentRail: 'ach_instant_fednow',
    commonsTipCents: 100,
  });

  assert.equal(comp.subtotalCents, 17000);
  assert.equal(comp.openTickets.platformFeeCents, 0);
  assert.equal(comp.openTickets.railFeeCents, 20);
  assert.equal(comp.openTickets.totalBeforeTipCents, 17020);
  assert.equal(comp.openTickets.finalTotalCents, 17120);
  assert.equal(comp.openTickets.ftc16Cfr464Compliant, true);
  assert.ok(comp.ticketmaster.totalJunkFeesCents > 5000);
  assert.ok(comp.savings.savedVsTicketmasterCents > 5000);
  assert.ok(comp.savings.feeReductionPct > 99);
});

test('3. Rotating 30s TOTP QR payload generates valid 21x21 QR matrix and blocks stale screenshots', () => {
  const t0 = 1761436800000;
  const qr = generateRotatingTotpQrPayload({
    ticketId: 'TKT-1001',
    eventId: 'EVT-RED-ROCKS',
    holderPasskeyThumbprint: 'passkey:fido2:dale-iphone16pro',
    totpSecretHex: 'a1b2c3d4e5f60123456789abcdef',
    timestampMs: t0,
    windowSeconds: 30,
  });

  assert.equal(qr.qrMatrix21x21.length, 21);
  assert.equal(qr.qrMatrix21x21[0].length, 21);
  assert.match(qr.qrUri, /^opentickets:\/\/verify\/v1\?/);

  // Live scan within same 30s window succeeds
  const liveScan = verifyGateScanOrScreenshot({
    ticketId: 'TKT-1001',
    eventId: 'EVT-RED-ROCKS',
    holderPasskeyThumbprint: 'passkey:fido2:dale-iphone16pro',
    totpSecretHex: 'a1b2c3d4e5f60123456789abcdef',
    presentedWindowCounter: qr.windowCounter,
    presentedHmacSignatureHex: qr.hmacSignatureHex,
    scanTimestampMs: t0 + 10000,
    windowSeconds: 30,
  });
  assert.equal(liveScan.valid, true);
  assert.equal(liveScan.status, 'VERIFIED_HUMAN_PASSKEY_ADMITTED');

  // Screenshot presented 3 minutes later is blocked
  const staleScreenshot = verifyGateScanOrScreenshot({
    ticketId: 'TKT-1001',
    eventId: 'EVT-RED-ROCKS',
    holderPasskeyThumbprint: 'passkey:fido2:dale-iphone16pro',
    totpSecretHex: 'a1b2c3d4e5f60123456789abcdef',
    presentedWindowCounter: qr.windowCounter,
    presentedHmacSignatureHex: qr.hmacSignatureHex,
    scanTimestampMs: t0 + 180000,
    windowSeconds: 30,
  });
  assert.equal(staleScreenshot.valid, false);
  assert.equal(staleScreenshot.status, 'SCREENSHOT_EXPIRED_REPLAY_BLOCKED');
});

test('4. Face-Value Waitlist Exchange blocks scalper markups > 100% and allows exact face-value return', () => {
  const ticket = {
    id: 'TKT-1001',
    eventId: 'EVT-RED-ROCKS',
    holderName: 'Alex Fan',
    holderPasskeyThumbprint: 'passkey:fido2:alex',
    originalFaceValueCents: 8500,
    totpSecretHex: 'old-secret-123',
  };

  // Attempt $250 scalper resale on an $85 ticket -> BLOCKED
  const scalperAttempt = evaluateFaceValueTransferOrReturn({
    ticket,
    proposedTransferPriceCents: 25000,
    recipientName: 'StubHub Broker',
  });
  assert.equal(scalperAttempt.allowed, false);
  assert.equal(scalperAttempt.status, 'BLOCKED_SCALPER_MARKUP');
  assert.ok(scalperAttempt.attemptedMarkupPct > 190);

  // Return to Fan Waitlist at exact $85.00 face value -> ALLOWED & rotates secret
  const fanReturn = evaluateFaceValueTransferOrReturn({
    ticket,
    proposedTransferPriceCents: 8500,
    recipientName: 'Maya Lin (Waitlist #1)',
    recipientPasskeyThumbprint: 'passkey:fido2:maya-verified',
    recipientAchVerified: true,
  });
  assert.equal(fanReturn.allowed, true);
  assert.equal(fanReturn.status, 'COMPLETED_AT_FACE_VALUE');
  assert.equal(fanReturn.platformTransferFeeCents, 0);
  assert.notEqual(fanReturn.reissuedTicket.totpSecretHex, ticket.totpSecretHex);
  assert.equal(fanReturn.reissuedTicket.holderName, 'Maya Lin (Waitlist #1)');
});

test('5. Commons Sustainability Model & @openscaffold/books v3.0 Double-Entry GL Journal', () => {
  const model = calculateCommonsSustainabilityModel({
    monthlyTickets: 250000,
    commonsOptInPct: 14,
    avgCommonsTipCents: 150,
    proVenueCount: 45,
    proVenueMonthlyCents: 9900,
  });
  assert.equal(model.isSelfSustaining, true);
  assert.ok(model.infrastructureCoverageRatio > 50);

  const journal = generateBooksDoubleEntryJournal({
    orderId: 'ORD-9001',
    eventId: 'EVT-RED-ROCKS',
    eventTitle: 'Red Rocks Indie Folk Night',
    grossTicketCents: 17000,
    railFeeCents: 20,
    venueAbsorbsAch: true,
    salesTaxCents: 1360,
  });
  assert.equal(journal.isBalanced, true);
  assert.equal(journal.totalDebitsCents, journal.totalCreditsCents);

  assert.equal(PAYMENT_RAIL_MODES.length, 3);
  assert.equal(FIVE_SUSTAINABILITY_PILLARS.length, 5);
  assert.ok(ANTITRUST_AND_REGULATORY_TAILWINDS.length >= 3);
  assert.equal(getOpenTicketsMcpTools().length, 4);

  const manifest = generateWellKnownOpenTicketsManifest({ events: [] });
  assert.equal(manifest.publicUtilityCovenant.mandatoryPlatformFeeCents, 0);
});
