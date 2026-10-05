import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Event Space', path: '/event-space' },
    { name: 'Room Booking', path: '/room-booking' },
    { name: 'Schedules', path: '/schedules' },
    { name: 'Analytics', path: '/analytics' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50 h-[60px]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <div className="flex items-center gap-10 h-full">
        {/* Logo */}
        <Link to="/schedules" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#003366' }}>
            <span className="text-white font-extrabold text-sm">C</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: '#003366' }}>CaVe</span>
        </Link>
        
        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-6 h-full">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`h-full flex items-center text-[13px] font-bold transition-colors border-b-2 ${
                  isActive
                    ? 'border-[#003366] text-[#003366]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-5 h-full">
        {/* Search */}
        <div className="relative hidden xl:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-64 pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-[13px] bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366]"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-5 border-l border-gray-200 h-8 cursor-pointer hover:opacity-80 transition-opacity" onClick={signOut}>
          <div className="h-7 w-7 rounded bg-[#003366] flex items-center justify-center overflow-hidden">
            <span className="text-[10px] font-bold text-white">{(profile?.full_name || 'U').charAt(0).toUpperCase()}</span>
          </div>
          <span className="text-[13px] font-bold text-gray-800 hidden sm:block">{profile?.full_name || 'User'}</span>
        </div>
      </div>
    </nav>
  );
}
