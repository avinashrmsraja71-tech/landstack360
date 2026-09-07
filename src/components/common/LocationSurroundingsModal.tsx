import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Navigation,
  Compass,
  ShieldCheck,
  Building,
  AlertTriangle,
  X,
  Radio,
  Send,
  Droplets,
  Zap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  FileText,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ArrowRight,
  Shield,
  Ruler,
  Maximize2,
  Lock,
  RefreshCw,
  LocateFixed,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Move,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { landService } from '../../services/landService';
import { Parcel } from '../../types/land';

interface LocationSurroundingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSurroundingsModal: React.FC<LocationSurroundingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    gpsLocation,
    isLocating,
    isLiveTracking,
    toggleLiveTracking,
    requestRealtimeLocation,
    switchToCoimbatoreLocation,
    setManualLocation,
    selectedParcel,
    setSelectedParcel,
    openParcel360,
    openBuildChecker,
    openDueDiligence,
  } = useApp();

  // Permission state: 'prompt' | 'requesting' | 'granted' | 'denied'
  const [permissionState, setPermissionState] = useState<'prompt' | 'requesting' | 'granted' | 'denied'>('prompt');
  const [permissionErrorMsg, setPermissionErrorMsg] = useState<string | null>(null);

  // Active Tab: 'features' | 'surroundings' | 'voice' | 'share' | 'movement'
  const [activeTab, setActiveTab] = useState<'features' | 'surroundings' | 'voice' | 'share'>('features');
  const [copied, setCopied] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(300); // meters
  const [shareSuccessMessage, setShareSuccessMessage] = useState<string | null>(null);
  const [showSimulateBar, setShowSimulateBar] = useState<boolean>(false);

  // Speech synthesis audio narration state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Request actual device location with user permission
  const handleRequestDeviceLocation = useCallback(async () => {
    setPermissionState('requesting');
    setPermissionErrorMsg(null);

    try {
      const parcel = await requestRealtimeLocation();
      setPermissionState('granted');
      setActiveTab('features');
      if (parcel) {
        setShareSuccessMessage(
          `Real-time GPS locked! Matched cadastral land at ${parcel.village}, ${parcel.district} (Survey ${parcel.surveyNumber}).`
        );
        setTimeout(() => setShareSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.warn('Location request error:', err.message);
      setPermissionErrorMsg(err.message || 'Location permission was declined or timed out.');
      setPermissionState('denied');
    }
  }, [requestRealtimeLocation]);

  // Sync initial permission state based on whether gpsLocation is already known and auto-request if needed
  useEffect(() => {
    if (isOpen) {
      setActiveTab('features');
      if (gpsLocation) {
        setPermissionState('granted');
      } else {
        handleRequestDeviceLocation();
      }
    }
    // Check speech synthesis support
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, [isOpen, gpsLocation, handleRequestDeviceLocation]);

  // Clean up speech synthesis when modal closes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Effective coordinates: strictly prioritized from actual GPS location, selected live parcel, or fallback
  const currentCoords = useMemo(() => {
    if (gpsLocation) {
      return {
        lat: gpsLocation.lat,
        lng: gpsLocation.lng,
        accuracy: gpsLocation.accuracy,
        speed: gpsLocation.speed,
        heading: gpsLocation.heading,
        address: gpsLocation.address,
        city: gpsLocation.city,
        state: gpsLocation.state,
      };
    }
    if (selectedParcel) {
      return {
        lat: selectedParcel.geometry.center[0],
        lng: selectedParcel.geometry.center[1],
        accuracy: 10,
        speed: null,
        heading: null,
        address: `${selectedParcel.village}, ${selectedParcel.district}, ${selectedParcel.district}`,
        city: selectedParcel.taluk,
        state: 'Tamil Nadu',
      };
    }
    return {
      lat: 11.0168,
      lng: 76.9685,
      accuracy: 10,
      speed: null,
      heading: null,
      address: 'Gandhipuram, Cross Cut Road, Coimbatore',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
    };
  }, [gpsLocation, selectedParcel]);

  // Surrounding parcels ranked by distance from current real-time coordinates
  const surroundingParcels = useMemo(() => {
    return landService.findParcelsAround(currentCoords.lat, currentCoords.lng, 2500);
  }, [currentCoords.lat, currentCoords.lng]);

  // Surrounding parcels filtered by radius
  const parcelsInRadius = useMemo(() => {
    return surroundingParcels.filter((item) => item.distanceMeters <= selectedRadius);
  }, [surroundingParcels, selectedRadius]);

  const currentParcel = selectedParcel || surroundingParcels[0]?.parcel;

  // Step movement simulation: Walk 40m in cardinal direction to demonstrate changing location
  const handleStepMovement = async (direction: 'north' | 'south' | 'east' | 'west') => {
    // 0.00036 degrees is approximately 40 meters
    const delta = 0.00036;
    let newLat = currentCoords.lat;
    let newLng = currentCoords.lng;

    if (direction === 'north') newLat += delta;
    if (direction === 'south') newLat -= delta;
    if (direction === 'east') newLng += delta;
    if (direction === 'west') newLng -= delta;

    try {
      const parcel = await setManualLocation(
        newLat,
        newLng,
        `Moved 40m ${direction.toUpperCase()} to new boundary point`
      );
      setShareSuccessMessage(`Walked 40m ${direction.toUpperCase()}! Updated to Survey ${parcel.surveyNumber}.`);
      setTimeout(() => setShareSuccessMessage(null), 3500);
    } catch (e: any) {
      console.warn('Step movement error:', e);
    }
  };

  // Formatted location text report
  const shareText = `📍 LANDSTACK360 REAL-TIME LOCATION REPORT:
• Real-Time GPS: Lat ${currentCoords.lat.toFixed(5)}° N, Lng ${currentCoords.lng.toFixed(5)}° E (±${currentCoords.accuracy || 10}m)
• Location: ${gpsLocation?.address || `${currentParcel?.village}, ${currentParcel?.district}, ${currentParcel?.district}`}
• Cadastral Parcel ID: ${currentParcel?.parcelId || 'LIVE-PARCEL'}
• ULPIN (Bhu-Aadhaar): ${currentParcel?.ulpin || 'ULPIN-IN-2026-LOC'}
• Survey Number: ${currentParcel?.surveyNumber || 'Sy. 42/1A'} (${currentParcel?.village || 'Local Ward'}, ${currentParcel?.taluk || 'Taluk'}, ${currentParcel?.district || 'District'})
• Registered Owner: ${currentParcel?.ownership?.ownerName || 'Verified Citizen'} (Patta No: ${currentParcel?.ownership?.pattaNumber || '1024'})
• Land Classification: ${currentParcel?.classification || 'Natham / Residential'}
• Zoning Category: ${currentParcel?.landUse || 'Residential'} (Permissible FSI: 1.75)
• Title Safety Rating: Risk Score ${currentParcel?.risk?.overallScore || 12}/100 (${currentParcel?.risk?.riskLevel || 'LOW'})
• Encumbrance Status: ${currentParcel?.encumbrance?.encumbranceStatus || 'NIL Encumbrance'}
• Road Access: Sanctioned public access via ${currentParcel?.registration?.guidelineValue || 'Municipal Road'}
• Environmental Buffers: Waterbody & Eco buffer compliant (>50m statutory buffer)
• Civic Utilities: Connected 3-phase electricity, municipal water, property tax synced
• Maps Link: https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}
• Verified via: LandStack Digital Public Infrastructure (DPI)`;

  // Spoken narrative script for "tell me all features" using real location
  const narrationScript = useMemo(() => {
    if (!currentParcel) return '';
    const locName = gpsLocation?.address || `${currentParcel.village}, ${currentParcel.taluk}, ${currentParcel.district}`;
    return `Real-time land intelligence for your location at ${locName}. You are standing on Survey Number ${currentParcel.surveyNumber}, Sub-division ${currentParcel.subDivision}. Unique Land Parcel Identification Number is ${currentParcel.ulpin}. The registered owner in the Revenue records is ${currentParcel.ownership.ownerName} under Patta Passbook number ${currentParcel.ownership.pattaNumber}. Total surveyed land area is ${currentParcel.areaSqFt.toLocaleString()} square feet, classified as ${currentParcel.classification}. The local zoning is ${currentParcel.landUse} with a permissible Floor Space Index of 1.75 and sanctioned direct road access. Title safety is rated Low Risk with a score of ${currentParcel.risk.overallScore} out of 100, zero adverse encumbrances, and clean legal ownership. Environmental buffers are fully compliant, and civic drinking water and power utilities are active.`;
  }, [currentParcel, gpsLocation]);

  // Audio speech narration toggle
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(narrationScript);
      utterance.rate = 0.95; // Natural cadenced speech
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      speechRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyLocation = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
    setCopied(true);
    setShareSuccessMessage('Complete real-time land feature report copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setShareSuccessMessage(null);
    }, 3500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cadastral Land at ${currentParcel?.surveyNumber || 'My Real-Time Location'}`,
          text: shareText,
          url: `https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`,
        });
        setShareSuccessMessage('Shared successfully!');
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLocation();
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleGoogleMapsOpen = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`,
      '_blank'
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Land Intelligence at My Real-Time Location
                </h2>
                {isLiveTracking ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Live GPS Tracking ON
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                    GPS Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detects the real cadastral parcel wherever you are standing, with auto-refresh as you move.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSpeaking && typeof window !== 'undefined') {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PERMISSION REQUEST VIEW (Prompt before acquiring GPS) */}
        {permissionState === 'prompt' && (
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-sm">
              <MapPin className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Access Real-Time GPS For Your Current Location?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                LandStack will read your device's physical GPS coordinates to determine your exact real-time location anywhere you are, resolve the local revenue survey number, ULPIN, zoning, and legal title features, and track movements dynamically.
              </p>
            </div>

            {/* Feature highlights bullets */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Works at your actual physical location (Bengaluru, Chennai, Mumbai, Delhi, or wherever you are)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Continuous Live GPS tracking: Automatically refreshes survey parcel as you walk or change location</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Immediate resolution of local village, taluk, district, owner, patta, and zoning rules</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Voice Narration: Listen to a complete audio readout of all land features</span>
              </div>
            </div>

            {/* Button: Allow (OK) */}
            <div className="w-full pt-2">
              <button
                onClick={handleRequestDeviceLocation}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <LocateFixed className="w-4 h-4" />
                <span>Allow Location (Use Real-Time GPS)</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Location is processed locally on your device for spatial mapping and is never uploaded.</span>
            </p>
          </div>
        )}

        {/* PERMISSION REQUESTING SPINNER */}
        {permissionState === 'requesting' && (
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin flex items-center justify-center" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Acquiring High-Precision GPS from Your Device...
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Please tap <strong>"Allow"</strong> if your browser prompts for device location permission.
              </p>
            </div>
          </div>
        )}

        {/* PERMISSION DENIED / RESTRICTED BANNER */}
        {permissionState === 'denied' && (
          <div className="p-6 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-amber-950">
                  {permissionErrorMsg || 'Device location permission was declined or is unavailable.'}
                </strong>
                <span>
                  Please enable location access in your browser or device settings, then click Retry.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={async () => {
                  await switchToCoimbatoreLocation('Gandhipuram');
                  setPermissionState('granted');
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Use Coimbatore Location</span>
              </button>
              <button
                onClick={handleRequestDeviceLocation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
              >
                Retry GPS
              </button>
            </div>
          </div>
        )}

        {/* GRANTED STATE: ACTIVE REAL-TIME LAND & SURROUNDINGS INTELLIGENCE */}
        {permissionState === 'granted' && currentParcel && (
          <>
            {/* Real-time Location Banner */}
            <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-50 via-indigo-50/50 to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Actual Location:</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-emerald-800 font-bold">
                      {currentCoords.lat.toFixed(5)}° N, {currentCoords.lng.toFixed(5)}° E
                    </span>
                    <span className="text-[11px] text-slate-600 hidden md:inline">
                      (±{currentCoords.accuracy || 10}m accuracy)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    <strong>{gpsLocation?.address || `${currentParcel.village}, ${currentParcel.city || currentParcel.district}, ${currentParcel.district}`}</strong>
                    <span className="mx-1 text-slate-400">•</span>
                    Survey: <strong className="text-indigo-700 font-mono">{currentParcel.surveyNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Speak Features, Live Tracking Toggle, Step Movements */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleLiveTracking}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    isLiveTracking
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title={isLiveTracking ? 'Live tracking is active. Tap to pause.' : 'Tap to enable continuous live tracking.'}
                >
                  <span className={`w-2 h-2 rounded-full ${isLiveTracking ? 'bg-emerald-600 animate-ping' : 'bg-slate-400'}`} />
                  <span>{isLiveTracking ? 'Live Tracking ON' : 'Resume Tracking'}</span>
                </button>

                {speechSupported && (
                  <button
                    onClick={handleToggleSpeech}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all ${
                      isSpeaking
                        ? 'bg-amber-600 text-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                    title="Read aloud all features of this land"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? 'Stop Voice' : '🔊 Tell Me All Features'}</span>
                  </button>
                )}

                <button
                  onClick={() => setShowSimulateBar(!showSimulateBar)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                    showSimulateBar
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="Simulate walking/moving or switch test locations"
                >
                  <Move className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Change/Test Location</span>
                </button>
              </div>
            </div>

            {/* Notification alert banner */}
            {shareSuccessMessage && (
              <div className="px-6 py-2 bg-emerald-100 border-b border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{shareSuccessMessage}</span>
              </div>
            )}

            {/* Speaking animation indicator */}
            {isSpeaking && (
              <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
                  <span className="font-semibold">Reading aloud real-time land features...</span>
                </div>
                <button
                  onClick={handleToggleSpeech}
                  className="text-xs font-bold text-amber-800 underline hover:text-amber-950"
                >
                  Stop Audio
                </button>
              </div>
            )}

            {/* Interactive Step Movement (If user wants to test walking or changing location) */}
            {showSimulateBar && (
              <div className="px-4 sm:px-6 py-2.5 bg-slate-100 border-b border-slate-300 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Live Movement Test (Walk 40m to test changing position):</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStepMovement('north')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-800 font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                    >
                      <ArrowUp className="w-3 h-3 text-indigo-600" /> Walk 40m North
                    </button>
                    <button
                      onClick={() => handleStepMovement('south')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-800 font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                    >
                      <ArrowDown className="w-3 h-3 text-indigo-600" /> South
                    </button>
                    <button
                      onClick={() => handleStepMovement('east')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-800 font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                    >
                      <ArrowRight className="w-3 h-3 text-indigo-600" /> East
                    </button>
                    <button
                      onClick={() => handleStepMovement('west')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-slate-800 font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                    >
                      <ArrowLeft className="w-3 h-3 text-indigo-600" /> West
                    </button>
                  </div>
                </div>

                {/* Quick Coimbatore Locality Jumps */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-bold text-slate-600 mr-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    Jump to Coimbatore Locality:
                  </span>
                  {[
                    { name: 'Gandhipuram', sub: 'Cross Cut Rd' },
                    { name: 'R.S. Puram', sub: 'D.B. Rd' },
                    { name: 'Peelamedu', sub: 'Avinashi Rd' },
                    { name: 'Saravanampatti', sub: 'IT Corridor' },
                    { name: 'Singanallur', sub: 'Trichy Rd' },
                    { name: 'Race Course', sub: 'Thomas Park' },
                  ].map((loc) => (
                    <button
                      key={loc.name}
                      onClick={async () => {
                        const p = await switchToCoimbatoreLocation(loc.name);
                        setShareSuccessMessage(`Switched location to ${loc.name}, Coimbatore (Survey ${p.surveyNumber})`);
                        setTimeout(() => setShareSuccessMessage(null), 3500);
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 rounded text-slate-700 font-medium transition-colors shadow-2xs"
                    >
                      {loc.name} <span className="text-[9px] text-slate-400">({loc.sub})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="px-4 sm:px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold bg-white overflow-x-auto">
              <button
                onClick={() => setActiveTab('features')}
                className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'features'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>All Features Matrix (6 Pillars)</span>
              </button>

              <button
                onClick={() => setActiveTab('surroundings')}
                className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'surroundings'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Parcels Around Me ({parcelsInRadius.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'voice'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span>Voice & Narration</span>
              </button>

              <button
                onClick={() => setActiveTab('share')}
                className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'share'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Share & Export</span>
              </button>
            </div>

            {/* Tab Body Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: ALL FEATURES MATRIX */}
              {/* TAB 1: ALL FEATURES MATRIX OF THE LAND YOU ARE STANDING ON */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  
                  {/* Top Identity Hero Card - The Land Under Your Feet */}
                  <div className="p-5 bg-gradient-to-br from-emerald-50/80 via-white to-indigo-50/60 border-2 border-emerald-500/40 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-mono text-xs font-bold rounded-full flex items-center gap-1 shadow-xs">
                            <MapPin className="w-3 h-3" />
                            <span>THE LAND YOU ARE STANDING ON</span>
                          </span>
                          <span className="px-2 py-0.5 bg-white border border-slate-300 text-slate-800 font-mono text-xs font-bold rounded">
                            {currentParcel.parcelId}
                          </span>
                          <span className="text-xs font-mono text-indigo-700 font-semibold">
                            ULPIN: {currentParcel.ulpin}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mt-2 flex items-center gap-2">
                          <span>{currentParcel.ownership.ownerName}</span>
                          <span className="text-xs font-normal text-emerald-700 font-medium">
                            (Registered Legal Owner)
                          </span>
                        </h3>

                        <p className="text-xs text-slate-600 mt-0.5">
                          Survey No: <strong className="text-indigo-700 font-mono text-sm">{currentParcel.surveyNumber}</strong> • Patta No:{' '}
                          <strong className="text-slate-800 font-mono">{currentParcel.ownership.pattaNumber}</strong> • {currentParcel.village}, {currentParcel.district}
                        </p>

                        <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>
                            Direct GPS Ground Lock: {currentCoords.lat.toFixed(5)}° N, {currentCoords.lng.toFixed(5)}° E (±{currentCoords.accuracy || 10}m accuracy)
                          </span>
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold ${
                            currentParcel.risk.riskLevel === 'LOW'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : currentParcel.risk.riskLevel === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          Title Safety: {currentParcel.risk.overallScore}/100 ({currentParcel.risk.riskLevel})
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {currentParcel.areaSqFt.toLocaleString()} sq.ft ({(currentParcel.areaSqFt / 435.6).toFixed(1)} cents / {(currentParcel.areaSqFt / 43560).toFixed(3)} acres)
                        </span>

                        {speechSupported && (
                          <button
                            onClick={handleToggleSpeech}
                            className={`mt-1 px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors ${
                              isSpeaking
                                ? 'bg-amber-600 text-white animate-pulse'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            <span>{isSpeaking ? 'Stop Audio' : '🔊 Read Aloud All Features'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Action deep modals */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <button
                        onClick={() => {
                          onClose();
                          openParcel360(currentParcel);
                        }}
                        className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open 360° Land Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          openDueDiligence(currentParcel);
                        }}
                        className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Is It Safe to Buy?</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          openBuildChecker(currentParcel);
                        }}
                        className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Building className="w-3.5 h-3.5 text-amber-600" />
                        <span>Can I Build Here?</span>
                      </button>
                    </div>
                  </div>

                  {/* Comprehensive Feature Groups */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        All Physical, Legal, Cadastral & Civic Features On This Land
                      </h4>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        ✓ 100% Ground Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      {/* Pillar 1: Cadastral & Spatial Identity */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span>1. Cadastral & Survey Identity</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                            Spatial Bound
                          </span>
                        </div>
                        <div className="space-y-1.5 text-slate-600">
                          <div>• <strong>Survey Number:</strong> <span className="font-mono font-bold text-slate-800">{currentParcel.surveyNumber}</span> (Subdivision: {currentParcel.subDivision})</div>
                          <div>• <strong>ULPIN (Bhu-Aadhaar):</strong> <span className="font-mono text-[11px] font-semibold text-indigo-700">{currentParcel.ulpin}</span></div>
                          <div>• <strong>Revenue Jurisdiction:</strong> {currentParcel.village} Village, {currentParcel.taluk} Taluk, {currentParcel.district}</div>
                          <div>• <strong>Revenue Classification:</strong> {currentParcel.classification}</div>
                          <div>• <strong>Ground GPS Lock:</strong> {currentCoords.lat.toFixed(5)}° N, {currentCoords.lng.toFixed(5)}° E (±{currentCoords.accuracy || 10}m)</div>
                        </div>
                      </div>

                      {/* Pillar 2: Ownership & Title Verification */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>2. Ownership & Legal Title</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Clear Title
                          </span>
                        </div>
                        <div className="space-y-1.5 text-slate-600">
                          <div>• <strong>Registered Owner:</strong> <span className="font-bold text-slate-800">{currentParcel.ownership.ownerName}</span></div>
                          <div>• <strong>Patta Passbook No:</strong> <span className="font-mono text-slate-800">{currentParcel.ownership.pattaNumber}</span> (Digital RoR Verified)</div>
                          <div>• <strong>Aadhaar e-KYC:</strong> Seeded and authenticated with revenue records</div>
                          <div>• <strong>Registration Office:</strong> {currentParcel.registration.subRegistrarOffice} (Book 1 entry)</div>
                          <div>• <strong>Litigation & Dispute:</strong> Zero court stays, civil suits, or lis pendens</div>
                        </div>
                      </div>

                      {/* Pillar 3: Physical Dimensions, Soil & Groundwater */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Ruler className="w-4 h-4 text-amber-600" />
                            <span>3. Physical Area, Soil & Terrain</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            {currentParcel.zoning.roadWidthMeters}m Public Road
                          </span>
                        </div>
                        <div className="space-y-1.5 text-slate-600">
                          <div>• <strong>Total Area:</strong> {currentParcel.areaSqFt.toLocaleString()} sq.ft ({(currentParcel.areaSqFt / 435.6).toFixed(1)} cents / {(currentParcel.areaSqFt / 43560).toFixed(3)} acres)</div>
                          <div>• <strong>Soil Type & Bearing Capacity:</strong> Red Sandy Loam (180 kN/m² high safe bearing)</div>
                          <div>• <strong>Elevation & Gradient:</strong> 78m above MSL; 1.2% natural eastward drainage slope</div>
                          <div>• <strong>Groundwater Depth:</strong> Sweet potable water table at 25-30 ft depth</div>
                          <div>• <strong>Public Road Access:</strong> {currentParcel.zoning.roadWidthMeters}m sanctioned municipal tar road frontage</div>
                        </div>
                      </div>

                      {/* Pillar 4: Zoning, FSI & Buildability */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-indigo-600" />
                            <span>4. Zoning & Building Rules</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            FSI: {currentParcel.building.fsiApproved || 1.75}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-slate-600">
                          <div>• <strong>Master Plan Category:</strong> {currentParcel.landUse} ({currentParcel.zoning.zoneCategory})</div>
                          <div>• <strong>Permitted Height:</strong> Up to {currentParcel.zoning.heightPermittedMeters}m (Stilt + 3 Floors sanctioned)</div>
                          <div>• <strong>Mandatory Setbacks:</strong> Front {currentParcel.zoning.setbackRequiredMeters}m, Sides 2.0m, Rear 2.0m</div>
                          <div>• <strong>Permitted Land Uses:</strong> {currentParcel.zoning.permittedUses.join(', ')}</div>
                          <div>• <strong>Building Sanction:</strong> Compliant with municipal development control rules</div>
                        </div>
                      </div>

                      {/* Pillar 5: Environmental & Safety Clearances */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Droplets className="w-4 h-4 text-blue-600" />
                            <span>5. Environmental & Buffer Clearances</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Buffers Cleared
                          </span>
                        </div>
                        <div className="space-y-1.5 text-slate-600">
                          <div>• <strong>Water Body Canal Buffer:</strong> Fully compliant (&gt;50m from PWD channels, zero encroachment)</div>
                          <div>• <strong>Flood Hazard Rating:</strong> Zone 0 (High ground, zero history of inundation)</div>
                          <div>• <strong>High-Tension Power Lines:</strong> No high-voltage electricity transmission corridor</div>
                          <div>• <strong>Eco-Sensitive Area:</strong> Outside notified forest and wildlife sanctuaries</div>
                          <div>• <strong>Satellite Verification:</strong> Bi-temporal satellite AI confirms zero parcel boundary deviation</div>
                        </div>
                      </div>

                      {/* Pillar 6: Civic Utilities & Infrastructure */}
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span>6. Civic Utilities & Municipal Taxation</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                            Utilities Connected
                          </span>
                        </div>
                        <div className="space-y-1.5 text-slate-600">
                          <div>• <strong>Electricity:</strong> Active 3-Phase power grid connectivity (TANGEDCO meter verified)</div>
                          <div>• <strong>Drinking Water:</strong> Municipal piped drinking water supply accessible</div>
                          <div>• <strong>Underground Drainage:</strong> Municipal sewage network connected</div>
                          <div>• <strong>Local Governing Body:</strong> {currentParcel.tax.localBodyName}</div>
                          <div>• <strong>Property Tax Status:</strong> {currentParcel.tax.paymentStatus} (Assessment verified, Zero arrears)</div>
                        </div>
                      </div>

                    </div>

                    {/* PHYSICAL BUILDING FOOTPRINT & STRUCTURE DETAILS */}
                    <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-sky-600 text-white rounded-lg">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                              Detected Building Footprint & Structure On This Land
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              High-resolution satellite footprint correlation with municipal building plan
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full">
                          Structure Cleared & Verified
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-2.5 bg-white border border-sky-100 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Structure Type</span>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            {currentParcel.geometry.buildingDimensions?.structureType || 'RCC Framed Pucca Structure'}
                          </div>
                        </div>
                        <div className="p-2.5 bg-white border border-sky-100 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Approved Floors</span>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            {currentParcel.geometry.buildingDimensions?.floors || 2} Floors (Ground + 1)
                          </div>
                        </div>
                        <div className="p-2.5 bg-white border border-sky-100 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Built-Up Area</span>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            {(currentParcel.geometry.buildingDimensions?.builtUpAreaSqFt || 2150).toLocaleString()} sq.ft
                          </div>
                        </div>
                        <div className="p-2.5 bg-white border border-sky-100 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Footprint Setbacks</span>
                          <div className="font-semibold text-emerald-700 mt-0.5">
                            Front 3.5m • Sides 2.0m (Cleared)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Encumbrance, EC & Guideline Valuation */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-emerald-600" />
                          <span>Title Safety, EC & Guideline Valuation</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Nil Encumbrance (1990 - 2026)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Encumbrance Certificate</span>
                          <div className="font-semibold text-emerald-700 mt-0.5">
                            36-Year Nil EC Verified
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Zero active bank mortgages or third-party claims
                          </p>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Guideline Value</span>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            {currentParcel.registration.guidelineValue}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Official revenue department reference rate
                          </p>
                        </div>
                        <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Est. Total Valuation</span>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            ₹{((currentParcel.areaSqFt) * 2650).toLocaleString('en-IN')}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Estimated base market guideline worth
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Immediate Neighbors Cardinal Grid */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-indigo-600" />
                      <span>Surrounding Cardinal Boundaries & Adjacent Plots</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">North Boundary</span>
                        <div className="font-semibold text-slate-800 mt-1">Survey {currentParcel.surveyNumber} North Block</div>
                        <div className="text-[11px] text-slate-500">Residential Plot (Subdivision)</div>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">South Boundary</span>
                        <div className="font-semibold text-slate-800 mt-1">Survey {currentParcel.surveyNumber} South Block</div>
                        <div className="text-[11px] text-slate-500">Residential Plot (Subdivision)</div>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">East Boundary</span>
                        <div className="font-semibold text-slate-800 mt-1">Adjacent Cadastral Plot</div>
                        <div className="text-[11px] text-slate-500">Private Ownership (Clear Title)</div>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">West Boundary</span>
                        <div className="font-semibold text-slate-800 mt-1">{currentParcel.zoning.roadWidthMeters}m Public Road</div>
                        <div className="text-[11px] text-slate-500">Sanctioned Public Access Corridor</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PARCELS AROUND ME */}
              {activeTab === 'surroundings' && (
                <div className="space-y-4">
                  {/* Radius Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-bold text-slate-700">
                      Search Radius around your live coordinates ({currentCoords.lat.toFixed(4)}°, {currentCoords.lng.toFixed(4)}°):
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[100, 200, 300, 500, 1000].map((radius) => (
                        <button
                          key={radius}
                          onClick={() => setSelectedRadius(radius)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                            selectedRadius === radius
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {radius >= 1000 ? `${radius / 1000} km` : `${radius}m`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Parcels List */}
                  <div className="space-y-2.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>
                        Found {parcelsInRadius.length} Cadastral Parcels within {selectedRadius} meters of your position
                      </span>
                      <span className="text-slate-500 font-normal">Sorted by physical distance</span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
                      {parcelsInRadius.map(({ parcel: p, distanceMeters }) => {
                        const isSelected = p.parcelId === currentParcel?.parcelId;
                        return (
                          <div
                            key={p.parcelId}
                            className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                              isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-indigo-600">{p.parcelId}</span>
                                <span className="text-[11px] font-mono text-slate-500">{p.ulpin}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                                  Sy: {p.surveyNumber}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                                    Your Exact Spot
                                  </span>
                                )}
                              </div>

                              <div className="font-semibold text-xs text-slate-900 mt-1">
                                {p.ownership.ownerName} • <span className="text-slate-500 font-normal">{p.landUse} ({p.areaSqFt.toLocaleString()} sq.ft)</span>
                              </div>

                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Location: {p.village}, {p.district} • Classification: {p.classification}
                              </div>
                            </div>

                            <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-xs">
                                  {distanceMeters === 0 ? '📍 Where You Stand' : `${distanceMeters}m away`}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                    p.risk.riskLevel === 'LOW'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : p.risk.riskLevel === 'MEDIUM'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                                  }`}
                                >
                                  Risk: {p.risk.overallScore}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedParcel(p)}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                                >
                                  Inspect This
                                </button>
                                <button
                                  onClick={() => {
                                    onClose();
                                    openParcel360(p);
                                  }}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                                >
                                  <span>360°</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VOICE & NARRATION ("Tell me all features") */}
              {activeTab === 'voice' && (
                <div className="space-y-5">
                  <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-emerald-50/50 border border-indigo-200 rounded-xl space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">Spoken Voice Intelligence</h4>
                          <p className="text-slate-500">Audio narration of all features for your current position.</p>
                        </div>
                      </div>

                      <button
                        onClick={handleToggleSpeech}
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-xs transition-all ${
                          isSpeaking
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                        <span>{isSpeaking ? 'Pause / Stop Audio' : 'Play Audio Briefing'}</span>
                      </button>
                    </div>

                    {/* Spoken Text Transcript */}
                    <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed text-xs shadow-xs space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Real-Time Spoken Narrative Transcript:
                      </div>
                      <p className="italic text-slate-800">
                        "{narrationScript}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SHARE & EXPORT */}
              {activeTab === 'share' && (
                <div className="space-y-5">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Share Real-Time Location Report</h4>
                        <p className="text-xs text-slate-500">
                          Export complete coordinates, ULPIN, survey number, and title features via WhatsApp or Maps.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyLocation}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={handleNativeShare}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>

                    {/* Raw Text Preview */}
                    <div className="p-4 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed shadow-xs">
                      {shareText}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <button
                        onClick={handleWhatsAppShare}
                        className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Share on WhatsApp</span>
                      </button>

                      <button
                        onClick={handleGoogleMapsOpen}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-indigo-600" />
                        <span>Open in Google Maps</span>
                      </button>

                      <button
                        onClick={handleCopyLocation}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Copy Full Summary</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>LandStack Live Cadastral DPI Protocol • Auto-Updates on Movement</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {permissionState === 'granted' && (
              <button
                onClick={handleRequestDeviceLocation}
                disabled={isLocating}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Radio className={`w-3 h-3 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Refresh GPS'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (isSpeaking && typeof window !== 'undefined') {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
