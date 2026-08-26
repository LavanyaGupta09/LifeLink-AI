import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface JitsiVideoCallProps {
  roomName: string;
  displayName?: string;
  onReadyToClose: () => void;
  height?: string;
}

const JitsiVideoCall: React.FC<JitsiVideoCallProps> = ({
  roomName,
  displayName = 'Patient',
  onReadyToClose,
  height = '100%'
}) => {
  return (
    <div style={{ height, width: '100%', background: '#000' }} className="jitsi-container relative rounded-2xl overflow-hidden shadow-2xl">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
          enableEmailInStats: false,
          prejoinPageEnabled: false, // Skip prejoin page for faster emergency connection
          p2p: {
            enabled: true,
            stunServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' }
            ]
          }
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
        }}
        userInfo={{
          displayName
        }}
        onApiReady={(externalApi) => {
          // Listeners can be added here
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = height;
          iframeRef.style.width = '100%';
          iframeRef.style.border = 'none';
        }}
        onReadyToClose={onReadyToClose}
      />
    </div>
  );
};

export default JitsiVideoCall;
