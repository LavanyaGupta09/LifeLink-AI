import React from 'react';
import { usePowerButtonSOS } from '../hooks/usePowerButtonSOS';

/**
 * Invisible component that globally listens for the triple-power-button
 * SOS trigger. Mount this inside BrowserRouter so it has access to
 * useNavigate().
 */
const PowerButtonSOSListener: React.FC = () => {
  usePowerButtonSOS();
  return null;
};

export default PowerButtonSOSListener;
