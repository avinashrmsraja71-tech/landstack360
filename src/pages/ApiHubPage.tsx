import React, { useState } from 'react';
import {
  Database,
  Code,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Cpu,
  Globe,
  CheckCircle2,
  FileCode2,
  Webhook
} from 'lucide-react';
import { landService } from '../services/landService';

export const ApiHubPage: React.FC = () => {
  const [selectedParcelId, setSelectedParcelId] = useState('TN-DEMO-1024');
  const [copied, setCopied] = useState(false);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'payload' | 'adapters' | 'webhooks'>('payload');

  const parcels = landService.getAllParcels();
  const currentParcel = landService.getParcelById(selectedParcelId) || parcels[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(currentParcel, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const adapters = [
    {
      name: 'TamilNilam RoR Adapter',
      department: 'Revenue & Disaster Management Dept, Tamil Nadu',
      protocol: 'REST / OAuth2 + ULPIN-based spatial join',
      status: 'Active',
      syncInterval: 'Every 15 mins',
      fields: ['Patta Number', 'Chitta Extract', 'Ryotwari Classification', 'Co-owners Array'],
    },
    {
      name: 'Star 2.0 Registration Adapter',
      department: 'Registration Department (Inspector General of Registration)',
      protocol: 'SOAP/REST XML Payload with Digital Signatures',
      status: 'Active',
      syncInterval: 'Real-time Webhook',
      fields: ['Document Number', 'SRO Jurisdiction', 'Deed Type', 'Encumbrance Index II'],
    },
    {
      name: 'DTCP Single Window Portal Adapter',
      department: 'Directorate of Town & Country Planning (DTCP / CMDA)',
      protocol: 'GraphQL Spatial GIS Schema',
      status: 'Active',
      syncInterval: 'On-demand / Sanction Event',
      fields: ['Sanctioned Area', 'Floor Space Index (FSI)', 'Setbacks', 'Road Width (m)'],
    },
    {
      name: 'Urban Local Body Property Tax API',
      department: 'Directorate of Municipal Administration (DMA)',
      protocol: 'JSON REST Web API',
      status: 'Active',
      syncInterval: 'Nightly Batch Sync',
      fields: ['Assessment Number', 'Annual Tax Demand', 'Payment History', 'Water Charges'],
    },
    {
      name: 'TANGEDCO / TWAD Utility Adapter',
      department: 'Electricity & Water Supply Boards',
      protocol: 'Secure gRPC Microservice',
      status: 'Active',
      syncInterval: 'Bi-monthly meter cycle',
      fields: ['Consumer Meter Number', 'Phase Connection', 'Water Supply Zone'],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-8 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              LANDSTACK Interoperability Hub & Open Data Architecture
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Common Cadastral Data Model (CCDM) and microservice adapters bridging legacy government silos under India's Digital Public Infrastructure (DPI).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSchemaTab('payload')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSchemaTab === 'payload' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ULPIN JSON Model
          </button>
          <button
            onClick={() => setActiveSchemaTab('adapters')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSchemaTab === 'adapters' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            System Adapters ({adapters.length})
          </button>
          <button
            onClick={() => setActiveSchemaTab('webhooks')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeSchemaTab === 'webhooks' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Event Webhooks
          </button>
        </div>
      </div>

      {/* VIEW 1: JSON MODEL EXPLORER */}
      {activeSchemaTab === 'payload' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">Select Cadastral Parcel:</span>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {parcels.map((p) => (
                  <option key={p.parcelId} value={p.parcelId}>
                    {p.parcelId} ({p.ulpin})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy JSON Payload'}</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 overflow-x-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono">Content-Type: application/vnd.landstack.v1+json</span>
              <span className="text-emerald-400 font-mono">200 OK • Strict Schema Validation Passed</span>
            </div>
            <pre className="text-xs font-mono text-emerald-300/90 leading-relaxed overflow-x-auto max-h-[65vh]">
              {JSON.stringify(currentParcel, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* VIEW 2: SYSTEM ADAPTERS */}
      {activeSchemaTab === 'adapters' && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Connected Government Department Microservice Adapters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adapters.map((ad, idx) => (
              <div key={idx} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">{ad.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{ad.department}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {ad.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Integration Protocol</span>
                    <span className="text-slate-300 font-medium">{ad.protocol}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Sync Frequency</span>
                    <span className="text-slate-300 font-medium">{ad.syncInterval}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                    Normalized Unified Fields:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ad.fields.map((f) => (
                      <span key={f} className="text-[11px] px-2 py-0.5 bg-slate-950 rounded text-slate-300 border border-slate-800">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: WEBHOOKS & AUTOMATED TRIGGERS */}
      {activeSchemaTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Real-Time Inter-Departmental Event Triggers & Pipelines
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="text-emerald-400 font-mono">EVENT: parcel.registration.sale_deed_executed</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  AUTOMATED PIPELINE
                </span>
              </div>
              <p className="text-slate-400">
                Triggered immediately when Sub-Registrar Officer (SRO) registers a sale conveyance deed.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-slate-300 text-[11px]">
                <span className="px-2 py-1 bg-slate-800 rounded">1. Lock Registration Deed</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-slate-800 rounded">2. Auto-Trigger Revenue Patta Transfer</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-slate-800 rounded">3. Re-index Encumbrance Search (EC)</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                  4. Notify Citizen via SMS / DigiLocker
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="text-purple-400 font-mono">EVENT: parcel.satellite.expansion_anomaly_detected</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                  AI PIPELINE
                </span>
              </div>
              <p className="text-slate-400">
                Triggered bi-weekly when earth observation imagery analysis segments structural footprint exceeding DTCP sanctioned area.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-slate-300 text-[11px]">
                <span className="px-2 py-1 bg-slate-800 rounded">1. Ingest Sentinel-2 Image</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-slate-800 rounded">2. Compute Mask Difference (+600 sq.ft)</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-slate-800 rounded">3. Calculate Confidence (89%)</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded">
                  4. Auto-Assign Task to Field Surveyor
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
