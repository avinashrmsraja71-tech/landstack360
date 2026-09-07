export type LandClassification = 'Wetland (Nanjai)' | 'Dryland (Punjai)' | 'Natham' | 'Poramboke (Govt)' | 'Commercial';
export type LandUseType = 'Residential' | 'Commercial' | 'Agricultural' | 'Industrial' | 'Mixed Use' | 'Government / Protected';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'citizen' | 'officer' | 'admin' | 'field_officer';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ParcelGeometry {
  type: 'Polygon';
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  center: [number, number];
  buildingCoordinates?: [number, number][]; // [lat, lng] polygon for clear building footprint
  buildingDimensions?: {
    widthMeters: number;
    lengthMeters: number;
    floors: number;
    structureType: string;
    builtUpAreaSqFt: number;
  };
}

export interface OwnershipRecord {
  ownerName: string;
  relationType: 'S/o' | 'D/o' | 'W/o' | 'Rep by';
  relationName: string;
  sharePercentage: number;
  aadhaarMasked: string;
  pattaNumber: string;
  chittaNumber: string;
  recordStatus: 'Active & Verified' | 'Verification Pending' | 'Under Mutation' | 'Disputed';
  verificationDate: string;
  verifiedByOfficer: string;
  isConsistent: boolean;
}

export interface RegistrationRecord {
  registrationNumber: string;
  subRegistrarOffice: string;
  bookNumber: string;
  registrationDate: string;
  deedType: 'Sale Deed' | 'Partition Deed' | 'Gift Deed' | 'Settlement Deed' | 'Inheritance';
  considerationAmount: string;
  guidelineValue: string;
  latestTransactionDate: string;
}

export interface EncumbranceRecord {
  hasMortgage: boolean;
  bankName?: string;
  loanAccountNumber?: string;
  mortgageAmount?: string;
  chargeDate?: string;
  encumbranceStatus: 'Nil Encumbrance' | 'Active Mortgage' | 'Court Attachment' | 'Bank Lien';
  totalLiabilities: number;
  ecNumber: string;
  periodCovered: string;
}

export interface PropertyTaxRecord {
  assessmentNumber: string;
  localBodyName: string; // e.g. "Tiruchirappalli City Corporation"
  annualTax: number;
  lastPaymentDate: string;
  lastPaidReceipt: string;
  paymentStatus: 'Paid in Full' | 'Pending Current Year' | 'Arrears Outstanding';
  outstandingAmount: number;
  penaltyAmount: number;
}

export interface BuildingPermissionRecord {
  hasPermission: boolean;
  approvalNumber?: string;
  sanctioningAuthority?: string; // e.g. "DTCP / LPA"
  approvedAreaSqFt?: number;
  actualStructureSqFt?: number;
  floorsApproved?: number;
  approvalDate?: string;
  approvalStatus: 'Approved' | 'Pending Review' | 'Rejected' | 'No Permission Found' | 'Violation Detected';
  buildingType?: 'Residential Individual' | 'Commercial Complex' | 'Industrial Shed';
  fsiApproved?: number;
}

export interface ZoningRecord {
  zoneCategory: 'Residential (Primary)' | 'Residential (Mixed)' | 'Commercial Corridor' | 'Special Industrial' | 'Agricultural Green Belt' | 'Water Catchment Buffer';
  masterPlan: string;
  permittedUses: string[];
  roadWidthMeters: number;
  setbackRequiredMeters: number;
  heightPermittedMeters: number;
  isNOCRequired: boolean;
}

export interface RestrictionsAndDisputes {
  isGovernmentLand: boolean;
  isTempleLand: boolean; // HR&CE
  isWakfLand: boolean;
  isWaterBodyBuffer: boolean;
  isCoastalZone: boolean;
  activeCourtCases: number;
  courtCaseDetails?: string;
  disputeStatus: 'Clean Title' | 'Active Litigation' | 'Boundary Injunction' | 'Revenue Appeal Pending';
}

export interface RiskAnalysis {
  overallScore: number; // 0 (safest) to 100 (highest risk)
  riskLevel: RiskLevel;
  breakdown: {
    ownershipRisk: number; // 0 - 25
    encumbranceRisk: number; // 0 - 25
    planningAndZoningRisk?: number; // 0 - 20
    environmentalRisk: number; // 0 - 15
    disputeRisk?: number; // 0 - 15
    buildingRisk?: number;
    zoningRisk?: number;
  };
  keyWarnings: string[];
  safeToBuyRecommendation: 'Recommended' | 'Proceed with Caution' | 'High Risk - Legal Review Mandatory';
  flaggedIssues?: string[];
}

export interface TimelineEvent {
  id: string;
  year: number;
  date: string;
  eventType: 'Registration' | 'Patta Mutation' | 'Mortgage' | 'Mortgage Release' | 'Building Approval' | 'Inspection' | 'Tax Assessment';
  title: string;
  description: string;
  department: 'Revenue' | 'Registration' | 'Urban Planning' | 'Banking' | 'Local Body';
  documentRef?: string;
}

export interface SatelliteAiAnalysis {
  hasAlert: boolean;
  alertType?: 'Unauthorized Construction' | 'Encroachment into Buffer' | 'Illegal Land Filling' | 'Vegetation Loss';
  confidenceScore: number; // e.g. 89% (Simulated AI Result)
  approvedFootprintSqFt: number;
  detectedFootprintSqFt: number;
  differenceSqFt: number;
  historicalYear: 2023;
  currentYear: 2026;
  historicalLandCover: string;
  currentLandCover: string;
  changeSummary: string;
  alertStatus: 'Pending Review' | 'Officer Assigned' | 'Resolved / Cleared' | 'Notice Issued';
}

export interface Parcel {
  parcelId: string; // e.g. "TN-DEMO-1024"
  ulpin: string; // e.g. "ULPIN-TN-33-014-1024"
  surveyNumber: string; // e.g. "142/3A"
  subDivision: string; // e.g. "3A"
  district: string; // e.g. "Tiruchirappalli"
  taluk: string; // e.g. "Srirangam"
  village: string; // e.g. "Malliampathu"
  areaHectares: number;
  areaSqFt: number;
  classification: LandClassification;
  landUse: LandUseType;
  geometry: ParcelGeometry;
  ownership: OwnershipRecord;
  registration: RegistrationRecord;
  encumbrance: EncumbranceRecord;
  tax: PropertyTaxRecord;
  building: BuildingPermissionRecord;
  zoning: ZoningRecord;
  restrictions: RestrictionsAndDisputes;
  risk: RiskAnalysis;
  satelliteAi: SatelliteAiAnalysis;
  timeline: TimelineEvent[];
  utilities: {
    electricityConnected: boolean;
    waterPipelineAccess: boolean;
    sewerageConnection: boolean;
    stormWaterDrain: boolean;
    broadbandFiber: boolean;
  };
}

export interface CitizenApplication {
  id: string;
  applicationType: 'Ownership Verification' | 'Patta Mutation' | 'Encumbrance Certificate' | 'Building NOC' | 'Land Use Certificate';
  parcelId: string;
  ulpin: string;
  applicantName: string;
  applicantPhone: string;
  submittedDate: string;
  currentStage: 'Application Submitted' | 'Document Validation' | 'Revenue Verification' | 'Registration Cross-Check' | 'Final Approval';
  stageIndex: number; // 0 to 4
  status: 'In Progress' | 'Approved' | 'Needs Clarification' | 'Rejected';
  assignedOfficer: string;
  remarks: string;
}

export interface FieldReport {
  id: string;
  parcelId: string;
  ulpin: string;
  officerName: string;
  officerId: string;
  gpsLocation: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  issueType: 'Encroachment' | 'Unauthorized Construction' | 'Boundary Conflict' | 'Land Use Violation' | 'Buffer Zone Violation' | 'Routine Inspection';
  description: string;
  photoUrl?: string;
  timestamp: string;
  status: 'Submitted' | 'Under Investigation' | 'Notice Dispatched';
  distanceFromBoundaryMeters: number;
}
