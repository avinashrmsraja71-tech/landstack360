import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Search,
  Bell,
  Play,
  Layers,
  ChevronDown,
  Sparkles,
  Info,
  CheckCircle,
  X,
  ExternalLink,
  Navigation,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, Parcel } from '../../types/land';
import { landService } from '../../services/landService';

interface NavbarProps {
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, unreadCount }) => {
  const {
    role,
    setRole,
    demoMode,
    setDemoMode,
    findLandAroundMe,
    openLocationSurroundings,
    isLocating,
    gpsLocation,
    openParcel360,
    startInteractiveDemoTour,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Parcel[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = landService.searchParcels(searchQuery);
      setSearchResults(results.slice(0, 5));
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { id: UserRole; label: string; email: string; badge: string; desc: string }[] = [
    { id: 'citizen', label: 'Citizen', email: 'citizen@demo.com', badge: 'Public Access', desc: 'Search land, verify title, submit applications' },
    { id: 'officer', label: 'Revenue Officer', email: 'officer@demo.com', badge: 'State Authority', desc: 'Process applications & approve verifications' },
    { id: 'admin', label: 'System Admin', email: 'admin@demo.com', badge: 'Full Control', desc: 'Manage datasets, analytics & AI alerts' },
    { id: 'field_officer', label: 'Field Surveyor', email: 'field@demo.com', badge: 'Field Ops', desc: 'GPS ground truthing & encroachment reports' },
  ];

  const currentRoleObj = rolesList.find((r) => r.id === role) || rolesList[0];

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-xs text-slate-800">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 min-w-max">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-indigo-600 text-white shadow-xs">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-slate-800">
                LANDSTACK<span className="text-indigo-600">360</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded">
                DPI FOR LAND
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block leading-none mt-0.5">
              One Parcel. One Identity. Complete Land Intelligence.
            </p>
          </div>
        </div>

        {/* Center: Search & GPS Trigger */}
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <div className="relative flex items-center bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white border border-slate-200 rounded-lg transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ULPIN (e.g. 1001), Coimbatore, Survey No, Owner, or Village..."
              className="w-full pl-9 pr-28 py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={findLandAroundMe}
              disabled={isLocating}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
              title="Share my location and inspect cadastral details of the land I am standing on"
            >
              <MapPin className={`w-3 h-3 ${isLocating ? 'animate-bounce text-amber-500' : 'text-indigo-600'}`} />
              <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'GPS Around Me'}</span>
            </button>
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-2.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 flex justify-between items-center bg-slate-50 uppercase tracking-wider">
                <span>SIMULATED LAND REGISTRY RESULTS</span>
                <span className="text-slate-500 font-normal">{searchResults.length} parcels found</span>
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.parcelId}
                      onClick={() => {
                        openParcel360(p);
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-50 flex items-start justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-indigo-600">{p.parcelId}</span>
                          <span className="text-[11px] font-mono text-slate-500">{p.ulpin}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200 font-medium">
                            Sy: {p.surveyNumber}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{p.ownership.ownerName}</p>
                        <p className="text-[11px] text-slate-500">
                          {p.village}, {p.taluk}, {p.district} • {p.landUse} ({p.areaSqFt.toLocaleString()} sq.ft)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          p.risk.riskLevel === 'LOW'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : p.risk.riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          Risk: {p.risk.overallScore}/100
                        </span>
                        <div className="text-[10px] text-indigo-600 font-medium mt-1 flex items-center justify-end gap-0.5">
                          View 360° <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching parcel found. Try searching "Coimbatore", "Gandhipuram", "1001", "142/3A", or "Murugesan".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share My Location & Around Me Button */}
          <button
            onClick={openLocationSurroundings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded shadow-xs transition-all active:scale-95"
            title="Share my location and view cadastral parcel & neighborhood details around me"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">
              {gpsLocation ? `📍 ${gpsLocation.city || 'Coimbatore'}` : 'Share My Location'}
            </span>
            <span className="sm:hidden">GPS</span>
          </button>

          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">DPI Operational</span>
          </div>

          {/* Hackathon Presentation Demo Flow Button */}
          <button
            onClick={startInteractiveDemoTour}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow-xs transition-colors active:scale-95"
            title="Start step-by-step judge walkthrough"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">START DEMO</span>
          </button>

          {/* Demo Mode Toggle Badge */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded border font-semibold transition-colors ${
              demoMode
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle simulated prototype environment"
          >
            <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`} />
            <span>DEMO MODE</span>
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <div className="text-left hidden lg:block">
                <div className="text-[10px] text-slate-400 uppercase font-bold leading-none">Role</div>
                <div className="text-xs text-slate-800 font-bold mt-0.5">{currentRoleObj.label}</div>
              </div>
              <span className="lg:hidden text-xs text-slate-800 font-bold">{currentRoleObj.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  SWITCH DEMO ROLE
                </div>
                <div className="space-y-1 mt-1">
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setRole(r.id);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg flex items-start gap-2 text-xs transition-colors ${
                        role === r.id
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{r.label}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200 font-medium">
                            {r.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-indigo-600 font-mono mt-0.5">{r.email}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            title="System notifications & alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* GPS Status Banner if GPS was triggered */}
      {gpsLocation && (
        <div className="bg-indigo-50/90 border-t border-b border-indigo-100 px-4 py-1.5 text-xs text-indigo-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span className="font-bold">GPS Active:</span>
            <span className="font-mono text-slate-700">
              Lat: {gpsLocation.lat.toFixed(5)}, Lng: {gpsLocation.lng.toFixed(5)} (±{gpsLocation.accuracy}m)
            </span>
            <span className="hidden md:inline text-slate-500 text-[11px] border-l border-indigo-200 pl-2">
              {gpsLocation.statusText}
            </span>
          </div>
          <span className="text-[10px] bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold shadow-xs">
            Matched: TN-DEMO-1024
          </span>
        </div>
      )}
    </header>
  );
};
