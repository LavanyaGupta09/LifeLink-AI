import React from 'react';
import { useAshaStore } from '../store/ashaStore';
import ProfilePage from './ProfilePage';
import RuralProfilePage from './asha/RuralProfilePage';

const ProfileRouter: React.FC = () => {
  const { areaType } = useAshaStore();
  
  if (areaType === 'rural') {
    return <RuralProfilePage />;
  }
  
  return <ProfilePage />;
};

export default ProfileRouter;
