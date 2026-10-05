import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useBooking } from '../context/BookingContext';
import { supabase } from '../lib/supabase';

export default function ITFormPage() {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { itSupport } = booking;
  const setIT = (updates: Partial<typeof itSupport>) => {
    updateBooking({ itSupport: { ...itSupport, ...updates } });
  };

  const radioClass = (selected: boolean) => 
    `flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all mb-2 last:mb-0 ${
      selected ? 'border-[#0052A3] bg-[#F4F7FB] shadow-[0_2px_8px_rgba(0,82,163,0.05)]' : 'border-gray-200 bg-white hover:border-gray-300'
    }`;

  const radioCircle = (selected: boolean) => (
    <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${selected ? 'border-[#0052A3]' : 'border-gray-300'}`}>
      {selected && <div className="w-2.5 h-2.5 bg-[#0052A3] rounded-full"></div>}
    </div>
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (booking.createdEventId) {
        await supabase.from('it_support_requests').insert({
          event_id: booking.createdEventId,
          needs_audio: itSupport.needsAudio,
          needs_streaming: itSupport.needsStreaming,
          needs_technician: itSupport.needsTechnician,
          bundle: itSupport.bundle,
          additional_notes: itSupport.additionalNotes || null,
          status: 'pending',
        } as any);
      }
      navigate('/it-form-success');
    } catch (err) {
      console.error('Failed to save IT support request:', err);
      setSubmitError('Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32 lg:pb-0 font-sans relative" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #D1D5DB 1px, transparent 1px),
            linear-gradient(to bottom, #D1D5DB 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Desktop Navbar */}
      <div className="hidden lg:block relative z-10">
        <Navbar />
      </div>

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white px-4 h-[60px] flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate('/booking-success')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <span className="text-[15px] font-extrabold text-[#003366] tracking-wide">Technical Needs</span>
        <div className="w-9 h-9"></div> {/* Balancer */}
      </div>

      {/* Progress Bar (Mobile) */}
      <div className="lg:hidden w-full h-[4px] bg-gray-100 relative z-40">
        <div className="h-full bg-[#0052A3] w-[95%] rounded-r-full"></div>
      </div>

      <div className="relative z-10 max-w-[800px] mx-auto px-5 lg:px-6 py-6 lg:py-10">
        
        {/* Header Text */}
        <div className="mb-6">
          <h1 className="text-[16px] font-extrabold text-gray-800 tracking-tight mb-2">
            Technical & IT Support
          </h1>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
            Specify your AV, streaming, and IT personnel requirements for the event.
          </p>
        </div>

        {/* ─── CUSTOM RADIO FORM GROUPS ─── */}
        <div className="space-y-4 mb-8">
          
          {/* Audio Requirements */}
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h2 className="text-[13px] font-extrabold text-gray-800 mb-3 px-1">Audio Requirements</h2>
            <div className={radioClass(itSupport.needsAudio === true)} onClick={() => setIT({ needsAudio: true })}>
              {radioCircle(itSupport.needsAudio === true)}
              <span className="text-[13px] font-medium text-gray-700">Standard Mic Setup (2 Wireless)</span>
            </div>
            <div className={radioClass(itSupport.needsAudio === true && itSupport.bundle === 'stage')} onClick={() => setIT({ needsAudio: true, bundle: 'stage' })}>
              {radioCircle(itSupport.needsAudio === true && itSupport.bundle === 'stage')}
              <span className="text-[13px] font-medium text-gray-700">Panel Setup (4+ Mics)</span>
            </div>
            <div className={radioClass(itSupport.needsAudio === false)} onClick={() => setIT({ needsAudio: false })}>
              {radioCircle(itSupport.needsAudio === false)}
              <span className="text-[13px] font-medium text-gray-700">No Additional Audio Required</span>
            </div>
          </div>

          {/* Streaming & Recording */}
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h2 className="text-[13px] font-extrabold text-gray-800 mb-3 px-1">Streaming & Recording</h2>
            <div className={radioClass(itSupport.needsStreaming === true)} onClick={() => setIT({ needsStreaming: true })}>
              {radioCircle(itSupport.needsStreaming === true)}
              <span className="text-[13px] font-medium text-gray-700">Live Stream (Zoom/YouTube)</span>
            </div>
            <div className={radioClass(itSupport.needsStreaming === true && itSupport.bundle === 'hybrid')} onClick={() => setIT({ needsStreaming: true, bundle: 'hybrid' })}>
              {radioCircle(itSupport.needsStreaming === true && itSupport.bundle === 'hybrid')}
              <span className="text-[13px] font-medium text-gray-700">Recording Only</span>
            </div>
            <div className={radioClass(itSupport.needsStreaming === false)} onClick={() => setIT({ needsStreaming: false })}>
              {radioCircle(itSupport.needsStreaming === false)}
              <span className="text-[13px] font-medium text-gray-700">Not Required</span>
            </div>
          </div>

          {/* IT Personnel Support */}
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h2 className="text-[13px] font-extrabold text-gray-800 mb-3 px-1">IT Personnel Support</h2>
            <div className={radioClass(itSupport.needsTechnician === true && itSupport.bundle !== 'stage')} onClick={() => setIT({ needsTechnician: true, bundle: 'basic' })}>
              {radioCircle(itSupport.needsTechnician === true && itSupport.bundle !== 'stage')}
              <span className="text-[13px] font-medium text-gray-700">Setup Assistance Only (Start of Event)</span>
            </div>
            <div className={radioClass(itSupport.needsTechnician === true && itSupport.bundle === 'stage')} onClick={() => setIT({ needsTechnician: true, bundle: 'stage' })}>
              {radioCircle(itSupport.needsTechnician === true && itSupport.bundle === 'stage')}
              <span className="text-[13px] font-medium text-gray-700">Full Standby (During Entire Event)</span>
            </div>
          </div>

        </div>

        {/* ─── RECOMMENDED BUNDLES ─── */}
        <div className="mb-8">
          <h2 className="text-[13px] font-extrabold text-gray-800 mb-3 px-1">Recommended Bundles</h2>
          
          <div className="space-y-3">
            
            {/* Hybrid Seminar Pack */}
            <div 
              className={`bg-white rounded-r-xl border-y border-r border-gray-200 p-5 flex gap-4 transition-all
                ${itSupport.bundle === 'hybrid' ? 'border-l-[4px] border-l-[#0052A3] shadow-md' : 'border-l-[4px] border-l-[#0052A3]'}`}
            >
              <div className="w-12 h-10 bg-[#E0EBF5] rounded-md flex items-center justify-center text-[#0052A3] shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-extrabold text-gray-900 mb-1">Hybrid Seminar Pack</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                  Includes 2 wireless mics, direct zoom feed, and 1 IT standby personnel.
                </p>
                <button 
                  onClick={() => setIT({ bundle: 'hybrid', needsAudio: true, needsStreaming: true, needsTechnician: true })}
                  className="text-[11px] font-bold text-[#0052A3] uppercase flex items-center gap-1 hover:underline"
                >
                  <span className="text-lg leading-none mt-[-2px]">+</span> ADD BUNDLE
                </button>
              </div>
            </div>

            {/* Standard Workshop */}
            <div 
              className={`bg-white rounded-r-xl border-y border-r border-gray-200 p-5 flex gap-4 transition-all
                ${itSupport.bundle === 'basic' ? 'border-l-[4px] border-l-[#F59E0B] shadow-md' : 'border-l-[4px] border-l-[#F59E0B]'}`}
            >
              <div className="w-12 h-10 bg-[#FEF3E2] rounded-md flex items-center justify-center text-[#F59E0B] shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.906 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-extrabold text-gray-900 mb-1">Standard Workshop</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                  Includes 1 clip-on mic, projector setup assistance.
                </p>
                <button 
                  onClick={() => setIT({ bundle: 'basic', needsAudio: true, needsTechnician: true, needsStreaming: false })}
                  className="text-[11px] font-bold text-[#0052A3] uppercase flex items-center gap-1 hover:underline"
                >
                  <span className="text-lg leading-none mt-[-2px]">+</span> ADD BUNDLE
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ─── STANDARD ROOM EQUIPMENT ALERT ─── */}
        <div className="bg-[#F4F7FB] border border-[#E2E8F0] rounded-xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-[#0052A3] flex items-center justify-center text-[#0052A3]">
              <span className="text-[10px] font-bold italic font-serif">i</span>
            </div>
            <h3 className="text-[13px] font-bold text-[#0052A3]">Standard Room Equipment</h3>
          </div>
          <p className="text-[12px] text-gray-600 mb-2">
            The selected room (Auditorium 421) already includes:
          </p>
          <ul className="space-y-1 pl-1">
            <li className="flex items-center gap-2 text-[12px] text-gray-600">
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span> 1x Main Projector & Screen
            </li>
            <li className="flex items-center gap-2 text-[12px] text-gray-600">
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span> Built-in PA System
            </li>
            <li className="flex items-center gap-2 text-[12px] text-gray-600">
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span> Standard HDMI connectivity
            </li>
          </ul>
        </div>

        {/* ─── ADDITIONAL TECHNICAL NOTES ─── */}
        <div className="mb-4">
          <h3 className="text-[13px] font-extrabold text-gray-800 mb-3 px-1">Additional Technical Notes</h3>
          <textarea 
            rows={4}
            placeholder="E.g., Need specific software installed on presenter PC, or bringing Mac requires adapters."
            value={itSupport.additionalNotes}
            onChange={(e) => setIT({ additionalNotes: e.target.value })}
            className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 text-[13px] text-gray-900 placeholder-gray-500 focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none resize-none shadow-sm"
          ></textarea>
        </div>

      </div>

      {/* ─── MOBILE FIXED BOTTOM BAR ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-100 px-5 py-4 z-40 shadow-[0_-4px_25px_rgba(0,0,0,0.04)]">
        {submitError && (
          <div className="text-red-500 text-xs text-center mb-2">{submitError}</div>
        )}
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#F59E0B] active:bg-[#D97706] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting && <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
          Lanjutkan
        </button>
      </div>

      {/* ─── DESKTOP SUBMIT BUTTON ─── */}
      <div className="hidden lg:flex justify-end max-w-[800px] mx-auto px-6 pb-12 relative z-10">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-8 py-3 rounded-xl font-bold text-[14px] shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
          Lanjutkan
        </button>
      </div>

    </div>
  );
}
