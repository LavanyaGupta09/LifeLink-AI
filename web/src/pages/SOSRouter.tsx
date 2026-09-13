import React from 'react';
import { useAshaStore } from '../store/ashaStore';
import SOSPage from './SOSPage';
import RuralSOSPage from './asha/RuralSOSPage';

const SOSRouter: React.FC = () => {
  const { areaType } = useAshaStore();
  
  if (areaType === 'rural') {
    return <RuralSOSPage />;
  }
  
  return <SOSPage />;
};

export default SOSRouter;
