// رسم وحدة مطبخ تفصيلية في 3D — تعرض الجسم + الأبواب + الأدراج + الزجاج + الرخامة
import type { PlacedBlock } from "@/lib/blocks";

interface Props {
  block: PlacedBlock;
  defaultColor: string;
}

export function Cabinet3D({ block, defaultColor }: Props) {
  const color = block.customColor ? block.color : (defaultColor || block.color);
  const { width: W, depth: D, height: H } = block;
  const bodyColor = color;
  // الجوانب والأعلى والأسفل بنفس لون الجسم — فقط داخل الوحدة (خلف الواجهة) يكون داكنًا
  const carcassColor = bodyColor;

  const wallMounted = block.placement === "wall" || block.type.startsWith("wall_") || block.type === "appl_hood" || block.type === "special_window";
  const verticalOffset = wallMounted ? 145 : 0;

  // الإحداثيات: المركز عند (x + W/2, ارتفاع الوحدة/2, y + D/2) مع رفع الوحدات العلوية
  const cx = block.x + W / 2;
  const cy = verticalOffset + H / 2;
  const cz = block.y + D / 2;
  const rotation: [number, number, number] = [0, (-block.rotation * Math.PI) / 180, 0];
  const zFightGap = 0.08;

  // إذا لم تكن وحدة مخصصة، ارسم صندوقًا بسيطًا
  if (!block.placement) {
    return (
      <mesh position={[cx, cy, cz]} rotation={rotation}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color={bodyColor} roughness={0.68} metalness={0.03} />
      </mesh>
    );
  }

  const doors = Math.max(0, Math.min(4, block.doors || 0));
  const drawers = Math.max(0, Math.min(4, block.drawers || 0));
  const isGlass = !!block.glass && doors > 0;

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
              <mesh>
                <boxGeometry args={[W - GAP * 2, eachH, DOOR_T]} />
                <meshStandardMaterial color={bodyColor} roughness={0.64} metalness={0.02} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
              </mesh>
              {/* مقبض أفقي في المنتصف */}
              <mesh position={[0, 0, DOOR_T / 2 + HANDLE_T / 2]}>
                <boxGeometry args={[W * 0.35, 1.2, HANDLE_T]} />
                <meshStandardMaterial color="#c7a15a" roughness={0.45} metalness={0.35} />
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
              <mesh>
                <boxGeometry args={[eachW, totalDoorH - GAP, DOOR_T]} />
                {isGlass ? (
                  <meshStandardMaterial color="#9eb8c6" roughness={0.18} transparent opacity={0.42} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
                ) : (
                  <meshStandardMaterial color={bodyColor} roughness={0.64} metalness={0.02} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
                )}
              </mesh>
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
                <boxGeometry args={[1.2, Math.min(15, totalDoorH * 0.3), HANDLE_T]} />
                <meshStandardMaterial color="#c7a15a" roughness={0.45} metalness={0.35} />
              </mesh>
            </group>
          );
        });
      })()}

      {/* رخامة للوحدات السفلية */}
      {block.placement === "base" && (
          <mesh position={[0, H / 2 + 1.5, FRONT_INSET / 2 + zFightGap]}>
          <boxGeometry args={[W + 2, 3, D + FRONT_INSET]} />
            <meshStandardMaterial color="#d8cfbf" roughness={0.55} metalness={0.02} />
        </mesh>
      )}

      {/* قاعدة للوحدات السفلية */}
      {block.placement === "base" && (
          <mesh position={[0, -H / 2 + 5, D / 2 - 2 - zFightGap]}>
          <boxGeometry args={[W, 10, 4]} />
            <meshStandardMaterial color="#211b16" roughness={1} />
        </mesh>
      )}
    </group>
  );
}
