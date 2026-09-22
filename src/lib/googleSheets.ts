import { google } from 'googleapis';
import { AttendanceRecord } from '@/types';

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let formatted = key.trim();
  // Strip surrounding quotes if present
  if (
    (formatted.startsWith('"') && formatted.endsWith('"')) ||
    (formatted.startsWith("'") && formatted.endsWith("'"))
  ) {
    formatted = formatted.slice(1, -1);
  }
  // Replace escaped \n with actual newlines
  return formatted.replace(/\\n/g, '\n').trim();
}

function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();

  if (!clientEmail || !privateKey || !sheetId) {
    throw new Error('Konfigurasi Google Sheets API (.env.local) belum lengkap. Pastikan GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, dan GOOGLE_SHEET_ID sudah diatur.');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return { sheets, sheetId };
}

/**
 * Get all employee names from Users sheet (Column A, starting from row 2)
 */
export async function getUsersList(): Promise<string[]> {
  const { sheets, sheetId } = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Users!A2:A',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  // Extract non-empty names
  return rows
    .map((row) => (row[0] ? String(row[0]).trim() : ''))
    .filter((name) => name.length > 0);
}

/**
 * Get attendance records from Attendance sheet, optionally filtered by date range
 */
export async function getAttendanceRecords(startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
  const { sheets, sheetId } = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Attendance!A2:E',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  const records: AttendanceRecord[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const date = row[0] ? String(row[0]).trim() : '';
    const name = row[1] ? String(row[1]).trim() : '';
    const clockIn = row[2] ? String(row[2]).trim() : '';
    const clockOut = row[3] ? String(row[3]).trim() : '';
    const photoUrl = row[4] ? String(row[4]).trim() : '';

    if (!date && !name) continue;

    // Filter by date range if provided
    if (startDate && date < startDate) continue;
    if (endDate && date > endDate) continue;

    records.push({
      date,
      name,
      clockIn,
      clockOut,
      photoUrl,
      rowIndex: i + 2, // 1-indexed, starting from row 2
    });
  }

  // Sort descending by date, then clockIn
  return records.reverse();
}

/**
 * Find today's attendance record for a specific employee
 */
export async function findAttendanceRecord(name: string, date: string) {
  const { sheets, sheetId } = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Attendance!A2:E',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    return { exists: false, rowIndex: null, record: null };
  }

  const searchName = name.trim().toLowerCase();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowDate = row[0] ? String(row[0]).trim() : '';
    const rowName = row[1] ? String(row[1]).trim().toLowerCase() : '';

    if (rowDate === date && rowName === searchName) {
      return {
        exists: true,
        rowIndex: i + 2, // row index in sheet
        record: {
          date: rowDate,
          name: row[1] ? String(row[1]).trim() : '',
          clockIn: row[2] ? String(row[2]).trim() : '',
          clockOut: row[3] ? String(row[3]).trim() : '',
          photoUrl: row[4] ? String(row[4]).trim() : '',
          rowIndex: i + 2,
        },
      };
    }
  }

  return { exists: false, rowIndex: null, record: null };
}

/**
 * Append Clock In row to Attendance sheet: [Date, Name, ClockIn, "", ""]
 */
export async function appendClockIn(date: string, name: string, time: string) {
  const { sheets, sheetId } = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Attendance!A:E',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[date, name, time, '', '']],
    },
  });

  return response.data;
}

/**
 * Update Clock Out in Attendance sheet: Column D (ClockOut) and Column E (PhotoURL)
 */
export async function updateClockOut(rowIndex: number, time: string, photoUrl: string) {
  const { sheets, sheetId } = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Attendance!D${rowIndex}:E${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[time, photoUrl]],
    },
  });

  return response.data;
}
