'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { SEED_EVENTS, SEED_TICKETS } = require('./seedEvents.js');
const {
  PAYMENT_RAIL_MODES,
  VERTICAL_TICKETING_INTEGRATIONS,
  FIVE_SUSTAINABILITY_PILLARS,
  ANTITRUST_AND_REGULATORY_TAILWINDS,
  sha256Hex,
  validateTenantEventAccess,
  calculateCheckoutComparison,
  generateRotatingTotpQrPayload,
  verifyGateScanOrScreenshot,
  evaluateFaceValueTransferOrReturn,
  calculateCommonsSustainabilityModel,
  generateBooksDoubleEntryJournal,
  generateWellKnownOpenTicketsManifest,
  getOpenTicketsMcpTools,
} = require('./lib/ticketing.js');

const runtimeEvents = structuredClone(SEED_EVENTS);
const runtimeTickets = structuredClone(SEED_TICKETS);
const runtimeJournals = [];

// Seed initial GL journals for the pre-loaded tickets
for (const t of runtimeTickets) {
  runtimeJournals.push(
    generateBooksDoubleEntryJournal({
      orderId: `ORD-${t.id}`,
      eventId: t.eventId,
      eventTitle: t.eventTitle,
      verticalIntegration: 'OpenTickets Commons',
      grossTicketCents: t.originalFaceValueCents,
      railFeeCents: 20,
      venueAbsorbsAch: false,
      commonsTipCents: 150,
      salesTaxCents: 0,
    })
  );
}

function hydrateTicketWithQr(t, timestampMs = Date.now()) {
  const qr = generateRotatingTotpQrPayload({
    ticketId: t.id,
    eventId: t.eventId,
    holderPasskeyThumbprint: t.holderPasskeyThumbprint,
    totpSecretHex: t.totpSecretHex,
    timestampMs,
    windowSeconds: 30,
  });
  return {
    ...t,
    liveQr: qr,
  };
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        return resolve(JSON.parse(req.body));
      } catch (err) {
        return reject(err);
      }
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  const rewrittenPath = parsedUrl.searchParams.get('__path');
  const pathname = rewrittenPath
    ? rewrittenPath.startsWith('/')
      ? rewrittenPath
      : `/${rewrittenPath}`
    : parsedUrl.pathname;

  try {
    if (pathname === '/api/books/v33' || pathname === '/books/v33' || pathname === '/api/accounting/books-v33' || pathname === '/api/agent/bot-dashboard') {
      const { evaluateVerticalBooksV33Suite } = require("./selfServeOnboarding.js");
      return sendJson(res, 200, evaluateVerticalBooksV33Suite({ verticalId: "open-tickets" }));
    }
    if (pathname === '/api/onboarding/self-serve' || pathname === '/onboarding/self-serve' || pathname === '/api/licensing/self-serve') {
      const { buildSelfServeOnboarding } = require("./selfServeOnboarding.js");
      return sendJson(res, 200, buildSelfServeOnboarding());
    }
    if (pathname === '/health' || pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        service: 'open-tickets',
        module: '@openscaffold/ticketing@1.0.0',
        booksEngine: '@openscaffold/books v3.3.0 (100% QuickBooks Replacement)',
        booksVersion: '3.3.0',
        mandatoryPlatformFeeCents: 0,
        ftc16CfrPart464Compliant: true,
        totpRotationSeconds: 30,
        eventsCount: runtimeEvents.length,
        activeTicketsCount: runtimeTickets.length,
        timestampIso: new Date().toISOString(),
      });
    }

    if (pathname === '/.well-known/open-tickets.json' || pathname === '/api/well-known') {
      return sendJson(
        res,
        200,
        generateWellKnownOpenTicketsManifest({
          hostUrl: 'https://open-tickets.vercel.app',
          events: runtimeEvents,
        })
      );
    }

    if (pathname === '/api/mcp') {
      if (req.method === 'GET') {
        return sendJson(res, 200, {
          protocol: 'mcp/1.0',
          server: 'open-tickets-mcp',
          tools: getOpenTicketsMcpTools(),
        });
      }
      const body = await readJsonBody(req);
      return sendJson(res, 200, {
        ok: true,
        tool: body.tool || 'open_tickets_search_events',
        result: {
          events: runtimeEvents.length,
          mandatoryPlatformFeeCents: 0,
        },
      });
    }

    if (pathname === '/api/blueprint') {
      const defaultSustainability = calculateCommonsSustainabilityModel({
        monthlyTickets: 250000,
        commonsOptInPct: 14,
        avgCommonsTipCents: 150,
        proVenueCount: 45,
        proVenueMonthlyCents: 9900,
      });
      return sendJson(res, 200, {
        title: 'Open Tickets — The Free, Open-Internet Public-Utility Ticketing Platform',
        coreThesis:
          'Ticketmaster charges 25%–44% in mandatory service, facility, order processing, and broker resale double-dipping fees ($16.4B extracted from fans between 2019 and 2024 per the Sept 2025 FTC lawsuit). Open Tickets charges $0.00 in platform fees forever, routes payments directly to artists and venues over $0.20 Instant ACH or pass-through Mode A0 rails, locks out scalper bots via WebAuthn Passkeys + 30s rotating TOTP QR codes, and sustains itself on the open internet via the Wikipedia/Signal Commons micro-tip model and OSL vertical integration.',
        pillars: FIVE_SUSTAINABILITY_PILLARS,
        regulatoryTailwinds: ANTITRUST_AND_REGULATORY_TAILWINDS,
        verticalIntegrations: VERTICAL_TICKETING_INTEGRATIONS,
        paymentRailModes: PAYMENT_RAIL_MODES,
        defaultSustainability,
        mcpTools: getOpenTicketsMcpTools(),
      });
    }

    if (pathname === '/api/events' && req.method === 'GET') {
      return sendJson(res, 200, {
        events: runtimeEvents,
        verticalIntegrations: VERTICAL_TICKETING_INTEGRATIONS,
      });
    }

    if (pathname === '/api/events' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const title = String(body.title || 'Community Concert & Gathering').trim();
      const venueName = String(body.venueName || 'Community Amphitheatre').trim();
      const cityState = String(body.cityState || 'Austin, TX').trim();
      const category = String(body.category || 'Concert / Live Music').trim();
      const verticalIntegration = String(
        body.verticalIntegration || 'OpenTickets Standalone (Concerts, Sports & Arenas)'
      ).trim();
      const faceValueCents = Math.max(0, Number(body.faceValueCents) || 4500);
      const capacity = Math.max(10, Number(body.capacity) || 500);
      const venueAbsorbsAch = Boolean(body.venueAbsorbsAch);

      const newEventId = `EVT-CUSTOM-${Date.now().toString(36).toUpperCase()}`;
      const sections =
        Array.isArray(body.sections) && body.sections.length > 0
          ? body.sections
          : [
              {
                code: 'FRONT',
                name: 'Front Reserved / VIP',
                tierType: 'reserved_seated',
                faceValueCents: Math.round(faceValueCents * 1.25),
                capacity: Math.round(capacity * 0.25),
                soldCount: 0,
                color: '#10b981',
                seats: [
                  {
                    id: `${newEventId}-F1`,
                    label: 'Row 1 · Seat 1',
                    priceCents: Math.round(faceValueCents * 1.25),
                    status: 'available',
                  },
                  {
                    id: `${newEventId}-F2`,
                    label: 'Row 1 · Seat 2',
                    priceCents: Math.round(faceValueCents * 1.25),
                    status: 'available',
                  },
                ],
              },
              {
                code: 'MAIN',
                name: 'Main Floor / General Admission',
                tierType: 'general_admission',
                faceValueCents,
                capacity: Math.round(capacity * 0.75),
                soldCount: 0,
                color: '#3b82f6',
                seats: [
                  { id: `${newEventId}-M1`, label: 'Main GA · Pass #1', priceCents: faceValueCents, status: 'available' },
                  { id: `${newEventId}-M2`, label: 'Main GA · Pass #2', priceCents: faceValueCents, status: 'available' },
                  { id: `${newEventId}-M3`, label: 'Main GA · Pass #3', priceCents: faceValueCents, status: 'available' },
                  { id: `${newEventId}-M4`, label: 'Main GA · Pass #4', priceCents: faceValueCents, status: 'available' },
                ],
              },
            ];

      const createdEvent = {
        id: newEventId,
        orgId: 'org-open-tickets-commons',
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        subtitle: `${venueName} · $0.00 Open Tickets Fee · 100% Face-Value Cap`,
        category,
        verticalIntegration,
        venueName,
        cityState,
        eventDateIso: body.eventDateIso || '2026-12-12T19:30:00-08:00',
        eventDateLabel: body.eventDateLabel || 'Sat, Dec 12, 2026 · 7:30 PM',
        capacity,
        faceValueCents,
        venueAbsorbsAch,
        strictFaceValueCap: true,
        passkeyHumanityRequired: true,
        totpWindowSeconds: 30,
        taxRateBps: 0,
        waitlistCount: 0,
        sections,
      };

      runtimeEvents.unshift(createdEvent);

      const sampleJournal = generateBooksDoubleEntryJournal({
        orderId: `ORD-PREVIEW-${newEventId}`,
        eventId: newEventId,
        eventTitle: title,
        verticalIntegration,
        grossTicketCents: faceValueCents * 2,
        railFeeCents: 20,
        venueAbsorbsAch,
        commonsTipCents: 100,
      });

      return sendJson(res, 201, {
        event: createdEvent,
        sampleBooksJournal: sampleJournal,
        wellKnownManifestEntry: generateWellKnownOpenTicketsManifest({
          hostUrl: 'https://open-tickets.vercel.app',
          events: [createdEvent],
        }),
      });
    }

    if (pathname === '/api/checkout/compare' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const comparison = calculateCheckoutComparison({
        faceValueCents: body.faceValueCents ?? 8500,
        quantity: body.quantity ?? 2,
        paymentRail: body.paymentRail || 'ach_instant_fednow',
        commonsTipCents: body.commonsTipCents ?? 150,
        venueAbsorbsAch: Boolean(body.venueAbsorbsAch),
        taxRateBps: body.taxRateBps ?? 0,
      });
      return sendJson(res, 200, comparison);
    }

    if (pathname === '/api/tickets' && req.method === 'GET') {
      const ts = Number(parsedUrl.searchParams.get('ts')) || Date.now();
      return sendJson(res, 200, {
        tickets: runtimeTickets.map((t) => hydrateTicketWithQr(t, ts)),
        journals: runtimeJournals,
      });
    }

    if (pathname === '/api/tickets/mint' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const event =
        runtimeEvents.find((e) => e.id === body.eventId) || runtimeEvents[0];
      const quantity = Math.max(1, Math.min(8, Number(body.quantity) || 1));
      const unitCents =
        body.faceValueCents !== undefined ? Number(body.faceValueCents) : event.faceValueCents;
      const holderName = String(body.holderName || 'Dale Raaen').trim();
      const seatLabels =
        Array.isArray(body.seatLabels) && body.seatLabels.length > 0
          ? body.seatLabels
          : Array.from({ length: quantity }, (_, i) => `Verified Pass #${i + 1}`);

      const minted = [];
      for (let i = 0; i < quantity; i++) {
        const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}-${i + 1}`;
        const secret = sha256Hex(`${ticketId}|${event.id}|${holderName}|${Date.now()}`);
        const newTicket = {
          id: ticketId,
          orgId: event.orgId,
          eventId: event.id,
          eventTitle: event.title,
          venueName: `${event.venueName} (${event.cityState})`,
          eventDateLabel: event.eventDateLabel,
          sectionCode: body.sectionCode || (event.sections[0] && event.sections[0].code) || 'MAIN',
          seatLabel: seatLabels[i] || `Seat #${i + 1}`,
          holderName,
          holderPasskeyThumbprint: `passkey:fido2:${sha256Hex(holderName).slice(0, 12)}`,
          achHumanityToken: 'ach_verified:rainforest_fednow_human_verified',
          originalFaceValueCents: unitCents,
          maxAllowedTransferCents: unitCents,
          totpSecretHex: secret,
          status: 'ACTIVE',
          issuedAtIso: new Date().toISOString(),
        };
        runtimeTickets.unshift(newTicket);
        minted.push(hydrateTicketWithQr(newTicket));
      }

      const journal = generateBooksDoubleEntryJournal({
        orderId: `ORD-${minted[0].id}`,
        eventId: event.id,
        eventTitle: event.title,
        verticalIntegration: event.verticalIntegration,
        grossTicketCents: unitCents * quantity,
        railFeeCents: 20,
        venueAbsorbsAch: Boolean(event.venueAbsorbsAch),
        commonsTipCents: Number(body.commonsTipCents) || 0,
      });
      runtimeJournals.unshift(journal);

      return sendJson(res, 201, {
        mintedTickets: minted,
        booksJournal: journal,
      });
    }

    if (pathname === '/api/tickets/totp' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const ticket =
        runtimeTickets.find((t) => t.id === body.ticketId) || runtimeTickets[0];
      const ts = Number(body.timestampMs) || Date.now();
      return sendJson(res, 200, hydrateTicketWithQr(ticket, ts));
    }

    if (pathname === '/api/tickets/verify-scan' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const ticket =
        runtimeTickets.find((t) => t.id === body.ticketId) || runtimeTickets[0];
      const currentQr = generateRotatingTotpQrPayload({
        ticketId: ticket.id,
        eventId: ticket.eventId,
        holderPasskeyThumbprint: ticket.holderPasskeyThumbprint,
        totpSecretHex: ticket.totpSecretHex,
        timestampMs: Date.now(),
      });

      const simulateScreenshot = Boolean(body.simulateStaleScreenshot);
      const verification = verifyGateScanOrScreenshot({
        ticketId: ticket.id,
        eventId: ticket.eventId,
        holderPasskeyThumbprint: ticket.holderPasskeyThumbprint,
        totpSecretHex: ticket.totpSecretHex,
        presentedWindowCounter: simulateScreenshot
          ? currentQr.windowCounter - 6
          : currentQr.windowCounter,
        presentedHmacSignatureHex: currentQr.hmacSignatureHex,
        scanTimestampMs: Date.now(),
      });

      return sendJson(res, 200, verification);
    }

    if (pathname === '/api/tickets/transfer' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const ticketIndex = runtimeTickets.findIndex((t) => t.id === body.ticketId);
      const ticket = ticketIndex >= 0 ? runtimeTickets[ticketIndex] : runtimeTickets[0];
      const proposedCents =
        body.proposedTransferPriceCents !== undefined
          ? Number(body.proposedTransferPriceCents)
          : ticket.originalFaceValueCents;

      const result = evaluateFaceValueTransferOrReturn({
        ticket,
        proposedTransferPriceCents: proposedCents,
        recipientName: body.recipientName || 'Maya Lin (Verified Fan Waitlist #1)',
        recipientPasskeyThumbprint: 'passkey:fido2:maya-lin-enclave-verified',
        recipientAchVerified: true,
      });

      if (result.allowed && ticketIndex >= 0) {
        runtimeTickets[ticketIndex] = result.reissuedTicket;
      }

      return sendJson(res, 200, {
        ...result,
        updatedTicket: hydrateTicketWithQr(
          ticketIndex >= 0 ? runtimeTickets[ticketIndex] : ticket
        ),
      });
    }

    if (pathname === '/api/sustainability/model' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const model = calculateCommonsSustainabilityModel({
        monthlyTickets: body.monthlyTickets ?? 250000,
        commonsOptInPct: body.commonsOptInPct ?? 14,
        avgCommonsTipCents: body.avgCommonsTipCents ?? 150,
        proVenueCount: body.proVenueCount ?? 45,
        proVenueMonthlyCents: body.proVenueMonthlyCents ?? 9900,
      });
      return sendJson(res, 200, model);
    }

    // Serve static files from /public when running via node server/src/index.js
    const publicDir = path.join(__dirname, '..', '..', 'public');
    let filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.pdf': 'application/pdf',
        '.svg': 'image/svg+xml',
      };
      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      });
      return fs.createReadStream(filePath).pipe(res);
    }

    return sendJson(res, 404, { error: 'Not found', path: pathname });
  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Internal Server Error' });
  }
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3099;
  const server = http.createServer(handleRequest);
  server.listen(port, () => {
    console.log(`Open Tickets server listening on http://localhost:${port}`);
  });
}

module.exports = { handleRequest };
