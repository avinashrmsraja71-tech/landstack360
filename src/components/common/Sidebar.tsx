import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Map,
  MapPin,
  Users,
  ShieldCheck,
  Building,
  BrainCircuit,
  GitMerge,
  LayoutDashboard,
  Smartphone,
  Cpu,
  HelpCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { role, findLandAroundMe, selectedParcel, openParcel360, openBuildChecker, openDueDiligence } = useApp();

  const navItems = [
    {
      to: '/',
      label: 'Home & Overview',
      icon: Compass,
      badge: null,
    },
    {
      to: '/explorer',
      label: 'GIS Land Explorer',
      icon: Map,
      badge: 'GIS Core',
      highlight: true,
    },
    {
      to: '/citizen',
      label: 'Citizen Portal',
      icon: Users,
      badge: 'Services',
    },
    {
      to: '/intelligence',
      label: 'Land Intelligence & AI',
      icon: BrainCircuit,
      badge: 'AI Alerts',
    },
    {
      to: '/workflow',
      label: 'Inter-Dept Workflow',
      icon: GitMerge,
      badge: null,
    },
    {
      to: '/admin',
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      badge: role === 'admin' || role === 'officer' ? 'Staff' : null,
    },
    {
      to: '/field-officer',
      label: 'Field Officer Mode',
      icon: Smartphone,
      badge: 'GPS/Cam',
    },
    {
      to: '/api-hub',
      label: 'LANDSTACK API Hub',
      icon: Cpu,
      badge: 'ULPIN DPI',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 select-none">
      {/* Platform Title Sub-header */}
      <div className="p-4 border-b border-slate-100">
        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">DIGITAL PUBLIC INFRA</div>
        <div className="text-sm font-bold text-slate-800 mt-0.5">Tamil Nadu Land Stack</div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Cadastral Spatial Service Active</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Core Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2 text-xs transition-colors ${
                  isActive
                    ? 'bg-indigo-50 border-r-2 border-indigo-600 text-indigo-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-600">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Rapid Parcel Tool Shortcuts */}
        <div className="px-4 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Quick Tools
        </div>

        <button
          onClick={findLandAroundMe}
          className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>Find Land Around Me</span>
          </div>
          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">GPS</span>
        </button>

        {selectedParcel && (
          <>
            <button
              onClick={() => openParcel360(selectedParcel)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                <span>Parcel 360° Profile</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">{selectedParcel.parcelId}</span>
            </button>

            <button
              onClick={() => openDueDiligence(selectedParcel)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Is Land Safe to Buy?</span>
              </div>
              <span className="text-[9px] text-emerald-700 font-bold">{selectedParcel.risk.overallScore}/100</span>
            </button>

            <button
              onClick={() => openBuildChecker(selectedParcel)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-amber-600" />
                <span>Can I Build Here?</span>
              </div>
              <span className="text-[9px] text-amber-700 font-semibold">Rules</span>
            </button>
          </>
        )}
      </div>

      {/* Selected Parcel Quick Card in Footer */}
      {selectedParcel && (
        <div className="p-3.5 mx-3 mb-3 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>SELECTED PARCEL</span>
            <span className="font-mono text-indigo-600 text-xs font-bold">{selectedParcel.parcelId}</span>
          </div>
          <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
            {selectedParcel.ownership.ownerName}
          </div>
          <div className="text-[11px] text-slate-500">
            {selectedParcel.village} • Sy {selectedParcel.surveyNumber}
          </div>
          <button
            onClick={() => openParcel360(selectedParcel)}
            className="w-full mt-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition-colors shadow-xs"
          >
            Open 360° Inspection
          </button>
        </div>
      )}

      {/* Bottom Compliance & Disclaimer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 leading-normal">
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          <span>PROTOTYPE ENVIRONMENT</span>
          <span className="text-emerald-600 font-bold">ACTIVE</span>
        </div>
        <p className="mt-0.5 text-slate-500">
          Simulated cadastral data for hackathon demonstration.
        </p>
      </div>
    </aside>
  );
};
