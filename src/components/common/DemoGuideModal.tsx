import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  FileCheck2,
  ShieldCheck,
  Building,
  Sparkles,
  LayoutDashboard,
  Check,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { landService } from '../../services/landService';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    findLandAroundMe,
    openParcel360,
    openDueDiligence,
    openBuildChecker,
    openAiDetection,
    setRole,
    setSelectedParcel,
  } = useApp();

  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'GIS Land Explorer & Spatial Cadastral Map',
      badge: 'GIS Map',
      desc: 'Display interactive cadastral parcel boundaries, satellite tiles, land use zoning, and multi-layer thematic overlays.',
      actionLabel: 'Navigate to GIS Explorer',
      action: () => {
        navigate('/explorer');
      },
    },
    {
      step: 2,
      title: 'GPS "Land Around Me" Spatial Matching',
      badge: 'Location Service',
      desc: 'Trigger device geolocation (or simulated prototype fallback) to detect latitude/longitude and execute spatial polygon intersection to find the cadastral parcel.',
      actionLabel: 'Trigger GPS "Land Around Me"',
      action: () => {
        navigate('/explorer');
        findLandAroundMe();
      },
    },
    {
      step: 3,
      title: 'Auto-Detect Showcase Parcel (TN-CBE-1001)',
      badge: 'ULPIN Identity',
      desc: 'System locks onto showcase parcel TN-CBE-1001 (ULPIN-TN-12-001-1001) in Gandhipuram, Coimbatore.',
      actionLabel: 'Select Parcel TN-CBE-1001 (Coimbatore)',
      action: () => {
        const p = landService.getParcelById('TN-CBE-1001') || landService.getParcelById('TN-DEMO-1024');
        if (p) setSelectedParcel(p);
      },
    },
    {
      step: 4,
      title: 'Open Parcel 360° Profile',
      badge: '12 Connected Domains',
      desc: 'Inspect full 360° dossier: RoR Patta/Chitta, SRO Registration, Encumbrance Certificate, Property Tax, Utilities, and 10-year timeline.',
      actionLabel: 'Open Parcel 360° Dossier',
      action: () => {
        const p = landService.getParcelById('TN-CBE-1001') || landService.getParcelById('TN-DEMO-1024');
        if (p) openParcel360(p);
      },
    },
    {
      step: 5,
      title: 'Automated Title Due Diligence',
      badge: 'Is Land Safe to Buy?',
      desc: 'Run the transparent 10-point title safety check evaluating ownership consistency, active mortgages, court injunctions, and flood buffers.',
      actionLabel: 'Run "Is Safe to Buy?" Check',
      action: () => {
        const p = landService.getParcelById('TN-DEMO-1024');
        if (p) openDueDiligence(p);
      },
    },
    {
      step: 6,
      title: 'Statutory Buildability Engine',
      badge: 'Can I Build Here?',
      desc: 'Evaluate Master Plan 2031 zoning, road width setbacks, and statutory NOC requirements for residential or commercial development.',
      actionLabel: 'Open Buildability Checker',
      action: () => {
        const p = landService.getParcelById('TN-DEMO-1024');
        if (p) openBuildChecker(p);
      },
    },
    {
      step: 7,
      title: 'AI Satellite Change & Violation Detection',
      badge: 'AI Vision Sentinel',
      desc: 'Switch to commercial parcel TN-DEMO-1025. Compare 2023 vs 2026 satellite imagery detecting unauthorized 600 sq.ft building expansion beyond sanctioned plan.',
      actionLabel: 'Inspect AI Satellite Anomaly (TN-DEMO-1025)',
      action: () => {
        const p = landService.getParcelById('TN-DEMO-1025');
        if (p) {
          setSelectedParcel(p);
          openAiDetection(p);
        }
      },
    },
    {
      step: 8,
      title: 'Government Officer & Admin Workflow',
      badge: 'Authority Portal',
      desc: 'Switch to Revenue Officer / Admin role to review high-risk alerts, process citizen applications, and dispatch field survey inspections.',
      actionLabel: 'Switch to Admin & Open Dashboard',
      action: () => {
        setRole('admin');
        navigate('/admin');
      },
    },
    {
      step: 9,
      title: 'Field Officer Ground Truthing & Verification',
      badge: 'Field Operations',
      desc: 'Open mobile-optimized field surveyor mode with live GPS distance-to-boundary tracking, photo evidence capture, and encroachment reporting.',
      actionLabel: 'Open Field Officer Mode',
      action: () => {
        setRole('field_officer');
        navigate('/field-officer');
      },
    },
    {
      step: 10,
      title: 'LANDSTACK API Hub & Common Data Model',
      badge: 'DPI Interoperability',
      desc: 'Review the unified ULPIN data model and interoperability adapters connecting Revenue (TamilNilam), Registration (Star 2.0), Planning (DTCP), and Tax.',
      actionLabel: 'View API Hub Architecture',
      action: () => {
        navigate('/api-hub');
      },
    },
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Play className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">LANDSTACK360 Presentation Tour</h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                10-Step Interactive Demonstration for Hackathon Judges
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              {current.badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">Stage {current.step}/10</span>
          </div>

          <div>
            <h4 className="text-lg font-bold text-white">{current.title}</h4>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{current.desc}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Click below to execute this step live in the application:
            </div>
            <button
              onClick={() => {
                current.action();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
            >
              <span>{current.actionLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step navigator dots */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {steps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-emerald-400'
                    : idx < currentStep
                    ? 'w-2 bg-emerald-700'
                    : 'w-2 bg-slate-700'
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg font-semibold flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="text-slate-400 text-[11px]">
            Use this guide to walk judges through the complete citizen-to-government flow.
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors"
            >
              Finish Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
