'use client';

import AdminNotificationBell from '@/components/AdminNotificationBell';
import CustomUserButton from '@/components/CustomUserButton';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavbarProps {
  children?: React.ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center shrink-0">
              <button 
                onClick={() => router.push('/dashboard')} 
                className="flex items-center gap-2 sm:gap-3 group transition-all duration-200 hover:opacity-80"
                aria-label="Go to dashboard"
              >
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0">
                  <Image 
                    src="/images/emedicard-logo.png" 
                    alt="eMediCard Logo" 
                    width={44}
                    height={44}
                    className="rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-200 object-contain"
                    priority
                  />
                </div>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
                  eMediCard
                </span>
              </button>
            </div>

            {/* Right Section - Actions & User */}
            <div className="flex items-center gap-2 sm:gap-3">
              {children && (
                <div className="hidden lg:flex items-center">
                  {children}
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-3">
                <AdminNotificationBell />
                <div className="pl-2 sm:pl-3 border-l border-gray-200 hidden sm:block">
                  <CustomUserButton />
                </div>
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-gray-200 shadow-lg animate-fadeIn">
          <div className="max-w-[1600px] mx-auto px-4 py-4 space-y-3">
            {/* User Button for Mobile */}
            <div className="sm:hidden pb-3 border-b border-gray-200">
              <CustomUserButton />
            </div>
            {/* Children content (activity log, etc.) */}
            {children && (
              <div className="py-2">
                {children}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
