
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Users, UserCheck, UserPlus, UserX, AlertTriangle, TrendingUp } from 'lucide-react';
import { Student, Attendance, PermissionRequest, AttendanceStatus } from '../types';

interface DashboardProps {
  students: Student[];
  attendances: Attendance[];
  permissions: PermissionRequest[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, attendances, permissions }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter(a => a.date === today);

  const stats = {
    total: students.length,
    present: todayAttendances.filter(a => a.status === AttendanceStatus.HADIR).length,
    sick: todayAttendances.filter(a => a.status === AttendanceStatus.SAKIT).length,
    permit: todayAttendances.filter(a => a.status === AttendanceStatus.IZIN).length,
    alpha: students.length - todayAttendances.length
  };

  const chartData = [
    { name: 'Hadir', value: stats.present, color: '#10B981' },
    { name: 'Sakit', value: stats.sick, color: '#3B82F6' },
    { name: 'Izin', value: stats.permit, color: '#F59E0B' },
    { name: 'Alpha', value: stats.alpha, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Daily Trend Data (Last 7 Days)
  const getTrendData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const daily = attendances.filter(a => a.date === dateStr);
      data.push({
        name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        hadir: daily.filter(a => a.status === AttendanceStatus.HADIR).length,
        izin: daily.filter(a => a.status === AttendanceStatus.IZIN || a.status === AttendanceStatus.SAKIT).length,
      });
    }
    return data;
  };

  const trendData = getTrendData();

  // Class-based breakdown
  const classStats = students.reduce((acc: any, student) => {
    const className = student.className || 'Tanpa Kelas';
    if (!acc[className]) acc[className] = { name: className, hadir: 0, alpha: 0 };
    const attendance = todayAttendances.find(a => a.studentId === student.id);
    if (attendance?.status === AttendanceStatus.HADIR) {
      acc[className].hadir += 1;
    } else {
      acc[className].alpha += 1;
    }
    return acc;
  }, {});

  const barChartData = Object.values(classStats);

  return (
    <div className="space-y-6 pb-12">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Real-time</h1>
        <p className="text-gray-500">Statistik kehadiran hari ini: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Users className="text-indigo-600" />} label="Total Siswa" value={stats.total} color="border-indigo-500" />
        <StatCard icon={<UserCheck className="text-green-600" />} label="Hadir" value={stats.present} color="border-green-500" />
        <StatCard icon={<UserPlus className="text-blue-600" />} label="Sakit" value={stats.sick} color="border-blue-500" />
        <StatCard icon={<UserPlus className="text-amber-600" />} label="Izin" value={stats.permit} color="border-amber-500" />
        <StatCard icon={<UserX className="text-red-600" />} label="Alpha" value={stats.alpha} color="border-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-500" />
            Tren Kehadiran (7 Hari Terakhir)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hadir" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Hadir" />
                <Line type="monotone" dataKey="izin" stroke="#F59E0B" strokeWidth={2} name="Izin/Sakit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Persentase Kehadiran Hari Ini</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Kehadiran per Kelas</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hadir" fill="#10B981" name="Hadir" radius={[4, 4, 0, 0]} />
                <Bar dataKey="alpha" fill="#EF4444" name="Alpha" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} />
            Izin Menunggu Verifikasi
          </h2>
          <div className="space-y-4">
            {permissions.filter(p => p.status === 'Menunggu').slice(0, 5).map(p => {
              const student = students.find(s => s.id === p.studentId);
              return (
                <div key={p.id} className="p-3 border border-gray-50 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-bold text-gray-800 text-sm">{student?.name || 'Unknown'}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.type === 'Sakit' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.type}
                    </span>
                    <a href="#/permissions" className="text-xs text-indigo-600 font-medium">Verifikasi</a>
                  </div>
                </div>
              );
            })}
            {permissions.filter(p => p.status === 'Menunggu').length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm italic">Semua izin sudah diproses</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number, color: string }> = ({ icon, label, value, color }) => (
  <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${color} flex items-center space-x-4`}>
    <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default Dashboard;
