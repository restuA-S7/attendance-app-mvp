import Link from 'next/link';
import { UserCheck, BarChart3, Clock, ArrowRight, ShieldCheck, Database, Cloud } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-12">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          Sistem Absensi Karyawan Real-time (WIB)
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Pencatatan Kehadiran Karyawan yang Praktis & Terintegrasi
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600">
          Solusi absensi mandiri dengan integrasi langsung ke Google Sheets dan penyimpanan bukti foto selfie Cloudinary.
        </p>
      </div>

      {/* Two Large Prominent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Card 1: Mulai Absen */}
        <Link
          href="/absen"
          className="group relative bg-white rounded-3xl p-8 border-2 border-slate-200/80 hover:border-blue-500 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                <UserCheck className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Karyawan
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition">
              Mulai Absen
            </h2>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Lakukan pencatatan kehadiran harian Anda. <strong>Clock In</strong> untuk jam masuk kerja dan <strong>Clock Out</strong> disertai foto selfie saat selesai bertugas.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-600 group-hover:underline flex items-center gap-1.5">
              Buka Form Absen
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="text-xs text-slate-400 font-medium">1x Masuk & Pulang / hari</div>
          </div>
        </Link>

        {/* Card 2: Monitoring Absensi */}
        <Link
          href="/monitoring"
          className="group relative bg-white rounded-3xl p-8 border-2 border-slate-200/80 hover:border-emerald-500 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
                <BarChart3 className="w-8 h-8" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                HR & Tim
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition">
              Monitoring Absensi
            </h2>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Pantau rekapitulasi kehadiran seluruh staf, filter berdasarkan rentang tanggal, lihat ketepatan waktu masuk/pulang, dan tinjau foto selfie kehadiran.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-600 group-hover:underline flex items-center gap-1.5">
              Buka Dashboard Monitoring
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="text-xs text-slate-400 font-medium">Filter Rentang Tanggal</div>
          </div>
        </Link>
      </div>

      {/* Feature Highlights Footer */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full text-center">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex flex-col items-center">
          <Database className="w-5 h-5 text-blue-600 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">Google Sheets Database</h3>
          <p className="text-xs text-slate-500 mt-1">Data absensi langsung tersinkronisasi ke spreadsheet tanpa delay.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex flex-col items-center">
          <Cloud className="w-5 h-5 text-indigo-600 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">Cloudinary Storage</h3>
          <p className="text-xs text-slate-500 mt-1">Penyimpanan foto aman dengan kompresi client-side hemat kuota.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex flex-col items-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
          <h3 className="font-semibold text-slate-800 text-sm">Strict Asia/Jakarta (WIB)</h3>
          <p className="text-xs text-slate-500 mt-1">Konsistensi zona waktu terjamin untuk semua evaluasi kehadiran.</p>
        </div>
      </div>
    </div>
  );
}
