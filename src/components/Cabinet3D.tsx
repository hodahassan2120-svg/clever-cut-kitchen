// رسم وحدة مطبخ تفصيلية في 3D — تعرض الجسم + الأبواب + الأدراج + الزجاج + الرخامة
import { memo } from "react";
import type { PlacedBlock } from "@/lib/blocks";
import { Appliance3D } from "./Appliance3D";
import { TexturedMaterial } from "./TexturedMaterial";

interface Props {
  block: PlacedBlock;
  defaultColor: string;
  marbleColor?: string;
  marbleTextureId?: string;
}

const APPLIANCE_TYPES = new Set([
  "appl_stove", "appl_stove_5", "appl_cooktop", "appl_oven",
  "appl_hood", "appl_hood_chimney", "appl_hood_island",
  "appl_dishwash", "appl_dishwash_integrated", "appl_washer",
  "appl_microwave", "appl_microwave_built",
  "tall_fridge", "appl_fridge_side", "appl_fridge_mini",
  "base_sink", "base_sink_double",
  "tall_oven_micro", "base_oven_integrated",
]);

const READY_CABINET_SPECS: Record<string, { placement: "base" | "wall" | "tall"; doors?: number; drawers?: number; glass?: boolean }> = {
  base_1door: { placement: "base", doors: 1 },
  base_2door: { placement: "base", doors: 2 },
  base_door_drawer: { placement: "base", doors: 1, drawers: 1 },
  base_3drawer: { placement: "base", drawers: 3 },
  base_4drawer: { placement: "base", drawers: 4 },
  base_corner: { placement: "base", doors: 2 },
  special_island: { placement: "base", doors: 2, drawers: 2 },
  wall_1door: { placement: "wall", doors: 1 },
  wall_2door: { placement: "wall", doors: 2 },
  wall_glass: { placement: "wall", doors: 1, glass: true },
  wall_lift: { placement: "wall", drawers: 1 },
  tall_pantry: { placement: "tall", doors: 2 },
  tall_oven: { placement: "tall", doors: 2 },
};

const getCabinetSpec = (block: PlacedBlock) => READY_CABINET_SPECS[block.type];

export function Cabinet3D({ block, defaultColor, marbleColor, marbleTextureId }: Props) {
  if (APPLIANCE_TYPES.has(block.type)) {
    return <Appliance3D block={block} defaultColor={defaultColor} marbleColor={marbleColor} marbleTextureId={marbleTextureId} />;
  }
  const spec = getCabinetSpec(block);
  const color = block.customColor ? block.color : (defaultColor || block.color);
  const { width: W, depth: D, height: H } = block;
  const bodyColor = color;
  const carcassColor = bodyColor;

  const placement = block.placement || spec?.placement;
  const wallMounted = placement === "wall" || block.type === "special_window";
  const verticalOffset = wallMounted ? 145 : 0;

  const cx = block.x + W / 2;
  const cy = verticalOffset + H / 2;
  const cz = block.y + D / 2;
  const rotation: [number, number, number] = [0, (-block.rotation * Math.PI) / 180, 0];
  const zFightGap = 0.08;

  // العناصر الخاصة غير الخزائن تبقى ككتل بسيطة
  if (!placement) {
    return (
      <mesh position={[cx, cy, cz]} rotation={rotation}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.68} metalness={0.03} />
      </mesh>
    );
  }


  const doors = Math.max(0, Math.min(4, block.doors ?? spec?.doors ?? 0));
  const drawers = Math.max(0, Math.min(4, block.drawers ?? spec?.drawers ?? 0));
  const isGlass = !!(block.glass ?? spec?.glass) && doors > 0;

  // تقسيم الواجهة عمودياً: الأدراج في الأعلى (إن وجدت بدون ضلف) أو الأسفل
  // إذا الاثنان موجودان: أدراج فوق + ضلف تحت (نمط شائع)
  const FRONT_INSET = 1.5;          // بروز الرخامة للأمام
  const GAP = 0.4;                  // فجوة بين الأبواب/الأدراج
  const HANDLE_T = 1.2;             // سُمك المقبض
  const DOOR_T = 1.8;               // سُمك الضلفة
  const PANEL_T = 1.6;              // سُمك ألواح جسم الوحدة

  const drawerH = drawers > 0 ? Math.min(H * 0.4, 25 * drawers) : 0;
  const doorH = H - drawerH;

  return (
    <group position={[cx, cy, cz]} rotation={rotation}>
      {/* جسم الوحدة كألواح منفصلة بدون واجهة أمامية — يمنع تداخل الألوان مع الضلف */}
      <mesh position={[0, 0, -D / 2 + PANEL_T / 2 - zFightGap]}>
        <boxGeometry args={[W, H, PANEL_T]} />
        <meshStandardMaterial color="#2c2722" roughness={0.9} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <mesh position={[-W / 2 + PANEL_T / 2, 0, 0]}>
        <boxGeometry args={[PANEL_T, H, D]} />
        <meshStandardMaterial color={carcassColor} roughness={0.82} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <mesh position={[W / 2 - PANEL_T / 2, 0, 0]}>
        <boxGeometry args={[PANEL_T, H, D]} />
        <meshStandardMaterial color={carcassColor} roughness={0.82} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <mesh position={[0, H / 2 - PANEL_T / 2, 0]}>
        <boxGeometry args={[W, PANEL_T, D]} />
        <meshStandardMaterial color={carcassColor} roughness={0.82} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <mesh position={[0, -H / 2 + PANEL_T / 2, 0]}>
        <boxGeometry args={[W, PANEL_T, D]} />
        <meshStandardMaterial color={carcassColor} roughness={0.82} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>

      {/* الأدراج (في الأعلى إن وُجدت مع ضلف، أو كامل الوحدة إن لم يوجد ضلف) */}
      {drawers > 0 && (() => {
        const totalDrawerH = doors > 0 ? drawerH : H;
        const eachH = (totalDrawerH - GAP * (drawers + 1)) / drawers;
        const startY = H / 2 - GAP - eachH / 2; // ابدأ من الأعلى
        return Array.from({ length: drawers }).map((_, i) => {
          const y = startY - i * (eachH + GAP);
          return (
            <group key={`dr${i}`} position={[0, y, D / 2 + DOOR_T / 2 + zFightGap]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[W - GAP * 2, eachH, DOOR_T]} />
                <meshStandardMaterial color={bodyColor} roughness={0.64} metalness={0.02} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
              </mesh>
              <mesh position={[0, 0, DOOR_T / 2 + 0.12]}>
                <boxGeometry args={[W - GAP * 7, Math.max(2, eachH - 4), 0.25]} />
                <meshStandardMaterial color={bodyColor} roughness={0.72} metalness={0.01} />
              </mesh>
              <mesh position={[0, eachH / 2 - 0.35, DOOR_T / 2 + 0.18]}><boxGeometry args={[W - GAP * 3, 0.28, 0.35]} /><meshStandardMaterial color="#1f1711" roughness={0.9} /></mesh>
              <mesh position={[0, -eachH / 2 + 0.35, DOOR_T / 2 + 0.18]}><boxGeometry args={[W - GAP * 3, 0.28, 0.35]} /><meshStandardMaterial color="#1f1711" roughness={0.9} /></mesh>
              {/* مقبض أفقي في المنتصف */}
              <mesh position={[0, 0, DOOR_T / 2 + HANDLE_T / 2]}>
                <boxGeometry args={[Math.max(12, W * 0.42), 1.6, HANDLE_T * 1.6]} />
                <meshStandardMaterial color="#d5ac55" roughness={0.28} metalness={0.75} />
              </mesh>
            </group>
          );
        });
      })()}

      {/* الضلف (في الأسفل إن وجدت أدراج، أو كامل الوحدة) */}
      {doors > 0 && (() => {
        const totalDoorH = drawers > 0 ? doorH - GAP : H;
        const yBase = drawers > 0 ? -drawerH / 2 - GAP / 2 : 0;
        const eachW = (W - GAP * (doors + 1)) / doors;
        const startX = -W / 2 + GAP + eachW / 2;
        return Array.from({ length: doors }).map((_, i) => {
          const x = startX + i * (eachW + GAP);
          // المقبض في الجانب الداخلي للضلفة (تجاه مركز الوحدة)
          const handleX = i < doors / 2 ? eachW / 2 - 2.5 : -eachW / 2 + 2.5;
          return (
            <group key={`door${i}`} position={[x, yBase, D / 2 + DOOR_T / 2 + zFightGap]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[eachW, totalDoorH - GAP, DOOR_T]} />
                {isGlass ? (
                  <meshStandardMaterial color="#9eb8c6" roughness={0.18} transparent opacity={0.42} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
                ) : (
                  <meshStandardMaterial color={bodyColor} roughness={0.64} metalness={0.02} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
                )}
              </mesh>
              {!isGlass && (
                <group position={[0, 0, DOOR_T / 2 + 0.12]}>
                  <mesh position={[0, (totalDoorH - GAP) / 2 - 2, 0]}><boxGeometry args={[eachW - 2, 1.3, 0.35]} /><meshStandardMaterial color="#2a2119" roughness={0.9} /></mesh>
                  <mesh position={[0, -(totalDoorH - GAP) / 2 + 2, 0]}><boxGeometry args={[eachW - 2, 1.3, 0.35]} /><meshStandardMaterial color="#2a2119" roughness={0.9} /></mesh>
                  <mesh position={[-eachW / 2 + 2, 0, 0]}><boxGeometry args={[1.3, totalDoorH - GAP - 2, 0.35]} /><meshStandardMaterial color="#2a2119" roughness={0.9} /></mesh>
                  <mesh position={[eachW / 2 - 2, 0, 0]}><boxGeometry args={[1.3, totalDoorH - GAP - 2, 0.35]} /><meshStandardMaterial color="#2a2119" roughness={0.9} /></mesh>
                  <mesh><boxGeometry args={[Math.max(2, eachW - 8), Math.max(3, totalDoorH - GAP - 12), 0.22]} /><meshStandardMaterial color={bodyColor} roughness={0.78} metalness={0.01} /></mesh>
                </group>
              )}
              {/* إطار خشبي للزجاج */}
              {isGlass && (
                <group position={[0, 0, DOOR_T / 2 + 0.08]}>
                  <mesh position={[0, (totalDoorH - GAP) / 2 - 1.2, 0]}><boxGeometry args={[eachW, 1.4, 0.7]} /><meshStandardMaterial color={bodyColor} roughness={0.7} /></mesh>
                  <mesh position={[0, -(totalDoorH - GAP) / 2 + 1.2, 0]}><boxGeometry args={[eachW, 1.4, 0.7]} /><meshStandardMaterial color={bodyColor} roughness={0.7} /></mesh>
                  <mesh position={[-eachW / 2 + 1.2, 0, 0]}><boxGeometry args={[1.4, totalDoorH - GAP, 0.7]} /><meshStandardMaterial color={bodyColor} roughness={0.7} /></mesh>
                  <mesh position={[eachW / 2 - 1.2, 0, 0]}><boxGeometry args={[1.4, totalDoorH - GAP, 0.7]} /><meshStandardMaterial color={bodyColor} roughness={0.7} /></mesh>
                </group>
              )}
              {/* مقبض عمودي */}
              <mesh position={[handleX, 0, DOOR_T / 2 + HANDLE_T / 2]}>
                <boxGeometry args={[1.8, Math.min(22, totalDoorH * 0.42), HANDLE_T * 1.7]} />
                <meshStandardMaterial color="#d5ac55" roughness={0.28} metalness={0.75} />
              </mesh>
            </group>
          );
        });
      })()}

      {/* رخامة للوحدات السفلية مع حافة أمامية وباكسبلاش خلفي */}
      {placement === "base" && (
        <>
          {/* السطح الرئيسي للرخامة */}
          <mesh position={[0, H / 2 + 1.5, FRONT_INSET / 2 + zFightGap]} castShadow receiveShadow>
            <boxGeometry args={[W + 2, 3, D + FRONT_INSET]} />
            <TexturedMaterial textureId={marbleTextureId} surfaceWidthCm={W + 2} surfaceHeightCm={D + FRONT_INSET} fallbackColor={marbleColor || "#d8cfbf"} roughness={0.35} metalness={0.06} />
          </mesh>
          {/* حافة أمامية بارزة (Bullnose) */}
          <mesh position={[0, H / 2 - 0.5, D / 2 + FRONT_INSET + zFightGap]}>
            <boxGeometry args={[W + 2, 1.2, 0.6]} />
            <TexturedMaterial textureId={marbleTextureId} surfaceWidthCm={W + 2} surfaceHeightCm={1.2} fallbackColor={marbleColor || "#d8cfbf"} roughness={0.35} metalness={0.06} />
          </mesh>
          {/* باكسبلاش خلفي صغير */}
          <mesh position={[0, H / 2 + 4 + zFightGap, -D / 2 + 1]}>
            <boxGeometry args={[W + 2, 7, 1.2]} />
            <TexturedMaterial textureId={marbleTextureId} surfaceWidthCm={W + 2} surfaceHeightCm={7} fallbackColor={marbleColor || "#d8cfbf"} roughness={0.35} metalness={0.06} />
          </mesh>
        </>
      )}

      {/* قاعدة (Toe-kick) للوحدات السفلية */}
      {placement === "base" && (
        <>
          <mesh position={[0, -H / 2 + 5, D / 2 - 2 - zFightGap]}>
            <boxGeometry args={[W, 10, 4]} />
            <meshStandardMaterial color="#0f0c0a" roughness={1} />
          </mesh>
          {/* خط ظل خفيف فوق التو-كيك */}
          <mesh position={[0, -H / 2 + 10.2, D / 2 + 0.05]}>
            <boxGeometry args={[W - 1, 0.3, 0.3]} />
            <meshStandardMaterial color="#000000" roughness={1} />
          </mesh>
        </>
      )}
    </group>
  );
}
