'use client';

import AdminNotificationBell from '@/components/AdminNotificationBell';
import CustomUserButton from '@/components/CustomUserButton';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  children?: React.ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const router = useRouter();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="flex items-center gap-3 group transition-all duration-200 hover:opacity-80"
              aria-label="Go to dashboard"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
                <span className="text-white font-bold text-lg">eM</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight hidden sm:block">
                eMediCard
              </span>
            </button>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-3 sm:gap-4">
            {children && (
              <div className="hidden lg:flex items-center">
                {children}
              </div>
            )}
            <div className="flex items-center gap-2 sm:gap-3">
              <AdminNotificationBell />
              <div className="pl-2 sm:pl-3 border-l border-gray-200">
                <CustomUserButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
