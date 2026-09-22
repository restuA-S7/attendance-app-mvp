import { NextRequest, NextResponse } from 'next/server';
import { findAttendanceRecord, updateClockOut } from '@/lib/googleSheets';
import { uploadBase64Image } from '@/lib/cloudinary';
import { getTodayWIB, getCurrentTimeWIB } from '@/lib/timezone';
import { ApiResponse, ClockOutRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ClockOutRequest = await request.json();
    const { name, imageBase64 } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Nama karyawan wajib diisi',
        },
        { status: 400 }
      );
    }

    if (!imageBase64 || imageBase64.trim() === '') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Bukti foto selfie wajib disertakan saat Clock Out',
        },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const today = getTodayWIB();
    const currentTime = getCurrentTimeWIB();

    // 1. Search Attendance sheet for today + this name
    const { exists, rowIndex, record } = await findAttendanceRecord(trimmedName, today);

    if (!exists || !rowIndex || !record) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Anda belum Clock In hari ini',
        },
        { status: 400 }
      );
    }

    // 2. Check if already Clocked Out
    if (record.clockOut && record.clockOut.trim() !== '') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Anda sudah Clock Out hari ini',
        },
        { status: 400 }
      );
    }

    // 3. Upload image to Cloudinary
    let photoUrl = '';
    try {
      photoUrl = await uploadBase64Image(imageBase64, 'attendance');
    } catch (uploadError: any) {
      console.error('Error uploading image to Cloudinary:', uploadError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: `Gagal mengunggah foto ke Cloudinary: ${uploadError?.message || 'Unknown error'}`,
        },
        { status: 502 }
      );
    }

    // 4. Update row in Google Sheets (Col D: Time, Col E: PhotoURL)
    await updateClockOut(rowIndex, currentTime, photoUrl);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `Clock Out berhasil dicatat pada ${currentTime} WIB`,
        data: {
          name: trimmedName,
          date: today,
          clockOut: currentTime,
          photoUrl,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error during clock out:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: error?.message || 'Terjadi kesalahan sistem saat memproses Clock Out',
      },
      { status: 500 }
    );
  }
}
