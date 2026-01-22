
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, X } from 'lucide-react';
import { Teacher, Gender } from '../types';

interface TeacherManagementProps {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({ teachers, setTeachers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    gender: Gender.L,
    nip: '',
    photo: 'https://picsum.photos/200/200?random=' + Math.random()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...formData } as Teacher : t));
    } else {
      const newTeacher: Teacher = {
        id: Math.random().toString(36).substr(2, 9),
        ...(formData as Omit<Teacher, 'id'>)
      } as Teacher;
      setTeachers(prev => [...prev, newTeacher]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormData({ name: '', gender: Gender.L, nip: '', photo: 'https://picsum.photos/200/200?random=' + Math.random() });
  };

  const editTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData(teacher);
    setIsModalOpen(true);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.nip.includes(search)
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Guru</h1>
          <p className="text-gray-500">Daftar tenaga pendidik</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md"
        >
          <Plus size={18} />
          <span>Tambah Guru</span>
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau NIP..." 
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
                <th className="px-6 py-4">NIP</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={teacher.photo} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{teacher.name}</p>
                    <p className="text-xs text-gray-400">{teacher.gender}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{teacher.nip}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => editTeacher(teacher)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setTeachers(prev => prev.filter(t => t.id !== teacher.id))}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Tidak ada data guru ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
              <h2 className="text-xl font-bold text-indigo-900">{editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h2>
              <button onClick={closeModal} className="text-indigo-400 hover:text-indigo-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <img src={formData.photo} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-md" />
                  <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer bg-black/30 rounded-full transition-all">
                    <Camera className="text-white" size={20} />
                    <input type="file" className="hidden" onChange={(e) => {
                       if (e.target.files && e.target.files[0]) {
                         const reader = new FileReader();
                         reader.onload = (ev) => setFormData(prev => ({ ...prev, photo: ev.target?.result as string }));
                         reader.readAsDataURL(e.target.files[0]);
                       }
                    }} />
                  </label>
                </div>
              </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={formData.nip}
                    onChange={(e) => setFormData(prev => ({ ...prev, nip: e.target.value }))}
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
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">Simpan Guru</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
