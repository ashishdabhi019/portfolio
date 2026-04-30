import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { SiTensorflow, SiPytorch } from "react-icons/si";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";

const textureLoader = new THREE.TextureLoader();
const imageUrls = [
  "images/react2.webp",
  "images/next2.webp",
  "images/node2.webp",
  "images/express.webp",
  "images/mongo.webp",
  "images/mysql.webp",
  "images/typescript.webp",
  "images/javascript.webp",
  "images/python2.png",
  "images/openai2.png",
  "images/html2.png",
  "images/ollama2.png",
  "images/tensorflow2.png",
  "images/pytorch2.png",
  "images/ragflow2.png",
  "images/claude2.png",
  "images/gemini2.png",
  "images/cline2.png",
  "images/cursor2.png",
  "images/n8n2.png",
  "images/openclaw2.png",
];


const textures = imageUrls.map((url) => {
  const texture = textureLoader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
});

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

const spheres = [...Array(27)].map(() => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive) return;
    delta = Math.min(0.1, delta);
    const impulse = vec
      .copy(api.current!.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale
        )
      );

    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

type PointerProps = {
  vec?: THREE.Vector3;
  isActive: boolean;
};

function Pointer({ vec = new THREE.Vector3(), isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

// ─── Mobile Icon Grid ────────────────────────────────────────────────────────
import {
  SiReact, SiNextdotjs, SiNodedotjs, SiExpress,
  SiMongodb, SiMysql, SiTypescript, SiJavascript,
  SiOpenai, SiHtml5, SiOllama,
} from "react-icons/si";

const CursorIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <img src="images/cursor.png" alt="Cursor" className={className} style={{ ...style, objectFit: "contain" }} />
);

const ClineIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <img src="images/cline.png" alt="Cline" className={className} style={{ ...style, objectFit: "contain" }} />
);

const GeminiIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <img src="images/gemini.webp" alt="Gemini" className={className} style={{ ...style, objectFit: "contain" }} />
);

const ClaudeIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <img src="images/claude.png" alt="Claude" className={className} style={{ ...style, objectFit: "contain" }} />
);

const N8nIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <img src="images/n8n.png" alt="n8n" className={className} style={{ ...style, objectFit: "contain" }} />
);

const OpenClawIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <img src="images/openclaw.png" alt="Open Claw" className={className} style={{ ...style, objectFit: "contain" }} />
);

const PythonIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <img src="images/python.svg" alt="Python" className={className} style={{ ...style, objectFit: "contain" }} />
);

const RagflowIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <img src="images/ragflow.png" alt="RAGFlow" className={className} style={{ ...style, objectFit: "contain" }} />
);

const mobileIcons = [
  { Icon: SiReact, label: "React", color: "#61DAFB" },
  { Icon: SiNextdotjs, label: "Next.js", color: "#ffffff" },
  { Icon: SiNodedotjs, label: "Node.js", color: "#68A063" },
  { Icon: SiExpress, label: "Express", color: "#ffffff" },
  { Icon: SiMongodb, label: "MongoDB", color: "#4DB33D" },
  { Icon: SiMysql, label: "MySQL", color: "#4479A1" },
  { Icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
  { Icon: SiJavascript, label: "JavaScript", color: "#F7DF1E" },
  { Icon: SiOpenai, label: "OpenAI", color: "#ffffff" },
  { Icon: SiHtml5, label: "HTML5", color: "#E34F26" },
  { Icon: SiOllama, label: "Ollama", color: "#ffffff" },
  { Icon: PythonIcon, label: "Python", color: "#FFD43B" },
  { Icon: SiTensorflow, label: "TensorFlow", color: "#FF6F00" },
  { Icon: SiPytorch, label: "PyTorch", color: "#EE4C2C" },
  { Icon: GeminiIcon, label: "Gemini", color: "multicolor" },
  { Icon: ClaudeIcon, label: "Claude", color: "#D97757" },
  { Icon: CursorIcon, label: "Cursor", color: "#ffffff" },
  { Icon: N8nIcon, label: "n8n", color: "#EA4B71" },
  { Icon: RagflowIcon, label: "RAGFlow", color: "#00FFFF" },
  { Icon: ClineIcon, label: "Cline", color: "#ffffff" },
  { Icon: OpenClawIcon, label: "Open Claw", color: "#EF4444" },
];

// Fan arc positions for relative indices -3, -2, -1, 0, +1, +2, +3
// Deep, pronounced sweeping curve across the X-axis
const FAN = [
  { x: -330, y: 80, rotZ: -32, scale: 0.60, opacity: 0.0 }, // ghost (fade-out edge)
  { x: -220, y: 30, rotZ: -20, scale: 1.0, opacity: 0.58 }, // far
  { x: -110, y: -5, rotZ: -10, scale: 1.0, opacity: 0.82 }, // mid
  { x: 0, y: -20, rotZ: 0, scale: 1.0, opacity: 1.0 }, // center
  { x: 110, y: -5, rotZ: 10, scale: 1.0, opacity: 0.82 }, // mid
  { x: 220, y: 30, rotZ: 20, scale: 1.0, opacity: 0.58 }, // far
  { x: 330, y: 80, rotZ: 32, scale: 0.60, opacity: 0.0 }, // ghost (fade-out edge)
];
function lp(a: number, b: number, t: number) { return a + (b - a) * t; }
function cl(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function fanXform(rel: number) {
  const c = cl(rel, -3.5, 3.5);
  const idx = c + 3; // 0..6
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  const t = idx - lo;
  const A = FAN[cl(lo, 0, 6)], B = FAN[cl(hi, 0, 6)];
  return {
    x: lp(A.x, B.x, t), y: lp(A.y, B.y, t),
    rotZ: lp(A.rotZ, B.rotZ, t), scale: lp(A.scale, B.scale, t),
    opacity: Math.abs(rel) > 3.2 ? 0 : lp(A.opacity, B.opacity, t),
  };
}

// ── Apple-style picker tick sound via Web Audio API ──────────────────────────
let _audioCtx: AudioContext | null = null;
let _audioUnlocked = false;

/**
 * SYNCHRONOUS unlock — called directly inside a native touchstart handler.
 * Uses the "silent buffer" trick recognized by iOS Safari & Chrome Android.
 */
function unlockAudioSync(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_audioCtx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (!_audioUnlocked) {
      // Silent 1-sample buffer — the only reliable iOS Safari unlock technique
      const silentBuf = _audioCtx.createBuffer(1, 1, 22050);
      const src = _audioCtx.createBufferSource();
      src.buffer = silentBuf;
      src.connect(_audioCtx.destination);
      src.start(0);
      _audioUnlocked = true;
    }
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    return _audioCtx;
  } catch {
    return null;
  }
}

/**
 * Premium Apple picker-wheel click — 3-layer synthesis:
 *  1. Triangle oscillator  → warm "body" of the click
 *  2. Bandpass noise       → physical "thock" texture (wood/glass feel)
 *  3. Sub oscillator       → subtle low-end punch
 *
 * Automatically resumes a suspended context so sound never silently drops
 * after the browser auto-suspends the AudioContext due to inactivity.
 */
function playPickerTick(ctx: AudioContext, direction: 1 | -1 = 1) {
  // Auto-resume if browser suspended the context during inactivity
  if (ctx.state === "suspended") {
    ctx.resume(); // fire-and-forget; skip this tick, next one will play
    return;
  }
  if (ctx.state !== "running") return;

  const now = ctx.currentTime;

  // ── Pleasant UI "Bubble Pop" / Droplet ─────────────────────────────────────
  // A soft sine wave that sweeps slightly up in pitch for a modern, friendly feel

  const osc = ctx.createOscillator();
  osc.type = "sine";
  
  // Base pitch depends on drag direction
  const baseFreq = direction === 1 ? 450 : 380;
  osc.frequency.setValueAtTime(baseFreq, now);
  // Pitch sweeps UP rapidly to create a "bloop" / bubble effect
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.03);

  // Soft envelope to avoid harsh clicking sounds
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.005); // slightly soft attack
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04); // smooth tail

  osc.connect(gain);
  gain.connect(ctx.destination);

  // Play for 40ms
  osc.start(now);
  osc.stop(now + 0.04);
}

function MobileTechStack() {
  const count = mobileIcons.length;
  const offRef = useRef(0);
  const [tick, setTick] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastIndex = useRef(0);
  const dragDir = useRef<1 | -1>(1);
  const rafRef = useRef<number | null>(null);
  const audioReady = useRef<AudioContext | null>(null);
  const gestureReady = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null); // attached to the drag container

  // Animation loop
  useEffect(() => {
    const frame = () => {
      if (!dragging.current) offRef.current += 0.005;
      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Native touch listeners — the ONLY event type browsers unconditionally
  // trust for restricted APIs (AudioContext, navigator.vibrate).
  // React synthetic pointer events are NOT considered trusted in this context.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      dragging.current = true;
      lastX.current = e.touches[0].clientX;
      lastIndex.current = Math.round(offRef.current);

      // Unlock audio inside the native touchstart handler — 100% trusted gesture
      if (!gestureReady.current) {
        const ctx = unlockAudioSync();
        if (ctx) {
          audioReady.current = ctx;
          gestureReady.current = true;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault(); // prevent page scroll while dragging carousel
      const x = e.touches[0].clientX;
      const dx = x - lastX.current;
      dragDir.current = dx < 0 ? 1 : -1;
      offRef.current -= dx * 0.025;
      lastX.current = x;

      const currentIndex = Math.round(offRef.current);
      if (currentIndex !== lastIndex.current && gestureReady.current) {
        // Vibrate (Android) — inside native touchmove, always trusted
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(20);
        }
        // Apple-style tick sound
        if (audioReady.current) playPickerTick(audioReady.current, dragDir.current);
        
        lastIndex.current = currentIndex;
      }
    };

    const onTouchEnd = () => { dragging.current = false; };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false }); // false = can preventDefault
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  void tick; // consumed only to trigger re-render

  return (
    <div className="mobile-techstack">
      <h2 className="mobile-techstack-title">Tech Stack</h2>
      <div
        ref={stageRef}
        className="fan-stage"
      >
        {mobileIcons.map(({ Icon, label, color }, i) => {
          let rel = ((i - offRef.current) % count + count) % count;
          if (rel > count / 2) rel -= count;
          const { x, y, rotZ, scale, opacity } = fanXform(rel);
          const zIndex = Math.round(10 - Math.abs(rel) * 2);
          
          const isMulti = color === "multicolor";
          // We use #9b72cb (purple) as fallback --fan-color for borders/shadows if multicolor
          const fanColor = isMulti ? "#9b72cb" : color;
          
          return (
            <div key={i} className="fan-item"
              style={{ transform: `translateX(${x}px) translateY(${y}px) rotateZ(${rotZ}deg) scale(${scale})`, opacity, zIndex }}
            >
              <div className={`fan-card ${isMulti ? "gemini-border" : ""}`} style={{ "--fan-color": fanColor } as React.CSSProperties}>
                <Icon className="fan-icon" style={isMulti ? {} : { color }} />
                <div className="fan-glow" />
              </div>
              <span className="fan-label">
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="ring-hint">Drag to spin</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TechStack = () => {
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const threshold = document
        .getElementById("work")!
        .getBoundingClientRect().top;
      setIsActive(scrollY > threshold);
    };
    document.querySelectorAll(".header a").forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      element.addEventListener("click", () => {
        const interval = setInterval(() => {
          handleScroll();
        }, 10);
        setTimeout(() => {
          clearInterval(interval);
        }, 1000);
      });
    });
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.3,
          metalness: 0.5,
          roughness: 1,
          clearcoat: 0.1,
        })
    );
  }, []);

  if (isMobile) {
    return <MobileTechStack />;
  }

  return (
    <div className="techstack">
      <h2 className="title" style={{
        fontSize: "70px",
        fontWeight: 400,
        position: "relative",
        zIndex: 2,
        marginBottom: 0,
        marginTop: 0,
        background: "linear-gradient(0deg, #5b21b6, #ffffff)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}>
        Tech Stack
      </h2>

      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              material={materials[i % materials.length]}
              isActive={isActive}
            />
          ))}
        </Physics>
        <Environment
          files="models/char_enviorment.hdr"
          environmentIntensity={0.5}
          environmentRotation={[0, 4, 2]}
        />
        <EffectComposer enableNormalPass={false}>
          <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStack;
