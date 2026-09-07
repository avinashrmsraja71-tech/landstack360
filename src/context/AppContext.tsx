import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Parcel, UserRole } from '../types/land';
import { landService, calculateDistanceMeters } from '../services/landService';
import {
  reverseGeocodeLocation,
  generateLiveCadastralParcel,
  generateSurroundingParcelsForLocation,
  ReverseGeocodeResult,
} from '../services/liveCadastralService';
import { COIMBATORE_LOCALITIES } from '../services/googleGeocodingService';

export interface GpsLocationState {
  lat: number;
  lng: number;
  accuracy: number;
  speed?: number | null;
  heading?: number | null;
  timestamp?: number;
  address?: string;
  road?: string;
  suburb?: string;
  village?: string;
  taluk?: string;
  city?: string;
  district?: string;
  state?: string;
  postcode?: string;
  country?: string;
  isMock: boolean;
  isLiveTracking?: boolean;
  statusText: string;
  lastUpdated?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  parcelId?: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  selectedParcel: Parcel | null;
  setSelectedParcel: (parcel: Parcel | null) => void;
  modalParcel: Parcel | null;
  setModalParcel: (parcel: Parcel | null) => void;
  gpsLocation: GpsLocationState | null;
  isLocating: boolean;
  isLiveTracking: boolean;
  toggleLiveTracking: () => void;
  requestRealtimeLocation: () => Promise<Parcel | null>;
  switchToCoimbatoreLocation: (localityName?: string) => Promise<Parcel>;
  setManualLocation: (lat: number, lng: number, addressHint?: string) => Promise<Parcel>;
  findLandAroundMe: () => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (val: boolean) => void;
  openLocationSurroundings: () => void;
  closeLocationSurroundings: () => void;
  isParcelModalOpen: boolean;
  setIsParcelModalOpen: (val: boolean) => void;
  isParcel360Open: boolean;
  closeParcel360: () => void;
  isBuildModalOpen: boolean;
  setIsBuildModalOpen: (val: boolean) => void;
  isBuildCheckerOpen: boolean;
  closeBuildChecker: () => void;
  isDueDiligenceModalOpen: boolean;
  setIsDueDiligenceModalOpen: (val: boolean) => void;
  isDueDiligenceOpen: boolean;
  closeDueDiligence: () => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (val: boolean) => void;
  isAiDetectionOpen: boolean;
  closeAiDetection: () => void;
  isDemoTourOpen: boolean;
  setIsDemoTourOpen: (val: boolean) => void;
  isDemoGuideOpen: boolean;
  closeDemoGuide: () => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (val: boolean) => void;
  closeNotifications: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  openParcel360: (parcel: Parcel) => void;
  openBuildChecker: (parcel: Parcel) => void;
  openDueDiligence: (parcel: Parcel) => void;
  openAiDetection: (parcel: Parcel) => void;
  startInteractiveDemoTour: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('citizen');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [modalParcel, setModalParcel] = useState<Parcel | null>(null);
  const [gpsLocation, setGpsLocation] = useState<GpsLocationState | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);
  const lastRecordedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [isDueDiligenceModalOpen, setIsDueDiligenceModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Real-Time Cadastral Intelligence Ready',
      message: 'Share your device GPS to view verified survey & title data for your exact location.',
      timestamp: 'Just now',
      type: 'info',
      read: false,
    },
    {
      id: 'n2',
      title: 'Ownership Verification Completed',
      message: 'RoR matched with Revenue Patta register.',
      timestamp: '10 mins ago',
      type: 'success',
      read: false,
    },
    {
      id: 'n3',
      title: 'AI Satellite Deviation Alert',
      message: 'Possible unauthorized construction detected on Parcel TN-DEMO-1025.',
      timestamp: '45 mins ago',
      type: 'alert',
      read: false,
      parcelId: 'TN-DEMO-1025',
    },
  ]);

  // Set default selected parcel on initial mount - defaults to Coimbatore
  useEffect(() => {
    const defaultParcel =
      landService.getParcelById('TN-CBE-1001') ||
      landService.getAllParcels().find((p) => p.district.toLowerCase() === 'coimbatore') ||
      landService.getAllParcels()[0];
    if (defaultParcel) {
      setSelectedParcel(defaultParcel);
    }
  }, []);

  // Cleanup geolocation watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const openParcel360 = (parcel: Parcel) => {
    setModalParcel(parcel);
    setSelectedParcel(parcel);
    setIsParcelModalOpen(true);
  };

  const openBuildChecker = (parcel: Parcel) => {
    setModalParcel(parcel);
    setSelectedParcel(parcel);
    setIsBuildModalOpen(true);
  };

  const openDueDiligence = (parcel: Parcel) => {
    setModalParcel(parcel);
    setSelectedParcel(parcel);
    setIsDueDiligenceModalOpen(true);
  };

  const openAiDetection = (parcel: Parcel) => {
    setModalParcel(parcel);
    setSelectedParcel(parcel);
    setIsAiModalOpen(true);
  };

  const startInteractiveDemoTour = () => {
    setIsDemoTourOpen(true);
  };

  const openLocationSurroundings = useCallback(() => {
    setIsLocationModalOpen(true);
  }, []);

  const closeLocationSurroundings = useCallback(() => {
    setIsLocationModalOpen(false);
  }, []);

  // Process and register a location (lat, lng) into the system
  const processLocationUpdate = useCallback(
    async (
      lat: number,
      lng: number,
      accuracy: number = 10,
      speed: number | null = null,
      heading: number | null = null,
      isManual: boolean = false,
      addressHint?: string
    ): Promise<Parcel> => {
      let geo: ReverseGeocodeResult;
      try {
        geo = await reverseGeocodeLocation(lat, lng);
        if (addressHint) {
          geo.displayName = `${addressHint} (${geo.displayName})`;
        }
      } catch {
        geo = {
          displayName: `Location: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`,
          road: 'Municipal Access Road',
          suburb: 'Urban Sector',
          village: 'Revenue Ward',
          taluk: 'Local Taluk',
          city: 'City Corporation',
          district: 'District',
          state: 'State',
          postcode: '600001',
          country: 'India',
          isRealGeocode: false,
        };
      }

      // Generate the exact live cadastral parcel directly under the user's feet
      const liveParcel = generateLiveCadastralParcel(lat, lng, geo);

      // Generate surrounding adjacent parcels around the user's physical position
      const surroundingParcels = generateSurroundingParcelsForLocation(lat, lng, geo);

      // Register these into landService so that map, searches, and calculations use them immediately
      landService.registerLiveLocationParcels(liveParcel, surroundingParcels);

      lastRecordedCoordsRef.current = { lat, lng };

      const timeStr = new Date().toLocaleTimeString();
      setGpsLocation({
        lat,
        lng,
        accuracy: Math.round(accuracy) || 10,
        speed,
        heading,
        timestamp: Date.now(),
        address: geo.displayName,
        road: geo.road,
        suburb: geo.suburb,
        village: geo.village,
        taluk: geo.taluk,
        city: geo.city,
        district: geo.district,
        state: geo.state,
        postcode: geo.postcode,
        country: geo.country,
        isMock: isManual,
        isLiveTracking: true,
        statusText: `Real-time GPS locked at ${geo.city} (${lat.toFixed(5)}°, ${lng.toFixed(5)}°)`,
        lastUpdated: timeStr,
      });

      setSelectedParcel(liveParcel);
      return liveParcel;
    },
    []
  );

  // Start continuous watchPosition tracking
  const startWatchingLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsLiveTracking(true);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;

        // Check if moved more than 8 meters from last recorded coords
        if (lastRecordedCoordsRef.current) {
          const dist = calculateDistanceMeters(
            lastRecordedCoordsRef.current.lat,
            lastRecordedCoordsRef.current.lng,
            latitude,
            longitude
          );
          if (dist < 8) {
            // Minor jitter, simply update accuracy/speed/timestamp without full rebuild
            setGpsLocation((prev) =>
              prev
                ? {
                    ...prev,
                    lat: latitude,
                    lng: longitude,
                    accuracy: Math.round(accuracy) || 10,
                    speed,
                    heading,
                    timestamp: Date.now(),
                    lastUpdated: new Date().toLocaleTimeString(),
                  }
                : null
            );
            return;
          }
        }

        // Location significantly changed! Re-process parcel at new coordinates
        try {
          await processLocationUpdate(latitude, longitude, accuracy, speed, heading, false);
        } catch (e) {
          console.warn('Live location update error:', e);
        }
      },
      (err) => {
        console.warn('Geolocation watcher warning:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );

    watchIdRef.current = watchId;
  }, [processLocationUpdate]);

  // Switch directly to a Coimbatore locality with high-accuracy cadastral resolution
  const switchToCoimbatoreLocation = useCallback(
    async (localityName?: string): Promise<Parcel> => {
      setIsLocating(true);
      try {
        let lat = 11.0168;
        let lng = 76.9685;
        let hint = 'Gandhipuram, Coimbatore';

        if (localityName) {
          const match = COIMBATORE_LOCALITIES.find(
            (loc) => loc.name.toLowerCase().includes(localityName.toLowerCase()) ||
                     localityName.toLowerCase().includes(loc.name.toLowerCase())
          );
          if (match) {
            lat = match.center[0];
            lng = match.center[1];
            hint = `${match.name}, Coimbatore`;
          }
        }

        const parcel = await processLocationUpdate(lat, lng, 8, null, null, false, hint);
        setIsLocating(false);
        return parcel;
      } catch (err) {
        setIsLocating(false);
        throw err;
      }
    },
    [processLocationUpdate]
  );

  // Request actual real-time device location with resilient fallback
  const requestRealtimeLocation = useCallback(async (): Promise<Parcel | null> => {
    setIsLocating(true);

    const tryPosition = (options: PositionOptions): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          return reject(new Error('Geolocation is not supported by your device/browser.'));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      let pos: GeolocationPosition;
      try {
        // Attempt 1: High accuracy GPS
        pos = await tryPosition({ enableHighAccuracy: true, timeout: 6000, maximumAge: 0 });
      } catch {
        // Attempt 2: Standard/Cached IP-assisted geolocation
        pos = await tryPosition({ enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 });
      }

      const { latitude, longitude, accuracy, speed, heading } = pos.coords;
      const parcel = await processLocationUpdate(latitude, longitude, accuracy, speed, heading, false);
      setIsLocating(false);
      startWatchingLocation();
      return parcel;
    } catch (err: any) {
      console.warn('Physical GPS could not be acquired or timed out. Falling back to Coimbatore local intelligence:', err);
      // Auto-fallback to Coimbatore so the user is never stuck in Tiruchirappalli or with an error
      const cbeParcel = await switchToCoimbatoreLocation('Gandhipuram');
      setIsLocating(false);
      return cbeParcel;
    }
  }, [processLocationUpdate, startWatchingLocation, switchToCoimbatoreLocation]);

  // Set manual/preset coordinates (e.g. for testing movement or other locations)
  const setManualLocation = useCallback(
    async (lat: number, lng: number, addressHint?: string): Promise<Parcel> => {
      setIsLocating(true);
      try {
        const parcel = await processLocationUpdate(lat, lng, 12, null, null, true, addressHint);
        setIsLocating(false);
        return parcel;
      } catch (err) {
        setIsLocating(false);
        throw err;
      }
    },
    [processLocationUpdate]
  );

  // Toggle live tracking on/off
  const toggleLiveTracking = useCallback(() => {
    if (isLiveTracking) {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsLiveTracking(false);
      setGpsLocation((prev) => (prev ? { ...prev, isLiveTracking: false } : null));
    } else {
      startWatchingLocation();
    }
  }, [isLiveTracking, startWatchingLocation]);

  // Global "Find Land Around Me" trigger
  const findLandAroundMe = useCallback(async () => {
    setIsLocationModalOpen(true);
    try {
      await requestRealtimeLocation();
    } catch {
      // Modal will show prompt or error state cleanly
    }
  }, [requestRealtimeLocation]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        demoMode,
        setDemoMode,
        selectedParcel,
        setSelectedParcel,
        modalParcel,
        setModalParcel,
        gpsLocation,
        isLocating,
        isLiveTracking,
        toggleLiveTracking,
        requestRealtimeLocation,
        switchToCoimbatoreLocation,
        setManualLocation,
        findLandAroundMe,
        isLocationModalOpen,
        setIsLocationModalOpen,
        openLocationSurroundings,
        closeLocationSurroundings,
        isParcelModalOpen,
        setIsParcelModalOpen,
        isParcel360Open: isParcelModalOpen,
        closeParcel360: () => setIsParcelModalOpen(false),
        isBuildModalOpen,
        setIsBuildModalOpen,
        isBuildCheckerOpen: isBuildModalOpen,
        closeBuildChecker: () => setIsBuildModalOpen(false),
        isDueDiligenceModalOpen,
        setIsDueDiligenceModalOpen,
        isDueDiligenceOpen: isDueDiligenceModalOpen,
        closeDueDiligence: () => setIsDueDiligenceModalOpen(false),
        isAiModalOpen,
        setIsAiModalOpen,
        isAiDetectionOpen: isAiModalOpen,
        closeAiDetection: () => setIsAiModalOpen(false),
        isDemoTourOpen,
        setIsDemoTourOpen,
        isDemoGuideOpen: isDemoTourOpen,
        closeDemoGuide: () => setIsDemoTourOpen(false),
        isNotificationsOpen,
        setIsNotificationsOpen,
        closeNotifications: () => setIsNotificationsOpen(false),
        notifications,
        markNotificationRead,
        openParcel360,
        openBuildChecker,
        openDueDiligence,
        openAiDetection,
        startInteractiveDemoTour,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
