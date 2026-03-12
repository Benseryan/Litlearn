import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { queryClientInstance } from '@/lib/query-client';
import { Toaster } from '@/components/ui/toaster';

import AuthPage      from '@/pages/AuthPage';
import LearningTree  from '@/pages/LearningTree';
import Lesson        from '@/pages/Lesson';
import Goals         from '@/pages/Goals';
import Friends       from '@/pages/Friends';
import Achievements  from '@/pages/Achievements';
import ProfilePage   from '@/pages/Profile';
import Admin         from '@/pages/Admin';

import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-olive animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-olive animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/LearningTree" replace /> : <AuthPage />} />
      <Route path="/" element={<Navigate to="/LearningTree" replace />} />
      <Route path="/LearningTree" element={<ProtectedRoute><LearningTree /></ProtectedRoute>} />
      <Route path="/Lesson"       element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
      <Route path="/Goals"        element={<ProtectedRoute><Goals /></ProtectedRoute>} />
      <Route path="/Friends"      element={<ProtectedRoute><Friends /></ProtectedRoute>} />
      <Route path="/Achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/Profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/Admin"        element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="*"             element={<Navigate to="/LearningTree" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
