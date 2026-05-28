// مكتبة الخامات الواقعية (سيراميك / بورسلين / رخام / جرانيت / كوارتز)
import floorBeige from "@/assets/textures/floor-ceramic-beige.jpg";
import floorGrey from "@/assets/textures/floor-porcelain-grey.jpg";
import floorWood from "@/assets/textures/floor-wood-oak.jpg";
import floorTaupe from "@/assets/textures/floor-taupe.jpg";
import floorMarbleWhite from "@/assets/textures/floor-marble-white.jpg";
import floorWalnut from "@/assets/textures/floor-walnut.jpg";
import floorHexBlack from "@/assets/textures/floor-hex-black.jpg";
import wallSubway from "@/assets/textures/wall-subway-white.jpg";
import wallBeige from "@/assets/textures/wall-porcelain-beige.jpg";
import wallMosaic from "@/assets/textures/wall-mosaic-blue.jpg";
import wallHerringbone from "@/assets/textures/wall-herringbone-white.jpg";
import wallSubwayGreen from "@/assets/textures/wall-subway-green.jpg";
import wallZellige from "@/assets/textures/wall-zellige-terracotta.jpg";
import marbleCarrara from "@/assets/textures/marble-carrara.jpg";
import marbleBlack from "@/assets/textures/marble-black-gold.jpg";
import marbleCream from "@/assets/textures/marble-cream.jpg";
import marbleCalacatta from "@/assets/textures/marble-calacatta.jpg";
import marbleEmperador from "@/assets/textures/marble-emperador.jpg";
import quartzWhite from "@/assets/textures/quartz-white.jpg";
import graniteBlack from "@/assets/textures/granite-black.jpg";
import graniteBrown from "@/assets/textures/granite-brown.jpg";
import graniteRed from "@/assets/textures/granite-red.jpg";

export interface TextureItem {
  id: string;
  name: string;
  url: string;
  category: "floor" | "wall" | "counter";
  kind: "ceramic" | "porcelain" | "wood" | "marble" | "granite" | "mosaic" | "quartz";
  /** المقاس الحقيقي للبلاطة بالسم — يستخدم لحساب التكرار */
  realSizeCm: number;
}

export const TEXTURES: TextureItem[] = [
  // أرضيات
  { id: "floor-beige",        name: "سيراميك بيج كلاسيك",   url: floorBeige,       category: "floor", kind: "ceramic",   realSizeCm: 60 },
  { id: "floor-taupe",        name: "بورسلين بيج توب",       url: floorTaupe,       category: "floor", kind: "porcelain", realSizeCm: 80 },
  { id: "floor-grey",         name: "بورسلين أسمنتي",        url: floorGrey,        category: "floor", kind: "porcelain", realSizeCm: 60 },
  { id: "floor-marble-white", name: "بورسلين رخامي أبيض",    url: floorMarbleWhite, category: "floor", kind: "porcelain", realSizeCm: 80 },
  { id: "floor-hex-black",    name: "موزاييك أسود سداسي",     url: floorHexBlack,    category: "floor", kind: "mosaic",    realSizeCm: 30 },
  { id: "floor-wood",         name: "بورسلين خشب سنديان",    url: floorWood,        category: "floor", kind: "wood",      realSizeCm: 120 },
  { id: "floor-walnut",       name: "بورسلين خشب جوز",       url: floorWalnut,      category: "floor", kind: "wood",      realSizeCm: 100 },
  // حوائط
  { id: "wall-subway",        name: "سيراميك أبيض Subway",   url: wallSubway,       category: "wall",  kind: "ceramic",   realSizeCm: 60 },
  { id: "wall-herringbone",   name: "Subway هيرنغبون أبيض",   url: wallHerringbone,  category: "wall",  kind: "ceramic",   realSizeCm: 60 },
  { id: "wall-beige",         name: "بورسلين بيج ناعم",       url: wallBeige,        category: "wall",  kind: "porcelain", realSizeCm: 60 },
  { id: "wall-subway-green",  name: "Subway أخضر زمردي",      url: wallSubwayGreen,  category: "wall",  kind: "ceramic",   realSizeCm: 60 },
  { id: "wall-mosaic",        name: "موزاييك أزرق مغربي",     url: wallMosaic,       category: "wall",  kind: "mosaic",    realSizeCm: 30 },
  { id: "wall-zellige",       name: "زليج تراكوتا برتقالي",   url: wallZellige,      category: "wall",  kind: "mosaic",    realSizeCm: 40 },
  // رخامات وجرانيت وكوارتز (للرخامة)
  { id: "marble-carrara",     name: "رخام كرارا أبيض",        url: marbleCarrara,    category: "counter", kind: "marble",  realSizeCm: 200 },
  { id: "marble-calacatta",   name: "رخام كالاكاتا فاخر",     url: marbleCalacatta,  category: "counter", kind: "marble",  realSizeCm: 200 },
  { id: "marble-cream",       name: "رخام كريمي",             url: marbleCream,      category: "counter", kind: "marble",  realSizeCm: 200 },
  { id: "marble-emperador",   name: "رخام إمبرادور بني",      url: marbleEmperador,  category: "counter", kind: "marble",  realSizeCm: 200 },
  { id: "marble-black",       name: "رخام أسود + ذهبي",       url: marbleBlack,      category: "counter", kind: "marble",  realSizeCm: 200 },
  { id: "quartz-white",       name: "كوارتز أبيض ناعم",       url: quartzWhite,      category: "counter", kind: "quartz",  realSizeCm: 180 },
  { id: "granite-black",      name: "جرانيت أسود مرصع",       url: graniteBlack,     category: "counter", kind: "granite", realSizeCm: 150 },
  { id: "granite-brown",      name: "جرانيت بني",             url: graniteBrown,     category: "counter", kind: "granite", realSizeCm: 150 },
  { id: "granite-red",        name: "جرانيت أحمر",            url: graniteRed,       category: "counter", kind: "granite", realSizeCm: 150 },
];

export const getTexture = (id?: string | null) =>
  id ? TEXTURES.find((t) => t.id === id) : undefined;
