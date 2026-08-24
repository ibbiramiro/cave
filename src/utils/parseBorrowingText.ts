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
    };

    // ---- Parse assets section ----
    // Find "Assets" header
    const assetsStart = lines.findIndex((l) => l === 'Assets');
    // Find "Borrower :" line
    const borrowerLineIdx = lines.findIndex((l) => l.startsWith('Borrower'));

    if (assetsStart !== -1 && borrowerLineIdx !== -1) {
      const assetLines = lines.slice(assetsStart + 1, borrowerLineIdx);
      // Group: every asset block = [image not found?, Name - Code, Model, Year]
      // Pattern: skip "image not found", then 3 data lines
      let i = 0;
      while (i < assetLines.length) {
        // Skip image placeholder lines
        if (assetLines[i].toLowerCase().includes('image not found') ||
          assetLines[i].toLowerCase().includes('image')) {
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
      result.purpose = getValue('Purpose');

      // Parse "04 Sept 2026 (Shift 1)"
      const parseDateTime = (raw: string) => {
        const match = raw.match(/^(.+?)\s*\((.+?)\)$/);
        if (match) return { date: match[1].trim(), shift: match[2].trim() };
        return { date: raw, shift: '' };
      };

      const checkoutRaw = getValue('Check-out Date');
      const checkinRaw = getValue('Check-in Date');
      const { date: coDate, shift: coShift } = parseDateTime(checkoutRaw);
      const { date: ciDate, shift: ciShift } = parseDateTime(checkinRaw);

      result.checkoutDate = coDate;
      result.checkoutShift = coShift;
      result.checkinDate = ciDate;
      result.checkinShift = ciShift;
      result.status = getValue('Status');
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
