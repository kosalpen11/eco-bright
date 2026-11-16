/**
 * Animated Bon Om Touk scene: boat races on the river in front of an illuminated Royal Palace
 * silhouette, under the full moon (Ak Ambok) with fireworks and floating lights (bandaet protip).
 * Pure SVG + CSS (animations live in globals.css under `.wf-scene`), decorative only.
 */

/*
 * The drawing is 2400 units wide (viewBox x -600..1800) around a 1200-unit core where the palace sits.
 * With `xMidYMax slice`, phones crop the sides and wide screens show more river, so the palace and
 * its spire are never cut off.
 */
const VIEW_X = -600;
const VIEW_WIDTH = 2400;

const STARS = [
  [-560, 40], [-470, 18], [-380, 62], [-290, 26], [-200, 48], [-110, 14], [-30, 70],
  [60, 30], [140, 18], [230, 44], [330, 22], [410, 52], [470, 16], [760, 26], [830, 58],
  [1000, 20], [1100, 30], [1160, 64], [1060, 92], [700, 70], [290, 80], [40, 86],
  [1250, 22], [1330, 60], [1420, 30], [1510, 74], [1600, 18], [1690, 50], [1770, 28],
] as const;

const FIREWORKS = [
  { x: 290, y: 56, color: "#ffd24a", delay: 0 },
  { x: 1000, y: 70, color: "#ff6b6b", delay: 1.4 },
  { x: 210, y: 96, color: "#7ce0ff", delay: 2.6 },
  { x: 700, y: 30, color: "#ffd24a", delay: 3.6 },
  { x: -250, y: 60, color: "#ff6b6b", delay: 0.8 },
  { x: 1450, y: 50, color: "#7ce0ff", delay: 2 },
];

// Rounded so server and browser render identical attributes (raw trig floats can differ by 1 ulp).
const round = (value: number) => Math.round(value * 100) / 100;
const RAYS = Array.from({ length: 12 }, (_, index) => {
  const angle = (index * Math.PI * 2) / 12;
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  return { key: index, x1: round(cos * 6), y1: round(sin * 6), x2: round(cos * 22), y2: round(sin * 22) };
});

const FLOATS = [
  { x: -400, y: 186, delay: -3 },
  { x: 120, y: 182, delay: 0 },
  { x: 470, y: 188, delay: -6 },
  { x: 940, y: 184, delay: -12 },
  { x: 1400, y: 186, delay: -9 },
];

// Gentle river ripples, 60 units per wave, long enough to loop while sliding 60 units.
const ripple = (startX: number, y: number, amplitude: number) =>
  `M${startX} ${y} q15 ${-amplitude} 30 0` + " t30 0".repeat(Math.ceil((VIEW_WIDTH + 200) / 30));

function Firework({ x, y, color, delay }: (typeof FIREWORKS)[number]) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="wf-firework" style={{ animationDelay: `${delay}s` }}>
        {RAYS.map((ray) => (
          <line
            key={ray.key}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
        <circle r="3" fill="#fff6d5" />
      </g>
    </g>
  );
}

/** A long racing boat with a row of paddlers; oars sweep in time. */
function RaceBoat({ hull, trim, paddlers }: { hull: string; trim: string; paddlers: number }) {
  const length = 24 + paddlers * 10;
  return (
    <>
      {/* Dragon-head prow and tail */}
      <path
        d={`M0 0 L${length} 0 Q${length + 10} -2 ${length + 16} -14 L${length + 12} 2 Q${length} 8 8 8 Q-4 4 -6 -8 Z`}
        fill={hull}
      />
      <path d={`M2 1 L${length} 1`} stroke={trim} strokeWidth="1.5" />
      {Array.from({ length: paddlers }, (_, index) => {
        const px = 16 + index * 10;
        return (
          <g key={index} transform={`translate(${px} 0)`}>
            <circle cy="-8" r="2.4" fill="#0b1636" />
            <path d="M0 -6 L0 -1" stroke="#0b1636" strokeWidth="2.4" strokeLinecap="round" />
            <line className="wf-oar" x1="0" y1="-4" x2="-6" y2="9" stroke={trim} strokeWidth="1.3" strokeLinecap="round" />
          </g>
        );
      })}
      {/* Drummer / coxswain at the stern */}
      <circle cx="4" cy="-9" r="2.6" fill={trim} />
    </>
  );
}

// Night-lit palace palette: floodlit ochre walls, terracotta roofs, gold trim (as seen from the river).
const WALL = "#f0bf55";
const WALL_SHADE = "#c98a2e";
const ROOF = "#a8461a";
const GOLD = "#ffd27a";
const OPENING = "#4a2108";
const STUPA = "#efe6cf";

/** One tier of a Khmer roof: concave, sweeping eaves with upturned chofa tips at both ends. */
function RoofTier({ cx, bottomHalf, topHalf, bottom, top }: { cx: number; bottomHalf: number; topHalf: number; bottom: number; top: number }) {
  const left = cx - bottomHalf;
  const right = cx + bottomHalf;
  return (
    <>
      <path
        d={`M${left} ${bottom} Q${cx - topHalf} ${bottom - 1} ${cx - topHalf} ${top} L${cx + topHalf} ${top} Q${cx + topHalf} ${bottom - 1} ${right} ${bottom} Z`}
        fill={ROOF}
        stroke={GOLD}
        strokeWidth="0.9"
      />
      <Chofa x={left} y={bottom} dir={-1} />
      <Chofa x={right} y={bottom} dir={1} />
    </>
  );
}

/** Upswept roof finial (chofa / naga tail). */
function Chofa({ x, y, dir, size = 1 }: { x: number; y: number; dir: 1 | -1; size?: number }) {
  return (
    <path
      d={`M${x} ${y} c${dir * 1.5 * size} ${-1 * size} ${dir * 3.5 * size} ${-3 * size} ${dir * 2.5 * size} ${-7 * size}`}
      fill="none"
      stroke={GOLD}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  );
}

/** Frontal Khmer gable: steep, slightly concave sides, ornamented pediment, chofa at the apex. */
function Gable({ cx, half, bottom, top }: { cx: number; half: number; bottom: number; top: number }) {
  const height = bottom - top;
  return (
    <>
      <path
        d={`M${cx - half} ${bottom} Q${cx - half * 0.3} ${bottom - height * 0.3} ${cx} ${top} Q${cx + half * 0.3} ${bottom - height * 0.3} ${cx + half} ${bottom} Z`}
        fill={ROOF}
        stroke={GOLD}
        strokeWidth="0.9"
      />
      <path
        d={`M${cx - half * 0.62} ${bottom - 1} Q${cx - half * 0.2} ${bottom - height * 0.35} ${cx} ${top + height * 0.3} Q${cx + half * 0.2} ${bottom - height * 0.35} ${cx + half * 0.62} ${bottom - 1} Z`}
        fill={WALL_SHADE}
      />
      <circle cx={cx} cy={bottom - height * 0.3} r="2.2" fill={GOLD} />
      <Chofa x={cx} y={top + 1} dir={1} size={1.1} />
      <Chofa x={cx - half} y={bottom} dir={-1} />
      <Chofa x={cx + half} y={bottom} dir={1} />
    </>
  );
}

function Arch({ x, bottom, width, height }: { x: number; bottom: number; width: number; height: number }) {
  const r = width / 2;
  return <path d={`M${x} ${bottom} v${-(height - r)} a${r} ${r} 0 0 1 ${width} 0 v${height - r} Z`} fill={OPENING} />;
}

/** Bell-shaped stupa of the Silver Pagoda compound. */
function Stupa({ cx, base, height }: { cx: number; base: number; height: number }) {
  return (
    <g fill={STUPA} stroke={GOLD} strokeWidth="0.6">
      <rect x={cx - 9} y={base - 5} width="18" height="5" />
      <rect x={cx - 6.5} y={base - 10} width="13" height="5" />
      <path d={`M${cx - 7} ${base - 10} Q${cx - 7} ${base - 24} ${cx} ${base - 26} Q${cx + 7} ${base - 24} ${cx + 7} ${base - 10} Z`} />
      {[0, 1, 2, 3].map((ring) => (
        <rect key={ring} x={cx - 3 + ring * 0.5} y={base - 29 - ring * 3} width={6 - ring} height="2.4" />
      ))}
      <path d={`M${cx - 1.6} ${base - 38} L${cx} ${base - height} L${cx + 1.6} ${base - 38} Z`} />
    </g>
  );
}

/**
 * The Royal Palace, Phnom Penh, seen from the riverside at night: the Throne Hall with its four-faced
 * central spire, Chanchhaya (Moonlight) Pavilion on the river wall, and Silver Pagoda stupas.
 * A stylised illustration, not an architectural drawing.
 */
function Palace() {
  return (
    <g className="wf-palace" strokeLinejoin="round">
      {/* Silver Pagoda compound (behind, right) */}
      <Stupa cx={772} base={146} height={84} />
      <Stupa cx={808} base={146} height={70} />
      <rect x="716" y="126" width="44" height="20" fill={WALL} stroke={GOLD} strokeWidth="0.6" />
      <RoofTier cx={738} bottomHalf={30} topHalf={18} bottom={128} top={117} />
      <RoofTier cx={738} bottomHalf={18} topHalf={8} bottom={117} top={108} />

      {/* Throne Hall: central spire (behind the gables) */}
      <g fill={WALL} stroke={GOLD} strokeWidth="0.7">
        <rect x="589" y="62" width="22" height="40" />
        <rect x="586" y="58" width="28" height="5" fill={ROOF} />
        {/* Four-faced (Bayon-style) tower section */}
        <rect x="590" y="44" width="20" height="14" />
        <path d="M594 48 h4 M602 48 h4 M597 52 h6 M596 55 h8" stroke={OPENING} strokeWidth="1" />
        <path d="M587 44 L613 44 L609 38 L591 38 Z" fill={ROOF} />
        <path d="M591 38 L609 38 L606 32 L594 32 Z" />
        <path d="M594 32 L606 32 L604 27 L596 27 Z" fill={ROOF} />
        <path d="M596 27 L604 27 L602.5 22 L597.5 22 Z" />
        <path d="M597.5 22 L600 3 L602.5 22 Z" fill={GOLD} />
      </g>
      <line x1="600" y1="3" x2="600" y2="-2" stroke={GOLD} strokeWidth="1" />

      {/* Throne Hall: wings */}
      <rect x="498" y="138" width="204" height="8" fill={WALL_SHADE} stroke={GOLD} strokeWidth="0.6" />
      <rect x="508" y="117" width="184" height="21" fill={WALL} stroke={GOLD} strokeWidth="0.6" />
      {[514, 528, 542, 648, 662, 676].map((x) => (
        <Arch key={x} x={x} bottom={136} width={8} height={14} />
      ))}
      <RoofTier cx={535} bottomHalf={30} topHalf={20} bottom={119} top={106} />
      <RoofTier cx={665} bottomHalf={30} topHalf={20} bottom={119} top={106} />
      <Gable cx={535} half={19} bottom={107} top={86} />
      <Gable cx={665} half={19} bottom={107} top={86} />

      {/* Throne Hall: central portico with stacked gables */}
      <rect x="562" y="108" width="76" height="30" fill={WALL} stroke={GOLD} strokeWidth="0.6" />
      <Arch x={589} bottom={138} width={22} height={24} />
      {[568, 625].map((x) => (
        <Arch key={x} x={x} bottom={136} width={7} height={14} />
      ))}
      <Gable cx={600} half={42} bottom={104} top={66} />
      <Gable cx={600} half={46} bottom={112} top={80} />

      {/* Riverside wall with ornamental crenellation */}
      <rect x="350" y="146" width="500" height="14" fill={WALL_SHADE} stroke={GOLD} strokeWidth="0.6" />
      <path
        d={`M350 146 ${Array.from({ length: 41 }, (_, i) => `L${353 + i * 12} 141 L${356 + i * 12} 146 L${362 + i * 12} 146`).join(" ")}`}
        fill={WALL_SHADE}
        stroke={GOLD}
        strokeWidth="0.6"
      />

      {/* Cambodian flags along the riverside (blue / red / blue) */}
      {[362, 382, 822, 842].map((x) => (
        <g key={x} className="wf-flag">
          <line x1={x} y1="141" x2={x} y2="112" stroke={GOLD} strokeWidth="0.8" />
          <rect x={x} y="112" width="12" height="2.2" fill="#032ea1" />
          <rect x={x} y="114.2" width="12" height="3.6" fill="#e00025" />
          <rect x={x} y="117.8" width="12" height="2.2" fill="#032ea1" />
        </g>
      ))}

      {/* Chanchhaya (Moonlight) Pavilion on the river wall: open hall, lit inside, three roof tiers */}
      <rect x="404" y="122" width="72" height="16" fill="#ffd98a" opacity="0.85" />
      {[406, 418, 430, 442, 454, 466, 474].map((x) => (
        <rect key={x} x={x} y="122" width="2.5" height="16" fill={WALL} />
      ))}
      <rect x="400" y="137" width="80" height="9" fill={WALL} stroke={GOLD} strokeWidth="0.6" />
      <RoofTier cx={440} bottomHalf={44} topHalf={30} bottom={124} top={114} />
      <RoofTier cx={440} bottomHalf={31} topHalf={18} bottom={114} top={105} />
      <RoofTier cx={440} bottomHalf={19} topHalf={8} bottom={105} top={97} />
      <path d="M436 97 L440 78 L444 97 Z" fill={GOLD} />
    </g>
  );
}

export function WaterFestivalScene() {
  return (
    <div className="wf-scene" aria-hidden="true">
      <svg viewBox={`${VIEW_X} 0 ${VIEW_WIDTH} 220`} preserveAspectRatio="xMidYMax slice" role="presentation">
        <defs>
          <linearGradient id="wf-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#020a2a" />
            <stop offset="1" stopColor="#0b2a78" />
          </linearGradient>
          <linearGradient id="wf-river" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0c3485" />
            <stop offset="1" stopColor="#03123d" />
          </linearGradient>
          <radialGradient id="wf-moon-glow">
            <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wf-float-glow">
            <stop offset="0" stopColor="#ffd24a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff9f1c" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x={VIEW_X} width={VIEW_WIDTH} height="220" fill="url(#wf-sky)" />

        {STARS.map(([x, y], index) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={index % 3 === 0 ? 1.6 : 1}
            fill="#ffffff"
            className="wf-star"
            style={{ animationDelay: `${((index % 5) * 6) / 10}s` }}
          />
        ))}

        {/* Full moon (Ak Ambok / Sampeah Preah Khae) */}
        <circle cx="905" cy="44" r="56" fill="url(#wf-moon-glow)" />
        <circle cx="905" cy="44" r="22" fill="#fff1c2" />
        <circle cx="898" cy="39" r="4" fill="#f2dc9a" />
        <circle cx="912" cy="51" r="3" fill="#f2dc9a" />

        {FIREWORKS.map((firework) => (
          <Firework key={`${firework.x}-${firework.y}`} {...firework} />
        ))}

        <Palace />

        {/* River */}
        <rect x={VIEW_X} y="160" width={VIEW_WIDTH} height="60" fill="url(#wf-river)" />
        {/* Gold reflections of the palace lights */}
        <g className="wf-reflection" stroke="#ffcf5a" strokeLinecap="round" strokeWidth="2">
          <line x1="530" y1="170" x2="580" y2="170" />
          <line x1="610" y1="176" x2="672" y2="176" />
          <line x1="548" y1="184" x2="590" y2="184" />
          <line x1="452" y1="172" x2="486" y2="172" />
          <line x1="716" y1="174" x2="752" y2="174" />
          <line x1="596" y1="192" x2="626" y2="192" />
        </g>
        {/* Moon reflection */}
        <g className="wf-reflection" stroke="#fff1c2" strokeLinecap="round" strokeWidth="2">
          <line x1="887" y1="172" x2="923" y2="172" />
          <line x1="893" y1="182" x2="917" y2="182" />
        </g>
        {/* Moving ripples */}
        <g className="wf-waves" fill="none" stroke="rgba(160, 200, 255, 0.35)" strokeWidth="1.5">
          <path d={ripple(VIEW_X - 60, 200, 5)} />
          <path d={ripple(VIEW_X - 75, 212, 4)} />
        </g>

        {/* Floating illuminated floats (bandaet protip) */}
        {FLOATS.map((float) => (
          <g key={float.x} transform={`translate(${float.x} ${float.y})`}>
            <g className="wf-float" style={{ animationDelay: `${float.delay}s` }}>
              <circle r="16" fill="url(#wf-float-glow)" />
              <path d="M-10 2 L10 2 L6 7 L-6 7 Z" fill="#b8860b" />
              <path d="M-6 2 L0 -9 L6 2 Z" fill="#ffd24a" />
            </g>
          </g>
        ))}

        {/* Racing boats */}
        <g transform="translate(380 184)">
          <g className="wf-boat wf-boat--slow">
            <RaceBoat hull="#c8102e" trim="#ffd24a" paddlers={14} />
          </g>
        </g>
        <g transform="translate(560 204) scale(1.15)">
          <g className="wf-boat wf-boat--fast">
            <RaceBoat hull="#ffd24a" trim="#c8102e" paddlers={16} />
          </g>
        </g>
      </svg>
    </div>
  );
}
