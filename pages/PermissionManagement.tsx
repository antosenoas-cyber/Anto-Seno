
import React, { useState } from 'react';
import { Check, X, FileText, Eye, AlertCircle, Plus, Upload } from 'lucide-react';
import { Student, PermissionRequest, PermissionStatus, Attendance, AttendanceStatus } from '../types';

interface PermissionManagementProps {
  permissions: PermissionRequest[];
  setPermissions: React.Dispatch<React.SetStateAction<PermissionRequest[]>>;
  students: Student[];
  setAttendances: React.Dispatch<React.SetStateAction<Attendance[]>>;
}

const PermissionManagement: React.FC<PermissionManagementProps> = ({ permissions, setPermissions, students, setAttendances }) => {
  const [filter, setFilter] = useState<PermissionStatus | 'All'>('Menunggu');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PermissionRequest>>({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Izin',
    description: '',
    status: PermissionStatus.PENDING
  });

  const handleVerify = (id: string, status: PermissionStatus) => {
    const permission = permissions.find(p => p.id === id);
    if (!permission) return;

    setPermissions(prev => prev.map(p => p.id === id ? { ...p, status } : p));

    if (status === PermissionStatus.APPROVED) {
      const newAttendance: Attendance = {
        id: Math.random().toString(36).substr(2, 9),
        studentId: permission.studentId,
        date: permission.date,
        time: '--:--',
        status: permission.type === 'Sakit' ? AttendanceStatus.SAKIT : AttendanceStatus.IZIN
      };
      setAttendances(prev => [...prev, newAttendance]);
    }
  };

  const handleAddPermission = (e: React.FormEvent) => {
    e.preventDefault();
    const newPerm: PermissionRequest = {
      id: Math.random().toString(36).substr(2, 9),
      ...(formData as Omit<PermissionRequest, 'id'>)
    };
    setPermissions(prev => [newPerm, ...prev]);
    setIsModalOpen(false);
    setFormData({ studentId: '', date: new Date().toISOString().split('T')[0], type: 'Izin', description: '', status: PermissionStatus.PENDING });
  };

  const filteredPermissions = filter === 'All' ? permissions : permissions.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Perizinan</h1>
          <p className="text-gray-500">Verifikasi pengajuan izin dan sakit siswa</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            {['Menunggu', 'Disetujui', 'Ditolak', 'All'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f === 'All' ? 'Semua' : f}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md"
          >
            <Plus size={18} />
            <span>Tambah Pengajuan</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {filteredPermissions.length > 0 ? (
          filteredPermissions.map((permission) => {
            const student = students.find(s => s.id === permission.studentId);
            return (
              <div key={permission.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md">
                <div className="flex items-center space-x-4">
                  <img src={student?.photo || 'https://picsum.photos/100/100'} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-gray-50 shadow-sm" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-800 text-lg">{student?.name || 'Siswa tidak ditemukan'}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        permission.type === 'Sakit' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {permission.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{student?.className || '-'} • {new Date(permission.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    <p className="text-sm mt-1 italic text-gray-600">"{permission.description}"</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                  {permission.status === PermissionStatus.PENDING ? (
                    <>
                      <button 
                        onClick={() => handleVerify(permission.id, PermissionStatus.APPROVED)}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
                      >
                        <Check size={18} />
                        <span>Setujui</span>
                      </button>
                      <button 
                        onClick={() => handleVerify(permission.id, PermissionStatus.REJECTED)}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
                      >
                        <X size={18} />
                        <span>Tolak</span>
                      </button>
                    </>
                  ) : (
                    <div className={`px-4 py-2 rounded-lg font-bold flex items-center space-x-2 ${
                      permission.status === PermissionStatus.APPROVED ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {permission.status === PermissionStatus.APPROVED ? <Check size={18} /> : <X size={18} />}
                      <span>{permission.status}</span>
                    </div>
                  )}
                  {permission.evidence && (
                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100" title="Lihat Bukti">
                      <Eye size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FileText size={32} />
            </div>
            <h3 className="text-gray-500 font-medium">Tidak ada data perizinan</h3>
            <p className="text-sm text-gray-400">Pengajuan izin akan muncul di sini untuk verifikasi admin.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-indigo-50">
              <h2 className="text-xl font-bold text-indigo-900">Input Pengajuan Izin</h2>
            </div>
            <form onSubmit={handleAddPermission} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.studentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Alasan</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Misal: Demam tinggi, Acara keluarga..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unggah Bukti (Opsional)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                  <Upload size={24} className="mx-auto text-gray-400 group-hover:text-indigo-500 mb-2" />
                  <p className="text-xs text-gray-500">Klik atau seret file (JPG/PNG/PDF)</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">Simpan Pengajuan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start space-x-3">
        <AlertCircle className="text-indigo-600 flex-shrink-0" size={20} />
        <p className="text-sm text-indigo-800">
          <strong>Penting:</strong> Pengajuan izin yang disetujui akan secara otomatis masuk ke dalam rekapitulasi kehadiran harian siswa dengan status "Sakit" atau "Izin".
        </p>
      </div>
    </div>
  );
};

export default PermissionManagement;
