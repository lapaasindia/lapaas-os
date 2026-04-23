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
import FinanceHome from './pages/FinanceHome';
import CashflowBoard from './pages/CashflowBoard';
import InvoicingModule from './pages/InvoicingModule';
import PayablesModule from './pages/PayablesModule';
import ReservesDebtModule from './pages/ReservesDebtModule';
import ControlsModule from './pages/ControlsModule';
import CollectionsAdmin from './pages/CollectionsAdmin';
import CollectionsActions from './pages/CollectionsActions';
import CollectionsCustomers from './pages/CollectionsCustomers';
import CollectionsInvoices from './pages/CollectionsInvoices';
import CollectionsReport from './pages/CollectionsReport';
import CollectionsUserDashboard from './pages/CollectionsUserDashboard';
import ComplianceManagement from './pages/ComplianceManagement';
import ComplianceModule from './pages/ComplianceModule';
import Calendar from './pages/Calendar';
import TeamManagement from './pages/TeamManagement';
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
          path="/finance"
          element={
            <ProtectedRoute>
              <FinanceHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/cashflow"
          element={
            <ProtectedRoute>
              <CashflowBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/invoicing"
          element={
            <ProtectedRoute>
              <InvoicingModule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/payables"
          element={
            <ProtectedRoute>
              <PayablesModule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/reserves"
          element={
            <ProtectedRoute>
              <ReservesDebtModule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance/controls"
          element={
            <ProtectedRoute>
              <ControlsModule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <CollectionsUserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/admin"
          element={
            <ProtectedRoute>
              <CollectionsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/actions"
          element={
            <ProtectedRoute>
              <CollectionsActions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/customers"
          element={
            <ProtectedRoute>
              <CollectionsCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/invoices"
          element={
            <ProtectedRoute>
              <CollectionsInvoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections/report"
          element={
            <ProtectedRoute>
              <CollectionsReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <ComplianceModule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance/management"
          element={
            <ProtectedRoute>
              <ComplianceManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <TeamManagement />
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
