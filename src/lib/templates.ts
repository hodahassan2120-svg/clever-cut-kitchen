// قوالب مطابخ جاهزة قابلة للتعديل
import type { DesignDoc, PlacedBlock } from "./blocks";
import { KITCHEN_BLOCKS } from "./blocks";

export interface KitchenTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  roomWidth: number;
  roomDepth: number;
  roomShape?: "rectangle" | "l_shape";
  cutoutWidth?: number;
  cutoutDepth?: number;
  // وصف الوحدات بصيغة مبسطة: type + موقع + دوران اختياري
  units: Array<{
    type: string;
    x: number;
    y: number;
    rotation?: number;
    width?: number;
    depth?: number;
    height?: number;
  }>;
}

const def = (type: string) => KITCHEN_BLOCKS.find((b) => b.type === type)!;

const mkBlock = (
  type: string,
  x: number,
  y: number,
  rotation = 0,
  override?: { width?: number; depth?: number; height?: number }
): PlacedBlock => {
  const b = def(type);
  return {
    id: crypto.randomUUID(),
    type,
    name: b.name,
    color: b.color,
    x,
    y,
    width: override?.width ?? b.defaultWidth,
    depth: override?.depth ?? b.defaultDepth,
    height: override?.height ?? b.defaultHeight,
    rotation,
  };
};

export const KITCHEN_TEMPLATES: KitchenTemplate[] = [
  // 1) مستقيم صغير
  {
    id: "straight_small",
    name: "مستقيم صغير",
    description: "مطبخ خطي بسيط على حائط واحد - مناسب للشقق الصغيرة",
    icon: "▬",
    roomWidth: 280,
    roomDepth: 180,
    units: [
      { type: "base_sink", x: 0, y: 0 },
      { type: "appl_stove", x: 80, y: 0 },
      { type: "base_2door", x: 140, y: 0 },
      { type: "base_3drawer", x: 220, y: 0 },
      { type: "wall_2door", x: 0, y: 0 },
      { type: "appl_hood_chimney", x: 80, y: 0 },
      { type: "wall_glass", x: 140, y: 0 },
      { type: "wall_2door", x: 200, y: 0 },
    ],
  },
  // 2) L-Shape
  {
    id: "l_shape",
    name: "L-Shape",
    description: "تصميم على حرف L - الأكثر شيوعاً ويستغل الركن بكفاءة",
    icon: "⌐",
    roomWidth: 400,
    roomDepth: 320,
    units: [
      // الحائط الخلفي (y=0)
      { type: "base_corner", x: 0, y: 0 },
      { type: "base_sink_double", x: 90, y: 0 },
      { type: "base_door_drawer", x: 190, y: 0 },
      { type: "appl_stove", x: 240, y: 0 },
      { type: "base_3drawer", x: 300, y: 0 },
      { type: "tall_fridge", x: 360, y: 0 },
      // الحائط الأيسر (x=0) - دوران 90
      { type: "base_2door", x: 0, y: 90, rotation: 90 },
      { type: "base_oven_integrated", x: 0, y: 170, rotation: 90 },
      { type: "base_3drawer", x: 0, y: 230, rotation: 90 },
      // علويات
      { type: "wall_2door", x: 90, y: 0 },
      { type: "appl_hood_chimney", x: 240, y: 0 },
      { type: "wall_glass", x: 170, y: 0 },
      { type: "wall_2door", x: 300, y: 0 },
    ],
  },
  // 3) U-Shape
  {
    id: "u_shape",
    name: "U-Shape",
    description: "ثلاث حوائط - أكبر مساحة عمل وتخزين",
    icon: "⊔",
    roomWidth: 380,
    roomDepth: 320,
    units: [
      // خلفي
      { type: "base_corner", x: 0, y: 0 },
      { type: "base_sink", x: 90, y: 0 },
      { type: "base_2door", x: 170, y: 0 },
      { type: "appl_stove", x: 250, y: 0 },
      { type: "base_corner", x: 310, y: 0 },
      // أيسر
      { type: "base_3drawer", x: 0, y: 90, rotation: 90 },
      { type: "base_door_drawer", x: 0, y: 150, rotation: 90 },
      { type: "tall_pantry", x: 0, y: 210, rotation: 90 },
      // أيمن
      { type: "appl_dishwash_integrated", x: 320, y: 90, rotation: 270 },
      { type: "base_2door", x: 320, y: 150, rotation: 270 },
      { type: "tall_fridge", x: 310, y: 230, rotation: 270 },
      // علويات خلفية
      { type: "wall_2door", x: 90, y: 0 },
      { type: "appl_hood_chimney", x: 250, y: 0 },
      { type: "wall_glass", x: 170, y: 0 },
    ],
  },
  // 4) متوازي (Galley)
  {
    id: "galley",
    name: "متوازي (Galley)",
    description: "صفّان متوازيان - مثالي للمساحات الضيقة الطويلة",
    icon: "‖",
    roomWidth: 360,
    roomDepth: 240,
    units: [
      // الصف الخلفي
      { type: "base_sink_double", x: 0, y: 0 },
      { type: "base_door_drawer", x: 100, y: 0 },
      { type: "appl_stove", x: 150, y: 0 },
      { type: "base_3drawer", x: 210, y: 0 },
      { type: "base_2door", x: 270, y: 0 },
      // الصف الأمامي (مقابل، دوران 180)
      { type: "tall_fridge", x: 0, y: 170, rotation: 180 },
      { type: "base_2door", x: 70, y: 180, rotation: 180 },
      { type: "appl_oven", x: 150, y: 180, rotation: 180 },
      { type: "base_3drawer", x: 210, y: 180, rotation: 180 },
      { type: "base_door_drawer", x: 270, y: 180, rotation: 180 },
      // علويات
      { type: "wall_2door", x: 0, y: 0 },
      { type: "appl_hood_chimney", x: 150, y: 0 },
      { type: "wall_glass", x: 210, y: 0 },
      { type: "wall_2door", x: 290, y: 0 },
    ],
  },
  // 5) مع جزيرة
  {
    id: "island",
    name: "مطبخ بجزيرة",
    description: "تصميم فاخر مع جزيرة وسطية للطهي والتجمع",
    icon: "▢",
    roomWidth: 480,
    roomDepth: 400,
    units: [
      // الحائط الخلفي
      { type: "tall_fridge", x: 0, y: 0 },
      { type: "base_door_drawer", x: 70, y: 0 },
      { type: "base_sink_double", x: 120, y: 0 },
      { type: "base_2door", x: 220, y: 0 },
      { type: "tall_oven_micro", x: 300, y: 0 },
      { type: "tall_pantry", x: 360, y: 0 },
      { type: "tall_pantry", x: 420, y: 0 },
      // علويات
      { type: "wall_2door", x: 120, y: 0 },
      { type: "wall_glass", x: 220, y: 0 },
      // الجزيرة في المنتصف
      { type: "special_island", x: 180, y: 170, width: 160, depth: 90, height: 90 },
      { type: "appl_cooktop", x: 200, y: 190 },
      { type: "appl_hood_island", x: 200, y: 195 },
    ],
  },
];

export function buildTemplateDoc(
  template: KitchenTemplate,
  base: Partial<DesignDoc> = {}
): DesignDoc {
  const blocks: PlacedBlock[] = template.units.map((u) =>
    mkBlock(u.type, u.x, u.y, u.rotation ?? 0, {
      width: u.width,
      depth: u.depth,
      height: u.height,
    })
  );
  return {
    roomWidth: template.roomWidth,
    roomDepth: template.roomDepth,
    roomShape: template.roomShape ?? "rectangle",
    cutoutWidth: template.cutoutWidth ?? 0,
    cutoutDepth: template.cutoutDepth ?? 0,
    walls: [],
    blocks,
    globalColor: base.globalColor ?? "#b88858",
    floorColor: base.floorColor ?? "#d9cec0",
    wallColor: base.wallColor ?? "#efe7da",
    marbleColor: base.marbleColor ?? "#d8cfbf",
  };
}
