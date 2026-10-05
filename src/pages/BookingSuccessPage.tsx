import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();

  // Format date for display (e.g. Kamis, 24 Oktober 2023)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Belum dipilih';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };

  const formatTime = (start: string, end: string) => {
    if (!start || !end) return 'Belum dipilih';
    return `${start} - ${end} WIB`;
  };

  const displayRoom = booking.selectedRoom?.name || (booking.format === 'online' ? 'Online Meeting' : 'Auditorium Lt. 4, Kampus Anggrek');
  
  const handleContinue = () => {
    navigate('/it-form');
  };

  return (
    <div 
      className="min-h-screen bg-[#F8F9FB] flex flex-col items-center py-10 px-5 relative" 
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      <div className="w-full max-w-[500px] flex flex-col items-center mt-6">
        
        {/* Success Icon */}
        <div className="w-[100px] h-[100px] bg-[#E8EFFF] rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-[#1853A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Titles */}
        <h1 className="text-[26px] font-extrabold text-[#0D1526] tracking-tight mb-3 text-center">
          {booking.format === 'online' ? 'Acara Online Berhasil Dijadwalkan!' : 'Ruangan Berhasil Dipesan!'}
        </h1>
        <p className="text-[#5C6A81] text-[15px] text-center mb-8 px-4 leading-relaxed font-medium">
          Permintaan peminjaman ruangan Anda telah masuk ke sistem.
        </p>

        {/* Booking Details Card */}
        <div className="w-full bg-white border border-gray-200 rounded-xl mb-10 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col">
            
            {/* Row 1: Room */}
            <div className="flex items-start p-5 pb-4 border-b border-gray-100">
              <div className="w-7 text-[#0D1526] shrink-0 mt-1">
                 <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M19 19V4h-4V3H5v16H3v2h12V6h2v15h4v-2h-2zm-6 0H7V5h6v14zm-3-8h2v2h-2v-2z" />
                 </svg>
              </div>
              <div className="pl-1">
                <div className="text-[12px] font-medium text-gray-500 mb-0.5">Ruangan</div>
                <div className="text-[15px] font-medium text-[#0D1526]">{displayRoom}</div>
              </div>
            </div>

            {/* Row 2: Date */}
            <div className="flex items-start p-5 py-4 border-b border-gray-100">
              <div className="w-7 shrink-0"></div> {/* Spacer for alignment */}
              <div className="pl-1">
                <div className="text-[12px] font-medium text-gray-500 mb-0.5">Tanggal</div>
                <div className="text-[15px] font-medium text-[#0D1526]">{formatDate(booking.startDate)}</div>
              </div>
            </div>

            {/* Row 3: Time */}
            <div className="flex items-start p-5 pt-4">
              <div className="w-7 text-[#0D1526] shrink-0 mt-1">
                 <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <div className="pl-1">
                <div className="text-[12px] font-medium text-gray-500 mb-0.5">Waktu</div>
                <div className="text-[15px] font-medium text-[#0D1526]">{formatTime(booking.startTime, booking.endTime)}</div>
              </div>
            </div>

          </div>
        </div>

        {/* IT Asset Options */}
        <div className="w-full mb-8">
          <h2 className="text-[15px] font-extrabold text-[#0D1526] mb-4">
            Apakah Anda butuh aset IT?
          </h2>
          <div className="flex gap-4">
            
            {/* Option: Tidak */}
            <button 
              onClick={() => updateBooking({ needsITSupport: false })}
              className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all bg-white
                ${booking.needsITSupport === false 
                  ? 'border-[#003366] shadow-[0_2px_10px_rgba(0,51,102,0.1)]' 
                  : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors
                ${booking.needsITSupport === false ? 'bg-[#003366] text-white' : 'bg-[#E2E8F0] text-[#475569]'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <span className={`text-[14px] font-bold ${booking.needsITSupport === false ? 'text-[#003366]' : 'text-gray-600'}`}>
                Tidak
              </span>
            </button>

            {/* Option: Ya, Butuh */}
            <button 
              onClick={() => updateBooking({ needsITSupport: true })}
              className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all 
                ${booking.needsITSupport === true 
                  ? 'border-[#003366] bg-[#F4F6FB] shadow-[0_2px_10px_rgba(0,51,102,0.1)]' 
                  : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors
                ${booking.needsITSupport === true ? 'bg-[#D3E2F4] text-[#003366]' : 'bg-[#E2E8F0] text-[#475569]'}`}>
                <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/>
                </svg>
              </div>
              <span className={`text-[14px] font-bold ${booking.needsITSupport === true ? 'text-[#003366]' : 'text-gray-600'}`}>
                Ya, Butuh
              </span>
            </button>

          </div>
        </div>

        {/* Alert / Call to Action */}
        {booking.needsITSupport === true && (
          <div className="w-full bg-[#EEF2FF] rounded-xl p-5 mb-8 border border-[#E0E7FF] shadow-sm animate-fade-in">
            <div className="flex gap-3 mb-5">
              <div className="w-5 h-5 bg-[#F59E0B] rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
                <span className="text-[12px] font-bold">i</span>
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#0D1526] mb-1">Langkah Selanjutnya</div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  Untuk acara yang melibatkan pihak eksternal, Anda wajib melengkapi form detail event.
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleContinue}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-3.5 rounded-xl font-bold text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              ISI FORM EVENT 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}

        {/* Action Link */}
        <div className={`w-full text-center ${booking.needsITSupport === true ? 'mt-0' : 'mt-10'}`}>
          <button 
            onClick={() => navigate('/schedules')}
            className="text-[15px] font-bold text-[#003366] hover:underline"
          >
            Kembali ke Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
