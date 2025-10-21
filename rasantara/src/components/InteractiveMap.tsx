"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import type mapboxgl from "mapbox-gl";
import provinceCoords from '@/lib/provinceCoords';

// Add custom styles for better UI
const customStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  .mapboxgl-popup-content {
    padding: 15px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    font-family: system-ui, -apple-system, sans-serif;
  }
  .mapboxgl-popup-close-button {
    font-size: 20px;
    padding: 0 8px;
    color: #6b7280;
  }
  .mapboxgl-popup-close-button:hover {
    background: #f3f4f6;
    color: #111827;
  }
  .map-sidebar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 4px 0 20px rgba(0,0,0,0.1);
  }
  .province-item {
    transition: all 0.3s ease;
    border-radius: 8px;
    margin-bottom: 8px;
    padding: 12px;
    cursor: pointer;
  }
  .province-item:hover {
    background: rgba(255,255,255,0.15);
    transform: translateX(5px);
  }
  .province-item.active {
    background: rgba(255,255,255,0.25);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

// Type definitions
interface Origin {
  province?: string;
  island?: string;
  cultural_significance?: string;
}

interface FoodItem {
  name: string;
  alternate_names?: string[];
  description?: string;
  photo?: string;
  model3D?: string;
  origin?: Origin;
  category?: string;
  course?: string;
  main_ingredients?: string[];
  province?: string;
  foods?: string[];
}

interface ProvinceGroups {
  [key: string]: FoodItem[];
}

interface ProvinceFoods {
  [key: string]: string[];
}

const Map: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // default view: Indonesia - Zoom fit untuk seluruh Indonesia (Sabang-Merauke)
  const [zoom, setZoom] = useState<number>(4.8);
  const [lng, setLng] = useState<number>(118);
  const [lat, setLat] = useState<number>(-2);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [provinceFoods, setProvinceFoods] = useState<ProvinceFoods>({});
  const [mapError, setMapError] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [geoJson] = useState<FoodItem[]>([]);

  // helper to get coordinates for a data point (falls back to province coords or project center)
  const getCoords = useCallback((point: FoodItem): [number, number] => {
    const prov = (point.origin && point.origin.province) || point.province || "Unknown";
    const c = provinceCoords[prov];
    if (c) return c;
    return [lng, lat];
  }, [lng, lat]);

  useEffect(() => {
    let map: mapboxgl.Map | null = null;
    let loadTimer: ReturnType<typeof setTimeout>;

    const initialize = async () => {
      if (!mapContainerRef.current) return;

      // Dynamic import mapbox-gl to avoid SSR issues
      const mapboxgl = (await import('mapbox-gl')).default;

      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      // if token present, use Mapbox style; otherwise fallback to a public MapLibre style
      const styleUrl = token
        ? "mapbox://styles/mapbox/streets-v11"
        : "https://demotiles.maplibre.org/style.json";

      if (token) {
        mapboxgl.accessToken = token;
      } else {
        console.warn("No NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN found — using public MapLibre style fallback.");
      }

      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [118, -2], // Indonesia center
        zoom: 4.8, // Perfect zoom untuk Sabang-Merauke
        minZoom: 4, // Prevent zooming out too much
        maxZoom: 18 // Allow detailed zoom
      });

      // if map doesn't load within 4s, show fallback
      loadTimer = setTimeout(() => {
        if (!map || !map.loaded()) setMapError(true);
      }, 4000);

      // expose map to handlers
      mapRef.current = map;

      // debug: log groups and missing province coordinate keys
      try {
        const provNames = Object.keys(groups || {});
        const missing = provNames.filter((p) => !provinceCoords[p]);
        console.info("Map initialized. features:", geoJson.length, "provinces:", provNames.length, "missingProvinceCoords:", missing.slice(0, 20));
      } catch {
        // ignore
      }

      map.on("load", function () {
        clearTimeout(loadTimer);
        // ensure fallback state is cleared when the map actually loads
        try {
          setMapError(false);
          setMapLoaded(true);
        } catch (e) {
          console.error(e);
        }

        if (!map) return;

        // Add points source with properties (province, foods)
        if (!map.getSource("points")) {
          map.addSource("points", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: geoJson.map((point: FoodItem, i: number) => {
                const [plng, plat] = getCoords(point);
                return {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [Number(plng) || lng, Number(plat) || lat],
                  },
                  properties: {
                    title: point.name || `Point ${i + 1}`,
                    province: (point.origin && point.origin.province) || point.province || "Unknown",
                    foods: JSON.stringify(point.foods || []),
                  },
                };
              }),
            },
          });
        }

        // Add a line source derived from getCoords so we don't depend on missing long/lat
        if (!map.getSource("line")) {
          map.addSource("line", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: geoJson.map((point: FoodItem) => {
                  const [plng, plat] = getCoords(point);
                  return [Number(plng) || lng, Number(plat) || lat];
                }),
              },
            },
          });
        }

        // Circle layer to show points (always added, no external image required)
        if (!map.getLayer("points")) {
          map.addLayer({
            id: "points",
            type: "circle",
            source: "points",
            paint: {
              "circle-radius": 6,
              "circle-color": "#3b82f6",
              "circle-stroke-width": 1,
              "circle-stroke-color": "white",
            },
          });
        }

        // Glow effect layer (shadow untuk pin marker)
        if (!map.getLayer("province-markers-shadow")) {
          map.addLayer({
            id: "province-markers-shadow",
            type: "circle",
            source: "points",
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4, 14,
                8, 20,
                12, 28
              ],
              "circle-color": "#558B2F",
              "circle-opacity": 0.3,
              "circle-blur": 1.5
            },
          });
        }

        // Pin marker body (hijau terang seperti gambar)
        if (!map.getLayer("province-markers-pin")) {
          map.addLayer({
            id: "province-markers-pin",
            type: "circle",
            source: "points",
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4, 10,
                8, 16,
                12, 22
              ],
              "circle-color": "#7CB342", // Light green seperti pin Google Maps
              "circle-stroke-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4, 2,
                8, 3,
                12, 4
              ],
              "circle-stroke-color": "#558B2F" // Dark green border
            },
          });
        }

        // Inner circle (black dot di tengah pin)
        if (!map.getLayer("province-markers-center")) {
          map.addLayer({
            id: "province-markers-center",
            type: "circle",
            source: "points",
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4, 4,
                8, 7,
                12, 10
              ],
              "circle-color": "#1B5E20" // Dark green/black center
            },
          });
        }

        // Label nama provinsi di ATAS pin marker
        if (!map.getLayer("province-labels")) {
          map.addLayer({
            id: "province-labels",
            type: "symbol",
            source: "points",
            layout: {
              "text-field": ["get", "province"],
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4, 10,
                8, 13,
                12, 16
              ],
              "text-offset": [0, -2], // Offset ke atas dari marker
              "text-anchor": "bottom", // Anchor di bawah agar tepat di atas marker
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-allow-overlap": false,
              "text-padding": 3,
              "symbol-spacing": 250
            },
            paint: {
              "text-color": "#1B5E20", // Dark green matching pin
              "text-halo-color": "#FFFFFF",
              "text-halo-width": 2.5,
              "text-halo-blur": 0.5
            }
          });
        }

        // Line visualization dengan gradient
        if (!map.getLayer("line")) {
          map.addLayer({
            id: "line",
            type: "line",
            source: "line",
            layout: {},
            paint: {
              "line-color": "#8b5cf6", // Purple color
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4, 1,
                8, 2,
                12, 3
              ],
              "line-opacity": 0.4,
              "line-blur": 1
            },
          });
        }

        // Add a highlight layer for selected province dengan animasi
        if (!map.getLayer("highlight-circle")) {
          map.addLayer({
            id: "highlight-circle",
            type: "circle",
            source: "points",
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4, 15,
                8, 20,
                12, 25
              ],
              "circle-color": ["case", ["==", ["get", "province"], "__SELECTED__"], "#ec4899", "rgba(59,130,246,0)"],
              "circle-stroke-width": 4,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.8
            },
          });
        }

        // Popup on click to show foods for a point
        map.on("click", "province-markers-pin", (e: mapboxgl.MapMouseEvent) => {
          if (!e.features || !e.features[0]) return;
          const feat = e.features[0];
          const foods = JSON.parse((feat.properties?.foods as string) || "[]");
          const html = `<strong>${feat.properties?.province}</strong><br/>${foods.map((f: string) => `<div>${f}</div>`).join("")}`;
          
          try {
            new mapboxgl.Popup()
              .setLngLat(feat.geometry.type === "Point" ? feat.geometry.coordinates as [number, number] : [lng, lat])
              .setHTML(html)
              .addTo(map!);
          } catch {
            // fallback: simple alert
            alert(`${feat.properties?.province}\n${foods.join('\n')}`);
          }
        });

        map.on("mouseenter", "province-markers-pin", () => {
          if (map) map.getCanvas().style.cursor = "pointer";
        });
        
        map.on("mouseleave", "province-markers-pin", () => {
          if (map) map.getCanvas().style.cursor = "";
        });
      });

      map.on("error", () => {
        setMapError(true);
      });

      // if the map throws style/load errors we still want to show the SVG fallback
      map.on('styledata', () => {
        try { 
          setMapLoaded(true); 
        } catch {
          console.error("Error setting map loaded state");
        }
      });

      map.on("move", () => {
        if (map) {
          setLng(Number(map.getCenter().lng.toFixed(4)));
          setLat(Number(map.getCenter().lat.toFixed(4)));
          setZoom(Number(map.getZoom().toFixed(2)));
        }
      });
    };

    initialize();

    return () => {
      if (map) map.remove();
    };
    // We intentionally run this effect only once on mount to initialize Mapbox.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // memoize groups so it's stable across renders
  const groups = useMemo<ProvinceGroups>(() => {
    return geoJson.reduce((acc: ProvinceGroups, p: FoodItem) => {
      const prov = (p.origin && p.origin.province) || p.province || "Unknown";
      if (!acc[prov]) acc[prov] = [];
      acc[prov].push(p);
      return acc;
    }, {});
  }, [geoJson]);

  useEffect(() => {
    const agg: ProvinceFoods = {};
    Object.keys(groups).forEach((prov) => {
      const foods = groups[prov].flatMap((pt: FoodItem) => pt.foods || []);
      agg[prov] = Array.from(new Set(foods));
    });
    setProvinceFoods(agg);
  }, [groups]);

  // effect: update highlight layer filter and fit bounds when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectedProvince) {
      try {
        map.setFilter("highlight-circle", ["==", ["get", "province"], "__NO_MATCH__"]);
      } catch {
        console.error("Error setting filter");
      }
      return;
    }

    // set filter to selected province
    try {
      map.setFilter("highlight-circle", ["==", ["get", "province"], selectedProvince]);
    } catch {
      // ignore if layer not ready
    }

    // compute bounds for province using getCoords helper
    const pts = groups[selectedProvince] || [];
    if (pts.length === 1) {
      const p = pts[0];
      const [plng, plat] = getCoords(p);
      if (!Number.isNaN(plng) && !Number.isNaN(plat)) {
        map.flyTo({ center: [plng, plat], zoom: 8 });
      }
    } else if (pts.length > 1) {
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      pts.forEach((p: FoodItem) => {
        const [plng, plat] = getCoords(p);
        if (typeof plng === 'number' && typeof plat === 'number') {
          if (plng < minLng) minLng = plng;
          if (plat < minLat) minLat = plat;
          if (plng > maxLng) maxLng = plng;
          if (plat > maxLat) maxLat = plat;
        }
      });
      if (isFinite(minLng) && isFinite(minLat) && isFinite(maxLng) && isFinite(maxLat)) {
        map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 40, maxZoom: 8 });
      }
    }
  }, [selectedProvince, groups, getCoords]);

  return (
    <>
      <style>{customStyles}</style>
      <div className="map-page">
        <aside className="map-sidebar">
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            🗺️ Provinsi Indonesia
          </h3>
          <div style={{ marginBottom: 16, background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Koordinat</div>
            <strong style={{ fontSize: '14px' }}>{lng}° | {lat}°</strong>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Zoom: {zoom}x</div>
          </div>
        {Object.keys(groups).map((prov) => (
          <div
            key={prov}
            className={`province-item ${selectedProvince === prov ? "active" : ""}`}
            onClick={() => {
              // toggle selection
              setSelectedProvince((cur: string | null) => (cur === prov ? null : prov));
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📍</span>
                <span style={{ fontWeight: selectedProvince === prov ? '600' : '400' }}>{prov}</span>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.25)', 
                padding: '4px 10px', 
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {groups[prov].length}
              </div>
            </div>

            {selectedProvince === prov && (
              <ul className="foods-list" style={{
                marginTop: '10px',
                paddingLeft: '28px',
                listStyle: 'none',
                fontSize: '13px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {(provinceFoods[prov] && provinceFoods[prov].length > 0
                  ? provinceFoods[prov]
                  : ["No food data"]).map((f, i) => (
                  <li key={i} style={{ 
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    🍽️ {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </aside>

      <div className="map-container" ref={mapContainerRef}>
        {/* Enhanced loading indicator */}
        {!mapLoaded && (
          <div style={{ 
            position: "absolute", 
            inset: 0, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          }}>
            <div style={{
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                animation: 'bounce 1s infinite'
              }}>
                🗺️
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                Memuat Peta Indonesia...
              </div>
              <div style={{ 
                marginTop: '20px',
                display: 'flex',
                gap: '8px',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'white',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'white',
                  animation: 'pulse 1.5s ease-in-out 0.3s infinite'
                }}></div>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'white',
                  animation: 'pulse 1.5s ease-in-out 0.6s infinite'
                }}></div>
              </div>
            </div>
          </div>
        )}

        {mapError && (
          <div style={{ position: "absolute", inset: 0 }}>
            <iframe
              title="OpenStreetMap"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.1}%2C${lat - 0.05}%2C${lng + 0.1}%2C${lat + 0.05}&layer=mapnik`}
              style={{ border: 0, width: "100%", height: "100%" }}
            />
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Map;