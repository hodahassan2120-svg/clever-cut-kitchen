import * as THREE from "three";
import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { getTexture } from "@/lib/textures";

interface Props {
  textureId?: string;
  surfaceWidthCm: number;
  surfaceHeightCm: number;
  fallbackColor: string;
  roughness?: number;
  metalness?: number;
}

const cache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

function loadCached(url: string): Promise<THREE.Texture> {
  const cached = cache.get(url);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = 8;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        cache.set(url, tex);
        resolve(tex);
      },
      undefined,
      reject
    );
  });
}

/** مادة بخامة واقعية (سيراميك/رخام/جرانيت) — لا تستخدم Suspense */
export function TexturedMaterial({
  textureId,
  surfaceWidthCm,
  surfaceHeightCm,
  fallbackColor,
  roughness = 0.85,
  metalness = 0.05,
}: Props) {
  const tex = getTexture(textureId);
  const { invalidate } = useThree();
  const [map, setMap] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!tex) {
      setMap(null);
      invalidate();
      return;
    }
    let cancelled = false;
    loadCached(tex.url).then((t) => {
      if (cancelled) return;
      const clone = t.clone();
      clone.wrapS = THREE.RepeatWrapping;
      clone.wrapT = THREE.RepeatWrapping;
      clone.anisotropy = t.anisotropy;
      clone.colorSpace = THREE.SRGBColorSpace;
      clone.needsUpdate = true;
      setMap(clone);
      invalidate();
    }).catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  }, [tex, invalidate]);

  useEffect(() => {
    if (!map || !tex) return;
    const rx = Math.max(1, surfaceWidthCm / tex.realSizeCm);
    const ry = Math.max(1, surfaceHeightCm / tex.realSizeCm);
    map.repeat.set(rx, ry);
    map.needsUpdate = true;
    invalidate();
  }, [map, tex, surfaceWidthCm, surfaceHeightCm, invalidate]);

  if (!tex || !map) {
    return <meshStandardMaterial key={`fb-${fallbackColor}`} color={fallbackColor} roughness={roughness} metalness={metalness} />;
  }
  return <meshStandardMaterial key={`tx-${tex.id}`} map={map} color="#ffffff" roughness={roughness} metalness={metalness} />;
}
