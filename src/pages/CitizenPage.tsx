import React, { useState } from 'react';
import {
  Users,
  Search,
  MapPin,
  FileCheck2,
  Building,
  Coins,
  Scale,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { landService } from '../services/landService';
import { CitizenApplication } from '../types/land';

export const CitizenPage: React.FC = () => {
  const { openParcel360, findLandAroundMe, setSelectedParcel } = useApp();
  const [activeTab, setActiveTab] = useState<'track' | 'services' | 'apply'>('track');
  const [selectedAppId, setSelectedAppId] = useState<string>('LS-2026-00124');
  const [searchAppInput, setSearchAppInput] = useState('');

  // Service Request Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [selectedParcelId, setSelectedParcelId] = useState('TN-DEMO-1024');
  const [serviceType, setServiceType] = useState<CitizenApplication['applicationType']>('Ownership Verification');
  const [submissionSuccess, setSubmissionSuccess] = useState<CitizenApplication | null>(null);

  const applications = landService.getApplications();
  const activeApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const handleSearchApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAppInput.trim()) return;
    const found = applications.find(
      (a) => a.id.toLowerCase() === searchAppInput.trim().toLowerCase()
    );
    if (found) {
      setSelectedAppId(found.id);
    } else {
      alert(`Application with ID "${searchAppInput}" not found in simulated registry.`);
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) {
      alert('Please fill out applicant name and mobile number.');
      return;
    }

    const parcel = landService.getParcelById(selectedParcelId);
    const newApp = landService.submitApplication({
      applicantName,
      applicantPhone,
      applicationType: serviceType,
      parcelId: selectedParcelId,
      ulpin: parcel?.ulpin || `ULPIN-TN-${selectedParcelId}`,
      remarks: 'Submitted via LandStack Citizen Public Self-Service Portal.',
    });

    setSubmissionSuccess(newApp);
    setSelectedAppId(newApp.id);
    setApplicantName('');
    setApplicantPhone('');
  };

  const stages = [
    'Application Submitted',
    'Document Validation',
    'Revenue Verification',
    'Registration Cross-Check',
    'Final Approval',
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8 space-y-6 text-slate-900">
      {/* Top Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Citizen Land Services Portal</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Apply for digital revenue services, verify land titles, and track cross-department applications in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3.5 py-2 rounded text-xs font-semibold transition-colors shadow-xs ${
              activeTab === 'track' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Track Application
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-3.5 py-2 rounded text-xs font-semibold transition-colors shadow-xs ${
              activeTab === 'apply' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Apply for Service
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-2 rounded text-xs font-semibold transition-colors shadow-xs ${
              activeTab === 'services' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Citizen Services
          </button>
        </div>
      </div>

      {/* VIEW 1: APPLICATION TRACKER */}
      {activeTab === 'track' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications list & search */}
          <div className="space-y-4">
            <form onSubmit={handleSearchApp} className="relative">
              <input
                type="text"
                value={searchAppInput}
                onChange={(e) => setSearchAppInput(e.target.value)}
                placeholder="Search by Application ID (e.g. LS-2026-00124)..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
              >
                Find
              </button>
            </form>

            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Recent Citizen Applications ({applications.length})
              </div>
              <div className="space-y-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all shadow-xs ${
                      selectedAppId === app.id
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-medium'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="font-mono text-indigo-600">{app.id}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          app.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : app.status === 'Needs Clarification'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-900 mt-1">{app.applicationType}</div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                      <span>{app.applicantName}</span>
                      <span>{app.submittedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Progress Stepper Card */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
            {activeApp ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                      {activeApp.id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{activeApp.applicationType}</h3>
                    <p className="text-xs text-slate-500">
                      Applicant: <strong className="text-slate-800">{activeApp.applicantName}</strong> ({activeApp.applicantPhone}) • Parcel:{' '}
                      <strong className="text-indigo-600 font-mono">{activeApp.parcelId}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Submitted On</span>
                    <span className="text-xs font-semibold text-slate-700">{activeApp.submittedDate}</span>
                  </div>
                </div>

                {/* Stepper Visualization (Section 22 Requirement) */}
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Application Lifecycle Progress
                  </div>

                  <div className="space-y-4 relative border-l-2 border-slate-200 ml-4 pl-6 py-1">
                    {stages.map((stageName, index) => {
                      const isCompleted = index < activeApp.stageIndex;
                      const isCurrent = index === activeApp.stageIndex;
                      const isPending = index > activeApp.stageIndex;

                      return (
                        <div key={stageName} className="relative group">
                          {/* Node Icon */}
                          <span
                            className={`absolute -left-[33px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : isCurrent
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            {isCompleted ? '✓' : isCurrent ? '⏳' : '○'}
                          </span>

                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold ${
                                isCompleted
                                  ? 'text-emerald-700'
                                  : isCurrent
                                  ? 'text-indigo-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stageName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {isCompleted ? 'Completed' : isCurrent ? 'In Review' : 'Upcoming'}
                            </span>
                          </div>

                          {isCurrent && (
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2 text-xs text-slate-700 space-y-1">
                              <div className="text-slate-500 font-medium">Officer Assigned:</div>
                              <div className="font-semibold text-slate-900">{activeApp.assignedOfficer}</div>
                              <div className="text-[11px] text-indigo-700 font-medium mt-1">Remarks: {activeApp.remarks}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inspect Target Parcel Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Target Land Cadastral Reference: <strong className="text-indigo-600">{activeApp.parcelId}</strong>
                  </span>
                  <button
                    onClick={() => {
                      const p = landService.getParcelById(activeApp.parcelId);
                      if (p) {
                        setSelectedParcel(p);
                        openParcel360(p);
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect Parcel 360°</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-12 text-slate-400 text-xs">Select an application to view tracker</div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: APPLY FOR CITIZEN SERVICE */}
      {activeTab === 'apply' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Send className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900">Submit New Citizen Land Service Request</h3>
              <p className="text-xs text-slate-500">
                Directly route requests to Revenue, SRO, or Town Planning authorities.
              </p>
            </div>
          </div>

          {submissionSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-emerald-950">Application Successfully Submitted!</div>
                <p className="mt-1">
                  Your tracking number is <strong className="font-mono text-indigo-700">{submissionSuccess.id}</strong>.
                  You can track live verification steps in the application tracker.
                </p>
                <button
                  onClick={() => setActiveTab('track')}
                  className="mt-2 text-indigo-600 font-semibold underline text-xs block"
                >
                  View Live Progress Tracker →
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Required Service Type:</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Ownership Verification">Ownership & Title Verification (RoR Match)</option>
                <option value="Patta Mutation">Revenue Patta Name Transfer / Mutation</option>
                <option value="Encumbrance Certificate">Encumbrance Certificate (EC Search)</option>
                <option value="Building NOC">Town Planning Building NOC Clearance</option>
                <option value="Land Use Certificate">Zoning & Land Use Category Certificate</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Demo Cadastral Parcel:</label>
              <select
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              >
                {landService.getAllParcels().map((p) => (
                  <option key={p.parcelId} value={p.parcelId}>
                    {p.parcelId} ({p.ownership.ownerName} • Sy {p.surveyNumber} • {p.village})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicant Full Name:</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. S. Murugesan"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicant Mobile Number:</label>
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="+91 94431 88210"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
              <strong>Simulated Public Service Delivery Guarantee:</strong> All digital submissions are routed via LandStack
              Common Data Hub and tracked under the Tamil Nadu Public Services Right to Services Act.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              Submit Application & Generate Application ID
            </button>
          </form>
        </div>
      )}

      {/* VIEW 3: ALL CITIZEN SERVICES CATALOG (Section 21 Requirement) */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Comprehensive Digital Land Governance Services Catalog
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              onClick={findLandAroundMe}
              className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
            >
              <MapPin className="w-5 h-5 text-indigo-600 mb-2.5" />
              <div className="font-bold text-sm text-slate-800">Find Land Around Me</div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Detect your physical GPS coordinates and spatially match the cadastral parcel on the digital cadastral layer.
              </p>
            </div>

            <div
              onClick={() => {
                const p = landService.getParcelById('TN-DEMO-1024');
                if (p) openParcel360(p);
              }}
              className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
            >
              <FileCheck2 className="w-5 h-5 text-blue-600 mb-2.5" />
              <div className="font-bold text-sm text-slate-800">Verify Ownership (RoR)</div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Execute cross-department match between Revenue Patta and SRO Registration deed.
              </p>
            </div>

            <div
              onClick={() => {
                const p = landService.getParcelById('TN-DEMO-1024');
                if (p) openParcel360(p);
              }}
              className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
            >
              <Building className="w-5 h-5 text-amber-600 mb-2.5" />
              <div className="font-bold text-sm text-slate-800">Building Permission Status</div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review sanctioned plan footprint, FSI allowance, and town planning approvals.
              </p>
            </div>

            <div
              onClick={() => {
                const p = landService.getParcelById('TN-DEMO-1024');
                if (p) openParcel360(p);
              }}
              className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
            >
              <Coins className="w-5 h-5 text-emerald-600 mb-2.5" />
              <div className="font-bold text-sm text-slate-800">Property Tax Ledger</div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Check assessment dues, previous receipts, and municipal corporation synchronization.
              </p>
            </div>

            <div
              onClick={() => {
                const p = landService.getParcelById('TN-DEMO-1027');
                if (p) openParcel360(p);
              }}
              className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
            >
              <Scale className="w-5 h-5 text-rose-600 mb-2.5" />
              <div className="font-bold text-sm text-slate-800">Litigation & Injunction Status</div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Search active civil and revenue court injunctions associated with the survey boundary.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('apply')}
              className="p-5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md"
            >
              <Send className="w-5 h-5 text-teal-600 mb-2.5" />
              <div className="font-bold text-sm text-slate-800">Submit Electronic Service Request</div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Initiate digital Patta transfer or Encumbrance Certificate requests.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
