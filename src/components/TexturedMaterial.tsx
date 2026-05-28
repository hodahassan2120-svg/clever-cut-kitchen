import * as THREE from "three";
import { Suspense, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { getTexture } from "@/lib/textures";

interface Props {
  textureId?: string;
  surfaceWidthCm: number;
  surfaceHeightCm: number;
  fallbackColor: string;
  roughness?: number;
  metalness?: number;
  side?: THREE.Side;
}

function FallbackMaterial({ color, roughness, metalness, side }: { color: string; roughness: number; metalness: number; side?: THREE.Side }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} side={side} />;
}

function TexturedInner({
  url,
  realSizeCm,
  surfaceWidthCm,
  surfaceHeightCm,
  roughness,
  metalness,
  side,
}: {
  url: string;
  realSizeCm: number;
  surfaceWidthCm: number;
  surfaceHeightCm: number;
  roughness: number;
  metalness: number;
  side?: THREE.Side;
}) {
  // useLoader caches by URL — same texture for same URL but we clone to allow per-surface repeat
  const baseTex = useLoader(THREE.TextureLoader, url);

  const map = useMemo(() => {
    const t = baseTex.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    const rx = Math.max(1, surfaceWidthCm / realSizeCm);
    const ry = Math.max(1, surfaceHeightCm / realSizeCm);
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    return t;
  }, [baseTex, realSizeCm, surfaceWidthCm, surfaceHeightCm]);

  return <meshStandardMaterial map={map} color="#ffffff" roughness={roughness} metalness={metalness} side={side} />;
}

/** مادة بخامة واقعية — تستخدم Suspense داخلياً عبر useLoader */
export function TexturedMaterial({
  textureId,
  surfaceWidthCm,
  surfaceHeightCm,
  fallbackColor,
  roughness = 0.85,
  metalness = 0.05,
  side,
}: Props) {
  const tex = getTexture(textureId);
  if (!tex) {
    return <FallbackMaterial color={fallbackColor} roughness={roughness} metalness={metalness} side={side} />;
  }
  return (
    <Suspense fallback={<FallbackMaterial color={fallbackColor} roughness={roughness} metalness={metalness} side={side} />}>
      <TexturedInner
        url={tex.url}
        realSizeCm={tex.realSizeCm}
        surfaceWidthCm={surfaceWidthCm}
        surfaceHeightCm={surfaceHeightCm}
        roughness={roughness}
        metalness={metalness}
        side={side}
      />
    </Suspense>
  );
}
