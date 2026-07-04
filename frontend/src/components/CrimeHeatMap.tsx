import { useState, useEffect } from "react";
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

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
if (typeof window !== "undefined") {
  // @ts-ignore
  window.L = L;
}
import type { HeatmapPoint, HeatmapFilters } from "../lib/crime";
import { api } from "../lib/api";
import { Input } from "./ui/input";
import "leaflet/dist/leaflet.css";

interface CrimeHeatLayerProps {
  points: Array<{ latitude: number; longitude: number; intensity: number }>;
}

export function CrimeHeatLayer({ points }: CrimeHeatLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    let heatLayer: any;

    const initHeatLayer = async () => {
      await import("leaflet.heat");

      // @ts-ignore
      if (!L.heatLayer) {
        console.error(
          "L.heatLayer is not defined. Ensure leaflet.heat loaded correctly.",
        );
        return;
      }

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

      // @ts-ignore
      heatLayer = L.heatLayer(heatPoints, {
        radius: 15,
        blur: 4,
        maxZoom: 13,
        max: 1.0,
        gradient: {
          0.2: "#ea580c",
          1.0: "#dc2626",
        },
      }).addTo(map);
    };

    initHeatLayer();

    return () => {
      if (heatLayer && map) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points]);

  return null;
}

export function CrimeHeatMap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(false); // Controls the modal open state

  const [filters, setFilters] = useState<HeatmapFilters>({
    state: "",
    category: "",
    type: "",
    year: 2023,
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

  // Shared Map Component Content to keep things DRY
  const renderMap = () => (
    <MapContainer center={malaysiaCenter} zoom={10} className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {heatmapData.length > 0 && <CrimeHeatLayer points={heatmapData} />}
    </MapContainer>
  );

  return (
    <Card className="h-full relative overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
        <CardTitle>Crime Heat Map</CardTitle>
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

          {/* Year Input */}
          <Input
            type="number"
            placeholder="Year"
            value={filters.year || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                year: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-8 w-20 px-2 py-1 rounded-md border border-input text-xs bg-background"
          />

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
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <p className="text-sm font-medium animate-pulse text-muted-foreground">
            Updating Threat Intel Map...
          </p>
        </div>
      )}

      {/* Primary Map View Container */}
      <CardContent className="h-[450px] p-6 pt-0">
        <div className="w-full h-full rounded-md border overflow-hidden">
          {renderMap()}
        </div>
      </CardContent>

      {/* Dynamic Modal Implementation */}
      <CardFooter>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" aria-label="Expand Map Visualization">
              Expand Map
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] w-[90vw] h-[85vh] flex flex-col p-6">
            <DialogHeader className="pb-2">
              <DialogTitle>Crime Heat Map (Full View)</DialogTitle>
            </DialogHeader>
            <div className="flex-1 w-full rounded-md border overflow-hidden relative">
              {isOpen && renderMap()}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
