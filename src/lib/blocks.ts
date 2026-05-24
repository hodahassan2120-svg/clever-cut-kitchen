export interface KitchenBlock {
  type: string;
  name: string;
  category: "base" | "wall" | "tall" | "appliance" | "special";
  defaultWidth: number;  // cm — مجرد قيمة افتراضية للنموذج (يدخلها المستخدم)
  defaultDepth: number;  // cm
  defaultHeight: number; // cm
  color: string;
  icon: string;
  description?: string;
}

export const KITCHEN_BLOCKS: KitchenBlock[] = [
  // وحدات سفلية
  { type: "base_1door",    name: "سفلية: ضلفة واحدة",       category: "base", defaultWidth: 40, defaultDepth: 60, defaultHeight: 85, color: "#c2956b", icon: "🚪", description: "وحدة سفلية بباب واحد" },
  { type: "base_2door",    name: "سفلية: ضلفتين",            category: "base", defaultWidth: 80, defaultDepth: 60, defaultHeight: 85, color: "#c2956b", icon: "🚪", description: "وحدة سفلية بضلفتين" },
  { type: "base_door_drawer", name: "سفلية: ضلفة + درج",     category: "base", defaultWidth: 50, defaultDepth: 60, defaultHeight: 85, color: "#b88858", icon: "🗃️", description: "باب سفلي مع درج علوي" },
  { type: "base_3drawer",  name: "سفلية: 3 أدراج",           category: "base", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#a87a48", icon: "🗄️", description: "وحدة بثلاث أدراج" },
  { type: "base_4drawer",  name: "سفلية: 4 أدراج",           category: "base", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#9a6e3e", icon: "🗄️", description: "وحدة بأربع أدراج" },
  { type: "base_corner",   name: "سفلية: ركنية",             category: "base", defaultWidth: 90, defaultDepth: 90, defaultHeight: 85, color: "#a87a48", icon: "📐", description: "وحدة ركن سفلية" },
  { type: "base_sink",     name: "سفلية: حوض",               category: "base", defaultWidth: 80, defaultDepth: 60, defaultHeight: 85, color: "#94a3b8", icon: "🚰", description: "وحدة الحوض" },

  // وحدات علوية
  { type: "wall_1door",    name: "علوية: ضلفة واحدة",        category: "wall", defaultWidth: 40, defaultDepth: 35, defaultHeight: 70, color: "#8b6f4a", icon: "🪟", description: "وحدة علوية بباب واحد" },
  { type: "wall_2door",    name: "علوية: ضلفتين",            category: "wall", defaultWidth: 80, defaultDepth: 35, defaultHeight: 70, color: "#8b6f4a", icon: "🪟", description: "وحدة علوية بضلفتين" },
  { type: "wall_glass",    name: "علوية: ضلفة زجاج",         category: "wall", defaultWidth: 60, defaultDepth: 35, defaultHeight: 70, color: "#9fb4c8", icon: "🪞", description: "علوية بواجهة زجاجية" },
  { type: "wall_lift",     name: "علوية: باب يفتح لأعلى",    category: "wall", defaultWidth: 60, defaultDepth: 35, defaultHeight: 40, color: "#8b6f4a", icon: "⬆️", description: "باب علوي يرفع لأعلى" },

  // وحدات طولية
  { type: "tall_pantry",   name: "طولية: مخزن (بانتري)",     category: "tall", defaultWidth: 60, defaultDepth: 60, defaultHeight: 220, color: "#7a5a3a", icon: "📦", description: "خزانة طولية للمؤن" },
  { type: "tall_oven",     name: "طولية: عمود فرن",          category: "tall", defaultWidth: 60, defaultDepth: 60, defaultHeight: 220, color: "#6b5236", icon: "♨️", description: "عمود لفرن بالحائط" },
  { type: "tall_fridge",   name: "طولية: عمود ثلاجة",        category: "tall", defaultWidth: 70, defaultDepth: 70, defaultHeight: 220, color: "#cbd5e1", icon: "❄️", description: "عمود لثلاجة مدمجة" },

  // أجهزة
  { type: "appl_stove",    name: "جهاز: بوتاجاز",            category: "appliance", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#475569", icon: "🔥" },
  { type: "appl_oven",     name: "جهاز: فرن مدمج",           category: "appliance", defaultWidth: 60, defaultDepth: 60, defaultHeight: 60, color: "#525252", icon: "♨️" },
  { type: "appl_hood",     name: "جهاز: شفاط",               category: "appliance", defaultWidth: 60, defaultDepth: 50, defaultHeight: 40, color: "#a3a3a3", icon: "💨" },
  { type: "appl_dishwash", name: "جهاز: غسالة أطباق",        category: "appliance", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#9ca3af", icon: "🧼" },

  // عناصر خاصة
  { type: "special_island",name: "جزيرة",                    category: "special", defaultWidth: 120, defaultDepth: 80, defaultHeight: 90, color: "#b08968", icon: "🟫" },
  { type: "special_window",name: "شباك",                     category: "special", defaultWidth: 100, defaultDepth: 10, defaultHeight: 100, color: "#7dd3fc", icon: "🪟", description: "فتحة شباك على الحائط" },
  { type: "special_door",  name: "باب الغرفة",               category: "special", defaultWidth: 80, defaultDepth: 10, defaultHeight: 210, color: "#92400e", icon: "🚪", description: "باب دخول المطبخ" },
];

export const CATEGORY_LABELS: Record<KitchenBlock["category"], string> = {
  base: "وحدات سفلية",
  wall: "وحدات علوية",
  tall: "وحدات طولية",
  appliance: "أجهزة",
  special: "عناصر خاصة",
};

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
  notes?: string;  // تفاصيل إضافية (شباك/باب/ملاحظات)
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
