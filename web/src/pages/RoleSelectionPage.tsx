import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Stethoscope, Ambulance, Building2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { superAdminLogin } = useAuthStore();

  return (
    <div className="role-selection-wrapper">
      <div className="flex flex-col items-center justify-center pt-10 pb-8 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)'}}>
          <HeartPulse size={36} color="#EF4444" />
        </div>
        <h1 className="text-3xl font-black mb-2 role-title">Welcome to LifeLink AI</h1>
        <p className="text-lg role-subtitle">Who are you?</p>
      </div>

      <div className="flex-1 flex flex-col gap-5 max-w-lg mx-auto w-full">
        {/* Patient / Family Card (SENIOR FRIENDLY, OVERSIZED) */}
        <button 
          onClick={() => navigate('/login')}
          className="role-card patient-card"
        >
          <div className="role-card-icon">
            <HeartPulse size={36} />
          </div>
          <div>
            <h2 className="text-2xl role-name">Patient / Family</h2>
            <p className="role-desc">I need emergency help or want to manage family health.</p>
          </div>
        </button>

        {/* Doctor Card */}
        <button 
          onClick={() => navigate('/b2b/auth?role=doctor')}
          className="role-card doctor-card"
        >
          <div className="role-card-icon">
            <Stethoscope size={28} />
          </div>
          <div>
            <h2 className="text-xl role-name">Doctor</h2>
            <p className="role-desc">I am an on-call or primary care physician.</p>
          </div>
        </button>

        {/* Ambulance Driver Card */}
        <button 
          onClick={() => navigate('/b2b/auth?role=driver')}
          className="role-card driver-card"
        >
          <div className="role-card-icon">
            <Ambulance size={28} />
          </div>
          <div>
            <h2 className="text-xl role-name">Ambulance Driver</h2>
            <p className="role-desc">I am responding to an emergency dispatch.</p>
          </div>
        </button>

        {/* Enterprise Card */}
        <button 
          onClick={() => navigate('/b2b/auth?role=hospital_admin')}
          className="role-card enterprise-card"
        >
          <div className="role-card-icon">
            <Building2 size={28} />
          </div>
          <div>
            <h2 className="text-xl role-name">Hospital / Pharmacy / Lab</h2>
            <p className="role-desc">I am managing facility resources and orders.</p>
          </div>
        </button>
      </div>
      
      <div className="mt-8 pb-4 text-center">
        <button 
          onClick={() => navigate('/admin/login')}
          className="text-slate-500 text-sm hover:text-white transition-colors"
        >
          System Administrator
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
