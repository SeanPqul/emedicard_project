// app/page.tsx
'use client';

import React, { useRef, useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import LoadingScreen from '../components/shared/LoadingScreen';

import { 
  getUserFriendlyErrorMessage, 
  logAuthError, 
  type ErrorContext 
} from '../utils/authErrorHandler';

// SVG Icon Components for features
 const FeatureIcon = ({ d }: { d: string }) => ( 
  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const howToApplyRef = useRef<HTMLDivElement>(null);

  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isUserLoaded, isSignedIn, router]);

  useEffect(() => {
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
        router.push('/dashboard');
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
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-20">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight">
              Your Health Card,<br />
              <span className="text-emerald-400">Digitized</span>
            </h1>
            <p className="text-xl text-gray-200 mb-10">
              Access your Health Card information anytime, anywhere. Secure, simple, and smart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setShowLoginModal(true)}
              >
                Apply Now
              </button>
              <button 
                className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-emerald-600 transition-all"
                onClick={scrollToHowToApply}
              >
                How it Works
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-8 md:ml-25">
            <img
              src="/images/davao-logo-color.png"
              alt="Davao City Logo"
              className="max-w-[200px] h-auto"
              draggable={false}
            />
            <img
              src="/images/City Health Logo.jpg"
              alt="City Health Office Logo"
              className="max-w-[200px] h-auto rounded-full"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose eMediCard?</h2>
              <p className="text-xl text-gray-600 mb-12">Everything you need for seamless healthcare access.</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-all">
                  <FeatureIcon d="M12 11c0-3.517 3.272-6.442 7-6.928V4h-2V2h4v4h-2V4.52c-3.14.45-5.5 3.013-5.5 6.018 0 3.314 2.686 6 6 6s6-2.686 6-6h2c0 4.418-3.582 8-8 8s-8-3.582-8-8z" />
                  <h3 className="text-xl font-semibold text-gray-900 my-3">Instant Access</h3>
                  <p className="text-gray-600">Your health card is always on your phone.</p>
                </div>
                <div className="p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-all">
                  <FeatureIcon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <h3 className="text-xl font-semibold text-gray-900 my-3">Secure Information</h3>
                  <p className="text-gray-600">Your data is encrypted and protected.</p>
                </div>
                <div className="p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-all">
                  <FeatureIcon d="M4 4v5h4V4H4zm6 0v5h4V4h-4zm6 0v5h4V4h-4zM4 11v5h4v-5H4zm6 0v5h4v-5h-4zm6 0v5h4v-5h-4zM4 18v5h4v-5H4zm6 0v5h4v-5h-4zm6 0v5h4v-5h-4z" />
                  <h3 className="text-xl font-semibold text-gray-900 my-3">Easy Updates</h3>
                  <p className="text-gray-600">Keep your information up-to-date with ease.</p>
                </div>
                <div className="p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-all">
                  <FeatureIcon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <h3 className="text-xl font-semibold text-gray-900 my-3">Wide Acceptance</h3>
                  <p className="text-gray-600">Accepted by a growing network of providers.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/human_mobile-application_uc2q.svg"
                alt="eMediCard App Illustration"
                className="max-w-md w-full"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section ref={howToApplyRef} className="py-24 bg-emerald-50" style={{ scrollMarginTop: '100px' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Your Card in 3 Easy Steps</h2>
          <p className="text-xl text-gray-600 mb-16">A quick and straightforward process.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg">1</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Register Online</h3>
              <p className="text-gray-600">Fill out the secure online application form with your details.</p>
            </div>
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg">2</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Submit Payment</h3>
              <p className="text-gray-600">Complete the process by submitting your payment through our secure portal.</p>
            </div>
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg">3</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Get Verified</h3>
              <p className="text-gray-600">Our team will verify your details and issue your digital health card.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowLoginModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Login</h2>
              <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="admin@emedicard.com" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="••••••••" required />
              </div>
              <div className="flex items-center justify-end text-sm">
                <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">Forgot password?</a>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:bg-emerald-400" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 text-center">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
