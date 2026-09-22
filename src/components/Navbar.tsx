'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Calendar, CheckSquare, BarChart2 } from 'lucide-react';
import { getTodayWIB, getCurrentTimeWIB } from '@/lib/timezone';

export default function Navbar() {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(getCurrentTimeWIB());
      setDateStr(getTodayWIB());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/absen', label: 'Form Absen' },
    { href: '/monitoring', label: 'Monitoring' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-lg leading-tight tracking-tight">
                Absensi<span className="text-blue-600">App</span>
              </div>
              <p className="text-xs text-slate-400">Employee Attendance System</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* WIB Clock Indicator */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">{timeStr || '--:--:--'}</span>
              <span className="text-slate-400 text-[10px] font-sans font-medium px-1 bg-slate-200 rounded">
                WIB
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
