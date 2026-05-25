// رسم الأجهزة بشكل واقعي قريب من الواقع في الـ 3D
// يُستدعى من Cabinet3D عند أنواع الأجهزة (appl_*, tall_fridge, base_sink*, …)
import type { PlacedBlock } from "@/lib/blocks";
import { TexturedMaterial } from "./TexturedMaterial";

interface Props {
  block: PlacedBlock;
  marbleColor?: string;
  marbleTextureId?: string;
  defaultColor: string;
}

const STEEL = "#c8ccd1";
const STEEL_DARK = "#8a8f96";
const BLACK_GLASS = "#0e0f12";
const DISPLAY = "#1a3a2a";

export function Appliance3D({ block, marbleColor, marbleTextureId, defaultColor }: Props) {
  const { type, width: W, height: H, depth: D } = block;
  const wallMounted = type === "appl_hood" || type === "appl_hood_chimney" || type === "appl_microwave_built";
  const verticalOffset = wallMounted ? 145 : 0;
  const cx = block.x + W / 2;
  const cy = verticalOffset + H / 2;
  const cz = block.y + D / 2;
  const rotation: [number, number, number] = [0, (-block.rotation * Math.PI) / 180, 0];

  return (
    <group position={[cx, cy, cz]} rotation={rotation}>
      {renderBody(type, W, H, D, marbleColor, marbleTextureId, defaultColor, block)}
    </group>
  );
}

function renderBody(
  type: string,
  W: number,
  H: number,
  D: number,
  marbleColor: string | undefined,
  marbleTextureId: string | undefined,
  defaultColor: string,
  block: PlacedBlock,
) {
  switch (type) {
    case "appl_stove":
    case "appl_stove_5":
      return Stove(W, H, D, type === "appl_stove_5" ? 5 : 4);
    case "appl_cooktop":
      return Cooktop(W, H, D);
    case "appl_oven":
      return BuiltInOven(W, H, D);
    case "appl_hood":
      return HoodFlat(W, H, D);
    case "appl_hood_chimney":
    case "appl_hood_island":
      return HoodChimney(W, H, D, type === "appl_hood_island");
    case "appl_dishwash":
    case "appl_dishwash_integrated":
      return Dishwasher(W, H, D, type === "appl_dishwash_integrated" ? (block.customColor ? block.color : defaultColor) : null);
    case "appl_washer":
      return Washer(W, H, D);
    case "appl_microwave":
      return Microwave(W, H, D);
    case "appl_microwave_built":
      return MicrowaveBuiltIn(W, H, D);
    case "tall_fridge":
      return FridgeTall(W, H, D);
    case "appl_fridge_side":
      return FridgeSideBySide(W, H, D);
    case "appl_fridge_mini":
      return FridgeMini(W, H, D);
    case "base_sink":
      return SinkBase(W, H, D, marbleColor, marbleTextureId, block.customColor ? block.color : defaultColor, 1);
    case "base_sink_double":
      return SinkBase(W, H, D, marbleColor, marbleTextureId, block.customColor ? block.color : defaultColor, 2);
    case "tall_oven_micro":
      return OvenMicroColumn(W, H, D, block.customColor ? block.color : defaultColor);
    case "base_oven_integrated":
      return BaseWithOven(W, H, D, block.customColor ? block.color : defaultColor, marbleColor, marbleTextureId);
    default:
      return (
        <mesh>
          <boxGeometry args={[W, H, D]} />
          <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.6} />
        </mesh>
      );
  }
}

/* ───── البوتاجاز ───── */
function Stove(W: number, H: number, D: number, burners: 4 | 5) {
  const topH = 4;
  const positions: [number, number][] = burners === 4
    ? [[-W * 0.25, -D * 0.18], [W * 0.25, -D * 0.18], [-W * 0.25, D * 0.18], [W * 0.25, D * 0.18]]
    : [[-W * 0.3, -D * 0.2], [W * 0.3, -D * 0.2], [-W * 0.3, D * 0.2], [W * 0.3, D * 0.2], [0, 0]];
  return (
    <group>
      {/* الجسم */}
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color="#1c1d22" roughness={0.35} metalness={0.55} /></mesh>
      {/* سطح زجاجي أسود */}
      <mesh position={[0, H / 2 + 0.1, 0]}>
        <boxGeometry args={[W - 1.5, topH, D - 1.5]} />
        <meshStandardMaterial color={BLACK_GLASS} roughness={0.15} metalness={0.25} />
      </mesh>
      {/* الشعلات */}
      {positions.map(([x, z], i) => (
        <group key={i} position={[x, H / 2 + topH + 0.5, z]}>
          <mesh><cylinderGeometry args={[Math.min(W, D) * 0.09, Math.min(W, D) * 0.09, 0.6, 24]} /><meshStandardMaterial color="#2b2e34" metalness={0.8} roughness={0.3} /></mesh>
          <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[Math.min(W, D) * 0.06, Math.min(W, D) * 0.06, 0.4, 16]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.9} roughness={0.25} /></mesh>
        </group>
      ))}
      {/* باب الفرن (زجاج) */}
      <mesh position={[0, -H * 0.15, D / 2 + 0.1]}>
        <boxGeometry args={[W - 4, H * 0.55, 0.6]} />
        <meshStandardMaterial color={BLACK_GLASS} roughness={0.2} metalness={0.3} />
      </mesh>
      {/* مقبض الفرن */}
      <mesh position={[0, H * 0.1, D / 2 + 0.8]}><boxGeometry args={[W - 8, 1.6, 1.4]} /><meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} /></mesh>
      {/* لوحة المفاتيح */}
      <mesh position={[0, H * 0.42, D / 2 + 0.1]}><boxGeometry args={[W - 4, H * 0.08, 0.4]} /><meshStandardMaterial color="#26282d" metalness={0.6} roughness={0.4} /></mesh>
      {Array.from({ length: burners }).map((_, i) => (
        <mesh key={i} position={[-W / 2 + 5 + (i * (W - 10)) / (burners - 1), H * 0.42, D / 2 + 0.5]}>
          <cylinderGeometry args={[0.9, 0.9, 0.6, 16]} />
          <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

/* ───── المسطح ───── */
function Cooktop(W: number, H: number, D: number) {
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color={BLACK_GLASS} roughness={0.12} metalness={0.3} /></mesh>
      {[[-W * 0.25, -D * 0.2], [W * 0.25, -D * 0.2], [-W * 0.25, D * 0.2], [W * 0.25, D * 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, H / 2 + 0.05, z]}><cylinderGeometry args={[Math.min(W, D) * 0.1, Math.min(W, D) * 0.1, 0.1, 24]} /><meshStandardMaterial color="#3a1a0a" roughness={0.6} emissive="#220500" /></mesh>
      ))}
    </group>
  );
}

/* ───── فرن مدمج ───── */
function BuiltInOven(W: number, H: number, D: number) {
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color="#1a1b20" metalness={0.6} roughness={0.4} /></mesh>
      {/* لوحة العلوية */}
      <mesh position={[0, H * 0.4, D / 2 + 0.05]}><boxGeometry args={[W - 2, H * 0.15, 0.3]} /><meshStandardMaterial color="#26282d" metalness={0.7} roughness={0.35} /></mesh>
      {/* الزجاج */}
      <mesh position={[0, -H * 0.08, D / 2 + 0.1]}><boxGeometry args={[W - 6, H * 0.55, 0.5]} /><meshStandardMaterial color={BLACK_GLASS} roughness={0.18} metalness={0.4} /></mesh>
      {/* المقبض */}
      <mesh position={[0, H * 0.2, D / 2 + 0.8]}><boxGeometry args={[W - 8, 1.4, 1.3]} /><meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} /></mesh>
      {/* مفاتيح */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[-W / 2 + 5 + i * ((W - 10) / 3), H * 0.4, D / 2 + 0.3]}><cylinderGeometry args={[0.8, 0.8, 0.5, 16]} /><meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.25} /></mesh>
      ))}
    </group>
  );
}

/* ───── الشفاط ───── */
function HoodFlat(W: number, H: number, D: number) {
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.25} /></mesh>
      {/* فلتر سفلي */}
      <mesh position={[0, -H / 2 - 0.05, 0]}><boxGeometry args={[W - 2, 0.4, D - 2]} /><meshStandardMaterial color="#2a2c30" roughness={0.7} metalness={0.4} /></mesh>
      {/* أزرار */}
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i * 5, 0, D / 2 + 0.1]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.6, 0.6, 0.2, 16]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.7} /></mesh>
      ))}
    </group>
  );
}

function HoodChimney(W: number, H: number, D: number, island: boolean) {
  const funnelH = H * 0.35;
  const chimneyH = H - funnelH;
  return (
    <group>
      {/* القمع السفلي */}
      <mesh position={[0, -H / 2 + funnelH / 2, 0]}>
        <boxGeometry args={[W, funnelH, D]} />
        <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.22} />
      </mesh>
      {/* المدخنة العلوية */}
      <mesh position={[0, -H / 2 + funnelH + chimneyH / 2, island ? 0 : -D * 0.15]}>
        <boxGeometry args={[W * 0.45, chimneyH, D * 0.5]} />
        <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.22} />
      </mesh>
      <mesh position={[0, -H / 2 - 0.05, 0]}><boxGeometry args={[W - 1.5, 0.4, D - 1.5]} /><meshStandardMaterial color="#2a2c30" roughness={0.7} /></mesh>
    </group>
  );
}

/* ───── غسالة الأطباق ───── */
function Dishwasher(W: number, H: number, D: number, integratedColor: string | null) {
  const face = integratedColor || STEEL;
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color={integratedColor || "#1a1b20"} metalness={integratedColor ? 0.1 : 0.5} roughness={integratedColor ? 0.7 : 0.4} /></mesh>
      {/* الواجهة */}
      <mesh position={[0, 0, D / 2 + 0.05]}><boxGeometry args={[W - 1, H - 1, 0.4]} /><meshStandardMaterial color={face} metalness={integratedColor ? 0.05 : 0.8} roughness={integratedColor ? 0.65 : 0.3} /></mesh>
      {/* مقبض */}
      <mesh position={[0, H * 0.42, D / 2 + 0.45]}><boxGeometry args={[W - 6, 1.3, 1.2]} /><meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} /></mesh>
      {/* شاشة صغيرة */}
      <mesh position={[W * 0.3, H * 0.42, D / 2 + 0.3]}><boxGeometry args={[W * 0.25, 0.8, 0.3]} /><meshStandardMaterial color={DISPLAY} emissive={DISPLAY} emissiveIntensity={0.4} /></mesh>
    </group>
  );
}

/* ───── الغسالة ───── */
function Washer(W: number, H: number, D: number) {
  const r = Math.min(W, H) * 0.32;
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color="#ececec" metalness={0.3} roughness={0.4} /></mesh>
      {/* الواجهة */}
      <mesh position={[0, 0, D / 2 + 0.05]}><boxGeometry args={[W - 1, H - 1, 0.3]} /><meshStandardMaterial color="#f3f4f6" metalness={0.25} roughness={0.45} /></mesh>
      {/* الباب الزجاجي الدائري */}
      <mesh position={[0, -H * 0.08, D / 2 + 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.8, 40]} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, -H * 0.08, D / 2 + 0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 0.82, r * 0.82, 0.4, 40]} />
        <meshStandardMaterial color="#0c1418" metalness={0.5} roughness={0.15} transparent opacity={0.85} />
      </mesh>
      {/* لوحة علوية + شاشة */}
      <mesh position={[0, H * 0.4, D / 2 + 0.1]}><boxGeometry args={[W - 2, H * 0.15, 0.3]} /><meshStandardMaterial color="#dadde2" metalness={0.4} roughness={0.4} /></mesh>
      <mesh position={[-W * 0.25, H * 0.4, D / 2 + 0.3]}><boxGeometry args={[W * 0.3, H * 0.08, 0.2]} /><meshStandardMaterial color={DISPLAY} emissive={DISPLAY} emissiveIntensity={0.5} /></mesh>
      {/* مقابض دائرية */}
      {[1, 2].map((i) => (
        <mesh key={i} position={[W * 0.15 * i, H * 0.4, D / 2 + 0.3]}><cylinderGeometry args={[0.8, 0.8, 0.4, 20]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.85} /></mesh>
      ))}
    </group>
  );
}

/* ───── الميكروويف ───── */
function Microwave(W: number, H: number, D: number) {
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color="#1c1d22" metalness={0.5} roughness={0.4} /></mesh>
      {/* الزجاج */}
      <mesh position={[-W * 0.1, 0, D / 2 + 0.05]}><boxGeometry args={[W * 0.6, H - 2, 0.3]} /><meshStandardMaterial color={BLACK_GLASS} roughness={0.18} metalness={0.5} /></mesh>
      {/* لوحة جانبية */}
      <mesh position={[W * 0.32, 0, D / 2 + 0.05]}><boxGeometry args={[W * 0.3, H - 2, 0.3]} /><meshStandardMaterial color="#2a2c30" metalness={0.5} roughness={0.35} /></mesh>
      {/* شاشة */}
      <mesh position={[W * 0.32, H * 0.28, D / 2 + 0.2]}><boxGeometry args={[W * 0.25, H * 0.15, 0.2]} /><meshStandardMaterial color={DISPLAY} emissive={DISPLAY} emissiveIntensity={0.5} /></mesh>
      {/* أزرار */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[W * 0.32 + ((i % 3) - 1) * 1.6, -H * 0.1 - Math.floor(i / 3) * 2, D / 2 + 0.2]}><boxGeometry args={[1.2, 1.2, 0.2]} /><meshStandardMaterial color="#3a3c42" /></mesh>
      ))}
      {/* مقبض */}
      <mesh position={[-W * 0.4, 0, D / 2 + 0.4]}><boxGeometry args={[1, H * 0.7, 1.2]} /><meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} /></mesh>
    </group>
  );
}

function MicrowaveBuiltIn(W: number, H: number, D: number) {
  return Microwave(W, H, D);
}

/* ───── الثلاجة الطولية ───── */
function FridgeTall(W: number, H: number, D: number) {
  const freezerH = H * 0.3;
  const fridgeH = H - freezerH;
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.4} /></mesh>
      {/* فاصل */}
      <mesh position={[0, H / 2 - fridgeH, D / 2 + 0.05]}><boxGeometry args={[W, 0.6, 0.4]} /><meshStandardMaterial color="#3a3c42" metalness={0.6} /></mesh>
      {/* باب الفريزر */}
      <mesh position={[0, -H / 2 + freezerH / 2, D / 2 + 0.1]}><boxGeometry args={[W - 1, freezerH - 1, 0.5]} /><meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} /></mesh>
      {/* باب الثلاجة */}
      <mesh position={[0, H / 2 - fridgeH / 2, D / 2 + 0.1]}><boxGeometry args={[W - 1, fridgeH - 1, 0.5]} /><meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} /></mesh>
      {/* مقابض */}
      <mesh position={[W / 2 - 4, H / 2 - fridgeH / 2 + fridgeH * 0.25, D / 2 + 0.6]}><boxGeometry args={[1, fridgeH * 0.45, 1.8]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.9} /></mesh>
      <mesh position={[W / 2 - 4, -H / 2 + freezerH / 2, D / 2 + 0.6]}><boxGeometry args={[1, freezerH * 0.6, 1.8]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.9} /></mesh>
      {/* شاشة */}
      <mesh position={[-W * 0.2, H * 0.3, D / 2 + 0.5]}><boxGeometry args={[W * 0.3, H * 0.07, 0.2]} /><meshStandardMaterial color={DISPLAY} emissive={DISPLAY} emissiveIntensity={0.45} /></mesh>
    </group>
  );
}

function FridgeSideBySide(W: number, H: number, D: number) {
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.6} roughness={0.35} /></mesh>
      {/* فاصل عمودي */}
      <mesh position={[0, 0, D / 2 + 0.05]}><boxGeometry args={[0.6, H - 1, 0.4]} /><meshStandardMaterial color="#3a3c42" /></mesh>
      {/* بابان */}
      <mesh position={[-W / 4, 0, D / 2 + 0.1]}><boxGeometry args={[W / 2 - 1, H - 1, 0.5]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[W / 4, 0, D / 2 + 0.1]}><boxGeometry args={[W / 2 - 1, H - 1, 0.5]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.8} roughness={0.3} /></mesh>
      {/* مقابض */}
      <mesh position={[-W / 2 + 4, H * 0.2, D / 2 + 0.6]}><boxGeometry args={[1, H * 0.5, 1.8]} /><meshStandardMaterial color={STEEL} metalness={0.9} /></mesh>
      <mesh position={[W / 2 - 4, H * 0.2, D / 2 + 0.6]}><boxGeometry args={[1, H * 0.5, 1.8]} /><meshStandardMaterial color={STEEL} metalness={0.9} /></mesh>
      {/* موزع ماء */}
      <mesh position={[-W / 4, H * 0.15, D / 2 + 0.3]}><boxGeometry args={[W * 0.18, H * 0.2, 0.3]} /><meshStandardMaterial color={BLACK_GLASS} metalness={0.4} roughness={0.2} /></mesh>
    </group>
  );
}

function FridgeMini(W: number, H: number, D: number) {
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color="#ececec" metalness={0.4} roughness={0.45} /></mesh>
      <mesh position={[0, 0, D / 2 + 0.1]}><boxGeometry args={[W - 1, H - 1, 0.4]} /><meshStandardMaterial color="#f3f4f6" metalness={0.4} roughness={0.5} /></mesh>
      <mesh position={[W / 2 - 3, 0, D / 2 + 0.5]}><boxGeometry args={[0.8, H * 0.4, 1.2]} /><meshStandardMaterial color={STEEL_DARK} metalness={0.9} /></mesh>
    </group>
  );
}

/* ───── الحوض ───── */
function SinkBase(W: number, H: number, D: number, marbleColor: string | undefined, marbleTextureId: string | undefined, doorColor: string, basins: 1 | 2) {
  const marble = marbleColor || "#d8cfbf";
  const basinDepth = 8;
  return (
    <group>
      {/* جسم سفلي */}
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color={doorColor} roughness={0.68} /></mesh>
      {/* واجهة */}
      <mesh position={[0, 0, D / 2 + 0.1]}><boxGeometry args={[W - 1, H - 2, 0.5]} /><meshStandardMaterial color={doorColor} roughness={0.6} metalness={0.04} /></mesh>
      <mesh position={[0, -H * 0.3, D / 2 + 0.7]}><boxGeometry args={[W * 0.3, 1, 1.2]} /><meshStandardMaterial color="#c7a15a" metalness={0.4} roughness={0.4} /></mesh>
      {/* الرخامة */}
      <mesh position={[0, H / 2 + 1.5, 0.5]}><boxGeometry args={[W + 2, 3, D + 1]} /><TexturedMaterial textureId={marbleTextureId} surfaceWidthCm={W + 2} surfaceHeightCm={D + 1} fallbackColor={marble} roughness={0.42} metalness={0.05} /></mesh>
      {/* الأحواض الستانلس (مفجورة في الرخامة) */}
      {basins === 1 ? (
        <mesh position={[0, H / 2 + 1.5 - basinDepth / 2 - 0.5, 0]}>
          <boxGeometry args={[W - 12, basinDepth, D - 12]} />
          <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
        </mesh>
      ) : (
        <>
          <mesh position={[-W * 0.22, H / 2 + 1.5 - basinDepth / 2 - 0.5, 0]}>
            <boxGeometry args={[W * 0.38, basinDepth, D - 12]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[W * 0.22, H / 2 + 1.5 - basinDepth / 2 - 0.5, 0]}>
            <boxGeometry args={[W * 0.38, basinDepth, D - 12]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} />
          </mesh>
        </>
      )}
      {/* الخلاط */}
      <group position={[0, H / 2 + 3, -D * 0.32]}>
        <mesh position={[0, 4, 0]}><cylinderGeometry args={[0.6, 0.8, 8, 16]} /><meshStandardMaterial color={STEEL} metalness={0.95} roughness={0.15} /></mesh>
        <mesh position={[0, 8, 4]} rotation={[Math.PI / 2.4, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 8, 16]} /><meshStandardMaterial color={STEEL} metalness={0.95} roughness={0.15} /></mesh>
        <mesh position={[2, 5, 0]}><boxGeometry args={[2.5, 0.6, 0.6]} /><meshStandardMaterial color={STEEL} metalness={0.95} roughness={0.15} /></mesh>
      </group>
      {/* قاعدة */}
      <mesh position={[0, -H / 2 + 5, D / 2 - 2]}><boxGeometry args={[W, 10, 4]} /><meshStandardMaterial color="#211b16" /></mesh>
    </group>
  );
}

/* ───── عمود فرن + ميكروويف ───── */
function OvenMicroColumn(W: number, H: number, D: number, color: string) {
  const ovenH = H * 0.32;
  const microH = H * 0.22;
  const upperH = H - ovenH - microH - 2;
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color={color} roughness={0.65} /></mesh>
      {/* فرن في المنتصف */}
      <group position={[0, -H * 0.05, D / 2 + 0.1]}>
        <mesh><boxGeometry args={[W - 2, ovenH, 0.4]} /><meshStandardMaterial color="#1a1b20" metalness={0.6} roughness={0.4} /></mesh>
        <mesh position={[0, -ovenH * 0.15, 0.2]}><boxGeometry args={[W - 6, ovenH * 0.6, 0.3]} /><meshStandardMaterial color={BLACK_GLASS} roughness={0.18} metalness={0.4} /></mesh>
        <mesh position={[0, ovenH * 0.05, 0.7]}><boxGeometry args={[W - 8, 1.3, 1.2]} /><meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} /></mesh>
      </group>
      {/* ميكروويف فوق الفرن */}
      <group position={[0, H * 0.22, D / 2 + 0.1]}>
        <mesh><boxGeometry args={[W - 2, microH, 0.4]} /><meshStandardMaterial color="#1a1b20" metalness={0.6} /></mesh>
        <mesh position={[-W * 0.1, 0, 0.2]}><boxGeometry args={[W * 0.55, microH - 1, 0.3]} /><meshStandardMaterial color={BLACK_GLASS} roughness={0.2} metalness={0.4} /></mesh>
        <mesh position={[W * 0.3, 0.5, 0.3]}><boxGeometry args={[W * 0.2, microH * 0.4, 0.2]} /><meshStandardMaterial color={DISPLAY} emissive={DISPLAY} emissiveIntensity={0.4} /></mesh>
      </group>
      {/* ضلفة علوية */}
      <mesh position={[0, H / 2 - upperH / 2 - 1, D / 2 + 0.1]}><boxGeometry args={[W - 2, upperH - 1, 0.5]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
      <mesh position={[0, H / 2 - 4, D / 2 + 0.6]}><boxGeometry args={[W * 0.35, 1.2, 1.4]} /><meshStandardMaterial color="#c7a15a" metalness={0.4} /></mesh>
    </group>
  );
}

/* ───── سفلية مدمج فيها فرن ───── */
function BaseWithOven(W: number, H: number, D: number, color: string, marbleColor: string | undefined, marbleTextureId: string | undefined) {
  const marble = marbleColor || "#d8cfbf";
  const ovenH = H * 0.45;
  return (
    <group>
      <mesh><boxGeometry args={[W, H, D]} /><meshStandardMaterial color={color} roughness={0.65} /></mesh>
      {/* درج علوي */}
      <mesh position={[0, H * 0.32, D / 2 + 0.1]}><boxGeometry args={[W - 1, H * 0.18, 0.5]} /><meshStandardMaterial color={color} roughness={0.6} /></mesh>
      <mesh position={[0, H * 0.32, D / 2 + 0.5]}><boxGeometry args={[W * 0.4, 1.2, 1.2]} /><meshStandardMaterial color="#c7a15a" metalness={0.4} /></mesh>
      {/* فرن أسفل */}
      <group position={[0, -H * 0.1, D / 2 + 0.1]}>
        <mesh><boxGeometry args={[W - 2, ovenH, 0.4]} /><meshStandardMaterial color="#1a1b20" metalness={0.6} roughness={0.4} /></mesh>
        <mesh position={[0, -ovenH * 0.12, 0.2]}><boxGeometry args={[W - 6, ovenH * 0.65, 0.3]} /><meshStandardMaterial color={BLACK_GLASS} roughness={0.18} metalness={0.4} /></mesh>
        <mesh position={[0, ovenH * 0.05, 0.7]}><boxGeometry args={[W - 8, 1.3, 1.2]} /><meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.2} /></mesh>
      </group>
      {/* الرخامة */}
      <mesh position={[0, H / 2 + 1.5, 0.5]}><boxGeometry args={[W + 2, 3, D + 1]} /><TexturedMaterial textureId={marbleTextureId} surfaceWidthCm={W + 2} surfaceHeightCm={D + 1} fallbackColor={marble} roughness={0.42} /></mesh>
      <mesh position={[0, -H / 2 + 5, D / 2 - 2]}><boxGeometry args={[W, 10, 4]} /><meshStandardMaterial color="#211b16" /></mesh>
    </group>
  );
}
