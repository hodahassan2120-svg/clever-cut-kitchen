import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { getTexture } from "@/lib/textures";

interface Props {
  textureId?: string;
  surfaceWidthCm: number;
  surfaceHeightCm: number;
  fallbackColor: string;
  roughness?: number;
  metalness?: number;
  side?: THREE.Side;
  opacity?: number;
  textureStrength?: number;
}

function FallbackMaterial({
  color,
  roughness,
  metalness,
  side,
  opacity,
}: {
  color: string;
  roughness: number;
  metalness: number;
  side?: THREE.Side;
  opacity: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      side={side}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity >= 1}
    />
  );
}

const textureCache = new Map<string, Promise<THREE.Texture>>();

const loadTexture = (url: string) => {
  if (!textureCache.has(url)) {
    textureCache.set(
      url,
      new Promise((resolve, reject) => {
        new THREE.TextureLoader().load(url, resolve, undefined, reject);
      }),
    );
  }
  return textureCache.get(url)!;
};

/** مادة بخامة واقعية — تستخدم Suspense داخلياً عبر useLoader */
export function TexturedMaterial({
  textureId,
  surfaceWidthCm,
  surfaceHeightCm,
  fallbackColor,
  roughness = 0.85,
  metalness = 0.05,
  side,
  opacity = 1,
  textureStrength = 1,
}: Props) {
  const tex = getTexture(textureId);
  const [baseTexture, setBaseTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBaseTexture(null);
    if (!tex?.url) return;
    loadTexture(tex.url)
      .then((loaded) => {
        if (!cancelled) setBaseTexture(loaded);
      })
      .catch(() => {
        if (!cancelled) setBaseTexture(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tex?.url]);

  const map = useMemo(() => {
    if (!baseTexture || !tex) return null;
    const t = baseTexture.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.repeat.set(
      Math.max(1, surfaceWidthCm / tex.realSizeCm),
      Math.max(1, surfaceHeightCm / tex.realSizeCm),
    );
    t.needsUpdate = true;
    return t;
  }, [baseTexture, surfaceHeightCm, surfaceWidthCm, tex]);

  useEffect(
    () => () => {
      map?.dispose();
    },
    [map],
  );

  if (!map)
    return (
      <FallbackMaterial
        color={fallbackColor}
        roughness={roughness}
        metalness={metalness}
        side={side}
        opacity={opacity}
      />
    );
  return (
    <meshStandardMaterial
      map={map}
      color={new THREE.Color("#ffffff").lerp(new THREE.Color(fallbackColor), 1 - textureStrength)}
      roughness={roughness}
      metalness={metalness}
      side={side}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity >= 1}
    />
  );
}
