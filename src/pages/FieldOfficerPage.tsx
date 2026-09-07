import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Send,
  FileText,
  Clock,
  ShieldCheck,
  Check,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { landService } from '../services/landService';

export const FieldOfficerPage: React.FC = () => {
  const { selectedParcel, setSelectedParcel, openParcel360 } = useApp();
  const [selectedTaskId, setSelectedTaskId] = useState('TN-DEMO-1025');
  const [groundFinding, setGroundFinding] = useState<'conforming' | 'encroachment' | 'unauthorized_construction'>('unauthorized_construction');
  const [measuredDeviation, setMeasuredDeviation] = useState('580 sq.ft physical structure detected outside sanctioned DTCP boundary');
  const [officerNotes, setOfficerNotes] = useState('Inspected on-ground with Total Station Leica TS16. Rear setback encroached by concrete shed.');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const parcel = landService.getParcelById(selectedTaskId) || landService.getAllParcels()[0];

  const tasks = [
    {
      id: 'TN-DEMO-1025',
      type: 'AI Satellite Anomaly Field Verification',
      priority: 'HIGH',
      village: 'Srirangam',
      surveyNo: '45/2B',
      owner: 'K. Balasubramanian',
      reason: 'AI detected +600 sq.ft building expansion beyond sanction',
      distanceMeters: 28,
    },
    {
      id: 'TN-DEMO-1027',
      type: 'Canal Buffer Zone Encroachment Check',
      priority: 'CRITICAL',
      village: 'Kallanai Catchment',
      surveyNo: '12/1',
      owner: 'State Government (Vested)',
      reason: 'Temporary boundary wall erected inside 15m irrigation canal buffer',
      distanceMeters: 140,
    },
    {
      id: 'TN-DEMO-1028',
      type: 'Patta Mutation Physical Boundary Demarcation',
      priority: 'MEDIUM',
      village: 'Thiruvanaikoil',
      surveyNo: '88/4',
      owner: 'V. Senthilkumar',
      reason: 'Subdivision peg-marking for partition deed',
      distanceMeters: 420,
    },
  ];

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    landService.reviewParcelAlert(
      parcel.parcelId,
      groundFinding === 'conforming' ? 'Conforming Verified' : 'Notice Issued',
      `Field Officer Ground Truthing: ${measuredDeviation}. Notes: ${officerNotes}`,
      'Field Surveyor (ID: FS-TN-042)'
    );
    setIsSubmitted(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-8 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border border-teal-900/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
              <Compass className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Field Officer & Ground Truthing Ops</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mobile-optimized geospatial field verification, boundary peg-marking, and encroachment inspection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400">Surveyor Badge</span>
            <div className="text-xs font-mono font-bold text-teal-400">FS-TN-042 (Tiruchirappalli)</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Assigned Inspection Tasks */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Assigned Field Verification Tasks ({tasks.length})
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  setIsSubmitted(false);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTaskId === task.id
                    ? 'bg-teal-950/60 border-teal-500 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="font-mono text-teal-400">{task.id}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      task.priority === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : task.priority === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="font-semibold text-xs text-white mt-1.5">{task.type}</div>
                <p className="text-[11px] text-slate-400 mt-1">{task.reason}</p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sy {task.surveyNo} • {task.village}</span>
                  <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{task.distanceMeters}m away</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Field Inspection Protocol & Report Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                  {parcel.parcelId}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{parcel.ulpin}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Field Inspection Report for Survey #{parcel.surveyNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Village: <strong className="text-slate-200">{parcel.village}</strong> • Registered Owner:{' '}
                <strong className="text-slate-200">{parcel.ownership.ownerName}</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Proximity Sensor</span>
              <div className="text-base font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-4 h-4 animate-pulse" />
                <span>28 Meters</span>
              </div>
              <span className="text-[10px] text-slate-500">Within Cadastral Bounds</span>
            </div>
          </div>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-950/60 border border-emerald-600 rounded-xl space-y-3 text-emerald-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-base text-white">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>Field Report Successfully Synced to Central Land Registry!</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Ground measurements and GPS peg-point coordinates have been logged to the immutable audit trail.
                Notice has been automatically generated for the Revenue Divisional Officer (RDO).
              </p>
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
                >
                  Edit Report
                </button>
                <button
                  onClick={() => openParcel360(parcel)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                >
                  View Updated Parcel 360°
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-5 text-xs">
              {/* Ground Finding Selector */}
              <div>
                <label className="block font-semibold text-slate-300 mb-2">Ground Observation Verdict:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setGroundFinding('conforming')}
                    className={`p-3 rounded-xl border cursor-pointer text-center transition-colors ${
                      groundFinding === 'conforming'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <div className="font-bold">Conforms to Plan</div>
                    <div className="text-[10px] mt-0.5">No unauthorized work</div>
                  </div>

                  <div
                    onClick={() => setGroundFinding('unauthorized_construction')}
                    className={`p-3 rounded-xl border cursor-pointer text-center transition-colors ${
                      groundFinding === 'unauthorized_construction'
                        ? 'bg-rose-950 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Building className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                    <div className="font-bold">Unauthorized Expansion</div>
                    <div className="text-[10px] mt-0.5">Exceeds sanctioned area</div>
                  </div>

                  <div
                    onClick={() => setGroundFinding('encroachment')}
                    className={`p-3 rounded-xl border cursor-pointer text-center transition-colors ${
                      groundFinding === 'encroachment'
                        ? 'bg-amber-950 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <div className="font-bold">Buffer Encroachment</div>
                    <div className="text-[10px] mt-0.5">Inside road/water buffer</div>
                  </div>
                </div>
              </div>

              {/* Measured Physical Deviation */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Physical Measurement / Deviation Quantified:
                </label>
                <input
                  type="text"
                  value={measuredDeviation}
                  onChange={(e) => setMeasuredDeviation(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Detailed Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Field Surveyor Technical Notes & Observations:
                </label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-teal-500 leading-relaxed"
                />
              </div>

              {/* Photo Evidence Uploader Simulation */}
              <div className="p-4 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                <Camera className="w-6 h-6 text-teal-400 mx-auto" />
                <div className="text-slate-300 font-semibold text-xs">Geo-Tagged Field Photos Attached (2)</div>
                <div className="text-[10px] text-slate-500">
                  IMG_20260906_1423_LAT10.865.jpg • TS_PEG_COORDINATES.csv
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-teal-950 flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit Verified Ground Report & Lock Survey Points</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
