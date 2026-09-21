import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DRACOLoader, GLTFLoader, RGBELoader } from "three-stdlib";
import { decryptFile } from "./Character/utils/decrypt";
import "./styles/MinimalLoader.css";
import { useLoading } from "../context/LoadingProvider";
import { motion } from "framer-motion";

/* ════════════════════════════════════════════════════════
   Ultra-minimal loading screen:
   • Pure black background
   • 3D character dead-center (typing, blinking, head tracks mouse)
   • Big white % number — bottom-left only
   • Nothing else
   ════════════════════════════════════════════════════════ */

const LoadingCharacter = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [loaded,     setLoaded]     = useState(false);
  const [exiting,    setExiting]    = useState(false);
  const [expanding,  setExpanding]  = useState(false);
  const [displayNum, setDisplayNum] = useState(0);

  /* ── smooth animated counter ── */
  useEffect(() => {
    const target = Math.min(100, Math.max(0, percent));
    if (target === displayNum) return;
    const diff = target - displayNum;
    const step = Math.sign(diff) * Math.max(1, Math.ceil(Math.abs(diff) / 6));
    const t = setTimeout(() => {
      setDisplayNum((n) => {
        const next = n + step;
        return diff > 0 ? Math.min(next, target) : Math.max(next, target);
      });
    }, 36);
    return () => clearTimeout(t);
  }, [percent, displayNum]);

  /* ── stage 1 — 100% hit ── */
  useEffect(() => {
    if (percent >= 100 && !loaded) {
      const t = setTimeout(() => setLoaded(true), 400);
      return () => clearTimeout(t);
    }
  }, [percent, loaded]);

  /* ── stage 2 — auto-enter ── */
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => handleEnter(), 600);
    return () => clearTimeout(t);
  }, [loaded]);

  function handleEnter() {
    if (expanding) return;
    setExpanding(true);
    setExiting(true);
    import("./utils/initialFX").then((mod) => {
      setTimeout(() => { mod.initialFX?.(); setIsLoading(false); }, 1200);
    });
  }

  /* ── THREE.JS character scene ── */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const w = rect.width  || 560;
    const h = rect.height || 680;

    /* renderer — transparent bg so pure CSS black shows */
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(14.5, w / h, 0.1, 1000);
    // Move camera further back (z: 150) for a much smaller character
    // Center character horizontally (x: 0)
    // Move camera Up (y: 9.0) to shift character Down
    camera.position.set(0, 9.0, 150);
    camera.zoom = 1.0;
    camera.updateProjectionMatrix();

    /* ── Lighting (Restored to original site colors) ── */
    const dirLight = new THREE.DirectionalLight(0x7C3AED, 1.0);
    dirLight.position.set(-0.47, -0.32, -1);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x9D4EDD, 0, 100, 3);
    pointLight.position.set(3, 12, 4);
    scene.add(pointLight);

    /* HDR env */
    new RGBELoader().setPath("/models/").load(
      "char_enviorment.hdr?v=2",
      (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = tex;
        scene.environmentIntensity = 0.64; // Restored to original
        scene.environmentRotation.set(5.76, 85.85, 1);
      }
    );

    /* ── Load encrypted GLTF ── */
    const loader = new GLTFLoader();
    const draco  = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    loader.setDRACOLoader(draco);

    let mixer:    THREE.AnimationMixer;
    let headBone: THREE.Object3D | null = null;
    let screenLight: any = null;
    const mouse  = { x: 0, y: 0 };
    const interp = { x: 0.1, y: 0.2 };
    const clock  = new THREE.Clock();
    let rafId:   number;

    decryptFile("/models/character.enc?v=2", "MyCharacter12")
      .then((buffer) => {
        loader.parse(buffer, "", async (gltf) => {
          const char = gltf.scene;
          try { await renderer.compileAsync(char, camera, scene); } catch(e) { console.warn("compileAsync not supported", e); }

          char.traverse((child: any) => {
            if (!child.isMesh) return;
            child.castShadow    = true;
            child.receiveShadow = true;
            child.frustumCulled = true;

            // Change clothing colors to match site theme
            if (child.material) {
              if (child.name === "BODY.SHIRT") { // The shirt mesh
                const newMat = (child.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                newMat.color = new THREE.Color("#8B4513");
                child.material = newMat;
              } else if (child.name === "Pant") {
                const newMat = (child.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                newMat.color = new THREE.Color("#000000");
                child.material = newMat;
              }
            }

            // Setup monitor visibility exactly like 'what I do' section
            if (child.parent?.name === "Plane004") {
              child.material.transparent = true;
              child.material.opacity = 1;
              if (child.material.name === "Material.018") {
                child.material.color.set("#FFFFFF");
              }
            }
          });

          scene.add(char);

          const footR = char.getObjectByName("footR");
          const footL = char.getObjectByName("footL");
          if (footR) footR.position.y = 3.36;
          if (footL) footL.position.y = 3.36;

          // Set character rotation for what I do section
          char.rotation.set(0.12, 0.92, 0);

          // Set neck angle for looking at monitor
          const neckBone = char.getObjectByName("spine005");
          if (neckBone) {
            neckBone.rotation.x = 0.6;
          }

          headBone    = char.getObjectByName("spine006") || null;
          screenLight = char.getObjectByName("screenlight") || null;
          if (screenLight) {
            screenLight.material.transparent = true;
            screenLight.material.opacity = 1;
            screenLight.material.emissive.set("#B0F5EA");
          }

          /* ── animations — same as main site ── */
          mixer = new THREE.AnimationMixer(char);

          const play = (name: string, loop = true) => {
            const clip = THREE.AnimationClip.findByName(gltf.animations, name);
            if (!clip) return;
            const action = mixer.clipAction(clip);
            if (!loop) { action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; }
            action.timeScale = 1.2;
            action.play();
          };

          play("introAnimation", false);
          ["key1","key2","key5","key6"].forEach((n) => play(n));
          play("typing");
          setTimeout(() => play("Blink"), 2600);

          draco.dispose();
        });
      })
      .catch(console.error);

    /* mouse → head tracking */
    const onMouse = (e: MouseEvent) => {
      mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener("mousemove", onMouse);

    /* resize */
    const onResize = () => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    /* render loop */
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      if (headBone) {
        const maxRot = Math.PI / 6;
        headBone.rotation.y = THREE.MathUtils.lerp(
          headBone.rotation.y, mouse.x * maxRot, interp.y
        );
        const cy = Math.max(-0.3, Math.min(0.4, mouse.y));
        headBone.rotation.x = THREE.MathUtils.lerp(
          headBone.rotation.x, -cy - 0.5 * maxRot, interp.x
        );
      }

      if (screenLight?.material?.opacity > 0.9) {
        pointLight.intensity = screenLight.material.emissiveIntensity * 20;
      }

      mixer?.update(clock.getDelta());
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      scene.clear();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);


  return (
    <motion.div 
      className="ml-screen"
      initial={{ y: 0 }}
      animate={{ y: exiting ? "-100%" : 0 }}
      transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
    >

      {/* ── 3D character — absolute center ── */}
      <div className="ml-canvas-wrap" ref={canvasRef} />

      {/* ── ONLY element: big white number — bottom right ── */}
      <div className={`ml-counter ${loaded ? "ml-done" : ""}`}>
        {String(Math.min(100, displayNum)).padStart(2, "\u2007")}
        <span className="ml-pct-sign">%</span>
      </div>

    </motion.div>
  );
};

export default LoadingCharacter;

export const setProgress = (setLoading: (value: number | ((prev: number) => number)) => void) => {
  let internalPercent = 0;
  let interval = setInterval(() => {
    if (internalPercent <= 50) {
      internalPercent = Math.min(50, internalPercent + Math.round(Math.random() * 5));
      setLoading((prev) => Math.max(prev, internalPercent));
    } else {
      clearInterval(interval);
      interval = setInterval(() => {
        internalPercent = Math.min(91, internalPercent + Math.round(Math.random()));
        setLoading((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return prev;
          }
          return Math.max(prev, internalPercent);
        });
        if (internalPercent > 91) clearInterval(interval);
      }, 2000);
    }
  }, 100);

  const clear = () => { clearInterval(interval); setLoading(100); };
  const loaded = (): Promise<number> =>
    new Promise((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (internalPercent < 100) { 
          internalPercent++; 
          setLoading((prev) => Math.max(prev, internalPercent)); 
        } else { 
          resolve(internalPercent); 
          clearInterval(interval); 
        }
      }, 2);
    });
  return { loaded, percent: internalPercent, clear };
};
