
export enum Gender {
  L = 'Laki-laki',
  P = 'Perempuan'
}

export enum AttendanceStatus {
  HADIR = 'Hadir',
  SAKIT = 'Sakit',
  IZIN = 'Izin',
  ALPHA = 'Alpha'
}

export enum PermissionStatus {
  PENDING = 'Menunggu',
  APPROVED = 'Disetujui',
  REJECTED = 'Ditolak'
}

export interface School {
  id: string;
  year: string;
  semester: string;
  name: string;
  npsn: string;
  address: string;
  principal: string;
  logo: string;
}

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  nisn: string;
  className: string;
  photo: string;
  qrCode: string;
}

export interface Teacher {
  id: string;
  name: string;
  gender: Gender;
  nip: string;
  photo: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  teacherId: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  time: string;
  status: AttendanceStatus;
}

export interface PermissionRequest {
  id: string;
  studentId: string;
  date: string;
  type: 'Sakit' | 'Izin';
  description: string;
  evidence?: string;
  status: PermissionStatus;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'Libur' | 'Agenda' | 'Ujian';
}
