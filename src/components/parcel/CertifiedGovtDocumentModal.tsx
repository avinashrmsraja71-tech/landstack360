import React, { useState } from 'react';
import { Parcel } from '../../types/land';
import {
  getCertifiedPattaChitta,
  getCertifiedTSLR,
  getCertifiedEC,
  getCertifiedFMB,
} from '../../services/certifiedGovtDocumentService';
import {
  X,
  Printer,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  QrCode,
  Landmark,
  FileText,
  Compass,
  Building,
  FileCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface CertifiedGovtDocumentModalProps {
  parcel: Parcel;
  isOpen: boolean;
  onClose: () => void;
}

type DocType = 'PATTA_CHITTA' | 'TSLR' | 'EC' | 'FMB';

export const CertifiedGovtDocumentModal: React.FC<CertifiedGovtDocumentModalProps> = ({
  parcel,
  isOpen,
  onClose,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocType>('PATTA_CHITTA');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pattaData = getCertifiedPattaChitta(parcel);
  const tslrData = getCertifiedTSLR(parcel);
  const ecData = getCertifiedEC(parcel);
  const fmbData = getCertifiedFMB(parcel);

  const handleCopyDetails = () => {
    const text = `Government of Tamil Nadu Land Record:\nDistrict: ${parcel.district}\nTaluk: ${parcel.taluk}\nVillage: ${parcel.village}\nSurvey No: ${parcel.surveyNumber}\nPatta No: ${parcel.ownership.pattaNumber}\nOwner: ${parcel.ownership.ownerName}\nULPIN: ${parcel.ulpin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Certified Government Land Records</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-full">
                  Official Format
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Department of Revenue & Registration • Government of Tamil Nadu (Tamil Nilam)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDetails}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Copy Survey & Patta parameters"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Info'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Print certified document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Switcher Tabs */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold text-[11px] uppercase mr-1">Select Document:</span>
          <button
            onClick={() => setSelectedDoc('PATTA_CHITTA')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              selectedDoc === 'PATTA_CHITTA'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Form 6 - Patta / Chitta (பட்டா)</span>
          </button>
          <button
            onClick={() => setSelectedDoc('TSLR')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              selectedDoc === 'TSLR'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>TSLR Urban Extract</span>
          </button>
          <button
            onClick={() => setSelectedDoc('EC')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              selectedDoc === 'EC'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encumbrance Cert (EC)</span>
          </button>
          <button
            onClick={() => setSelectedDoc('FMB')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              selectedDoc === 'FMB'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>FMB Cadastral Sketch</span>
          </button>
        </div>

        {/* Live Portal Notification Strip */}
        <div className="px-5 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Official Government Database Server:{' '}
              <strong className="underline">Tamil Nilam (eservices.tn.gov.in)</strong> &{' '}
              <strong className="underline">TNREGINET (tnreginet.gov.in)</strong>
            </span>
          </div>
          <a
            href={
              selectedDoc === 'PATTA_CHITTA'
                ? pattaData.meta.portalUrl
                : selectedDoc === 'TSLR'
                ? tslrData.meta.portalUrl
                : selectedDoc === 'EC'
                ? ecData.meta.portalUrl
                : fmbData.meta.portalUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Open in TN Govt Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Scrollable Document Content Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          
          {/* A4 CERTIFICATE PAPER CONTAINER */}
          <div className="w-full max-w-3xl bg-white border-2 border-slate-300 shadow-xl rounded-sm p-6 sm:p-10 font-sans text-slate-900 relative">
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <div className="text-center">
                <div className="text-8xl font-black">GOVERNMENT OF TAMIL NADU</div>
                <div className="text-6xl font-bold mt-4">தமிழ்நாடு அரசு</div>
              </div>
            </div>

            {/* DOCUMENT 1: PATTA / CHITTA EXTRACT */}
            {selectedDoc === 'PATTA_CHITTA' && (
              <div className="space-y-6">
                {/* Official Govt Emblem & Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <div className="flex justify-center mb-1.5">
                    <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center bg-amber-50">
                      <Landmark className="w-8 h-8 text-slate-800" />
                    </div>
                  </div>
                  <h1 className="text-base sm:text-lg font-extrabold tracking-wide uppercase text-slate-900">
                    Government of Tamil Nadu
                  </h1>
                  <h2 className="text-sm sm:text-base font-bold text-slate-700">
                    தமிழ்நாடு அரசு வருவாய்த்துறை
                  </h2>
                  <p className="text-xs font-semibold text-slate-600">
                    Department of Revenue & Disaster Management • Commissionerate of Land Administration
                  </p>
                  <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-sm">
                    படிவம் எண் 6 - பட்டா / சிட்டா நகல் (Form No. 6 - Patta / Chitta Extract)
                  </div>
                </div>

                {/* Document Metadata Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 p-3 bg-slate-50 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">District (மாவட்டம்):</span>
                    <span className="font-bold text-slate-900">{pattaData.district}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Taluk (வட்டம்):</span>
                    <span className="font-bold text-slate-900">{pattaData.taluk}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Village (கிராமம்):</span>
                    <span className="font-bold text-slate-900">{pattaData.village}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Patta No (பட்டா எண்):</span>
                    <span className="font-extrabold text-emerald-700">{pattaData.pattaNumber}</span>
                  </div>
                </div>

                {/* Registered Land Owner / Pattadar Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                    1. Registered Pattadar Details (பட்டாதாரர் விவரங்கள்)
                  </h3>
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Sl.No</th>
                        <th className="p-2 border-r border-slate-300">Pattadar Name (பட்டாதாரர் பெயர்)</th>
                        <th className="p-2 border-r border-slate-300">Relationship & Relative Name</th>
                        <th className="p-2">Title Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 font-mono border-r border-slate-300">1</td>
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-300">
                          {pattaData.ownerName}
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          {pattaData.relationType} {pattaData.relationName}
                        </td>
                        <td className="p-2 font-semibold text-emerald-700">
                          {pattaData.sharePercentage}% (Sole Absolute)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Cadastral Land Measurement Schedule */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                    2. Cadastral Survey & Measurement Schedule (நில அளவை விவரங்கள்)
                  </h3>
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Survey No / Sub-Div</th>
                        <th className="p-2 border-r border-slate-300">Classification (வகைப்பாடு)</th>
                        <th className="p-2 border-r border-slate-300">Extent (Hec-Ares)</th>
                        <th className="p-2 border-r border-slate-300">Area (Sq.ft / Cents)</th>
                        <th className="p-2">Annual Kist (தீர்வை)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-300">
                          {pattaData.surveyNumber}
                        </td>
                        <td className="p-2 font-medium border-r border-slate-300">
                          {pattaData.classification} ({pattaData.landUse})
                        </td>
                        <td className="p-2 font-mono border-r border-slate-300">
                          {pattaData.areaHectaresAres}
                        </td>
                        <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-300">
                          {pattaData.areaSqFt.toLocaleString()} sq.ft ({pattaData.areaCents} Cents)
                        </td>
                        <td className="p-2 font-mono font-semibold text-slate-700">
                          {pattaData.kistTaxAmount}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bhu-Aadhaar & Geocoding Bar */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                      National Unique Land Parcel Identification (Bhu-Aadhaar)
                    </span>
                    <span className="font-mono text-xs font-extrabold text-emerald-950">{pattaData.ulpin}</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    Centroid: {parcel.geometry.center[0].toFixed(5)}° N, {parcel.geometry.center[1].toFixed(5)}° E
                  </div>
                </div>

                {/* Digital Signature & Legal Endorsement */}
                <div className="pt-4 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <QrCode className="w-4 h-4 text-slate-700" />
                      <span>Document ID: {pattaData.meta.docId}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {pattaData.meta.disclaimer}
                    </p>
                  </div>

                  <div className="border border-slate-300 p-3 bg-slate-50 rounded-sm text-right">
                    <div className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>DIGITALLY SIGNED</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {pattaData.meta.digitalSignature.signedBy}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {pattaData.meta.digitalSignature.designation}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Signed: {pattaData.meta.digitalSignature.signatureDate}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT 2: TSLR EXTRACT */}
            {selectedDoc === 'TSLR' && (
              <div className="space-y-6">
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <div className="flex justify-center mb-1.5">
                    <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center bg-indigo-50">
                      <Building className="w-8 h-8 text-slate-800" />
                    </div>
                  </div>
                  <h1 className="text-base sm:text-lg font-extrabold uppercase text-slate-900">
                    Town Survey Land Register (TSLR) Extract
                  </h1>
                  <h2 className="text-sm font-bold text-slate-700">
                    நகர நில அளவை பதிவேடு உண்மை நகல்
                  </h2>
                  <p className="text-xs text-slate-600">
                    {tslrData.corporationTown} • Town Planning & Land Survey Wing
                  </p>
                  <div className="mt-2 inline-block px-3 py-0.5 bg-indigo-900 text-white text-xs font-bold uppercase rounded-sm">
                    Urban Land & Street Alignment Record
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 p-3 bg-slate-50 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Corporation/Zone:</span>
                    <span className="font-bold">{tslrData.corporationTown}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ward & Block:</span>
                    <span className="font-bold">{tslrData.wardNumber}, {tslrData.blockNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Town Survey No:</span>
                    <span className="font-extrabold text-indigo-700">{tslrData.townSurveyNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Old Survey No:</span>
                    <span className="font-bold text-slate-700">{tslrData.oldSurveyNo}</span>
                  </div>
                </div>

                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Door No & Street</th>
                      <th className="p-2 border-r border-slate-300">Registered Owner</th>
                      <th className="p-2 border-r border-slate-300">Extent (Sq.M / Sq.Ft)</th>
                      <th className="p-2">Structure & Floors</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-r border-slate-300">
                        <div className="font-bold text-slate-900">{tslrData.doorNumber}</div>
                        <div className="text-slate-600">{tslrData.streetName}</div>
                      </td>
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-300">
                        {tslrData.ownerName}
                      </td>
                      <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-300">
                        {tslrData.extentSqMeters} m² ({tslrData.extentSqFt.toLocaleString()} sq.ft)
                      </td>
                      <td className="p-2 border-r border-slate-300">
                        <div className="font-semibold">{tslrData.buildingType}</div>
                        <div className="text-[11px] text-slate-500">Plan Ref: {tslrData.approvalRef}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="pt-4 border-t-2 border-slate-300 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <div>Document ID: {tslrData.meta.docId}</div>
                    <div className="text-[10px]">Verified against Corporation Digital Master Plan 2031</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{tslrData.meta.digitalSignature.signedBy}</div>
                    <div className="text-[11px] text-slate-600">{tslrData.meta.digitalSignature.designation}</div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT 3: ENCUMBRANCE CERTIFICATE (EC) */}
            {selectedDoc === 'EC' && (
              <div className="space-y-6">
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <div className="flex justify-center mb-1.5">
                    <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center bg-blue-50">
                      <ShieldCheck className="w-8 h-8 text-slate-800" />
                    </div>
                  </div>
                  <h1 className="text-base sm:text-lg font-extrabold uppercase text-slate-900">
                    Registration Department • Government of Tamil Nadu
                  </h1>
                  <h2 className="text-sm font-bold text-slate-700">
                    படிவம் 15 - சொத்து வில்லங்கச் சான்றிதழ் (Certificate of Encumbrance on Property)
                  </h2>
                  <p className="text-xs text-slate-600">
                    Inspector General of Registration • STAR 2.0 Digital Registry
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 p-3 bg-slate-50 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Zone & District:</span>
                    <span className="font-bold">{ecData.zone}, {ecData.district}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Sub-Registrar Office:</span>
                    <span className="font-bold">{ecData.subRegistrarOffice.split(',')[0]}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Search Period:</span>
                    <span className="font-bold">{ecData.periodFrom} to {ecData.periodTo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">EC Application No:</span>
                    <span className="font-extrabold text-blue-700">{ecData.ecNumber}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                    Schedule of Registered Transactions (பதிவு செய்யப்பட்ட ஆவணங்கள்)
                  </h3>
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Reg Date & Doc No</th>
                        <th className="p-2 border-r border-slate-300">Nature of Deed</th>
                        <th className="p-2 border-r border-slate-300">Executants & Claimants</th>
                        <th className="p-2 border-r border-slate-300">Property Description</th>
                        <th className="p-2">Consideration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ecData.entries.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-2 font-mono border-r border-slate-300">
                            <div className="font-bold text-slate-900">{item.docNoYear}</div>
                            <div className="text-[11px] text-slate-500">{item.regDate}</div>
                          </td>
                          <td className="p-2 font-bold text-slate-800 border-r border-slate-300">
                            {item.natureOfDeed}
                          </td>
                          <td className="p-2 border-r border-slate-300">
                            <div className="text-slate-600 text-[11px]">From: {item.executants}</div>
                            <div className="font-bold text-slate-900">To: {item.claimants}</div>
                          </td>
                          <td className="p-2 text-slate-700 border-r border-slate-300 text-[11px]">
                            {item.villageSurvey}
                          </td>
                          <td className="p-2 font-mono font-bold text-emerald-700">
                            {item.consideration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-sm flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Current Status: <strong className="text-emerald-800 font-bold">{ecData.status}</strong> (Zero outstanding Court Attachment / Bank Injunction)
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">STAR2-EC-CERTIFIED</span>
                </div>
              </div>
            )}

            {/* DOCUMENT 4: FMB SKETCH */}
            {selectedDoc === 'FMB' && (
              <div className="space-y-6">
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <div className="flex justify-center mb-1.5">
                    <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center bg-emerald-50">
                      <Compass className="w-8 h-8 text-slate-800" />
                    </div>
                  </div>
                  <h1 className="text-base sm:text-lg font-extrabold uppercase text-slate-900">
                    Field Measurement Book (FMB) Sketch
                  </h1>
                  <h2 className="text-sm font-bold text-slate-700">
                    புலப்பட நகல் (FMB) - நில அளவை வரைபடம்
                  </h2>
                  <p className="text-xs text-slate-600">
                    Survey & Land Records Department, Govt. of Tamil Nadu • Scale: {fmbData.scale}
                  </p>
                </div>

                {/* Cadastral Boundary Diagram Canvas / Vector */}
                <div className="border-2 border-slate-800 p-6 bg-slate-50 rounded-sm relative flex flex-col items-center justify-center min-h-[260px]">
                  
                  {/* North Indicator */}
                  <div className="absolute top-4 right-4 flex flex-col items-center">
                    <div className="w-6 h-8 border-2 border-slate-800 border-b-0 flex items-center justify-center relative">
                      <span className="font-bold text-xs text-slate-900">N</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-600">NORTH</span>
                  </div>

                  {/* Survey Polygon Sketch with Ladders */}
                  <div className="relative w-64 h-48 border-2 border-slate-900 bg-white shadow-xs p-4 flex flex-col justify-between">
                    <div className="text-[10px] font-mono text-center font-bold text-slate-500 -mt-2">
                      ↑ North (Sy. {fmbData.adjacentSurveys[0].adjacentSurveyNo}) • 48.5m
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono font-bold text-slate-500 -ml-3 rotate-90">
                        West: 35.8m
                      </div>

                      <div className="text-center">
                        <div className="text-xs font-mono font-extrabold text-emerald-800">
                          Sy. {fmbData.surveyNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {fmbData.areaHectares} Hectares
                        </div>
                        <div className="text-[9px] font-bold text-indigo-700 mt-1">
                          {parcel.ownership.ownerName}
                        </div>
                      </div>

                      <div className="text-[10px] font-mono font-bold text-slate-500 -mr-3 -rotate-90">
                        East: 36.2m
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-center font-bold text-slate-500 -mb-2">
                      ↓ South (Sy. {fmbData.adjacentSurveys[1].adjacentSurveyNo}) • 47.8m
                    </div>
                  </div>

                  <div className="mt-4 text-[11px] text-slate-600 font-mono text-center">
                    Tie-Line A-C Diagonal: 60.3m • Chain & Offset Metric Cadastral System
                  </div>
                </div>

                {/* Neighboring Survey Schedule */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                    Adjacent Survey Boundaries (நான்கெல்லை விவரங்கள்)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {fmbData.adjacentSurveys.map((adj, i) => (
                      <div key={i} className="p-2 border border-slate-300 bg-slate-50 rounded-sm">
                        <span className="font-bold text-slate-900 block">{adj.direction}:</span>
                        <span className="font-mono text-emerald-700 font-semibold">Sy. {adj.adjacentSurveyNo}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{adj.feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-300 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">Doc ID: {fmbData.meta.docId}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">Taluk Surveyor / Head Draughtsman</span>
                    <span className="text-[11px] text-slate-600 block">Survey Wing, {parcel.taluk}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Verification Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 text-xs">
              Direct verification link:{' '}
              <a
                href={pattaData.meta.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-mono"
              >
                eservices.tn.gov.in
              </a>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://eservices.tn.gov.in/eservicesnew/land/chitta.html?lan=en"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Verify on Tamil Nilam Portal</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
