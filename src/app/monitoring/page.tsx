'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { getTodayWIB, getSevenDaysAgoWIB, formatReadableDateWIB } from '@/lib/timezone';
import { AttendanceRecord, ApiResponse } from '@/types';

export default function MonitoringPage() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected photo modal
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    name: string;
    date: string;
    clockOut: string;
  } | null>(null);

  // Initialize default date range: exactly 7 days ago to today
  useEffect(() => {
    const today = getTodayWIB();
    const sevenDaysAgo = getSevenDaysAgoWIB();
    setStartDate(sevenDaysAgo);
    setEndDate(today);
    fetchData(sevenDaysAgo, today);
  }, []);

  const fetchData = async (start: string, end: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/attendance?startDate=${start}&endDate=${end}`);
      const json: ApiResponse<AttendanceRecord[]> = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecords(json.data);
      } else {
        setError(json.message || 'Gagal mengambil riwayat absensi');
      }
    } catch (err: any) {
      console.error('Error fetching attendance data:', err);
      setError('Terjadi masalah koneksi ke server saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate && startDate > endDate) {
      alert('Tanggal mulai tidak boleh melebihi tanggal akhir');
      return;
    }
    fetchData(startDate, endDate);
  };

  // Metrics calculation
  const totalEntries = records.length;
  const completedEntries = records.filter((r) => r.clockIn && r.clockOut).length;
  const activeEntries = records.filter((r) => r.clockIn && !r.clockOut).length;

  return (
    <div className="py-2 space-y-6">
      {/* Top Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Monitoring Absensi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi log kehadiran karyawan yang terhubung ke Google Sheets
          </p>
        </div>

        {/* Action Button */}
        <Link
          href="/absen"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <UserCheck className="w-4 h-4" />
          Mulai Absen
        </Link>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Absensi</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalEntries}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lengkap (In & Out)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{completedEntries}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Belum Clock Out</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{activeEntries}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Dari Tanggal (startDate)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Sampai Tanggal (endDate)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20 flex-1 sm:flex-none"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Filter Data
            </button>

            <button
              type="button"
              onClick={() => fetchData(startDate, endDate)}
              disabled={isLoading}
              title="Refresh Data"
              className="h-11 w-11 rounded-xl border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Tanggal</th>
                <th className="py-3.5 px-4 sm:px-6">Nama Karyawan</th>
                <th className="py-3.5 px-4 sm:px-6">Jam Masuk (Clock In)</th>
                <th className="py-3.5 px-4 sm:px-6">Jam Pulang (Clock Out)</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Bukti Foto</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-xs">Memuat data dari Google Sheets...</p>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">Tidak ada data absensi</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Belum ada data pada rentang tanggal {startDate} s/d {endDate}
                    </p>
                  </td>
                </tr>
              ) : (
                records.map((item, idx) => {
                  const isDone = item.clockIn && item.clockOut;
                  return (
                    <tr key={`${item.date}-${item.name}-${idx}`} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4 sm:px-6 text-xs text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{item.date}</div>
                        <div className="text-[11px] text-slate-400">{formatReadableDateWIB(item.date)}</div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-xs text-blue-700 font-mono whitespace-nowrap">
                        {item.clockIn ? `${item.clockIn} WIB` : '-'}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-xs text-slate-700 font-mono whitespace-nowrap">
                        {item.clockOut ? `${item.clockOut} WIB` : '-'}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                        {item.photoUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPhoto({
                                url: item.photoUrl,
                                name: item.name,
                                date: item.date,
                                clockOut: item.clockOut,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                          >
                            <img
                              src={item.photoUrl}
                              alt="Thumbnail"
                              className="w-5 h-5 rounded-md object-cover border border-slate-300"
                            />
                            Lihat Foto
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Sedang Masuk
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{previewPhoto.name}</h4>
                <p className="text-xs text-slate-400">
                  Clock Out: {previewPhoto.date} {previewPhoto.clockOut} WIB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center">
              <img
                src={previewPhoto.url}
                alt={`Bukti Selfie ${previewPhoto.name}`}
                className="max-h-96 w-auto object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
              <a
                href={previewPhoto.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka Resolusi Penuh
              </a>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
