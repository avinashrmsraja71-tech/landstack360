import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  FileCheck2,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Eye,
  Filter,
  Check,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { landService } from '../services/landService';
import { CitizenApplication } from '../types/land';

export const AdminPage: React.FC = () => {
  const { openParcel360, setSelectedParcel, role } = useApp();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'applications' | 'audit'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const parcels = landService.getAllParcels();
  const applications = landService.getApplications();
  const auditLogs = landService.getAuditLogs();

  const highRiskParcels = parcels.filter((p) => p.risk.overallScore >= 50);
  const pendingApps = applications.filter((a) => a.status === 'In Progress' || a.status === 'Needs Clarification');
  const aiAlerts = parcels.filter((p) => p.satelliteAi.hasAlert);

  const handleUpdateAppStatus = (appId: string, newStatus: CitizenApplication['status']) => {
    landService.updateApplicationStatus(
      appId,
      newStatus,
      newStatus === 'Approved' ? 5 : 3,
      `Status updated by ${role.toUpperCase()} in Government Admin Console.`
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-8 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Government Land Administration Hub</h1>
              <p className="text-xs text-slate-400">
                Departmental control room for Revenue, Registration (SRO), and Town Planning authorities.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              selectedTab === 'overview' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('applications')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              selectedTab === 'applications' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setSelectedTab('audit')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              selectedTab === 'audit' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span>High-Risk Parcels</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">{highRiskParcels.length}</div>
          <span className="text-[10px] text-slate-400">Requires Title Review</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span>Pending Services</span>
            <FileCheck2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{pendingApps.length}</div>
          <span className="text-[10px] text-slate-400">Awaiting Cross-Verification</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span>Satellite Alerts</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 mt-2">{aiAlerts.length}</div>
          <span className="text-[10px] text-slate-400">Active Temporal Anomaly</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span>Field Dispatches</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">4</div>
          <span className="text-[10px] text-slate-400">Surveyors in Transit</span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Risk Parcels Priority Queue */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>High-Risk Cadastral Priority Queue</span>
              </h3>
              <span className="text-[10px] text-slate-400">Score &gt;= 50</span>
            </div>

            <div className="space-y-2.5">
              {highRiskParcels.map((parcel) => (
                <div
                  key={parcel.parcelId}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">{parcel.parcelId}</span>
                      <span className="text-white font-semibold">{parcel.ownership.ownerName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sy {parcel.surveyNumber} • {parcel.village} • {parcel.landUse}
                    </p>
                    <div className="text-[10px] text-rose-400 mt-1">
                      {parcel.restrictions.courtCaseDetails || parcel.satelliteAi.changeSummary}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 text-xs">
                      {parcel.risk.overallScore}/100 Risk
                    </span>
                    <button
                      onClick={() => {
                        setSelectedParcel(parcel);
                        openParcel360(parcel);
                      }}
                      className="mt-2 block text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Inspect 360° →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Citizen Workflow Queue */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>Citizen Requests Awaiting Officer Action</span>
              </h3>
              <span className="text-[10px] text-slate-400">{pendingApps.length} Action Items</span>
            </div>

            <div className="space-y-2.5">
              {pendingApps.map((app) => (
                <div
                  key={app.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">{app.id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        {app.status}
                      </span>
                    </div>
                    <div className="font-semibold text-white mt-1">{app.applicationType}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Applicant: {app.applicantName} • Target: <span className="font-mono text-emerald-400">{app.parcelId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateAppStatus(app.id, 'Approved')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold shadow"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateAppStatus(app.id, 'Rejected')}
                      className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded text-[11px] border border-rose-800"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATIONS MANAGEMENT */}
      {selectedTab === 'applications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-white">Full Citizen Service Applications Registry</h3>
            <div className="flex gap-1.5 text-xs">
              {['ALL', 'Under Review', 'In Progress', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    statusFilter === status
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Application ID</th>
                  <th className="p-3">Service Type</th>
                  <th className="p-3">Applicant</th>
                  <th className="p-3">Target Parcel</th>
                  <th className="p-3">Assigned Officer</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {applications
                  .filter((a) => statusFilter === 'ALL' || a.status === statusFilter)
                  .map((app) => (
                    <tr key={app.id} className="hover:bg-slate-850/50">
                      <td className="p-3 font-mono font-bold text-emerald-400">{app.id}</td>
                      <td className="p-3 font-semibold text-white">{app.applicationType}</td>
                      <td className="p-3">
                        <div>{app.applicantName}</div>
                        <div className="text-[10px] text-slate-500">{app.applicantPhone}</div>
                      </td>
                      <td className="p-3 font-mono text-emerald-400">{app.parcelId}</td>
                      <td className="p-3 text-slate-300">{app.assignedOfficer}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.status === 'Approved'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : app.status === 'Rejected'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'Approved')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'Needs Clarification')}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px]"
                          >
                            Query
                          </button>
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'Rejected')}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded text-[10px]"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL LOG */}
      {selectedTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Immutable System Action & Mutation Audit Log</h3>
            <span className="text-xs text-slate-400">Total Entries: {auditLogs.length}</span>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-emerald-400 font-bold">{log.parcelId}</span>
                    <span className="font-semibold text-white">{log.action}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded uppercase">
                      {log.userRole}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{log.details}</p>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono flex-shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
