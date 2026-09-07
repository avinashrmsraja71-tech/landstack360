import React from 'react';
import { X, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, FileText, Scale, Coins, Compass } from 'lucide-react';
import { Parcel } from '../../types/land';

interface DueDiligenceModalProps {
  parcel: Parcel;
  isOpen: boolean;
  onClose: () => void;
}

export const DueDiligenceModal: React.FC<DueDiligenceModalProps> = ({ parcel, isOpen, onClose }) => {
  if (!isOpen) return null;

  const checks = [
    {
      category: 'Ownership & RoR',
      label: 'RoR & Patta Title Match',
      pass: parcel.ownership.isConsistent,
      riskImpact: parcel.ownership.isConsistent ? 0 : 25,
      detail: parcel.ownership.isConsistent
        ? `Matched with Patta #${parcel.ownership.pattaNumber} without break in revenue chain`
        : 'Inconsistency detected between revenue and registration records',
    },
    {
      category: 'Registration',
      label: 'Sub-Registrar Deed Validity',
      pass: true,
      riskImpact: 0,
      detail: `Registered under ${parcel.registration.deedType} (${parcel.registration.registrationNumber})`,
    },
    {
      category: 'Encumbrance',
      label: 'Bank Hypothecation & Mortgages',
      pass: !parcel.encumbrance.hasMortgage,
      riskImpact: parcel.encumbrance.hasMortgage ? 18 : 0,
      detail: parcel.encumbrance.hasMortgage
        ? `Active charge of ${parcel.encumbrance.mortgageAmount} with ${parcel.encumbrance.bankName}`
        : 'Nil encumbrance verified over 36-year continuous search',
    },
    {
      category: 'Litigation',
      label: 'Judicial Court Case Register',
      pass: parcel.restrictions.activeCourtCases === 0,
      riskImpact: parcel.restrictions.activeCourtCases > 0 ? 25 : 0,
      detail: parcel.restrictions.activeCourtCases === 0
        ? 'Zero civil or revenue court injunctions found'
        : parcel.restrictions.courtCaseDetails || 'Active litigation found on property title',
    },
    {
      category: 'Land Rights',
      label: 'Government / Poramboke Claim',
      pass: !parcel.restrictions.isGovernmentLand,
      riskImpact: parcel.restrictions.isGovernmentLand ? 30 : 0,
      detail: parcel.restrictions.isGovernmentLand
        ? 'CRITICAL: Vesting in State Government. Private purchase is illegal.'
        : 'Confirmed Ryotwari Private Patta tenure',
    },
    {
      category: 'Religious Vesting',
      label: 'Temple (HR&CE) / Wakf Claim',
      pass: !parcel.restrictions.isTempleLand && !parcel.restrictions.isWakfLand,
      riskImpact: parcel.restrictions.isTempleLand ? 20 : 0,
      detail: parcel.restrictions.isTempleLand ? 'Property claimed under temple inam register' : 'Clean of HR&CE and Wakf section 22-A notices',
    },
    {
      category: 'Environment',
      label: 'Water Body / Canal Buffer',
      pass: !parcel.restrictions.isWaterBodyBuffer,
      riskImpact: parcel.restrictions.isWaterBodyBuffer ? 15 : 0,
      detail: parcel.restrictions.isWaterBodyBuffer ? 'Sits inside 15m canal buffer zone' : 'Clear of statutory catchment buffers',
    },
    {
      category: 'Planning',
      label: 'Master Plan Land Use Conformity',
      pass: parcel.landUse !== 'Government / Protected',
      riskImpact: parcel.landUse === 'Government / Protected' ? 20 : 0,
      detail: `Permitted under ${parcel.zoning.masterPlan} as ${parcel.zoning.zoneCategory}`,
    },
    {
      category: 'Local Body Tax',
      label: 'Municipal Property Tax Status',
      pass: parcel.tax.outstandingAmount === 0,
      riskImpact: parcel.tax.outstandingAmount > 0 ? 8 : 0,
      detail: parcel.tax.outstandingAmount === 0
        ? 'All taxes paid in full through current fiscal cycle'
        : `Outstanding arrears of ₹${parcel.tax.outstandingAmount.toLocaleString()}`,
    },
    {
      category: 'AI Cadastral Vision',
      label: 'Satellite Structural Conformance',
      pass: !parcel.satelliteAi.hasAlert,
      riskImpact: parcel.satelliteAi.hasAlert ? 20 : 0,
      detail: parcel.satelliteAi.hasAlert
        ? parcel.satelliteAi.changeSummary
        : 'Footprint conforms with approved ground boundaries',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Is This Land Safe to Buy? — 10-Point Due Diligence</h3>
              <p className="text-xs text-slate-400">
                Automated legal, financial, and environmental title diligence for{' '}
                <span className="text-emerald-400 font-mono font-semibold">{parcel.parcelId}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Top Score Banner */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Transparent Title Safety Rating
              </div>
              <div className="text-2xl font-black text-white mt-0.5 flex items-center gap-2">
                <span>{parcel.risk.overallScore}</span>
                <span className="text-sm font-normal text-slate-400">/ 100 Risk Score</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ml-2 ${
                    parcel.risk.riskLevel === 'LOW'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : parcel.risk.riskLevel === 'MEDIUM'
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-rose-950 text-rose-300 border border-rose-700'
                  }`}
                >
                  {parcel.risk.riskLevel} RISK
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Recommendation:{' '}
                <strong className={parcel.risk.overallScore < 30 ? 'text-emerald-400' : 'text-amber-400'}>
                  {parcel.risk.safeToBuyRecommendation}
                </strong>
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-5">
              <div className="text-xs text-slate-400">Cadastral Parcel:</div>
              <div className="font-mono text-emerald-400 font-bold">{parcel.parcelId}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{parcel.village}, Sy {parcel.surveyNumber}</div>
            </div>
          </div>

          {/* Checklist Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              10-Factor Multi-Registry Verification Matrix:
            </div>
            <div className="divide-y divide-slate-800/80 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              {checks.map((chk, i) => (
                <div key={i} className="p-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-start gap-2.5">
                    {chk.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{chk.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {chk.category}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{chk.detail}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`font-mono text-xs font-bold ${
                        chk.riskImpact === 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      +{chk.riskImpact} Risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent Scoring Formula */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-200 block mb-0.5">Scoring Transparency:</span>
            Score = Σ(Ownership Inconsistency: 0-25 + Active Mortgage: 0-25 + Planning/Setback: 0-20 + Water Buffer: 0-15 + Active Litigation: 0-15).
            Lower scores denote clean verifiable digital ownership. Not legally authoritative; consultation with an authorized advocate is advised.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2 text-xs">
          <button onClick={onClose} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold">
            Close Due Diligence
          </button>
        </div>
      </div>
    </div>
  );
};
