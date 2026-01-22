
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  School, 
  Users, 
  UserSquare2, 
  Library, 
  FileText, 
  Calendar, 
  LogOut,
  ClipboardCheck
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  schoolName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, schoolName }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: QrCode, label: 'Scan QR', path: '/scan' },
    { icon: School, label: 'Data Sekolah', path: '/school' },
    { icon: UserSquare2, label: 'Data Guru', path: '/teachers' },
    { icon: Library, label: 'Data Kelas', path: '/classes' },
    { icon: Users, label: 'Data Siswa', path: '/students' },
    { icon: ClipboardCheck, label: 'Perizinan', path: '/permissions' },
    { icon: Calendar, label: 'Kalender', path: '/calendar' },
    { icon: FileText, label: 'Rekap Absensi', path: '/reports' },
  ];

  return (
    <aside className="w-64 bg-indigo-900 text-white flex flex-col fixed h-full shadow-xl">
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-xl font-bold truncate">Absensi</h1>
        <p className="text-xs text-indigo-300 mt-1 truncate">{schoolName}</p>
      </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="m-4 flex items-center space-x-3 px-4 py-3 text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
      >
        <LogOut size={20} />
        <span className="font-medium">Keluar</span>
      </button>
    </aside>
  );
};

export default Sidebar;
