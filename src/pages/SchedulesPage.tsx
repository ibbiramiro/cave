import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';

export default function SchedulesPage() {
  const navigate = useNavigate();
  const { updateBooking, resetBooking } = useBooking();
  const { profile, signOut } = useAuth();
  
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>(
    () => (localStorage.getItem('schedulesViewMode') as 'calendar' | 'list') || 'calendar'
  );
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [calendarScope, setCalendarScope] = useState<'Month' | 'Week'>('Month');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    localStorage.setItem('schedulesViewMode', viewMode);
  }, [viewMode]);

  // Dummy data representing List View
  const MOCK_LIST_EVENTS = [
    {
      dateHeader: 'MON, 13 JUL 2024',
      events: [
        { id: 1, timeStart: '14:00', timeEnd: '15:30', title: 'Faculty Strategy Alignment', type: 'Meeting', room: 'Auditorium A', pic: 'Dr. Sarah Jenkins', color: '#003366', bgType: '#E2E8F0', textType: '#003366' },
        { id: 2, timeStart: '16:00', timeEnd: '18:00', title: 'Intro to Design Systems', type: 'Workshop', room: 'Lab 402', pic: 'Prof. Alan Turing', color: '#B45309', bgType: '#FDE68A', textType: '#92400E' },
      ]
    },
    {
      dateHeader: 'TUE, 14 JUL 2024',
      events: [
        { id: 3, timeStart: '09:00', timeEnd: '10:00', title: 'Network Maintenance Window', type: 'Maintenance', room: 'Server Room B', pic: 'IT Department', color: '#94A3B8', bgType: '#CBD5E1', textType: '#334155' },
      ]
    }
  ];

  // Dummy data representing Calendar View Day Details
  const MOCK_CALENDAR_DAY_EVENTS = [
    { id: 101, time: '10:00 AM - 12:00 PM', title: 'Computer Science Faculty Meeting', room: 'Syahdan Campus, Room K2B', pic: 'Dr. Budi Santoso', color: '#003366', bgTime: '#E2E8F0', textTime: '#003366', initial: 'BS', hasOptions: true },
    { id: 102, time: '02:00 PM - 04:00 PM', title: 'UX Design System Workshop', room: 'Anggrek Campus, Lab 4', pic: 'Anita Sari (HIMTI)', color: '#F59E0B', bgTime: '#FDE68A', textTime: '#B45309', initial: 'AS', hasOptions: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 md:pb-0 font-sans" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Top Header (Calendar view reference) */}
      <div className="md:hidden bg-white border-b border-gray-200 px-5 h-[60px] flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button className="text-gray-700 p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-xl font-extrabold text-[#003366] tracking-tight">CaVe</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center cursor-pointer" onClick={signOut}>
           {profile?.avatar_url ? (
             <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
           ) : (
             <span className="text-[10px] font-bold text-gray-500">{(profile?.full_name || 'U').charAt(0).toUpperCase()}</span>
           )}
        </div>
      </div>

      <main className="w-full max-w-[1000px] mx-auto px-5 md:px-8 py-6 md:py-10 relative">
        
        {/* --- Header Section --- */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-[28px] md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-1.5 md:mb-2">
            {viewMode === 'calendar' ? 'Calendar' : 'Upcoming Events'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {viewMode === 'calendar' 
              ? 'Manage your events and room bookings.' 
              : 'View and manage your scheduled activities.'}
          </p>

          {/* Toggle Calendar / List */}
          <div className="flex border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-sm p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-[#003366] shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#003366] shadow text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
              List
            </button>
          </div>
        </div>

        {/* ═══ LIST VIEW ═══ */}
        {viewMode === 'list' && (
          <div className="space-y-8">
            {MOCK_LIST_EVENTS.map((group, gIdx) => (
              <div key={gIdx}>
                <h3 className="text-[13px] font-bold text-gray-500 tracking-widest uppercase mb-4 px-1 border-b border-gray-200 pb-2">
                  {group.dateHeader}
                </h3>
                <div className="space-y-4">
                  {group.events.map(ev => (
                    <div 
                      key={ev.id} 
                      onClick={() => setSelectedEvent(ev)}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex items-stretch cursor-pointer hover:shadow-md hover:border-[#003366] transition-all"
                    >
                      {/* Left colored border */}
                      <div className="w-1.5 shrink-0" style={{ backgroundColor: ev.color }}></div>
                      
                      <div className="p-4 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                           <div className="flex items-baseline gap-2">
                             <span className="text-base font-extrabold text-gray-900">{ev.timeStart}</span>
                             <span className="text-[13px] font-medium text-gray-500">{ev.timeEnd}</span>
                           </div>
                           {/* Only show tag on desktop in this row, on mobile it goes below */}
                           <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded text-[11px] font-bold items-center justify-center shrink-0" style={{ backgroundColor: ev.bgType, color: ev.textType }}>
                             {ev.type}
                           </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2 sm:mb-1">
                           <span className="sm:hidden px-2 py-0.5 rounded text-[10px] font-bold items-center justify-center shrink-0" style={{ backgroundColor: ev.bgType, color: ev.textType }}>
                             {ev.type}
                           </span>
                           <h4 className="text-[15px] font-bold text-gray-900 leading-snug">{ev.title}</h4>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-[12px] text-gray-500 mt-2">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="truncate">{ev.room}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span className="truncate">{ev.pic}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ CALENDAR VIEW ═══ */}
        {viewMode === 'calendar' && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
             {/* Left: Mini Calendar Picker */}
             <div className="w-full md:w-[350px] shrink-0">
               {/* Scope Toggle */}
               <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm p-1 mb-6">
                 <button onClick={() => setCalendarScope('Month')} className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-colors ${calendarScope === 'Month' ? 'bg-[#003366] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Month</button>
                 <button onClick={() => setCalendarScope('Week')} className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-colors ${calendarScope === 'Week' ? 'bg-[#003366] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Week</button>
               </div>

               <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 pb-6">
                 {/* Header Month/Year & Controls */}
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-bold text-gray-900 leading-tight">
                     October<br/>2024
                   </h2>
                   <div className="flex items-center gap-2">
                     <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </button>
                     <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-[12px] font-bold hover:bg-gray-50">
                       Today
                     </button>
                     <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                     </button>
                   </div>
                 </div>

                 {/* Days of week */}
                 <div className="grid grid-cols-7 text-center mb-3">
                   {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(day => (
                     <div key={day} className="text-[10px] font-bold text-gray-500">{day}</div>
                   ))}
                 </div>

                 {/* Date Grid */}
                 <div className="grid grid-cols-7 gap-y-2 text-center text-[13px] font-medium text-gray-800">
                    {/* Week 1 (mixed with prev month) */}
                    <div className="py-2 text-gray-300">29</div>
                    <div className="py-2 text-gray-300">30</div>
                    <div className="py-2">1</div>
                    <div className="py-2 flex flex-col items-center gap-1">2 <div className="w-1 h-1 rounded-full bg-[#003366]"></div></div>
                    <div className="py-2">3</div>
                    <div className="py-2">4</div>
                    <div className="py-2">5</div>
                    
                    {/* Week 2 */}
                    <div className="py-2">6</div>
                    <div className="py-2">7</div>
                    <div className="py-2 flex flex-col items-center gap-1">8 <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-[#F59E0B]"></div><div className="w-1 h-1 rounded-full bg-[#003366]"></div></div></div>
                    <div className="py-2">9</div>
                    <div className="flex flex-col items-center justify-center relative">
                      <div className="w-8 h-8 bg-[#003366] text-white font-bold rounded-lg flex items-center justify-center shadow-md">10</div>
                      <div className="flex gap-0.5 absolute bottom-0 translate-y-1"><div className="w-1 h-1 rounded-full bg-[#003366]"></div><div className="w-1 h-1 rounded-full bg-[#003366]"></div></div>
                    </div>
                    <div className="py-2">11</div>
                    <div className="py-2">12</div>

                    {/* Week 3 */}
                    <div className="py-2">13</div>
                    <div className="py-2">14</div>
                    <div className="py-2">15</div>
                    <div className="py-2 flex flex-col items-center gap-1">16 <div className="w-1 h-1 rounded-full bg-[#003366]"></div></div>
                    <div className="py-2">17</div>
                    <div className="py-2">18</div>
                    <div className="py-2 flex flex-col items-center gap-1 text-[#003366] font-bold">19 <div className="w-1 h-1 rounded-full bg-[#003366]"></div></div>

                    {/* Week 4 */}
                    <div className="py-2">20</div>
                    <div className="py-2">21</div>
                    <div className="py-2">22</div>
                    <div className="py-2">23</div>
                    <div className="py-2">24</div>
                    <div className="py-2 flex flex-col items-center gap-1">25 <div className="w-1 h-1 rounded-full bg-[#F59E0B]"></div></div>
                    <div className="py-2">26</div>

                    {/* Week 5 */}
                    <div className="py-2">27</div>
                    <div className="py-2">28</div>
                    <div className="py-2">29</div>
                    <div className="py-2">30</div>
                    <div className="py-2">31</div>
                    <div className="py-2 text-gray-300">1</div>
                    <div className="py-2 text-gray-300">2</div>
                 </div>
               </div>
             </div>

             {/* Right: Selected Day Events */}
             <div className="flex-1">
               <div className="flex items-center justify-between mb-5">
                 <h2 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Oct 10, 2024</h2>
                 <button onClick={() => setIsFormatModalOpen(true)} className="hidden md:flex bg-[#003366] hover:bg-[#002244] text-white px-4 py-2.5 rounded-lg font-bold text-[13px] items-center gap-2 transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Create Event
                 </button>
                 <button onClick={() => setIsFormatModalOpen(true)} className="md:hidden text-[#003366] p-1">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                 </button>
               </div>

               <div className="space-y-4">
                 {MOCK_CALENDAR_DAY_EVENTS.map(ev => (
                   <div key={ev.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex items-stretch">
                     <div className="w-1.5 shrink-0 rounded-l-xl" style={{ backgroundColor: ev.color }}></div>
                     <div className="p-4 sm:p-5 flex-1">
                       <div className="flex items-center justify-between mb-3">
                         <span className="px-2.5 py-1 rounded-md text-[11px] font-bold" style={{ backgroundColor: ev.bgTime, color: ev.textTime }}>
                           {ev.time}
                         </span>
                         {ev.hasOptions && (
                           <button className="text-gray-400 hover:text-gray-600 p-1">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                           </button>
                         )}
                       </div>
                       
                       <h3 className="text-[14px] font-extrabold text-gray-900 mb-1.5">{ev.title}</h3>
                       
                       <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-4">
                         <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                         <span className="truncate">{ev.room}</span>
                       </div>

                       <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                         <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-blue-50 text-[10px] font-bold text-[#003366] border border-blue-100">
                           {ev.initial}
                         </div>
                         <span className="text-[12px] text-gray-600">{ev.pic}</span>
                       </div>
                     </div>
                   </div>
                 ))}

                 {/* No More Events placeholder */}
                 <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 mt-6 bg-white/50">
                    <svg className="w-8 h-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[12px] font-medium">No more events for this day.</span>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Floating Action Button for List View Mobile */}
        {viewMode === 'list' && (
          <button 
            onClick={() => setIsFormatModalOpen(true)}
            className="md:hidden fixed bottom-24 right-5 w-14 h-14 bg-[#003366] rounded-2xl shadow-[0_8px_20px_rgba(0,51,102,0.3)] flex items-center justify-center text-white z-40 transition-transform active:scale-95"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          </button>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 px-2 pt-2 pb-5 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => setViewMode('calendar')}
          className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors relative ${viewMode === 'calendar' ? 'text-[#003366]' : 'text-gray-400'}`}
        >
          {viewMode === 'calendar' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#003366] rounded-b-full"></div>}
          <svg className="w-6 h-6 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={viewMode === 'calendar' ? 2.5 : 2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-bold">Calendar</span>
        </button>

        <button 
          onClick={() => setViewMode('list')}
          className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors relative ${viewMode === 'list' ? 'text-[#003366]' : 'text-gray-400'}`}
        >
          {viewMode === 'list' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#003366] rounded-b-full"></div>}
          <svg className="w-6 h-6 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={viewMode === 'list' ? 2.5 : 2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-bold">List</span>
        </button>

        <button 
          onClick={signOut}
          className="flex flex-col items-center gap-1 p-2 min-w-[64px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>

      {/* Select Format Modal */}
      {isFormatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white rounded-t-[28px] md:rounded-2xl shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative p-6 text-center border-b border-gray-100 shrink-0">
              <button onClick={() => setIsFormatModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 rounded-full p-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-[20px] font-extrabold text-[#003366] mb-1 tracking-tight">Pilih Format Acara</h2>
              <p className="text-[13px] text-gray-500">Silakan pilih format acara yang akan Anda selenggarakan.</p>
            </div>
            
            <div className="p-5 md:p-8 bg-[#F8FAFC] flex flex-col md:flex-row items-stretch justify-center gap-3 md:gap-5 overflow-y-auto">
              
              {/* Onsite */}
              <button 
                onClick={() => { resetBooking(); updateBooking({ format: 'onsite' }); navigate('/room-booking'); }}
                className="w-full md:flex-1 bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-row md:flex-col items-center text-left md:text-center hover:border-[#003366] hover:shadow-lg transition-all group gap-4 md:gap-0">
                <div className="w-12 h-12 bg-blue-50 text-[#003366] rounded-xl flex items-center justify-center md:mb-4 group-hover:bg-[#003366] group-hover:text-white transition-colors shrink-0">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                   </svg>
                </div>
                <div>
                  <h3 className="text-[15px] md:text-[14px] font-bold text-gray-900 mb-0.5 md:mb-1.5">Onsite (Tatap Muka)</h3>
                  <p className="text-[13px] md:text-[12px] text-gray-500 leading-relaxed">Acara fisik di lokasi tertentu.</p>
                </div>
              </button>

              {/* Hybrid */}
              <button 
                onClick={() => { resetBooking(); updateBooking({ format: 'hybrid' }); navigate('/online-booking'); }}
                className="w-full md:flex-1 bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-row md:flex-col items-center text-left md:text-center hover:border-[#003366] hover:shadow-lg transition-all group gap-4 md:gap-0">
                <div className="w-12 h-12 bg-blue-50 text-[#003366] rounded-xl flex items-center justify-center md:mb-4 group-hover:bg-[#003366] group-hover:text-white transition-colors shrink-0">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                </div>
                <div>
                  <h3 className="text-[15px] md:text-[14px] font-bold text-gray-900 mb-0.5 md:mb-1.5">Hybrid (Gabungan)</h3>
                  <p className="text-[13px] md:text-[12px] text-gray-500 leading-relaxed">Kombinasi kehadiran fisik dan online.</p>
                </div>
              </button>

              {/* Online */}
              <button 
                onClick={() => { resetBooking(); updateBooking({ format: 'online' }); navigate('/online-booking'); }}
                className="w-full md:flex-1 bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-row md:flex-col items-center text-left md:text-center hover:border-[#003366] hover:shadow-lg transition-all group gap-4 md:gap-0">
                <div className="w-12 h-12 bg-blue-50 text-[#003366] rounded-xl flex items-center justify-center md:mb-4 group-hover:bg-[#003366] group-hover:text-white transition-colors shrink-0">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                   </svg>

                </div>
                <div>
                  <h3 className="text-[15px] md:text-[14px] font-bold text-gray-900 mb-0.5 md:mb-1.5">Online (Daring)</h3>
                  <p className="text-[13px] md:text-[12px] text-gray-500 leading-relaxed">Acara sepenuhnya dilakukan secara online.</p>
                </div>
              </button>

            </div>
          </div>
        </div>
      )}
      {/* ─── EVENT DETAILS MODAL ─── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-gray-900/40 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          {/* Backdrop click handler */}
          <div className="absolute inset-0" onClick={() => setSelectedEvent(null)}></div>
          
          <div className="bg-white rounded-t-[28px] md:rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] relative z-10 animate-slide-up md:animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-gray-100 flex flex-col relative shrink-0">
              {/* Mobile grab handle */}
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden"></div>
              
              <button onClick={() => setSelectedEvent(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div className="mb-2">
                <span className="bg-[#EBF1FF] text-[#0052A3] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                  {selectedEvent.type || 'Seminar'}
                </span>
              </div>
              <h2 className="text-[20px] md:text-[22px] font-extrabold text-[#0D1526] leading-tight pr-6">
                {selectedEvent.title || 'Tech Innovation Workshop'}
              </h2>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* Host, Time, Location Grid */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-0.5">HOST</div>
                    <div className="text-[13px] font-medium text-gray-900 leading-snug">{selectedEvent.pic || 'Dr. Bambang'}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-0.5">TIME</div>
                    <div className="text-[13px] font-medium text-gray-900 leading-snug">{selectedEvent.timeStart || '14:00'} - {selectedEvent.timeEnd || '16:00'}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 col-span-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-0.5">LOCATION</div>
                    <div className="text-[13px] font-medium text-gray-900 leading-snug">{selectedEvent.room || 'Auditorium Lt.4'}</div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 mb-6" />

              {/* Hybrid Event Link */}
              <div className="bg-[#F4F7FB] border border-[#E2E8F0] rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#0052A3]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                  <h3 className="text-[13px] font-bold text-[#0052A3]">Hybrid Event Link</h3>
                </div>
                <p className="text-[12px] text-gray-600 mb-4 leading-relaxed pr-2">
                  This event has a virtual participation option. Join via the provided link below.
                </p>
                <button className="w-full bg-[#0052A3] hover:bg-[#003366] text-white py-3 rounded-lg font-bold text-[13px] transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Join Zoom Meeting
                </button>
              </div>

              {/* Requested IT Assets */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <h3 className="text-[13px] font-bold text-[#0D1526]">Requested IT Assets</h3>
                </div>
                
                <div className="space-y-0 divide-y divide-gray-100 border-b border-gray-100">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[13px] text-gray-700 font-medium">Wireless Mics</span>
                    <span className="bg-[#EBF1FF] text-[#0052A3] text-[11px] font-bold px-2 py-1 rounded shadow-sm">2x</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[13px] text-gray-700 font-medium">Projector</span>
                    <span className="bg-[#EBF1FF] text-[#0052A3] text-[11px] font-bold px-2 py-1 rounded shadow-sm">1x</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer / Actions */}
            <div className="p-6 pt-2 shrink-0 bg-white space-y-3">
              <button className="w-full bg-[#0052A3] hover:bg-[#003366] text-white py-3 rounded-xl font-bold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(0,82,163,0.2)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit Booking
              </button>
              <button className="w-full bg-white border border-[#F87171] text-[#DC2626] hover:bg-red-50 py-3 rounded-xl font-bold text-[14px] transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Cancel Event
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
