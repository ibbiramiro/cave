import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

export default function ITFormSuccessPage() {
  const navigate = useNavigate();
  const { booking, resetBooking } = useBooking();
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          resetBooking();
          navigate('/schedules');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, resetBooking]);

  const handleManualReturn = () => {
    resetBooking();
    navigate('/schedules');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDate(booking.startDate);
  const formattedTime = `${booking.startTime || '00:00'} - ${booking.endTime || '00:00'}`;
  
  const displayRoom = booking.selectedRoom?.name || (booking.format === 'online' ? 'Online Meeting' : 'Meeting Rm');
  const displayLocation = booking.locationName || 'Binus@Medan';
  
  const bundleDisplay = booking.itSupport.bundle === 'basic' ? 'Basic PA System' :
                        booking.itSupport.bundle === 'hybrid' ? 'Hybrid Meeting' :
                        booking.itSupport.bundle === 'stage' ? 'Full Stage' : 'IT Support';

  return (
    <div 
      className="min-h-screen bg-[#0A1017] flex flex-col items-center justify-center p-6 relative overflow-hidden" 
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* Background Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="relative z-10 w-full max-w-[550px] bg-[#121A21] rounded-[24px] p-10 shadow-2xl flex flex-col items-center">
        
        {/* Check Icon */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#0F352E] border-2 border-[#12684F] mb-8 shadow-inner">
          <svg className="w-8 h-8 text-[#14B881]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-[26px] font-bold text-white tracking-tight mb-2">
          Pemesanan Berhasil!
        </h1>
        <p className="text-[#8492A6] text-[14px] mb-8 text-center">
          Kebutuhan Technical & IT Support Anda telah dikonfirmasi.
        </p>

        {/* Details Card */}
        <div className="w-full border border-[#1E293B] rounded-xl overflow-hidden mb-8">
          <div className="flex flex-col text-[13px]">
            {/* Row 1 */}
            <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
              <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[11px]">Nama Event</span>
              <span className="text-[#E2E8F0] font-medium">{booking.eventName || 'Acara'}</span>
            </div>
            {/* Row 2 */}
            <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
              <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[11px]">Jadwal</span>
              <span className="text-[#E2E8F0] font-medium">{formattedDate}, {formattedTime}</span>
            </div>
            {/* Row 3 */}
            <div className="flex items-center justify-between p-4 border-b border-[#1E293B]">
              <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[11px]">Ruangan</span>
              <span className="text-[#E2E8F0] font-medium">{displayRoom}, {displayLocation}</span>
            </div>
            {/* Row 4 */}
            <div className="flex items-center justify-between p-4">
              <span className="text-[#64748B] uppercase tracking-wider font-semibold text-[11px]">Status Support</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#14B881]"></div>
                <span className="text-[#E2E8F0] font-medium">{bundleDisplay} - Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Button */}
        <button 
          onClick={handleManualReturn}
          className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-[#0D1526] py-3.5 rounded-lg font-bold text-[12px] flex items-center justify-center gap-2 transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          KEMBALI KE DASHBOARD KALENDER
        </button>

        {/* Countdown */}
        <div className="mt-8 text-center w-full">
          <p className="text-[#64748B] text-[12px] mb-3">
            Anda akan dialihkan secara otomatis dalam {countdown} detik...
          </p>
          <div className="w-full bg-[#1E293B] h-[2px] rounded-full overflow-hidden">
            <div 
              className="bg-[#14B881] h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 2) * 100}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
}
