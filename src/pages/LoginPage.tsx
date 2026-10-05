import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CaVeLogo from '../components/CaVeLogo';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccessMsg('Akun berhasil dibuat! Anda sekarang bisa login.');
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setError(authError.message === 'Invalid login credentials'
            ? 'Email atau password salah. Silakan coba lagi.'
            : authError.message);
        } else {
          navigate('/schedules');
        }
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'azure') => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/schedules` },
    });
    if (oauthError) setError(oauthError.message);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel — Background Illustration (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-[#d6e6f5] via-[#e0ecf6] to-[#eaf1f8]">
        {/* Floating Calendar Grid */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Glassmorphism calendar */}
          <div className="relative w-[80%] h-[70%]">
            {/* Background ambient glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Main Glass Card */}
            <div className="absolute inset-4 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl p-6 md:p-8">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cave-blue/60" />
                  <div className="h-3 w-24 bg-cave-blue/20 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/60 border border-white/80" />
                  <div className="w-8 h-8 rounded-lg bg-white/60 border border-white/80" />
                </div>
              </div>

              {/* Calendar Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-cave-blue/50 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 flex-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const isEvent = [4, 8, 12, 15, 19, 23, 27].includes(i);
                  const isToday = i === 15;
                  const isHighlight = i === 12;
                  return (
                    <div
                      key={i}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                        transition-all duration-300 cursor-pointer
                        ${isToday
                          ? 'bg-cave-blue text-white shadow-lg shadow-cave-blue/30 scale-105'
                          : isHighlight
                            ? 'bg-blue-100/80 text-cave-blue border border-blue-200/60'
                            : isEvent
                              ? 'bg-white/60 text-cave-blue/80 border border-white/80 hover:bg-white/80'
                              : 'text-cave-blue/40 hover:bg-white/30'
                        }
                      `}
                    >
                      {i + 1 <= 31 ? i + 1 : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating Event Cards */}
            <div className="absolute -right-4 top-[20%] bg-white/70 backdrop-blur-lg rounded-xl border border-white/80 shadow-xl p-3 w-44 animate-float">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-semibold text-cave-dark">Team Meeting</span>
              </div>
              <span className="text-[9px] text-cave-blue/60">10:00 - 11:30 AM</span>
            </div>

            <div className="absolute -left-2 bottom-[25%] bg-white/70 backdrop-blur-lg rounded-xl border border-white/80 shadow-xl p-3 w-40 animate-float-delayed">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-semibold text-cave-dark">Room Booked</span>
              </div>
              <span className="text-[9px] text-cave-blue/60">Lab 4A · 2:00 PM</span>
            </div>

            {/* Floating icons */}
            <div className="absolute top-4 right-[20%] bg-white/60 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-white/70 animate-float">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="absolute bottom-8 right-[15%] bg-white/60 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-white/70 animate-float-delayed">
              <svg className="w-5 h-5 text-cave-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 to-transparent" />
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24 bg-white relative overflow-y-auto">
        {/* Subtle background pattern for mobile */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 lg:hidden" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center lg:items-start">
            <CaVeLogo size="md" variant="full" className="mb-5" />

            <p className="mt-2 text-gray-500 text-sm sm:text-base">
              Manage your campus spaces and equipment effortlessly.
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              id="btn-login-google"
              type="button"
              onClick={() => handleOAuth('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm
                hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
                active:scale-[0.98]
                transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Login with Google
            </button>

            <button
              id="btn-login-microsoft"
              type="button"
              onClick={() => handleOAuth('azure')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm
                hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
                active:scale-[0.98]
                transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
              </svg>
              Login with Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              {isSignUp ? 'or sign up with email' : 'or login with email'}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {successMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field (Sign Up Only) */}
            {isSignUp && (
              <div className="animate-fade-in">
                <label htmlFor="fullName" className="block text-sm font-semibold text-cave-blue mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required={isSignUp}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-cave-blue/20 focus:border-cave-blue
                      hover:border-gray-300 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-cave-blue mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-cave-blue/20 focus:border-cave-blue
                    hover:border-gray-300
                    transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-cave-blue">
                  Password
                </label>
                {!isSignUp && (
                  <a
                    href="#"
                    id="link-forgot-password"
                    className="text-sm font-medium text-cave-blue hover:text-blue-800 transition-colors"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-cave-blue/20 focus:border-cave-blue
                    hover:border-gray-300
                    transition-all duration-200"
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M21 21l-3.122-3.122" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me (Login Only) */}
            {!isSignUp && (
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-cave-blue bg-gray-100 border-gray-300 rounded focus:ring-cave-blue focus:ring-2 cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-cave-blue text-white font-semibold text-sm
                hover:bg-cave-dark hover:shadow-lg hover:shadow-cave-blue/25
                active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-cave-blue/30 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer
                flex items-center justify-center gap-2 mt-4"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSignUp ? 'Create Account' : 'Login to CaVe'}
            </button>
          </form>

          {/* Toggle Login/Sign Up */}
          <div className="mt-8 text-center">
            <span className="text-gray-500 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              id="link-signup"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMsg(null);
              }}
              className="ml-1.5 text-cave-blue font-bold text-sm hover:underline"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <a href="#" id="link-privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" id="link-terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}
