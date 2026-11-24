import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
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

const spheres = [...Array(27)].map((_, i) => ({
  scale: [0.75, 0.95, 0.8, 1.0, 0.85, 0.75, 0.9][i % 7],
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
  isMobile?: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
  isActive,
  isMobile = false,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  // Beautiful, prominent cloud scale on mobile that fills the viewport with comfortable margins
  const effectiveScale = isMobile ? scale * 0.98 : scale;

  useFrame((_state, delta) => {
    if (!isActive) return;
    delta = Math.min(0.1, delta);

    // On mobile: balanced inward pull creates a lush, cohesive, full cloud formation
    // On desktop: retains the classic landscape elliptical spread (-50 X, -150 Y)
    const forceX = isMobile ? -130 : -50;
    const forceY = isMobile ? -75 : -150;
    const forceZ = isMobile ? -75 : -50;

    const impulse = vec
      .copy(api.current!.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          forceX * delta * effectiveScale,
          forceY * delta * effectiveScale,
          forceZ * delta * effectiveScale,
        ),
      );

    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[r(15), r(15) - 20, r(15) - 10]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[effectiveScale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * effectiveScale]}
        args={[0.15 * effectiveScale, 0.275 * effectiveScale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={effectiveScale}
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
  isMobile?: boolean;
};

function Pointer({
  vec = new THREE.Vector3(),
  isActive,
  isMobile = false,
}: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0,
      ),
      0.2,
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
      <BallCollider args={[isMobile ? 1.4 : 2]} />
    </RigidBody>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TechStack = () => {
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { rootMargin: "250px" },
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
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
        }),
    );
  }, []);

  return (
    <div className="techstack" ref={containerRef}>
      <h2 className="title techstack-title">
        Tech <em className="techstack-title-serif">stack</em>
        <span className="techstack-title-dot">.</span>
      </h2>

      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, isMobile ? -0.5 : 0, isMobile ? 24 : 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          touchAction: "pan-y",
        }}
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
          <Pointer isActive={isActive} isMobile={isMobile} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              material={materials[i % materials.length]}
              isActive={isActive}
              isMobile={isMobile}
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
