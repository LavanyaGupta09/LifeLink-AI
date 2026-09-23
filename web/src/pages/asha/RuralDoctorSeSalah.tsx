import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PhoneCall, Video, MessageSquare } from 'lucide-react';

const RuralDoctorSeSalah: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col items-center">
      <div className="w-full max-w-md p-4 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-card rounded-full text-textSecondary">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-textPrimary">Doctor Se Salah</h1>
        </div>

        <p className="text-textSecondary text-sm">Aap doctor se kaise baat karna chahte hain?</p>

        {/* Options */}
        <div className="flex flex-col gap-4">
          <button className="bg-card border border-[#3D91FF]/30 rounded-2xl p-5 flex flex-col items-center gap-4 active:scale-95 transition-transform hover:border-[#3D91FF]">
            <div className="w-16 h-16 bg-[#3D91FF]/10 rounded-full flex items-center justify-center">
              <PhoneCall size={32} className="text-[#3D91FF]" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold">Call Karein</h2>
              <p className="text-xs text-textSecondary mt-1">Doctor se sidhe phone par baat karein</p>
            </div>
          </button>

          <button className="bg-card border border-[#8B5CF6]/30 rounded-2xl p-5 flex flex-col items-center gap-4 active:scale-95 transition-transform hover:border-[#8B5CF6]">
            <div className="w-16 h-16 bg-accent-purple rounded-full flex items-center justify-center">
              <Video size={32} className="text-[#8B5CF6]" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold">Video Call</h2>
              <p className="text-xs text-textSecondary mt-1">Doctor ko dekh kar baat karein</p>
            </div>
          </button>

          <button className="bg-card border border-[#00C9A7]/30 rounded-2xl p-5 flex flex-col items-center gap-4 active:scale-95 transition-transform hover:border-[#00C9A7]">
            <div className="w-16 h-16 bg-[#00C9A7]/10 rounded-full flex items-center justify-center">
              <MessageSquare size={32} className="text-[#00C9A7]" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold">Sawal Poochhein</h2>
              <p className="text-xs text-textSecondary mt-1">Apni bimari ke baare me likh kar poochhein</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default RuralDoctorSeSalah;
