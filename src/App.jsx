import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { InspectionList } from './pages/InspectionList';
import { InspectionDetail } from './pages/InspectionDetail';
import { SyncQueue } from './pages/SyncQueue';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Toast />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><InspectionList /></ProtectedRoute>} />
          <Route path="/inspections/:id" element={<ProtectedRoute><InspectionDetail /></ProtectedRoute>} />
          <Route path="/sync" element={<ProtectedRoute><SyncQueue /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}