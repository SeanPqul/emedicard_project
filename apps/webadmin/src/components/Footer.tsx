'use client';
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">eM</span>
            </div>
            <span className="text-xl font-bold">eMediCard</span>
          </div>
          <p className="text-gray-400 mb-4">
            Revolutionizing healthcare access through digital innovation and mobile technology.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
            </li>
            <li>
              <a href="#how-to-apply" className="hover:text-white transition-colors">How to Apply</a>
            </li>
            <li>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            </li>
            <li>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-gray-400">
            <li>support@emedicard.com</li>
            <li>+63 123 456 7890</li>
            <li>Davao City, Philippines</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2025 eMediCard. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
