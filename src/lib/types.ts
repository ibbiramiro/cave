// ============================================================
// CaVe – TypeScript Types (mirrors Supabase schema)
// ============================================================

export interface Borrower {
  id: string;
  binusian_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  class: string | null;
  created_at: string;
}

export interface Asset {
  id: string;
  asset_code: string | null;
  name: string;
  model: string | null;
  year: number | null;
  image_url: string | null;
  created_at: string;
}

export interface Borrowing {
  id: string;
  borrower_id: string | null;
  purpose: string | null;
  checkout_date: string | null;    // ISO date string
  checkout_shift: string | null;   // "Shift 1"
  checkin_date: string | null;
  checkin_shift: string | null;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Returned' | string;
  lab_studio: string | null;
  room_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface BorrowingAsset {
  id: string;
  borrowing_id: string;
  asset_id: string;
  qty: number;
  checkout_ok: boolean | null;
  checkin_ok: boolean | null;
  asset?: Asset;  // joined
}

export interface BorrowingMember {
  id: string;
  borrowing_id: string;
  name: string | null;
  nim: string | null;
  sort_order: number;
}

// Full borrowing detail with all relations joined
export interface BorrowingDetail extends Borrowing {
  borrower: Borrower | null;
  borrowing_assets: BorrowingAsset[];
  borrowing_members: BorrowingMember[];
}

// ============================================================
// Supabase Database generic type (used by createClient)
// ============================================================
export type Database = {
  public: {
    Tables: {
      borrowers: { Row: Borrower; Insert: Omit<Borrower, 'id' | 'created_at'>; Update: Partial<Borrower> };
      assets: { Row: Asset; Insert: Omit<Asset, 'id' | 'created_at'>; Update: Partial<Asset> };
      borrowings: { Row: Borrowing; Insert: Omit<Borrowing, 'id' | 'created_at'>; Update: Partial<Borrowing> };
      borrowing_assets: { Row: BorrowingAsset; Insert: Omit<BorrowingAsset, 'id'>; Update: Partial<BorrowingAsset> };
      borrowing_members: { Row: BorrowingMember; Insert: Omit<BorrowingMember, 'id'>; Update: Partial<BorrowingMember> };
    };
  };
};
