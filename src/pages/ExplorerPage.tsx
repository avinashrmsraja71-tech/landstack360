import React, { useState } from 'react';
import { GisMap } from '../components/map/GisMap';
import { useApp } from '../context/AppContext';
import { landService } from '../services/landService';
import { Parcel } from '../types/land';
import {
  MapPin,
  Eye,
  ShieldCheck,
  Building,
  Sparkles,
  Info,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Landmark,
  FileCheck
} from 'lucide-react';
import { CertifiedGovtDocumentModal } from '../components/parcel/CertifiedGovtDocumentModal';

export const ExplorerPage: React.FC = () => {
  const {
    selectedParcel,
    setSelectedParcel,
    openParcel360,
    openDueDiligence,
    openBuildChecker,
    openAiDetection,
    gpsLocation,
    findLandAroundMe,
    openLocationSurroundings,
    isLocating,
  } = useApp();

  const parcels = landService.getAllParcels();
  const [filterLandUse, setFilterLandUse] = useState<string>('ALL');
  const [showGovtDocModal, setShowGovtDocModal] = useState(false);

  const filteredParcels = parcels.filter((p) => {
    if (filterLandUse === 'ALL') return true;
    return p.landUse.toLowerCase() === filterLandUse.toLowerCase();
  });

  const showcaseParcels = [
    { id: 'TN-DEMO-1024', tag: 'Clean Title (Low Risk)', color: 'text-emerald-400' },
    { id: 'TN-DEMO-1025', tag: 'AI Violation (+600 sq.ft)', color: 'text-rose-400' },
    { id: 'TN-DEMO-1026', tag: 'Wetland (Agricultural)', color: 'text-amber-400' },
    { id: 'TN-DEMO-1027', tag: 'Govt Canal Poramboke', color: 'text-rose-400' },
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50">
      {/* Left / Main: GIS Map Canvas */}
      <div className="flex-1 relative h-[55vh] lg:h-full">
        <GisMap
          parcels={filteredParcels}
          selectedParcel={selectedParcel}
          onSelectParcel={(p) => setSelectedParcel(p)}
        />
      </div>

      {/* Right: Cadastral Land Intelligence Explorer Sidebar */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-[45vh] lg:h-full overflow-y-auto">
        {/* Sub-Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span>CADASTRAL INTELLIGENCE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                {filteredParcels.length} Parcels
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">Click anywhere on the map to inspect any nearby land</p>
          </div>

          <button
            onClick={openLocationSurroundings}
            disabled={isLocating}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
            title="Share my location and inspect details around me"
          >
            <MapPin className={`w-3 h-3 ${isLocating ? 'animate-bounce text-amber-300' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Share Location'}</span>
          </button>
        </div>

        {/* GPS "Land Around Me" Callout if Active (Section 6 Requirement) */}
        {gpsLocation && (
          <div className="p-3.5 m-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>GPS "Land Around Me" Active</span>
              </span>
              <span className="text-[10px] font-mono bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-bold">
                ±{gpsLocation.accuracy}m
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-600">
              Your Position: Lat {gpsLocation.lat.toFixed(5)}, Lng {gpsLocation.lng.toFixed(5)}
            </div>

            {selectedParcel && (
              <div className="pt-2 border-t border-indigo-200/60">
                <div className="text-[11px] text-indigo-700 font-bold">Detected Cadastral Land:</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono text-slate-900 font-bold">{selectedParcel.parcelId}</span>
                  <span className="text-[10px] font-mono text-slate-500">{selectedParcel.ulpin}</span>
                </div>
              </div>
            )}

            {/* MANDATORY EXPLANATION CALLOUT FROM SECTION 6 */}
            <div className="p-2 bg-white rounded border border-indigo-200 text-[10px] text-slate-600 leading-tight">
              <strong>Spatial Binding Principle:</strong> GPS identifies the user's geographic position. Parcel information is retrieved by matching that position with the parcel GIS layer.
            </div>

            <button
              onClick={openLocationSurroundings}
              className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>Inspect Details & Parcels Around Me</span>
            </button>
          </div>
        )}

        {/* Filter Chips */}
        <div className="px-3 pt-3 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          {['ALL', 'Residential', 'Commercial', 'Agricultural', 'Government / Protected'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterLandUse(type)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterLandUse === type
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Quick Showcase Jumpers */}
        <div className="p-3 border-b border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Demo Showcase Parcels:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {showcaseParcels.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  const p = landService.getParcelById(s.id);
                  if (p) setSelectedParcel(p);
                }}
                className={`p-2 rounded-lg text-left transition-colors border text-xs ${
                  selectedParcel?.parcelId === s.id
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-medium shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="font-mono font-bold text-xs">{s.id}</div>
                <div className={`text-[10px] truncate ${s.color}`}>{s.tag}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Parcel Dossier Summary */}
        <div className="p-4 flex-1 space-y-4">
          {selectedParcel ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-mono text-xs font-bold">
                        {selectedParcel.parcelId}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{selectedParcel.ulpin}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5">{selectedParcel.ownership.ownerName}</h3>
                    
                    {/* Prominent Survey No & Patta No Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold rounded flex items-center gap-1">
                        <span className="text-indigo-400 text-[10px]">SURVEY:</span>
                        <span>{selectedParcel.surveyNumber}</span>
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold rounded flex items-center gap-1">
                        <span className="text-emerald-500 text-[10px]">PATTA:</span>
                        <span>{selectedParcel.ownership.pattaNumber}</span>
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono rounded">
                        Sub-Div: {selectedParcel.subDivision || '1'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {selectedParcel.village}, {selectedParcel.taluk}, {selectedParcel.district}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        selectedParcel.risk.riskLevel === 'LOW'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : selectedParcel.risk.riskLevel === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      Risk: {selectedParcel.risk.overallScore}/100
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {selectedParcel.areaSqFt.toLocaleString()} sq.ft
                    </div>
                  </div>
                </div>

                {/* Micro Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Classification:</span>
                    <span className="font-medium text-slate-800">{selectedParcel.classification}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Master Plan Zoning:</span>
                    <span className="font-medium text-slate-800">{selectedParcel.landUse}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Encumbrance:</span>
                    <span className={`font-medium ${selectedParcel.encumbrance.hasMortgage ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {selectedParcel.encumbrance.encumbranceStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">AI Satellite Status:</span>
                    <span className={`font-medium ${selectedParcel.satelliteAi.hasAlert ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {selectedParcel.satelliteAi.hasAlert ? '⚠ Deviation Found' : '✓ Conforming'}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button to open 360° Profile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => openParcel360(selectedParcel)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>360° LAND PROFILE</span>
                  </button>
                  <button
                    onClick={() => setShowGovtDocModal(true)}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>GOVT CERTIFIED DOCS</span>
                  </button>
                </div>
              </div>

              {/* Sub Decision Support Tools */}
              <div className="space-y-2">
                <button
                  onClick={() => openDueDiligence(selectedParcel)}
                  className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-800">Is This Land Safe to Buy?</div>
                      <div className="text-[11px] text-slate-500">10-point title & legal diligence analysis</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => openBuildChecker(selectedParcel)}
                  className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-slate-800">Can I Build Here?</div>
                      <div className="text-[11px] text-slate-500">Rules-based zoning & road width feasibility</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => openAiDetection(selectedParcel)}
                  className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-bold text-slate-800">AI Satellite Anomaly Inspection</div>
                      <div className="text-[11px] text-slate-500">2023 vs 2026 bi-temporal raster comparison</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400 text-xs">
              Select any parcel on the GIS map to inspect its full 360° profile.
            </div>
          )}
        </div>
      </div>

      {selectedParcel && (
        <CertifiedGovtDocumentModal
          parcel={selectedParcel}
          isOpen={showGovtDocModal}
          onClose={() => setShowGovtDocModal(false)}
        />
      )}
    </div>
  );
};
