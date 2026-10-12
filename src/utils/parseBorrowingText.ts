// ============================================================
// Parse pasted borrowing text from labfacility.apps.binus.ac.id
// into a structured BorrowingDetail-like object
// ============================================================

import type { Asset, BorrowingAsset } from '../lib/types';

export interface ParsedAsset {
  name: string;
  model: string;
  year: string;
  assetCode: string; // extracted from "Name - CODE" pattern
}

export interface ParsedBorrowing {
  assets: ParsedAsset[];
  binusianId: string;
  email: string;
  phone: string;
  purpose: string;
  checkoutDate: string;   // raw text e.g. "04 Sept 2026"
  checkoutShift: string;  // "Shift 1"
  checkinDate: string;
  checkinShift: string;
  status: string;
  roomId: string;         // "MDN803F" (from "Room : MDN803F")
  roomName: string;       // "Photography Laboratory"
}

/**
 * Parse the multi-line text that is copied from the borrowing history detail page.
 *
 * Expected format:
 *   Assets
 *   image not found
 *   <Asset Name> - <Code>
 *   <Model>
 *   <Year>
 *   ... (repeat for each asset)
 *   Borrower : <BinusianID>
 *   Email
 *   <email>
 *   Phone
 *   <phone>
 *   Purpose
 *   <purpose>
 *   Check-out Date
 *   <date> (<shift>)
 *   Check-in Date
 *   <date> (<shift>)
 *   Status
 *   <status>
 *
 * Also supports the room-borrowing variant:
 *   Assets : 13
 *   ...
 *   Notes
 *   <purpose>
 *   Room : <RoomID>
 *   <Room name>
 *   <Location>
 *   Borrowing Date
 *   <date> (Shift 2, 3, 4)
 */
export function parseBorrowingText(raw: string): ParsedBorrowing | null {
  try {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const result: ParsedBorrowing = {
      assets: [],
      binusianId: '',
      email: '',
      phone: '',
      purpose: '',
      checkoutDate: '',
      checkoutShift: '',
      checkinDate: '',
      checkinShift: '',
      status: '',
      roomId: '',
      roomName: '',
    };

    // ---- Parse assets section ----
    // Header can be "Assets" or "Assets : 13"
    const assetsStart = lines.findIndex((l) => /^assets\b/i.test(l));
    // Find "Borrower :" line
    const borrowerLineIdx = lines.findIndex((l) => /^borrower\b/i.test(l));

    if (assetsStart !== -1 && borrowerLineIdx !== -1) {
      const assetLines = lines.slice(assetsStart + 1, borrowerLineIdx);
      // Group: every asset block = [image not found?, Name - Code, Model, Year]
      // Pattern: skip "image not found", then 3 data lines
      let i = 0;
      while (i < assetLines.length) {
        // Skip image placeholder lines (exact match only, so asset names
        // containing the word "image" are not dropped)
        if (/^image not found$/i.test(assetLines[i])) {
          i++;
          continue;
        }

        // Expect: "Name - Code"
        const nameLine = assetLines[i];
        const dashIdx = nameLine.lastIndexOf(' - ');
        const name = dashIdx !== -1 ? nameLine.substring(0, dashIdx).trim() : nameLine;
        const assetCode = dashIdx !== -1 ? nameLine.substring(dashIdx + 3).trim() : '';

        const model = assetLines[i + 1] ?? '';
        const year = assetLines[i + 2] ?? '';

        result.assets.push({ name, model, year, assetCode });
        i += 3;
      }
    }

    // ---- Parse borrower section ----
    if (borrowerLineIdx !== -1) {
      // "Borrower : BN001563852"
      const borrowerLine = lines[borrowerLineIdx];
      const colonIdx = borrowerLine.indexOf(':');
      result.binusianId = colonIdx !== -1 ? borrowerLine.substring(colonIdx + 1).trim() : '';

      const rest = lines.slice(borrowerLineIdx + 1);

      const getValue = (key: string): string => {
        const idx = rest.findIndex((l) => l === key);
        return idx !== -1 ? (rest[idx + 1] ?? '') : '';
      };

      result.email = getValue('Email');
      result.phone = getValue('Phone');
      result.purpose = getValue('Purpose') || getValue('Notes');

      // Parse "04 Sept 2026 (Shift 1)"
      const parseDateTime = (raw: string) => {
        const match = raw.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) return { date: match[1].trim(), shift: match[2].trim() };
        return { date: raw, shift: '' };
      };

      const checkoutRaw = getValue('Check-out Date');
      const checkinRaw = getValue('Check-in Date');
      const borrowingRaw = getValue('Borrowing Date');

      if (checkoutRaw || checkinRaw) {
        const { date: coDate, shift: coShift } = parseDateTime(checkoutRaw);
        const { date: ciDate, shift: ciShift } = parseDateTime(checkinRaw);
        result.checkoutDate = coDate;
        result.checkoutShift = coShift;
        result.checkinDate = ciDate;
        result.checkinShift = ciShift;
      } else if (borrowingRaw) {
        // "16 Oct 2026 (Shift 2, 3, 4)" → check-out Shift 2, check-in Shift 4, same day
        const { date, shift } = parseDateTime(borrowingRaw);
        const nums = shift.match(/\d+/g) ?? [];
        result.checkoutDate = date;
        result.checkinDate = date;
        if (nums.length > 0) {
          result.checkoutShift = `Shift ${nums[0]}`;
          result.checkinShift = `Shift ${nums[nums.length - 1]}`;
        }
      }

      result.status = getValue('Status');

      // "Room : MDN803F" followed by room name line
      const roomIdx = rest.findIndex((l) => /^room\s*:/i.test(l));
      if (roomIdx !== -1) {
        const roomLine = rest[roomIdx];
        result.roomId = roomLine.substring(roomLine.indexOf(':') + 1).trim();
        const next = rest[roomIdx + 1] ?? '';
        if (next && next !== 'Borrowing Date') result.roomName = next;
      }
    }

    return result;
  } catch {
    return null;
  }
}

/** Convert ParsedBorrowing assets into BorrowingAsset-like objects for rendering */
export function parsedAssetsToDisplay(
  parsed: ParsedAsset[]
): Array<BorrowingAsset & { asset: Asset }> {
  return parsed.map((p, idx) => ({
    id: `parsed-${idx}`,
    borrowing_id: 'parsed',
    asset_id: `parsed-${idx}`,
    qty: 1,
    checkout_ok: null,
    checkin_ok: null,
    asset: {
      id: `parsed-${idx}`,
      asset_code: p.assetCode,
      name: p.name,
      model: p.model,
      year: parseInt(p.year) || null,
      image_url: null,
      created_at: new Date().toISOString(),
    },
  }));
}
