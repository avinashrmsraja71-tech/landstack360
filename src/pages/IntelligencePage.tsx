import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Filter,
  Layers,
  ArrowRight,
  ShieldAlert,
  Send,
  Check,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { landService } from '../services/landService';
import { Parcel } from '../types/land';

export const IntelligencePage: React.FC = () => {
  const { openAiDetection, openParcel360, setSelectedParcel, role } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const parcels = landService.getAllParcels();
  const alertParcels = parcels.filter((p) => p.satelliteAi.hasAlert || p.risk.overallScore > 35);

  const filtered = alertParcels.filter((p) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNAUTHORIZED') return p.satelliteAi.hasAlert && p.satelliteAi.alertType.includes('Unauthorized');
    if (filterType === 'ENCROACHMENT') return p.restrictions.isWaterBodyBuffer || p.satelliteAi.alertType.includes('Encroachment');
    if (filterType === 'HIGH_RISK') return p.risk.overallScore >= 50;
    return true;
  });

  const handleReviewAction = (parcelId: string, action: 'Request Field Inspection' | 'Dismiss Alert' | 'Notice Issued') => {
    landService.reviewParcelAlert(
      parcelId,
      action,
      `Action executed from AI Land Intelligence Center by current user (${role.toUpperCase()}).`,
      'Revenue Intelligence Desk'
    );
    setActionSuccessMsg(`Successfully executed "${action}" on parcel ${parcelId}. Audit logged.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-8 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-900/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">AI Land Sentinel & Spatial Intelligence</h1>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
                Simulated AI Demonstration
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated earth-observation raster analytics detecting physical deviations, unauthorized structural additions, and environmental buffer encroachments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400">Active Sentinel Alerts</span>
            <div className="text-2xl font-black text-rose-400">{alertParcels.length}</div>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-600 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block text-[11px]">Monitored Cadastral Parcels</span>
          <span className="text-xl font-bold text-white mt-1 block">{parcels.length}</span>
          <span className="text-[10px] text-emerald-400">100% Polygon Coverage</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block text-[11px]">Structural Deviations</span>
          <span className="text-xl font-bold text-rose-400 mt-1 block">
            {parcels.filter((p) => p.satelliteAi.hasAlert).length}
          </span>
          <span className="text-[10px] text-rose-300">Exceeding Sanctioned Area</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block text-[11px]">Buffer Zone Violations</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">
            {parcels.filter((p) => p.restrictions.isWaterBodyBuffer).length}
          </span>
          <span className="text-[10px] text-amber-300">Canal / Tank Catchment</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block text-[11px]">Average Model Confidence</span>
          <span className="text-xl font-bold text-purple-400 mt-1 block">89.4%</span>
          <span className="text-[10px] text-purple-300">Bi-Temporal UNet Model</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-xs overflow-x-auto">
        {[
          { id: 'ALL', label: `All Alerts (${alertParcels.length})` },
          { id: 'UNAUTHORIZED', label: 'Unauthorized Construction' },
          { id: 'ENCROACHMENT', label: 'Water Buffer Encroachment' },
          { id: 'HIGH_RISK', label: 'High Risk (>50)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-colors ${
              filterType === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((parcel) => {
          const approved = parcel.building.approvedAreaSqFt || 1200;
          const detected = parcel.building.actualStructureSqFt || 1800;
          const diff = detected - approved;

          return (
            <div
              key={parcel.parcelId}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-4 shadow-xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {parcel.parcelId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{parcel.ulpin}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mt-1">{parcel.ownership.ownerName}</h3>
                  <p className="text-xs text-slate-400">
                    Sy {parcel.surveyNumber} • {parcel.village}, {parcel.taluk}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      parcel.risk.overallScore >= 50
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {parcel.risk.riskLevel} Risk ({parcel.risk.overallScore}/100)
                  </span>
                  <div className="text-[10px] text-purple-400 font-mono mt-1">
                    Confidence: {parcel.satelliteAi.confidenceScore}%
                  </div>
                </div>
              </div>

              {/* Alert Content Box */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{parcel.satelliteAi.alertType || 'Composite Cadastral Deviation'}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {parcel.satelliteAi.changeSummary || 'Land use inconsistency detected in satellite temporal comparison.'}
                </p>

                {parcel.satelliteAi.hasAlert && diff > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sanctioned</span>
                      <span className="font-mono text-white font-bold">{approved} sq.ft</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">AI Detected</span>
                      <span className="font-mono text-white font-bold">{detected} sq.ft</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Expansion</span>
                      <span className="font-mono text-rose-400 font-bold">+{diff} sq.ft</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedParcel(parcel);
                      openAiDetection(parcel);
                    }}
                    className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-600/50 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>View 2023 vs 2026 Diff</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedParcel(parcel);
                      openParcel360(parcel);
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    Parcel 360°
                  </button>
                </div>

                {/* Workflow state action */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleReviewAction(parcel.parcelId, 'Request Field Inspection')}
                    className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shadow transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Dispatch Officer</span>
                  </button>
                  <button
                    onClick={() => handleReviewAction(parcel.parcelId, 'Dismiss Alert')}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs"
                    title="Dismiss as false positive"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
