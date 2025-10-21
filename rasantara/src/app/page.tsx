"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import provinceCoords from "@/lib/provinceCoords";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import "mapbox-gl/dist/mapbox-gl.css";
import { IoClose } from "react-icons/io5";
import { PiBowlFoodFill } from "react-icons/pi";
import type mapboxgl from "mapbox-gl";

interface Origin {
  province?: string;
  island?: string;
  city_or_region?: string;
}

interface FoodItem {
  _id?: string;
  name: string;
  description?: string;
  photo?: string;
  origin?: Origin;
  category?: string;
  course?: string;
}

export default function Home() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const router = useRouter();
  
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [provinceFoods, setProvinceFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loadingSidebar, setLoadingSidebar] = useState<boolean>(false);

  // Fetch foods by province
  const fetchProvinceFoods = async (province: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/foods?province=${encodeURIComponent(province)}`);
      if (res.ok) {
        const data = await res.json();
        setProvinceFoods(data);
      } else {
        setProvinceFoods([]);
      }
    } catch (err) {
      console.error("Failed to fetch foods:", err);
      setProvinceFoods([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all foods for sidebar
  const fetchAllFoods = async () => {
    setLoadingSidebar(true);
    try {
      const res = await fetch('/api/foods');
      if (res.ok) {
        const data = await res.json();
        setAllFoods(data);
        setFilteredFoods(data);
      }
    } catch (err) {
      console.error("Failed to fetch all foods:", err);
    } finally {
      setLoadingSidebar(false);
    }
  };

  // Filter foods based on search and filters
  useEffect(() => {
    let filtered = [...allFoods];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter - handle "/" separator
    if (selectedCategory) {
      filtered = filtered.filter(food => {
        const category = food.category || "";
        // Split by "/" and trim spaces
        const categories = category.split('/').map((c: string) => c.trim());
        // Check if any category matches
        return categories.some((c: string) => c === selectedCategory);
      });
    }

    // Course filter - handle "/" separator and special cases
    if (selectedCourse) {
      filtered = filtered.filter(food => {
        const course = food.course || "";
        
        // Handle special shorthand cases like "/Siang" or "/Malam"
        if (course.startsWith('/')) {
          const shorthand = course.substring(1).trim(); // Remove leading "/"
          if (shorthand.toLowerCase() === 'siang' && selectedCourse === 'Makan Siang') {
            return true;
          }
          if (shorthand.toLowerCase() === 'malam' && selectedCourse === 'Makan Malam') {
            return true;
          }
        }
        
        // Split by "/" and trim spaces
        const courses = course.split('/').map((c: string) => c.trim());
        
        // Check if any course matches the selected course
        return courses.some((c: string) => {
          // Direct match
          if (c === selectedCourse) return true;
          
          // Handle "Malam" matching "Makan Malam"
          if (c.toLowerCase() === 'malam' && selectedCourse === 'Makan Malam') return true;
          
          // Handle "Siang" matching "Makan Siang"
          if (c.toLowerCase() === 'siang' && selectedCourse === 'Makan Siang') return true;
          
          return false;
        });
      });
    }

    setFilteredFoods(filtered);
  }, [searchQuery, selectedCategory, selectedCourse, allFoods]);

  // Load all foods when sidebar opens
  useEffect(() => {
    if (isSidebarOpen && allFoods.length === 0) {
      fetchAllFoods();
    }
  }, [isSidebarOpen, allFoods.length]);

  useEffect(() => {
    let map: mapboxgl.Map | null = null;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      const mapboxgl = (await import("mapbox-gl")).default;
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      if (token) {
        mapboxgl.accessToken = token;
      }

      const styleUrl = token
        ? "mapbox://styles/mapbox/streets-v11"
        : "https://demotiles.maplibre.org/style.json";

      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [118, -2],
        zoom: 4.8,
        minZoom: 4,
        maxZoom: 18,
      });

      mapRef.current = map;

      map.on("load", () => {
        if (!map) return;
        setMapReady(true);

        // Create GeoJSON features for all provinces
        const features = Object.keys(provinceCoords).map((provinceName: string) => {
          const coords = provinceCoords[provinceName];

          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: coords,
            },
            properties: {
              province: provinceName,
            },
          };
        });

        // Add source
        map.addSource("provinces", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: features,
          },
        });

        // Shadow layer
        map.addLayer({
          id: "province-markers-shadow",
          type: "circle",
          source: "provinces",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, 14,
              8, 20,
              12, 28,
            ],
            "circle-color": "#D97706",
            "circle-opacity": 0.3,
            "circle-blur": 1.5,
          },
        });

        // Pin body (amber/orange theme)
        map.addLayer({
          id: "province-markers-pin",
          type: "circle",
          source: "provinces",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, 10,
              8, 16,
              12, 22,
            ],
            "circle-color": "#F59E0B",
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, 2,
              8, 3,
              12, 4,
            ],
            "circle-stroke-color": "#D97706",
          },
        });

        // Center dot
        map.addLayer({
          id: "province-markers-center",
          type: "circle",
          source: "provinces",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, 4,
              8, 7,
              12, 10,
            ],
            "circle-color": "#92400E",
          },
        });

        // Labels
        map.addLayer({
          id: "province-labels",
          type: "symbol",
          source: "provinces",
          layout: {
            "text-field": ["get", "province"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              4, 10,
              8, 13,
              12, 16,
            ],
            "text-offset": [0, -2],
            "text-anchor": "bottom",
            "text-padding": 3,
            "text-optional": false,
            "symbol-spacing": 250,
            "text-max-angle": 45,
          },
          paint: {
            "text-color": "#92400E",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2.5,
            "text-halo-blur": 0.5,
          },
        });

        // Click handler
        map.on("click", "province-markers-pin", (e: mapboxgl.MapMouseEvent) => {
          if (!e.features || e.features.length === 0) return;
          const feature = e.features[0];
          const province = feature.properties?.province;
          
          if (!province) return;
          
          setSelectedProvince(province);
          setIsDrawerOpen(true);
          fetchProvinceFoods(province);

          // Fly to province
          if (map && feature.geometry.type === "Point") {
            map.flyTo({
              center: feature.geometry.coordinates as [number, number],
              zoom: 7,
              duration: 1000,
            });
          }
        });

        // Cursor pointer
        map.on("mouseenter", "province-markers-pin", () => {
          if (map) map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "province-markers-pin", () => {
          if (map) map.getCanvas().style.cursor = "";
        });
      });
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, []);

  // Close drawer and reset map view
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    
    // Zoom out to initial view
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [118, -2],
        zoom: 4.8,
        duration: 1000,
      });
    }
  };

  // Close drawer when clicking outside
  const handleDrawerBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeDrawer();
    }
  };

  // Group foods by province
  const foodsByProvince = filteredFoods.reduce((acc, food) => {
    const province = food.origin?.province || "Unknown";
    if (!acc[province]) {
      acc[province] = [];
    }
    acc[province].push(food);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col fixed inset-0">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-32 left-4 z-40 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        aria-label="Toggle Sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`fixed top-24 left-0 h-[calc(100vh-6rem)] w-full md:w-[500px] bg-gradient-to-br from-amber-50 to-orange-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ height: 'calc(90vh - 6rem)' }}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 p-6 shadow-md z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <PiBowlFoodFill className="text-3xl" />
              Semua Makanan
            </h2>
            <Button
              onClick={() => setIsSidebarOpen(false)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <IoClose className="text-2xl" />
            </Button>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Cari makanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/90 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-white"
          />

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/90 text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Semua Kategori</option>
              <option value="Hidangan Utama">Hidangan Utama</option>
              <option value="Kue Tradisional">Kue Tradisional</option>
              <option value="Sup">Sup</option>
              <option value="Lauk">Lauk</option>
              <option value="Camilan">Camilan</option>
              <option value="Seafood">Seafood</option>
              <option value="Gulai">Gulai</option>
              <option value="Roti">Roti</option>
              <option value="Pendamping">Pendamping</option>
              <option value="Bumbu">Bumbu</option>
              <option value="Sambal">Sambal</option>
            </select>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/90 text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Semua Course</option>
              <option value="Sarapan">Sarapan</option>
              <option value="Makan Siang">Makan Siang</option>
              <option value="Makan Malam">Makan Malam</option>
              <option value="Camilan">Camilan</option>
              <option value="Hidangan Penutup">Hidangan Penutup</option>
              <option value="Jajanan">Jajanan</option>
              <option value="Jamuan">Jamuan</option>
              <option value="Acara Adat">Acara Adat</option>
              <option value="Pesta">Pesta</option>
              <option value="Perayaan">Perayaan</option>
              <option value="Kenduri">Kenduri</option>
              <option value="Bekal">Bekal</option>
              <option value="Pendamping">Pendamping</option>
              <option value="Oleh-oleh">Oleh-oleh</option>
              <option value="Hari Raya">Hari Raya</option>
              <option value="Acara Khusus">Acara Khusus</option>
            </select>
          </div>

          <p className="text-amber-100 text-sm mt-3">
            {filteredFoods.length} makanan ditemukan
          </p>
        </div>

        {/* Sidebar Content */}
        <div className="p-6">
          {loadingSidebar ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
              <p className="text-amber-700 font-medium">Loading foods...</p>
            </div>
          ) : Object.keys(foodsByProvince).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(foodsByProvince).map(([province, foods]) => (
                <div key={province}>
                  <h3 className="text-xl font-bold text-amber-900 mb-3 pb-2 border-b-2 border-amber-300">
                    {province}
                  </h3>
                  <div className="space-y-3">
                    {foods.map((food) => (
                      <div
                        key={food._id || food.name}
                        onClick={() => router.push(`/food/${food._id || encodeURIComponent(food.name)}`)}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02] border border-amber-200"
                      >
                        <div className="flex items-start gap-3">
                          {food.photo ? (
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={food.photo}
                                alt={food.name}
                                fill
                                className="object-cover"
                                unoptimized
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.onerror = null; // Prevent infinite loop
                                  target.src = "/indonesian-food.jpg";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <PiBowlFoodFill className="text-3xl text-amber-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-amber-900 mb-1">{food.name}</h4>
                            <p className="text-xs text-amber-700 line-clamp-2 mb-2">
                              {food.description || "No description available"}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-amber-100 px-2 py-1 rounded-full text-amber-800">
                                {food.category || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PiBowlFoodFill className="text-6xl text-amber-300 mb-4" />
              <p className="text-amber-800 text-lg font-semibold mb-2">
                Tidak ada makanan ditemukan
              </p>
              <p className="text-amber-600 text-sm">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area - fills space with navbar padding */}
      <div className="flex-1 flex flex-col pt-24 pb-0">
        {/* Map Container - takes about 80% of available space */}
        <div className="relative w-full flex-[89.2]">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Loading Indicator */}
          {!mapReady && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                <p className="text-amber-900 font-semibold">Loading map...</p>
              </div>
            </div>
          )}

          {/* Instruction Overlay (shown when drawer is closed) */}
          {!isDrawerOpen && mapReady && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-amber-200 z-10">
              <p className="text-amber-900 font-semibold text-sm flex items-center gap-2">
                <PiBowlFoodFill className="text-xl text-amber-600" />
                Klik marker provinsi untuk melihat makanan khas
              </p>
            </div>
          )}
        </div>

        {/* Banner Section - takes about 20% of available space, text centered vertically */}
        <div className="relative w-full flex-[10.8] overflow-hidden">
          <Image
            src="/Copilot_20251021_192423.png"
            alt="Rasantara - Satu platform, Seribu Rasa"
            fill
            className="object-cover"
            style={{ objectPosition: "center 55%" }}
            priority
            quality={100}
          />
        </div>
      </div>

      {/* Drawer Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={handleDrawerBackdropClick}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-24 right-0 h-[calc(100vh-6rem)] w-full md:w-[500px] bg-gradient-to-br from-amber-50 to-orange-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ height: 'calc(90vh - 6rem)' }}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 p-6 shadow-md z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <PiBowlFoodFill className="text-3xl" />
                {selectedProvince}
              </h2>
              <p className="text-amber-100 text-sm mt-1">
                {provinceFoods.length} makanan khas ditemukan
              </p>
            </div>
            <Button
              onClick={closeDrawer}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <IoClose className="text-2xl" />
            </Button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
              <p className="text-amber-700 font-medium">Loading foods...</p>
            </div>
          ) : provinceFoods.length > 0 ? (
            <div className="space-y-4">
              {provinceFoods.map((food) => (
                <Card
                  key={food._id || food.name}
                  onClick={() => router.push(`/food/${food._id || encodeURIComponent(food.name)}`)}
                  className="overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] bg-white border-amber-200 pt-0"
                >
                  <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100">
                    {food.photo ? (
                      <Image
                        src={food.photo}
                        alt={food.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null; // Prevent infinite loop
                          target.src = "/indonesian-food.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PiBowlFoodFill className="text-6xl text-amber-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-xl text-amber-900 mb-2">
                      {food.name}
                    </h3>
                    <p className="text-sm text-amber-700 line-clamp-3 mb-3">
                      {food.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-amber-600">
                      <span className="flex items-center gap-1">
                        📍 {food.origin?.city_or_region || food.origin?.province}
                      </span>
                      <span className="bg-amber-100 px-3 py-1 rounded-full font-medium">
                        {food.origin?.island || "Indonesia"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PiBowlFoodFill className="text-6xl text-amber-300 mb-4" />
              <p className="text-amber-800 text-lg font-semibold mb-2">
                Belum ada makanan khas
              </p>
              <p className="text-amber-600 text-sm">
                Data makanan dari {selectedProvince} belum tersedia
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

