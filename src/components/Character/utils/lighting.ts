import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { gsap } from "gsap";

const getAccentHex = () => {
  if (typeof window !== "undefined") {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--accentColor").trim();
    if (raw) return raw;
    try {
      const stored = sessionStorage.getItem("portfolio_accent");
      if (stored) return stored;
    } catch {
      // ignore
    }
  }
  return "#F97316";
};

const setLighting = (scene: THREE.Scene) => {
  const initialAccent = getAccentHex();
  const directionalLight = new THREE.DirectionalLight(initialAccent, 0);
  directionalLight.intensity = 0;
  directionalLight.position.set(-0.47, -0.32, -1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  const updateDirectionalLightColor = (colorHex?: string) => {
    const hex = colorHex || getAccentHex();
    if (hex) {
      try {
        directionalLight.color.set(hex);
      } catch (e) {
        // ignore
      }
    }
  };

  if (typeof window !== "undefined") {
    const observer = new MutationObserver(() => updateDirectionalLightColor());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    window.addEventListener("accentColorChange", ((e: CustomEvent) => {
      updateDirectionalLightColor(e.detail);
    }) as EventListener);
  }

  const pointLight = new THREE.PointLight(0x9D4EDD, 0, 100, 3);
  pointLight.position.set(3, 12, 4);
  pointLight.castShadow = true;
  scene.add(pointLight);

  new RGBELoader()
    .setPath("/models/")
    .load("char_enviorment.hdr?v=2", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentIntensity = 0;
      scene.environmentRotation.set(5.76, 85.85, 1);
    });

  function setPointLight(screenLight: any) {
    if (screenLight.material.opacity > 0.9) {
      pointLight.intensity = screenLight.material.emissiveIntensity * 20;
    } else {
      pointLight.intensity = 0;
    }
  }
  const duration = 2;
  const ease = "power2.inOut";
  function turnOnLights() {
    gsap.to(scene, {
      environmentIntensity: 0.64,
      duration: duration,
      ease: ease,
    });
    gsap.to(directionalLight, {
      intensity: 1,
      duration: duration,
      ease: ease,
    });
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    });
  }

  return { setPointLight, turnOnLights };
};

export default setLighting;
