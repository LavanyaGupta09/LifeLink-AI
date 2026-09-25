import React, { useState } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  useRTCClient,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  useJoin,
  usePublish,
  useRemoteUsers,
  LocalVideoTrack,
  RemoteUser,
} from 'agora-rtc-react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users } from 'lucide-react';

interface AgoraVideoCallProps {
  channelName: string;
  token: string | null;
  appId: string;
  onReadyToClose: () => void;
  height?: string;
}

const CallUI: React.FC<{ channelName: string; token: string | null; appId: string; onReadyToClose: () => void }> = ({ channelName, token, appId, onReadyToClose }) => {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // Get local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);

  // Join channel
  useJoin({
    appid: appId,
    channel: channelName,
    token: token,
  });

  // Publish tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Remote users
  const remoteUsers = useRemoteUsers();

  const handleEndCall = () => {
    onReadyToClose();
  };

  return (
    <div className="relative w-full h-full bg-background rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col border border-border">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
          <span className="text-textPrimary font-bold text-sm tracking-wide">Secure Consultation</span>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border backdrop-blur px-3 py-1.5 rounded-full text-textPrimary text-xs font-bold">
          <Users size={14} className="text-emerald-400" />
          {remoteUsers.length + 1} Participant{remoteUsers.length + 1 !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {remoteUsers.length === 0 ? (
          <div className="text-center z-0 relative">
            <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full"></div>
            <div className="w-24 h-24 mx-auto rounded-full bg-card border border-border flex items-center justify-center mb-6 relative shadow-2xl">
              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping"></div>
              <Users size={36} className="text-textSecondary" />
            </div>
            <p className="text-textPrimary font-bold text-xl mb-2 tracking-tight">Waiting for others...</p>
            <p className="text-textTertiary text-sm font-medium">They will join here shortly.</p>
          </div>
        ) : (
          <div className="w-full h-full grid gap-2 p-2" style={{ gridTemplateColumns: remoteUsers.length > 1 ? 'repeat(2, 1fr)' : '1fr' }}>
            {remoteUsers.map((user) => (
              <div key={user.uid} className="w-full h-full bg-background rounded-xl overflow-hidden relative border border-border shadow-lg">
                <RemoteUser user={user} className="w-full h-full" cover="black" />
                <div className="absolute bottom-3 left-3 bg-card backdrop-blur px-2.5 py-1 rounded text-emerald-400 text-xs font-bold border border-border">
                  Remote User
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Local Video Picture-in-Picture */}
        <div className="absolute bottom-24 right-4 w-32 h-48 bg-background rounded-2xl overflow-hidden border-2 border-border shadow-2xl z-20">
          {cameraOn ? (
            <LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-card">
              <VideoOff size={28} className="text-textTertiary mb-2" />
              <span className="text-[10px] text-textTertiary font-bold uppercase tracking-wider">Camera Off</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-textPrimary text-[10px] font-bold">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#060B14] via-[#060B14]/80 to-transparent z-10 flex justify-center gap-6">
        <button 
          onClick={() => setMicOn(!micOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-card border border-border hover:bg-surface text-textPrimary shadow-lg' : 'bg-rose-500/20 border border-rose-500/50 hover:bg-rose-500/30 text-rose-500'}`}
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>
        <button 
          onClick={() => setCameraOn(!cameraOn)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${cameraOn ? 'bg-card border border-border hover:bg-surface text-textPrimary shadow-lg' : 'bg-rose-500/20 border border-rose-500/50 hover:bg-rose-500/30 text-rose-500'}`}
        >
          {cameraOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>
        <button 
          onClick={handleEndCall}
          className="w-20 h-14 rounded-[20px] flex items-center justify-center bg-rose-600 hover:bg-rose-500 transition-all text-textPrimary shadow-[0_0_20px_rgba(225,29,72,0.4)] border border-rose-500/50"
        >
          <PhoneOff size={26} />
        </button>
      </div>
    </div>
  );
};

const AgoraVideoCall: React.FC<AgoraVideoCallProps> = ({ channelName, token, appId, onReadyToClose, height = '100%' }) => {
  const client = useRTCClient(AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' }));

  return (
    <div style={{ height, width: '100%' }}>
      <AgoraRTCProvider client={client}>
        <CallUI 
          channelName={channelName} 
          token={token} 
          appId={appId} 
          onReadyToClose={onReadyToClose} 
        />
      </AgoraRTCProvider>
    </div>
  );
};

export default AgoraVideoCall;
