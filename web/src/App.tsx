import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import RoleSelectionPage from './pages/RoleSelectionPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import SOSPage from './pages/SOSPage';
import AmbulancePage from './pages/AmbulancePage';
import DoctorPage from './pages/DoctorPage';
import FamilyDashboard from './pages/FamilyDashboard';
import HealthPassport from './pages/HealthPassport';
import MedicalVault from './pages/MedicalVault';
import BloodNetwork from './pages/BloodNetwork';
import PharmacyPage from './pages/PharmacyPage';
import LabPage from './pages/LabPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import HospitalPage from './pages/HospitalPage';
import HealthAuditPage from './pages/HealthAuditPage';
import VendorPortalPage from './pages/VendorPortalPage';
import PrivacyConsentPage from './pages/PrivacyConsentPage';
import OfflineGuidePage from './pages/OfflineGuidePage';
import MedicineRemindersPage from './pages/MedicineRemindersPage';
import AdminComplianceDashboard from './pages/AdminComplianceDashboard';
import AdminLogin from './pages/AdminLogin';
import B2BLandingPage from './pages/B2BLandingPage';
import B2BHospitalDashboard from './pages/B2BHospitalDashboard';
import B2BPharmacyDashboard from './pages/B2BPharmacyDashboard';
import B2BAuth from './pages/B2BAuth';
import B2BDoctorWorkspace from './pages/B2BDoctorWorkspace';
import B2BLabDashboard from './pages/B2BLabDashboard';
import B2BDriverApp from './pages/B2BDriverApp';
import PendingReviewPage from './pages/PendingReviewPage';
import NavBar from './components/NavBar';
import ReminderOverlay from './components/ReminderOverlay';
import AuthGuard from './components/AuthGuard';
import { useAuthStore } from './store/authStore';
import { useNavigate } from 'react-router-dom';

const LogoutRoute: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/role-select', { replace: true });
    };
    performLogout();
  }, [logout, navigate]);
  
  return null;
};

const App: React.FC = () => {
  const { user } = useAuthStore();

  React.useEffect(() => {
    if (user?.easyModeEnabled) {
      document.documentElement.classList.add('easy-mode');
    } else {
      document.documentElement.classList.remove('easy-mode');
    }
  }, [user?.easyModeEnabled]);
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/role-select" element={<RoleSelectionPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/symptoms" element={<AuthGuard><SymptomCheckerPage /></AuthGuard>} />
          <Route path="/sos" element={<AuthGuard><SOSPage /></AuthGuard>} />
          <Route path="/ambulance" element={<AuthGuard><AmbulancePage /></AuthGuard>} />
          <Route path="/doctor" element={<AuthGuard><DoctorPage /></AuthGuard>} />
          <Route path="/family" element={<AuthGuard><FamilyDashboard /></AuthGuard>} />
          <Route path="/passport" element={<AuthGuard><HealthPassport /></AuthGuard>} />
          <Route path="/vault" element={<AuthGuard><MedicalVault /></AuthGuard>} />
          <Route path="/reminders" element={<AuthGuard><MedicineRemindersPage /></AuthGuard>} />
          <Route path="/blood" element={<AuthGuard><BloodNetwork /></AuthGuard>} />
          <Route path="/pharmacy" element={<AuthGuard><PharmacyPage /></AuthGuard>} />
          <Route path="/lab" element={<AuthGuard><LabPage /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
          
          {/* B2B Enterprise Routes */}
          <Route path="/b2b" element={<B2BLandingPage />} />
          <Route path="/b2b/auth" element={<B2BAuth />} />
          <Route path="/b2b/pending-review" element={<PendingReviewPage />} />
          <Route path="/b2b/hospital" element={<AuthGuard><B2BHospitalDashboard /></AuthGuard>} />
          <Route path="/b2b/pharmacy" element={<AuthGuard><B2BPharmacyDashboard /></AuthGuard>} />
          <Route path="/b2b/doctor" element={<AuthGuard><B2BDoctorWorkspace /></AuthGuard>} />
          <Route path="/b2b/lab" element={<AuthGuard><B2BLabDashboard /></AuthGuard>} />
          <Route path="/b2b/driver" element={<AuthGuard><B2BDriverApp /></AuthGuard>} />

          <Route path="/hospitals" element={<AuthGuard><HospitalPage /></AuthGuard>} />
          <Route path="/audit" element={<AuthGuard><HealthAuditPage /></AuthGuard>} />
          <Route path="/vendor" element={<VendorPortalPage />} />
          <Route path="/privacy" element={<PrivacyConsentPage />} />
          <Route path="/offline-guide" element={<OfflineGuidePage />} />
          <Route path="/logout" element={<LogoutRoute />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/compliance" element={<AuthGuard><AdminComplianceDashboard /></AuthGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <NavBar />
        <ReminderOverlay />
      </div>
    </BrowserRouter>
  );
};

export default App;
