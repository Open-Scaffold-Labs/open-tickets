'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { handleRequest } = require('../index.js');

function startTestServer() {
  return new Promise((resolve) => {
    const server = http.createServer(handleRequest);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${addr.port}`,
      });
    });
  });
}

test('HTTP API endpoints (/health, /.well-known/open-tickets.json, /api/events, /api/checkout/compare, /api/tickets/mint, /api/tickets/transfer, /api/blueprint)', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    const health = await healthRes.json();
    assert.equal(health.mandatoryPlatformFeeCents, 0);

    const wkRes = await fetch(`${baseUrl}/.well-known/open-tickets.json`);
    assert.equal(wkRes.status, 200);
    const wk = await wkRes.json();
    assert.equal(wk.publicUtilityCovenant.mandatoryPlatformFeeCents, 0);
    assert.ok(wk.events.length >= 6);

    const compRes = await fetch(`${baseUrl}/api/checkout/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceValueCents: 8500, quantity: 2, paymentRail: 'ach_instant_fednow' }),
    });
    assert.equal(compRes.status, 200);
    const comp = await compRes.json();
    assert.equal(comp.openTickets.platformFeeCents, 0);
    assert.equal(comp.openTickets.railFeeCents, 20);

    const mintRes = await fetch(`${baseUrl}/api/tickets/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 'EVT-RED-ROCKS-2026',
        quantity: 2,
        holderName: 'Dale Raaen',
        commonsTipCents: 150,
      }),
    });
    assert.equal(mintRes.status, 201);
    const minted = await mintRes.json();
    assert.equal(minted.mintedTickets.length, 2);
    assert.equal(minted.booksJournal.isBalanced, true);

    const scalperRes = await fetch(`${baseUrl}/api/tickets/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId: minted.mintedTickets[0].id,
        proposedTransferPriceCents: 25000,
      }),
    });
    assert.equal(scalperRes.status, 200);
    const scalper = await scalperRes.json();
    assert.equal(scalper.allowed, false);
    assert.equal(scalper.status, 'BLOCKED_SCALPER_MARKUP');
  } finally {
    server.close();
  }
});
