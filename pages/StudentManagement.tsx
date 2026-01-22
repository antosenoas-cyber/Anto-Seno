
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, QrCode as QrIcon, Camera, X, Printer } from 'lucide-react';
import { Student, SchoolClass, Gender } from '../types';

interface StudentManagementProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classes: SchoolClass[];
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students, setStudents, classes }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);
  
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    gender: Gender.L,
    nisn: '',
    className: '',
    photo: 'https://picsum.photos/200/200?random=' + Math.random()
  });

  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${data}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } as Student : s));
    } else {
      const newStudent: Student = {
        id: Math.random().toString(36).substr(2, 9),
        ...(formData as Omit<Student, 'id' | 'qrCode'>),
        qrCode: formData.nisn || '' 
      } as Student;
      setStudents(prev => [...prev, newStudent]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({ name: '', gender: Gender.L, nisn: '', className: '', photo: 'https://picsum.photos/200/200?random=' + Math.random() });
  };

  const editStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setIsModalOpen(true);
  };

  const showQrCode = (student: Student) => {
    setSelectedStudentForQr(student);
    setIsQrModalOpen(true);
  };

  const deleteStudent = (id: string) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handlePrintCard = () => {
    if (!selectedStudentForQr) return;

    const schoolData = JSON.parse(localStorage.getItem('school_data') || '{}');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrUrl = getQrUrl(selectedStudentForQr.nisn);

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Kartu - ${selectedStudentForQr.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
            .card-container {
              width: 85.6mm;
              height: 54mm;
              border: 1px solid #ddd;
              border-radius: 8px;
              position: relative;
              overflow: hidden;
              background: white;
              font-family: 'Inter', sans-serif;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              margin: 20px auto;
            }
            .header-strip {
              background: #312e81;
              color: white;
              padding: 5px 10px;
              display: flex;
              align-items: center;
              gap: 10px;
              height: 50px;
            }
            .photo-box {
              width: 60px;
              height: 75px;
              object-fit: cover;
              border: 2px solid #312e81;
              border-radius: 4px;
            }
            .qr-box {
              width: 70px;
              height: 70px;
            }
          </style>
        </head>
        <body class="bg-gray-100 flex flex-col items-center justify-center min-h-screen">
          <div class="no-print mb-4">
            <button onclick="window.print()" class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-indigo-700">Klik Cetak / Simpan PDF</button>
          </div>
          
          <div class="card-container">
            <div class="header-strip">
              <img src="${schoolData.logo || ''}" style="width: 30px; height: 30px; object-fit: contain;">
              <div style="line-height: 1">
                <p style="font-size: 10px; font-weight: 800; margin: 0; text-transform: uppercase;">KARTU PELAJAR</p>
                <p style="font-size: 8px; margin: 0; opacity: 0.8;">${schoolData.name || 'NAMA SEKOLAH'}</p>
              </div>
            </div>
            
            <div class="p-3 flex gap-4">
              <img src="${selectedStudentForQr.photo}" class="photo-box">
              <div class="flex-1" style="font-size: 9px;">
                <p class="text-gray-400 font-bold mb-0">NAMA LENGKAP</p>
                <p class="font-bold text-gray-800 text-[11px] mb-1 truncate" style="max-width: 140px;">${selectedStudentForQr.name}</p>
                
                <p class="text-gray-400 font-bold mb-0">NISN</p>
                <p class="font-bold text-gray-800 mb-1">${selectedStudentForQr.nisn}</p>
                
                <p class="text-gray-400 font-bold mb-0">KELAS</p>
                <p class="font-bold text-indigo-700">${selectedStudentForQr.className}</p>
              </div>
              <div class="flex flex-col items-center justify-center">
                <img src="${qrUrl}" class="qr-box">
                <p style="font-size: 6px; margin-top: 2px; font-weight: bold; color: #666;">SCAN ABSENSI</p>
              </div>
            </div>
            
            <div style="position: absolute; bottom: 0; width: 100%; height: 4px; background: #312e81;"></div>
          </div>

          <script>
            window.onload = () => {
              // trigger print small delay to ensure QR image loaded
              setTimeout(() => {
                // window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nisn.includes(search)
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Siswa</h1>
          <p className="text-gray-500">Total {students.length} siswa terdaftar</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md"
        >
          <Plus size={18} />
          <span>Tambah Siswa</span>
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau NISN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">L/P</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={student.photo} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{student.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.nisn}</td>
                  <td className="px-6 py-4 text-sm">{student.gender === Gender.L ? 'L' : 'P'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">
                      {student.className || 'Belum diatur'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => editStudent(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => showQrCode(student)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Generate QR">
                        <QrIcon size={16} />
                      </button>
                      <button onClick={() => deleteStudent(student.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Tidak ada data siswa ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Viewer Modal */}
      {isQrModalOpen && selectedStudentForQr && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-center">
            <div className="p-4 border-b flex justify-between items-center bg-indigo-900 text-white">
              <h3 className="font-bold">Preview Kartu Pelajar</h3>
              <button onClick={() => setIsQrModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-8 bg-gray-50">
              <div className="bg-white p-4 inline-block rounded-xl shadow-inner border border-gray-100 mb-6">
                <img 
                  src={getQrUrl(selectedStudentForQr.nisn)} 
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <h4 className="text-xl font-bold text-gray-800">{selectedStudentForQr.name}</h4>
              <p className="text-indigo-600 font-bold mb-1">{selectedStudentForQr.className}</p>
              <p className="text-gray-400 font-mono text-sm tracking-widest">{selectedStudentForQr.nisn}</p>
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <button 
                onClick={handlePrintCard}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
              >
                <Printer size={18} />
                Cetak Kartu / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
              <h2 className="text-xl font-bold text-indigo-900">{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h2>
              <button onClick={closeModal} className="text-indigo-400 hover:text-indigo-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="relative group">
                    <img src={formData.photo} alt="Preview" className="w-40 h-40 rounded-2xl object-cover border-4 border-gray-100 shadow-lg" />
                    <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer bg-black/30 rounded-2xl transition-all">
                      <Camera className="text-white" />
                      <input type="file" className="hidden" onChange={(e) => {
                         if (e.target.files && e.target.files[0]) {
                           const reader = new FileReader();
                           reader.onload = (ev) => setFormData(prev => ({ ...prev, photo: ev.target?.result as string }));
                           reader.readAsDataURL(e.target.files[0]);
                         }
                      }} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Unggah Foto Profil</p>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        value={formData.nisn}
                        onChange={(e) => setFormData(prev => ({ ...prev, nisn: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                      <select 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                      >
                        <option value={Gender.L}>Laki-laki</option>
                        <option value={Gender.P}>Perempuan</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.className}
                      onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                      required
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md shadow-indigo-100">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
