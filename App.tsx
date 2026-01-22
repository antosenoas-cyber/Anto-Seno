
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import SchoolSettings from './pages/SchoolSettings';
import StudentManagement from './pages/StudentManagement';
import ClassManagement from './pages/ClassManagement';
import TeacherManagement from './pages/TeacherManagement';
import PermissionManagement from './pages/PermissionManagement';
import AcademicCalendar from './pages/AcademicCalendar';
import AttendanceReport from './pages/AttendanceReport';
import { School, Student, Teacher, SchoolClass, Attendance, PermissionRequest, CalendarEvent } from './types';
import { INITIAL_SCHOOL } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [school, setSchool] = useState<School>(() => {
    const saved = localStorage.getItem('school_data');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('teachers_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem('classes_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('attendance_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [permissions, setPermissions] = useState<PermissionRequest[]>(() => {
    const saved = localStorage.getItem('permissions_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [calendar, setCalendar] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('calendar_data');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence effects
  useEffect(() => { localStorage.setItem('school_data', JSON.stringify(school)); }, [school]);
  useEffect(() => { localStorage.setItem('students_data', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('teachers_data', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('classes_data', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('attendance_data', JSON.stringify(attendances)); }, [attendances]);
  useEffect(() => { localStorage.setItem('permissions_data', JSON.stringify(permissions)); }, [permissions]);
  useEffect(() => { localStorage.setItem('calendar_data', JSON.stringify(calendar)); }, [calendar]);

  const handleLogin = (status: boolean) => {
    setIsAuthenticated(status);
    localStorage.setItem('isLoggedIn', String(status));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-gray-100">
        {isAuthenticated && <Sidebar onLogout={handleLogout} schoolName={school.name} />}
        <main className={`flex-1 transition-all duration-300 ${isAuthenticated ? 'ml-64 p-8' : ''}`}>
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={isAuthenticated ? <Dashboard students={students} attendances={attendances} permissions={permissions} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/scan" 
              element={isAuthenticated ? <Scanner students={students} attendances={attendances} setAttendances={setAttendances} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/school" 
              element={isAuthenticated ? <SchoolSettings school={school} setSchool={setSchool} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/students" 
              element={isAuthenticated ? <StudentManagement students={students} setStudents={setStudents} classes={classes} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/teachers" 
              element={isAuthenticated ? <TeacherManagement teachers={teachers} setTeachers={setTeachers} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/classes" 
              element={isAuthenticated ? <ClassManagement classes={classes} setClasses={setClasses} teachers={teachers} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/permissions" 
              element={isAuthenticated ? <PermissionManagement permissions={permissions} setPermissions={setPermissions} students={students} setAttendances={setAttendances} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/calendar" 
              element={isAuthenticated ? <AcademicCalendar calendar={calendar} setCalendar={setCalendar} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/reports" 
              element={isAuthenticated ? <AttendanceReport students={students} attendances={attendances} school={school} classes={classes} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
