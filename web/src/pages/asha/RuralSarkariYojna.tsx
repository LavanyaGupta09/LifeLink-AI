import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, HelpCircle } from 'lucide-react';

const RuralSarkariYojna: React.FC = () => {
  const navigate = useNavigate();

  const schemes = [
    {
      title: "Ayushman Bharat PM-JAY",
      benefit: "₹5 Lakh tak ka muft ilaaj",
      eligibility: "BPL parivaar, kachha ghar wale, etc.",
      docs: ["Aadhar Card", "Ration Card", "Mobile Number"]
    },
    {
      title: "Janani Suraksha Yojana",
      benefit: "Delivery ke liye ₹1400 ki madad",
      eligibility: "BPL auraten jo sarkari hospital me delivery karwayen",
      docs: ["Aadhar Card", "Bank Passbook", "Mamta Card"]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col items-center pb-24">
      <div className="w-full max-w-md p-4 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-card rounded-full text-textSecondary">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-textPrimary">Sarkari Yojna</h1>
        </div>

        <p className="text-textSecondary text-sm">Sarkari swasthya yojna ke baare me janiye.</p>

        {/* Schemes List */}
        <div className="flex flex-col gap-4">
          {schemes.map((s, i) => (
            <div key={i} className="bg-card border border-indigo-500/30 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-indigo-400" />
                </div>
                <h2 className="text-base font-bold text-textPrimary">{s.title}</h2>
              </div>
              
              <div className="bg-background rounded-lg p-3 text-xs border border-border flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-400">Kya milega?</span>
                  <p className="text-textSecondary mt-1">{s.benefit}</p>
                </div>
              </div>

              <div className="bg-background rounded-lg p-3 text-xs border border-border flex items-start gap-2">
                <HelpCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-amber-400">Kaun le sakta hai? (Eligibility)</span>
                  <p className="text-textSecondary mt-1">{s.eligibility}</p>
                </div>
              </div>

              <div className="bg-background rounded-lg p-3 text-xs border border-border">
                <span className="font-bold text-textSecondary flex items-center gap-1 mb-1">Kaunse kagaz chahiye? (Documents)</span>
                <ul className="list-disc pl-4 text-textSecondary mt-1 space-y-1">
                  {s.docs.map((doc, idx) => <li key={idx}>{doc}</li>)}
                </ul>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RuralSarkariYojna;
