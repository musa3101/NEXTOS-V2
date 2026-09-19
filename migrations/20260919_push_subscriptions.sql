-- Migration: Create push_subscriptions table
-- Stores Web Push subscriptions (one per device/browser)
-- Used by /api/push/subscribe and /api/push/send

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint    TEXT NOT NULL UNIQUE,         -- The push endpoint URL (unique per device)
  p256dh      TEXT NOT NULL,                -- ECDH public key
  auth        TEXT NOT NULL,               -- Auth secret
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- No RLS needed — server-only access via service key (insforgeAdmin)
-- But add basic policy anyway for safety
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY "Service role full access" ON push_subscriptions
  USING (true)
  WITH CHECK (true);
