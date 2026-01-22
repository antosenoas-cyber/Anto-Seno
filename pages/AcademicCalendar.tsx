
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Tag, Info } from 'lucide-react';
import { CalendarEvent } from '../types';

interface AcademicCalendarProps {
  calendar: CalendarEvent[];
  setCalendar: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ calendar, setCalendar }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    type: 'Agenda'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      ...(formData as Omit<CalendarEvent, 'id'>)
    };
    setCalendar(prev => [...prev, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsModalOpen(false);
    setFormData({ date: new Date().toISOString().split('T')[0], title: '', description: '', type: 'Agenda' });
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kalender Akademik</h1>
          <p className="text-gray-500">Agenda, libur, dan jadwal penting sekolah</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md"
        >
          <Plus size={18} />
          <span>Tambah Agenda</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <CalendarIcon className="text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-800">Daftar Agenda</h2>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {calendar.length > 0 ? calendar.map((event) => (
              <div key={event.id} className="group relative bg-gray-50 hover:bg-white p-4 rounded-xl border border-gray-100 transition-all hover:shadow-md">
                <div className="flex justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mb-2 inline-block ${
                    event.type === 'Libur' ? 'bg-red-100 text-red-600' : 
                    event.type === 'Ujian' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {event.type}
                  </span>
                  <button 
                    onClick={() => setCalendar(prev => prev.filter(e => e.id !== event.id))}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4 className="font-bold text-gray-800">{event.title}</h4>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <CalendarIcon size={12} className="mr-1" />
                  {new Date(event.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
                <p className="text-sm text-gray-600 mt-2">{event.description}</p>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-400">
                <p>Belum ada agenda terdaftar</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Info size={18} className="text-indigo-600" />
              Status Hari Ini
            </h2>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
              <p className="text-sm text-indigo-800 font-medium">Hari Kerja Aktif</p>
              <p className="text-2xl font-bold text-indigo-900 mt-1">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Tipe</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Agenda Sekolah
                </span>
                <span className="font-bold">{calendar.filter(e => e.type === 'Agenda').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span> Hari Libur
                </span>
                <span className="font-bold">{calendar.filter(e => e.type === 'Libur').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span> Jadwal Ujian
                </span>
                <span className="font-bold">{calendar.filter(e => e.type === 'Ujian').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-indigo-50">
              <h2 className="text-xl font-bold text-indigo-900">Tambah Agenda Baru</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Agenda</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Pembagian Raport"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Agenda</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="Agenda">Agenda Biasa</option>
                  <option value="Libur">Hari Libur</option>
                  <option value="Ujian">Ujian / Evaluasi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;
