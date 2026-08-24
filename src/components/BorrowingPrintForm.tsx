import React from 'react';
import type { PrintFormData } from '../lib/formTypes';
import { getTimeRange, formatDateLong } from '../utils/shiftMapping';

interface BorrowingPrintFormProps {
  data: PrintFormData;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout constants  (all in px — html2canvas renders at 96 dpi)
// A4 = 794 × 1123 px @ 96 dpi
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_W  = 794;   // A4 width
const PAD_H   = 62;    // left/right padding  → ~16.5 mm
const PAD_V   = 48;    // top/bottom padding  → ~12.7 mm
const CONT_W  = PAGE_W - PAD_H * 2;   // 670 px usable content width

// Table column widths must sum to CONT_W (670)
const COL_MAT_NAME  = 124;   // 18.5%
const COL_MAT_QTY   = 38;    // 5.7%
const COL_EQ_NAME   = 220;   // 32.8%
const COL_EQ_QTY    = 38;    // 5.7%
const COL_CHKOUT    = 125;   // 18.7%
const COL_CHKIN     = CONT_W - COL_MAT_NAME - COL_MAT_QTY - COL_EQ_NAME - COL_EQ_QTY - COL_CHKOUT; // 125

// Shared border style
const BORDER = '1px solid #1a1a1a';
const BG_HEADER = '#f0f0f0';

// ─────────────────────────────────────────────────────────────────────────────
// Shared cell styles
// ─────────────────────────────────────────────────────────────────────────────
const TH: React.CSSProperties = {
  border: BORDER,
  padding: '4px 5px',
  textAlign: 'center',
  fontWeight: 'bold',
  verticalAlign: 'middle',
  fontSize: '9px',
  lineHeight: '1.35',
  background: BG_HEADER,
};

const TD_C: React.CSSProperties = {
  border: BORDER,
  padding: '3px 4px',
  textAlign: 'center',
  verticalAlign: 'middle',
  fontSize: '9px',
  lineHeight: '1.35',
  height: '20px',
};

const TD_L: React.CSSProperties = {
  border: BORDER,
  padding: '3px 6px',
  textAlign: 'left',
  verticalAlign: 'middle',
  fontSize: '9px',
  lineHeight: '1.35',
  height: '20px',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
};

// ─────────────────────────────────────────────────────────────────────────────
// Underlined field value span
// ─────────────────────────────────────────────────────────────────────────────
const Underline = ({
  value,
  flex,
  width,
  ml,
}: {
  value: string;
  flex?: number;
  width?: number;
  ml?: number;
}) => (
  <span
    style={{
      display: 'inline-block',
      flex: flex ?? undefined,
      width: width ? `${width}px` : undefined,
      borderBottom: `1px solid #1a1a1a`,
      paddingLeft: '4px',
      paddingBottom: '1px',
      minWidth: width ? undefined : '60px',
      marginLeft: ml ? `${ml}px` : undefined,
      lineHeight: '1.5',
    }}
  >
    {value}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// Field row: "Label : value____"
// ─────────────────────────────────────────────────────────────────────────────
const FieldRow = ({
  label,
  value,
  mb = 9,
}: {
  label: string;
  value: string;
  mb?: number;
}) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', marginBottom: `${mb}px` }}>
    <span style={{ whiteSpace: 'nowrap', fontWeight: 'normal' }}>{label}</span>
    <span style={{ margin: '0 3px 0 2px' }}>:</span>
    <Underline value={value} flex={1} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const BorrowingPrintForm = React.forwardRef<HTMLDivElement, BorrowingPrintFormProps>(
  ({ data }, ref) => {
    const {
      labStudio, roomId,
      borrowerName, binusianId, classText, contactNo,
      purpose, checkoutDate, checkoutShift, checkinShift,
      equipment, groupMembers,
    } = data;

    const dateText = checkoutDate ? formatDateLong(checkoutDate) : '';
    const timeText =
      getTimeRange(checkoutShift || null, checkinShift || null) ||
      [checkoutShift, checkinShift].filter(Boolean).join(' – ');

    // Equipment rows (15 minimum)
    const filledEquip = equipment.filter((e) => e.name.trim() !== '');
    const paddedEquip = [...filledEquip];
    while (paddedEquip.length < 15) paddedEquip.push({ id: '', name: '', qty: 0 });

    // Members (always 5)
    const members = [...groupMembers.slice(0, 5)];
    while (members.length < 5) members.push({ id: '', name: '', nim: '' });

    return (
      <div
        ref={ref}
        id="borrowing-print-form"
        style={{
          width: `${PAGE_W}px`,
          minHeight: '1123px',
          background: '#ffffff',
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: '11px',
          color: '#000000',
          padding: `${PAD_V}px ${PAD_H}px`,
          boxSizing: 'border-box',
          lineHeight: '1.5',
          position: 'relative',
        }}
      >
        {/* ── Form Reference Code ──────────────────────────────────── */}
        <div style={{
          textAlign: 'right',
          fontSize: '8px',
          marginBottom: '4px',
          letterSpacing: '0.04em',
          color: '#333',
        }}>
          FM-BINUS-AA-FPT-424/R0
        </div>

        {/* ── Title ───────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '3px',
          letterSpacing: '0.01em',
        }}>
          Room &amp; Equipment Borrowing Form
        </div>

        {/* ── Lab/Studio ──────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center',
          fontSize: '11px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '4px',
        }}>
          <span>Lab/Studio</span>
          <span style={{
            display: 'inline-block',
            width: '140px',
            borderBottom: '1px solid #1a1a1a',
            paddingLeft: '4px',
            paddingBottom: '1px',
          }}>
            {labStudio}
          </span>
        </div>

        {/* ── Name ────────────────────────────────────────────────── */}
        <FieldRow label="Name" value={borrowerName} mb={9} />

        {/* ── Binusian ID / Class / Contact No ────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', marginBottom: '9px' }}>
          <span style={{ whiteSpace: 'nowrap' }}>Binusian ID / Lecturer ID</span>
          <span style={{ margin: '0 3px 0 2px' }}>:</span>
          <Underline value={binusianId} width={115} />
          <span style={{ whiteSpace: 'nowrap', marginLeft: '12px' }}>Class</span>
          <span style={{ margin: '0 3px 0 2px' }}>:</span>
          <Underline value={classText} width={75} />
          <span style={{ whiteSpace: 'nowrap', marginLeft: '12px' }}>Contact No</span>
          <span style={{ margin: '0 3px 0 2px' }}>:</span>
          <Underline value={contactNo} flex={1} />
        </div>

        {/* ── Group Members ────────────────────────────────────────── */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Group Member (Name / NIM):
          </div>
          {members.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '3px',
                marginBottom: '6px',
              }}
            >
              <span style={{ width: '16px', textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
              <Underline value={m.name} flex={1} />
              <span style={{ margin: '0 6px', flexShrink: 0 }}>/</span>
              <Underline value={m.nim} width={148} />
            </div>
          ))}
        </div>

        {/* ── Purpose ─────────────────────────────────────────────── */}
        <FieldRow label="Purpose" value={purpose} mb={9} />

        {/* ── Date & Time ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', marginBottom: '9px' }}>
          <span>Date</span>
          <span style={{ margin: '0 3px 0 2px' }}>:</span>
          <Underline value={dateText} width={188} />
          <span style={{ whiteSpace: 'nowrap', marginLeft: '20px' }}>Time</span>
          <span style={{ margin: '0 3px 0 2px' }}>:</span>
          <Underline value={timeText} flex={1} />
        </div>

        {/* ── Room ID / Location ───────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', marginBottom: '14px' }}>
          <span>Room ID / Location</span>
          <span style={{ margin: '0 3px 0 2px' }}>:</span>
          <Underline value={roomId} width={224} />
        </div>

        {/* ── Equipment Table ──────────────────────────────────────── */}
        <table
          style={{
            width: `${CONT_W}px`,
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <colgroup>
            <col style={{ width: `${COL_MAT_NAME}px` }} />
            <col style={{ width: `${COL_MAT_QTY}px`  }} />
            <col style={{ width: `${COL_EQ_NAME}px`  }} />
            <col style={{ width: `${COL_EQ_QTY}px`   }} />
            <col style={{ width: `${COL_CHKOUT}px`   }} />
            <col style={{ width: `${COL_CHKIN}px`    }} />
          </colgroup>

          <thead>
            {/* Row 1: Section headers */}
            <tr>
              <th colSpan={2} style={TH}>MATERIAL</th>
              <th colSpan={4} style={TH}>EQUIPMENT</th>
            </tr>

            {/* Row 2: Column labels */}
            <tr>
              <th style={TH}>MATERIAL NAME</th>
              <th style={TH}>QTY</th>
              <th style={TH}>EQUIPMENT NAME</th>
              <th style={TH}>QTY</th>
              <th
                colSpan={2}
                style={{ ...TH, fontSize: '8px', lineHeight: '1.3' }}
              >
                Checklist (✓) at each column if the
                <br />equipment(s) are in good condition
              </th>
            </tr>

            {/* Row 3: Check Out / Check In sub-headers */}
            <tr>
              <th style={TH}></th>
              <th style={TH}></th>
              <th style={TH}></th>
              <th style={TH}></th>
              <th style={TH}>CHECK OUT</th>
              <th style={TH}>CHECK IN</th>
            </tr>
          </thead>

          <tbody>
            {paddedEquip.map((eq, i) => (
              <tr key={i}>
                <td style={TD_L}></td>
                <td style={TD_C}></td>
                <td style={{ ...TD_L, height: eq.name ? 'auto' : '20px' }}>
                  {eq.name}
                </td>
                <td style={TD_C}>{eq.qty > 0 ? eq.qty : ''}</td>
                <td style={TD_C}></td>
                <td style={TD_C}></td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            {/* Signature label row */}
            <tr>
              <td colSpan={2} style={{ border: 'none' }}></td>
              <td style={{ ...TH, fontWeight: 'bold' }}>Staff</td>
              <td style={{ ...TH, fontWeight: 'bold', fontSize: '8px' }}>
                Check out<br />by:
              </td>
              <td style={{ ...TH, fontWeight: 'bold' }}>Staff</td>
              <td style={{ ...TH, fontWeight: 'bold', fontSize: '8px' }}>
                Check in<br />by:
              </td>
            </tr>
            {/* Signature space row */}
            <tr>
              <td colSpan={2} style={{ border: 'none' }}></td>
              <td style={{ ...TD_C, height: '52px' }}></td>
              <td style={{ ...TD_C, height: '52px' }}></td>
              <td style={{ ...TD_C, height: '52px' }}></td>
              <td style={{ ...TD_C, height: '52px' }}></td>
            </tr>
          </tfoot>
        </table>

        {/* ── Disclaimer ───────────────────────────────────────────── */}
        <div style={{
          marginTop: '14px',
          fontSize: '8.5px',
          textAlign: 'center',
          lineHeight: '1.6',
          color: '#111',
        }}>
          The borrower (and members) responsible and willing to accept all the consequences if things happen to the
          borrowed room &amp; equipment, and are willing to accept sanctions if you are late returning the room &amp; equipment.
        </div>
      </div>
    );
  }
);

BorrowingPrintForm.displayName = 'BorrowingPrintForm';
export default BorrowingPrintForm;
