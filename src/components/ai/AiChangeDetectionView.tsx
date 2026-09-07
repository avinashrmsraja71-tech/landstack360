import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Building,
  AlertTriangle,
  CheckCircle2,
  Send,
  Eye,
  Layers,
  ArrowRight,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { Parcel } from '../../types/land';
import { landService } from '../../services/landService';
import { useApp } from '../../context/AppContext';

interface AiChangeDetectionViewProps {
  parcel: Parcel;
  isOpen: boolean;
  onClose: () => void;
}

export const AiChangeDetectionView: React.FC<AiChangeDetectionViewProps> = ({ parcel, isOpen, onClose }) => {
  const { setSelectedParcel } = useApp();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isSendingReview, setIsSendingReview] = useState(false);
  const [officerReviewDispatched, setOfficerReviewDispatched] = useState(false);

  if (!isOpen) return null;

  const handleSendForOfficerReview = () => {
    setIsSendingReview(true);
    setTimeout(() => {
      landService.reviewParcelAlert(
        parcel.parcelId,
        'Request Field Inspection',
        'Dispatched from AI Satellite Inspection module for physical ground measurement.',
        'AI Sentinel System'
      );
      const updated = landService.getParcelById(parcel.parcelId);
      if (updated) setSelectedParcel(updated);

      setIsSendingReview(false);
      setOfficerReviewDispatched(true);
    }, 1200);
  };

  const isViolation = parcel.satelliteAi.hasAlert;
  const approved = parcel.building.approvedAreaSqFt || 1200;
  const detected = parcel.building.actualStructureSqFt || (isViolation ? 1800 : 1200);
  const diff = detected - approved;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">AI Land Change & Unauthorized Construction Detection</h3>
                <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-semibold">
                  Simulated AI Demonstration
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-temporal satellite raster inference for <span className="text-emerald-400 font-mono">{parcel.parcelId}</span> (ULPIN: {parcel.ulpin})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-200">
          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              isViolation
                ? 'bg-rose-950/50 border-rose-600/50 text-rose-200'
                : 'bg-emerald-950/50 border-emerald-600/50 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {isViolation ? (
                <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {isViolation ? '⚠ POSSIBLE UNAUTHORIZED CONSTRUCTION DETECTED' : '✓ CADASTRAL CONFORMITY VERIFIED'}
                </div>
                <p className="text-xs opacity-90 mt-0.5">
                  {isViolation
                    ? `Physical building footprint exceeds sanctioned DTCP plan by ${diff} sq.ft. Confidence: ${parcel.satelliteAi.confidenceScore}% (Simulated Model).`
                    : `No unauthorized earth filling or construction detected beyond sanctioned drawing. Confidence: ${parcel.satelliteAi.confidenceScore}%.`}
                </p>
              </div>
            </div>

            {isViolation && !officerReviewDispatched && (
              <button
                onClick={handleSendForOfficerReview}
                disabled={isSendingReview}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950 flex-shrink-0 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingReview ? 'Dispatching...' : 'Send for Officer Review'}</span>
              </button>
            )}

            {officerReviewDispatched && (
              <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-600 text-emerald-300 rounded text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Field Officer Assigned</span>
              </div>
            )}
          </div>

          {/* Side by Side Comparison Visualizer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <span>Temporal Comparison: 2023 (Baseline) vs 2026 (Sentinel-2 / WorldView High-Res)</span>
              <span className="text-purple-400">Spectral Band Difference Index</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 2023 Historical Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-emerald-400">HISTORICAL VIEW (2023)</span>
                  <span className="text-[10px] text-slate-400">Sanctioned Ground Plan</span>
                </div>

                <div className="h-44 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex flex-col items-center justify-center p-4 text-center relative">
                  <div className="w-24 h-24 border-2 border-dashed border-emerald-400/80 rounded-md flex items-center justify-center bg-emerald-900/20">
                    <span className="text-[11px] font-mono text-emerald-300">Sanctioned: {approved} sq.ft</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">{parcel.satelliteAi.historicalLandCover}</span>
                </div>

                <div className="mt-3 text-[11px] text-slate-400">
                  Baseline Satellite Capture Date: 14-Oct-2023 • Resolution: 0.3m/px
                </div>
              </div>

              {/* 2026 Current View Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-rose-400">CURRENT VIEW (2026)</span>
                  <span className="text-[10px] text-slate-400">AI Segmented Mask</span>
                </div>

                <div className="h-44 bg-rose-950/20 border border-rose-800/40 rounded-lg flex flex-col items-center justify-center p-4 text-center relative">
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-dashed border-emerald-400/80 rounded-md flex items-center justify-center bg-emerald-900/20">
                      <span className="text-[10px] font-mono text-emerald-300">Sanctioned</span>
                    </div>
                    {isViolation && (
                      <div className="absolute -right-6 -bottom-3 w-16 h-16 border-2 border-rose-500 rounded bg-rose-600/30 flex items-center justify-center text-[9px] font-mono font-bold text-rose-200 shadow-lg animate-pulse">
                        +{diff} sq.ft
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">{parcel.satelliteAi.currentLandCover}</span>
                </div>

                <div className="mt-3 text-[11px] text-slate-400">
                  Current Satellite Pass: 02-Sep-2026 • AI Mask: ResNet-UNet-Cadastral
                </div>
              </div>
            </div>
          </div>

          {/* Numerical Deviation Breakdown */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Quantitative Deviation Analytics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sanctioned Area</span>
                <span className="text-base font-bold text-white">{approved} sq.ft</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Detected Footprint</span>
                <span className="text-base font-bold text-white">{detected} sq.ft</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Deviation</span>
                <span className={`text-base font-bold ${diff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {diff > 0 ? `+${diff} sq.ft` : '0 sq.ft (Compliant)'}
                </span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">AI Confidence Score</span>
                <span className="text-base font-bold text-purple-400">{parcel.satelliteAi.confidenceScore}% (Demo)</span>
              </div>
            </div>
          </div>

          {/* Future Real-World ML Pipeline Architecture */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Production Pipeline Architecture (Future Government Integration)</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
              <span className="px-2 py-1 bg-slate-800 rounded">Sentinel-2 / Planet Labs Imagery</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="px-2 py-1 bg-slate-800 rounded">Ortho-rectification & Radiometric Calibration</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="px-2 py-1 bg-slate-800 rounded">Bi-temporal Change Detection (Siamese CNN)</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="px-2 py-1 bg-slate-800 rounded">ULPIN Cadastral Boundary Intersection</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                Automated Officer Notice Dispatch
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2 text-xs">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold">
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
