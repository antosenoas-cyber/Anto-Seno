
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Library, User } from 'lucide-react';
import { SchoolClass, Teacher } from '../types';

interface ClassManagementProps {
  classes: SchoolClass[];
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  teachers: Teacher[];
}

const ClassManagement: React.FC<ClassManagementProps> = ({ classes, setClasses, teachers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [formData, setFormData] = useState<Partial<SchoolClass>>({ name: '', teacherId: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...formData } as SchoolClass : c));
    } else {
      const newClass: SchoolClass = {
        id: Math.random().toString(36).substr(2, 9),
        ...(formData as Omit<SchoolClass, 'id'>)
      } as SchoolClass;
      setClasses(prev => [...prev, newClass]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
    setFormData({ name: '', teacherId: '' });
  };

  const editClass = (c: SchoolClass) => {
    setEditingClass(c);
    setFormData(c);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
          <p className="text-gray-500">Kelola daftar kelas dan wali kelas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md"
        >
          <Plus size={18} />
          <span>Tambah Kelas</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((c) => {
          const teacher = teachers.find(t => t.id === c.teacherId);
          return (
            <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                  <Library size={24} />
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => editClass(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => setClasses(prev => prev.filter(item => item.id !== c.id))}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{c.name}</h3>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {teacher?.photo ? <img src={teacher.photo} alt="" className="w-full h-full rounded-full object-cover" /> : <User size={16} className="text-gray-400" />}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Wali Kelas</p>
                  <p className="text-sm font-medium text-gray-700">{teacher?.name || 'Belum Ditentukan'}</p>
                </div>
              </div>
            </div>
          );
        })}
        {classes.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <Library size={48} className="mx-auto mb-4 opacity-10" />
            <p>Belum ada data kelas. Klik "Tambah Kelas" untuk memulai.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
              <h2 className="text-xl font-bold text-indigo-900">{editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. XII MIPA 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Wali Kelas</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.teacherId}
                  onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                  required
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
