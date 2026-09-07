import { Parcel, CitizenApplication, FieldReport } from '../types/land';
import { MOCK_PARCELS, MOCK_APPLICATIONS, MOCK_FIELD_REPORTS } from '../data/mockParcels';

const PARCELS_STORAGE_KEY = 'landstack_parcels_v1';
const APPS_STORAGE_KEY = 'landstack_apps_v1';
const REPORTS_STORAGE_KEY = 'landstack_reports_v1';
const AUDIT_STORAGE_KEY = 'landstack_audit_v1';

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: string;
  action: string;
  parcelId: string;
  details: string;
}

// Haversine formula to compute distance in meters between two lat/lng points
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

class LandService {
  private parcels: Parcel[] = [];
  private applications: CitizenApplication[] = [];
  private fieldReports: FieldReport[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedParcels = localStorage.getItem(PARCELS_STORAGE_KEY);
      if (savedParcels) {
        const parsed: Parcel[] = JSON.parse(savedParcels);
        // Ensure new Coimbatore parcels from MOCK_PARCELS are merged in
        const existingIds = new Set(parsed.map((p) => p.parcelId));
        const missing = MOCK_PARCELS.filter((p) => !existingIds.has(p.parcelId));
        this.parcels = [...missing, ...parsed];
      } else {
        this.parcels = [...MOCK_PARCELS];
      }

      const savedApps = localStorage.getItem(APPS_STORAGE_KEY);
      this.applications = savedApps ? JSON.parse(savedApps) : [...MOCK_APPLICATIONS];

      const savedReports = localStorage.getItem(REPORTS_STORAGE_KEY);
      this.fieldReports = savedReports ? JSON.parse(savedReports) : [...MOCK_FIELD_REPORTS];

      const savedAudit = localStorage.getItem(AUDIT_STORAGE_KEY);
      this.auditLogs = savedAudit
        ? JSON.parse(savedAudit)
        : [
            {
              id: 'aud-1',
              timestamp: '2026-09-05 16:30:12',
              userRole: 'admin',
              action: 'Satellite AI Alert Generated',
              parcelId: 'TN-CBE-1001',
              details: 'AI Model identified cross-cut road commercial frontage verification.',
            },
            {
              id: 'aud-2',
              timestamp: '2026-09-05 14:12:00',
              userRole: 'officer',
              action: 'Field Inspection Dispatched',
              parcelId: 'TN-CBE-1003',
              details: 'Avinashi Road IT SEZ setback clearance survey approved.',
            },
          ];
    } catch {
      this.parcels = [...MOCK_PARCELS];
      this.applications = [...MOCK_APPLICATIONS];
      this.fieldReports = [...MOCK_FIELD_REPORTS];
      this.auditLogs = [];
    }
  }

  private persist() {
    try {
      localStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(this.parcels));
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(this.applications));
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(this.fieldReports));
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  public getAllParcels(): Parcel[] {
    return [...this.parcels];
  }

  public registerLiveLocationParcels(liveParcel: Parcel, surroundingParcels: Parcel[] = []) {
    // Remove previous live/surrounding parcels to avoid duplicate buildup
    const existing = this.parcels.filter(
      (p) => !p.parcelId.startsWith('LIVE-') && !p.parcelId.startsWith('SURR-')
    );
    this.parcels = [liveParcel, ...surroundingParcels, ...existing];
    this.persist();
  }

  public addParcel(parcel: Parcel) {
    const existingIndex = this.parcels.findIndex((p) => p.parcelId === parcel.parcelId);
    if (existingIndex >= 0) {
      this.parcels[existingIndex] = parcel;
    } else {
      this.parcels = [parcel, ...this.parcels];
    }
    this.persist();
  }

  public getParcelById(idOrUlpinOrPatta: string): Parcel | undefined {
    const term = idOrUlpinOrPatta.trim().toLowerCase();
    return this.parcels.find(
      (p) =>
        p.parcelId.toLowerCase() === term ||
        p.ulpin.toLowerCase() === term ||
        p.surveyNumber.toLowerCase() === term ||
        p.ownership.pattaNumber.toLowerCase() === term ||
        p.ownership.pattaNumber.toLowerCase().includes(term) ||
        p.surveyNumber.toLowerCase().replace(/\s+/g, '') === term.replace(/\s+/g, '')
    );
  }

  public findNearestParcel(lat: number, lng: number): { parcel: Parcel; distanceMeters: number } {
    let nearest = this.parcels[0];
    let minDistance = Infinity;

    for (const parcel of this.parcels) {
      const dist = calculateDistanceMeters(lat, lng, parcel.geometry.center[0], parcel.geometry.center[1]);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = parcel;
      }
    }

    return { parcel: nearest, distanceMeters: minDistance };
  }

  public findParcelsAround(lat: number, lng: number, maxRadiusMeters: number = 5000): { parcel: Parcel; distanceMeters: number }[] {
    const list = this.parcels.map((parcel) => {
      const dist = calculateDistanceMeters(lat, lng, parcel.geometry.center[0], parcel.geometry.center[1]);
      return { parcel, distanceMeters: dist };
    });

    list.sort((a, b) => a.distanceMeters - b.distanceMeters);
    const withinRadius = list.filter((item) => item.distanceMeters <= maxRadiusMeters);
    if (withinRadius.length > 0) {
      return withinRadius;
    }
    // Return closest parcels in the same district/metro area up to 35km
    return list.filter((item) => item.distanceMeters <= 35000).slice(0, 5);
  }

  public searchParcels(query: string): Parcel[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return this.parcels.filter(
      (p) =>
        p.parcelId.toLowerCase().includes(q) ||
        p.ulpin.toLowerCase().includes(q) ||
        p.surveyNumber.toLowerCase().includes(q) ||
        p.ownership.pattaNumber.toLowerCase().includes(q) ||
        p.ownership.ownerName.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.landUse.toLowerCase().includes(q)
    );
  }

  public getApplications(): CitizenApplication[] {
    return [...this.applications];
  }

  public getApplicationById(id: string): CitizenApplication | undefined {
    return this.applications.find((a) => a.id.toLowerCase() === id.toLowerCase());
  }

  public submitApplication(appData: Omit<CitizenApplication, 'id' | 'submittedDate' | 'currentStage' | 'stageIndex' | 'status' | 'assignedOfficer'>): CitizenApplication {
    const newId = `LS-2026-${String(Math.floor(10000 + Math.random() * 90000)).slice(-5)}`;
    const newApp: CitizenApplication = {
      ...appData,
      id: newId,
      submittedDate: new Date().toISOString().split('T')[0],
      currentStage: 'Application Submitted',
      stageIndex: 0,
      status: 'In Progress',
      assignedOfficer: 'Thiru. R. Venkatesh (Tahsildar)',
      remarks: 'Application initiated through Citizen Digital LandStack portal.',
    };

    this.applications.unshift(newApp);
    this.addAuditLog('citizen', 'Submitted Citizen Application', newApp.parcelId, `Application ${newId} created for ${newApp.applicationType}`);
    this.persist();
    return newApp;
  }

  public getFieldReports(): FieldReport[] {
    return [...this.fieldReports];
  }

  public submitFieldReport(reportData: Omit<FieldReport, 'id' | 'timestamp' | 'status'>): FieldReport {
    const newId = `REP-2026-${String(Math.floor(10000 + Math.random() * 90000)).slice(-5)}`;
    const newReport: FieldReport = {
      ...reportData,
      id: newId,
      timestamp: new Date().toLocaleString(),
      status: 'Submitted',
    };

    this.fieldReports.unshift(newReport);
    this.addAuditLog('field_officer', 'Field Inspection Report Filed', newReport.parcelId, `Report ${newId} filed: ${newReport.issueType}`);
    this.persist();
    return newReport;
  }

  public updateApplicationStatus(
    appId: string,
    status: CitizenApplication['status'],
    stageIndex?: number,
    remarks?: string
  ): CitizenApplication | undefined {
    const app = this.applications.find((a) => a.id === appId);
    if (!app) return undefined;
    app.status = status;
    if (stageIndex !== undefined) app.stageIndex = stageIndex;
    if (remarks) app.remarks = remarks;
    this.addAuditLog('officer', `Updated Application ${appId} Status`, app.parcelId, `Status set to ${status}. ${remarks || ''}`);
    this.persist();
    return app;
  }

  public reviewParcelAlert(
    parcelId: string,
    action: 'Approve' | 'Reject' | 'Request Field Inspection' | 'Issue Notice' | 'Notice Issued' | 'Conforming Verified' | 'Dismiss Alert',
    comments: string,
    reviewer: string
  ): Parcel | undefined {
    const parcel = this.parcels.find((p) => p.parcelId === parcelId);
    if (!parcel) return undefined;

    if (action === 'Approve' || action === 'Conforming Verified' || action === 'Dismiss Alert') {
      parcel.satelliteAi.alertStatus = 'Resolved / Cleared';
    } else if (action === 'Issue Notice' || action === 'Notice Issued') {
      parcel.satelliteAi.alertStatus = 'Notice Issued';
    } else if (action === 'Request Field Inspection') {
      parcel.satelliteAi.alertStatus = 'Officer Assigned';
    }

    this.addAuditLog('officer', `Parcel AI Alert Review: ${action}`, parcelId, `${comments} (Reviewed by ${reviewer})`);
    this.persist();
    return parcel;
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public addAuditLog(userRole: string, action: string, parcelId: string, details: string) {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userRole,
      action,
      parcelId,
      details,
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 50) this.auditLogs.pop();
    this.persist();
  }

  public resetToDefaults() {
    this.parcels = [...MOCK_PARCELS];
    this.applications = [...MOCK_APPLICATIONS];
    this.fieldReports = [...MOCK_FIELD_REPORTS];
    this.auditLogs = [];
    localStorage.removeItem(PARCELS_STORAGE_KEY);
    localStorage.removeItem(APPS_STORAGE_KEY);
    localStorage.removeItem(REPORTS_STORAGE_KEY);
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  }
}

export const landService = new LandService();
