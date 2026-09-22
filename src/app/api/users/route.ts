import { NextResponse } from 'next/server';
import { getUsersList } from '@/lib/googleSheets';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getUsersList();

    const response: ApiResponse<string[]> = {
      success: true,
      message: 'Berhasil mengambil daftar karyawan',
      data: users,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching users:', error);

    const response: ApiResponse = {
      success: false,
      message: error?.message || 'Terjadi kesalahan saat mengambil daftar karyawan dari Google Sheets',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
