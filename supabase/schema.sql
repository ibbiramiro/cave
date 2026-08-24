-- ============================================================
-- CaVe – Room & Equipment Borrowing System
-- Schema FM-BINUS-AA-FPT-424/R0
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- BORROWERS (mahasiswa / staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS borrowers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  binusian_id   TEXT UNIQUE NOT NULL,   -- e.g. "BN001563852"
  name          TEXT,
  email         TEXT,
  phone         TEXT,
  class         TEXT,                   -- e.g. "LA01"
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ASSETS (peralatan lab)
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code    TEXT UNIQUE,            -- e.g. "2703"
  name          TEXT NOT NULL,          -- e.g. "Baterai Kamera Mirroless Sony NP-FZ100"
  model         TEXT,                   -- e.g. "NP-FZ100"
  year          INT,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- BORROWINGS (transaksi peminjaman)
-- ============================================================
CREATE TABLE IF NOT EXISTS borrowings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id     UUID REFERENCES borrowers(id) ON DELETE SET NULL,
  purpose         TEXT,
  checkout_date   DATE,
  checkout_shift  TEXT,                 -- e.g. "Shift 1"
  checkin_date    DATE,
  checkin_shift   TEXT,                 -- e.g. "Shift 6"
  status          TEXT DEFAULT 'Pending', -- Accepted | Pending | Rejected | Returned
  lab_studio      TEXT,                 -- e.g. "Studio A"
  room_id         TEXT,                 -- Room ID / Location
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- BORROWING ASSETS (many-to-many: borrowings <-> assets)
-- ============================================================
CREATE TABLE IF NOT EXISTS borrowing_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrowing_id    UUID REFERENCES borrowings(id) ON DELETE CASCADE,
  asset_id        UUID REFERENCES assets(id) ON DELETE CASCADE,
  qty             INT DEFAULT 1,
  checkout_ok     BOOLEAN,              -- checklist saat check-out
  checkin_ok      BOOLEAN               -- checklist saat check-in
);

-- ============================================================
-- BORROWING MEMBERS (anggota grup peminjaman)
-- ============================================================
CREATE TABLE IF NOT EXISTS borrowing_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrowing_id    UUID REFERENCES borrowings(id) ON DELETE CASCADE,
  name            TEXT,
  nim             TEXT,
  sort_order      INT DEFAULT 0
);

-- ============================================================
-- ROW LEVEL SECURITY (opsional, aktifkan jika perlu)
-- ============================================================
-- ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE borrowing_assets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE borrowing_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SEED DATA (contoh – hapus jika tidak diperlukan)
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

-- Insert a sample borrowing (ganti borrower_id sesuai UUID borrower di atas)
WITH b AS (SELECT id FROM borrowers WHERE binusian_id = 'BN001563852' LIMIT 1)
INSERT INTO borrowings (borrower_id, purpose, checkout_date, checkout_shift, checkin_date, checkin_shift, status)
SELECT b.id, 'Dokumentasi Inauguration', '2026-09-04', 'Shift 1', '2026-09-04', 'Shift 6', 'Accepted'
FROM b;
