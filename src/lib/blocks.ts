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
  { type: "base_sink",     name: "سفلية: حوض ستانلس",        category: "base", defaultWidth: 80, defaultDepth: 60, defaultHeight: 85, color: "#b88858", icon: "🚰", description: "وحدة بحوض مفرد + خلاط" },
  { type: "base_sink_double", name: "سفلية: حوض مزدوج",     category: "base", defaultWidth: 100, defaultDepth: 60, defaultHeight: 85, color: "#b88858", icon: "🚰", description: "وحدة بحوضين + خلاط" },
  { type: "base_oven_integrated", name: "سفلية: مدمج بها فرن", category: "base", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#b88858", icon: "♨️", description: "سفلية بفرن مدمج + درج علوي" },
  { type: "appl_dishwash_integrated", name: "سفلية: غسالة أطباق مدمجة", category: "base", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#b88858", icon: "🧼", description: "غسالة أطباق بواجهة خشب مطابقة" },

  // وحدات علوية
  { type: "wall_1door",    name: "علوية: ضلفة واحدة",        category: "wall", defaultWidth: 40, defaultDepth: 35, defaultHeight: 70, color: "#8b6f4a", icon: "🪟", description: "وحدة علوية بباب واحد" },
  { type: "wall_2door",    name: "علوية: ضلفتين",            category: "wall", defaultWidth: 80, defaultDepth: 35, defaultHeight: 70, color: "#8b6f4a", icon: "🪟", description: "وحدة علوية بضلفتين" },
  { type: "wall_glass",    name: "علوية: ضلفة زجاج",         category: "wall", defaultWidth: 60, defaultDepth: 35, defaultHeight: 70, color: "#9fb4c8", icon: "🪞", description: "علوية بواجهة زجاجية" },
  { type: "wall_lift",     name: "علوية: باب يفتح لأعلى",    category: "wall", defaultWidth: 60, defaultDepth: 35, defaultHeight: 40, color: "#8b6f4a", icon: "⬆️", description: "باب علوي يرفع لأعلى" },
  { type: "appl_microwave_built", name: "علوية: ميكروويف مدمج", category: "wall", defaultWidth: 60, defaultDepth: 35, defaultHeight: 38, color: "#1a1b20", icon: "📡", description: "ميكروويف مدمج بالعلوية" },

  // وحدات طولية
  { type: "tall_pantry",   name: "طولية: مخزن (بانتري)",     category: "tall", defaultWidth: 60, defaultDepth: 60, defaultHeight: 220, color: "#7a5a3a", icon: "📦", description: "خزانة طولية للمؤن" },
  { type: "tall_oven",     name: "طولية: عمود فرن",          category: "tall", defaultWidth: 60, defaultDepth: 60, defaultHeight: 220, color: "#6b5236", icon: "♨️", description: "عمود لفرن بالحائط" },
  { type: "tall_oven_micro", name: "طولية: فرن + ميكروويف", category: "tall", defaultWidth: 60, defaultDepth: 60, defaultHeight: 220, color: "#6b5236", icon: "♨️", description: "عمود يحوي فرن وميكروويف" },
  { type: "tall_fridge",   name: "طولية: ثلاجة باب واحد",    category: "tall", defaultWidth: 70, defaultDepth: 70, defaultHeight: 200, color: "#c8ccd1", icon: "❄️", description: "ثلاجة طولية بفريزر علوي" },
  { type: "appl_fridge_side", name: "ثلاجة Side-by-Side",   category: "tall", defaultWidth: 90, defaultDepth: 70, defaultHeight: 200, color: "#8a8f96", icon: "❄️", description: "ثلاجة بابين + موزع ماء" },

  // أجهزة
  { type: "appl_stove",    name: "بوتاجاز 4 شعلات",          category: "appliance", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#1c1d22", icon: "🔥", description: "بوتاجاز قائم بذاته" },
  { type: "appl_stove_5",  name: "بوتاجاز 5 شعلات",          category: "appliance", defaultWidth: 90, defaultDepth: 60, defaultHeight: 85, color: "#1c1d22", icon: "🔥", description: "بوتاجاز كبير 5 شعلات" },
  { type: "appl_cooktop",  name: "مسطح كهرباء/سيراميك",      category: "appliance", defaultWidth: 60, defaultDepth: 52, defaultHeight: 5,  color: "#0e0f12", icon: "🍳", description: "مسطح يثبت في الرخامة" },
  { type: "appl_oven",     name: "فرن مدمج",                 category: "appliance", defaultWidth: 60, defaultDepth: 55, defaultHeight: 60, color: "#1a1b20", icon: "♨️", description: "فرن لعمود أو سفلية" },
  { type: "appl_hood",     name: "شفاط مسطح",                category: "appliance", defaultWidth: 60, defaultDepth: 50, defaultHeight: 18, color: "#c8ccd1", icon: "💨", description: "شفاط أفقي أسفل العلوية" },
  { type: "appl_hood_chimney", name: "شفاط مدخنة",           category: "appliance", defaultWidth: 60, defaultDepth: 50, defaultHeight: 70, color: "#c8ccd1", icon: "💨", description: "شفاط مدخنة على الحائط" },
  { type: "appl_hood_island",  name: "شفاط جزيرة",           category: "appliance", defaultWidth: 90, defaultDepth: 50, defaultHeight: 70, color: "#c8ccd1", icon: "💨", description: "شفاط معلق فوق الجزيرة" },
  { type: "appl_dishwash", name: "غسالة أطباق ستانلس",       category: "appliance", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#c8ccd1", icon: "🧼" },
  { type: "appl_washer",   name: "غسالة ملابس",              category: "appliance", defaultWidth: 60, defaultDepth: 60, defaultHeight: 85, color: "#ececec", icon: "🧺", description: "غسالة فتحة أمامية" },
  { type: "appl_microwave", name: "ميكروويف على الرف",       category: "appliance", defaultWidth: 50, defaultDepth: 38, defaultHeight: 30, color: "#1c1d22", icon: "📡" },
  { type: "appl_fridge_mini", name: "ثلاجة صغيرة",           category: "appliance", defaultWidth: 50, defaultDepth: 50, defaultHeight: 85, color: "#ececec", icon: "❄️", description: "ميني بار" },


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
  notes?: string;
  // تفاصيل تركيب الوحدة المخصصة
  placement?: "base" | "wall" | "tall";   // سفلية / علوية / طولية (دولاب)
  doors?: number;        // عدد الضلف (0-4)
  drawers?: number;      // عدد الأدراج (0-4)
  glass?: boolean;       // ضلفة زجاج
  corner?: boolean;      // وحدة ركنية
  cabinet?: boolean;     // دولاب (طولي بارتفاع كامل)
  customColor?: boolean; // هل اللون مخصص (لا يتأثر باللون العام)
}

export interface Wall {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
}

export interface DesignDoc {
  roomWidth: number;
  roomDepth: number;
  roomShape?: "rectangle" | "l_shape";
  cutoutWidth?: number;
  cutoutDepth?: number;
  walls: Wall[];
  blocks: PlacedBlock[];
  globalColor?: string;
  floorColor?: string;
  wallColor?: string;
  marbleColor?: string;
}

export const DEFAULT_DESIGN: DesignDoc = {
  roomWidth: 400,
  roomDepth: 300,
  roomShape: "rectangle",
  cutoutWidth: 100,
  cutoutDepth: 100,
  walls: [],
  blocks: [],
  globalColor: "#b88858",
  floorColor: "#d9cec0",
  wallColor: "#efe7da",
  marbleColor: "#d8cfbf",
};
