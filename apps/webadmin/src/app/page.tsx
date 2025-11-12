// app/page.tsx
'use client';

import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from "react";
import Footer from '../components/Footer';
import LoadingScreen from '../components/shared/LoadingScreen';
import { useQuery } from "convex/react";
import { api } from 'backend/convex/_generated/api';

import {
  getUserFriendlyErrorMessage,
  logAuthError,
  type ErrorContext
} from '../utils/authErrorHandler';
import { setLoggingOut } from '../utils/convexErrorHandler';

// SVG Icon Components for features
const FeatureIcon = ({ d }: { d: string }) => ( 
  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

// Eye icon for password visibility toggle
const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    {isVisible ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    )}
    {!isVisible && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
  </svg>
);

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const howToApplyRef = useRef<HTMLDivElement>(null);

  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  useEffect(() => {
    if (isUserLoaded && isSignedIn && adminPrivileges) {
      // Check if user is super admin and redirect accordingly
      if (adminPrivileges.managedCategories === "all") {
        router.push('/super-admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isUserLoaded, isSignedIn, adminPrivileges, router]);

  useEffect(() => {
    // Clear the logging out flag when landing on the login page
    setLoggingOut(false);
    
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHowToApply = () => {
    howToApplyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded) return;

    setError('');
    setLoading(true);

    try {
      const attempt = await signIn.create({
        identifier: email,
        password,
      });

      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        // Redirect will be handled by useEffect after adminPrivileges loads
        setShowLoginModal(false);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Incomplete authentication:', { status: attempt.status });
        }
        setError('Please complete the additional verification steps.');
      }
    } catch (err: any) {
      const errorContext: ErrorContext = {
        email: email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      const userFriendlyMessage = getUserFriendlyErrorMessage(err);
      setError(userFriendlyMessage);
      logAuthError(err, errorContext);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded || !email) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      
      setForgotPasswordSuccess(true);
      setError('');
      
      // Log success for developers
      if (process.env.NODE_ENV === 'development') {
        console.log('Password reset email sent successfully to:', email);
      }
    } catch (err: any) {
      const errorContext: ErrorContext = {
        email: email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      const userFriendlyMessage = getUserFriendlyErrorMessage(err);
      setError(userFriendlyMessage || 'Failed to send password reset email. Please try again.');
      logAuthError(err, errorContext);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
    setShowForgotPassword(false);
    setForgotPasswordSuccess(false);
    setShowLoginModal(false);
  };

  if (!isUserLoaded || isSignedIn) {
    return <LoadingScreen title="Loading" message="Redirecting to dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">eM</span>
            </div>
            <span className={`text-2xl font-bold ${isScrolled ? 'text-gray-800' : 'text-white'}`}>eMediCard</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: "url('/images/City Health BG.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-emerald-900/50 z-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-20">
          <div className="text-center lg:text-left space-y-6">
            <h1 className="text-5xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Your Health Card,<br />
              <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Digitized</span>
            </h1>
            <p className="text-xl md:text-1xl text-gray-200 mb-10 leading-relaxed max-w-2xl">
              Access your Health Card information anytime, anywhere. <span className="text-emerald-400 font-semibold">Secure, simple, and smart.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                onClick={() => setShowLoginModal(true)}
                aria-label="Apply for eMediCard now"
              >
                Try Now
              </button>
              <button 
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-emerald-600 transition-all duration-300 hover:scale-105 transform"
                onClick={scrollToHowToApply}
                aria-label="Learn how eMediCard works"
              >
                How it Works
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-start justify-center gap-8 lg:gap-10 lg:ml-64">
            <img
              src="/images/davao-logo-color.png"
              alt="Davao City Logo"
              className="max-w-[200px] lg:max-w-[240px] h-auto drop-shadow-2xl"
              draggable={false}
            />
            <img
              src="/images/City Health Logo.jpg"
              alt="City Health Office Logo"
              className="max-w-[200px] lg:max-w-[240px] h-auto rounded-full shadow-2xl ring-4 ring-white/20"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Features</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">Why Choose eMediCard?</h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">Everything you need for seamless healthcare access.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FeatureIcon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Access</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Your health card is always on your phone, ready when you need it.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FeatureIcon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Information</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Your data is encrypted and protected with industry-standard security.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FeatureIcon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Updates</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Keep your information current with our simple update process.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FeatureIcon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Wide Acceptance</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Accepted by a growing network of healthcare providers.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img
                src="/images/human_mobile-application_uc2q.svg"
                alt="eMediCard App Illustration"
                className="max-w-md w-full drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section ref={howToApplyRef} className="py-24 bg-gradient-to-b from-emerald-50 to-white" style={{ scrollMarginTop: '100px' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-6">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">Get Your Card in 3 Easy Steps</h2>
          <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">A quick and straightforward process to get you started.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-emerald-100">1</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Register Online</h3>
              <p className="text-gray-600 leading-relaxed">Fill out the secure online application form with your details.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-emerald-100">2</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Submit Payment</h3>
              <p className="text-gray-600 leading-relaxed">Complete the process by submitting your payment through our secure portal.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-emerald-100">3</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Get Verified</h3>
              <p className="text-gray-600 leading-relaxed">Our team will verify your details and issue your digital health card.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" 
          onClick={resetModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative transform transition-all animate-slideUp" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={resetModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-all"
              aria-label="Close login modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h2 id="login-modal-title" className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600 text-sm">Sign in to access your dashboard</p>
            </div>

            {!showForgotPassword ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                    placeholder="admin@emedicard.com" 
                    required 
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      id="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full px-4 py-3 pr-12 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                      placeholder="••••••••" 
                      required 
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded p-1 transition-all"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon isVisible={showPassword} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-end text-sm">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError('');
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:bg-emerald-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : "Sign In"}
                </button>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              <div className="space-y-5">
                {!forgotPasswordSuccess ? (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        id="reset-email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                        placeholder="admin@emedicard.com" 
                        required 
                      />
                      <p className="text-xs text-gray-500 mt-2">Enter the email address associated with your account</p>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:bg-emerald-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]" 
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : "Send Reset Link"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setError('');
                      }}
                      className="w-full text-emerald-600 hover:text-emerald-700 py-2 font-medium hover:underline transition-colors"
                    >
                      Back to Login
                    </button>
                    {error && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-red-800 font-medium">{error}</p>
                        </div>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-emerald-900 mb-1">Reset Email Sent!</p>
                          <p className="text-sm text-emerald-800">Check your email for password reset instructions. The link will expire in 24 hours.</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordSuccess(false);
                        setError('');
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Back to Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
