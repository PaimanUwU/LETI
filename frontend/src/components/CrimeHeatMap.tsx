import { useState, useEffect, useRef } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from "./ui/dialog";

import { Map } from "lucide-react";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

if (typeof window !== "undefined") {
  // @ts-ignore
  window.L = L;
}

import type { HeatmapPoint, HeatmapFilters } from "../lib/api";
import { api } from "../lib/api";
import "leaflet/dist/leaflet.css";

interface CrimeHeatLayerProps {
  points: Array<{ latitude: number; longitude: number; intensity: number }>;
}

export function CrimeHeatLayer({ points }: CrimeHeatLayerProps) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    const initHeatLayer = async () => {
      // @ts-ignore
      await import("leaflet.heat");

      // @ts-ignore
      if (!L.heatLayer) {
        console.error(
          "L.heatLayer is not defined. Ensure leaflet.heat loaded correctly.",
        );
        return;
      }

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      if (!points || points.length === 0) return;

      const heatPoints = points.map(
        (p) =>
          [p.latitude, p.longitude, p.intensity] as [number, number, number],
      );

      const validCoords = points
        .filter(
          (p) =>
            typeof p.latitude === "number" &&
            typeof p.longitude === "number" &&
            !isNaN(p.latitude) &&
            !isNaN(p.longitude),
        )
        .map((p) => [p.latitude, p.longitude] as [number, number]);

      if (validCoords.length > 0) {
        map.invalidateSize();
        map.fitBounds(validCoords, {
          maxZoom: 11,
          padding: [40, 40],
          animate: true,
          duration: 0.8,
        });
      }

      // 1. Amplified Heat Configuration for Higher Visibility
      // @ts-ignore
      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 28, // Increased from 20 to 28 to make individual points larger and smoother
        blur: 12, // Increased from 5 to 12 for smoother transitions and glowing blending effects
        maxZoom: 13,
        max: 0.3, // Lowered max threshold from 0.5 to 0.3, making warm spots highlight much quicker
        gradient: {
          0.1: "#3b82f6", // Blue (Low Density backdrop glow)
          0.3: "#10b981", // Green
          0.5: "#eab308", // Yellow
          0.7: "#f97316", // Orange
          1.0: "#dc2626", // Deep Red (High Density Core)
        },
      }).addTo(map);
    };

    initHeatLayer();

    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points]);

  return null;
}

function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export function CrimeHeatMap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState<HeatmapFilters>({
    state: "",
    category: "",
    type: "",
    year: undefined,
  });

  const malaysiaCenter: [number, number] = [3.139, 101.6869];

  useEffect(() => {
    async function fetchHeatmapData() {
      setLoading(true);
      try {
        const params: any = {};
        if (filters.state) params.state = filters.state;
        if (filters.category) params.category = filters.category;
        if (filters.type) params.type = filters.type;
        if (filters.year) params.year = String(filters.year);
        if (filters.month) params.month = String(filters.month);
        if (filters.limit) params.limit = String(filters.limit);

        const result = await api.ai.getHeatmap(params);
        const rawPoints = result.data || [];

        const maxCount = rawPoints.reduce(
          (max: number, p: any) => Math.max(max, p.crime_count || 1),
          1,
        );

        const mappedData: HeatmapPoint[] = rawPoints.map((p: any) => ({
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          intensity: maxCount > 0 ? (p.crime_count || 1) / maxCount : 1.0,
        }));

        setHeatmapData(mappedData);
      } catch (error) {
        console.error("Failed loading threat data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHeatmapData();
  }, [filters]);

  const states = [
    { value: "selangor", label: "Selangor" },
    { value: "kuala lumpur", label: "Kuala Lumpur" },
    { value: "johor", label: "Johor" },
    { value: "penang", label: "Penang" },
    { value: "perak", label: "Perak" },
    { value: "pahang", label: "Pahang" },
    { value: "negeri sembilan", label: "Negeri Sembilan" },
    { value: "melaka", label: "Melaka" },
    { value: "kedah", label: "Kedah" },
    { value: "kelantan", label: "Kelantan" },
    { value: "terengganu", label: "Terengganu" },
    { value: "perlis", label: "Perlis" },
    { value: "sabah", label: "Sabah" },
    { value: "sarawak", label: "Sarawak" },
  ];

  const categories = [
    { value: "assault", label: "Assault Crime" },
    { value: "property", label: "Property Crime" },
  ];

  const availableYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const crimeTypes = [
    { value: "murder", label: "Murder", parentCategory: "assault" },
    { value: "rape", label: "Rape", parentCategory: "assault" },
    {
      value: "causing_injury",
      label: "Causing Injury",
      parentCategory: "assault",
    },
    {
      value: "gang_robbery_with_firearms",
      label: "Gang Robbery with Firearms",
      parentCategory: "assault",
    },
    {
      value: "gang_robbery_without_firearms",
      label: "Gang Robbery without Firearms",
      parentCategory: "assault",
    },
    {
      value: "robbery_with_firearms",
      label: "Robbery with Firearms",
      parentCategory: "assault",
    },
    {
      value: "robbery_without_firearms",
      label: "Robbery without Firearms",
      parentCategory: "assault",
    },
    { value: "theft", label: "Theft", parentCategory: "property" },
    {
      value: "theft_of_motor_vehicle",
      label: "Motor Vehicle Theft",
      parentCategory: "property",
    },
    {
      value: "theft_of_lorry_van",
      label: "Lorry/Van Theft",
      parentCategory: "property",
    },
    {
      value: "theft_of_motorcycle",
      label: "Motorcycle Theft",
      parentCategory: "property",
    },
    {
      value: "snatch_theft",
      label: "Snatch Theft",
      parentCategory: "property",
    },
    {
      value: "housebreaking_and_theft",
      label: "Housebreaking & Theft",
      parentCategory: "property",
    },
  ];

  const filteredTypes = filters.category
    ? crimeTypes.filter((t) => t.parentCategory === filters.category)
    : crimeTypes;

  const renderMap = () => (
    <MapContainer center={malaysiaCenter} zoom={10} className="w-full h-full">
      {/* 2. Swapped traditional OSM out for the beautiful minimal CartoDB Positron basemap */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <ResizeMap />
      <CrimeHeatLayer points={heatmapData} />
    </MapContainer>
  );

  return (
    <Card className="h-full relative overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Map className="h-5 w-5 text-primary" />
          Crime Heat Map
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {/* State Selector */}
          <select
            value={filters.state || ""}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All States</option>
            {states.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Category Selector */}
          <select
            value={filters.category || ""}
            onChange={(e) => {
              setFilters({ ...filters, category: e.target.value, type: "" });
            }}
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Type Selector */}
          <select
            value={filters.type || ""}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Types</option>
            {filteredTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={filters.year || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                year: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Month Selector */}
          <select
            value={filters.month || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                month: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-50">
          <p className="text-sm font-medium animate-pulse text-muted-foreground">
            Updating Threat Intel Map...
          </p>
        </div>
      )}

      {/* Primary Map View Container */}
      <CardContent className="h-[450px] p-6 pt-0">
        <div className="w-full h-full rounded-md border overflow-hidden relative z-0">
          {renderMap()}
        </div>
      </CardContent>

      <CardFooter>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" aria-label="Expand Map Visualization">
              Expand Map
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw]! max-w-[95vw]! h-[90vh] flex flex-col p-4 z-[10000]">
            <DialogHeader className="pb-2">
              <DialogTitle>Crime Heat Map (Full View)</DialogTitle>
            </DialogHeader>
            <div className="flex-1 w-full rounded-md border overflow-hidden relative z-0">
              {isOpen && renderMap()}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
