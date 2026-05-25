import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";
import { getTexture } from "@/lib/textures";

interface Props {
  textureId?: string;
  /** أبعاد السطح بالسم (لحساب التكرار) */
  surfaceWidthCm: number;
  surfaceHeightCm: number;
  /** اللون البديل لو مفيش خامة */
  fallbackColor: string;
  roughness?: number;
  metalness?: number;
}

/** مادة بخامة واقعية (سيراميك/رخام/جرانيت) مع تبليط تلقائي حسب مقاس البلاطة */
export function TexturedMaterial({
  textureId,
  surfaceWidthCm,
  surfaceHeightCm,
  fallbackColor,
  roughness = 0.85,
  metalness = 0.05,
}: Props) {
  const tex = getTexture(textureId);
  if (!tex) {
    return <meshStandardMaterial color={fallbackColor} roughness={roughness} metalness={metalness} />;
  }
  return (
    <TexturedInner
      url={tex.url}
      repeatX={Math.max(1, surfaceWidthCm / tex.realSizeCm)}
      repeatY={Math.max(1, surfaceHeightCm / tex.realSizeCm)}
      roughness={roughness}
      metalness={metalness}
    />
  );
}

function TexturedInner({
  url,
  repeatX,
  repeatY,
  roughness,
  metalness,
}: {
  url: string;
  repeatX: number;
  repeatY: number;
  roughness: number;
  metalness: number;
}) {
  const map = useTexture(url) as THREE.Texture;
  const mat = useMemo(() => {
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(repeatX, repeatY);
    map.anisotropy = 8;
    map.needsUpdate = true;
    return map;
  }, [map, repeatX, repeatY]);
  return <meshStandardMaterial map={mat} roughness={roughness} metalness={metalness} />;
}
