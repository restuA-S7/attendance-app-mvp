import { NextRequest, NextResponse } from 'next/server';
import { getAttendanceRecords } from '@/lib/googleSheets';
import { ApiResponse, AttendanceRecord } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const records = await getAttendanceRecords(startDate, endDate);

    const response: ApiResponse<AttendanceRecord[]> = {
      success: true,
      message: 'Berhasil memuat data absensi',
      data: records,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching attendance records:', error);

    const response: ApiResponse = {
      success: false,
      message: error?.message || 'Terjadi kesalahan saat memuat data absensi dari Google Sheets',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
