import React from 'react';
import { useAshaStore } from '../store/ashaStore';
import Dashboard from './Dashboard';
import RuralDashboard from './asha/RuralDashboard';

const DashboardRouter: React.FC = () => {
  const { areaType } = useAshaStore();
  
  if (areaType === 'rural') {
    return <RuralDashboard />;
  }
  
  return <Dashboard />;
};

export default DashboardRouter;
