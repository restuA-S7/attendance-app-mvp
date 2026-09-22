import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Sistem Absensi Karyawan | MVP',
  description: 'Sistem absensi karyawan mandiri berbasis Next.js, Google Sheets, dan Cloudinary',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Attendance System MVP. All rights reserved.</p>
            <p className="text-slate-400">
              WIB Timezone (Asia/Jakarta) • Google Sheets API • Cloudinary
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
