import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function RoomBookingPage() {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempParticipants, setTempParticipants] = useState<string[]>([]);
  const [otherInput, setOtherInput] = useState(booking.otherParticipantDetail);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedFloor, setSelectedFloor] = useState('2');
  const floors = ['L', '1', '2', '3', '4', '5', '6'];

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setTempParticipants(prev => [...prev, id]);
    } else {
      setTempParticipants(prev => prev.filter(p => p !== id));
    }
  };

  const handleOpenModal = () => {
    setTempParticipants([...booking.participants]);
    setIsModalOpen(true);
  };

  const handleSaveParticipants = () => {
    updateBooking({ participants: [...tempParticipants], otherParticipantDetail: otherInput });
    setIsModalOpen(false);
  };

  const handleRemoveParticipant = (id: string) => {
    updateBooking({ participants: booking.participants.filter(p => p !== id) });
    if (id === 'Other') {
      setOtherInput('');
      updateBooking({ otherParticipantDetail: '' });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!booking.eventName.trim()) {
      setValidationError('Nama Event wajib diisi.');
      return;
    }
    if (!booking.picName.trim()) {
      setValidationError('Nama PIC wajib diisi.');
      return;
    }
    setValidationError(null);

    // Persist to Supabase
    setIsSubmitting(true);
    try {
      const { data: eventData, error: eventError } = await supabase.from('events').insert({
        user_id: user?.id || null,
        event_name: booking.eventName,
        pic_name: booking.picName,
        format: booking.format || 'onsite',
        location_id: booking.locationId || null,
        room_id: booking.selectedRoom?.id || null,
        start_date: booking.startDate || new Date().toISOString().split('T')[0],
        end_date: booking.endDate || new Date().toISOString().split('T')[0],
        start_time: booking.startTime || '10:00',
        end_time: booking.endTime || '12:00',
        has_gr: booking.hasGR,
        is_director: booking.isDirectorAttending,
        status: 'confirmed',
      } as any).select('id').single();

      if (eventError) throw eventError;

      const eventId = eventData?.id;
      if (eventId && booking.participants.length > 0) {
        const participantRows = booking.participants.map(type => ({
          event_id: eventId,
          type,
          other_detail: type === 'Other' ? booking.otherParticipantDetail : null,
        }));
        await supabase.from('event_participants').insert(participantRows as any);
      }

      updateBooking({ createdEventId: eventId || null });
      navigate('/booking-success');
    } catch (err) {
      console.error('Failed to save event:', err);
      setValidationError('Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 lg:pb-0 font-sans" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white px-4 h-[60px] flex items-center justify-between sticky top-0 z-40 border-b border-gray-100">
        <button onClick={() => navigate('/schedules')} className="p-2 -ml-2 text-[#003366]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <span className="text-[17px] font-extrabold text-[#003366] tracking-tight">CaVe</span>
        <div className="w-9 h-9"></div> {/* Balancer */}
      </div>
      
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-6 lg:py-8 flex flex-col lg:flex-row items-start gap-8">
        
        {/* ─── MAIN COLUMN ─── */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          
          {/* Desktop Header Text (Hidden on Mobile as Mobile has top bar) */}
          <div className="hidden lg:flex items-end justify-between">
            <div>
              <div className="flex items-center text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
                <span>Event Format</span>
                <svg className="w-3 h-3 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="text-[#003366]">Room Selection</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pilih Ruangan</h1>
            </div>
          </div>

          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {validationError}
            </div>
          )}

          {/* Filters Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm">
            {/* Campus Location */}
            <div className="mb-4">
              <label className="block text-[13px] font-bold text-gray-700 mb-2">Campus Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <select className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-[14px] rounded-lg focus:ring-1 focus:ring-[#003366] focus:border-[#003366] block pl-11 pr-10 py-3 outline-none cursor-pointer">
                  <option>Anggrek Campus</option>
                  <option>Syahdan Campus</option>
                  <option>Alam Sutera Campus</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">Date & Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input type="text" defaultValue="20/05/2024" className="w-full bg-white border border-gray-200 text-gray-900 text-[14px] font-medium rounded-lg block pl-11 pr-10 py-3 outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366]" />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Floor Selection */}
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-3 px-1">Select Floor</label>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
              {floors.map(floor => (
                <button 
                  key={floor} 
                  onClick={() => setSelectedFloor(floor)}
                  className={`w-[52px] h-[52px] shrink-0 rounded-[14px] border flex items-center justify-center text-[15px] font-bold transition-all shadow-sm
                    ${selectedFloor === floor 
                      ? 'bg-[#0052A3] text-white border-[#0052A3]' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  {floor}
                </button>
              ))}
              {/* Fake extra items to match screenshot layout */}
              <div className="w-[52px] h-[52px] shrink-0 rounded-[14px] border bg-white border-gray-200 opacity-50"></div>
            </div>
          </div>

          {/* Map Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header / Legend */}
            <div className="bg-[#F4F6F9] px-4 py-3 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="text-[13px] font-bold text-gray-900 tracking-wide">Floor {selectedFloor} - Anggrek</h3>
              <div className="flex items-center gap-4 text-[11px] font-medium text-gray-700">
                <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-white border border-gray-300 rounded-sm"></div> Tersedia</div>
                <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-[#FDECEA] border border-red-300 rounded-sm"></div> Dibooking</div>
                <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-[#0052A3] rounded-sm"></div> Terpilih</div>
              </div>
            </div>
            
            {/* Map Area Container */}
            <div className="relative bg-[#F4F6F9] p-6 lg:p-10 flex items-center justify-center min-h-[300px]">
              
              {/* Inner Room Grid */}
              <div className="relative flex flex-col gap-5 w-full max-w-[400px]">
                {/* Connector Area Background (simulating hallway) */}
                <div className="absolute top-[35%] bottom-[35%] left-0 right-0 bg-[#E5E9F0] rounded-sm -z-10"></div>
                
                {/* Row 1 */}
                <div className="flex justify-between w-full h-[70px] gap-2">
                  <div className="flex-1 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <span className="text-[11px] font-semibold text-gray-600">R201</span>
                  </div>
                  <div className="flex-1 bg-[#FDECEA] border border-[#DC2626] rounded-md shadow-sm flex items-center justify-center cursor-not-allowed">
                    <span className="text-[10px] font-semibold text-[#DC2626] text-center px-1">R202 (Booked)</span>
                  </div>
                  <div className="flex-1 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <span className="text-[11px] font-semibold text-gray-600">R203</span>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex justify-between w-full h-[70px] gap-2">
                  <div className="w-[45%] bg-[#0052A3] border border-[#003B73] rounded-md shadow-md flex items-center justify-center cursor-pointer relative">
                    <span className="text-[11px] font-bold text-white">R204 (Aula)</span>
                  </div>
                  <div className="flex-1 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <span className="text-[11px] font-semibold text-gray-600">R205</span>
                  </div>
                  <div className="flex-1 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50">
                    <span className="text-[11px] font-semibold text-gray-600">R206</span>
                  </div>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex gap-1">
                <button className="w-8 h-8 bg-white border border-gray-200 rounded text-gray-600 shadow-sm font-light text-lg flex items-center justify-center hover:bg-gray-50 transition-colors">+</button>
                <button className="w-8 h-8 bg-white border border-gray-200 rounded text-gray-600 shadow-sm font-light text-lg flex items-center justify-center hover:bg-gray-50 transition-colors">-</button>
              </div>
            </div>
          </div>

          {/* Event Requirements */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-900 mb-2">Event Requirements</h3>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-[15px] font-medium text-gray-800 mb-0.5">Dihadiri Direktur?</div>
                <div className="text-[12px] text-gray-500">Requires VIP setup</div>
              </div>
              <button 
                onClick={() => updateBooking({ isDirectorAttending: !booking.isDirectorAttending })}
                className={`w-[52px] h-[30px] rounded-full relative transition-colors ${booking.isDirectorAttending ? 'bg-[#0052A3]' : 'bg-[#D1D5DB]'}`}
              >
                <div className={`absolute top-1 w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform ${booking.isDirectorAttending ? 'left-[26px]' : 'left-1'}`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-[15px] font-medium text-gray-800 mb-0.5">Apakah ada GR?</div>
                <div className="text-[12px] text-gray-500">Gladi resik setup needed</div>
              </div>
              <button 
                onClick={() => updateBooking({ hasGR: !booking.hasGR })}
                className={`w-[52px] h-[30px] rounded-full relative transition-colors ${booking.hasGR ? 'bg-[#0052A3]' : 'bg-[#D1D5DB]'}`}
              >
                <div className={`absolute top-1 w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform ${booking.hasGR ? 'left-[26px]' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* ─── SIDEBAR SUMMARY (Desktop Only) ─── */}
        <div className="hidden lg:block w-[380px] shrink-0 bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-[100px]">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">Ringkasan</h2>

          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-[#003366] tracking-wider mb-4 uppercase">Informasi Acara</h3>
            
            <div className="mb-4">
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Nama Event</label>
              <input type="text" placeholder="Contoh: Workshop UI/UX" 
                     value={booking.eventName}
                     onChange={(e) => updateBooking({ eventName: e.target.value })}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none bg-gray-50" />
            </div>

            <div className="mb-4">
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Nama PIC</label>
              <input type="text" placeholder="Nama penanggung jawab" 
                     value={booking.picName}
                     onChange={(e) => updateBooking({ picName: e.target.value })}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none bg-gray-50" />
            </div>

            <button 
              onClick={handleOpenModal}
              className="w-full flex items-center justify-center gap-2 border border-[#003366] text-[#003366] py-2 rounded-lg font-bold text-[12px] hover:bg-blue-50 transition-colors mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              + Pilih Target Peserta
            </button>
            {booking.participants.length === 0 ? (
              <div className="bg-[#F8F9FA] rounded border border-gray-100 p-2 text-center border-dashed mb-5">
                <span className="text-[11px] italic text-gray-400">Belum ada peserta dipilih</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-5">
                {booking.participants.map(participant => (
                  <div key={participant} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded text-[#003366] text-[11px] font-bold">
                    {participant === 'Other' && otherInput ? otherInput : participant}
                    <button onClick={() => handleRemoveParticipant(participant)} className="text-[#003366]/60 hover:text-[#003366]">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-gray-200 mb-6 w-[calc(100%+3rem)] -ml-6"></div>

          <div className="mb-6 relative bg-blue-50/50 border border-[#E8F0FE] rounded-xl p-4">
             <div className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-700">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </div>
             <h3 className="text-[10px] font-bold text-[#003366] tracking-wider mb-2 uppercase">Terpilih</h3>
             <h4 className="text-xl font-extrabold text-gray-900 mb-1">R204 (Aula)</h4>
             <div className="flex items-center text-[12px] text-gray-600 mb-4">
                <svg className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Lantai {selectedFloor}, Anggrek Campus
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Kapasitas</div>
                  <div className="text-[13px] font-semibold text-gray-800">120 Pax</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Fasilitas</div>
                  <div className="text-[13px] font-semibold text-gray-800">Proyektor, AC</div>
                </div>
             </div>
          </div>
          
          <button 
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="w-full bg-[#0052A3] hover:bg-[#003366] text-white py-3 rounded-xl font-bold text-[14px] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
             {isSubmitting && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
             Lanjutkan
          </button>
        </div>

      </div>

      {/* ─── MOBILE FIXED BOTTOM BAR ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 w-full bg-[#F8FAFC] border-t border-gray-200 px-5 pt-4 pb-6 z-40 rounded-t-3xl shadow-[0_-4px_25px_rgba(0,0,0,0.06)] backdrop-blur-md bg-opacity-95">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <div className="text-[11px] text-gray-500 font-medium tracking-wide">Selected Room</div>
            <div className="text-[18px] font-extrabold text-[#003366] tracking-tight">R204 (Aula)</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-500 font-medium tracking-wide">Capacity</div>
            <div className="text-[16px] font-bold text-gray-800">120 Pax</div>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#0052A3] active:bg-[#003366] text-white py-4 rounded-xl font-bold text-[15px] shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
          {isSubmitting && <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
          Lanjutkan
        </button>
      </div>

      {/* Target Peserta Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[460px] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-gray-900">Kehadiran Diharapkan</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4 text-[13px] font-medium text-gray-800">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]" 
                         checked={tempParticipants.includes('BOM')}
                         onChange={(e) => handleCheckboxChange('BOM', e.target.checked)} />
                  <span className="group-hover:text-[#003366] transition-colors">BOM</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]" 
                         checked={tempParticipants.includes('Karyawan BINUS')}
                         onChange={(e) => handleCheckboxChange('Karyawan BINUS', e.target.checked)} />
                  <span className="group-hover:text-[#003366] transition-colors">Karyawan BINUS</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]" 
                         checked={tempParticipants.includes('MD')}
                         onChange={(e) => handleCheckboxChange('MD', e.target.checked)} />
                  <span className="group-hover:text-[#003366] transition-colors">MD</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]" 
                         checked={tempParticipants.includes('External')}
                         onChange={(e) => handleCheckboxChange('External', e.target.checked)} />
                  <span className="group-hover:text-[#003366] transition-colors">External</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]" 
                         checked={tempParticipants.includes('Rektor')}
                         onChange={(e) => handleCheckboxChange('Rektor', e.target.checked)} />
                  <span className="group-hover:text-[#003366] transition-colors">Rektor</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]" 
                         checked={tempParticipants.includes('Mahasiswa')}
                         onChange={(e) => handleCheckboxChange('Mahasiswa', e.target.checked)} />
                  <span className="group-hover:text-[#003366] transition-colors">Mahasiswa</span>
                </label>
              </div>
              
              <div className="flex items-center gap-3 mt-6 text-[13px] font-medium text-gray-800 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer whitespace-nowrap">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#003366] focus:ring-[#003366]" 
                         checked={tempParticipants.includes('Other')}
                         onChange={(e) => handleCheckboxChange('Other', e.target.checked)} />
                  <span>Other:</span>
                </label>
                <input type="text" placeholder="Specify other attendees..." 
                       value={otherInput}
                       onChange={(e) => setOtherInput(e.target.value)}
                       disabled={!tempParticipants.includes('Other')}
                       className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-[13px] focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none disabled:bg-gray-100 disabled:text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-[#F8FAFC]">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[13px] font-bold text-gray-600 hover:text-gray-900 transition-colors">
                Batal
              </button>
              <button onClick={handleSaveParticipants} className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] transition-colors shadow-sm">
                Simpan Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
