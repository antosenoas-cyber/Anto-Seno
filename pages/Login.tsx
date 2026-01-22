
import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

interface LoginProps {
  onLogin: (status: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onLogin(true);
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="fixed inset-0 bg-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-10">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Absensi Digital</h1>
          <p className="text-gray-500 mt-2">Silakan masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-200">{error}</p>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200"
          >
            Masuk
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; 2024 Digital Attendance System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
