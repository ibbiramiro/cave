// ============================================================
// CaVe – TypeScript Types (mirrors Supabase schema)
// ============================================================

// ── Auth & Users ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'staff' | 'coordinator';
  created_at: string;
  updated_at: string;
}

// ── Locations & Rooms ─────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Room {
  id: string;
  location_id: string;
  name: string;
  floor: number;
  capacity: number;
  facilities: string[];
  status: 'available' | 'booked' | 'maintenance';
  created_at: string;
}

// ── Events ────────────────────────────────────────────────────

export type EventFormat = 'onsite' | 'hybrid' | 'online';
export type EventStatus = 'draft' | 'confirmed' | 'cancelled' | 'completed';

export interface CaveEvent {
  id: string;
  user_id: string | null;
  event_name: string;
  pic_name: string;
  format: EventFormat;
  location_id: string | null;
  room_id: string | null;
  start_date: string;       // ISO date
  end_date: string;
  start_time: string;       // HH:mm
  end_time: string;
  has_gr: boolean;
  is_director: boolean;
  status: EventStatus;
  layout_file_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  room?: Room;
  location?: Location;
  participants?: EventParticipant[];
  online_meeting?: OnlineMeeting;
  it_support?: ITSupportRequest;
}

export type ParticipantType = 'BOM' | 'Karyawan BINUS' | 'MD' | 'External' | 'Rektor' | 'Mahasiswa' | 'Other';

export interface EventParticipant {
  id: string;
  event_id: string;
  type: ParticipantType;
  other_detail: string | null;
  created_at: string;
}

export type MeetingPlatform = 'zoom' | 'teams';

export interface OnlineMeeting {
  id: string;
  event_id: string;
  platform: MeetingPlatform;
  meeting_link: string | null;
  meeting_id: string | null;
  created_at: string;
}

export type ITBundle = 'basic' | 'hybrid' | 'stage';
export type ITSupportStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface ITSupportRequest {
  id: string;
  event_id: string;
  needs_audio: boolean;
  needs_streaming: boolean;
  needs_technician: boolean;
  bundle: ITBundle | null;
  additional_notes: string | null;
  status: ITSupportStatus;
  created_at: string;
  updated_at: string;
}

// ── Borrowing System (existing) ───────────────────────────────

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
  checkout_date: string | null;
  checkout_shift: string | null;
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
  asset?: Asset;
}

export interface BorrowingMember {
  id: string;
  borrowing_id: string;
  name: string | null;
  nim: string | null;
  sort_order: number;
}

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
      users: { Row: User; Insert: Omit<User, 'created_at' | 'updated_at'>; Update: Partial<User> };
      locations: { Row: Location; Insert: Omit<Location, 'id' | 'created_at'>; Update: Partial<Location> };
      rooms: { Row: Room; Insert: Omit<Room, 'id' | 'created_at'>; Update: Partial<Room> };
      events: { Row: CaveEvent; Insert: Omit<CaveEvent, 'id' | 'created_at' | 'updated_at'>; Update: Partial<CaveEvent> };
      event_participants: { Row: EventParticipant; Insert: Omit<EventParticipant, 'id' | 'created_at'>; Update: Partial<EventParticipant> };
      online_meetings: { Row: OnlineMeeting; Insert: Omit<OnlineMeeting, 'id' | 'created_at'>; Update: Partial<OnlineMeeting> };
      it_support_requests: { Row: ITSupportRequest; Insert: Omit<ITSupportRequest, 'id' | 'created_at' | 'updated_at'>; Update: Partial<ITSupportRequest> };
      borrowers: { Row: Borrower; Insert: Omit<Borrower, 'id' | 'created_at'>; Update: Partial<Borrower> };
      assets: { Row: Asset; Insert: Omit<Asset, 'id' | 'created_at'>; Update: Partial<Asset> };
      borrowings: { Row: Borrowing; Insert: Omit<Borrowing, 'id' | 'created_at'>; Update: Partial<Borrowing> };
      borrowing_assets: { Row: BorrowingAsset; Insert: Omit<BorrowingAsset, 'id'>; Update: Partial<BorrowingAsset> };
      borrowing_members: { Row: BorrowingMember; Insert: Omit<BorrowingMember, 'id'>; Update: Partial<BorrowingMember> };
    };
  };
};
