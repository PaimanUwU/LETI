// Government-defined crime categories and types (from PDRM crime_district.csv)

export const VALID_CATEGORIES = ["assault", "property"] as const;

export const VALID_CRIME_TYPES = [
  "break_in",
  "causing_injury",
  "murder",
  "rape",
  "robbery_gang_armed",
  "robbery_gang_unarmed",
  "robbery_solo_armed",
  "robbery_solo_unarmed",
  "theft_other",
  "theft_vehicle_lorry",
  "theft_vehicle_motorcar",
  "theft_vehicle_motorcycle",
] as const;

export const CRIME_TYPES_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  assault: [
    { value: "causing_injury", label: "Assault (Causing Injury)" },
    { value: "murder", label: "Murder" },
    { value: "rape", label: "Rape" },
    { value: "robbery_gang_armed", label: "Robbery (Gang, Armed)" },
    { value: "robbery_gang_unarmed", label: "Robbery (Gang, Unarmed)" },
    { value: "robbery_solo_armed", label: "Robbery (Solo, Armed)" },
    { value: "robbery_solo_unarmed", label: "Robbery (Solo, Unarmed)" },
  ],
  property: [
    { value: "break_in", label: "Break-in" },
    { value: "theft_other", label: "Theft (Other)" },
    { value: "theft_vehicle_lorry", label: "Vehicle Theft (Lorry)" },
    { value: "theft_vehicle_motorcar", label: "Vehicle Theft (Motorcar)" },
    { value: "theft_vehicle_motorcycle", label: "Vehicle Theft (Motorcycle)" },
  ],
};
