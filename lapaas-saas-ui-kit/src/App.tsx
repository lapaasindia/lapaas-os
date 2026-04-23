import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FounderOSMaster from './pages/FounderOSMaster';
import TaskDetailPageV2 from './pages/TaskDetailPageV2';
import MeetingDetailEnhanced from './pages/MeetingDetailEnhanced';
import DailyCommitmentDetailPageV2 from './pages/DailyCommitmentDetailPageV2';
import RequestDetailPage from './pages/RequestDetailPage';
import InterruptionFirewall from './pages/InterruptionFirewall';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminConsoleComplete from './pages/AdminConsoleComplete';
import UserProfile from './pages/UserProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserProvider } from './contexts/UserContext';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import { syncManager } from './services/syncManager';
import './styles/index.css';

export default function App() {
  // Initialize sync manager for offline support
  useEffect(() => {
    syncManager.startAutoSync(30000); // Sync every 30 seconds
    syncManager.cacheDataForOffline(); // Cache initial data
    
    return () => {
      syncManager.stopAutoSync();
    };
  }, []);

  return (
    <UserProvider>
      <OfflineIndicator />
      <PWAInstallPrompt />
      <Router>
        <Routes>
        <Route path="/" element={<Navigate to="/founder-os" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/founder-os"
          element={
            <ProtectedRoute>
              <FounderOSMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task/:taskId"
          element={
            <ProtectedRoute>
              <TaskDetailPageV2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting/:meetingId"
          element={
            <ProtectedRoute>
              <MeetingDetailEnhanced />
            </ProtectedRoute>
          }
        />
        <Route
          path="/commitment/:commitmentId"
          element={
            <ProtectedRoute>
              <DailyCommitmentDetailPageV2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request/:requestId"
          element={
            <ProtectedRoute>
              <RequestDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interruption-firewall"
          element={
            <ProtectedRoute>
              <InterruptionFirewall />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminConsoleComplete />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/founder-os" replace />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}
