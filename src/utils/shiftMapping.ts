// ============================================================
// Shift time mapping – BINUS Lab Facility standard shifts
// ============================================================

export interface ShiftInfo {
  label: string;    // "Shift 1"
  time: string;     // "07:00 - 09:00"
  start: string;    // "07:00"
  end: string;      // "09:00"
}

export const SHIFTS: Record<string, ShiftInfo> = {
  'Shift 1': { label: 'Shift 1', time: '07:00 - 09:00', start: '07:00', end: '09:00' },
  'Shift 2': { label: 'Shift 2', time: '09:00 - 11:00', start: '09:00', end: '11:00' },
  'Shift 3': { label: 'Shift 3', time: '11:00 - 13:00', start: '11:00', end: '13:00' },
  'Shift 4': { label: 'Shift 4', time: '13:00 - 15:00', start: '13:00', end: '15:00' },
  'Shift 5': { label: 'Shift 5', time: '15:00 - 17:00', start: '15:00', end: '17:00' },
  'Shift 6': { label: 'Shift 6', time: '17:00 - 19:00', start: '17:00', end: '19:00' },
  'Shift 7': { label: 'Shift 7', time: '19:00 - 21:00', start: '19:00', end: '21:00' },
};

export function getShiftInfo(shiftLabel: string | null | undefined): ShiftInfo | null {
  if (!shiftLabel) return null;
  return SHIFTS[shiftLabel] ?? null;
}

export function getTimeRange(checkoutShift: string | null, checkinShift: string | null): string {
  const outInfo = getShiftInfo(checkoutShift);
  const inInfo = getShiftInfo(checkinShift);

  if (outInfo && inInfo) {
    return `${outInfo.start} - ${inInfo.end}`;
  }
  if (outInfo) return outInfo.time;
  return '-';
}

/** Format date from ISO string to "04 September 2026" */
export function formatDateLong(isoDate: string | null): string {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Format date from ISO string to "04 Sept 2026" */
export function formatDateShort(isoDate: string | null, shift?: string | null): string {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  const base = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return shift ? `${base} (${shift})` : base;
}

/**
 * Convert a raw display date string like "04 Sept 2026" or "04 Sep 2026"
 * into ISO format "2026-09-04" suitable for HTML date inputs.
 */
export function parseRawDateToISO(raw: string): string {
  if (!raw) return '';
  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04',
    may: '05', jun: '06', jul: '07', aug: '08',
    sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
  };
  const match = raw.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (!match) return '';
  const day   = match[1].padStart(2, '0');
  const month = monthMap[match[2].toLowerCase()] ?? '01';
  const year  = match[3];
  return `${year}-${month}-${day}`;
}
