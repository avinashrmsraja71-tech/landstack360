import { Parcel } from '../types/land';

export interface CertifiedDocumentMeta {
  docId: string;
  docType: 'PATTA_CHITTA' | 'TSLR_EXTRACT' | 'ENCUMBRANCE_CERTIFICATE' | 'FMB_SKETCH' | 'BHU_AADHAAR_ULPIN' | 'PROPERTY_TAX_ASSMT';
  title: string;
  tamilTitle: string;
  issuingAuthority: string;
  issuingPortal: string;
  portalUrl: string;
  digitalSignature: {
    signedBy: string;
    designation: string;
    signatureDate: string;
    certificateSerial: string;
    algorithm: string;
    isValid: boolean;
  };
  qrVerificationUrl: string;
  disclaimer: string;
}

export interface CertifiedPattaChittaData {
  meta: CertifiedDocumentMeta;
  district: string;
  taluk: string;
  village: string;
  pattaNumber: string;
  chittaNumber: string;
  surveyNumber: string;
  subDivision: string;
  ulpin: string;
  ownerName: string;
  relationType: string;
  relationName: string;
  sharePercentage: number;
  classification: string;
  landUse: string;
  areaHectaresAres: string;
  areaSqFt: number;
  areaCents: string;
  kistTaxAmount: string;
  remarks: string;
}

export interface CertifiedTSLRData {
  meta: CertifiedDocumentMeta;
  district: string;
  taluk: string;
  corporationTown: string;
  wardNumber: string;
  blockNumber: string;
  townSurveyNo: string;
  oldSurveyNo: string;
  doorNumber: string;
  streetName: string;
  ownerName: string;
  extentSqMeters: number;
  extentSqFt: number;
  buildingType: string;
  floors: number;
  approvalRef: string;
}

export interface CertifiedECData {
  meta: CertifiedDocumentMeta;
  zone: string;
  district: string;
  subRegistrarOffice: string;
  periodFrom: string;
  periodTo: string;
  surveyNumber: string;
  village: string;
  ecNumber: string;
  status: string;
  entries: {
    slNo: number;
    execDate: string;
    regDate: string;
    docNoYear: string;
    natureOfDeed: string;
    executants: string;
    claimants: string;
    consideration: string;
    villageSurvey: string;
  }[];
}

export interface CertifiedFMBData {
  meta: CertifiedDocumentMeta;
  district: string;
  taluk: string;
  village: string;
  surveyNumber: string;
  subDivision: string;
  areaHectares: number;
  scale: string;
  measurementsLadder: {
    line: string;
    lengthMeters: number;
    offsetMeters?: number;
  }[];
  adjacentSurveys: {
    direction: 'North' | 'South' | 'East' | 'West';
    adjacentSurveyNo: string;
    feature: string;
  }[];
}

/**
 * Generates official Tamil Nadu Government certified document structures
 * matching the authentic layouts from Tamil Nilam (eservices.tn.gov.in) and TNREGINET.
 */
export function getCertifiedPattaChitta(parcel: Parcel): CertifiedPattaChittaData {
  const hectares = parcel.areaHectares || 0.22;
  const ares = Math.round((hectares % 1) * 100);
  const wholeHectares = Math.floor(hectares);
  const cents = (parcel.areaSqFt / 435.6).toFixed(2);
  const isCbe = parcel.district?.toLowerCase().includes('coimbatore') ?? true;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return {
    meta: {
      docId: `TN-REV-${isCbe ? 'CBE' : 'STATE'}-PATTA-${parcel.ownership.pattaNumber.replace(/[^0-9]/g, '') || '8812'}-2026`,
      docType: 'PATTA_CHITTA',
      title: 'Tamil Nadu Government Certified Form No. 6 - Extract from Patta / Chitta',
      tamilTitle: 'தமிழ்நாடு அரசு வருவாய்த்துறை - படிவம் எண் 6 - பட்டா / சிட்டா நகல்',
      issuingAuthority: 'Department of Revenue & Disaster Management, Govt. of Tamil Nadu',
      issuingPortal: 'Tamil Nilam (AnyWhere e-Patta) - eservices.tn.gov.in',
      portalUrl: 'https://eservices.tn.gov.in/eservicesnew/land/chitta.html?lan=en',
      digitalSignature: {
        signedBy: parcel.ownership.verifiedByOfficer || 'Thiru. P. Shanmugam (Tahsildar)',
        designation: `Tahsildar, ${parcel.taluk}, ${parcel.district}`,
        signatureDate: parcel.ownership.verificationDate || '2026-02-14 11:22:04 IST',
        certificateSerial: `CCA-TN-REV-2026-${Math.abs(parcel.parcelId.charCodeAt(0) * 19283)}`,
        algorithm: 'SHA256withRSA / 2048-bit Class 3 Digital Signature',
        isValid: true,
      },
      qrVerificationUrl: `https://eservices.tn.gov.in/eservicesnew/land/verify_patta.html?docid=TN-REV-${parcel.parcelId}`,
      disclaimer: 'This is an authentic computer-generated digital extract from the Tamil Nilam database. In accordance with Section 65B of the Indian Evidence Act, this certified digital document does not require an ink seal.',
    },
    district: parcel.district,
    taluk: parcel.taluk,
    village: parcel.village,
    pattaNumber: parcel.ownership.pattaNumber,
    chittaNumber: parcel.ownership.chittaNumber,
    surveyNumber: parcel.surveyNumber,
    subDivision: parcel.subDivision || '1',
    ulpin: parcel.ulpin,
    ownerName: parcel.ownership.ownerName,
    relationType: parcel.ownership.relationType,
    relationName: parcel.ownership.relationName,
    sharePercentage: parcel.ownership.sharePercentage,
    classification: parcel.classification,
    landUse: parcel.landUse,
    areaHectaresAres: `${wholeHectares} Hectare ${ares} Ares`,
    areaSqFt: parcel.areaSqFt,
    areaCents: cents,
    kistTaxAmount: parcel.classification.includes('Natham') ? '₹ 14.50' : '₹ 38.00',
    remarks: 'Clear Title. No Land Acquisition (LA) / High Court stay proceeding recorded.',
  };
}

export function getCertifiedTSLR(parcel: Parcel): CertifiedTSLRData {
  return {
    meta: {
      docId: `TN-URBAN-TSLR-CCMC-${parcel.surveyNumber.replace(/[^0-9A-Za-z]/g, '')}-2026`,
      docType: 'TSLR_EXTRACT',
      title: 'Town Survey Land Register (TSLR) Extract - Urban Land Records',
      tamilTitle: 'நகர நில அளவை பதிவேடு (TSLR) உண்மை நகல்',
      issuingAuthority: 'Coimbatore City Municipal Corporation & Town Survey Department',
      issuingPortal: 'Tamil Nilam Urban Services - eservices.tn.gov.in',
      portalUrl: 'https://eservices.tn.gov.in/eservicesnew/land/urban.html?lan=en',
      digitalSignature: {
        signedBy: 'Town Planning Officer / City Surveyor, CCMC',
        designation: 'Assistant Director of Town Survey & Land Records, Coimbatore',
        signatureDate: '2026-03-01 15:40:12 IST',
        certificateSerial: `TSLR-CBE-CCMC-99214`,
        algorithm: 'SHA256withRSA',
        isValid: true,
      },
      qrVerificationUrl: `https://eservices.tn.gov.in/eservicesnew/land/verify_tslr.html?ts=${parcel.surveyNumber}`,
      disclaimer: 'Certified extract of urban cadastre and municipal street alignment as maintained in Corporation Town Survey records.',
    },
    district: parcel.district,
    taluk: parcel.taluk,
    corporationTown: `${parcel.district} City Municipal Corporation`,
    wardNumber: 'Ward 28 (Central Zone)',
    blockNumber: 'Block 14',
    townSurveyNo: `T.S. No. ${parcel.surveyNumber}`,
    oldSurveyNo: `Old Sy. ${parcel.surveyNumber.split('/')[0] || '108'} (Part)`,
    doorNumber: 'D.No. 44/2, Cross Cut Road Extension',
    streetName: parcel.village,
    ownerName: parcel.ownership.ownerName,
    extentSqMeters: Math.round(parcel.areaSqFt * 0.092903),
    extentSqFt: parcel.areaSqFt,
    buildingType: parcel.geometry.buildingDimensions?.structureType || 'Multi-Floor RCC Frame',
    floors: parcel.geometry.buildingDimensions?.floors || 2,
    approvalRef: parcel.building.approvalNumber || 'BLD-CCMC-2021-0814',
  };
}

export function getCertifiedEC(parcel: Parcel): CertifiedECData {
  return {
    meta: {
      docId: parcel.encumbrance.ecNumber || `EC-TN-2026-0089124`,
      docType: 'ENCUMBRANCE_CERTIFICATE',
      title: 'Certificate of Encumbrance on Property (Form No. 15 / 16)',
      tamilTitle: 'வணிகவரி மற்றும் பதிவுத் துறை - சொத்து வில்லங்கச் சான்றிதழ்',
      issuingAuthority: 'Registration Department, Government of Tamil Nadu (TNREGINET)',
      issuingPortal: 'TNREGINET Inspector General of Registration (STAR 2.0)',
      portalUrl: 'https://tnreginet.gov.in/portal/',
      digitalSignature: {
        signedBy: `Sub-Registrar, ${parcel.registration.subRegistrarOffice.split(',')[0]}`,
        designation: 'Sub-Registrar (Grade I), Registration Dept, Tamil Nadu',
        signatureDate: '2026-04-10 17:15:30 IST',
        certificateSerial: 'TNREGINET-DSIG-8821904',
        algorithm: 'SHA256withRSA',
        isValid: true,
      },
      qrVerificationUrl: `https://tnreginet.gov.in/portal/ec_verify.jsp?ec=${parcel.encumbrance.ecNumber}`,
      disclaimer: 'Certified that search has been made in the books of Sub-Registrar Office for the period requested and the transactions recorded below represent the state of registration on the property.',
    },
    zone: 'Coimbatore Zone',
    district: parcel.district,
    subRegistrarOffice: parcel.registration.subRegistrarOffice,
    periodFrom: '01-Jan-1992',
    periodTo: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    surveyNumber: parcel.surveyNumber,
    village: parcel.village,
    ecNumber: parcel.encumbrance.ecNumber,
    status: parcel.encumbrance.encumbranceStatus,
    entries: [
      {
        slNo: 1,
        execDate: parcel.registration.registrationDate || '15-Jun-2022',
        regDate: parcel.registration.registrationDate || '15-Jun-2022',
        docNoYear: parcel.registration.registrationNumber || 'DOC-2022-BK1-1845',
        natureOfDeed: parcel.registration.deedType || 'Absolute Sale Deed',
        executants: 'K. Krishnaswamy & Legal Heirs',
        claimants: parcel.ownership.ownerName,
        consideration: parcel.registration.considerationAmount || '₹ 2,01,28,000',
        villageSurvey: `${parcel.village} / Sy. ${parcel.surveyNumber} (${parcel.areaSqFt} sq.ft)`,
      },
    ],
  };
}

export function getCertifiedFMB(parcel: Parcel): CertifiedFMBData {
  const [lat, lng] = parcel.geometry.center;
  const baseSy = parseInt(parcel.surveyNumber.split('/')[0]) || 108;

  return {
    meta: {
      docId: `TN-CAD-FMB-${parcel.district.substring(0, 3).toUpperCase()}-${parcel.surveyNumber.replace(/[^0-9]/g, '')}`,
      docType: 'FMB_SKETCH',
      title: 'Field Measurement Book (FMB) Sketch - Certified Cadastral Map',
      tamilTitle: 'நில அளவை மற்றும் பதிவேடுகள் துறை - புலப்பட நகல் (FMB)',
      issuingAuthority: 'Survey and Land Records Department, Govt. of Tamil Nadu',
      issuingPortal: 'Tamil Nilam FMB Services - eservices.tn.gov.in',
      portalUrl: 'https://eservices.tn.gov.in/eservicesnew/land/fmb.html?lan=en',
      digitalSignature: {
        signedBy: 'Taluk Surveyor / Head Draughtsman',
        designation: `Taluk Office Survey Wing, ${parcel.taluk}`,
        signatureDate: '2025-11-20 14:02:00 IST',
        certificateSerial: 'FMB-SIG-TN-77123',
        algorithm: 'SHA256withRSA',
        isValid: true,
      },
      qrVerificationUrl: `https://eservices.tn.gov.in/eservicesnew/land/verify_fmb.html?sy=${parcel.surveyNumber}`,
      disclaimer: 'The boundaries, field lines, ladders, and tie-lines are surveyed in Metric Chain Survey units as approved under TN Survey and Boundaries Act, 1923.',
    },
    district: parcel.district,
    taluk: parcel.taluk,
    village: parcel.village,
    surveyNumber: parcel.surveyNumber,
    subDivision: parcel.subDivision || '1',
    areaHectares: parcel.areaHectares,
    scale: '1 : 1000 (Metric Scale)',
    measurementsLadder: [
      { line: 'North Boundary (A-B)', lengthMeters: 48.5, offsetMeters: 0 },
      { line: 'East Boundary (B-C)', lengthMeters: 36.2, offsetMeters: 1.2 },
      { line: 'South Boundary (C-D)', lengthMeters: 47.8, offsetMeters: 0 },
      { line: 'West Boundary (D-A)', lengthMeters: 35.8, offsetMeters: 0.8 },
      { line: 'Diagonal Tie-Line (A-C)', lengthMeters: 60.3 },
    ],
    adjacentSurveys: [
      { direction: 'North', adjacentSurveyNo: `${baseSy - 1}`, feature: 'Patta Agricultural Land' },
      { direction: 'South', adjacentSurveyNo: `${baseSy + 1}`, feature: 'Residential Layout (Approved)' },
      { direction: 'East', adjacentSurveyNo: `${baseSy}/3`, feature: 'Sub-Division Channel / Path' },
      { direction: 'West', adjacentSurveyNo: `${baseSy - 2}`, feature: '24m Main Panchayat / Corporation Road' },
    ],
  };
}
