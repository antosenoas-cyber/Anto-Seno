
import React, { useState, useMemo } from 'react';
import { Download, Filter, Calendar as CalendarIcon, FileSpreadsheet, FileText, PieChart as PieChartIcon, ArrowRight } from 'lucide-react';
import { Student, Attendance, AttendanceStatus, School, SchoolClass } from '../types';

interface AttendanceReportProps {
  students: Student[];
  attendances: Attendance[];
  school: School;
  classes: SchoolClass[];
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ students, attendances, school, classes }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);

  // Helper to get all dates in range
  const dateRange = useMemo(() => {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate]);

  const totalDaysInRange = dateRange.length;

  const filteredStudents = selectedClass === 'All' 
    ? students 
    : students.filter(s => s.className === selectedClass);

  // Calculate student stats for the range
  const studentStats = useMemo(() => {
    return filteredStudents.map(student => {
      const records = attendances.filter(a => 
        a.studentId === student.id && 
        a.date >= startDate && 
        a.date <= endDate
      );

      const hadir = records.filter(r => r.status === AttendanceStatus.HADIR).length;
      const sakit = records.filter(r => r.status === AttendanceStatus.SAKIT).length;
      const izin = records.filter(r => r.status === AttendanceStatus.IZIN).length;
      
      // Alpha is calculated as: Total days in range minus (Hadir + Sakit + Izin)
      // This assumes every day in the range is a required school day.
      const alpha = Math.max(0, totalDaysInRange - (hadir + sakit + izin));
      const percentage = totalDaysInRange > 0 
        ? ((hadir / totalDaysInRange) * 100).toFixed(1) 
        : '0.0';

      return {
        ...student,
        hadir,
        sakit,
        izin,
        alpha,
        percentage
      };
    });
  }, [filteredStudents, attendances, startDate, endDate, totalDaysInRange]);

  // Overall Summary for the range
  const summary = useMemo(() => {
    const totalPossibleAttendances = studentStats.length * totalDaysInRange;
    const totals = studentStats.reduce((acc, curr) => ({
      hadir: acc.hadir + curr.hadir,
      sakit: acc.sakit + curr.sakit,
      izin: acc.izin + curr.izin,
      alpha: acc.alpha + curr.alpha,
    }), { hadir: 0, sakit: 0, izin: 0, alpha: 0 });

    const avgPercentage = totalPossibleAttendances > 0 
      ? ((totals.hadir / totalPossibleAttendances) * 100).toFixed(1) 
      : '0.0';

    return { ...totals, avgPercentage, totalStudents: studentStats.length };
  }, [studentStats, totalDaysInRange]);

  const handleExportCSV = () => {
    let csvContent = `REKAPITULASI KEHADIRAN SISWA\n`;
    csvContent += `Sekolah: ${school.name}\n`;
    csvContent += `Periode: ${startDate} s/d ${endDate}\n`;
    csvContent += `Kelas: ${selectedClass}\n\n`;
    
    csvContent += `RINGKASAN PERIODE\n`;
    csvContent += `Total Hadir: ${summary.hadir}, Total Sakit: ${summary.sakit}, Total Izin: ${summary.izin}, Total Alpha: ${summary.alpha}\n`;
    csvContent += `Rata-rata Kehadiran: ${summary.avgPercentage}%\n\n`;

    csvContent += `NISN,Nama Siswa,Kelas,Hadir,Sakit,Izin,Alpha,%\n`;

    studentStats.forEach(s => {
      csvContent += `${s.nisn},${s.name},${s.className},${s.hadir},${s.sakit},${s.izin},${s.alpha},${s.percentage}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Rekap_Absensi_${school.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rekap Kehadiran</h1>
          <p className="text-gray-500">Rekapitulasi data kehadiran berdasarkan rentang tanggal</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md"
          >
            <FileSpreadsheet size={18} />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md">
            <FileText size={18} />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Tanggal</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-none self-center mb-2 hidden md:block text-gray-300">
            <ArrowRight size={20} />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Kelas</label>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                <option value="All">Semua Kelas</option>
                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-center text-center">
          <PieChartIcon size={24} className="mx-auto mb-2 opacity-50" />
          <h4 className="text-xs uppercase tracking-widest font-bold text-indigo-300 mb-1">Rata-rata Kehadiran</h4>
          <p className="text-4xl font-black">{summary.avgPercentage}%</p>
          <p className="text-[10px] text-indigo-300 mt-1">Periode {totalDaysInRange} Hari Efektif</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatSummary label="Total Hadir" value={summary.hadir} color="bg-green-100 text-green-700" />
        <StatSummary label="Total Sakit" value={summary.sakit} color="bg-blue-100 text-blue-700" />
        <StatSummary label="Total Izin" value={summary.izin} color="bg-amber-100 text-amber-700" />
        <StatSummary label="Total Alpha" value={summary.alpha} color="bg-red-100 text-red-700" />
      </div>

      {/* Report Sheet */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 border-b border-gray-100 text-center">
          <div className="flex flex-col items-center">
            <img src={school.logo} alt="Logo" className="w-20 h-20 mb-4 object-contain" />
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{school.name}</h2>
            <p className="text-sm text-gray-500 font-medium">{school.address} | NPSN: {school.npsn}</p>
            <div className="mt-6 w-full h-1 bg-gray-900"></div>
            <div className="mt-0.5 w-full h-0.5 bg-gray-900"></div>
            <h3 className="mt-8 font-black text-gray-900 text-xl">LAPORAN REKAPITULASI PRESENSI SISWA</h3>
            <p className="text-md text-gray-600 font-medium">Periode: {new Date(startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })} - {new Date(endDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-200 text-[10px] font-bold text-gray-700 uppercase">
                <th className="px-4 py-3 border-x border-gray-200 text-center">No</th>
                <th className="px-4 py-3 border-x border-gray-200">NISN</th>
                <th className="px-4 py-3 border-x border-gray-200">Nama Siswa</th>
                <th className="px-4 py-3 border-x border-gray-200">Kelas</th>
                <th className="px-4 py-3 border-x border-gray-200 text-center bg-green-50/50">H</th>
                <th className="px-4 py-3 border-x border-gray-200 text-center bg-blue-50/50">S</th>
                <th className="px-4 py-3 border-x border-gray-200 text-center bg-amber-50/50">I</th>
                <th className="px-4 py-3 border-x border-gray-200 text-center bg-red-50/50">A</th>
                <th className="px-4 py-3 border-x border-gray-200 text-center">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {studentStats.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 border-x border-gray-100 text-center">{idx + 1}</td>
                  <td className="px-4 py-3 text-xs font-mono border-x border-gray-100">{s.nisn}</td>
                  <td className="px-4 py-3 text-xs font-bold border-x border-gray-100">{s.name}</td>
                  <td className="px-4 py-3 text-xs border-x border-gray-100">{s.className}</td>
                  <td className="px-4 py-3 text-xs border-x border-gray-100 text-center font-bold text-green-600">{s.hadir}</td>
                  <td className="px-4 py-3 text-xs border-x border-gray-100 text-center font-bold text-blue-600">{s.sakit}</td>
                  <td className="px-4 py-3 text-xs border-x border-gray-100 text-center font-bold text-amber-600">{s.izin}</td>
                  <td className="px-4 py-3 text-xs border-x border-gray-100 text-center font-bold text-red-600">{s.alpha}</td>
                  <td className="px-4 py-3 text-xs border-x border-gray-100 text-center font-black">{s.percentage}%</td>
                </tr>
              ))}
              {studentStats.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 italic">Data tidak ditemukan untuk periode dan filter terpilih.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer of the report sheet */}
        <div className="p-12 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="text-left space-y-4">
                <p className="text-xs text-gray-600 italic">Keterangan:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                    <p>H: <strong>Hadir</strong></p>
                    <p>I: <strong>Izin</strong></p>
                    <p>S: <strong>Sakit</strong></p>
                    <p>A: <strong>Alpha (Tanpa Keterangan)</strong></p>
                </div>
            </div>
            <div className="text-center min-w-[200px]">
                <p className="text-sm text-gray-600 mb-20">{school.address.split(',')[0] || 'Kota'}, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                <p className="font-bold border-b border-black inline-block uppercase">{school.principal}</p>
                <p className="text-xs text-gray-500 mt-1">NIP. ....................................</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatSummary: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div className={`p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center bg-white`}>
        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</p>
        <div className={`text-xl font-black w-full text-center py-1 rounded-lg ${color}`}>{value}</div>
    </div>
);

export default AttendanceReport;
