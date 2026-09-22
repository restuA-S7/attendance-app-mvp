export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AttendanceRecord {
  date: string;
  name: string;
  clockIn: string;
  clockOut: string;
  photoUrl: string;
  rowIndex?: number;
}

export interface AttendanceStatus {
  hasClockedIn: boolean;
  hasClockedOut: boolean;
  clockInTime?: string | null;
  clockOutTime?: string | null;
}

export interface ClockInRequest {
  name: string;
}

export interface ClockOutRequest {
  name: string;
  imageBase64: string;
}
