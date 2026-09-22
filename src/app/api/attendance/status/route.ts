import { NextRequest, NextResponse } from 'next/server';
import { findAttendanceRecord } from '@/lib/googleSheets';
import { getTodayWIB } from '@/lib/timezone';
import { ApiResponse, AttendanceStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const date = searchParams.get('date') || getTodayWIB();

    if (!name || name.trim() === '') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Parameter "name" wajib diisi',
        },
        { status: 400 }
      );
    }

    const { exists, record } = await findAttendanceRecord(name, date);

    if (!exists || !record) {
      const statusData: AttendanceStatus = {
        hasClockedIn: false,
        hasClockedOut: false,
        clockInTime: null,
        clockOutTime: null,
      };

      return NextResponse.json<ApiResponse<AttendanceStatus>>({
        success: true,
        message: 'Belum ada catatan absensi untuk hari ini',
        data: statusData,
      });
    }

    const hasClockedIn = Boolean(record.clockIn && record.clockIn.trim() !== '');
    const hasClockedOut = Boolean(record.clockOut && record.clockOut.trim() !== '');

    const statusData: AttendanceStatus = {
      hasClockedIn,
      hasClockedOut,
      clockInTime: record.clockIn || null,
      clockOutTime: record.clockOut || null,
    };

    return NextResponse.json<ApiResponse<AttendanceStatus>>({
      success: true,
      message: 'Status absensi berhasil diambil',
      data: statusData,
    });
  } catch (error: any) {
    console.error('Error checking attendance status:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: error?.message || 'Terjadi kesalahan saat memeriksa status absensi',
      },
      { status: 500 }
    );
  }
}
