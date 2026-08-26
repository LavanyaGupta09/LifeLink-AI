import React, { useState, useRef } from 'react';
import { X, Loader2, ScanFace } from 'lucide-react';

interface QRScannerModalProps {
  onClose: () => void;
  onScanSuccess: (patientData: any) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ onClose, onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use goQR.me API
      const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to reach QR scanning service.');
      }

      const result = await response.json();
      
      if (result && result.length > 0 && result[0].symbol && result[0].symbol.length > 0) {
        const symbol = result[0].symbol[0];
        
        if (symbol.error) {
          setError(symbol.error);
        } else if (symbol.data) {
          try {
            let parsedStr = symbol.data;
            // goqr API sometimes wraps the result in quotes and escapes inner quotes
            if (typeof parsedStr === 'string' && parsedStr.startsWith('"') && parsedStr.endsWith('"')) {
               parsedStr = parsedStr.slice(1, -1).replace(/\\"/g, '"');
            }
            let patientData = JSON.parse(parsedStr);
            // If it's STILL a string, parse it again
            if (typeof patientData === 'string') {
               patientData = JSON.parse(patientData);
            }
            onScanSuccess(patientData);
          } catch (e) {
            console.error("Failed to parse QR JSON:", e, symbol.data);
            // Fallback: manually extract name and token using regex
            const nameMatch = String(symbol.data).match(/"name"\s*:\s*"([^"]+)"/i);
            const tokenMatch = String(symbol.data).match(/"lifelink_token"\s*:\s*"([^"]+)"/i);
            
            if (nameMatch || tokenMatch) {
               onScanSuccess({
                 name: nameMatch ? nameMatch[1] : 'Unknown Patient',
                 lifelink_token: tokenMatch ? tokenMatch[1] : 'Unknown Token'
               });
            } else {
               // Ultimate fallback, just show the raw data as the token so it's visible on screen
               onScanSuccess({ name: 'Scanned Patient', lifelink_token: String(symbol.data).substring(0, 40) });
            }
          }
        } else {
          setError('No QR code found in the image.');
        }
      } else {
         setError('Invalid response from scanning service.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while scanning.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#131F35] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-[#0B1121]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ScanFace size={20} className="text-[#3D91FF]" />
            Scan Patient QR
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          {isScanning ? (
            <div className="flex flex-col items-center text-center">
              <Loader2 size={48} className="text-[#3D91FF] animate-spin mb-4" />
              <p className="text-white font-semibold text-lg">Analyzing Image...</p>
              <p className="text-slate-400 text-sm mt-2">Please hold on, sending to goQR API.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-48 h-48 border-2 border-dashed border-[#3D91FF]/50 rounded-2xl flex flex-col items-center justify-center bg-[#3D91FF]/5 hover:bg-[#3D91FF]/10 transition-colors cursor-pointer mb-6 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#3D91FF]/0 via-[#3D91FF]/10 to-[#3D91FF]/0 group-hover:translate-y-full transition-transform duration-1000"></div>
                <ScanFace size={48} className="text-[#3D91FF] mb-3" />
                <span className="text-white font-semibold text-sm">Tap to Scan</span>
                <span className="text-slate-400 text-xs mt-1">Camera or Gallery</span>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg text-center w-full">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Hidden input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            onChange={handleFileChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
