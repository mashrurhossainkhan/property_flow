CREATE TABLE IF NOT EXISTS contact_proposals (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  budget NUMERIC(14,2),
  location TEXT,
  timeline TEXT,
  intent TEXT NOT NULL,
  summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN (
      'PENDING',
      'REJECTED',
      'PROCESSING',
      'CREATED',
      'ALREADY_EXISTS',
      'REQUIRES_RECONCILIATION'
    )),
  hubspot_contact_id TEXT,
  reviewer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS approval_events (
  id BIGSERIAL PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES contact_proposals(id),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
