'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Camera,
  Calendar,
  Sparkles,
} from 'lucide-react';
import CameraCapture from '@/components/CameraCapture';
import { getTodayWIB } from '@/lib/timezone';
import { AttendanceStatus, ApiResponse } from '@/types';

export default function AbsenPage() {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Status for selected user
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  // Action states
  const [isSubmittingClockIn, setIsSubmittingClockIn] = useState<boolean>(false);
  const [isSubmittingClockOut, setIsSubmittingClockOut] = useState<boolean>(false);
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);

  // Feedback notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // 1. Fetch Users list on Mount
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await fetch('/api/users');
      const json: ApiResponse<string[]> = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
      } else {
        setUsersError(json.message || 'Gagal memuat daftar nama karyawan');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setUsersError('Terjadi kesalahan koneksi saat memuat data karyawan');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Fetch Attendance Status when User is Selected
  const checkStatus = async (name: string) => {
    if (!name) {
      setStatus(null);
      return;
    }

    setIsCheckingStatus(true);
    try {
      const today = getTodayWIB();
      const res = await fetch(`/api/attendance/status?name=${encodeURIComponent(name)}&date=${today}`);
      const json: ApiResponse<AttendanceStatus> = await res.json();
      if (json.success && json.data) {
        setStatus(json.data);
      } else {
        setStatus({
          hasClockedIn: false,
          hasClockedOut: false,
        });
      }
    } catch (err) {
      console.error('Error checking status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedUser(val);
    setNotification(null);
    if (val) {
      checkStatus(val);
    } else {
      setStatus(null);
    }
  };

  // 3. Handle Clock In
  const handleClockIn = async () => {
    if (!selectedUser) return;
    setIsSubmittingClockIn(true);
    setNotification(null);

    try {
      const res = await fetch('/api/attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedUser }),
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        setNotification({
          type: 'success',
          message: json.message || 'Clock In berhasil dicatat!',
        });
        // Refresh status immediately
        await checkStatus(selectedUser);
      } else {
        setNotification({
          type: 'error',
          message: json.message || 'Gagal melakukan Clock In',
        });
      }
    } catch (err: any) {
      console.error('Error during clock in:', err);
      setNotification({
        type: 'error',
        message: 'Terjadi kesalahan sistem saat menghubungi server',
      });
    } finally {
      setIsSubmittingClockIn(false);
    }
  };

  // 4. Handle Clock Out Photo Capture & Submission
  const handlePhotoCaptured = async (compressedBase64: string) => {
    setShowCameraModal(false);
    if (!selectedUser) return;

    setIsSubmittingClockOut(true);
    setNotification(null);

    try {
      const res = await fetch('/api/attendance/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedUser,
          imageBase64: compressedBase64,
        }),
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        setNotification({
          type: 'success',
          message: json.message || 'Clock Out berhasil dicatat bersama bukti foto!',
        });
        // Refresh status immediately
        await checkStatus(selectedUser);
      } else {
        setNotification({
          type: 'error',
          message: json.message || 'Gagal melakukan Clock Out',
        });
      }
    } catch (err: any) {
      console.error('Error during clock out:', err);
      setNotification({
        type: 'error',
        message: 'Terjadi kesalahan sistem saat memproses foto dan Clock Out',
      });
    } finally {
      setIsSubmittingClockOut(false);
    }
  };

  // UX Logic evaluations
  const hasClockedIn = Boolean(status?.hasClockedIn);
  const hasClockedOut = Boolean(status?.hasClockedOut);

  // Button disabled states according to specification:
  // "If the API returns hasClockedIn: true, the Clock In button must be DISABLED."
  // "If the API returns hasClockedOut: true, the Clock Out button must be DISABLED."
  const isClockInDisabled = !selectedUser || isCheckingStatus || isSubmittingClockIn || hasClockedIn;
  const isClockOutDisabled = !selectedUser || isCheckingStatus || isSubmittingClockOut || !hasClockedIn || hasClockedOut;

  return (
    <div className="max-w-xl mx-auto py-4">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        {/* Card Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Form Absensi Harian</h1>
            <p className="text-xs sm:text-sm text-slate-500">Pilih nama Anda dan catat waktu kehadiran</p>
          </div>
        </div>

        {/* Feedback Alert */}
        {notification && (
          <div
            className={`mt-6 p-4 rounded-2xl flex items-start gap-3 text-sm animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : notification.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="font-medium">{notification.message}</div>
          </div>
        )}

        {/* Step 1: Dropdown Nama Karyawan */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nama Karyawan <span className="text-rose-500">*</span>
          </label>

          {isLoadingUsers ? (
            <div className="w-full h-12 rounded-xl bg-slate-100 animate-pulse flex items-center px-4 text-xs text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Mengambil daftar karyawan dari Google Sheets...
            </div>
          ) : usersError ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
              <span>{usersError}</span>
              <button
                type="button"
                onClick={fetchUsers}
                className="underline font-semibold ml-2"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedUser}
                onChange={handleUserChange}
                className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none cursor-pointer"
              >
                <option value="">-- Pilih Nama Karyawan --</option>
                {users.map((name, idx) => (
                  <option key={`${name}-${idx}`} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Status Indicator Box */}
        {selectedUser && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status Hari Ini ({getTodayWIB()})
              </span>
              {isCheckingStatus && (
                <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Mengecek status...
                </span>
              )}
            </div>

            {isCheckingStatus ? (
              <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4" />
            ) : hasClockedIn && hasClockedOut ? (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100/70 px-3 py-2 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Absensi Selesai: Masuk {status?.clockInTime || '-'} • Pulang {status?.clockOutTime || '-'}
                </span>
              </div>
            ) : hasClockedIn ? (
              <div className="flex items-center gap-2 text-blue-700 bg-blue-100/70 px-3 py-2 rounded-xl text-xs font-semibold">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Sudah Clock In: {status?.clockInTime || '-'} WIB (Silakan Clock Out saat pulang)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-100/70 px-3 py-2 rounded-xl text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Belum ada catatan absensi hari ini. Silakan Clock In.</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Buttons (Clock In and Clock Out) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Clock In Button */}
          <button
            type="button"
            disabled={isClockInDisabled}
            onClick={handleClockIn}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
              isClockInDisabled
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-[0.98]'
            }`}
          >
            {isSubmittingClockIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Mencatat Clock In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Clock In
              </>
            )}
          </button>

          {/* Clock Out Button */}
          <button
            type="button"
            disabled={isClockOutDisabled}
            onClick={() => setShowCameraModal(true)}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
              isClockOutDisabled
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 active:scale-[0.98]'
            }`}
          >
            {isSubmittingClockOut ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Memproses Foto...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Clock Out
              </>
            )}
          </button>
        </div>

        {/* Helper Instructions */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <strong>Clock In</strong>: Klik langsung saat tiba di lokasi kerja.
          </p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <strong>Clock Out</strong>: Membutuhkan foto selfie verifikasi sebelum absensi pulang dicatat.
          </p>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handlePhotoCaptured}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
}
