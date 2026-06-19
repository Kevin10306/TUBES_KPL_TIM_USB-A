-- ═══════════════════════════════════════════════════════════════
-- Cukurin SEED — Purwokerto
-- URUTAN: 001 → 002 → 003 → seed.sql (file ini)
-- File ini self-contained: install trigger + perbaiki data rusak
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Pastikan kolom ada (gabungan semua error sebelumnya) ───
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
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS namabarbershop TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS deskripsi      TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS avatar         TEXT NOT NULL DEFAULT '';

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

ALTER TABLE barbers ADD COLUMN IF NOT EXISTS barbershop_id UUID;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS role          TEXT NOT NULL DEFAULT 'Barber';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS specialty     TEXT NOT NULL DEFAULT 'Barber';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS avatar_url    TEXT NOT NULL DEFAULT '';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS avatar        TEXT NOT NULL DEFAULT '';
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS is_active     BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS barbershop_id UUID;
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS days_label    TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS day           TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS time_range    TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS hours         TEXT NOT NULL DEFAULT '';
ALTER TABLE barbershop_hours ADD COLUMN IF NOT EXISTS sort_order    INTEGER NOT NULL DEFAULT 0;

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS barbershop_id    UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name    TEXT NOT NULL DEFAULT 'Anonim';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name        TEXT NOT NULL DEFAULT 'Anonim';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating           NUMERIC(2,1) NOT NULL DEFAULT 5;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_text      TEXT NOT NULL DEFAULT '-';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment          TEXT NOT NULL DEFAULT '-';

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS barbershop_name TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS jadwal          TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_name    TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status  TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes           TEXT NOT NULL DEFAULT '';

-- ─── 2. Install trigger (sama dengan 003) ───
CREATE OR REPLACE FUNCTION sync_cukurin_legacy_columns()
RETURNS TRIGGER AS $$
BEGIN
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
  IF TG_TABLE_NAME = 'barbers' THEN
    IF to_jsonb(NEW) ? 'role' AND to_jsonb(NEW) ? 'specialty' THEN
      NEW.specialty := COALESCE(NULLIF(NEW.specialty, ''), NULLIF(NEW.role, ''), 'Barber');
      NEW.role := COALESCE(NULLIF(NEW.role, ''), NULLIF(NEW.specialty, ''), 'Barber');
    END IF;
    IF to_jsonb(NEW) ? 'avatar_url' AND to_jsonb(NEW) ? 'avatar' THEN
      NEW.avatar := COALESCE(NULLIF(NEW.avatar, ''), NULLIF(NEW.avatar_url, ''), '');
      NEW.avatar_url := COALESCE(NULLIF(NEW.avatar_url, ''), NULLIF(NEW.avatar, ''), '');
    END IF;
  END IF;
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
  IF TG_TABLE_NAME = 'bookings' THEN
    IF to_jsonb(NEW) ? 'status' AND to_jsonb(NEW) ? 'payment_status' THEN
      NEW.status := COALESCE(NULLIF(NEW.status, ''), NULLIF(NEW.payment_status, ''), 'pending');
    END IF;
    IF to_jsonb(NEW) ? 'notes' AND to_jsonb(NEW) ? 'jadwal' THEN
      NEW.notes := COALESCE(NULLIF(NEW.notes, ''), NULLIF(NEW.jadwal, ''), '');
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

-- ─── 3. Perbaiki baris rusak dari percobaan seed sebelumnya ───
UPDATE services SET duration = 30 WHERE duration IS NULL;
UPDATE services SET service_name = COALESCE(NULLIF(name, ''), 'Layanan') WHERE service_name IS NULL OR service_name = '';
UPDATE services SET name = COALESCE(NULLIF(service_name, ''), 'Layanan') WHERE name IS NULL OR name = '';
UPDATE services SET harga = price WHERE harga IS NULL OR harga = 0;
DELETE FROM services WHERE slug IS NOT NULL AND (service_name IS NULL OR service_name = '') AND (name IS NULL OR name = '');

-- ─── 4. INSERT DATA ───

INSERT INTO demo_users (id, full_name, email, phone) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Ahmad Rizki', 'ahmad@email.com', '+6281234567001'),
  ('a1000000-0000-4000-8000-000000000002', 'Budi Santoso', 'budi@email.com', '+6281234567002'),
  ('a1000000-0000-4000-8000-000000000003', 'Tamu Cukurin', 'tamu@cukurin.app', '+6280000000000')
ON CONFLICT (email) DO NOTHING;

INSERT INTO barbershops (
  id, slug, name, description, image, location, address, phone, city,
  rating, review_count, status, about
) VALUES
('b1000000-0000-4000-8000-000000000001', 'masterpiece-purwokerto',
 'Masterpiece Barbershop Purwokerto',
 'Barbershop premium di pusat kota dengan layanan haircut & styling terbaik.',
 'https://images.unsplash.com/photo-1585747860715-2b5a879ef447?w=800&h=400&fit=crop',
 'Jl. Jenderal Sudirman No.45, Purwokerto Lor (1.2 km)',
 'Jl. Jenderal Sudirman No.45, Purwokerto Lor (1.2 km)',
 '+6281234567001', 'Purwokerto', 4.9, 87, 'Open',
 'Di Masterpiece Barbershop Purwokerto, tim tukang cukur terampil kami adalah seniman sejati.'),
('b1000000-0000-4000-8000-000000000002', 'gentleman-cut-pwt',
 'Gentleman Cut Purwokerto',
 'Tempat cukur klasik modern dengan suasana nyaman di area Sokaraja.',
 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop',
 'Jl. Raya Sokaraja Km 3, Purwokerto (2.5 km)',
 'Jl. Raya Sokaraja Km 3, Purwokerto (2.5 km)',
 '+6281234567002', 'Purwokerto', 4.7, 54, 'Open',
 'Gentleman Cut menghadirkan pengalaman grooming pria dengan standar internasional.'),
('b1000000-0000-4000-8000-000000000003', 'barber-kota-purwokerto',
 'Barber Kota Purwokerto',
 'Barbershop terjangkau dekat Alun-alun Purwokerto dengan antrean online.',
 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=400&fit=crop',
 'Jl. Gajah Mada No.12, Purwokerto Timur (0.8 km)',
 'Jl. Gajah Mada No.12, Purwokerto Timur (0.8 km)',
 '+6281234567003', 'Purwokerto', 4.5, 112, 'Open',
 'Barber Kota Purwokerto melayani haircut, coloring, dan treatment rambut.'),
('b1000000-0000-4000-8000-000000000004', 'fade-house-pwt',
 'Fade House Purwokerto',
 'Spesialis fade cut & skin fade di kawasan Banyumas.',
 'https://images.unsplash.com/photo-1599351431203-1a0eacf9b1cc?w=800&h=400&fit=crop',
 'Jl. HR Bunyamin No.88, Purwokerto Selatan (1.5 km)',
 'Jl. HR Bunyamin No.88, Purwokerto Selatan (1.5 km)',
 '+6281234567004', 'Purwokerto', 4.8, 63, 'Open',
 'Fade House Purwokerto adalah rumah bagi pecinta fade cut.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO barbershop_hours (barbershop_id, days_label, day, time_range, hours, sort_order)
SELECT v.barbershop_id, v.days_label, v.days_label, v.time_range, v.time_range, v.sort_order
FROM (VALUES
  ('b1000000-0000-4000-8000-000000000001'::uuid, 'Senin - Jumat', '09.00 - 20.00', 1),
  ('b1000000-0000-4000-8000-000000000001', 'Sabtu - Minggu', '09.00 - 21.00', 2),
  ('b1000000-0000-4000-8000-000000000002', 'Senin - Sabtu', '08.00 - 19.00', 1),
  ('b1000000-0000-4000-8000-000000000002', 'Minggu', '09.00 - 17.00', 2),
  ('b1000000-0000-4000-8000-000000000003', 'Setiap Hari', '08.00 - 21.00', 1),
  ('b1000000-0000-4000-8000-000000000004', 'Senin - Jumat', '10.00 - 20.00', 1),
  ('b1000000-0000-4000-8000-000000000004', 'Sabtu - Minggu', '09.00 - 21.00', 2)
) AS v(barbershop_id, days_label, time_range, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM barbershop_hours h WHERE h.barbershop_id = v.barbershop_id AND h.days_label = v.days_label
);

INSERT INTO barbers (barbershop_id, name, role, specialty, avatar_url, avatar)
SELECT v.barbershop_id, v.name, v.role, v.role, v.avatar, v.avatar
FROM (VALUES
  ('b1000000-0000-4000-8000-000000000001'::uuid, 'Tigral', 'Specialist Haircut', 'https://i.pravatar.cc/80?img=11'),
  ('b1000000-0000-4000-8000-000000000001', 'Lucas', 'Specialist Coloring', 'https://i.pravatar.cc/80?img=12'),
  ('b1000000-0000-4000-8000-000000000001', 'Lemarcus', 'Specialist Treatment', 'https://i.pravatar.cc/80?img=13'),
  ('b1000000-0000-4000-8000-000000000002', 'Raka', 'Fade Specialist', 'https://i.pravatar.cc/80?img=21'),
  ('b1000000-0000-4000-8000-000000000002', 'Dimas', 'Hair Stylist', 'https://i.pravatar.cc/80?img=22'),
  ('b1000000-0000-4000-8000-000000000003', 'Satya', 'Senior Barber', 'https://i.pravatar.cc/80?img=14'),
  ('b1000000-0000-4000-8000-000000000003', 'Dhimas', 'Color Expert', 'https://i.pravatar.cc/80?img=15'),
  ('b1000000-0000-4000-8000-000000000004', 'Julian', 'Skin Fade Pro', 'https://i.pravatar.cc/80?img=16')
) AS v(barbershop_id, name, role, avatar)
WHERE NOT EXISTS (SELECT 1 FROM barbers b WHERE b.barbershop_id = v.barbershop_id AND b.name = v.name);

-- slug, name, service_name, price, harga, duration (menit), is_extra
INSERT INTO services (barbershop_id, slug, name, service_name, price, harga, duration, is_extra)
SELECT v.barbershop_id, v.slug, v.name, v.name, v.price, v.price, v.duration, v.is_extra
FROM (VALUES
  ('b1000000-0000-4000-8000-000000000001'::uuid, 'basic', 'Basic haircut', 25000, 30, false),
  ('b1000000-0000-4000-8000-000000000001', 'basic-vitamin', 'Basic haircut & vitamin', 35000, 40, false),
  ('b1000000-0000-4000-8000-000000000001', 'kids', 'Kids haircut', 15000, 20, false),
  ('b1000000-0000-4000-8000-000000000001', 'coloring', 'Hair coloring', 55000, 90, false),
  ('b1000000-0000-4000-8000-000000000001', 'treatment', 'Hair treatment', 35000, 45, false),
  ('b1000000-0000-4000-8000-000000000001', 'massage', 'Special massage', 25000, 30, true),
  ('b1000000-0000-4000-8000-000000000001', 'extra-massage', 'Additional massage', 5000, 15, true),
  ('b1000000-0000-4000-8000-000000000002', 'basic', 'Basic haircut', 20000, 30, false),
  ('b1000000-0000-4000-8000-000000000002', 'fade', 'Skin fade', 30000, 35, false),
  ('b1000000-0000-4000-8000-000000000002', 'kids', 'Kids haircut', 12000, 20, false),
  ('b1000000-0000-4000-8000-000000000003', 'basic', 'Basic haircut', 18000, 30, false),
  ('b1000000-0000-4000-8000-000000000003', 'kids', 'Kids haircut', 10000, 20, false),
  ('b1000000-0000-4000-8000-000000000003', 'coloring', 'Hair coloring', 45000, 90, false),
  ('b1000000-0000-4000-8000-000000000004', 'basic', 'Basic haircut', 22000, 30, false),
  ('b1000000-0000-4000-8000-000000000004', 'fade', 'Premium fade', 35000, 40, false),
  ('b1000000-0000-4000-8000-000000000004', 'extra-massage', 'Additional massage', 5000, 15, true)
) AS v(barbershop_id, slug, name, price, duration, is_extra)
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE s.barbershop_id = v.barbershop_id AND s.slug = v.slug);

INSERT INTO reviews (barbershop_id, reviewer_name, user_name, rating, review_text, comment)
SELECT v.barbershop_id, v.reviewer_name, v.reviewer_name, v.rating, v.review_text, v.review_text
FROM (VALUES
  ('b1000000-0000-4000-8000-000000000001'::uuid, 'Satya', 4.0, 'Pelayanan bagus di Purwokerto.'),
  ('b1000000-0000-4000-8000-000000000001', 'Nanda', 5.0, 'Lokasinya dekat alun-alun, hasil rapi.'),
  ('b1000000-0000-4000-8000-000000000001', 'Dhimas', 4.0, 'Harganya terjangkau, pelayanan bagus.'),
  ('b1000000-0000-4000-8000-000000000002', 'Erik', 5.0, 'Fade cut juara, cocok buat mahasiswa UNSOED.'),
  ('b1000000-0000-4000-8000-000000000003', 'Rina', 4.5, 'Antrean teratur berkat Cukurin.'),
  ('b1000000-0000-4000-8000-000000000004', 'Fajar', 5.0, 'Skin fade terbaik di Purwokerto.')
) AS v(barbershop_id, reviewer_name, rating, review_text)
WHERE NOT EXISTS (SELECT 1 FROM reviews r WHERE r.barbershop_id = v.barbershop_id AND r.reviewer_name = v.reviewer_name);

INSERT INTO coupons (code, discount_amount, is_active) VALUES
  ('DISC20PERCEN', 5000, true),
  ('PWTHEMAT10', 10000, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO bookings (
  user_id, barbershop_id, barbershop_name, booking_date, booking_time,
  jadwal, service_name, extra_services, subtotal, discount, coupon_code,
  total, payment_status, status, notes, payment_ref
)
SELECT
  'a1000000-0000-4000-8000-000000000001'::uuid,
  'b1000000-0000-4000-8000-000000000001'::uuid,
  'Masterpiece Barbershop Purwokerto',
  CURRENT_DATE + INTERVAL '3 days', '10:00'::time,
  'Sabtu, ' || TO_CHAR(CURRENT_DATE + INTERVAL '3 days', 'DD Mon YYYY') || ' - 10:00',
  'Basic haircut', 'Additional massage',
  30000, 5000, 'DISC20PERCEN', 25000, 'paid', 'paid',
  'Sabtu, ' || TO_CHAR(CURRENT_DATE + INTERVAL '3 days', 'DD Mon YYYY') || ' - 10:00',
  'PAY-DEMO-001'
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE payment_ref = 'PAY-DEMO-001');
