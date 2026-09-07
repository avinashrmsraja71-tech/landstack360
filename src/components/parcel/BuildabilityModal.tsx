import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Building, Compass, Info, ArrowRight, ShieldCheck } from 'lucide-react';
import { Parcel } from '../../types/land';

interface BuildabilityModalProps {
  parcel: Parcel;
  isOpen: boolean;
  onClose: () => void;
}

export const BuildabilityModal: React.FC<BuildabilityModalProps> = ({ parcel, isOpen, onClose }) => {
  const [proposedBuildingType, setProposedBuildingType] = useState<'residential' | 'commercial' | 'industrial'>('residential');

  if (!isOpen) return null;

  // Rules-based analysis
  const checks = [
    {
      label: 'Master Plan Zoning',
      status: parcel.landUse !== 'Government / Protected',
      value: parcel.zoning.zoneCategory,
      remark: parcel.landUse === 'Government / Protected' ? 'Protected public conservation area' : 'Conforms to CDP 2031 category',
      risk: parcel.landUse === 'Government / Protected' ? 'fail' : 'pass',
    },
    {
      label: 'Frontage Road Width',
      status: parcel.zoning.roadWidthMeters >= 7.2,
      value: `${parcel.zoning.roadWidthMeters} Meters`,
      remark: parcel.zoning.roadWidthMeters >= 7.2 ? 'Meets statutory fire tender access requirement (>7.2m)' : 'Inadequate road access (<7.2m)',
      risk: parcel.zoning.roadWidthMeters >= 7.2 ? 'pass' : 'warn',
    },
    {
      label: 'Water-Body 15m Buffer Zone',
      status: !parcel.restrictions.isWaterBodyBuffer,
      value: parcel.restrictions.isWaterBodyBuffer ? 'Inside 15m Canal Buffer' : 'Outside Buffer Zone',
      remark: parcel.restrictions.isWaterBodyBuffer ? 'Prohibited under TN Panchayat Building Rules 2019' : 'Safe distance from notified canal channels',
      risk: parcel.restrictions.isWaterBodyBuffer ? 'fail' : 'pass',
    },
    {
      label: 'Government / Poramboke Claim',
      status: !parcel.restrictions.isGovernmentLand,
      value: parcel.restrictions.isGovernmentLand ? 'Govt Poramboke' : 'Private Patta Land',
      remark: parcel.restrictions.isGovernmentLand ? 'State title; private development prohibited' : 'Clean revenue ownership chain',
      risk: parcel.restrictions.isGovernmentLand ? 'fail' : 'pass',
    },
    {
      label: 'Civil Court Litigation',
      status: parcel.restrictions.activeCourtCases === 0,
      value: `${parcel.restrictions.activeCourtCases} Active Injunctions`,
      remark: parcel.restrictions.activeCourtCases === 0 ? 'No active injunctions on title' : 'Injunction prohibits change of physical nature',
      risk: parcel.restrictions.activeCourtCases === 0 ? 'pass' : 'fail',
    },
    {
      label: 'Land Classification',
      status: parcel.classification !== 'Wetland (Nanjai)',
      value: parcel.classification,
      remark: parcel.classification === 'Wetland (Nanjai)' ? 'Nanjai wetland requires District Collector NOC for conversion' : 'Dryland (Punjai) eligible for standard DTCP approval',
      risk: parcel.classification === 'Wetland (Nanjai)' ? 'warn' : 'pass',
    },
    {
      label: 'Adequate Parcel Area',
      status: parcel.areaSqFt >= 1200,
      value: `${parcel.areaSqFt.toLocaleString()} sq.ft`,
      remark: 'Exceeds minimum layout plotting threshold (minimum 800 sq.ft)',
      risk: 'pass',
    },
    {
      label: 'Prior Sanction Record',
      status: parcel.building.hasPermission,
      value: parcel.building.hasPermission ? 'Approved Plan Sanctioned' : 'Vacant / New Application Needed',
      remark: parcel.building.hasPermission ? `DTCP Sanction #${parcel.building.approvalNumber}` : 'Fresh layout/building sanction required',
      risk: parcel.building.hasPermission ? 'pass' : 'info',
    },
  ];

  const hasFails = checks.some((c) => c.risk === 'fail');
  const hasWarns = checks.some((c) => c.risk === 'warn');

  const finalSuitability = hasFails
    ? 'NOT PERMISSIBLE FOR CONSTRUCTION'
    : hasWarns
    ? 'CONDITIONALLY SUITABLE (REQUIRES NOC)'
    : 'POTENTIALLY SUITABLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Building className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Can I Build Here? — Automated Feasibility Check</h3>
                <p className="text-xs text-slate-400">
                  Rules-based statutory pre-screening for <span className="text-emerald-400 font-mono font-semibold">{parcel.parcelId}</span> (Sy {parcel.surveyNumber})
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Proposal selector */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-300">Proposed Structure Category:</span>
            <div className="flex gap-2">
              {(['residential', 'commercial', 'industrial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setProposedBuildingType(type)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                    proposedBuildingType === type
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              hasFails
                ? 'bg-rose-950/60 border-rose-600/60 text-rose-200'
                : hasWarns
                ? 'bg-amber-950/60 border-amber-600/60 text-amber-200'
                : 'bg-emerald-950/60 border-emerald-600/60 text-emerald-200'
            }`}
          >
            {hasFails ? (
              <XCircle className="w-8 h-8 text-rose-400 flex-shrink-0" />
            ) : hasWarns ? (
              <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">Feasibility Verdict:</div>
              <div className="text-base font-extrabold">{finalSuitability}</div>
              <p className="text-xs opacity-90 mt-0.5">
                {hasFails
                  ? 'Critical statutory prohibitions detected. Construction cannot proceed legally.'
                  : hasWarns
                  ? 'Land is potentially developable subject to obtaining special NOCs (e.g., Agricultural conversion / Environmental buffer clearance).'
                  : 'All primary town planning, road width, and zoning criteria conform to DTCP parameters.'}
              </p>
            </div>
          </div>

          {/* Criteria Checklist Grid */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Statutory Parameter Evaluation (8 Rules Checked):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {checks.map((chk, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
                  {chk.risk === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                  {chk.risk === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                  {chk.risk === 'fail' && <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
                  {chk.risk === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{chk.label}</span>
                      <span className="text-[11px] font-mono text-slate-400">{chk.value}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{chk.remark}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-amber-400 block mb-0.5">IMPORTANT NOTICE:</span>
            This is a prototype decision-support tool and does not constitute legal approval or building permission.
            Actual building sanctions must be applied for through the statutory Single Window Portal of the Directorate of Town and Country Planning (DTCP / CMDA).
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2 text-xs">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold">
            Close Checker
          </button>
        </div>
      </div>
    </div>
  );
};
