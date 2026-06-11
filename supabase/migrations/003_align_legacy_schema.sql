-- Cukurin 003: selaraskan skema lama Supabase dengan aplikasi
-- Jalankan SETELAH 001 + 002, SEBELUM seed.sql

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF to_jsonb(NEW) ? 'updated_at' THEN NEW.updated_at := NOW(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══ BARBERSHOPS ═══
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS slug           TEXT;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS name           TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS description    TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS image          TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS location       TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS address        TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS phone          TEXT NOT NULL DEFAULT '-';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS rating         NUMERIC(2,1) NOT NULL DEFAULT 0;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS review_count   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS status         TEXT NOT NULL DEFAULT 'Open';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS about          TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS city           TEXT NOT NULL DEFAULT 'Purwokerto';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS namabarbershop TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS deskripsi      TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS avatar         TEXT NOT NULL DEFAULT '';

-- ═══ SERVICES (legacy: service_name, harga, duration) ═══
ALTER TABLE services ADD COLUMN IF NOT EXISTS barbershop_id  UUID;
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug           TEXT NOT NULL DEFAULT 'layanan';
ALTER TABLE services ADD COLUMN IF NOT EXISTS name           TEXT NOT NULL DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_name   TEXT NOT NULL DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS price          INTEGER NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS harga          INTEGER NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration       INTEGER NOT NULL DEFAULT 30;
ALTER TABLE services ADD COLUMN IF NOT EXISTS description    TEXT NOT NULL DEFAULT '';
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_extra       BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active      BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ═══ BARBERS ═══
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS barbershop_id UUID;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS name          TEXT NOT NULL DEFAULT '';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS role          TEXT NOT NULL DEFAULT 'Barber';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS specialty     TEXT NOT NULL DEFAULT 'Barber';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS avatar_url    TEXT NOT NULL DEFAULT '';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS avatar        TEXT NOT NULL DEFAULT '';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS is_active     BOOLEAN NOT NULL DEFAULT TRUE;

-- ═══ BARBER SHOP HOURS ═══
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS barbershop_id UUID;
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS days_label    TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS day           TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS time_range    TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS hours         TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS sort_order    INTEGER NOT NULL DEFAULT 0;

-- ═══ REVIEWS ═══
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS barbershop_id    UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name    TEXT NOT NULL DEFAULT 'Anonim';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name        TEXT NOT NULL DEFAULT 'Anonim';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating           NUMERIC(2,1) NOT NULL DEFAULT 5;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_text      TEXT NOT NULL DEFAULT '-';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment          TEXT NOT NULL DEFAULT '-';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ═══ BOOKINGS ═══
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS profile_id      UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS barbershop_id   UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS barbershop_name TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date    DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_time    TIME;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS jadwal          TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_name    TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extra_services  TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subtotal        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_code     TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total           INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status  TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_ref     TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes           TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ═══ Backfill aman ═══
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='services' AND column_name='duration') THEN
    UPDATE services SET duration = 30 WHERE duration IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='services' AND column_name='service_name') THEN
    UPDATE services SET service_name = COALESCE(NULLIF(name, ''), 'Layanan') WHERE service_name IS NULL OR service_name = '';
    UPDATE services SET name = COALESCE(NULLIF(service_name, ''), 'Layanan') WHERE name IS NULL OR name = '';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='barbershops' AND column_name='slug') THEN
    UPDATE barbershops SET slug = LOWER(REGEXP_REPLACE(COALESCE(NULLIF(name, ''), 'shop-' || id::text), '[^a-zA-Z0-9]+', '-', 'g'))
    WHERE slug IS NULL OR slug = '';
  END IF;
END $$;

-- ═══ Trigger: isi SEMUA kolom legacy NOT NULL yang kosong ═══
CREATE OR REPLACE FUNCTION sync_cukurin_legacy_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- ── barbershops ──
  IF TG_TABLE_NAME = 'barbershops' THEN
    IF to_jsonb(NEW) ? 'name' AND to_jsonb(NEW) ? 'namabarbershop' THEN
      NEW.namabarbershop := COALESCE(NULLIF(NEW.namabarbershop, ''), NULLIF(NEW.name, ''), 'Barbershop');
      NEW.name := COALESCE(NULLIF(NEW.name, ''), NULLIF(NEW.namabarbershop, ''), 'Barbershop');
    END IF;
    IF to_jsonb(NEW) ? 'description' AND to_jsonb(NEW) ? 'deskripsi' THEN
      NEW.deskripsi := COALESCE(NULLIF(NEW.deskripsi, ''), NULLIF(NEW.description, ''), '-');
      NEW.description := COALESCE(NULLIF(NEW.description, ''), NULLIF(NEW.deskripsi, ''), '-');
    END IF;
    IF to_jsonb(NEW) ? 'image' AND to_jsonb(NEW) ? 'avatar' THEN
      NEW.avatar := COALESCE(NULLIF(NEW.avatar, ''), NULLIF(NEW.image, ''), '');
      NEW.image := COALESCE(NULLIF(NEW.image, ''), NULLIF(NEW.avatar, ''), '');
    END IF;
    IF to_jsonb(NEW) ? 'location' AND to_jsonb(NEW) ? 'address' THEN
      NEW.address := COALESCE(NULLIF(NEW.address, ''), NULLIF(NEW.location, ''), '-');
      NEW.location := COALESCE(NULLIF(NEW.location, ''), NULLIF(NEW.address, ''), '-');
    END IF;
    IF to_jsonb(NEW) ? 'slug' AND (NEW.slug IS NULL OR NEW.slug = '') THEN
      NEW.slug := LOWER(REGEXP_REPLACE(COALESCE(NULLIF(NEW.name, ''), 'shop'), '[^a-zA-Z0-9]+', '-', 'g'));
    END IF;
    IF to_jsonb(NEW) ? 'city' AND (NEW.city IS NULL OR NEW.city = '') THEN NEW.city := 'Purwokerto'; END IF;
    IF to_jsonb(NEW) ? 'phone' AND (NEW.phone IS NULL OR NEW.phone = '') THEN NEW.phone := '-'; END IF;
  END IF;

  -- ── services ──
  IF TG_TABLE_NAME = 'services' THEN
    IF to_jsonb(NEW) ? 'name' AND to_jsonb(NEW) ? 'service_name' THEN
      NEW.service_name := COALESCE(NULLIF(NEW.service_name, ''), NULLIF(NEW.name, ''), 'Layanan');
      NEW.name := COALESCE(NULLIF(NEW.name, ''), NULLIF(NEW.service_name, ''), 'Layanan');
    END IF;
    IF to_jsonb(NEW) ? 'price' AND to_jsonb(NEW) ? 'harga' THEN
      NEW.harga := COALESCE(NULLIF(NEW.harga, 0), NEW.price, 0);
      NEW.price := COALESCE(NULLIF(NEW.price, 0), NEW.harga, 0);
    END IF;
    IF to_jsonb(NEW) ? 'duration' AND NEW.duration IS NULL THEN NEW.duration := 30; END IF;
    IF to_jsonb(NEW) ? 'slug' AND (NEW.slug IS NULL OR NEW.slug = '') THEN
      NEW.slug := LOWER(REGEXP_REPLACE(COALESCE(NEW.name, NEW.service_name, 'layanan'), '[^a-zA-Z0-9]+', '-', 'g'));
    END IF;
    IF to_jsonb(NEW) ? 'description' AND (NEW.description IS NULL OR NEW.description = '') THEN
      NEW.description := COALESCE(NULLIF(NEW.name, ''), NULLIF(NEW.service_name, ''), 'Layanan');
    END IF;
    IF to_jsonb(NEW) ? 'is_active' AND NEW.is_active IS NULL THEN NEW.is_active := TRUE; END IF;
  END IF;

  -- ── barbers ──
  IF TG_TABLE_NAME = 'barbers' THEN
    IF to_jsonb(NEW) ? 'role' AND to_jsonb(NEW) ? 'specialty' THEN
      NEW.specialty := COALESCE(NULLIF(NEW.specialty, ''), NULLIF(NEW.role, ''), 'Barber');
      NEW.role := COALESCE(NULLIF(NEW.role, ''), NULLIF(NEW.specialty, ''), 'Barber');
    END IF;
    IF to_jsonb(NEW) ? 'avatar_url' AND to_jsonb(NEW) ? 'avatar' THEN
      NEW.avatar := COALESCE(NULLIF(NEW.avatar, ''), NULLIF(NEW.avatar_url, ''), '');
      NEW.avatar_url := COALESCE(NULLIF(NEW.avatar_url, ''), NULLIF(NEW.avatar, ''), '');
    END IF;
    IF to_jsonb(NEW) ? 'is_active' AND NEW.is_active IS NULL THEN NEW.is_active := TRUE; END IF;
  END IF;

  -- ── barbershop_hours ──
  IF TG_TABLE_NAME = 'barbershop_hours' THEN
    IF to_jsonb(NEW) ? 'days_label' AND to_jsonb(NEW) ? 'day' THEN
      NEW.day := COALESCE(NULLIF(NEW.day, ''), NULLIF(NEW.days_label, ''), '-');
      NEW.days_label := COALESCE(NULLIF(NEW.days_label, ''), NULLIF(NEW.day, ''), '-');
    END IF;
    IF to_jsonb(NEW) ? 'time_range' AND to_jsonb(NEW) ? 'hours' THEN
      NEW.hours := COALESCE(NULLIF(NEW.hours, ''), NULLIF(NEW.time_range, ''), '-');
      NEW.time_range := COALESCE(NULLIF(NEW.time_range, ''), NULLIF(NEW.hours, ''), '-');
    END IF;
  END IF;

  -- ── reviews ──
  IF TG_TABLE_NAME = 'reviews' THEN
    IF to_jsonb(NEW) ? 'reviewer_name' AND to_jsonb(NEW) ? 'user_name' THEN
      NEW.user_name := COALESCE(NULLIF(NEW.user_name, ''), NULLIF(NEW.reviewer_name, ''), 'Anonim');
      NEW.reviewer_name := COALESCE(NULLIF(NEW.reviewer_name, ''), NULLIF(NEW.user_name, ''), 'Anonim');
    END IF;
    IF to_jsonb(NEW) ? 'review_text' AND to_jsonb(NEW) ? 'comment' THEN
      NEW.comment := COALESCE(NULLIF(NEW.comment, ''), NULLIF(NEW.review_text, ''), '-');
      NEW.review_text := COALESCE(NULLIF(NEW.review_text, ''), NULLIF(NEW.comment, ''), '-');
    END IF;
  END IF;

  -- ── bookings ──
  IF TG_TABLE_NAME = 'bookings' THEN
    IF to_jsonb(NEW) ? 'status' AND to_jsonb(NEW) ? 'payment_status' THEN
      NEW.status := COALESCE(NULLIF(NEW.status, ''), NULLIF(NEW.payment_status, ''), 'pending');
    END IF;
    IF to_jsonb(NEW) ? 'notes' AND to_jsonb(NEW) ? 'jadwal' THEN
      NEW.notes := COALESCE(NULLIF(NEW.notes, ''), NULLIF(NEW.jadwal, ''), '');
    END IF;
    IF to_jsonb(NEW) ? 'barbershop_name' AND (NEW.barbershop_name IS NULL OR NEW.barbershop_name = '') THEN
      NEW.barbershop_name := 'Barbershop';
    END IF;
    IF to_jsonb(NEW) ? 'service_name' AND (NEW.service_name IS NULL OR NEW.service_name = '') THEN
      NEW.service_name := 'Layanan';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_barbershops_legacy ON barbershops;
CREATE TRIGGER trg_sync_barbershops_legacy BEFORE INSERT OR UPDATE ON barbershops
  FOR EACH ROW EXECUTE FUNCTION sync_cukurin_legacy_columns();

DROP TRIGGER IF EXISTS trg_sync_services_legacy ON services;
CREATE TRIGGER trg_sync_services_legacy BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION sync_cukurin_legacy_columns();

DROP TRIGGER IF EXISTS trg_sync_barbers_legacy ON barbers;
CREATE TRIGGER trg_sync_barbers_legacy BEFORE INSERT OR UPDATE ON barbers
  FOR EACH ROW EXECUTE FUNCTION sync_cukurin_legacy_columns();

DROP TRIGGER IF EXISTS trg_sync_barbershop_hours_legacy ON barbershop_hours;
CREATE TRIGGER trg_sync_barbershop_hours_legacy BEFORE INSERT OR UPDATE ON barbershop_hours
  FOR EACH ROW EXECUTE FUNCTION sync_cukurin_legacy_columns();

DROP TRIGGER IF EXISTS trg_sync_reviews_legacy ON reviews;
CREATE TRIGGER trg_sync_reviews_legacy BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION sync_cukurin_legacy_columns();

DROP TRIGGER IF EXISTS trg_sync_bookings_legacy ON bookings;
CREATE TRIGGER trg_sync_bookings_legacy BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION sync_cukurin_legacy_columns();
