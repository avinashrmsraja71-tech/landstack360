import React, { useState } from 'react';
import {
  X,
  FileText,
  UserCheck,
  Building,
  ShieldAlert,
  Coins,
  Compass,
  History,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Clock,
  Sparkles,
  Download,
  Share2,
  Printer,
  ExternalLink,
  HelpCircle,
  Zap,
  Droplets,
  Scale,
  Landmark,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Parcel } from '../../types/land';
import { useApp } from '../../context/AppContext';
import { CertifiedGovtDocumentModal } from './CertifiedGovtDocumentModal';

interface Parcel360ModalProps {
  parcel: Parcel;
  isOpen: boolean;
  onClose: () => void;
}

export const Parcel360Modal: React.FC<Parcel360ModalProps> = ({ parcel, isOpen, onClose }) => {
  const { openBuildChecker, openDueDiligence, openAiDetection } = useApp();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'ownership' | 'registration' | 'encumbrance' | 'planning' | 'building' | 'tax' | 'utilities' | 'restrictions' | 'risk' | 'history' | 'documents'
  >('overview');

  // Ownership verification simulation state
  const [isVerifyingOwnership, setIsVerifyingOwnership] = useState(false);
  const [verificationStage, setVerificationStage] = useState('');
  const [verificationCompleted, setVerificationCompleted] = useState(false);

  // Tax payment modal simulation
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxReceiptDownloaded, setTaxReceiptDownloaded] = useState(false);
  const [isGovtDocsModalOpen, setIsGovtDocsModalOpen] = useState(false);

  if (!isOpen) return null;

  const runOwnershipVerification = () => {
    setIsVerifyingOwnership(true);
    setVerificationCompleted(false);
    setVerificationStage('1/3 Querying Revenue Department RoR Database (TamilNilam)...');

    setTimeout(() => {
      setVerificationStage('2/3 Cross-referencing SRO Registration Deed (Star 2.0)...');
    }, 900);

    setTimeout(() => {
      setVerificationStage('3/3 Validating Cadastral Boundary & ULPIN Spatial Binding...');
    }, 1800);

    setTimeout(() => {
      setIsVerifyingOwnership(false);
      setVerificationCompleted(true);
    }, 2600);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'ownership', label: 'Ownership & RoR', icon: UserCheck },
    { id: 'registration', label: 'Registration', icon: FileCheck },
    { id: 'encumbrance', label: 'Encumbrance', icon: ShieldAlert },
    { id: 'planning', label: 'Zoning & Master Plan', icon: Building },
    { id: 'building', label: 'Building Permission', icon: Activity },
    { id: 'tax', label: 'Property Tax', icon: Coins },
    { id: 'utilities', label: 'Utilities', icon: Zap },
    { id: 'restrictions', label: 'Restrictions & Disputes', icon: Scale },
    { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'history', label: 'History Timeline', icon: History },
    { id: 'documents', label: 'Documents', icon: FileText },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/50 rounded-md font-mono text-xs font-bold">
                {parcel.parcelId}
              </span>
              <span className="font-mono text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                ULPIN: {parcel.ulpin}
              </span>
              <span className="text-xs px-2.5 py-0.5 bg-indigo-950 text-indigo-200 rounded border border-indigo-700 font-mono font-bold flex items-center gap-1">
                <span className="text-indigo-400 text-[10px]">SURVEY NO:</span>
                <span className="text-white">{parcel.surveyNumber}</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 bg-emerald-950 text-emerald-200 rounded border border-emerald-700 font-mono font-bold flex items-center gap-1">
                <span className="text-emerald-400 text-[10px]">PATTA NO:</span>
                <span className="text-white">{parcel.ownership.pattaNumber}</span>
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                parcel.risk.riskLevel === 'LOW'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  : parcel.risk.riskLevel === 'MEDIUM'
                  ? 'bg-amber-950 text-amber-400 border border-amber-700'
                  : 'bg-rose-950 text-rose-400 border border-rose-700'
              }`}>
                Risk Score: {parcel.risk.overallScore}/100 ({parcel.risk.riskLevel})
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span>{parcel.ownership.ownerName}</span>
              <span className="text-xs font-normal text-slate-400">
                ({parcel.areaSqFt.toLocaleString()} sq.ft • {parcel.areaHectares} Ha)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Village: <span className="text-slate-200">{parcel.village}</span>, Taluk: <span className="text-slate-200">{parcel.taluk}</span>, District: <span className="text-slate-200">{parcel.district}</span> • Classification: <span className="text-emerald-400">{parcel.classification}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGovtDocsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-950"
              title="View Certified Government Documents from Tamil Nilam & TNREGINET"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Govt Certified Docs</span>
            </button>
            <button
              onClick={() => {
                onClose();
                openDueDiligence(parcel);
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/30 hover:bg-emerald-700/40 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-colors"
            >
              <span>Is Safe to Buy?</span>
            </button>
            <button
              onClick={() => {
                onClose();
                openBuildChecker(parcel);
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-700/30 hover:bg-amber-700/40 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors"
            >
              <span>Can I Build?</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Scrollable on small screens) */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/60 px-4 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-200 text-xs sm:text-sm space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Cadastral Identifiers Banner */}
              <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 rounded-xl border border-indigo-500/40 flex flex-wrap items-center justify-between gap-4 shadow-md">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3.5 py-2 bg-indigo-950/90 border border-indigo-500/60 rounded-lg shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block">Survey Number</span>
                    <span className="font-mono text-base font-extrabold text-white">{parcel.surveyNumber}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Sub-Div: {parcel.subDivision || '1'}</span>
                  </div>

                  <div className="px-3.5 py-2 bg-emerald-950/90 border border-emerald-500/60 rounded-lg shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Patta Passbook No</span>
                    <span className="font-mono text-base font-extrabold text-emerald-300">{parcel.ownership.pattaNumber}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Chitta: {parcel.ownership.chittaNumber}</span>
                  </div>

                  <div className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Bhu-Aadhaar (ULPIN)</span>
                    <span className="font-mono text-xs font-bold text-slate-200">{parcel.ulpin}</span>
                    <span className="text-[10px] text-emerald-400 block">✓ Central Geo-Tagged</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Revenue Jurisdiction:</span>
                  <span className="font-semibold text-white text-xs">{parcel.village}, {parcel.taluk}</span>
                  <span className="text-[11px] text-slate-400 block">{parcel.district} District</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Land Use</div>
                  <div className="text-sm font-bold text-white mt-0.5">{parcel.landUse}</div>
                  <div className="text-[10px] text-emerald-400 mt-1">Master Plan 2031 Compliant</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Area</div>
                  <div className="text-sm font-bold text-white mt-0.5">{parcel.areaSqFt.toLocaleString()} sq.ft</div>
                  <div className="text-[10px] text-slate-400 mt-1">{parcel.areaHectares} Hectares (0.44 Acre)</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Encumbrance Status</div>
                  <div className={`text-sm font-bold mt-0.5 ${parcel.encumbrance.hasMortgage ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {parcel.encumbrance.encumbranceStatus}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">EC verified till 2026</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Property Tax</div>
                  <div className={`text-sm font-bold mt-0.5 ${parcel.tax.outstandingAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {parcel.tax.paymentStatus}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">₹{parcel.tax.annualTax.toLocaleString()} / year</div>
                </div>
              </div>

              {/* Spatial Cadastral Coordinates Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Cadastral Spatial Geometry & Boundaries</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Centroid Coordinates:</span>
                    <span className="font-mono text-emerald-300">
                      {parcel.geometry.center[0].toFixed(5)}° N, {parcel.geometry.center[1].toFixed(5)}° E
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Boundary Vertices:</span>
                    <span className="font-mono text-slate-200">
                      {parcel.geometry.coordinates.length} Geo-referenced Coordinates
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Spatial Verification Authority:</span>
                    <span className="text-slate-200">Central Cadastral Geo-Registry (Tamil Nadu)</span>
                  </div>
                </div>
              </div>

              {/* Quick Action Feature Banners */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    onClose();
                    openDueDiligence(parcel);
                  }}
                  className="p-4 bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-600/40 hover:border-emerald-500 rounded-xl text-left transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Is Land Safe to Buy?</span>
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Execute automated 11-point legal, environmental & financial due diligence checks.
                  </p>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    openBuildChecker(parcel);
                  }}
                  className="p-4 bg-gradient-to-br from-amber-950/80 to-slate-900 border border-amber-600/40 hover:border-amber-500 rounded-xl text-left transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Can I Build Here?</span>
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Evaluate Master Plan zoning, road width setbacks, and statutory NOC restrictions.
                  </p>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    openAiDetection(parcel);
                  }}
                  className="p-4 bg-gradient-to-br from-purple-950/80 to-slate-900 border border-purple-600/40 hover:border-purple-500 rounded-xl text-left transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">AI Satellite Inspection</span>
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Compare 2023 vs 2026 multi-spectral imagery to detect unauthorized construction.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OWNERSHIP & ROR */}
          {activeTab === 'ownership' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-white text-sm">Revenue Record of Rights (RoR / Patta-Chitta)</h4>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-xs font-semibold">
                    {parcel.ownership.recordStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 text-xs block">Primary Owner:</span>
                    <span className="font-bold text-white text-sm">{parcel.ownership.ownerName}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {parcel.ownership.relationType} {parcel.ownership.relationName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Patta Number:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{parcel.ownership.pattaNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Chitta Reference:</span>
                    <span className="font-mono text-slate-200">{parcel.ownership.chittaNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Ownership Share:</span>
                    <span className="font-bold text-slate-200">{parcel.ownership.sharePercentage}% (Sole Title)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Aadhaar Binding:</span>
                    <span className="font-mono text-slate-300">{parcel.ownership.aadhaarMasked} (Encrypted)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Officer Verification:</span>
                    <span className="text-slate-200">{parcel.ownership.verifiedByOfficer}</span>
                  </div>
                </div>

                {/* Verification Action */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white text-xs">Cross-Department Title Verification</div>
                    <div className="text-[11px] text-slate-400">
                      Cross-checks Revenue RoR, SRO registration deeds, and cadastral spatial bindings.
                    </div>
                  </div>

                  <button
                    onClick={runOwnershipVerification}
                    disabled={isVerifyingOwnership}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-emerald-950"
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isVerifyingOwnership ? 'animate-spin' : ''}`} />
                    <span>{isVerifyingOwnership ? 'Verifying RoR...' : 'VERIFY OWNERSHIP'}</span>
                  </button>
                </div>

                {isVerifyingOwnership && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-emerald-400 font-mono animate-pulse">
                    {verificationStage}
                  </div>
                )}

                {verificationCompleted && (
                  <div className="mt-3 p-3 bg-emerald-950/60 rounded-lg border border-emerald-600/40 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      ✓ <strong>Ownership records consistent</strong> — RoR Patta {parcel.ownership.pattaNumber} verified against revenue cadastral index.
                    </span>
                  </div>
                )}

                {/* Official Govt Verification Link & Steps */}
                <div className="mt-4 p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                        <span>🏛️ Official Tamil Nadu Revenue Department Portal (Tamil Nilam)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        To view the 100% original, legally binding certified Patta/Chitta or TSLR extract issued by the Government of Tamil Nadu:
                      </p>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-slate-950/80 p-2 rounded border border-slate-800">
                        <div><span className="text-slate-400 block">District:</span><span className="text-white font-bold">{parcel.district}</span></div>
                        <div><span className="text-slate-400 block">Taluk:</span><span className="text-white font-bold">{parcel.taluk}</span></div>
                        <div><span className="text-slate-400 block">Village:</span><span className="text-white font-bold">{parcel.village}</span></div>
                        <div><span className="text-slate-400 block">Survey No:</span><span className="text-emerald-400 font-bold">{parcel.surveyNumber}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
                    <a
                      href="https://eservices.tn.gov.in/eservicesnew/land/chitta.html?lan=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Verify on eServices.tn.gov.in (AnyWhere e-Patta)</span>
                    </a>
                    <a
                      href="https://eservices.tn.gov.in/eservicesnew/land/urban.html?lan=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Urban TSLR Extract</span>
                    </a>
                    <a
                      href="https://tnreginet.gov.in/portal/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>TNREGINET EC</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTRATION */}
          {activeTab === 'registration' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-white text-sm">Sub-Registrar Registration Record (Star 2.0)</h4>
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded text-xs font-semibold">
                    {parcel.registration.deedType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 text-xs block">Registration Number:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{parcel.registration.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Sub-Registrar Office:</span>
                    <span className="text-slate-200">{parcel.registration.subRegistrarOffice}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Registration Date:</span>
                    <span className="text-slate-200">{parcel.registration.registrationDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Book / Volume Reference:</span>
                    <span className="font-mono text-slate-300">{parcel.registration.bookNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Deed Consideration Amount:</span>
                    <span className="font-bold text-white text-sm">{parcel.registration.considerationAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Govt Guideline Value:</span>
                    <span className="font-semibold text-emerald-400">{parcel.registration.guidelineValue}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENCUMBRANCE & MORTGAGE */}
          {activeTab === 'encumbrance' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-white text-sm">Encumbrance & Financial Liabilities</h4>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    parcel.encumbrance.hasMortgage
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}>
                    {parcel.encumbrance.encumbranceStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 text-xs block">EC Reference Number:</span>
                    <span className="font-mono text-slate-200">{parcel.encumbrance.ecNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Period Audited:</span>
                    <span className="text-slate-200">{parcel.encumbrance.periodCovered}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Total Active Liabilities:</span>
                    <span className="font-bold text-white">₹{parcel.encumbrance.totalLiabilities.toLocaleString()}</span>
                  </div>
                  {parcel.encumbrance.bankName && (
                    <>
                      <div>
                        <span className="text-slate-400 text-xs block">Mortgagee Bank:</span>
                        <span className="text-slate-200 font-semibold">{parcel.encumbrance.bankName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">Mortgage Charge Amount:</span>
                        <span className="font-bold text-amber-400">{parcel.encumbrance.mortgageAmount}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">Date of Charge:</span>
                        <span className="text-slate-200">{parcel.encumbrance.chargeDate}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  parcel.encumbrance.hasMortgage
                    ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                }`}>
                  {parcel.encumbrance.hasMortgage ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>
                        ⚠ <strong>Active Financial Charge Detected</strong> — Bank release deed and NOC required prior to property conveyance.
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>
                        ✓ <strong>Nil Encumbrance Confirmed</strong> — 36-year continuous search reveals no active bank hypothecation or court attachment.
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PLANNING & ZONING */}
          {activeTab === 'planning' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-3 pb-2 border-b border-slate-800">
                  Master Plan 2031 Zoning & Development Regulations
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 text-xs block">Zoning Classification:</span>
                    <span className="font-bold text-emerald-300">{parcel.zoning.zoneCategory}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Applicable Master Plan:</span>
                    <span className="text-slate-200">{parcel.zoning.masterPlan}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Fronting Road Width:</span>
                    <span className="text-slate-200">{parcel.zoning.roadWidthMeters} Meters (Adequate for Fire Engine)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Mandatory Front Setback:</span>
                    <span className="text-slate-200">{parcel.zoning.setbackRequiredMeters} Meters</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Max Permissible Height:</span>
                    <span className="text-slate-200">{parcel.zoning.heightPermittedMeters} Meters (G+2 Typical)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Special NOC Required:</span>
                    <span className="text-slate-200">{parcel.zoning.isNOCRequired ? 'Yes (Special Clearance)' : 'No'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-slate-400 text-xs block mb-1">Permitted Activities / Uses:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parcel.zoning.permittedUses.map((use, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 text-xs">
                        ✓ {use}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BUILDING PERMISSION */}
          {activeTab === 'building' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-white text-sm">Building Plan Sanction & Physical Footprint</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    parcel.building.approvalStatus === 'Approved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : parcel.building.approvalStatus === 'Violation Detected'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {parcel.building.approvalStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 text-xs block">Sanction Reference:</span>
                    <span className="font-mono text-emerald-400">{parcel.building.approvalNumber || 'Not Applicable'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Sanctioning Authority:</span>
                    <span className="text-slate-200">{parcel.building.sanctioningAuthority || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Approved Area:</span>
                    <span className="font-bold text-white">
                      {parcel.building.approvedAreaSqFt ? `${parcel.building.approvedAreaSqFt} sq.ft` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Actual Detected Footprint:</span>
                    <span className="font-bold text-white">
                      {parcel.building.actualStructureSqFt ? `${parcel.building.actualStructureSqFt} sq.ft` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Approved Floors:</span>
                    <span className="text-slate-200">{parcel.building.floorsApproved ? `G + ${parcel.building.floorsApproved - 1}` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Sanctioned FSI:</span>
                    <span className="text-slate-200">{parcel.building.fsiApproved || 'N/A'}</span>
                  </div>
                </div>

                {parcel.building.approvalStatus === 'Violation Detected' && (
                  <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <span>
                        AI Satellite analysis detected unauthorized structural deviation of{' '}
                        <strong>
                          {(parcel.building.actualStructureSqFt || 0) - (parcel.building.approvedAreaSqFt || 0)} sq.ft
                        </strong>{' '}
                        beyond approved plan.
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        openAiDetection(parcel);
                      }}
                      className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                    >
                      Inspect AI
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: PROPERTY TAX */}
          {activeTab === 'tax' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-white text-sm">Municipal Property Tax Ledger</h4>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    parcel.tax.paymentStatus === 'Paid in Full'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {parcel.tax.paymentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 text-xs block">Assessment Number:</span>
                    <span className="font-mono text-emerald-400">{parcel.tax.assessmentNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Local Body:</span>
                    <span className="text-slate-200">{parcel.tax.localBodyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Annual Demand:</span>
                    <span className="font-bold text-white">₹{parcel.tax.annualTax.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Last Payment Date:</span>
                    <span className="text-slate-200">{parcel.tax.lastPaymentDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Receipt Reference:</span>
                    <span className="font-mono text-slate-300">{parcel.tax.lastPaidReceipt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Outstanding Arrears:</span>
                    <span className={`font-bold ${parcel.tax.outstandingAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      ₹{parcel.tax.outstandingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowTaxModal(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-colors"
                  >
                    View Tax Ledger Details
                  </button>
                  <button
                    onClick={() => {
                      setTaxReceiptDownloaded(true);
                      setTimeout(() => setTaxReceiptDownloaded(false), 3000);
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{taxReceiptDownloaded ? 'Receipt Downloaded!' : 'Download Payment Receipt'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: UTILITIES */}
          {activeTab === 'utilities' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-3 pb-2 border-b border-slate-800">
                  Infrastructure & Utility Network Connectivity
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">TANGEDCO Electricity</span>
                      <span className="text-[11px] text-slate-400">LT Domestic Grid Connection</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      parcel.utilities.electricityConnected ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {parcel.utilities.electricityConnected ? '✓ Active' : '✕ No'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">TWAD / Corporation Water</span>
                      <span className="text-[11px] text-slate-400">Piped Drinking Water Supply</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      parcel.utilities.waterPipelineAccess ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {parcel.utilities.waterPipelineAccess ? '✓ Connected' : '✕ Borewell'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Underground Drainage (UGD)</span>
                      <span className="text-[11px] text-slate-400">Municipal Sewer Network</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      parcel.utilities.sewerageConnection ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {parcel.utilities.sewerageConnection ? '✓ Connected' : '✕ Septic Tank'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Storm Water Drain</span>
                      <span className="text-[11px] text-slate-400">Paved Concrete Roadside Drain</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      parcel.utilities.stormWaterDrain ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {parcel.utilities.stormWaterDrain ? '✓ Available' : '✕ None'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">High-Speed Fiber Grid</span>
                      <span className="text-[11px] text-slate-400">BharatNet / FTTH Ducting</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      parcel.utilities.broadbandFiber ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {parcel.utilities.broadbandFiber ? '✓ Ready' : '✕ Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: RESTRICTIONS & DISPUTES */}
          {activeTab === 'restrictions' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-white text-sm">Statutory Restrictions & Court Litigation Check</h4>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    parcel.restrictions.disputeStatus === 'Clean Title'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {parcel.restrictions.disputeStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs block">Government Poramboke Check:</span>
                    <span className={`font-semibold ${parcel.restrictions.isGovernmentLand ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {parcel.restrictions.isGovernmentLand ? '⚠ Government Land' : '✓ Private Patta Land'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs block">Temple Land (HR&CE):</span>
                    <span className={`font-semibold ${parcel.restrictions.isTempleLand ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {parcel.restrictions.isTempleLand ? '⚠ HR&CE Claimed' : '✓ No Temple Claim'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs block">Water Body 15m Buffer:</span>
                    <span className={`font-semibold ${parcel.restrictions.isWaterBodyBuffer ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {parcel.restrictions.isWaterBodyBuffer ? '⚠ Inside Canal Buffer' : '✓ Outside Buffer'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-xs block">Active Civil Court Cases:</span>
                    <span className={`font-bold ${parcel.restrictions.activeCourtCases > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {parcel.restrictions.activeCourtCases} Cases Found
                    </span>
                  </div>
                </div>

                {parcel.restrictions.courtCaseDetails && (
                  <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <Scale className="w-4 h-4" />
                      <span>Judicial Registry Alert:</span>
                    </div>
                    {parcel.restrictions.courtCaseDetails}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: RISK ANALYSIS */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-sm">Automated Land Risk Intelligence</h4>
                    <p className="text-xs text-slate-400">Aggregated multi-domain risk quantification (0 = Safest, 100 = Critical)</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">{parcel.risk.overallScore} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
                    <div className={`text-xs font-bold uppercase ${
                      parcel.risk.riskLevel === 'LOW' ? 'text-emerald-400' : parcel.risk.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {parcel.risk.riskLevel} Risk Profile
                    </div>
                  </div>
                </div>

                {/* Score bars */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Ownership & Title Consistency (Max 25)</span>
                      <span className="font-mono text-emerald-400">{parcel.risk.breakdown.ownershipRisk} / 25</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(parcel.risk.breakdown.ownershipRisk / 25) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Encumbrance & Financial Charges (Max 25)</span>
                      <span className="font-mono text-amber-400">{parcel.risk.breakdown.encumbranceRisk} / 25</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(parcel.risk.breakdown.encumbranceRisk / 25) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Planning & Building Sanction Conformance (Max 20)</span>
                      <span className="font-mono text-blue-400">{parcel.risk.breakdown.planningAndZoningRisk} / 20</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(parcel.risk.breakdown.planningAndZoningRisk / 20) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Environmental & Water Body Buffer Risk (Max 15)</span>
                      <span className="font-mono text-sky-400">{parcel.risk.breakdown.environmentalRisk} / 15</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(parcel.risk.breakdown.environmentalRisk / 15) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Dispute & Court Case Risk (Max 15)</span>
                      <span className="font-mono text-rose-400">{parcel.risk.breakdown.disputeRisk} / 15</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(parcel.risk.breakdown.disputeRisk / 15) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Warnings list */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="font-semibold text-white text-xs mb-1.5">Intelligence Advisory Findings:</div>
                  <ul className="space-y-1">
                    {parcel.risk.keyWarnings.map((warn, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-1">Cadastral Event Chronology (2016 – 2026)</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Unified timeline combining Registration, Revenue Mutations, Plan Sanctions, and Inspections.
                </p>

                <div className="relative border-l-2 border-slate-800 ml-3 space-y-6 pl-5 py-2">
                  {parcel.timeline.map((event) => (
                    <div key={event.id} className="relative group">
                      {/* Timeline Node Icon */}
                      <span className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center text-[9px] text-emerald-400 font-bold group-hover:scale-125 transition-transform" />

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-emerald-300">{event.year}</span>
                        <span className="text-[11px] text-slate-400">({event.date})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {event.department}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-medium">
                          {event.eventType}
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-white mt-1">{event.title}</h5>
                      <p className="text-xs text-slate-300 mt-0.5">{event.description}</p>
                      {event.documentRef && (
                        <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                          <span>Ref: {event.documentRef}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-bold text-white text-sm">Certified Government Land Records</h4>
                      <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600/40 text-emerald-300 text-[10px] font-bold rounded-full">
                        Govt Server Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Digitally signed authentic revenue & registration documents from Tamil Nilam & TNREGINET databases.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsGovtDocsModalOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all self-start sm:self-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Full Document Viewer</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Patta / Chitta Form 6 */}
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          படி 6
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">Certified Patta / Chitta (Form 6)</div>
                          <div className="text-[11px] text-slate-400">Revenue Dept • Patta #{parcel.ownership.pattaNumber}</div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-mono rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Contains official Record of Rights (RoR), Pattadar title, survey subdivision, and land revenue kist.
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">Sy: {parcel.surveyNumber}</span>
                      <button
                        onClick={() => setIsGovtDocsModalOpen(true)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-300 rounded border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Extract</span>
                      </button>
                    </div>
                  </div>

                  {/* Encumbrance Certificate */}
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-600/40 text-blue-400 flex items-center justify-center font-bold text-xs">
                          EC
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">Encumbrance Certificate (Form 15/16)</div>
                          <div className="text-[11px] text-slate-400">Registration Dept • {parcel.encumbrance.ecNumber}</div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-blue-950 text-blue-300 text-[10px] font-mono rounded">
                        STAR 2.0
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Registered deeds, consideration values, mortgage charges, and legal search covering 1992 to present.
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-semibold">{parcel.encumbrance.encumbranceStatus}</span>
                      <button
                        onClick={() => setIsGovtDocsModalOpen(true)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-300 rounded border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View EC</span>
                      </button>
                    </div>
                  </div>

                  {/* FMB Cadastral Sketch */}
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          FMB
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">FMB Cadastral Boundary Sketch</div>
                          <div className="text-[11px] text-slate-400">Survey & Land Records • Sy {parcel.surveyNumber}</div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-mono rounded">
                        Chain Metric
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Certified boundary ladder survey dimensions, tie-lines, offsets, and adjacent survey demarcations.
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">Scale 1:1000</span>
                      <button
                        onClick={() => setIsGovtDocsModalOpen(true)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-300 rounded border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View FMB</span>
                      </button>
                    </div>
                  </div>

                  {/* TSLR Urban Land Extract */}
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-600/40 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          TSLR
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">TSLR Urban Land Register Extract</div>
                          <div className="text-[11px] text-slate-400">Coimbatore Corporation • Ward 28, Block 14</div>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-indigo-950 text-indigo-300 text-[10px] font-mono rounded">
                        Urban Cadastre
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Municipal street alignment, door number, town survey number, and sanctioned built-up square footage.
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{parcel.areaSqFt.toLocaleString()} sq.ft</span>
                      <button
                        onClick={() => setIsGovtDocsModalOpen(true)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-300 rounded border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View TSLR</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct Govt Server Verification Link Bar */}
                <div className="mt-4 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-300">
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span>Official Tamil Nadu Portal: <strong>eservices.tn.gov.in (AnyWhere e-Patta)</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://eservices.tn.gov.in/eservicesnew/land/chitta.html?lan=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Verify on Govt Server</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ULPIN Digital Public Infrastructure Data Model Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGovtDocsModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Certified Govt Docs</span>
            </button>
            <button
              onClick={() => {
                alert(`Exporting official PDF Dossier for ${parcel.parcelId}...`);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Land Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-md shadow-emerald-950"
            >
              Close Inspection
            </button>
          </div>
        </div>

        {/* Certified Govt Document Modal */}
        <CertifiedGovtDocumentModal
          parcel={parcel}
          isOpen={isGovtDocsModalOpen}
          onClose={() => setIsGovtDocsModalOpen(false)}
        />
      </div>
    </div>
  );
};
