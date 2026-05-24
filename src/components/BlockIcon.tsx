// أيقونات SVG احترافية للوحدات — مستوحاة من رسومات المستخدم
import { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const wrap = (children: React.ReactNode, vb = "0 0 120 90") => (props: IconProps) => (
  <svg viewBox={vb} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {children}
  </svg>
);

// ===== سفلية =====
const BaseSingleDoor = wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <rect x="10" y="10" width="100" height="70" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7"/>
  <circle cx="100" cy="45" r="2" fill="currentColor"/>
</>);

const BaseTwoDoors = wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <line x1="60" y1="6" x2="60" y2="84" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="54" cy="45" r="1.8" fill="currentColor"/>
  <circle cx="66" cy="45" r="1.8" fill="currentColor"/>
</>);

const BaseDoorDrawer = wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <line x1="2" y1="26" x2="118" y2="26" stroke="currentColor" strokeWidth="1.5"/>
  <rect x="50" y="12" width="20" height="3" fill="currentColor"/>
  <circle cx="100" cy="58" r="2" fill="currentColor"/>
</>);

const BaseDrawers = (n: number) => wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  {Array.from({ length: n - 1 }).map((_, i) => (
    <line key={i} x1="2" y1={2 + ((i + 1) * 86) / n} x2="118" y2={2 + ((i + 1) * 86) / n} stroke="currentColor" strokeWidth="1.5"/>
  ))}
  {Array.from({ length: n }).map((_, i) => (
    <rect key={i} x="50" y={(86 / n) * i + 2 + 86 / n / 2 - 2} width="20" height="3" fill="currentColor"/>
  ))}
</>);

const BaseCorner = wrap(<>
  <path d="M2 2 H118 V40 H40 V88 H2 Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <line x1="40" y1="2" x2="40" y2="40" stroke="currentColor" strokeOpacity="0.5"/>
  <line x1="40" y1="40" x2="118" y2="40" stroke="currentColor" strokeOpacity="0.5"/>
</>);

const BaseSink = wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <rect x="14" y="18" width="92" height="54" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="60" cy="45" r="3" fill="currentColor"/>
  <rect x="56" y="14" width="8" height="8" rx="1" fill="currentColor"/>
</>);

// ===== علوية =====
const WallSingle = wrap(<>
  <rect x="2" y="2" width="116" height="66" rx="2" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="2"/>
  <circle cx="100" cy="35" r="2" fill="currentColor"/>
</>, "0 0 120 70");

const WallDouble = wrap(<>
  <rect x="2" y="2" width="116" height="66" rx="2" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="2"/>
  <line x1="60" y1="6" x2="60" y2="64" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="54" cy="35" r="1.8" fill="currentColor"/>
  <circle cx="66" cy="35" r="1.8" fill="currentColor"/>
</>, "0 0 120 70");

const WallGlass = wrap(<>
  <rect x="2" y="2" width="116" height="66" rx="2" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="2"/>
  <rect x="10" y="10" width="100" height="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6"/>
  <line x1="10" y1="35" x2="110" y2="35" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
  <line x1="60" y1="10" x2="60" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
</>, "0 0 120 70");

const WallLift = wrap(<>
  <rect x="2" y="2" width="116" height="40" rx="2" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="2"/>
  <path d="M50 28 L60 18 L70 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
</>, "0 0 120 45");

// ===== طولية =====
const TallPantry = wrap(<>
  <rect x="2" y="2" width="60" height="116" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <line x1="2" y1="60" x2="62" y2="60" stroke="currentColor" strokeOpacity="0.5"/>
  <circle cx="52" cy="35" r="1.8" fill="currentColor"/>
  <circle cx="52" cy="85" r="1.8" fill="currentColor"/>
</>, "0 0 64 120");

const TallFridge = wrap(<>
  <rect x="2" y="2" width="60" height="116" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <line x1="2" y1="40" x2="62" y2="40" stroke="currentColor" strokeWidth="1.5"/>
  <rect x="48" y="14" width="3" height="14" rx="1" fill="currentColor"/>
  <rect x="48" y="55" width="3" height="40" rx="1" fill="currentColor"/>
</>, "0 0 64 120");

const TallOven = wrap(<>
  <rect x="2" y="2" width="60" height="116" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <rect x="10" y="40" width="44" height="38" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2"/>
  <circle cx="20" cy="20" r="2" fill="currentColor"/>
  <circle cx="32" cy="20" r="2" fill="currentColor"/>
  <circle cx="44" cy="20" r="2" fill="currentColor"/>
</>, "0 0 64 120");

// ===== أجهزة =====
const ApplStove = wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <circle cx="35" cy="35" r="10" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="85" cy="35" r="10" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="35" cy="68" r="8" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="85" cy="68" r="8" stroke="currentColor" strokeWidth="1.5"/>
</>);

const ApplOvenBuilt = wrap(<>
  <rect x="2" y="2" width="116" height="56" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <rect x="14" y="16" width="92" height="32" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2"/>
  <circle cx="100" cy="10" r="1.5" fill="currentColor"/>
</>, "0 0 120 60");

const ApplHood = wrap(<>
  <rect x="2" y="2" width="116" height="20" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <path d="M2 22 L60 38 L118 22" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
</>, "0 0 120 40");

const ApplDishwasher = wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <line x1="2" y1="22" x2="118" y2="22" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
  <circle cx="30" cy="12" r="1.5" fill="currentColor"/>
  <rect x="14" y="32" width="92" height="46" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
</>);

// ===== خاصة =====
const Island = wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
  <rect x="14" y="14" width="92" height="62" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
</>);

const Window = wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="1" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="2"/>
  <line x1="60" y1="2" x2="60" y2="88" stroke="currentColor" strokeWidth="1.5"/>
  <line x1="2" y1="45" x2="118" y2="45" stroke="currentColor" strokeWidth="1.5"/>
</>);

const Door = wrap(<>
  <rect x="2" y="2" width="116" height="86" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="2"/>
  <path d="M2 88 A 60 60 0 0 1 62 28" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 3"/>
  <circle cx="100" cy="48" r="2" fill="currentColor"/>
</>);

const ICONS: Record<string, React.FC<IconProps>> = {
  base_1door: BaseSingleDoor,
  base_2door: BaseTwoDoors,
  base_door_drawer: BaseDoorDrawer,
  base_3drawer: BaseDrawers(3),
  base_4drawer: BaseDrawers(4),
  base_corner: BaseCorner,
  base_sink: BaseSink,
  wall_1door: WallSingle,
  wall_2door: WallDouble,
  wall_glass: WallGlass,
  wall_lift: WallLift,
  tall_pantry: TallPantry,
  tall_oven: TallOven,
  tall_fridge: TallFridge,
  appl_stove: ApplStove,
  appl_oven: ApplOvenBuilt,
  appl_hood: ApplHood,
  appl_dishwash: ApplDishwasher,
  special_island: Island,
  special_window: Window,
  special_door: Door,
};

export function BlockIcon({ type, className = "size-6 text-primary" }: { type: string; className?: string }) {
  const Icon = ICONS[type];
  if (!Icon) return <span className={className}>▢</span>;
  return <Icon className={className} />;
}
