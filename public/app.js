'use strict';

const state = {
  events: [],
  activeEvent: null,
  selectedSeats: [],
  quantity: 2,
  paymentRail: 'ach_instant_fednow',
  commonsTipCents: 150,
  tickets: [],
  activeTicketId: null,
  journals: [],
  blueprint: null,
  totpTimeOffsetMs: 0,
};

function fmtUsd(cents) {
  const val = (Number(cents) || 0) / 100;
  return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtUsdWhole(cents) {
  const val = Math.round((Number(cents) || 0) / 100);
  return '$' + val.toLocaleString('en-US');
}

// Navigation switching
document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach((s) => s.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.view);
    if (target) target.classList.add('active');
  });
});

// Render Event Selector Grid
function renderEventSelector() {
  const grid = document.getElementById('eventSelectorGrid');
  if (!grid) return;
  grid.innerHTML = '';

  state.events.forEach((ev) => {
    const isSelected = state.activeEvent && state.activeEvent.id === ev.id;
    const btn = document.createElement('button');
    btn.className = 'event-pill' + (isSelected ? ' active' : '');
    btn.innerHTML = `
      <div class="event-pill-cat">${ev.category}</div>
      <div class="event-pill-title">${ev.title}</div>
      <div class="event-pill-meta">
        <span>📍 ${ev.venueName} (${ev.cityState})</span>
        <strong class="mono" style="color:#34d399;">${fmtUsd(ev.faceValueCents)}</strong>
      </div>
    `;
    btn.addEventListener('click', () => {
      selectEvent(ev);
    });
    grid.appendChild(btn);
  });
}

function selectEvent(ev) {
  state.activeEvent = ev;
  const badge = document.getElementById('activeEventVerticalBadge');
  if (badge) badge.textContent = ev.verticalIntegration;
  const mapTitle = document.getElementById('seatmapEventTitle');
  if (mapTitle) mapTitle.textContent = `Interactive Seat Map · ${ev.venueName}`;

  // Pre-select first 2 available seats
  const allAvail = [];
  (ev.sections || []).forEach((sec) => {
    (sec.seats || []).forEach((s) => {
      if (s.status === 'available') {
        allAvail.push({ ...s, sectionCode: sec.code, sectionName: sec.name });
      }
    });
  });
  state.selectedSeats = allAvail.slice(0, state.quantity);
  if (ev.venueAbsorbsAch) {
    state.paymentRail = 'ach_venue_absorbed';
    document.getElementById('checkoutRailSelect').value = 'ach_venue_absorbed';
  } else if (state.paymentRail === 'ach_venue_absorbed') {
    state.paymentRail = 'ach_instant_fednow';
    document.getElementById('checkoutRailSelect').value = 'ach_instant_fednow';
  }

  renderEventSelector();
  renderVenueSeatMap();
  updateCheckoutReceipt();
}

// Render Interactive SVG Venue Seat Map
function renderVenueSeatMap() {
  const svg = document.getElementById('venueSeatMapSvg');
  if (!svg || !state.activeEvent) return;

  const sections = state.activeEvent.sections || [];
  let html = `
    <defs>
      <linearGradient id="stageGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="50%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <!-- Stage / Field / Chef Counter Header -->
    <path d="M 130 16 Q 310 42 490 16 L 470 50 Q 310 72 150 50 Z" fill="url(#stageGrad)" stroke="#10b981" stroke-width="1.5"/>
    <text x="310" y="38" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="700" letter-spacing="2">
      STAGE / PERFORMANCE FLOOR (${state.activeEvent.venueName.toUpperCase()})
    </text>
  `;

  sections.forEach((sec, idx) => {
    const yBase = 74 + idx * 66;
    html += `
      <rect x="65" y="${yBase}" width="490" height="54" rx="10" fill="rgba(30,41,59,0.65)" stroke="${sec.color || '#3b82f6'}" stroke-width="1.2"/>
      <text x="82" y="${yBase + 20}" fill="#f8fafc" font-size="11.5" font-weight="700">${sec.name} — ${fmtUsd(sec.faceValueCents)}</text>
      <text x="82" y="${yBase + 38}" fill="#94a3b8" font-size="10">Capacity: ${sec.soldCount}/${sec.capacity} sold · $0.00 Open Tickets Fee</text>
    `;

    const seats = sec.seats || [];
    seats.forEach((seat, sIdx) => {
      const cx = 370 + sIdx * 52;
      const cy = yBase + 27;
      const isSelected = state.selectedSeats.some((sel) => sel.id === seat.id);
      const isSold = seat.status === 'sold';
      const fill = isSold ? '#ef4444' : isSelected ? '#10b981' : '#3b82f6';
      const stroke = isSelected ? '#ffffff' : 'transparent';

      html += `
        <g class="seat-node" data-seat-id="${seat.id}" data-sec-code="${sec.code}">
          <circle cx="${cx}" cy="${cy}" r="15" fill="${fill}" stroke="${stroke}" stroke-width="2.2" />
          <text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="700">
            ${isSold ? 'SOLD' : isSelected ? '✓' : 'S' + (sIdx + 1)}
          </text>
        </g>
      `;
    });
  });

  svg.innerHTML = html;

  svg.querySelectorAll('.seat-node').forEach((node) => {
    node.addEventListener('click', () => {
      const seatId = node.getAttribute('data-seat-id');
      let foundSeat = null;
      let foundSec = null;
      (state.activeEvent.sections || []).forEach((sec) => {
        (sec.seats || []).forEach((s) => {
          if (s.id === seatId) {
            foundSeat = s;
            foundSec = sec;
          }
        });
      });
      if (!foundSeat || foundSeat.status === 'sold') return;

      const existingIdx = state.selectedSeats.findIndex((s) => s.id === seatId);
      if (existingIdx >= 0) {
        if (state.selectedSeats.length > 1) {
          state.selectedSeats.splice(existingIdx, 1);
        }
      } else {
        state.selectedSeats.push({
          ...foundSeat,
          sectionCode: foundSec.code,
          sectionName: foundSec.name,
        });
      }
      state.quantity = state.selectedSeats.length;
      const qtySel = document.getElementById('checkoutQtySelect');
      if (qtySel) qtySel.value = String(Math.min(6, state.quantity));

      renderVenueSeatMap();
      updateCheckoutReceipt();
    });
  });

  const summaryEl = document.getElementById('selectedSeatsSummary');
  if (summaryEl) {
    const labels = state.selectedSeats.map((s) => s.label).join(', ');
    summaryEl.textContent = `${state.selectedSeats.length} Selected (${labels || 'Standard Face Value'})`;
  }
}

async function updateCheckoutReceipt() {
  if (!state.activeEvent) return;
  const unitCents =
    state.selectedSeats.length > 0
      ? state.selectedSeats[0].priceCents
      : state.activeEvent.faceValueCents;

  const res = await fetch('/api/checkout/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      faceValueCents: unitCents,
      quantity: state.quantity,
      paymentRail: state.paymentRail,
      commonsTipCents: state.commonsTipCents,
      venueAbsorbsAch: state.paymentRail === 'ach_venue_absorbed',
    }),
  });
  const data = await res.json();

  document.getElementById('tmQtyLabel').textContent = data.quantity;
  document.getElementById('otQtyLabel').textContent = data.quantity;
  document.getElementById('tmSubtotalVal').textContent = fmtUsd(data.subtotalCents);
  document.getElementById('otSubtotalVal').textContent = fmtUsd(data.subtotalCents);

  document.getElementById('tmServiceFeeVal').textContent = '+' + fmtUsd(data.ticketmaster.serviceFeeCents);
  document.getElementById('tmFacilityFeeVal').textContent = '+' + fmtUsd(data.ticketmaster.facilityChargeCents);
  document.getElementById('tmOrderFeeVal').textContent = '+' + fmtUsd(data.ticketmaster.orderProcessingCents);
  document.getElementById('tmScalperVal').textContent = fmtUsd(data.scalperResale.totalScalperChargedCents);
  document.getElementById('tmFinalTotalVal').textContent = fmtUsd(data.ticketmaster.totalChargedCents);
  document.getElementById('tmFeePctBadge').textContent = `+${data.ticketmaster.junkFeePctOfFaceValue}% Fee Tax`;

  document.getElementById('otRailFeeVal').textContent = '+' + fmtUsd(data.openTickets.railFeeCents);
  document.getElementById('otCommonsTipVal').textContent = '+' + fmtUsd(data.openTickets.optionalCommonsTipCents);
  document.getElementById('otFinalTotalVal').textContent = fmtUsd(data.openTickets.finalTotalCents);

  document.getElementById('kpiRailFee').textContent = fmtUsd(data.openTickets.railFeeCents);
  document.getElementById('kpiRailLabel').textContent = data.openTickets.paymentRailLabel;
  document.getElementById('kpiSavedOrder').textContent = fmtUsd(data.savings.savedVsTicketmasterCents);
  document.getElementById('kpiReductionPct').textContent = `${data.savings.feeReductionPct}% lower fees than Ticketmaster`;
  document.getElementById('kpiVenuePayout').textContent = fmtUsd(data.openTickets.artistVenuePayoutCents);
  document.getElementById('commonsSavedHighlight').textContent = fmtUsd(data.savings.savedVsTicketmasterCents);
}

// Checkout controls
document.getElementById('checkoutQtySelect').addEventListener('change', (e) => {
  state.quantity = Number(e.target.value) || 2;
  updateCheckoutReceipt();
});

document.getElementById('checkoutRailSelect').addEventListener('change', (e) => {
  state.paymentRail = e.target.value;
  updateCheckoutReceipt();
});

document.querySelectorAll('#commonsTipPills .tip-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('#commonsTipPills .tip-pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    state.commonsTipCents = Number(pill.dataset.tip) || 0;
    updateCheckoutReceipt();
  });
});

// Mint Passkey-Bound Tickets
document.getElementById('btnMintTickets').addEventListener('click', async () => {
  if (!state.activeEvent) return;
  const holderName = document.getElementById('checkoutHolderName').value || 'Dale Raaen';
  const unitCents =
    state.selectedSeats.length > 0
      ? state.selectedSeats[0].priceCents
      : state.activeEvent.faceValueCents;

  const res = await fetch('/api/tickets/mint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: state.activeEvent.id,
      quantity: state.quantity,
      faceValueCents: unitCents,
      holderName,
      seatLabels: state.selectedSeats.map((s) => s.label),
      commonsTipCents: state.commonsTipCents,
    }),
  });
  const data = await res.json();
  if (data.mintedTickets && data.mintedTickets.length > 0) {
    await loadTicketsAndJournals();
    state.activeTicketId = data.mintedTickets[0].id;
    renderWalletPass();

    const banner = document.getElementById('mintStatusBanner');
    banner.style.display = 'block';
    banner.className = 'status-banner ok';
    banner.innerHTML = `
      ✅ <strong>Minted ${data.mintedTickets.length} Passkey-Bound Ticket(s) (${data.mintedTickets[0].id})!</strong>
      Platform Fee: <strong>$0.00</strong> · @openscaffold/books Journal <code>${data.booksJournal.journalId}</code> balanced (${fmtUsd(data.booksJournal.totalDebitsCents)}).
      <button class="btn btn-emerald" style="margin-left:8px; padding:4px 10px;" onclick="document.querySelector('[data-view=\\'view-wallet\\']').click()">
        Open Live 30s Rotating QR Pass →
      </button>
    `;
  }
});

// View 2: Rotating TOTP QR Pass & Face-Value Waitlist Exchange
async function loadTicketsAndJournals() {
  const res = await fetch(`/api/tickets?ts=${Date.now() + state.totpTimeOffsetMs}`);
  const data = await res.json();
  state.tickets = data.tickets || [];
  state.journals = data.journals || [];
  if (!state.activeTicketId && state.tickets.length > 0) {
    state.activeTicketId = state.tickets[0].id;
  }

  const select = document.getElementById('walletTicketSelect');
  if (select) {
    select.innerHTML = state.tickets
      .map(
        (t) =>
          `<option value="${t.id}" ${t.id === state.activeTicketId ? 'selected' : ''}>${t.id} · ${
            t.eventTitle
          } (${t.seatLabel} — ${fmtUsd(t.originalFaceValueCents)})</option>`
      )
      .join('');
  }

  renderWalletPass();
  renderBooksJournalTable();
}

document.getElementById('walletTicketSelect').addEventListener('change', (e) => {
  state.activeTicketId = e.target.value;
  renderWalletPass();
});

function renderQrSvgFromMatrix(matrix) {
  const size = matrix.length;
  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#090d16"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="192" height="192" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

function renderWalletPass() {
  const ticket =
    state.tickets.find((t) => t.id === state.activeTicketId) || state.tickets[0];
  if (!ticket || !ticket.liveQr) return;

  document.getElementById('walletEventTitle').textContent = ticket.eventTitle;
  document.getElementById('walletVenueDate').textContent = `${ticket.venueName} · ${ticket.eventDateLabel} · ${ticket.seatLabel}`;
  document.getElementById('walletTicketId').textContent = ticket.id;
  document.getElementById('walletTotpCode').textContent = ticket.liveQr.totpDynamicCode;
  document.getElementById('walletWindowCounter').textContent = `#${ticket.liveQr.windowCounter}`;
  document.getElementById('walletPasskeyThumb').textContent = ticket.holderPasskeyThumbprint;
  document.getElementById('walletQrFrame').innerHTML = renderQrSvgFromMatrix(ticket.liveQr.qrMatrix21x21);

  document.getElementById('transferOriginalFaceVal').textContent = fmtUsd(ticket.originalFaceValueCents);
  document.getElementById('transferMaxAllowedVal').textContent = fmtUsd(ticket.maxAllowedTransferCents);
  document.getElementById('transferHolderName').textContent = ticket.holderName;
}

// Live 1-second ticker for the 30-second TOTP countdown bar
setInterval(async () => {
  const nowMs = Date.now() + state.totpTimeOffsetMs;
  const elapsedSec = Math.floor((nowMs % 30000) / 1000);
  const remSec = 30 - elapsedSec;
  const pct = Math.max(4, Math.round((remSec / 30) * 100));

  const textEl = document.getElementById('walletCountdownText');
  const barEl = document.getElementById('walletCountdownBar');
  if (textEl) textEl.textContent = `Rotates in ${remSec}s`;
  if (barEl) barEl.style.width = `${pct}%`;

  if (remSec === 30 && state.activeTicketId) {
    const res = await fetch('/api/tickets/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: state.activeTicketId, timestampMs: nowMs }),
    });
    const updated = await res.json();
    const idx = state.tickets.findIndex((t) => t.id === updated.id);
    if (idx >= 0) state.tickets[idx] = updated;
    renderWalletPass();
  }
}, 1000);

document.getElementById('btnForceRotateQr').addEventListener('click', async () => {
  state.totpTimeOffsetMs += 30000;
  const res = await fetch('/api/tickets/totp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketId: state.activeTicketId,
      timestampMs: Date.now() + state.totpTimeOffsetMs,
    }),
  });
  const updated = await res.json();
  const idx = state.tickets.findIndex((t) => t.id === updated.id);
  if (idx >= 0) state.tickets[idx] = updated;
  renderWalletPass();
});

document.getElementById('btnVerifyLiveScan').addEventListener('click', async () => {
  const res = await fetch('/api/tickets/verify-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId: state.activeTicketId, simulateStaleScreenshot: false }),
  });
  const data = await res.json();
  const banner = document.getElementById('gateScanResultBanner');
  banner.style.display = 'block';
  banner.className = 'status-banner ok';
  banner.innerHTML = `✅ <strong>${data.status}:</strong> ${data.reason}`;
});

document.getElementById('btnSimulateScreenshot').addEventListener('click', async () => {
  const res = await fetch('/api/tickets/verify-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId: state.activeTicketId, simulateStaleScreenshot: true }),
  });
  const data = await res.json();
  const banner = document.getElementById('gateScanResultBanner');
  banner.style.display = 'block';
  banner.className = 'status-banner blocked';
  banner.innerHTML = `🚫 <strong>${data.status}:</strong> ${data.reason}`;
});

// Face-Value Return & Scalper Markup Blocker
document.getElementById('btnReturnFaceValue').addEventListener('click', async () => {
  const ticket =
    state.tickets.find((t) => t.id === state.activeTicketId) || state.tickets[0];
  if (!ticket) return;
  const recipientName = document.getElementById('transferRecipientInput').value;

  const res = await fetch('/api/tickets/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketId: ticket.id,
      proposedTransferPriceCents: ticket.originalFaceValueCents,
      recipientName,
    }),
  });
  const data = await res.json();
  if (data.updatedTicket) {
    const idx = state.tickets.findIndex((t) => t.id === data.updatedTicket.id);
    if (idx >= 0) state.tickets[idx] = data.updatedTicket;
    renderWalletPass();
  }
  const banner = document.getElementById('transferResultBanner');
  banner.style.display = 'block';
  banner.className = 'status-banner ok';
  banner.innerHTML = `🤝 <strong>${data.status}:</strong> ${data.reason}`;
});

document.getElementById('btnSimulateScalperMarkup').addEventListener('click', async () => {
  const ticket =
    state.tickets.find((t) => t.id === state.activeTicketId) || state.tickets[0];
  if (!ticket) return;

  const res = await fetch('/api/tickets/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketId: ticket.id,
      proposedTransferPriceCents: Math.max(25000, ticket.originalFaceValueCents * 3),
      recipientName: 'Secondary Scalper Broker',
    }),
  });
  const data = await res.json();
  const banner = document.getElementById('transferResultBanner');
  banner.style.display = 'block';
  banner.className = 'status-banner blocked';
  banner.innerHTML = `🚫 <strong>${data.status}:</strong> ${data.reason}<br/><span style="font-size:11.5px; color:#cbd5e1;">${data.regulatoryContext}</span>`;
});

// View 3: 60-Second Event Creator & @openscaffold/books GL Table
function renderBooksJournalTable() {
  const tbody = document.getElementById('booksJournalTbody');
  if (!tbody || state.journals.length === 0) return;
  const latest = state.journals[0];

  let rowsHtml = latest.lines
    .map(
      (l) => `
      <tr>
        <td class="mono" style="color:#93c5fd; font-weight:700;">${l.accountCode}</td>
        <td>
          <strong>${l.accountName}</strong>
          <div style="font-size:11px; color:var(--text-muted);">${l.memo}</div>
        </td>
        <td class="mono" style="color:#34d399;">${l.debitCents > 0 ? fmtUsd(l.debitCents) : '—'}</td>
        <td class="mono" style="color:#93c5fd;">${l.creditCents > 0 ? fmtUsd(l.creditCents) : '—'}</td>
      </tr>
    `
    )
    .join('');

  rowsHtml += `
    <tr style="background:rgba(16,185,129,0.09); font-weight:800;">
      <td colspan="2">Balanced Journal Total (${latest.journalId} · Variance $0.00)</td>
      <td class="mono" style="color:#34d399;">${fmtUsd(latest.totalDebitsCents)}</td>
      <td class="mono" style="color:#34d399;">${fmtUsd(latest.totalCreditsCents)}</td>
    </tr>
  `;
  tbody.innerHTML = rowsHtml;
}

document.getElementById('btnPublishEvent').addEventListener('click', async () => {
  const title = document.getElementById('createEventTitle').value;
  const venueName = document.getElementById('createEventVenue').value;
  const cityState = document.getElementById('createEventCity').value;
  const verticalIntegration = document.getElementById('createEventVertical').value;
  const eventDateLabel = document.getElementById('createEventDate').value;
  const faceValueCents = Math.round((Number(document.getElementById('createEventPrice').value) || 35) * 100);
  const capacity = Number(document.getElementById('createEventCapacity').value) || 400;
  const venueAbsorbsAch = document.getElementById('createEventAbsorbAch').checked;

  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      venueName,
      cityState,
      category: verticalIntegration.split('(')[0].trim(),
      verticalIntegration,
      eventDateLabel,
      faceValueCents,
      capacity,
      venueAbsorbsAch,
    }),
  });
  const data = await res.json();
  if (data.event) {
    state.events.unshift(data.event);
    if (data.sampleBooksJournal) {
      state.journals.unshift(data.sampleBooksJournal);
      renderBooksJournalTable();
    }
    selectEvent(data.event);
    loadWellKnownManifest();

    const banner = document.getElementById('createEventStatusBanner');
    banner.style.display = 'block';
    banner.className = 'status-banner ok';
    banner.innerHTML = `
      🚀 <strong>Published "${data.event.title}" (${data.event.id})!</strong>
      Live on <code>/.well-known/open-tickets.json</code> with $0.00 platform fee and balanced @openscaffold/books GL journal <code>${data.sampleBooksJournal.journalId}</code>.
    `;
  }
});

async function loadWellKnownManifest() {
  const res = await fetch('/.well-known/open-tickets.json');
  const data = await res.json();
  const pre = document.getElementById('wellKnownPre');
  if (pre) pre.textContent = JSON.stringify(data, null, 2);
}

// View 4: Sustainability Calculator & Blueprint
async function updateSustainabilitySim() {
  const monthlyTickets = Number(document.getElementById('simMonthlyTickets').value) || 250000;
  const commonsOptInPct = Number(document.getElementById('simOptInPct').value) || 14;
  const avgCommonsTipCents = Number(document.getElementById('simAvgTip').value) || 150;
  const proVenueCount = Number(document.getElementById('simProVenues').value) || 45;

  document.getElementById('simTicketsVal').textContent = monthlyTickets.toLocaleString('en-US');
  document.getElementById('simOptInVal').textContent = `${commonsOptInPct}%`;
  document.getElementById('simAvgTipVal').textContent = fmtUsd(avgCommonsTipCents);
  document.getElementById('simProVenuesVal').textContent = String(proVenueCount);

  const res = await fetch('/api/sustainability/model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      monthlyTickets,
      commonsOptInPct,
      avgCommonsTipCents,
      proVenueCount,
      proVenueMonthlyCents: 9900,
    }),
  });
  const model = await res.json();

  document.getElementById('simInfraCost').textContent = fmtUsdWhole(model.monthlyEdgeInfraCostCents);
  document.getElementById('simCommonsRev').textContent = fmtUsdWhole(model.monthlyCommonsTipRevenueCents);
  document.getElementById('simTippingOrdersSub').textContent = `${model.tippingOrdersCount.toLocaleString(
    'en-US'
  )} orders tipping ${fmtUsd(avgCommonsTipCents)} after saving $30+`;
  document.getElementById('simCoverageRatio').textContent = `${model.infrastructureCoverageRatio}x`;
  document.getElementById('simNetSurplus').textContent = `+${fmtUsdWhole(model.monthlyNetSurplusCents)}/mo`;

  const annualM = (model.annualFanJunkFeesSavedCents / 100 / 1_000_000).toFixed(1);
  document.getElementById('simAnnualFanSavings').textContent = `$${annualM}M/yr`;
}

['simMonthlyTickets', 'simOptInPct', 'simAvgTip', 'simProVenues'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateSustainabilitySim);
});

async function loadBlueprintData() {
  const res = await fetch('/api/blueprint');
  const data = await res.json();
  state.blueprint = data;

  const pillarsEl = document.getElementById('pillarsContainer');
  if (pillarsEl && data.pillars) {
    pillarsEl.innerHTML = data.pillars
      .map(
        (p) => `
        <div style="background:var(--bg-panel); border:1px solid var(--border-subtle); border-radius:10px; padding:12px 14px;">
          <div style="font-size:13px; font-weight:800; color:#34d399;">Pillar ${p.number} · ${p.title}</div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">${p.summary}</div>
        </div>
      `
      )
      .join('');
  }

  const tailEl = document.getElementById('tailwindsContainer');
  if (tailEl && data.regulatoryTailwinds) {
    tailEl.innerHTML = data.regulatoryTailwinds
      .map(
        (t) => `
        <div style="background:var(--bg-panel); border:1px solid rgba(59,130,246,0.35); border-radius:10px; padding:12px 14px;">
          <div style="font-size:13px; font-weight:800; color:#93c5fd;">⚖️ ${t.citation}</div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">${t.impact}</div>
        </div>
      `
      )
      .join('');
  }

  const mcpPre = document.getElementById('mcpToolsPre');
  if (mcpPre && data.mcpTools) {
    mcpPre.textContent = JSON.stringify(data.mcpTools, null, 2);
  }
}

// Modals
function bindModal(openBtnId, modalId, closeBtnId) {
  const openBtn = document.getElementById(openBtnId);
  const modal = document.getElementById(modalId);
  const closeBtn = document.getElementById(closeBtnId);
  if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.classList.add('open'));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }
}

bindModal('btnTourModal', 'tourModal', 'btnCloseTour');
bindModal('btnAiDrawer', 'aiModal', 'btnCloseAi');
bindModal('btnMcpDrawer', 'mcpModal', 'btnCloseMcp');

const AI_ANSWERS = {
  'How does Open Tickets stay free without ads or venture burn?':
    'Open Tickets combines three structural efficiencies: (1) Edge-cached static event manifests + client-side WebCrypto/Passkey verification cost only $0.00038 per ticket issued; (2) Wholesale $0.20 Instant Bank ACH (Rainforest / FedNow) or pass-through Mode A0 card rails settle directly into the venue bank account so Open Tickets has $0 payment float risk; and (3) Just like Wikipedia, Signal, and Let\'s Encrypt, when fans see at checkout that Open Tickets saved them $34+ in Ticketmaster junk fees, a voluntary $1.50 "Tip the Commons" from 14% of buyers generates over 130x the global hosting cost.',
  'How do 30-second rotating TOTP QR codes and passkeys stop StubHub scalpers?':
    'First, every buyer in the queue is bound to a hardware FIDO2 WebAuthn Passkey + $0.20 verified bank token (1 human = 1 queue slot, stopping 6,000-account broker farms like Ticketmaster TradeDesk). Second, the ticket QR code uses RFC 6238 HMAC-SHA256 rotating every 30 seconds—so a screenshot or PDF uploaded to StubHub goes dead in 30 seconds. Third, if a fan cannot attend, the protocol enforces a hard <= 100% Face-Value Cap via the instant Fan Waitlist Exchange.',
  'How does Open Tickets integrate with @openscaffold/books v3.0 and OpenCPA?':
    'Every ticket minted on Open Tickets automatically generates a balanced ASC 606 double-entry journal in @openscaffold/books v3.0: debiting Operating Checking (1010) for the direct Mode A0 daily payout and crediting Deferred Ticket Revenue (2400) until showtime (when it auto-recognizes into Earned Admission Revenue 4100), plus Sales/Admissions Tax Payable (2210). Zero CSV exports and zero QuickBooks tax for the venue or their CPA.',
};

document.querySelectorAll('.ai-prompt-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const prompt = btn.getAttribute('data-prompt');
    const box = document.getElementById('aiResponseBox');
    if (box) {
      box.innerHTML = `<strong style="color:#34d399;">Q: ${prompt}</strong><p style="margin-top:6px;">${
        AI_ANSWERS[prompt] || ''
      }</p>`;
    }
  });
});

// Initialize Application
async function init() {
  const evRes = await fetch('/api/events');
  const evData = await evRes.json();
  state.events = evData.events || [];
  if (state.events.length > 0) {
    selectEvent(state.events[0]);
  }
  await loadTicketsAndJournals();
  await loadWellKnownManifest();
  await loadBlueprintData();
  await updateSustainabilitySim();
}

init();
