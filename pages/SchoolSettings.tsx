
import React, { useState } from 'react';
import { Save, Upload, School as SchoolIcon } from 'lucide-react';
import { School } from '../types';

interface SchoolSettingsProps {
  school: School;
  setSchool: React.Dispatch<React.SetStateAction<School>>;
}

const SchoolSettings: React.FC<SchoolSettingsProps> = ({ school, setSchool }) => {
  const [formData, setFormData] = useState<School>(school);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSchool(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil Sekolah</h1>
          <p className="text-gray-500">Kelola informasi dasar lembaga pendidikan</p>
        </div>
        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium animate-bounce">
            Informasi berhasil disimpan!
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              <div className="relative group">
                <img 
                  src={formData.logo} 
                  alt="Logo Sekolah" 
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-100 shadow-md group-hover:opacity-75 transition-opacity"
                />
                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity bg-black/20 rounded-2xl">
                  <Upload className="text-white" />
                  <input type="file" className="hidden" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData(prev => ({ ...prev, logo: URL.createObjectURL(e.target.files![0]) }));
                    }
                  }} />
                </label>
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">Unggah Logo Sekolah</p>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NPSN</label>
                <input 
                  type="text" 
                  name="npsn"
                  value={formData.npsn}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pelajaran</label>
                <input 
                  type="text" 
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. 2024/2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select 
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kepala Sekolah</label>
                <input 
                  type="text" 
                  name="principal"
                  value={formData.principal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
          <button 
            type="submit"
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md shadow-indigo-100"
          >
            <Save size={18} />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolSettings;
