import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import LiveTrackingPage from './pages/LiveTrackingPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import DashboardRouter from './pages/DashboardRouter';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import SOSRouter from './pages/SOSRouter';
import SOSTriggerPage from './pages/SOSTriggerPage';
import AmbulancePage from './pages/AmbulancePage';
import DoctorPage from './pages/DoctorPage';
import FamilyDashboard from './pages/FamilyDashboard';
import HealthPassport from './pages/HealthPassport';
import MedicalVault from './pages/MedicalVault';
import CommunityPage from './pages/CommunityPage';
import BloodNetwork from './pages/BloodNetwork';
import RuralDoctorSeSalah from './pages/asha/RuralDoctorSeSalah';
import RuralNajdeekHospital from './pages/asha/RuralNajdeekHospital';
import RuralSastiDawai from './pages/asha/RuralSastiDawai';
import RuralSarkariYojna from './pages/asha/RuralSarkariYojna';
import RuralFamilyHealth from './pages/asha/RuralFamilyHealth';
import PharmacyPage from './pages/PharmacyPage';
import LabPage from './pages/LabPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import PatientOnboarding from './pages/PatientOnboarding';
import HospitalPage from './pages/HospitalPage';
import HealthAuditPage from './pages/HealthAuditPage';
import VendorPortalPage from './pages/VendorPortalPage';
import PrivacyConsentPage from './pages/PrivacyConsentPage';
import OfflineGuidePage from './pages/OfflineGuidePage';
import MedicineRemindersPage from './pages/MedicineRemindersPage';
import InsuranceHub from './pages/InsuranceHub';
import InsuranceCompare from './pages/insurance/InsuranceCompare';
import PlanDetails from './pages/insurance/PlanDetails';
import SavedPlans from './pages/insurance/SavedPlans';
import MyInsurance from './pages/insurance/MyInsurance';
import InsuranceApplication from './pages/insurance/InsuranceApplication';
import GovSchemes from './pages/insurance/GovSchemes';
import PhysiotherapyHub from './pages/PhysiotherapyHub';
import PhysioHomeBooking from './pages/PhysioHomeBooking';
import PhysioOnline from './pages/PhysioOnline';
import PhysioDirectory from './pages/PhysioDirectory';
import RecoveryTracker from './pages/RecoveryTracker';
import AdminComplianceDashboard from './pages/AdminComplianceDashboard';
import AdminMasterDashboard from './pages/AdminMasterDashboard';
import AdminLogin from './pages/AdminLogin';
import B2BLandingPage from './pages/B2BLandingPage';
import B2BHospitalDashboard from './pages/B2BHospitalDashboard';
import B2BPharmacyDashboard from './pages/B2BPharmacyDashboard';
import B2BAuth from './pages/B2BAuth';
import B2BLabDashboard from './pages/B2BLabDashboard';
import B2BDriverApp from './pages/B2BDriverApp';
import PendingReviewPage from './pages/PendingReviewPage';
import ProfileRouter from './pages/ProfileRouter';
import EquipmentMarketplace from './pages/EquipmentMarketplace';
import B2BEquipmentDashboard from './pages/B2BEquipmentDashboard';
import HomeCareHub from './pages/HomeCareHub';
import UberRideFlow from './components/UberRideFlow';
import AreaSelectionPage from './pages/AreaSelectionPage';
import PhoneSimulatorPage from './pages/PhoneSimulatorPage';
import RuralOnboarding from './pages/asha/RuralOnboarding';

// ASHA Worker Module
import AshaPortal from './pages/asha/AshaPortal';
import AshaPatientTriage from './pages/asha/AshaPatientTriage';
import AshaGharJaanch from './pages/asha/AshaGharJaanch';
import AshaEmergencySOS from './pages/asha/AshaEmergencySOS';
import AshaMeriSoochna from './pages/asha/AshaMeriSoochna';
import AshaOfflineSupport from './pages/asha/AshaOfflineSupport';
import AshaVideoLibrary from './pages/asha/AshaVideoLibrary';
import AshaEmergencyAlert from './pages/asha/AshaEmergencyAlert';
import AshaProfile from './pages/asha/AshaProfile';

// Doctor Portal Refactor Components
import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorOnCall from './pages/doctor/DoctorOnCall';
import DoctorLiveConsultations from './pages/doctor/DoctorLiveConsultations';
import DoctorScheduled from './pages/doctor/DoctorScheduled';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorEarnings from './pages/doctor/DoctorEarnings';
import DoctorReviews from './pages/doctor/DoctorReviews';
import DoctorSettings from './pages/doctor/DoctorSettings';
import DoctorSupport from './pages/doctor/DoctorSupport';
import ConsultationRoom from './pages/doctor/ConsultationRoom';
import FirstResponderDashboard from './pages/FirstResponderDashboard';
import NavBar from './components/NavBar';
import ReminderOverlay from './components/ReminderOverlay';
import AlarmManager from './components/AlarmManager';
import AuthGuard from './components/AuthGuard';
import ScrollToTop from './components/ScrollToTop';
import PowerButtonSOSListener from './components/PowerButtonSOSListener';
import FloatingSOSTrigger from './components/FloatingSOSTrigger';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { useNavigate } from 'react-router-dom';

// Partner Portal Refactor Components
import PartnerLayout from './layouts/PartnerLayout';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import AppointmentsPage from './pages/partner/AppointmentsPage';
import PharmacyInventoryPage from './pages/partner/inventory/PharmacyInventoryPage';
import PatientsPage from './pages/partner/PatientsPage';
import BillingPage from './pages/partner/BillingPage';
import { 
  ServicesPage, StaffPage, 
  LabInventoryPage, EquipmentPage, AlertsPage,
  PaymentsPage, InsuranceClaimsPage, ReportsPage, 
  FacilityProfilePage, SettingsPage as PartnerSettingsPage
} from './pages/partner/Placeholders';

// Admin Portal Refactor Components
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProviders from './pages/admin/AdminProviders';
import AdminProviderVerification from './pages/admin/AdminProviderVerification';
import AdminUsers from './pages/admin/AdminUsers';
import {
  AdminActivity, AdminSecurity, AdminSystemHealth,
  AdminReports, AdminAnalytics, AdminNotifications,
  AdminProfile, AdminSettings
} from './pages/admin/AdminOperationalPages';


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

const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full h-[100dvh] overflow-y-auto overflow-x-hidden relative" style={{ backgroundColor: 'var(--bg-base)' }}>
    <div className="pt-[env(safe-area-inset-top)] pb-[120px] min-h-full">
      {children}
    </div>
    <NavBar />
    <ReminderOverlay />
    <AlarmManager />
    <UberRideFlow />
  </div>
);

const DesktopLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full h-[100dvh] overflow-y-auto overflow-x-hidden relative" style={{ backgroundColor: 'var(--bg-base)' }}>
    {children}
    <ReminderOverlay />
    <AlarmManager />
    <UberRideFlow />
  </div>
);

const App: React.FC = () => {
  const { user } = useAuthStore();
  // Initialize theme store — restores saved theme from localStorage on mount
  useThemeStore();

  React.useEffect(() => {
    // Ping backend to wake it up from sleep (Render free tier)
    fetch(`${import.meta.env.VITE_API_URL || 'https://lifelink-ai-rwru.onrender.com'}/health`).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (user?.easyModeEnabled) {
      document.documentElement.classList.add('easy-mode');
    } else {
      document.documentElement.classList.remove('easy-mode');
    }
  }, [user?.easyModeEnabled]);
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PowerButtonSOSListener />
      <FloatingSOSTrigger />
      <Routes>
        {/* Mobile / Patient Routes */}
        <Route path="/" element={<ResponsiveLayout><SplashScreen /></ResponsiveLayout>} />
        <Route path="/phone-simulator" element={<PhoneSimulatorPage />} />
        <Route path="/role-select" element={<ResponsiveLayout><RoleSelectionPage /></ResponsiveLayout>} />
        <Route path="/login" element={<ResponsiveLayout><AuthPage /></ResponsiveLayout>} />
        <Route path="/onboarding" element={<ResponsiveLayout><PatientOnboarding /></ResponsiveLayout>} />
        <Route path="/dashboard" element={<AuthGuard><ResponsiveLayout><DashboardRouter /></ResponsiveLayout></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><ResponsiveLayout><ProfileRouter /></ResponsiveLayout></AuthGuard>} />
        <Route path="/symptoms" element={<AuthGuard><ResponsiveLayout><SymptomCheckerPage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/community" element={<AuthGuard><ResponsiveLayout><CommunityPage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/sos" element={<AuthGuard><ResponsiveLayout><SOSRouter /></ResponsiveLayout></AuthGuard>} />
        <Route path="/sos-trigger" element={<SOSTriggerPage />} />
        <Route path="/ambulance" element={<AuthGuard><ResponsiveLayout><AmbulancePage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/doctor" element={<AuthGuard><ResponsiveLayout><DoctorPage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/family" element={<AuthGuard><ResponsiveLayout><FamilyDashboard /></ResponsiveLayout></AuthGuard>} />
        <Route path="/passport" element={<AuthGuard><ResponsiveLayout><HealthPassport /></ResponsiveLayout></AuthGuard>} />
        <Route path="/vault" element={<AuthGuard><ResponsiveLayout><MedicalVault /></ResponsiveLayout></AuthGuard>} />
        <Route path="/reminders" element={<AuthGuard><ResponsiveLayout><MedicineRemindersPage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/blood" element={<AuthGuard><ResponsiveLayout><BloodNetwork /></ResponsiveLayout></AuthGuard>} />
        <Route path="/pharmacy" element={<AuthGuard><ResponsiveLayout><PharmacyPage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/lab" element={<AuthGuard><ResponsiveLayout><LabPage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><ResponsiveLayout><SettingsPage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/hospitals" element={<AuthGuard><ResponsiveLayout><HospitalPage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/insurance" element={<AuthGuard><ResponsiveLayout><InsuranceHub /></ResponsiveLayout></AuthGuard>} />
        <Route path="/insurance/schemes" element={<AuthGuard><ResponsiveLayout><GovSchemes /></ResponsiveLayout></AuthGuard>} />
        <Route path="/insurance/compare" element={<AuthGuard><ResponsiveLayout><InsuranceCompare /></ResponsiveLayout></AuthGuard>} />
        <Route path="/insurance/plan/:id" element={<AuthGuard><ResponsiveLayout><PlanDetails /></ResponsiveLayout></AuthGuard>} />
        <Route path="/insurance/saved" element={<AuthGuard><ResponsiveLayout><SavedPlans /></ResponsiveLayout></AuthGuard>} />
        <Route path="/insurance/my-insurance" element={<AuthGuard><ResponsiveLayout><MyInsurance /></ResponsiveLayout></AuthGuard>} />
        <Route path="/insurance/apply/:id" element={<AuthGuard><ResponsiveLayout><InsuranceApplication /></ResponsiveLayout></AuthGuard>} />
        <Route path="/tracking/:serviceType" element={<AuthGuard><ResponsiveLayout><LiveTrackingPage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/audit" element={<AuthGuard><ResponsiveLayout><HealthAuditPage /></ResponsiveLayout></AuthGuard>} />
        {/* Physiotherapy & Home Care Module */}
        <Route path="/physiotherapy" element={<AuthGuard><ResponsiveLayout><PhysiotherapyHub /></ResponsiveLayout></AuthGuard>} />
        <Route path="/homecare" element={<AuthGuard><ResponsiveLayout><HomeCareHub /></ResponsiveLayout></AuthGuard>} />
        <Route path="/physiotherapy/home" element={<AuthGuard><ResponsiveLayout><PhysioHomeBooking /></ResponsiveLayout></AuthGuard>} />
        <Route path="/physiotherapy/online" element={<AuthGuard><ResponsiveLayout><PhysioOnline /></ResponsiveLayout></AuthGuard>} />
        <Route path="/physiotherapy/directory" element={<AuthGuard><ResponsiveLayout><PhysioDirectory /></ResponsiveLayout></AuthGuard>} />
        <Route path="/physiotherapy/recovery" element={<AuthGuard><ResponsiveLayout><RecoveryTracker /></ResponsiveLayout></AuthGuard>} />
        <Route path="/equipment" element={<AuthGuard><ResponsiveLayout><EquipmentMarketplace /></ResponsiveLayout></AuthGuard>} />

        {/* Area Selection (Pre-login, no AuthGuard) */}
        <Route path="/area-select" element={<ResponsiveLayout><AreaSelectionPage /></ResponsiveLayout>} />
        <Route path="/rural-onboarding" element={<RuralOnboarding />} />

        {/* ASHA Worker Module */}
        <Route path="/asha" element={<AuthGuard><ResponsiveLayout><AshaPortal /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/triage" element={<AuthGuard><ResponsiveLayout><AshaPatientTriage /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/ghar-jaanch" element={<AuthGuard><ResponsiveLayout><AshaGharJaanch /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/emergency" element={<AuthGuard><ResponsiveLayout><AshaEmergencySOS /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/soochna" element={<AuthGuard><ResponsiveLayout><AshaMeriSoochna /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/offline" element={<AuthGuard><ResponsiveLayout><AshaOfflineSupport /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/videos" element={<AuthGuard><ResponsiveLayout><AshaVideoLibrary /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/alert" element={<AuthGuard><ResponsiveLayout><AshaEmergencyAlert /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/profile" element={<AuthGuard><ResponsiveLayout><AshaProfile /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/doctor" element={<AuthGuard><ResponsiveLayout><RuralDoctorSeSalah /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/hospital" element={<AuthGuard><ResponsiveLayout><RuralNajdeekHospital /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/pharmacy" element={<AuthGuard><ResponsiveLayout><RuralSastiDawai /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/yojna" element={<AuthGuard><ResponsiveLayout><RuralSarkariYojna /></ResponsiveLayout></AuthGuard>} />
        <Route path="/asha/family" element={<AuthGuard><ResponsiveLayout><RuralFamilyHealth /></ResponsiveLayout></AuthGuard>} />

        <Route path="/vendor" element={<ResponsiveLayout><VendorPortalPage /></ResponsiveLayout>} />
        <Route path="/privacy" element={<ResponsiveLayout><PrivacyConsentPage /></ResponsiveLayout>} />
        <Route path="/offline-guide" element={<ResponsiveLayout><OfflineGuidePage /></ResponsiveLayout>} />
        <Route path="/admin/login" element={<ResponsiveLayout><AdminLogin /></ResponsiveLayout>} />
        
        {/* New System Admin Portal */}
        <Route element={<AuthGuard><AdminLayout /></AuthGuard>}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/providers/:id" element={<AdminProviderVerification />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
          <Route path="/admin/security" element={<AdminSecurity />} />
          <Route path="/admin/system-health" element={<AdminSystemHealth />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="/admin/compliance" element={<AuthGuard><ResponsiveLayout><AdminComplianceDashboard /></ResponsiveLayout></AuthGuard>} />
        {/* Redirect old routes */}
        <Route path="/admin/master" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        
        <Route path="/logout" element={<LogoutRoute />} />
        
        {/* Desktop / B2B Enterprise Routes (Full Width) */}
        <Route path="/b2b" element={<DesktopLayout><B2BLandingPage /></DesktopLayout>} />
        <Route path="/b2b/auth" element={<DesktopLayout><B2BAuth /></DesktopLayout>} />
        <Route path="/b2b/pending-review" element={<DesktopLayout><PendingReviewPage /></DesktopLayout>} />
        <Route path="/b2b/hospital" element={<AuthGuard><DesktopLayout><B2BHospitalDashboard /></DesktopLayout></AuthGuard>} />
        <Route path="/b2b/pharmacy" element={<AuthGuard><DesktopLayout><B2BPharmacyDashboard /></DesktopLayout></AuthGuard>} />
        <Route path="/b2b/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="/doctor-dashboard" element={<Navigate to="/doctor/dashboard" replace />} />
        
        {/* Multi-page Doctor Portal */}
        <Route element={<AuthGuard><DoctorLayout /></AuthGuard>}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/on-call" element={<DoctorOnCall />} />
          <Route path="/doctor/consultations" element={<DoctorLiveConsultations />} />
          <Route path="/doctor/scheduled" element={<DoctorScheduled />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
          <Route path="/doctor/medical-records" element={<DoctorMedicalRecords />} />
          <Route path="/doctor/earnings" element={<DoctorEarnings />} />
          <Route path="/doctor/reviews" element={<DoctorReviews />} />
          <Route path="/doctor/settings" element={<DoctorSettings />} />
          <Route path="/doctor/support" element={<DoctorSupport />} />
          <Route path="/doctor/consultation-room" element={<ConsultationRoom />} />
        </Route>
        <Route path="/b2b/lab" element={<AuthGuard><DesktopLayout><B2BLabDashboard /></DesktopLayout></AuthGuard>} />
        <Route path="/b2b/driver" element={<AuthGuard><DesktopLayout><B2BDriverApp /></DesktopLayout></AuthGuard>} />
        <Route path="/b2b/equipment" element={<AuthGuard><DesktopLayout><B2BEquipmentDashboard /></DesktopLayout></AuthGuard>} />

        {/* New Responsive Partner Portal */}
        <Route element={<AuthGuard><PartnerLayout /></AuthGuard>}>
          <Route path="/partner/dashboard" element={<PartnerDashboard />} />
          <Route path="/partner/appointments" element={<AppointmentsPage />} />
          <Route path="/partner/patients" element={<PatientsPage />} />
          <Route path="/partner/services" element={<ServicesPage />} />
          <Route path="/partner/staff" element={<StaffPage />} />
          <Route path="/partner/inventory/pharmacy" element={<PharmacyInventoryPage />} />
          <Route path="/partner/inventory/lab" element={<LabInventoryPage />} />
          <Route path="/partner/inventory/equipment" element={<EquipmentPage />} />
          <Route path="/partner/inventory/alerts" element={<AlertsPage />} />
          <Route path="/partner/billing" element={<BillingPage />} />
          <Route path="/partner/payments" element={<PaymentsPage />} />
          <Route path="/partner/insurance-claims" element={<InsuranceClaimsPage />} />
          <Route path="/partner/reports" element={<ReportsPage />} />
          <Route path="/partner/profile" element={<FacilityProfilePage />} />
          <Route path="/partner/settings" element={<PartnerSettingsPage />} />
        </Route>


        {/* First Responder Command Center (full-screen, no wrapper) */}
        <Route path="/command-center" element={<AuthGuard><FirstResponderDashboard /></AuthGuard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
