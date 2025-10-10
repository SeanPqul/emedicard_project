'use client';

import { useRouter } from 'next/navigation';
import AdminNotificationBell from '@/components/AdminNotificationBell';
import CustomUserButton from '@/components/CustomUserButton';

interface NavbarProps {
  children?: React.ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const router = useRouter();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.push('/dashboard')} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">eM</span></div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </button>
        </div>
        <div className="flex items-center gap-5">
          {children}
          <AdminNotificationBell />
          <CustomUserButton />
        </div>
      </div>
    </nav>
  );
}
