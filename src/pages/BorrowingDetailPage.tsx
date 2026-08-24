import { useState, useRef } from 'react';
import CaVeLogo from '../components/CaVeLogo';
import BorrowingPrintForm from '../components/BorrowingPrintForm';
import { EMPTY_FORM, validateFormData } from '../lib/formTypes';
import type { PrintFormData, EquipmentItem, GroupMember } from '../lib/formTypes';
import { SHIFTS } from '../utils/shiftMapping';
import { parseRawDateToISO } from '../utils/shiftMapping';
import { parseBorrowingText } from '../utils/parseBorrowingText';
import { generateBorrowingPdf } from '../utils/generatePdf';

// ── Section status helpers ────────────────────────────────────────────────────
const StatusDot = ({ ok, partial }: { ok: boolean; partial?: boolean }) => (
  <span
    className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
      ok ? 'bg-emerald-400' : partial ? 'bg-amber-400' : 'bg-white/20'
    }`}
  />
);

const SectionBadge = ({ n }: { n: number }) => (
  <span className="w-7 h-7 rounded-lg bg-cave-accent/20 text-cave-accent font-bold text-xs flex items-center justify-center flex-shrink-0 border border-cave-accent/30">
    {n}
  </span>
);

// ── Shared input classes ──────────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white ' +
  'placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-cave-accent/40 ' +
  'focus:border-cave-accent transition-all duration-200';

const labelCls = 'block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5';

export default function BorrowingDetailPage() {
  const [form, setForm] = useState<PrintFormData>(EMPTY_FORM);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parseError, setParseError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const printFormRef = useRef<HTMLDivElement>(null);
  const validation = validateFormData(form);

  // ── Generic field updater ─────────────────────────────────────────────────
  const upd = <K extends keyof PrintFormData>(field: K, val: PrintFormData[K]) =>
    setForm((p) => ({ ...p, [field]: val }));

  // ── Equipment helpers ─────────────────────────────────────────────────────
  const addEquipment = () =>
    setForm((p) => ({
      ...p,
      equipment: [...p.equipment, { id: `eq-${Date.now()}`, name: '', qty: 1 }],
    }));

  const removeEquipment = (id: string) =>
    setForm((p) => ({
      ...p,
      equipment: p.equipment.filter((e) => e.id !== id),
    }));

  const updEquipment = (id: string, field: keyof EquipmentItem, val: string | number) =>
    setForm((p) => ({
      ...p,
      equipment: p.equipment.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    }));

  // ── Member helper ─────────────────────────────────────────────────────────
  const updMember = (id: string, field: keyof GroupMember, val: string) =>
    setForm((p) => ({
      ...p,
      groupMembers: p.groupMembers.map((m) => (m.id === id ? { ...m, [field]: val } : m)),
    }));

  // ── Parse paste → auto-fill all sections ─────────────────────────────────
  const handleParsePaste = () => {
    const result = parseBorrowingText(pasteText);
    if (!result || !result.binusianId) {
      setParseError('Gagal membaca teks. Pastikan teks di-copy lengkap dari labfacility.');
      return;
    }

    // Group assets by name
    const grouped: Record<string, number> = {};
    for (const a of result.assets) {
      grouped[a.name] = (grouped[a.name] ?? 0) + 1;
    }
    const equipment: EquipmentItem[] = Object.entries(grouped).map(([name, qty], i) => ({
      id: `eq-paste-${i}`,
      name,
      qty,
    }));

    setForm((p) => ({
      ...p,
      checkoutDate:  parseRawDateToISO(result.checkoutDate),
      checkoutShift: result.checkoutShift,
      checkinDate:   parseRawDateToISO(result.checkinDate),
      checkinShift:  result.checkinShift,
      equipment:     equipment.length > 0 ? equipment : p.equipment,
      binusianId:    result.binusianId   || p.binusianId,
      email:         result.email        || p.email,
      contactNo:     result.phone        || p.contactNo,
      purpose:       result.purpose      || p.purpose,
    }));

    setShowPasteModal(false);
    setPasteText('');
    setParseError('');
  };

  // ── Generate PDF ──────────────────────────────────────────────────────────
  const handleGeneratePdf = async () => {
    if (!validation.isComplete || isGenerating) return;
    setIsGenerating(true);
    setPdfSuccess(false);
    try {
      await generateBorrowingPdf('borrowing-print-form', {
        filename: `BorrowingForm_${form.binusianId || 'form'}.pdf`,
        scale: 2,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const shiftOptions = Object.values(SHIFTS);

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(160deg, #040d1c 0%, #071324 50%, #091929 100%)' }}>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="bg-[#040d1c]/80 backdrop-blur-xl border-b border-white/[0.07] px-6 py-3 flex items-center gap-5 sticky top-0 z-40">
        <CaVeLogo size="sm" variant="full" />
        <div className="w-px h-5 bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-0.5 flex-1 flex-wrap">
          {['Borrowing History', 'User Management', 'Insert Borrowing', 'Report', 'Feedback', 'Room Management'].map((item) => (
            <button key={item} className="px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all duration-200 cursor-pointer">
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 hidden md:block">Welcome, <span className="text-white font-semibold">Ramiro Gunady</span></span>
          <button className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-colors cursor-pointer" title="Logout">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/30 mb-2">
              <span>CaVe</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              <span className="text-white/60">Borrowing Form</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Room &amp; Equipment Borrowing Form</h1>
            <p className="text-sm text-white/40 mt-1">FM-BINUS-AA-FPT-424/R0 · Isi semua bagian sebelum generate PDF</p>
          </div>

          {/* Quick-fill banner */}
          <button
            id="btn-quick-fill"
            onClick={() => setShowPasteModal(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10
              text-sky-300 text-xs font-semibold hover:bg-sky-500/20 hover:border-sky-500/50
              active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Auto-fill dari labfacility
          </button>
        </div>
      </div>

      {/* ── Main 2-column Layout ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,300px] gap-6 items-start">

          {/* ── LEFT: 3 Form Sections ──────────────────────────────────── */}
          <div className="space-y-5">

            {/* ══ SECTION 1: Informasi Peminjaman ══════════════════════ */}
            <div className={`rounded-2xl border transition-all duration-300 ${
              validation.section1
                ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                : 'border-white/[0.07] bg-white/[0.02]'
            }`}>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                <SectionBadge n={1} />
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-white">Informasi Peminjaman</h2>
                  <p className="text-[10px] text-white/35 mt-0.5">Tanggal, shift, dan lokasi peminjaman</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <StatusDot ok={validation.section1} />
                  <span className={validation.section1 ? 'text-emerald-400' : 'text-white/30'}>
                    {validation.section1 ? 'Lengkap' : 'Belum Diisi'}
                  </span>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                {/* Lab / Studio */}
                <div>
                  <label className={labelCls}>Lab / Studio</label>
                  <input
                    type="text"
                    value={form.labStudio}
                    onChange={(e) => upd('labStudio', e.target.value)}
                    placeholder="contoh: Studio A"
                    className={inputCls}
                  />
                </div>
                {/* Room ID */}
                <div>
                  <label className={labelCls}>Room ID / Location</label>
                  <input
                    type="text"
                    value={form.roomId}
                    onChange={(e) => upd('roomId', e.target.value)}
                    placeholder="contoh: R601"
                    className={inputCls}
                  />
                </div>
                {/* Checkout Date */}
                <div>
                  <label className={labelCls}>Tanggal Check-Out <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={form.checkoutDate}
                    onChange={(e) => upd('checkoutDate', e.target.value)}
                    className={`${inputCls} [color-scheme:dark]`}
                  />
                </div>
                {/* Checkout Shift */}
                <div>
                  <label className={labelCls}>Shift Check-Out <span className="text-red-400">*</span></label>
                  <select
                    value={form.checkoutShift}
                    onChange={(e) => upd('checkoutShift', e.target.value)}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="" style={{ background: '#0a1929' }}>Pilih shift...</option>
                    {shiftOptions.map((s) => (
                      <option key={s.label} value={s.label} style={{ background: '#0a1929' }}>
                        {s.label} ({s.time})
                      </option>
                    ))}
                  </select>
                </div>
                {/* Checkin Date */}
                <div>
                  <label className={labelCls}>Tanggal Check-In <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={form.checkinDate}
                    onChange={(e) => upd('checkinDate', e.target.value)}
                    className={`${inputCls} [color-scheme:dark]`}
                  />
                </div>
                {/* Checkin Shift */}
                <div>
                  <label className={labelCls}>Shift Check-In <span className="text-red-400">*</span></label>
                  <select
                    value={form.checkinShift}
                    onChange={(e) => upd('checkinShift', e.target.value)}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="" style={{ background: '#0a1929' }}>Pilih shift...</option>
                    {shiftOptions.map((s) => (
                      <option key={s.label} value={s.label} style={{ background: '#0a1929' }}>
                        {s.label} ({s.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ══ SECTION 2: Aset / Peralatan ══════════════════════════ */}
            <div className={`rounded-2xl border transition-all duration-300 ${
              validation.section2
                ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                : 'border-white/[0.07] bg-white/[0.02]'
            }`}>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                <SectionBadge n={2} />
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-white">Aset / Peralatan</h2>
                  <p className="text-[10px] text-white/35 mt-0.5">Daftar peralatan yang dipinjam beserta jumlahnya</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <StatusDot ok={validation.section2} />
                  <span className={validation.section2 ? 'text-emerald-400' : 'text-white/30'}>
                    {validation.section2
                      ? `${form.equipment.filter((e) => e.name.trim()).length} item`
                      : 'Belum Diisi'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr,80px,36px] gap-3 px-1">
                  <span className={labelCls}>Nama Peralatan <span className="text-red-400">*</span></span>
                  <span className={labelCls}>Jumlah</span>
                  <span></span>
                </div>

                {/* Equipment rows */}
                {form.equipment.map((eq, idx) => (
                  <div key={eq.id} className="grid grid-cols-[1fr,80px,36px] gap-3 items-center group">
                    <input
                      type="text"
                      value={eq.name}
                      onChange={(e) => updEquipment(eq.id, 'name', e.target.value)}
                      placeholder={`Peralatan ${idx + 1}...`}
                      className={inputCls}
                    />
                    <input
                      type="number"
                      min={1}
                      value={eq.qty}
                      onChange={(e) => updEquipment(eq.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                      className={`${inputCls} text-center`}
                    />
                    <button
                      onClick={() => removeEquipment(eq.id)}
                      disabled={form.equipment.length === 1}
                      className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400
                        hover:bg-red-500/20 disabled:opacity-20 disabled:cursor-not-allowed
                        flex items-center justify-center transition-all cursor-pointer"
                      title="Hapus baris"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add row button */}
                <button
                  id="btn-add-equipment"
                  onClick={addEquipment}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/15
                    text-white/40 text-xs font-medium hover:border-cave-accent/40 hover:text-cave-accent
                    hover:bg-cave-accent/5 transition-all duration-200 cursor-pointer w-full justify-center mt-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                  Tambah Peralatan
                </button>
              </div>
            </div>

            {/* ══ SECTION 3: Informasi Peminjam ════════════════════════ */}
            <div className={`rounded-2xl border transition-all duration-300 ${
              validation.section3
                ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                : 'border-white/[0.07] bg-white/[0.02]'
            }`}>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                <SectionBadge n={3} />
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-white">Informasi Peminjam</h2>
                  <p className="text-[10px] text-white/35 mt-0.5">Data diri peminjam dan anggota grup</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <StatusDot ok={validation.section3} />
                  <span className={validation.section3 ? 'text-emerald-400' : 'text-white/30'}>
                    {validation.section3 ? 'Lengkap' : 'Belum Diisi'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Personal info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                    <label className={labelCls}>Nama Lengkap</label>
                    <input type="text" value={form.borrowerName} onChange={(e) => upd('borrowerName', e.target.value)} placeholder="Nama peminjam..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Binusian ID / Lecturer ID <span className="text-red-400">*</span></label>
                    <input type="text" value={form.binusianId} onChange={(e) => upd('binusianId', e.target.value)} placeholder="BN001234567" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Class</label>
                    <input type="text" value={form.classText} onChange={(e) => upd('classText', e.target.value)} placeholder="LA01" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>No. Kontak</label>
                    <input type="tel" value={form.contactNo} onChange={(e) => upd('contactNo', e.target.value)} placeholder="08xxxxxxxxxx" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} placeholder="name@binus.ac.id" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Tujuan Peminjaman <span className="text-red-400">*</span></label>
                    <input type="text" value={form.purpose} onChange={(e) => upd('purpose', e.target.value)} placeholder="Dokumentasi, project, dll..." className={inputCls} />
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Anggota Grup (opsional)</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* Group members */}
                <div className="space-y-3">
                  <div className="grid grid-cols-[28px,1fr,1fr] gap-3 px-1">
                    <span></span>
                    <span className={labelCls}>Nama</span>
                    <span className={labelCls}>NIM</span>
                  </div>
                  {form.groupMembers.map((m, i) => (
                    <div key={m.id} className="grid grid-cols-[28px,1fr,1fr] gap-3 items-center">
                      <span className="text-xs font-semibold text-white/30 text-center">{i + 1}</span>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => updMember(m.id, 'name', e.target.value)}
                        placeholder={`Anggota ${i + 1}`}
                        className={inputCls}
                      />
                      <input
                        type="text"
                        value={m.nim}
                        onChange={(e) => updMember(m.id, 'nim', e.target.value)}
                        placeholder="2501234567"
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sticky Action Sidebar ──────────────────────────── */}
          <div className="xl:sticky xl:top-20 space-y-4">

            {/* Section status card */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Kelengkapan Form</h3>
              <div className="space-y-3">
                {[
                  { n: 1, label: 'Informasi Peminjaman', ok: validation.section1 },
                  { n: 2, label: 'Aset / Peralatan',     ok: validation.section2 },
                  { n: 3, label: 'Informasi Peminjam',   ok: validation.section3 },
                ].map(({ n, label, ok }) => (
                  <div key={n} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${ok ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.02] border border-white/[0.05]'}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${ok ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                      {ok ? (
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : (
                        <span className="text-[10px] font-bold text-white/30">{n}</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${ok ? 'text-emerald-300' : 'text-white/40'}`}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
                  <span>Progress</span>
                  <span>{[validation.section1, validation.section2, validation.section3].filter(Boolean).length}/3 selesai</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cave-accent to-emerald-500 transition-all duration-500"
                    style={{ width: `${([validation.section1, validation.section2, validation.section3].filter(Boolean).length / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Validation messages */}
            {!validation.isComplete && validation.messages.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Perlu dilengkapi</span>
                </div>
                <ul className="space-y-1.5">
                  {validation.messages.map((msg, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-amber-200/70">
                      <span className="mt-0.5 flex-shrink-0">·</span>
                      <span>{msg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* PDF success */}
            {pdfSuccess && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="text-xs text-emerald-300 font-medium">PDF berhasil dibuat dan diunduh!</span>
              </div>
            )}

            {/* Generate PDF button */}
            <button
              id="btn-generate-pdf"
              onClick={handleGeneratePdf}
              disabled={!validation.isComplete || isGenerating}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-3
                ${validation.isComplete && !isGenerating
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-500/25 active:scale-[0.98]'
                  : 'bg-white/5 border border-white/10 text-white/25 cursor-not-allowed'
                }`}
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Membuat PDF...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  {validation.isComplete ? 'Unduh PDF' : 'Lengkapi Form Terlebih Dahulu'}
                </>
              )}
            </button>

            {validation.isComplete && (
              <p className="text-center text-[10px] text-white/25">
                PDF akan diunduh secara otomatis
              </p>
            )}

            {/* Reset button */}
            <button
              onClick={() => { if (confirm('Reset semua data form?')) setForm(EMPTY_FORM); }}
              className="w-full py-2.5 rounded-xl border border-white/[0.06] text-white/30 text-xs font-medium
                hover:border-red-500/20 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
            >
              Reset Form
            </button>
          </div>
        </div>
      </div>

      {/* ── Paste Modal ───────────────────────────────────────────────────── */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#061525] border border-white/[0.12] rounded-2xl p-6 w-full max-w-2xl shadow-2xl shadow-black/60">
            {/* Modal header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center flex-shrink-0">
                <svg className="w-4.5 h-4.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">Auto-fill dari labfacility</h3>
                <p className="text-[10px] text-white/40 mt-0.5">Paste teks → semua bagian terisi otomatis</p>
              </div>
              <button onClick={() => { setShowPasteModal(false); setParseError(''); }}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 mb-4 text-[11px] text-white/50 leading-relaxed">
              Buka halaman detail peminjaman di{' '}
              <span className="text-sky-400 font-medium">labfacility.apps.binus.ac.id</span>,
              tekan <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 text-[10px]">Ctrl+A</kbd> lalu{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 text-[10px]">Ctrl+C</kbd>, kemudian paste di bawah.
            </div>

            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Assets\nimage not found\nBaterai Kamera Mirroless Sony NP-FZ100 - 2703\nNP-FZ100\n2025\n...\nBorrower : BN001563852\nEmail\ntrevince.wu@binus.ac.id\nPhone\n081361928186\nPurpose\nDokumentasi Inauguration\nCheck-out Date\n04 Sept 2026 (Shift 1)\nCheck-in Date\n04 Sept 2026 (Shift 6)\nStatus\nAccepted`}
              rows={10}
              className="w-full px-3 py-3 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white
                placeholder-white/15 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50
                font-mono resize-none transition-all duration-200"
            />

            {parseError && (
              <div className="flex items-center gap-2 mt-3 text-xs text-red-400">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3C6.48 3 2 7.48 2 12s4.48 9 10 9 10-4.48 10-9S17.52 3 12 3z"/>
                </svg>
                {parseError}
              </div>
            )}

            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => { setShowPasteModal(false); setParseError(''); }}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60
                  hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-parse-paste"
                onClick={handleParsePaste}
                disabled={!pasteText.trim()}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 text-white
                  hover:bg-sky-500 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Isi Otomatis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hidden Print Form (always rendered for html2canvas clone) ──── */}
      {/* Use opacity:0 instead of visibility:hidden — visibility is inherited  */}
      {/* by cloned nodes, which breaks html2canvas capture.                   */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
          width: '794px',
        }}
      >
        <BorrowingPrintForm ref={printFormRef} data={form} />
      </div>
    </div>
  );
}
