// src/components/CustomUserButton.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import { setLoggingOut } from '@/utils/convexErrorHandler';

export default function CustomUserButton() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    // Set logging out flag to prevent auth error displays
    setLoggingOut(true);
    
    // Close the dropdown
    setIsOpen(false);
    
    // Small delay to allow state updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Sign out and redirect
    await signOut({ redirectUrl: '/' });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The clickable profile icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        aria-label="Open user menu"
      >
        <Image
          src={user.imageUrl}
          alt="User profile picture"
          width={36}
          height={36} // Make it square for better rendering
          className="object-cover"
        />
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
        >
          <div className="transition-all duration-100 ease-out"
               style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
          >
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-sm text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
            <div className="py-1 border-t border-gray-100">
              <a href="/manage-account"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Manage account
              </a>
            </div>
            <div className="py-1 border-t border-gray-100">
              <button
                onClick={handleSignOut}
                className="w-full text-left block px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700"
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}