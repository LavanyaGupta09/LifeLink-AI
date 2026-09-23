import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, AlertTriangle, CarFront, ExternalLink, X, Loader2 } from 'lucide-react';
import { fetchNearbyFacilities } from '../lib/overpass';
import type { OverpassFacility } from '../lib/overpass';

export default function UberRideFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'DESTINATION' | 'CONFIRM' | 'LOADING'>('DESTINATION');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState<OverpassFacility[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState(false);
  
  const [selectedDestination, setSelectedDestination] = useState<OverpassFacility | null>(null);
  
  // Listen for global open event
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setStep('DESTINATION');
      getLocation();
    };
    window.addEventListener('openUberRideFlow', handleOpen);
    return () => window.removeEventListener('openUberRideFlow', handleOpen);
  }, []);

  const fetchForCoords = async (lat: number, lng: number) => {
    try {
      const hosp = await fetchNearbyFacilities(lat, lng, 'hospital', 5000);
      const clin = await fetchNearbyFacilities(lat, lng, 'clinic', 5000);
      setFacilities([...hosp, ...clin].slice(0, 10)); // keep it short
    } catch (e) {
      console.error("Failed to fetch facilities", e);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const getLocation = () => {
    setIsLoadingLocations(true);
    setLocationError(false);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
          fetchForCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error(err);
          setLocationError(true);
          // Fallback to New Delhi demo coordinates
          setUserLat(28.6139);
          setUserLng(77.2090);
          fetchForCoords(28.6139, 77.2090);
        }
      );
    } else {
      setLocationError(true);
      // Fallback to New Delhi demo coordinates
      setUserLat(28.6139);
      setUserLng(77.2090);
      fetchForCoords(28.6139, 77.2090);
    }
  };

  const handleSelectDestination = (facility: OverpassFacility) => {
    setSelectedDestination(facility);
    setStep('CONFIRM');
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For demo purposes, we will mock a search result if overpass isn't hooked to search
      handleSelectDestination({
        id: 'manual_' + Date.now(),
        name: searchQuery,
        lat: userLat ? userLat + 0.02 : 28.6139,
        lng: userLng ? userLng + 0.02 : 77.2090,
        address: 'Searched Destination',
        distanceKm: 3.5
      });
    }
  };

  const openUber = () => {
    if (!selectedDestination) return;
    
    const dropoff = encodeURIComponent(selectedDestination.name + (selectedDestination.address ? `, ${selectedDestination.address}` : ''));
    let url = `https://m.uber.com/ul/?action=setPickup&client_id=lifelink&pickup=my_location&dropoff[formatted_address]=${dropoff}`;
    
    if (userLat && userLng) {
      url += `&pickup[latitude]=${userLat}&pickup[longitude]=${userLng}`;
    }
    
    // Add destination coords if available
    url += `&dropoff[latitude]=${selectedDestination.lat}&dropoff[longitude]=${selectedDestination.lng}`;

    window.open(url, '_blank');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-textPrimary">
              <CarFront size={20} />
            </div>
            <div>
              <h3 className="font-bold text-textPrimary leading-tight">Uber</h3>
              <p className="text-xs text-textSecondary">Healthcare Transportation</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-textSecondary hover:text-textPrimary"
          >
            <X size={18} />
          </button>
        </div>

        {step === 'DESTINATION' && (
          <div className="flex flex-col flex-1 overflow-hidden p-5">
            <h4 className="text-lg font-bold text-textPrimary mb-4">Choose Destination</h4>
            
            <div className="flex items-center gap-3 mb-6 bg-card p-3 rounded-xl border border-border">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] text-textTertiary uppercase font-bold">Pickup</p>
                <p className="text-sm text-textPrimary font-medium">
                  {locationError ? 'Location Access Denied (Using Default)' : 'Current Location'}
                </p>
              </div>
            </div>

            <form onSubmit={handleManualSearch} className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textTertiary" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital, clinic, lab..." 
                className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-sm text-textPrimary focus:outline-none focus:border-[#3D91FF]"
              />
            </form>

            <h5 className="text-xs font-bold uppercase text-textTertiary mb-3">Nearby Facilities</h5>
            
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 scrollbar-hide">
              {isLoadingLocations ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-textSecondary">
                  <Loader2 size={24} className="animate-spin text-[#3D91FF]" />
                  <p className="text-sm">Finding nearby healthcare facilities...</p>
                </div>
              ) : facilities.length > 0 ? (
                facilities.map(facility => (
                  <div 
                    key={facility.id}
                    onClick={() => handleSelectDestination(facility)}
                    className="p-4 bg-card border border-border rounded-xl hover:border-[#3D91FF] cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-textPrimary font-bold group-hover:text-[#3D91FF] transition-colors line-clamp-1">{facility.name}</h4>
                      <p className="text-xs text-textSecondary mt-1 flex items-center gap-1">
                        <Navigation size={12} /> {facility.distanceKm ? `${facility.distanceKm} km` : 'Nearby'}
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-surface text-xs font-bold text-white group-hover:bg-[#3D91FF] transition-colors">
                      Select
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-textTertiary text-center py-4">No facilities found. Try searching.</p>
              )}
            </div>
          </div>
        )}

        {step === 'CONFIRM' && selectedDestination && (
          <div className="flex flex-col p-5">
            
            <div className="bg-card border border-border rounded-2xl p-4 mb-6 relative">
              <div className="absolute left-6 top-[34px] bottom-[34px] w-0.5 bg-surface z-0"></div>
              
              <div className="flex items-start gap-3 relative z-10 mb-6">
                <div className="w-4 h-4 mt-0.5 rounded-full bg-emerald-500 border-[3px] border-border shadow-[0_0_0_1px_rgba(16,185,129,0.3)] shrink-0"></div>
                <div>
                  <p className="text-[10px] text-textTertiary uppercase font-bold">Pickup</p>
                  <p className="text-sm text-textPrimary font-bold">Current Location</p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative z-10">
                <div className="w-4 h-4 mt-0.5 bg-[#3D91FF] border-[3px] border-border shadow-[0_0_0_1px_rgba(61,145,255,0.3)] shrink-0"></div>
                <div>
                  <p className="text-[10px] text-textTertiary uppercase font-bold">Destination</p>
                  <p className="text-sm text-textPrimary font-bold">{selectedDestination.name}</p>
                  <p className="text-xs text-textSecondary mt-0.5">
                    {selectedDestination.distanceKm ? `${selectedDestination.distanceKm} km away` : 'Hospital/Clinic'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-6 flex items-start gap-3">
              <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-200/80 leading-relaxed">
                Uber is not an emergency medical transport service. If this is a medical emergency, use emergency medical services (Ambulance).
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <button 
                onClick={openUber}
                className="w-full bg-white text-black py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                Continue with Uber <ExternalLink size={16} />
              </button>
              
              <button 
                onClick={() => setStep('DESTINATION')}
                className="w-full bg-card border border-border text-textSecondary py-3.5 rounded-xl font-bold text-sm hover:bg-surface transition-colors"
              >
                Change Destination
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
