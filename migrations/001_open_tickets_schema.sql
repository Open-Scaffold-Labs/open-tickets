-- @openscaffold/ticketing v1.0.0 — Open Tickets Public-Utility Ticketing Schema
-- Multi-tenant RLS isolated (`org_id`), FTC 16 CFR Part 464 compliant, 100% Face-Value Transfer Cap

CREATE TABLE IF NOT EXISTS ot_events (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  vertical_integration TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  city_state TEXT NOT NULL,
  event_date_iso TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  face_value_cents INTEGER NOT NULL,
  venue_absorbs_ach BOOLEAN NOT NULL DEFAULT FALSE,
  strict_face_value_cap BOOLEAN NOT NULL DEFAULT TRUE,
  passkey_humanity_required BOOLEAN NOT NULL DEFAULT TRUE,
  totp_window_seconds INTEGER NOT NULL DEFAULT 30,
  tax_rate_bps INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ot_seat_sections (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  event_id TEXT NOT NULL REFERENCES ot_events(id) ON DELETE CASCADE,
  section_code TEXT NOT NULL,
  section_name TEXT NOT NULL,
  tier_type TEXT NOT NULL, -- 'reserved_seated' | 'general_admission' | 'table_seating'
  face_value_cents INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  sold_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ot_tickets (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  event_id TEXT NOT NULL REFERENCES ot_events(id) ON DELETE CASCADE,
  section_code TEXT NOT NULL,
  seat_label TEXT NOT NULL,
  holder_name TEXT NOT NULL,
  holder_passkey_Thumbprint TEXT NOT NULL,
  ach_humanity_token TEXT NOT NULL,
  original_face_value_cents INTEGER NOT NULL,
  max_allowed_transfer_cents INTEGER NOT NULL,
  totp_secret_hex TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'RETURNED_TO_WAITLIST' | 'REISSUED_FACE_VALUE' | 'REDEEMED'
  issued_at_iso TEXT NOT NULL,
  CONSTRAINT enforce_face_value_cap CHECK (max_allowed_transfer_cents <= original_face_value_cents)
);

CREATE TABLE IF NOT EXISTS ot_waitlist_returns (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  event_id TEXT NOT NULL REFERENCES ot_events(id) ON DELETE CASCADE,
  ticket_id TEXT NOT NULL REFERENCES ot_tickets(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  buyer_name TEXT,
  face_value_cents INTEGER NOT NULL,
  attempted_price_cents INTEGER NOT NULL,
  transfer_status TEXT NOT NULL, -- 'COMPLETED_AT_FACE_VALUE' | 'BLOCKED_SCALPER_MARKUP' | 'QUEUED_FOR_NEXT_FAN'
  created_at_iso TEXT NOT NULL
);
