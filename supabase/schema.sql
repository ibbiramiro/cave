-- ============================================================
-- CaVe – Calendar Event Management System
-- Complete Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS (synced from Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT DEFAULT 'staff',   -- 'admin' | 'staff' | 'coordinator'
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. LOCATIONS (kampus)
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT UNIQUE NOT NULL,       -- e.g. "Binus@Medan"
  address       TEXT,
  city          TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

INSERT INTO locations (name, address, city) VALUES
  ('Binus@Medan', 'Jl. Ahmad Yani No.12', 'Medan'),
  ('Binus@Kemanggisan', 'Jl. Kemanggisan Ilir III No.45', 'Jakarta'),
  ('Binus@Alam Sutera', 'Jl. Jalur Sutera Barat Kav. 21', 'Tangerang')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 3. ROOMS (ruangan fisik)
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   UUID REFERENCES locations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,              -- e.g. "Meeting Rm", "Lab 303"
  floor         INT NOT NULL DEFAULT 1,
  capacity      INT DEFAULT 0,
  facilities    TEXT[] DEFAULT '{}',        -- e.g. {"Proyektor","AC","Whiteboard"}
  status        TEXT DEFAULT 'available',   -- 'available' | 'booked' | 'maintenance'
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Seed rooms for Binus@Medan
INSERT INTO rooms (location_id, name, floor, capacity, facilities, status) VALUES
  ((SELECT id FROM locations WHERE name='Binus@Medan'), '301', 3, 30, '{"Proyektor","AC","Whiteboard"}', 'available'),
  ((SELECT id FROM locations WHERE name='Binus@Medan'), '302', 3, 25, '{"Proyektor","AC"}', 'available'),
  ((SELECT id FROM locations WHERE name='Binus@Medan'), 'Lab 303', 3, 40, '{"Proyektor","AC","Komputer"}', 'available'),
  ((SELECT id FROM locations WHERE name='Binus@Medan'), 'Meeting Rm', 3, 15, '{"Proyektor","AC"}', 'available'),
  ((SELECT id FROM locations WHERE name='Binus@Medan'), 'Auditorium', 3, 200, '{"Proyektor","Sound System","AC","Panggung"}', 'booked'),
  ((SELECT id FROM locations WHERE name='Binus@Medan'), 'Lab 402', 4, 35, '{"Proyektor","AC","Komputer"}', 'available')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. EVENTS (acara utama)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  event_name        TEXT NOT NULL,
  pic_name          TEXT NOT NULL,
  format            TEXT NOT NULL CHECK (format IN ('onsite','hybrid','online')),
  location_id       UUID REFERENCES locations(id) ON DELETE SET NULL,
  room_id           UUID REFERENCES rooms(id) ON DELETE SET NULL,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  has_gr            BOOLEAN DEFAULT false,
  is_director       BOOLEAN DEFAULT false,
  status            TEXT DEFAULT 'confirmed' CHECK (status IN ('draft','confirmed','cancelled','completed')),
  layout_file_url   TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. EVENT PARTICIPANTS (target peserta)
-- ============================================================
CREATE TABLE IF NOT EXISTS event_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,   -- 'BOM','Karyawan BINUS','MD','External','Rektor','Mahasiswa','Other'
  other_detail  TEXT,            -- filled when type = 'Other'
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. ONLINE MEETINGS (for hybrid/online events)
-- ============================================================
CREATE TABLE IF NOT EXISTS online_meetings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  platform      TEXT NOT NULL CHECK (platform IN ('zoom','teams')),
  meeting_link  TEXT,
  meeting_id    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. IT SUPPORT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS it_support_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  needs_audio       BOOLEAN DEFAULT false,
  needs_streaming   BOOLEAN DEFAULT false,
  needs_technician  BOOLEAN DEFAULT false,
  bundle            TEXT CHECK (bundle IN ('basic','hybrid','stage',NULL)),
  additional_notes  TEXT,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- EXISTING TABLES (preserved from borrowing system)
-- ============================================================
CREATE TABLE IF NOT EXISTS borrowers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  binusian_id   TEXT UNIQUE NOT NULL,
  name          TEXT,
  email         TEXT,
  phone         TEXT,
  class         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code    TEXT UNIQUE,
  name          TEXT NOT NULL,
  model         TEXT,
  year          INT,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS borrowings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id     UUID REFERENCES borrowers(id) ON DELETE SET NULL,
  purpose         TEXT,
  checkout_date   DATE,
  checkout_shift  TEXT,
  checkin_date    DATE,
  checkin_shift   TEXT,
  status          TEXT DEFAULT 'Pending',
  lab_studio      TEXT,
  room_id         TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS borrowing_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrowing_id    UUID REFERENCES borrowings(id) ON DELETE CASCADE,
  asset_id        UUID REFERENCES assets(id) ON DELETE CASCADE,
  qty             INT DEFAULT 1,
  checkout_ok     BOOLEAN,
  checkin_ok      BOOLEAN
);

CREATE TABLE IF NOT EXISTS borrowing_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrowing_id    UUID REFERENCES borrowings(id) ON DELETE CASCADE,
  name            TEXT,
  nim             TEXT,
  sort_order      INT DEFAULT 0
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_support_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Events: users can CRUD their own events
CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

-- Participants, meetings, IT requests: follow event ownership
CREATE POLICY "Manage own event participants" ON event_participants
  FOR ALL USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Manage own online meetings" ON online_meetings
  FOR ALL USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));
CREATE POLICY "Manage own IT support" ON it_support_requests
  FOR ALL USING (event_id IN (SELECT id FROM events WHERE user_id = auth.uid()));

-- Locations and rooms are public read
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Anyone can read rooms" ON rooms FOR SELECT USING (true);

-- ============================================================
-- SEED DATA (borrowing system — preserved)
-- ============================================================
INSERT INTO borrowers (binusian_id, name, email, phone, class) VALUES
  ('BN001563852', 'Trevince Wu', 'trevince.wu@binus.ac.id', '081361928186', NULL)
ON CONFLICT (binusian_id) DO NOTHING;

INSERT INTO assets (asset_code, name, model, year) VALUES
  ('2703', 'Baterai Kamera Mirroless Sony NP-FZ100', 'NP-FZ100', 2025),
  ('2704', 'Baterai Kamera Mirroless Sony NP-FZ100', 'NP-FZ100', 2025),
  ('2705', 'Baterai Kamera Mirroless Sony NP-FZ100', 'NP-FZ100', 2025),
  ('2706', 'Baterai Kamera Mirroless Sony NP-FZ100', 'NP-FZ100', 2025),
  ('2707', 'Card Reader MRW-G2', 'MRW-G2 Card Reader', 2025),
  ('2684', 'Kamera Mirroless Sony Interchangeable Lenses', 'Alpha 7 RV', 2025),
  ('2685', 'Kamera Mirroless Sony Interchangeable Lenses', 'Alpha 7 RV', 2025),
  ('2700', 'Lensa 28-70mm', 'Zoom - FE 28-70mm f/2 GM', 2025),
  ('2701', 'Lensa70-200 Macro', 'Zoom - FE 70-200mm f/4 G OSS', 2025),
  ('2710', 'Tripod', 'BeFree Live MVKBFRT-LIVE', 2025)
ON CONFLICT (asset_code) DO NOTHING;
