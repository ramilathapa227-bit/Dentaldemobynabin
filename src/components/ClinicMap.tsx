import { useState, FormEvent } from 'react';
import { MapPin, Navigation, Map, Compass, PhoneCall, Check, Clock, ShieldCheck } from 'lucide-react';

export default function ClinicMap() {
  const [activeTab, setActiveTab] = useState<'map' | 'transit' | 'parking'>('map');
  const [startLocation, setStartLocation] = useState('');
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const calculateRoute = (e: FormEvent) => {
    e.preventDefault();
    if (!startLocation.trim()) return;
    setLoadingRoute(true);
    setTimeout(() => {
      setRouteDuration('12 mins (via Central Ave Express) — 3.1 miles');
      setLoadingRoute(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
      {/* Left side: Interactive Map Visuals */}
      <div className="lg:col-span-7 bg-[#F1F5F9] min-h-[350px] relative flex items-center justify-center overflow-hidden">
        {/* Simple stylized SVG City Grid Layout replicating a dynamic maps interface */}
        <div className="absolute inset-0 bg-[#E2E8F0] bg-opacity-40">
          <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#CBD5E1" strokeWidth="2" />
                <circle cx="50" cy="50" r="1.5" fill="#94A3B8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Styled roads & rivers */}
            <path d="M-10 150 Q 200 120 600 200 T 1200 100" fill="none" stroke="#FFFFFF" strokeWidth="24" strokeLinecap="round" />
            <path d="M300 -50 L 350 500" fill="none" stroke="#FFFFFF" strokeWidth="28" />
            <path d="M-50 320 H 1200" fill="none" stroke="#FFFFFF" strokeWidth="20" />
            
            {/* Waterbody accent */}
            <path d="M-100 -50 Q 150 180 50 500" fill="none" stroke="#93C5FD" strokeWidth="30" strokeLinecap="round" className="opacity-40" />
          </svg>
        </div>

        {/* Dynamic Location Marks */}
        <div className="absolute top-1/3 left-1/3 text-center pointer-events-none">
          <div className="bg-white px-2.5 py-1 rounded-md text-[10px] font-bold text-[#64748B] shadow-sm tracking-wider uppercase border border-slate-200">
            North Plaza
          </div>
        </div>

        <div className="absolute bottom-1/4 right-1/4 text-center pointer-events-none">
          <div className="bg-white px-2.5 py-1 rounded-md text-[10px] font-bold text-[#64748B] shadow-sm tracking-wider uppercase border border-slate-200">
            Metro Station
          </div>
        </div>

        {/* Clinic Landmark Core Node */}
        <div className="absolute top-[48%] left-[48%] z-10 flex flex-col items-center">
          {/* Subtle pulse animation circles */}
          <span className="absolute inline-flex h-16 w-16 rounded-full bg-blue-400 opacity-25 animate-ping"></span>
          <span className="absolute inline-flex h-24 w-24 rounded-full bg-blue-300 opacity-10 animate-pulse"></span>
          
          <div className="bg-[#2563EB] text-white p-3.5 rounded-full shadow-2xl relative border-4 border-white transition-transform hover:scale-110 duration-300">
            <MapPin className="w-6 h-6 animate-bounce" />
          </div>
          
          <div className="mt-2 bg-[#0F172A] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <span>DentalDemoByNabin</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          </div>
        </div>

        {/* Transit & Parking Overlays depending on activeTab */}
        {activeTab === 'transit' && (
          <div className="absolute inset-0 bg-[#2563EB]/5 pointer-events-none z-20 flex flex-col justify-between p-4">
            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-sm">
              <p className="text-xs font-bold text-[#0F172A] mb-1">🚇 Nearest Express Transit Stoppages:</p>
              <ul className="text-[11px] text-[#64748B] space-y-1">
                <li>• Metro Square Boulevard (Line 4) — 2 mins walk</li>
                <li>• Bus Route 42 & 54 Stop (Main Front Gate) — 1 min walk</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'parking' && (
          <div className="absolute inset-0 bg-[#10B981]/5 pointer-events-none z-20 flex flex-col justify-end p-4">
            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-sm">
              <p className="text-xs font-bold text-[#0F172A] mb-1">🚗 Patient Parking Information:</p>
              <ul className="text-[11px] text-[#64748B] space-y-1 font-medium">
                <li className="text-[#10B981]">• ✓ Free Reserved Ground Gates Parking for dental patients</li>
                <li>• Undercovered Structure B (Validate ticket at dental front desk)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Embedded Compass Badge */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow z-20">
          <Compass className="w-4 h-4 text-[#2563EB] animate-spin-slow" />
          <span className="text-[10px] font-bold text-[#0F172A] tracking-wider uppercase">Level Ground Reception</span>
        </div>
      </div>

      {/* Right side: Directions & Navigational details */}
      <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white border-l border-[#E2E8F0] space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-xl font-bold font-display text-[#0F172A]">Clinic Location</h4>
            <p className="text-sm text-[#64748B]">Professional Medical Building, Ground Floor Suite 104</p>
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                activeTab === 'map' ? 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]' : 'bg-[#F8FAFC] text-[#64748B] border border-transparent hover:border-[#E2E8F0]'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setActiveTab('transit')}
              className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                activeTab === 'transit' ? 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]' : 'bg-[#F8FAFC] text-[#64748B] border border-transparent hover:border-[#E2E8F0]'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Public Transit</span>
            </button>
            <button
              onClick={() => setActiveTab('parking')}
              className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                activeTab === 'parking' ? 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]' : 'bg-[#F8FAFC] text-[#64748B] border border-transparent hover:border-[#E2E8F0]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Parking</span>
            </button>
          </div>

          <div className="space-y-2 text-sm text-[#0F172A]">
            <p className="font-semibold text-xs uppercase tracking-wider text-[#64748B]">Clinic Address</p>
            <p className="font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
              <MapPin className="w-4.5 h-4.5 text-[#2563EB] shrink-0 mt-0.5" />
              <span>452 Medical Center Parkway, Suite 104, Blue Hills Metro, NY 10022</span>
            </p>
          </div>

          {/* Navigational Calculator */}
          <form onSubmit={calculateRoute} className="space-y-3 pt-2">
            <p className="font-semibold text-xs uppercase tracking-wider text-[#64748B]">Calculate Transit Duration</p>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter your current street name..."
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="grow px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              <button
                type="submit"
                disabled={loadingRoute}
                className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loadingRoute ? 'Routing...' : 'Find Route'}
              </button>
            </div>
            {routeDuration && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 shrink-0 text-[#10B981]" />
                <span className="font-medium">{routeDuration}</span>
              </div>
            )}
          </form>
        </div>

        {/* Quick Contacts */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#64748B]" />
            <span className="text-[11px] text-[#64748B]">Mon - Sat: 9:00 - 19:00</span>
          </div>
          <a
            href="tel:+15550199222"
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            +1 (555) 019-9222
          </a>
        </div>
      </div>
    </div>
  );
}
