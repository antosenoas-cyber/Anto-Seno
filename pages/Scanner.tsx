
import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import jsQR from 'jsqr';
import { Student, Attendance, AttendanceStatus } from '../types';

interface ScannerProps {
  students: Student[];
  attendances: Attendance[];
  setAttendances: React.Dispatch<React.SetStateAction<Attendance[]>>;
}

const Scanner: React.FC<ScannerProps> = ({ students, attendances, setAttendances }) => {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanCooldown, setScanCooldown] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  const processAttendance = (nisn: string) => {
    if (scanCooldown) return;

    const student = students.find(s => s.nisn === nisn);
    const today = new Date().toISOString().split('T')[0];

    if (!student) {
      setStatus('error');
      setScannedResult('QR Code tidak valid atau siswa tidak terdaftar');
      setScanCooldown(true);
      return;
    }

    const alreadyScanned = attendances.find(a => a.studentId === student.id && a.date === today);
    if (alreadyScanned) {
      setStatus('duplicate');
      setActiveStudent(student);
      setScannedResult('Siswa sudah melakukan presensi hari ini');
      setScanCooldown(true);
      return;
    }

    const newAttendance: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: student.id,
      date: today,
      time: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      status: AttendanceStatus.HADIR
    };

    setAttendances(prev => [...prev, newAttendance]);
    setStatus('success');
    setActiveStudent(student);
    setScannedResult('Presensi berhasil dicatat');
    setScanCooldown(true);
    
    // Suara notifikasi sederhana jika didukung
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && !scanCooldown) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas) {
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            processAttendance(code.data);
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
            videoRef.current.play();
            requestRef.current = requestAnimationFrame(tick);
          }
        })
        .catch(err => {
          console.error("Gagal akses kamera:", err);
          setIsCameraActive(false);
          alert("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, scanCooldown]);

  const resetScanner = () => {
    setStatus('idle');
    setScannedResult(null);
    setActiveStudent(null);
    setScanCooldown(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Scan QR Code</h1>
          <p className="text-gray-500">Gunakan kamera untuk memindai kartu pelajar</p>
        </div>
        <button 
          onClick={() => setIsCameraActive(!isCameraActive)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all shadow-md ${
            isCameraActive ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'
          }`}
        >
          <Camera size={20} />
          <span>{isCameraActive ? 'Matikan Kamera' : 'Aktifkan Kamera'}</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-black aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl border-4 border-indigo-100">
          {isCameraActive ? (
            <>
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay Scanner */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`w-64 h-64 border-4 rounded-3xl transition-all duration-300 ${
                  scanCooldown ? (status === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10') : 'border-indigo-400/50 border-dashed animate-pulse'
                }`}>
                  {/* Corner Marks */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>
                </div>
                {!scanCooldown && (
                  <div className="mt-8 bg-black/50 text-white px-4 py-2 rounded-full text-xs font-medium backdrop-blur-md">
                    Posisikan QR Code di tengah kotak
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center p-8 text-gray-500 bg-gray-50 w-full h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Camera size={40} className="text-gray-300" />
              </div>
              <p className="font-medium">Kamera Belum Aktif</p>
              <p className="text-sm mt-1">Klik tombol di atas untuk memulai pemindaian</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className={`bg-white p-8 rounded-2xl shadow-sm border h-full flex flex-col items-center justify-center text-center transition-all ${
            status === 'success' ? 'border-green-200 bg-green-50/30' : 
            status === 'error' ? 'border-red-200 bg-red-50/30' : 
            status === 'duplicate' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'
          }`}>
            {status === 'idle' ? (
              <>
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-400">
                  <RefreshCcw size={48} className="animate-spin-slow" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Menunggu Pindaian...</h2>
                <p className="text-gray-500 mt-2">Sistem akan otomatis mencatat kehadiran saat QR Code terdeteksi.</p>
              </>
            ) : status === 'success' ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-green-100">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-black text-green-700">Berhasil!</h2>
                <p className="text-gray-600 mt-2">{scannedResult}</p>
                {activeStudent && (
                  <div className="mt-6 p-4 bg-white rounded-2xl border border-green-200 flex items-center space-x-4 shadow-sm">
                    <img src={activeStudent.photo} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md" />
                    <div className="text-left">
                      <p className="font-black text-gray-800 text-lg leading-tight">{activeStudent.name}</p>
                      <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-wider">{activeStudent.className} • {activeStudent.nisn}</p>
                    </div>
                  </div>
                )}
                <button onClick={resetScanner} className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg">Scan Berikutnya</button>
              </div>
            ) : status === 'duplicate' ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-amber-100">
                  <AlertCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-amber-700">Sudah Absen</h2>
                <p className="text-gray-600 mt-2">{scannedResult}</p>
                {activeStudent && (
                  <div className="mt-6 p-4 bg-white rounded-2xl border border-amber-200 flex items-center space-x-4 shadow-sm">
                    <img src={activeStudent.photo} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md" />
                    <div className="text-left">
                      <p className="font-black text-gray-800 text-lg leading-tight">{activeStudent.name}</p>
                      <p className="text-xs font-bold text-amber-600 mt-1 uppercase tracking-wider">Tercatat pukul {attendances.find(a => a.studentId === activeStudent.id && a.date === new Date().toISOString().split('T')[0])?.time}</p>
                    </div>
                  </div>
                )}
                <button onClick={resetScanner} className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg">Scan Berikutnya</button>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-red-100">
                  <XCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-red-700">Gagal</h2>
                <p className="text-gray-600 mt-2">{scannedResult}</p>
                <button onClick={resetScanner} className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg">Coba Lagi</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
