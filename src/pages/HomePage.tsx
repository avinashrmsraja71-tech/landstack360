import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  MapPin,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  BrainCircuit,
  FileCheck2,
  Users,
  CheckCircle2,
  Sparkles,
  Database,
  Cpu,
  Coins,
  Scale
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { landService } from '../services/landService';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    findLandAroundMe,
    openLocationSurroundings,
    startInteractiveDemoTour,
    openParcel360,
    setSelectedParcel,
  } = useApp();

  const handleInspectDemoParcel = () => {
    const p = landService.getParcelById('TN-CBE-1001') || landService.getParcelById('TN-DEMO-1024');
    if (p) {
      setSelectedParcel(p);
      openParcel360(p);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 p-6 lg:p-8 space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="max-w-4xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Digital Public Infrastructure for Land Governance (Hackathon Prototype)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            LANDSTACK<span className="text-indigo-600">360</span>
          </h1>

          <p className="text-base sm:text-lg font-semibold text-indigo-700">
            "One Parcel. One Identity. Complete Land Intelligence."
          </p>

          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            An integrated GIS-based digital infrastructure connecting land records, governance services, planning,
            taxation, infrastructure and land intelligence through a common parcel-centric framework anchored by ULPIN
            (Unique Land Parcel Identification Number).
          </p>

          {/* Call to action buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/explorer')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded shadow-xs flex items-center gap-2 transition-colors"
            >
              <Map className="w-4 h-4" />
              <span>Explore Land Map</span>
            </button>

            <button
              onClick={openLocationSurroundings}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-sm rounded shadow-xs flex items-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Share Location & View Features</span>
            </button>

            <button
              onClick={startInteractiveDemoTour}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded shadow-xs flex items-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Presentation Tour</span>
            </button>

            <button
              onClick={handleInspectDemoParcel}
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
            >
              <span>Demo Parcel: TN-CBE-1001 (Coimbatore)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prototype Stats Bar */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cadastral Parcels</p>
              <p className="text-2xl font-bold text-slate-800">26+ <span className="text-xs font-normal text-slate-400">Parcels</span></p>
              <p className="text-[10px] text-indigo-600 font-mono mt-0.5">Coimbatore & TN Region</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Integrated Domains</p>
              <p className="text-2xl font-bold text-slate-800">07 <span className="text-xs font-normal text-slate-400">Silos</span></p>
              <p className="text-[10px] text-slate-500 mt-0.5">RoR, SRO, DTCP, Tax, GIS, AI</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Governance Roles</p>
              <p className="text-2xl font-bold text-slate-800">04 <span className="text-xs font-normal text-slate-400">Profiles</span></p>
              <p className="text-[10px] text-slate-500 mt-0.5">Citizen, Officer, Admin, Field</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Satellite Intelligence</p>
              <p className="text-2xl font-bold text-slate-800">12 <span className="text-xs font-normal text-slate-400">Alerts</span></p>
              <p className="text-[10px] text-purple-700 font-mono mt-0.5">Anomaly AI Detection</p>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            * Simulated prototype statistics for hackathon demonstration. All records generated synthetically.
          </div>
        </div>
      </section>

      {/* Core Architectural Philosophy Section: "A Land Parcel Should Not Be Treated as an Isolated Record" */}
      <section className="space-y-4">
        <div className="text-left max-w-2xl">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Platform Paradigm</span>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">
            From Fragmented Records to Connected Land Intelligence
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            A land parcel should not be treated as an isolated database entry. Instead, it becomes a single digital identity
            connecting rights, restrictions, transactions, planning, utilities and spatial intelligence.
          </p>
        </div>

        {/* Before vs After Comparison Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before: Fragmented */}
          <div className="p-5 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <span className="font-bold text-sm text-rose-800">BEFORE: Fragmented Legacy Silos</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold uppercase">
                Isolated Records
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Revenue Patta/Chitta:</strong> Managed separately without real-time spatial validation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Registration SRO:</strong> Deeds registered without automatic cadastral boundary lock.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Town Planning (DTCP):</strong> Building plans sanctioned without automated satellite encroachment checks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Citizen Dilemma:</strong> Citizens struggle across 5 different portals to know if land is safe to buy.</span>
              </li>
            </ul>
          </div>

          {/* After: LandStack360 */}
          <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <span className="font-bold text-sm text-indigo-900">AFTER: LANDSTACK360 Unified DPI</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold uppercase">
                One Parcel • One Identity
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Single ULPIN Pinning:</strong> 14-digit geo-coordinate identity binds every state record.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>10-Point Automated Due Diligence:</strong> Instant title safety score (0-100) before citizen investment.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>Rules-Based Buildability Checker:</strong> Instant feasibility check against Master Plan zoning & road width.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span><strong>AI Satellite Sentinel:</strong> Bi-temporal satellite change detection flags unauthorized construction automatically.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tamil Nadu & National DPI Positioning Statement */}
      <section className="p-5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-800">Positioning within the Tamil Nadu & Digital India Ecosystem</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          LANDSTACK360 is architected as an <strong>interoperability and intelligence layer</strong> designed to augment and bridge existing state systems (such as <strong>TamilNilam</strong> for revenue records, <strong>Star 2.0</strong> for registration, <strong>DTCP / CMDA</strong> single-window portals, and municipal tax registers) through modern GIS microservices, open APIs, and standardized ULPIN data models.
        </p>
      </section>

      {/* Feature Exploration Cards */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Explore Core Digital Services
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/explorer')}
            className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all hover:shadow-md shadow-sm"
          >
            <Map className="w-5 h-5 text-indigo-600 mb-2.5" />
            <div className="font-bold text-sm text-slate-800">GIS Land Explorer</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Interactive 21-parcel cadastral map with satellite imagery, land-use zoning, and risk overlays.
            </p>
          </div>

          <div
            onClick={handleInspectDemoParcel}
            className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all hover:shadow-md shadow-sm"
          >
            <FileCheck2 className="w-5 h-5 text-blue-600 mb-2.5" />
            <div className="font-bold text-sm text-slate-800">Parcel 360° Profile</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Comprehensive 12-tab dossier encompassing RoR, EC, Municipal Tax, Utilities, and 10-year chronology.
            </p>
          </div>

          <div
            onClick={() => navigate('/intelligence')}
            className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all hover:shadow-md shadow-sm"
          >
            <BrainCircuit className="w-5 h-5 text-purple-600 mb-2.5" />
            <div className="font-bold text-sm text-slate-800">AI Land Intelligence</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Automated detection of unauthorized structural expansions and buffer zone encroachments.
            </p>
          </div>

          <div
            onClick={() => navigate('/citizen')}
            className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all hover:shadow-md shadow-sm"
          >
            <Users className="w-5 h-5 text-emerald-600 mb-2.5" />
            <div className="font-bold text-sm text-slate-800">Citizen Portal</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Public search, multi-stage application tracker (LS-2026-XXXX), and electronic certificate requests.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
