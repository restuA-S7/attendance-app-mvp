import { NextRequest, NextResponse } from 'next/server';
import { findAttendanceRecord, appendClockIn } from '@/lib/googleSheets';
import { getTodayWIB, getCurrentTimeWIB } from '@/lib/timezone';
import { ApiResponse, ClockInRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ClockInRequest = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Nama karyawan wajib diisi',
        },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const today = getTodayWIB();
    const currentTime = getCurrentTimeWIB();

    // Check if employee has already clocked in today
    const { exists } = await findAttendanceRecord(trimmedName, today);

    if (exists) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Anda sudah melakukan Clock In hari ini',
        },
        { status: 400 }
      );
    }

    // Append new row: [Date, Name, ClockIn, "", ""]
    await appendClockIn(today, trimmedName, currentTime);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `Clock In berhasil dicatat pada ${currentTime} WIB`,
        data: {
          name: trimmedName,
          date: today,
          clockIn: currentTime,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error during clock in:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: error?.message || 'Terjadi kesalahan sistem saat memproses Clock In',
      },
      { status: 500 }
    );
  }
}
