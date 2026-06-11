-- Cukurin: base schema (TANPA bookings — lihat 002)
-- Aman dijalankan meski beberapa tabel sudah ada

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Profiles ───
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  email       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Demo users ───
CREATE TABLE IF NOT EXISTS demo_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Barbershops ───
CREATE TABLE IF NOT EXISTS barbershops (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  image         TEXT NOT NULL DEFAULT '',
  location      TEXT NOT NULL DEFAULT '',
  rating        NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count  INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  about         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade tabel barbershops lama (MongoDB / skema awal)
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS slug         TEXT;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS name         TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS description  TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS image          TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS location     TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS rating         NUMERIC(2,1) NOT NULL DEFAULT 0;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS review_count   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS status         TEXT NOT NULL DEFAULT 'Open';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS about          TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Mapping kolom legacy (namabarbershop, deskripsi, avatar)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'barbershops' AND column_name = 'namabarbershop') THEN
    UPDATE barbershops SET name = namabarbershop WHERE name IS NULL OR name = '';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'barbershops' AND column_name = 'deskripsi') THEN
    UPDATE barbershops SET description = deskripsi WHERE description IS NULL OR description = '';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'barbershops' AND column_name = 'avatar') THEN
    UPDATE barbershops SET image = avatar WHERE image IS NULL OR image = '';
  END IF;
  UPDATE barbershops SET slug = LOWER(REGEXP_REPLACE(COALESCE(NULLIF(name, ''), 'shop-' || id::text), '[^a-zA-Z0-9]+', '-', 'g'))
  WHERE slug IS NULL OR slug = '';
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS barbershops_slug_key ON barbershops (slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS barbershop_hours (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id   UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  days_label      TEXT NOT NULL,
  time_range      TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS barbers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id   UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT NOT NULL DEFAULT '',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE barbers ADD COLUMN IF NOT EXISTS barbershop_id UUID;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS role         TEXT NOT NULL DEFAULT '';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS avatar_url   TEXT NOT NULL DEFAULT '';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS is_active    BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id   UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  price           INTEGER NOT NULL DEFAULT 0,
  is_extra        BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (barbershop_id, slug)
);

-- Upgrade tabel services lama (tanpa hapus data)
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug       TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS name       TEXT NOT NULL DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS price      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_extra   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS barbershop_id UUID;

CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id   UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  reviewer_name   TEXT NOT NULL,
  rating          NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  review_text     TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at      TIMESTAMPTZ
);

-- ─── Indexes (bukan bookings) ───
CREATE INDEX IF NOT EXISTS idx_services_barbershop_id ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_barbershop_id ON reviews(barbershop_id);

-- ─── Trigger function ───
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF to_jsonb(NEW) ? 'updated_at' THEN
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_barbershops_updated ON barbershops;
CREATE TRIGGER trg_barbershops_updated
  BEFORE UPDATE ON barbershops
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── RLS (bukan bookings) ───
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershop_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "barbershops_public_read" ON barbershops;
CREATE POLICY "barbershops_public_read" ON barbershops FOR SELECT USING (true);

DROP POLICY IF EXISTS "barbershop_hours_public_read" ON barbershop_hours;
CREATE POLICY "barbershop_hours_public_read" ON barbershop_hours FOR SELECT USING (true);

DROP POLICY IF EXISTS "barbers_public_read" ON barbers;
CREATE POLICY "barbers_public_read" ON barbers FOR SELECT USING (true);

DROP POLICY IF EXISTS "services_public_read" ON services;
CREATE POLICY "services_public_read" ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "coupons_public_read" ON coupons;
CREATE POLICY "coupons_public_read" ON coupons FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "demo_users_public_read" ON demo_users;
CREATE POLICY "demo_users_public_read" ON demo_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
