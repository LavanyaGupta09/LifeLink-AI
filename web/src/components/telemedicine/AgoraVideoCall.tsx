import React, { useState, useEffect, useMemo } from 'react';
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
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, AlertCircle, Loader2 } from 'lucide-react';

interface AgoraVideoCallProps {
  channelName: string;
  token: string | null;
  appId: string;
  uid?: number;
  onReadyToClose: () => void;
  height?: string;
}

interface CallUIProps {
  channelName: string;
  token: string | null;
  appId: string;
  uid?: number;
  onReadyToClose: () => void;
}

const CallUI: React.FC<CallUIProps> = ({ channelName, token, appId, uid, onReadyToClose }) => {
  const client = useRTCClient();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  // Initialize local microphone and camera tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(true);
  const { localCameraTrack } = useLocalCameraTrack(true);

  // Manage mute/unmute of audio track dynamically
  useEffect(() => {
    if (localMicrophoneTrack) {
      localMicrophoneTrack.setEnabled(micOn).catch((err) => {
        console.warn("Failed to toggle microphone state:", err);
      });
    }
  }, [micOn, localMicrophoneTrack]);

  // Manage camera on/off state dynamically
  useEffect(() => {
    if (localCameraTrack) {
      localCameraTrack.setEnabled(cameraOn).catch((err) => {
        console.warn("Failed to toggle camera state:", err);
      });
    }
  }, [cameraOn, localCameraTrack]);

  // Join Agora RTC channel with App ID, channel name, token, and consistent numeric UID
  const { isConnected, isLoading: isJoining, error: joinError } = useJoin(
    {
      appid: appId,
      channel: channelName,
      token: token,
      uid: uid ?? null,
    },
    Boolean(appId && channelName)
  );

  useEffect(() => {
    if (joinError) {
      console.error("Agora RTC Join Error:", joinError);
    }
  }, [joinError]);

  // Publish local tracks once ready and connected
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Retrieve remote participants in the consultation channel
  const remoteUsers = useRemoteUsers();

  // Comprehensive cleanup when leaving
  const handleEndCall = async () => {
    if (isEnding) return;
    setIsEnding(true);

    try {
      if (localMicrophoneTrack) {
        localMicrophoneTrack.stop();
        localMicrophoneTrack.close();
      }
      if (localCameraTrack) {
        localCameraTrack.stop();
        localCameraTrack.close();
      }
      if (client) {
        await client.leave();
      }
    } catch (err) {
      console.error("Error during Agora cleanup on leave:", err);
    } finally {
      onReadyToClose();
    }
  };

  // Cleanup tracks on component unmount
  useEffect(() => {
    return () => {
      localMicrophoneTrack?.stop();
      localMicrophoneTrack?.close();
      localCameraTrack?.stop();
      localCameraTrack?.close();
    };
  }, [localMicrophoneTrack, localCameraTrack]);

  return (
    <div className="relative w-full h-full bg-background rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col border border-border">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-amber-500 animate-ping'}`}></div>
          <span className="text-textPrimary font-bold text-sm tracking-wide">
            {isConnected ? 'Secure Consultation Active' : isJoining ? 'Connecting to Room...' : 'Consultation Room'}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-card/90 border border-border backdrop-blur px-3 py-1.5 rounded-full text-textPrimary text-xs font-bold shadow-md">
          <Users size={14} className="text-emerald-400" />
          <span>{remoteUsers.length + 1} Participant{remoteUsers.length + 1 !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {joinError ? (
          <div className="text-center z-10 max-w-sm px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-500">
              <AlertCircle size={32} />
            </div>
            <p className="text-textPrimary font-bold text-lg mb-1">Failed to Connect</p>
            <p className="text-textSecondary text-xs leading-relaxed">{joinError.message || 'Agora RTC failed to join the video channel.'}</p>
          </div>
        ) : remoteUsers.length === 0 ? (
          <div className="text-center z-0 relative">
            <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full"></div>
            <div className="w-24 h-24 mx-auto rounded-full bg-card border border-border flex items-center justify-center mb-6 relative shadow-2xl">
              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping"></div>
              <Users size={36} className="text-textSecondary" />
            </div>
            <p className="text-textPrimary font-bold text-xl mb-2 tracking-tight">Waiting for other participant...</p>
            <p className="text-textTertiary text-sm font-medium">Channel: <span className="text-textPrimary font-mono">{channelName}</span></p>
          </div>
        ) : (
          <div className="w-full h-full grid gap-2 p-2" style={{ gridTemplateColumns: remoteUsers.length > 1 ? 'repeat(2, 1fr)' : '1fr' }}>
            {remoteUsers.map((user) => (
              <div key={user.uid} className="w-full h-full bg-background rounded-xl overflow-hidden relative border border-border shadow-lg">
                <RemoteUser user={user} className="w-full h-full" cover="black" playAudio={true} playVideo={true} />
                <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur px-2.5 py-1 rounded text-emerald-400 text-xs font-bold border border-border shadow">
                  Participant #{user.uid}
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
            You {uid ? `(#${uid})` : ''}
          </div>
        </div>
      </div>

      {/* Floating Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#060B14] via-[#060B14]/80 to-transparent z-10 flex justify-center gap-6">
        <button 
          onClick={() => setMicOn(!micOn)}
          title={micOn ? "Mute Microphone" : "Unmute Microphone"}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-card border border-border hover:bg-surface text-textPrimary shadow-lg' : 'bg-rose-500/20 border border-rose-500/50 hover:bg-rose-500/30 text-rose-500'}`}
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} />}
        </button>
        <button 
          onClick={() => setCameraOn(!cameraOn)}
          title={cameraOn ? "Turn Camera Off" : "Turn Camera On"}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${cameraOn ? 'bg-card border border-border hover:bg-surface text-textPrimary shadow-lg' : 'bg-rose-500/20 border border-rose-500/50 hover:bg-rose-500/30 text-rose-500'}`}
        >
          {cameraOn ? <Video size={22} /> : <VideoOff size={22} />}
        </button>
        <button 
          onClick={handleEndCall}
          disabled={isEnding}
          title="End Consultation"
          className="w-20 h-14 rounded-[20px] flex items-center justify-center bg-rose-600 hover:bg-rose-500 transition-all text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] border border-rose-500/50 disabled:opacity-50"
        >
          {isEnding ? <Loader2 size={24} className="animate-spin text-white" /> : <PhoneOff size={26} />}
        </button>
      </div>
    </div>
  );
};

const AgoraVideoCall: React.FC<AgoraVideoCallProps> = ({ channelName, token, appId, uid, onReadyToClose, height = '100%' }) => {
  // Create client instance once per component lifecycle
  const client = useMemo(() => AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' }), []);

  return (
    <div style={{ height, width: '100%' }}>
      <AgoraRTCProvider client={client}>
        <CallUI 
          channelName={channelName} 
          token={token} 
          appId={appId} 
          uid={uid}
          onReadyToClose={onReadyToClose} 
        />
      </AgoraRTCProvider>
    </div>
  );
};

export default AgoraVideoCall;
