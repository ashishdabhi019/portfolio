import { useEffect, useRef } from "react";
import * as THREE from "three";
import { LOCATION_COORDS } from "../data/formOptions";
import "./styles/GlobeViewer.css";


function latLngToXYZ(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

function shortestDelta(from: number, to: number) {
  let d = ((to - from) % (Math.PI * 2));
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

interface Props { selectedLocation: string | null; visible: boolean; }

const GlobeViewer = ({ selectedLocation, visible }: Props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedLocationRef = useRef<string | null>(null);
  selectedLocationRef.current = selectedLocation;
  const s = useRef({
    renderer: null as THREE.WebGLRenderer | null,
    globe: null as THREE.Mesh | null,
    atm: null as THREE.Mesh | null,
    pin: null as THREE.Group | null,
    ring: null as THREE.Mesh | null,
    head: null as THREE.Mesh | null,
    pinLight: null as THREE.PointLight | null,
    camera: null as THREE.PerspectiveCamera | null,
    scene: null as THREE.Scene | null,
    raf: 0, rotY: 0.3, rotX: 0.05,
    targetY: 0.3, targetX: 0.05,
    autoSpin: true, t: 0,
  });

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(400, 400);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 2.8;

    // Lights - Minimalist for self-luminous land
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x7C3AED, 0.4);
    rim.position.set(-4, -2, -3);
    scene.add(rim);



    // Globe with Custom Shader for Solid Land + 3D Shading
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        maskTex: { value: null as THREE.Texture | null },
        landColor: { value: new THREE.Color(0xA855F7) }, // Bright Electric Violet
        waterColor: { value: new THREE.Color(0x0a0f17) } // Site background
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform sampler2D maskTex;
        uniform vec3 landColor;
        uniform vec3 waterColor;
        void main() {
          float m = texture2D(maskTex, vUv).r;
          
          // 3D Shading (Diffuse) for land
          vec3 lightDir = normalize(vec3(1.0, 0.8, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.3); // 0.3 ambient base
          
          // Atmospheric Rim Glow
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          rim = smoothstep(0.6, 1.0, rim);
          vec3 rimColor = vec3(0.55, 0.23, 0.93) * rim * 0.5; // Violet rim glow

          // Watermask is black (0) for land, white (1) for water
          if (m < 0.5) {
            // Land
            gl_FragColor = vec4(landColor * diff + rimColor, 1.0);
          } else {
            // Water - fully transparent
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          }
        }
      `
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    const loader = new THREE.TextureLoader();
    loader.load(
      "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png", // Valid high-precision watermask
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        globeMat.uniforms.maskTex.value = tex;
        globeMat.needsUpdate = true;
      }
    );

    // Pin (child of globe — rotates with it)
    const pin = new THREE.Group();
    const headColor = 0xffffff; // White pin head
    const stemColor = 0xe2e8f0; // Light silver stem
    
    const stemMat = new THREE.MeshPhongMaterial({ color: stemColor, emissive: 0x444444, shininess: 120 });
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.0035, 0.18, 8), stemMat);
    stick.position.y = 0.09;
    pin.add(stick);
    
    const headMat = new THREE.MeshPhongMaterial({ color: headColor, emissive: 0x888888, emissiveIntensity: 0.4, shininess: 160 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), headMat);
    head.position.y = 0.21;
    pin.add(head);
    
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.055, 0.09, 32),
      new THREE.MeshBasicMaterial({ color: headColor, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    pin.add(ring);
    
    const pinLight = new THREE.PointLight(0xffffff, 1.5, 0.85);
    pinLight.position.y = 0.21;
    pin.add(pinLight);
    pin.visible = false;
    globe.add(pin); // child of globe

    s.current = { ...s.current, renderer, globe, pin, ring, head, pinLight, camera, scene };

    let lastTime = performance.now();
    // Render loop
    const animate = (time: number) => {
      s.current.raf = requestAnimationFrame(animate);
      
      // Calculate delta time (capped at 100ms to prevent huge jumps)
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      s.current.t += dt;

      // Auto spin is roughly 0.1 radians per second
      if (s.current.autoSpin) s.current.targetY += 0.1 * dt;
      
      // Framerate-independent lerp (smoothing factor)
      // The larger the exponent base (0.01), the faster it snaps.
      const lerpFactor = 1.0 - Math.pow(0.02, dt);

      s.current.rotY += (s.current.targetY - s.current.rotY) * lerpFactor;
      s.current.rotX += (s.current.targetX - s.current.rotX) * lerpFactor;
      globe.rotation.y = s.current.rotY;
      globe.rotation.x = s.current.rotX;
      
      if (pin.visible && ring && head && pinLight) {
        const p = 1 + 0.2 * Math.sin(s.current.t * 2);
        ring.scale.set(p, p, p);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.4 - 0.15 * Math.abs(Math.sin(s.current.t * 2));
        head.position.y = 0.21 + 0.008 * Math.sin(s.current.t * 2);
        pinLight.intensity = 0.8 + 0.4 * Math.sin(s.current.t * 2);
      }
      renderer.render(scene, camera);
    };
    animate(performance.now());

    // Drag
    let dragging = false, lastX = 0, lastY = 0;
    const onDown = (e: MouseEvent | TouchEvent) => {
      dragging = true; s.current.autoSpin = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      lastX = clientX;
      lastY = clientY;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      s.current.targetY += (clientX - lastX) * 0.007; 
      s.current.targetX += (clientY - lastY) * 0.007; 
      lastX = clientX;
      lastY = clientY;
    };
    const onUp = () => { dragging = false; };

    // Double tap/click to return to pin location
    const onDblClick = () => {
      const loc = selectedLocationRef.current;
      if (!loc) return;
      const coords = LOCATION_COORDS[loc];
      if (!coords) return;
      const [lat, lng] = coords;
      const ty = -(lng + 90) * (Math.PI / 180);
      const tx = lat * (Math.PI / 180) * 0.4;
      s.current.targetY = s.current.rotY + shortestDelta(s.current.rotY, ty);
      s.current.targetX = tx;
      s.current.autoSpin = false;
    };

    el.addEventListener("mousedown", onDown as EventListener);
    el.addEventListener("touchstart", onDown as EventListener, { passive: true });
    window.addEventListener("mousemove", onMove as EventListener);
    window.addEventListener("touchmove", onMove as EventListener, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    el.addEventListener("dblclick", onDblClick);

    return () => {
      cancelAnimationFrame(s.current.raf);
      el.removeEventListener("mousedown", onDown as EventListener);
      el.removeEventListener("touchstart", onDown as EventListener);
      window.removeEventListener("mousemove", onMove as EventListener);
      window.removeEventListener("touchmove", onMove as EventListener);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      el.removeEventListener("dblclick", onDblClick);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const { pin, globe } = s.current;
    if (!pin || !globe) return;
    if (!selectedLocation) { pin.visible = false; s.current.autoSpin = true; return; }
    const coords = LOCATION_COORDS[selectedLocation];
    if (!coords) return;
    const [lat, lng] = coords;
    // Spin globe to bring location to front
    const ty = -(lng + 90) * (Math.PI / 180);
    const tx = lat * (Math.PI / 180) * 0.4;
    s.current.targetY = s.current.rotY + shortestDelta(s.current.rotY, ty);
    s.current.targetX = tx;
    s.current.autoSpin = false;
    // Place pin on surface — orient +Y outward from sphere
    const pos = latLngToXYZ(lat, lng, 1.0);
    pin.position.copy(pos);
    const normal = pos.clone().normalize();
    pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    pin.visible = true;
  }, [selectedLocation]);

  return (
    // <div className="globe-wrap">
    <div className={`globe-wrap ${visible ? "globe-wrap--visible" : ""}`}>
      <div className="globe-canvas-area" ref={mountRef} />
      {selectedLocation && (
        <div className="globe-badge">
          <span className="globe-badge-dot" />
          <span>{selectedLocation}</span>
        </div>
      )}
      {!selectedLocation && (
        <p className="globe-hint">Select a location above</p>
      )}
    </div>
  );
};

export default GlobeViewer;
