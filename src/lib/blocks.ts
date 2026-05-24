export interface KitchenBlock {
  type: string;
  name: string;
  defaultWidth: number;  // cm
  defaultDepth: number;  // cm
  defaultHeight: number; // cm
  color: string;
  icon: string;
}

export const KITCHEN_BLOCKS: KitchenBlock[] = [
  { type: "base_cabinet", name: "وحدة سفلية", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#c2956b", icon: "📦" },
  { type: "wall_cabinet", name: "وحدة علوية", defaultWidth: 60, defaultDepth: 35, defaultHeight: 70, color: "#a0522d", icon: "🗄️" },
  { type: "tall_cabinet", name: "وحدة طولية", defaultWidth: 60, defaultDepth: 60, defaultHeight: 220, color: "#8b6f5e", icon: "🪟" },
  { type: "sink", name: "حوض", defaultWidth: 80, defaultDepth: 60, defaultHeight: 85, color: "#94a3b8", icon: "🚰" },
  { type: "stove", name: "بوتاجاز", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#475569", icon: "🔥" },
  { type: "fridge", name: "ثلاجة", defaultWidth: 70, defaultDepth: 70, defaultHeight: 180, color: "#cbd5e1", icon: "❄️" },
  { type: "oven", name: "فرن", defaultWidth: 60, defaultDepth: 60, defaultHeight: 60, color: "#525252", icon: "♨️" },
  { type: "island", name: "جزيرة", defaultWidth: 120, defaultDepth: 80, defaultHeight: 90, color: "#b08968", icon: "🟫" },
  { type: "dishwasher", name: "غسالة أطباق", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#9ca3af", icon: "🧼" },
];

export interface PlacedBlock {
  id: string;
  type: string;
  x: number;       // cm position
  y: number;       // cm position
  width: number;   // cm
  depth: number;   // cm
  height: number;  // cm
  rotation: number; // degrees
  color: string;
  name: string;
}

export interface Wall {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
}

export interface DesignDoc {
  roomWidth: number;
  roomDepth: number;
  walls: Wall[];
  blocks: PlacedBlock[];
}

export const DEFAULT_DESIGN: DesignDoc = {
  roomWidth: 400,
  roomDepth: 300,
  walls: [],
  blocks: [],
};
