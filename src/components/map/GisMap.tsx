import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Parcel } from '../../types/land';
import { useApp } from '../../context/AppContext';
import { landService } from '../../services/landService';
import { reverseGeocodeLocation, generateLiveCadastralParcel } from '../../services/liveCadastralService';
import {
  Layers,
  MapPin,
  Compass,
  Maximize2,
  Info,
  ShieldAlert,
  Building,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  Home,
  Sparkles,
  Search,
  X,
  Plus,
} from 'lucide-react';

interface GisMapProps {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel) => void;
}

// Point-in-polygon algorithm for detecting clicks inside parcel boundaries
function isPointInPolygon(point: [number, number], vs: [number, number][]): boolean {
  if (!vs || vs.length < 3) return false;
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export const GisMap: React.FC<GisMapProps> = ({ parcels, selectedParcel, onSelectParcel }) => {
  const {
    gpsLocation,
    findLandAroundMe,
    openLocationSurroundings,
    isLocating,
    isLiveTracking,
    toggleLiveTracking,
    openParcel360,
  } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<{ [parcelId: string]: L.Polygon }>({});
  const buildingLayersRef = useRef<{ [parcelId: string]: L.Polygon }>({});
  const buildingMarkersRef = useRef<{ [parcelId: string]: L.Marker }>({});
  const gpsMarkerRef = useRef<L.LayerGroup | null>(null);
  const clickedMarkerRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const baseLabelLayerRef = useRef<L.TileLayer | null>(null);

  // Layer & Display States - Default to modern Hybrid Satellite + Street labels for maximum clarity
  const [tileMode, setTileMode] = useState<'hybrid' | 'streets' | 'satellite'>('hybrid');
  const [showBuildings, setShowBuildings] = useState(true);
  const [showBuildingLabels, setShowBuildingLabels] = useState(true);
  const [showLandUseColors, setShowLandUseColors] = useState(true);
  const [showRiskColors, setShowRiskColors] = useState(false);
  const [showAiAlertOverlay, setShowAiAlertOverlay] = useState(true);
  const [showWaterBuffer, setShowWaterBuffer] = useState(true);
  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(false);

  // Dynamic Land Click & Search States
  const [isResolvingLand, setIsResolvingLand] = useState(false);
  const [landNotification, setLandNotification] = useState<{
    title: string;
    subtitle: string;
    survey: string;
    patta: string;
  } | null>(null);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Initial center around Coimbatore or GPS
  const defaultCenter: [number, number] = [11.0168, 76.9685]; // Gandhipuram / Coimbatore City Center

  // Helper to compute building coordinates if not explicitly set
  const getBuildingCoords = (parcel: Parcel): [number, number][] => {
    if (parcel.geometry.buildingCoordinates && parcel.geometry.buildingCoordinates.length > 0) {
      return parcel.geometry.buildingCoordinates;
    }
    const coords = parcel.geometry.coordinates;
    if (coords.length < 3) return [];
    const cLat = parcel.geometry.center[0];
    const cLng = parcel.geometry.center[1];
    
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    coords.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
    
    const latOffset = (maxLat - minLat) * 0.28;
    const lngOffset = (maxLng - minLng) * 0.28;
    const setbackOffset = (maxLat - minLat) * 0.08;

    return [
      [cLat + latOffset - setbackOffset, cLng - lngOffset],
      [cLat + latOffset - setbackOffset, cLng + lngOffset],
      [cLat - latOffset - setbackOffset, cLng + lngOffset],
      [cLat - latOffset - setbackOffset, cLng - lngOffset],
    ];
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom positioned zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer: Esri Satellite with Reference Labels (Hybrid mode)
    const satLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 20 }
    );
    satLayer.addTo(map);
    baseTileLayerRef.current = satLayer;

    const labelLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 20 }
    );
    labelLayer.addTo(map);
    baseLabelLayerRef.current = labelLayer;

    // Layer group for GPS marker
    gpsMarkerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Base Tiles (Hybrid, Crisp Streets, or Pure Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (baseLabelLayerRef.current) {
      map.removeLayer(baseLabelLayerRef.current);
      baseLabelLayerRef.current = null;
    }

    if (tileMode === 'hybrid') {
      // High-resolution satellite + roads and building names
      const sat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 20 }
      );
      sat.addTo(map);
      baseTileLayerRef.current = sat;

      const labels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 20 }
      );
      labels.addTo(map);
      baseLabelLayerRef.current = labels;
    } else if (tileMode === 'streets') {
      // Ultra-Clarity CartoDB Voyager: Crisp street grid, building footprints & high readability
      const streets = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 20,
          subdomains: 'abcd',
        }
      );
      streets.addTo(map);
      baseTileLayerRef.current = streets;
    } else {
      // Pure Satellite Imagery without labels
      const satOnly = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 20 }
      );
      satOnly.addTo(map);
      baseTileLayerRef.current = satOnly;
    }
  }, [tileMode]);

  // Determine Cadastral Boundary Polygon Styling
  const getParcelStyle = (parcel: Parcel, isSelected: boolean) => {
    let fillColor = '#10b981'; // default emerald
    let fillOpacity = 0.28;
    let strokeColor = '#059669';
    let weight = 2.5;

    if (showRiskColors) {
      if (parcel.risk.riskLevel === 'LOW') {
        fillColor = '#10b981';
        strokeColor = '#047857';
      } else if (parcel.risk.riskLevel === 'MEDIUM') {
        fillColor = '#f59e0b';
        strokeColor = '#d97706';
      } else {
        fillColor = '#ef4444';
        strokeColor = '#b91c1c';
      }
    } else if (showLandUseColors) {
      switch (parcel.landUse) {
        case 'Residential':
          fillColor = '#3b82f6';
          strokeColor = '#1d4ed8';
          break;
        case 'Commercial':
          fillColor = '#8b5cf6';
          strokeColor = '#6d28d9';
          break;
        case 'Agricultural':
          fillColor = '#10b981';
          strokeColor = '#047857';
          break;
        case 'Government / Protected':
          fillColor = '#f43f5e';
          strokeColor = '#be123c';
          break;
        default:
          fillColor = '#64748b';
          strokeColor = '#334155';
      }
    }

    // AI Alert highlight
    if (showAiAlertOverlay && parcel.satelliteAi.hasAlert) {
      strokeColor = '#f43f5e';
      weight = 3.5;
      fillOpacity = 0.45;
    }

    // Selected state overrides
    if (isSelected) {
      return {
        fillColor: '#06b6d4',
        fillOpacity: 0.45,
        color: '#ffffff',
        weight: 3.5,
        dashArray: undefined,
      };
    }

    return {
      fillColor,
      fillOpacity,
      color: strokeColor,
      weight,
      dashArray: parcel.satelliteAi.hasAlert && showAiAlertOverlay ? '4, 4' : undefined,
    };
  };

  // Render Parcels & High-Visibility Buildings on Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old cadastral layers
    Object.values(polygonLayersRef.current).forEach((poly) => map.removeLayer(poly));
    polygonLayersRef.current = {};

    // Clear old building layers
    Object.values(buildingLayersRef.current).forEach((poly) => map.removeLayer(poly));
    buildingLayersRef.current = {};

    // Clear old building center markers
    Object.values(buildingMarkersRef.current).forEach((marker) => map.removeLayer(marker));
    buildingMarkersRef.current = {};

    parcels.forEach((parcel) => {
      const isSelected = selectedParcel?.parcelId === parcel.parcelId;
      const style = getParcelStyle(parcel, isSelected);

      // 1. Cadastral Boundary Polygon
      const latlngs: L.LatLngExpression[] = parcel.geometry.coordinates.map((pt) => [pt[0], pt[1]]);
      const polygon = L.polygon(latlngs, style).addTo(map);

      // Cadastral tooltip
      polygon.bindTooltip(
        `<div style="font-size:11px; font-weight:600; line-height:1.4;">
          <div style="color:#34d399; font-weight:bold;">Sy: ${parcel.surveyNumber} • Patta: ${parcel.ownership.pattaNumber}</div>
          <div style="color:#f8fafc;">${parcel.ownership.ownerName}</div>
          <div style="color:#94a3b8; font-size:10px;">${parcel.village} • ${parcel.landUse} • ${parcel.areaSqFt.toLocaleString()} sq.ft</div>
        </div>`,
        { sticky: true, className: 'gis-tooltip' }
      );

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectParcel(parcel);
      });

      polygonLayersRef.current[parcel.parcelId] = polygon;

      // 2. High-Visibility Building Footprint & Structure
      if (showBuildings) {
        const bCoords = getBuildingCoords(parcel);
        if (bCoords.length >= 3) {
          const bLatLngs: L.LatLngExpression[] = bCoords.map((pt) => [pt[0], pt[1]]);

          // Distinct high-contrast building styling
          const buildingPoly = L.polygon(bLatLngs, {
            fillColor: isSelected ? '#f59e0b' : '#38bdf8', // Warm amber when selected, else bright architectural cyan/sky
            fillOpacity: isSelected ? 0.85 : 0.72,
            color: isSelected ? '#fef08a' : '#ffffff',
            weight: isSelected ? 3 : 2,
            className: 'building-polygon-shadow',
          }).addTo(map);

          const bDim = parcel.geometry.buildingDimensions;
          const bType = bDim?.structureType || (parcel.building.hasPermission ? 'RCC Framed Structure' : 'Permanent Building');
          const bFloors = bDim?.floors || parcel.building.floorsApproved || 2;
          const bArea = (bDim?.builtUpAreaSqFt || parcel.building.approvedAreaSqFt || 2150).toLocaleString();
          const bWidth = bDim?.widthMeters || 18;
          const bLength = bDim?.lengthMeters || 14;

          buildingPoly.bindTooltip(
            `<div style="font-size:11px; font-weight:600; line-height:1.4; min-width:160px;">
              <div style="color:#38bdf8; font-weight:bold; font-size:12px; display:flex; align-items:center; gap:4px;">
                🏢 <span>${bType}</span>
              </div>
              <div style="color:#f8fafc; margin-top:2px;">
                Built-Up: <strong style="color:#38bdf8;">${bArea} sq.ft</strong> (${bFloors} Floors)
              </div>
              <div style="color:#cbd5e1; font-size:10px;">
                Footprint: ${bWidth}m × ${bLength}m • Front Setback: 3.5m
              </div>
              <div style="color:#34d399; font-size:10px; margin-top:2px; font-weight:bold;">
                ✓ Approved Building Plan (${parcel.building.approvalStatus})
              </div>
            </div>`,
            { sticky: true, className: 'building-tooltip' }
          );

          buildingPoly.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectParcel(parcel);
          });

          buildingLayersRef.current[parcel.parcelId] = buildingPoly;

          // 3. Clear Building Center Badge
          if (showBuildingLabels) {
            let latSum = 0;
            let lngSum = 0;
            bCoords.forEach((pt) => {
              latSum += pt[0];
              lngSum += pt[1];
            });
            const bCenterLat = latSum / bCoords.length;
            const bCenterLng = lngSum / bCoords.length;

            const badgeIcon = L.divIcon({
              className: 'building-center-badge',
              html: `
                <div style="
                  background: ${isSelected ? 'rgba(217, 119, 6, 0.95)' : 'rgba(15, 23, 42, 0.92)'};
                  color: #ffffff;
                  font-size: 10px;
                  font-weight: 700;
                  padding: 2px 6px;
                  border-radius: 4px;
                  border: 1px solid ${isSelected ? '#fef08a' : '#38bdf8'};
                  white-space: nowrap;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.5);
                  display: flex;
                  align-items: center;
                  gap: 3px;
                  transform: translate(-50%, -50%);
                  pointer-events: none;
                ">
                  <span>🏢 ${bFloors}F</span>
                  <span style="opacity:0.85; font-size:9px;">${bArea} sq.ft</span>
                </div>
              `,
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            });

            const badgeMarker = L.marker([bCenterLat, bCenterLng], {
              icon: badgeIcon,
              interactive: false,
            }).addTo(map);

            buildingMarkersRef.current[parcel.parcelId] = badgeMarker;
          }
        }
      }
    });
  }, [parcels, selectedParcel, showLandUseColors, showRiskColors, showAiAlertOverlay, showBuildings, showBuildingLabels]);

  // Add water body buffer layer if enabled
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const canalPolyline = L.polyline(
      [
        [10.8530, 78.7040],
        [10.8535, 78.7058],
        [10.8532, 78.7075],
      ],
      {
        color: '#0284c7',
        weight: 6,
        opacity: showWaterBuffer ? 0.75 : 0,
      }
    ).addTo(map);

    canalPolyline.bindTooltip(
      '<div style="color:#38bdf8; font-weight:bold; font-size:11px;">Koraiyar Tributary (15m Statutory Buffer Zone)</div>',
      { sticky: true, className: 'gis-tooltip' }
    );

    return () => {
      map.removeLayer(canalPolyline);
    };
  }, [showWaterBuffer]);

  // Center on Selected Parcel
  useEffect(() => {
    if (selectedParcel && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedParcel.geometry.center, 17, { duration: 0.8 });
    }
  }, [selectedParcel]);

  // Render GPS Position Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !gpsMarkerRef.current) return;
    gpsMarkerRef.current.clearLayers();

    if (gpsLocation) {
      const gpsLatLng: [number, number] = [gpsLocation.lat, gpsLocation.lng];

      // Outer accuracy ring
      const accuracyCircle = L.circle(gpsLatLng, {
        radius: gpsLocation.accuracy,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 1.5,
      });

      // Center pulsing marker
      const centerMarker = L.circleMarker(gpsLatLng, {
        radius: 8,
        color: '#ffffff',
        fillColor: '#059669',
        fillOpacity: 1,
        weight: 2.5,
      });

      const matchedLabel = selectedParcel ? `Survey ${selectedParcel.surveyNumber} (${selectedParcel.village})` : 'Live Cadastral Parcel';
      const addressLabel = gpsLocation.address || `${gpsLocation.city || 'Location'}, ${gpsLocation.state || 'India'}`;

      centerMarker.bindPopup(
        `<div style="color:#0f172a; font-size:12px; font-weight:600; min-width:180px;">
          <div style="color:#059669; font-weight:bold; font-size:13px; margin-bottom:3px;">📍 Your Live Location</div>
          <div style="font-size:11px; color:#475569; margin-bottom:5px;">${addressLabel}</div>
          <div>Lat: ${gpsLocation.lat.toFixed(5)}° | Lng: ${gpsLocation.lng.toFixed(5)}°</div>
          <div>Accuracy: ±${gpsLocation.accuracy}m</div>
          <div style="margin-top:5px; padding:3px 6px; background:#ecfdf5; border-radius:4px; font-size:10px; color:#065f46; font-weight:bold;">
            Cadastral: ${matchedLabel}
          </div>
        </div>`
      );

      gpsMarkerRef.current.addLayer(accuracyCircle);
      gpsMarkerRef.current.addLayer(centerMarker);

      // Pan to user position
      mapInstanceRef.current.flyTo(gpsLatLng, 17, { duration: 1 });
    }
  }, [gpsLocation, selectedParcel]);

  // Helper to show rich Leaflet popup with Patta and Survey Numbers
  const showLandPopup = (map: L.Map, parcel: Parcel, latlng: [number, number]) => {
    const content = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; min-width: 230px; color: #0f172a; padding: 2px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
          <div style="font-size: 13px; font-weight: 800; color: #059669; display: flex; align-items: center; gap: 4px;">
            <span>📍 Land Details</span>
          </div>
          <span style="font-size: 10px; font-weight: 700; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 1px 6px; border-radius: 9999px;">
            Active Cadastre
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
          <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 4px 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #4338ca; text-transform: uppercase;">Survey No</div>
            <div style="font-size: 13px; font-weight: 800; font-family: monospace; color: #1e1b4b;">${parcel.surveyNumber}</div>
          </div>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 4px 6px;">
            <div style="font-size: 9px; font-weight: 700; color: #15803d; text-transform: uppercase;">Patta No</div>
            <div style="font-size: 12px; font-weight: 800; font-family: monospace; color: #052e16;">${parcel.ownership.pattaNumber}</div>
          </div>
        </div>

        <div style="font-size: 11px; margin-bottom: 3px;">
          <span style="color: #64748b;">Owner:</span> <strong style="color: #0f172a;">${parcel.ownership.ownerName}</strong>
        </div>

        <div style="font-size: 11px; color: #334155; margin-bottom: 3px;">
          <span style="color: #64748b;">Area:</span> <strong>${parcel.areaSqFt.toLocaleString()} sq.ft</strong> (${(parcel.areaSqFt / 435.6).toFixed(2)} Cents)
        </div>

        <div style="font-size: 10px; color: #64748b; margin-top: 4px; border-top: 1px dashed #e2e8f0; padding-top: 4px; display: flex; justify-content: space-between;">
          <span>${parcel.village}, ${parcel.taluk}</span>
          <span style="font-weight: 600; color: #059669;">${parcel.landUse}</span>
        </div>
      </div>
    `;

    L.popup({
      className: 'cadastral-selected-popup',
      autoPan: true,
      closeButton: true,
    })
      .setLatLng(latlng)
      .setContent(content)
      .openOn(map);
  };

  // Click listener anywhere on the map to inspect nearby land
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // 1. Check if user clicked inside an existing parcel polygon
      const currentParcels = landService.getAllParcels();
      let matched: Parcel | null = null;

      for (const p of currentParcels) {
        if (p.geometry && p.geometry.coordinates && isPointInPolygon([lat, lng], p.geometry.coordinates)) {
          matched = p;
          break;
        }
      }

      // 2. Proximity check if within 18 meters of any parcel center
      if (!matched) {
        const nearest = landService.findNearestParcel(lat, lng);
        if (nearest && nearest.distanceMeters <= 18) {
          matched = nearest.parcel;
        }
      }

      if (matched) {
        onSelectParcel(matched);
        showLandPopup(map, matched, [lat, lng]);
        setLandNotification({
          title: `Selected Land: ${matched.ownership.ownerName}`,
          subtitle: `${matched.village}, ${matched.taluk}`,
          survey: matched.surveyNumber,
          patta: matched.ownership.pattaNumber,
        });
        return;
      }

      // 3. User clicked nearby land or outside existing parcels: Generate live cadastral record!
      setIsResolvingLand(true);

      // Temporary click pin indicator with ripple
      if (!clickedMarkerRef.current) {
        clickedMarkerRef.current = L.layerGroup().addTo(map);
      }
      clickedMarkerRef.current.clearLayers();

      const pulseIcon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #06b6d4; opacity: 0.75; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 4px; border-radius: 9999px; background-color: #0891b2; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([lat, lng], { icon: pulseIcon }).addTo(clickedMarkerRef.current);

      try {
        const geo = await reverseGeocodeLocation(lat, lng);
        const newParcel = generateLiveCadastralParcel(lat, lng, geo);

        // Register into land registry service
        landService.addParcel(newParcel);

        // Select it globally
        onSelectParcel(newParcel);

        // Show popup on map
        showLandPopup(map, newParcel, [lat, lng]);

        // Show top notification toast
        setLandNotification({
          title: `Nearby Land Identified: ${newParcel.ownership.ownerName}`,
          subtitle: `${newParcel.village}, ${newParcel.taluk} (${newParcel.classification})`,
          survey: newParcel.surveyNumber,
          patta: newParcel.ownership.pattaNumber,
        });
      } catch (err) {
        console.error('Error generating nearby land:', err);
      } finally {
        setIsResolvingLand(false);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [onSelectParcel]);

  // Handle Quick Search by Survey or Patta Number
  const handleQuickSySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchQuery.trim()) return;
    const term = quickSearchQuery.trim();
    const found = landService.getParcelById(term) || landService.searchParcels(term)[0];
    if (found) {
      onSelectParcel(found);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(found.geometry.center, 18, { duration: 0.8 });
        showLandPopup(mapInstanceRef.current, found, found.geometry.center);
      }
      setSearchFeedback(`Found: Survey #${found.surveyNumber} • Patta #${found.ownership.pattaNumber}`);
      setTimeout(() => setSearchFeedback(null), 3500);
      setIsQuickSearchOpen(false);
    } else {
      setSearchFeedback(`No record matching "${term}". Click anywhere on map to identify that land!`);
      setTimeout(() => setSearchFeedback(null), 4000);
    }
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      if (gpsLocation) {
        mapInstanceRef.current.flyTo([gpsLocation.lat, gpsLocation.lng], 17, { duration: 0.8 });
      } else if (selectedParcel) {
        mapInstanceRef.current.flyTo(selectedParcel.geometry.center, 17, { duration: 0.8 });
      } else {
        mapInstanceRef.current.flyTo(defaultCenter, 16, { duration: 0.8 });
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col bg-slate-950">
      {/* Top Floating Map Header Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-xl p-2.5 shadow-xl pointer-events-auto flex items-center gap-3">
          {gpsLocation ? (
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isLiveTracking ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-xs font-bold text-emerald-300">Live GPS: {gpsLocation.city || 'Acquired'}</span>
              <span className="text-[11px] text-slate-300 hidden sm:inline">
                {gpsLocation.lat.toFixed(4)}°, {gpsLocation.lng.toFixed(4)}° (±{gpsLocation.accuracy}m)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-100">GIS Cadastral Layer Active</span>
            </div>
          )}
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-300 hidden sm:inline">
            {selectedParcel ? `${selectedParcel.village} • Survey ${selectedParcel.surveyNumber}` : 'Cadastral Spatial Grid'}
          </span>
        </div>

        {/* Action buttons: GPS, Quick Map Switcher, Layers Drawer, Reset */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Base Tile Switcher Pills */}
          <div className="hidden md:flex items-center bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-0.5 shadow-lg text-xs">
            <button
              onClick={() => setTileMode('hybrid')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                tileMode === 'hybrid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="High-resolution satellite with sharp street & building labels"
            >
              Satellite Hybrid
            </button>
            <button
              onClick={() => setTileMode('streets')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                tileMode === 'streets'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Clean vector streets and building geometry"
            >
              Crisp Streets
            </button>
            <button
              onClick={() => setTileMode('satellite')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                tileMode === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Satellite imagery only"
            >
              Satellite
            </button>
          </div>

          <button
            onClick={() => setIsQuickSearchOpen(!isQuickSearchOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shadow-lg text-xs font-semibold transition-all ${
              isQuickSearchOpen
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700'
            }`}
            title="Search land by Survey Number or Patta Number"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Find Sy / Patta</span>
          </button>

          <button
            onClick={findLandAroundMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg text-xs font-semibold transition-all active:scale-95"
            title="Share my location & inspect all features of the land I am standing on"
          >
            <MapPin className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting GPS...' : 'Share Location & Around Me'}</span>
          </button>

          <button
            onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg shadow-lg text-xs font-semibold transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">GIS Layers</span>
          </button>

          <button
            onClick={resetView}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg shadow-lg transition-colors"
            title="Snap to my location or center"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Search by Survey / Patta Dropdown Bar */}
      {isQuickSearchOpen && (
        <div className="absolute top-16 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 z-30 bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
          <form onSubmit={handleQuickSySearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Enter Survey No (e.g. 14/2A) or Patta No..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Locate
            </button>
            <button
              type="button"
              onClick={() => setIsQuickSearchOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
          {searchFeedback && (
            <div className="mt-2 text-[11px] text-amber-300 font-medium px-1">
              {searchFeedback}
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Tip: Or click anywhere on the map to inspect nearby land!</span>
            <span className="text-emerald-400 font-medium">Auto-Survey Active</span>
          </div>
        </div>
      )}

      {/* Dynamic Land Selection Banner Notification */}
      {landNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 text-white border border-emerald-500/60 rounded-xl shadow-2xl px-4 py-2.5 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-lg w-[92%] sm:w-auto">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-xs min-w-0 flex-1">
            <div className="font-bold text-white truncate">{landNotification.title}</div>
            <div className="text-slate-300 text-[11px] flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.5 bg-indigo-950 border border-indigo-500/60 text-indigo-200 font-mono font-bold rounded text-[10px]">
                Sy: {landNotification.survey}
              </span>
              <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-500/60 text-emerald-200 font-mono font-bold rounded text-[10px]">
                Patta: {landNotification.patta}
              </span>
              <span className="text-slate-400 truncate text-[10px]">{landNotification.subtitle}</span>
            </div>
          </div>
          <button
            onClick={() => setLandNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Resolving Indicator Banner */}
      {isResolvingLand && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-indigo-950/95 text-white border border-indigo-500/60 rounded-xl shadow-2xl px-4 py-2.5 flex items-center gap-3 animate-in fade-in duration-150">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div className="text-xs font-semibold">
            Surveying clicked location • Generating cadastral record with Survey & Patta numbers...
          </div>
        </div>
      )}

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />

      {/* Layer Control Floating Drawer */}
      {isLayerDrawerOpen && (
        <div className="absolute top-16 right-3 z-30 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-4 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-100">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>MAP & CADASTRE CONTROLS</span>
            </div>
            <button
              onClick={() => setIsLayerDrawerOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3.5 max-h-[70vh] overflow-y-auto">
            {/* Base Imagery Selection */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Map Basemap (Clarity & Visibility)
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setTileMode('hybrid')}
                  className={`py-1.5 px-2 rounded text-center text-[11px] font-medium transition-colors ${
                    tileMode === 'hybrid'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Satellite Hybrid
                </button>
                <button
                  onClick={() => setTileMode('streets')}
                  className={`py-1.5 px-2 rounded text-center text-[11px] font-medium transition-colors ${
                    tileMode === 'streets'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Crisp Streets
                </button>
                <button
                  onClick={() => setTileMode('satellite')}
                  className={`py-1.5 px-2 rounded text-center text-[11px] font-medium transition-colors ${
                    tileMode === 'satellite'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Satellite Only
                </button>
              </div>
            </div>

            {/* Building Visibility Controls */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-400" />
                <span>Building Structures & Footprints</span>
              </div>
              <div className="space-y-1.5 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800/80 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
                    <span>Show Building Footprints</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showBuildings}
                    onChange={(e) => setShowBuildings(e.target.checked)}
                    className="accent-sky-500"
                  />
                </label>

                <label className="flex items-center justify-between p-1 rounded hover:bg-slate-800/80 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />
                    <span>Floor & Built-Up Badges</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showBuildingLabels}
                    onChange={(e) => setShowBuildingLabels(e.target.checked)}
                    className="accent-sky-500"
                  />
                </label>
              </div>
            </div>

            {/* Cadastral Thematic Overlays */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Cadastral Overlays
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                    <span>Zoning & Land Use Category</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showLandUseColors}
                    onChange={(e) => {
                      setShowLandUseColors(e.target.checked);
                      if (e.target.checked) setShowRiskColors(false);
                    }}
                    className="accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                    <span>Risk Heatmap (0-100 Score)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showRiskColors}
                    onChange={(e) => {
                      setShowRiskColors(e.target.checked);
                      if (e.target.checked) setShowLandUseColors(false);
                    }}
                    className="accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                    <span>AI Satellite Deviation Alerts</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showAiAlertOverlay}
                    onChange={(e) => setShowAiAlertOverlay(e.target.checked)}
                    className="accent-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                    <span>Water Canal 15m Buffer Zone</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={showWaterBuffer}
                    onChange={(e) => setShowWaterBuffer(e.target.checked)}
                    className="accent-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* Map Legend */}
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              <div className="font-semibold mb-1 text-slate-300">Map Legend:</div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 border border-white" /> Building Footprint
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Residential Plot
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Commercial Plot
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Agricultural Land
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Selected Parcel Quick Inspection Card */}
      {selectedParcel && (
        <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-3.5 text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600/40 text-emerald-300 text-xs font-mono font-bold rounded">
                  {selectedParcel.parcelId}
                </span>
                <span className="text-[11px] font-mono text-slate-400 truncate">{selectedParcel.ulpin}</span>
              </div>
              <h3 className="font-bold text-sm text-white mt-1 truncate">{selectedParcel.ownership.ownerName}</h3>
              
              {/* Prominent Survey No & Patta No Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-indigo-950/90 border border-indigo-500/60 text-indigo-200 text-xs font-mono font-bold rounded flex items-center gap-1 shadow-xs">
                  <span className="text-indigo-400 text-[10px] font-sans font-bold">SURVEY:</span>
                  <span className="text-white">{selectedParcel.surveyNumber}</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-mono font-bold rounded flex items-center gap-1 shadow-xs">
                  <span className="text-emerald-400 text-[10px] font-sans font-bold">PATTA:</span>
                  <span className="text-white">{selectedParcel.ownership.pattaNumber}</span>
                </span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">
                  Sub-Div: {selectedParcel.subDivision || '1'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1.5">
                {selectedParcel.village}, {selectedParcel.taluk}, {selectedParcel.district}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedParcel.risk.riskLevel === 'LOW'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : selectedParcel.risk.riskLevel === 'MEDIUM'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                Risk: {selectedParcel.risk.overallScore}/100
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                {selectedParcel.areaSqFt.toLocaleString()} sq.ft
              </div>
            </div>
          </div>

          {/* Building & Structure Specific Row */}
          <div className="mt-2.5 p-2 bg-sky-950/40 border border-sky-800/50 rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <div className="truncate">
                <span className="font-bold text-sky-200">
                  {selectedParcel.geometry.buildingDimensions?.structureType || 'RCC Framed Structure'}
                </span>
                <span className="text-[10px] text-sky-300/80 block">
                  {selectedParcel.geometry.buildingDimensions?.floors || 2} Floors • {(selectedParcel.geometry.buildingDimensions?.builtUpAreaSqFt || 2150).toLocaleString()} sq.ft built-up
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-sky-900 text-sky-200 rounded font-semibold whitespace-nowrap">
              Footprint Visible
            </span>
          </div>

          {/* Key Indicators Row */}
          <div className="grid grid-cols-3 gap-2 my-2.5 pt-2 border-t border-slate-800 text-[11px]">
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Zoning</span>
              <span className="font-medium text-slate-200 truncate block">{selectedParcel.landUse}</span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Encumbrance</span>
              <span className="font-medium text-slate-200 truncate block">
                {selectedParcel.encumbrance.hasMortgage ? '⚠ Mortgage' : '✓ Nil EC'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">AI Status</span>
              <span className={`font-medium truncate block ${selectedParcel.satelliteAi.hasAlert ? 'text-rose-400' : 'text-emerald-400'}`}>
                {selectedParcel.satelliteAi.hasAlert ? '⚠ Deviation' : '✓ Conforming'}
              </span>
            </div>
          </div>

          {/* Action trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={openLocationSurroundings}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspect All Features On This Land</span>
            </button>
            <button
              onClick={() => openParcel360(selectedParcel)}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              title="Open full 360° land profile"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">360°</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
