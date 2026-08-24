// ============================================================
// CaVe – Shared Form Types for Borrowing Form
// ============================================================

export interface EquipmentItem {
  id: string;
  name: string;
  qty: number;
}

export interface GroupMember {
  id: string;
  name: string;
  nim: string;
}

export interface PrintFormData {
  // Section 1: Informasi Peminjaman
  labStudio: string;
  roomId: string;
  checkoutDate: string;   // ISO "2026-09-04"
  checkoutShift: string;  // "Shift 1"
  checkinDate: string;
  checkinShift: string;

  // Section 2: Aset
  equipment: EquipmentItem[];

  // Section 3: Informasi Peminjam
  borrowerName: string;
  binusianId: string;
  classText: string;
  contactNo: string;
  email: string;
  purpose: string;
  groupMembers: GroupMember[];
}

export interface SectionValidation {
  section1: boolean;
  section2: boolean;
  section3: boolean;
  isComplete: boolean;
  messages: string[];
}

export function validateFormData(data: PrintFormData): SectionValidation {
  const messages: string[] = [];

  const section1 = !!(
    data.checkoutDate &&
    data.checkoutShift &&
    data.checkinDate &&
    data.checkinShift
  );
  if (!data.checkoutDate)  messages.push('Tanggal check-out wajib diisi');
  if (!data.checkoutShift) messages.push('Shift check-out wajib dipilih');
  if (!data.checkinDate)   messages.push('Tanggal check-in wajib diisi');
  if (!data.checkinShift)  messages.push('Shift check-in wajib dipilih');

  const section2 = data.equipment.some((e) => e.name.trim() !== '');
  if (!section2) messages.push('Minimal satu aset/peralatan wajib diisi');

  const section3 = !!(data.binusianId.trim() && data.purpose.trim());
  if (!data.binusianId.trim()) messages.push('Binusian ID wajib diisi');
  if (!data.purpose.trim())    messages.push('Tujuan peminjaman wajib diisi');

  return {
    section1,
    section2,
    section3,
    isComplete: section1 && section2 && section3,
    messages,
  };
}

export const EMPTY_FORM: PrintFormData = {
  labStudio: '',
  roomId: '',
  checkoutDate: '',
  checkoutShift: '',
  checkinDate: '',
  checkinShift: '',
  equipment: [{ id: 'eq-0', name: '', qty: 1 }],
  borrowerName: '',
  binusianId: '',
  classText: '',
  contactNo: '',
  email: '',
  purpose: '',
  groupMembers: Array.from({ length: 5 }, (_, i) => ({
    id: `member-${i}`,
    name: '',
    nim: '',
  })),
};
