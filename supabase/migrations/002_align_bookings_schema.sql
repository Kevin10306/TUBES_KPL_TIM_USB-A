-- Bookings: buat baru ATAU upgrade tabel lama
-- Jalankan SETELAH 001

-- ─── Buat tabel bookings jika belum ada ───
CREATE TABLE IF NOT EXISTS bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID,
  profile_id        UUID,
  barbershop_id     UUID,
  barbershop_name   TEXT NOT NULL DEFAULT '',
  booking_date      DATE,
  booking_time      TIME,
  jadwal            TEXT NOT NULL DEFAULT '',
  service_name      TEXT NOT NULL DEFAULT '',
  extra_services    TEXT NOT NULL DEFAULT '',
  subtotal          INTEGER NOT NULL DEFAULT 0,
  discount          INTEGER NOT NULL DEFAULT 0,
  coupon_code       TEXT,
  total             INTEGER NOT NULL DEFAULT 0,
  payment_status    TEXT NOT NULL DEFAULT 'pending',
  payment_ref       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tambah kolom yang kurang (tabel lama) ───
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS profile_id        UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS barbershop_id     UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS barbershop_name   TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS jadwal              TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_name        TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extra_services      TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subtotal            INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount            INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_code         TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total             INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status      TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_ref         TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- booking_date / booking_time mungkin sudah ada di tabel lama
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_time TIME;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id UUID;

-- ─── FK (opsional, abaikan jika gagal) ───
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_profile_id_fkey') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_profile_id_fkey
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'barbershops')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_barbershop_id_fkey') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_barbershop_id_fkey
      FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'demo_users')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'user_id') THEN
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
    ALTER TABLE bookings ADD CONSTRAINT bookings_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES demo_users(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ─── Backfill barber_id → barbershop_id (hanya jika kolom ada) ───
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'barber_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'barbers' AND column_name = 'barbershop_id') THEN
    UPDATE bookings b
    SET barbershop_id = br.barbershop_id
    FROM barbers br
    WHERE b.barber_id = br.id AND b.barbershop_id IS NULL;
  END IF;
END $$;

-- ─── Backfill service_id → service_name (deteksi nama kolom services) ───
DO $$
DECLARE
  svc_name_col TEXT;
  svc_price_col TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'service_id') THEN
    RETURN;
  END IF;

  SELECT column_name INTO svc_name_col
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'services'
    AND column_name IN ('name', 'service_name', 'title', 'nama', 'nama_layanan')
  ORDER BY CASE column_name
    WHEN 'name' THEN 1
    WHEN 'service_name' THEN 2
    WHEN 'title' THEN 3
    WHEN 'nama' THEN 4
    ELSE 5
  END
  LIMIT 1;

  SELECT column_name INTO svc_price_col
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'services'
    AND column_name IN ('price', 'harga', 'amount')
  ORDER BY CASE column_name WHEN 'price' THEN 1 WHEN 'harga' THEN 2 ELSE 3 END
  LIMIT 1;

  IF svc_name_col IS NOT NULL THEN
    IF svc_price_col IS NOT NULL THEN
      EXECUTE format(
        'UPDATE bookings b SET service_name = s.%I, total = CASE WHEN b.total = 0 THEN s.%I::integer ELSE b.total END, subtotal = CASE WHEN b.subtotal = 0 THEN s.%I::integer ELSE b.subtotal END FROM services s WHERE b.service_id = s.id AND (b.service_name IS NULL OR b.service_name = '''')',
        svc_name_col, svc_price_col, svc_price_col
      );
    ELSE
      EXECUTE format(
        'UPDATE bookings b SET service_name = s.%I FROM services s WHERE b.service_id = s.id AND (b.service_name IS NULL OR b.service_name = '''')',
        svc_name_col
      );
    END IF;
  END IF;
END $$;

-- ─── Backfill status → payment_status ───
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'status') THEN
    UPDATE bookings
    SET payment_status = CASE
      WHEN status::text IN ('paid', 'confirmed', 'completed') THEN 'paid'
      WHEN status::text IN ('cancelled', 'canceled') THEN 'cancelled'
      ELSE COALESCE(NULLIF(status::text, ''), 'pending')
    END
    WHERE payment_status IS NULL OR payment_status = 'pending';
  END IF;
END $$;

-- ─── Backfill notes → jadwal ───
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'notes') THEN
    UPDATE bookings
    SET jadwal = COALESCE(NULLIF(notes, ''), jadwal, '')
    WHERE jadwal IS NULL OR jadwal = '';
  END IF;
END $$;

-- ─── Indexes ───
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_profile_id ON bookings(profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_barbershop_id ON bookings(barbershop_id);

-- ─── Trigger updated_at ───
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF to_jsonb(NEW) ? 'updated_at' THEN
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_updated ON bookings;
CREATE TRIGGER trg_bookings_updated
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── RLS ───
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_own_demo" ON bookings;
DROP POLICY IF EXISTS "bookings_select_public_paid" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_anon" ON bookings;

CREATE POLICY "bookings_select_own_demo" ON bookings
  FOR SELECT USING (user_id IS NOT NULL OR profile_id = auth.uid());

CREATE POLICY "bookings_select_public_paid" ON bookings
  FOR SELECT USING (payment_status = 'paid');

CREATE POLICY "bookings_insert_anon" ON bookings
  FOR INSERT WITH CHECK (true);
