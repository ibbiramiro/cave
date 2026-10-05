import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function OnlineBookingPage() {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  const { user } = useAuth();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!booking.eventName.trim()) { setValidationError('Nama Kegiatan wajib diisi.'); return; }
    if (!booking.picName.trim()) { setValidationError('Nama PIC wajib diisi.'); return; }
    if (!booking.startDate) { setValidationError('Tanggal wajib diisi.'); return; }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      const { data: eventData, error: eventError } = await supabase.from('events').insert({
        user_id: user?.id || null,
        event_name: booking.eventName,
        pic_name: booking.picName,
        format: booking.format || 'online',
        location_id: null,
        room_id: null,
        start_date: booking.startDate || new Date().toISOString().split('T')[0],
        end_date: booking.endDate || booking.startDate || new Date().toISOString().split('T')[0],
        start_time: booking.startTime || '10:00',
        end_time: booking.endTime || '12:00',
        has_gr: false,
        is_director: booking.isDirectorAttending,
        status: 'confirmed',
      } as any).select('id').single();

      if (eventError) throw eventError;
      const eventId = eventData?.id;

      if (eventId) {
        await supabase.from('online_meetings').insert({
          event_id: eventId,
          platform: booking.platform || 'zoom',
        } as any);
      }

      updateBooking({ createdEventId: eventId || null });
      navigate('/booking-success');
    } catch (err) {
      console.error('Failed to save online event:', err);
      setValidationError('Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 lg:pb-0 font-sans text-gray-900" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white px-4 h-[60px] flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate('/schedules')} className="p-2 -ml-2 text-[#003366]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <span className="text-[17px] font-extrabold text-[#003366] tracking-tight">CaVe</span>
        <div className="w-9 h-9"></div> {/* Balancer */}
      </div>
      
      <div className="max-w-[1000px] mx-auto px-4 lg:px-6 py-6 lg:py-10 flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
        
        {/* ─── MAIN FORM COLUMN ─── */}
        <div className="flex-1 min-w-0 w-full space-y-8">
          
          {/* Header Title */}
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0F172A] tracking-tight mb-2">
              Jadwal Online
            </h1>
            <p className="text-[14px] text-gray-500 font-medium">
              Atur detail kegiatan dan pilih platform meeting virtual.
            </p>
          </div>

          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {validationError}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 lg:p-7 shadow-sm">
            <div className="space-y-5">
              
              {/* Nama Kegiatan */}
              <div>
                <label className="block text-[13px] font-bold text-gray-800 mb-2">Nama Kegiatan</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Rapat Koordinasi Semester"
                  value={booking.eventName}
                  onChange={(e) => updateBooking({ eventName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none transition-colors" 
                />
              </div>

              {/* Nama PIC */}
              <div>
                <label className="block text-[13px] font-bold text-gray-800 mb-2">Nama PIC</label>
                <input 
                  type="text" 
                  placeholder="Masukkan nama penanggung jawab"
                  value={booking.picName}
                  onChange={(e) => updateBooking({ picName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none transition-colors"
                />
              </div>

              {/* Tanggal & Waktu */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Tanggal</label>
                  <div className="relative">
                    <input 
                      type="date"
                      value={booking.startDate}
                      onChange={(e) => updateBooking({ startDate: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-[14px] text-gray-900 focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none appearance-none"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Waktu Mulai</label>
                  <div className="relative">
                    <input 
                      type="time"
                      value={booking.startTime}
                      onChange={(e) => updateBooking({ startTime: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-[14px] text-gray-900 focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none appearance-none"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Platform Virtual */}
          <div>
            <h3 className="text-[14px] font-bold text-gray-800 mb-3 px-1">Platform Virtual</h3>
            <div className="flex gap-4">
              
              {/* Zoom */}
              <button 
                onClick={() => updateBooking({ platform: 'zoom' })}
                className={`flex-1 h-[88px] rounded-xl border-2 flex flex-col items-center justify-center relative transition-all bg-white
                  ${booking.platform === 'zoom' || !booking.platform 
                    ? 'border-[#0052A3] shadow-[0_2px_10px_rgba(0,82,163,0.1)]' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
              >
                {(booking.platform === 'zoom' || !booking.platform) && (
                  <div className="absolute top-2 right-2 text-[#0052A3]">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
                <div className={`mb-1.5 ${booking.platform === 'zoom' || !booking.platform ? 'text-[#0052A3]' : 'text-gray-400'}`}>
                   <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                   </svg>
                </div>
                <span className={`text-[14px] font-bold tracking-wide ${booking.platform === 'zoom' || !booking.platform ? 'text-[#0052A3]' : 'text-gray-600'}`}>
                  Zoom
                </span>
              </button>

              {/* Ms. Teams */}
              <button 
                onClick={() => updateBooking({ platform: 'teams' })}
                className={`flex-1 h-[88px] rounded-xl border-2 flex flex-col items-center justify-center relative transition-all bg-white
                  ${booking.platform === 'teams' 
                    ? 'border-[#0052A3] shadow-[0_2px_10px_rgba(0,82,163,0.1)]' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
              >
                {booking.platform === 'teams' && (
                  <div className="absolute top-2 right-2 text-[#0052A3]">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
                <div className={`mb-1.5 ${booking.platform === 'teams' ? 'text-[#0052A3]' : 'text-gray-400'}`}>
                   <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                   </svg>
                </div>
                <span className={`text-[14px] font-bold tracking-wide ${booking.platform === 'teams' ? 'text-[#0052A3]' : 'text-gray-600'}`}>
                  Ms. Teams
                </span>
              </button>
            </div>
          </div>
          
        </div>

        {/* ─── SCHEDULE LIST COLUMN ─── */}
        <div className="w-full lg:w-[460px] shrink-0 border-t lg:border-t-0 border-gray-200 pt-8 lg:pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#003366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-[15px] font-extrabold text-[#0F172A] tracking-tight">
                Jadwal {booking.platform === 'teams' ? 'Teams' : 'Zoom'} di Hari Ini
              </h2>
            </div>
            <div className="bg-[#E2E8F0] text-[#475569] text-[11px] font-bold px-3 py-1 rounded-full">
              3 Event
            </div>
          </div>

          <div className="space-y-4">
            {/* Warning Banner */}
            <div className="bg-[#FDF2F2] border border-[#FDE3E3] rounded-xl p-4 flex gap-3 shadow-sm">
              <div className="mt-0.5 text-[#DC2626]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2" />
                </svg>
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#B91C1C] mb-1">Potensi Bentrok Waktu</div>
                <div className="text-[12px] text-[#7F1D1D] leading-relaxed">
                  Ketersediaan akun {booking.platform === 'teams' ? 'Teams' : 'Zoom Pro'} sangat terbatas antara pukul 10:00 - 12:00. Mohon periksa kembali slot waktu.
                </div>
              </div>
            </div>

            {/* Event Cards */}
            <div className="bg-white border-l-[4px] border-[#F59E0B] border-y border-r border-y-gray-200 border-r-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-extrabold text-gray-900 mb-1">Sidang Skripsi S1</h3>
                <div className="flex items-center text-[11px] text-gray-500 font-medium">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Bp. Budi Santoso
                </div>
              </div>
              <div className="bg-[#EFF6FF] text-[#1D4ED8] font-bold text-[12px] px-3 py-1.5 rounded-md">
                08:00 - 10:00
              </div>
            </div>

            <div className="bg-white border-l-[4px] border-[#DC2626] border-y border-r border-y-gray-200 border-r-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-extrabold text-gray-900 mb-1">Rapat Evaluasi Jurusan</h3>
                <div className="flex items-center text-[11px] text-gray-500 font-medium">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Ibu Ratna
                </div>
              </div>
              <div className="bg-[#FEF2F2] text-[#B91C1C] font-bold text-[12px] px-3 py-1.5 rounded-md">
                10:30 - 12:30
              </div>
            </div>

            <div className="bg-white border-l-[4px] border-gray-400 border-y border-r border-y-gray-200 border-r-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-extrabold text-gray-900 mb-1">Webinar Karir IT</h3>
                <div className="flex items-center text-[11px] text-gray-500 font-medium">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Kemahasiswaan
                </div>
              </div>
              <div className="bg-[#EFF6FF] text-[#1D4ED8] font-bold text-[12px] px-3 py-1.5 rounded-md">
                14:00 - 16:00
              </div>
            </div>
          </div>
          
          {/* Desktop Submit Button (Hidden on Mobile) */}
          <div className="hidden lg:block mt-8">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#0052A3] hover:bg-[#003366] text-white py-3.5 rounded-xl font-bold text-[15px] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting && <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              Lanjutkan
              {!isSubmitting && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
            </button>
          </div>

        </div>

      </div>

      {/* ─── MOBILE FIXED BOTTOM BAR ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-100 px-5 py-4 z-40 shadow-[0_-4px_25px_rgba(0,0,0,0.04)]">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#0052A3] active:bg-[#003366] text-white py-4 rounded-xl font-bold text-[16px] shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
          {isSubmitting ? (
             <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          ) : (
             <>
               Lanjutkan
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </>
          )}
        </button>
      </div>

    </div>
  );
}
