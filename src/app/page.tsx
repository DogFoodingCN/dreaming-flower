"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Theme = "night" | "day";

type Planet = {
  name: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  color: string;
  texturePath: string;
  description: string;
};

const planets: Planet[] = [
  {
    name: "Mercury",
    radius: 0.22,
    orbitRadius: 1.45,
    orbitSpeed: 0.44,
    rotationSpeed: 0.4,
    color: "#b8aaa1",
    texturePath: "/textures/solar-system/mercury.jpg",
    description: "The closest signal to the center, reserved for fast notes and small experiments.",
  },
  {
    name: "Venus",
    radius: 0.32,
    orbitRadius: 2.05,
    orbitSpeed: 0.32,
    rotationSpeed: 0.32,
    color: "#d8b46a",
    texturePath: "/textures/solar-system/venus.jpg",
    description: "A warm orbit for product experience fragments and visual studies.",
  },
  {
    name: "Earth",
    radius: 0.36,
    orbitRadius: 2.72,
    orbitSpeed: 0.26,
    rotationSpeed: 0.55,
    color: "#3f8edc",
    texturePath: "/textures/solar-system/earth.jpg",
    description: "The home node for personal space, dogfooding notes, and present-tense updates.",
  },
  {
    name: "Mars",
    radius: 0.28,
    orbitRadius: 3.42,
    orbitSpeed: 0.21,
    rotationSpeed: 0.5,
    color: "#c9674a",
    texturePath: "/textures/solar-system/mars.jpg",
    description: "A sharper orbit for building logs, prototypes, and unfinished product questions.",
  },
  {
    name: "Jupiter",
    radius: 0.68,
    orbitRadius: 4.45,
    orbitSpeed: 0.14,
    rotationSpeed: 0.75,
    color: "#d2a679",
    texturePath: "/textures/solar-system/jupiter.jpg",
    description: "A large gravity well for long-form writing, essays, and durable thinking.",
  },
  {
    name: "Saturn",
    radius: 0.58,
    orbitRadius: 5.65,
    orbitSpeed: 0.11,
    rotationSpeed: 0.68,
    color: "#d9c48f",
    texturePath: "/textures/solar-system/saturn.jpg",
    description: "A ringed placeholder for future collections, archives, and curated references.",
  },
  {
    name: "Uranus",
    radius: 0.44,
    orbitRadius: 6.75,
    orbitSpeed: 0.08,
    rotationSpeed: 0.46,
    color: "#8fd6df",
    texturePath: "/textures/solar-system/uranus.jpg",
    description: "A quiet outer orbit for slow ideas and exploratory interface experiments.",
  },
  {
    name: "Neptune",
    radius: 0.43,
    orbitRadius: 7.8,
    orbitSpeed: 0.06,
    rotationSpeed: 0.44,
    color: "#496fdf",
    texturePath: "/textures/solar-system/neptune.jpg",
    description: "The far blue node for future modules that should stay visible but not yet implemented.",
  },
  {
    name: "Pluto",
    radius: 0.18,
    orbitRadius: 8.55,
    orbitSpeed: 0.045,
    rotationSpeed: 0.28,
    color: "#c7b6a4",
    texturePath: "/textures/solar-system/pluto.jpg",
    description: "A legacy edge marker for someday ideas, intentionally small and coming soon.",
  },
];

const sun: Planet = {
  name: "Sun",
  radius: 0.82,
  orbitRadius: 0,
  orbitSpeed: 0,
  rotationSpeed: 0.18,
  color: "#ffd166",
  texturePath: "/textures/solar-system/sun.jpg",
  description: "Dreaming Flower is the center: a personal galaxy for IP building, product experience, and blog output.",
};

function SolarSystemScene({
  selectedName,
  theme,
  onSelect,
}: {
  selectedName: string;
  theme: Theme;
  onSelect: (planet: Planet) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedNameRef = useRef(selectedName);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    selectedNameRef.current = selectedName;
    onSelectRef.current = onSelect;
  }, [selectedName, onSelect]);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 7.2, 10.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(theme === "night" ? 0x8ba4ff : 0xffffff, theme === "night" ? 0.75 : 1.2);
    const sunLight = new THREE.PointLight(0xffd36f, theme === "night" ? 5.5 : 4.2, 40);
    scene.add(ambientLight, sunLight);

    const loader = new THREE.TextureLoader();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const selectableMeshes: THREE.Mesh[] = [];
    const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
    const objects: Array<{ planet: Planet; pivot: THREE.Object3D; mesh: THREE.Mesh; baseScale: number }> = [];

    const createMaterial = (planet: Planet, emissive = false) => {
      const material = new THREE.MeshStandardMaterial({
        color: planet.color,
        emissive: emissive ? planet.color : "#000000",
        emissiveIntensity: emissive ? 1.2 : 0.08,
        roughness: 0.72,
        metalness: 0.03,
      });

      if (planet.texturePath) {
        loader.load(
          planet.texturePath,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
            material.map = texture;
            material.color.set("#ffffff");
            material.needsUpdate = true;
            disposables.push(texture);
          },
          undefined,
          () => {
            material.map = null;
            material.color.set(planet.color);
            material.needsUpdate = true;
          },
        );
      }

      disposables.push(material);
      return material;
    };

    const sunGeometry = new THREE.SphereGeometry(sun.radius, 48, 32);
    const sunMesh = new THREE.Mesh(sunGeometry, createMaterial(sun, true));
    sunMesh.userData.planet = sun;
    scene.add(sunMesh);
    selectableMeshes.push(sunMesh);
    disposables.push(sunGeometry);
    objects.push({ planet: sun, pivot: scene, mesh: sunMesh, baseScale: 1 });

    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(sun.radius * 1.42, 48, 32),
      new THREE.MeshBasicMaterial({ color: sun.color, transparent: true, opacity: theme === "night" ? 0.18 : 0.11 }),
    );
    scene.add(sunGlow);
    disposables.push(sunGlow.geometry, sunGlow.material);

    planets.forEach((planet, index) => {
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
        new THREE.EllipseCurve(0, 0, planet.orbitRadius, planet.orbitRadius * 0.62, 0, Math.PI * 2, false, 0).getPoints(192),
      );
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: theme === "night" ? 0x9bb7ff : 0x345ca8,
        transparent: true,
        opacity: theme === "night" ? 0.2 : 0.16,
      });
      const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);
      disposables.push(orbitGeometry, orbitMaterial);

      const pivot = new THREE.Group();
      pivot.rotation.y = index * 0.62;
      scene.add(pivot);

      const geometry = new THREE.SphereGeometry(planet.radius, 40, 28);
      const mesh = new THREE.Mesh(geometry, createMaterial(planet));
      mesh.position.x = planet.orbitRadius;
      mesh.scale.y = 0.98;
      mesh.userData.planet = planet;
      pivot.add(mesh);
      selectableMeshes.push(mesh);
      disposables.push(geometry);
      objects.push({ planet, pivot, mesh, baseScale: 1 });

      if (planet.name === "Saturn") {
        const ringGeometry = new THREE.RingGeometry(planet.radius * 1.35, planet.radius * 2.05, 72);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xe9d69a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.52,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2.45;
        mesh.add(ring);
        disposables.push(ringGeometry, ringMaterial);
      }
    });

    const starCount = 720;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      starPositions[index * 3] = (Math.random() - 0.5) * 42;
      starPositions[index * 3 + 1] = (Math.random() - 0.5) * 24;
      starPositions[index * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: theme === "night" ? 0xcbd8ff : 0x5b6f9f,
      size: theme === "night" ? 0.035 : 0.026,
      transparent: true,
      opacity: theme === "night" ? 0.78 : 0.42,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    disposables.push(starGeometry, starMaterial);

    let frame = 0;
    let hoveredMesh: THREE.Mesh | null = null;
    const clock = new THREE.Clock();

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 720 ? 14 : 10.8;
      camera.position.y = width < 720 ? 8.5 : 7.2;
      camera.updateProjectionMatrix();
    };

    const getIntersect = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(selectableMeshes, true)[0];
    };

    const handlePointerMove = (event: PointerEvent) => {
      const intersect = getIntersect(event);
      hoveredMesh = intersect?.object instanceof THREE.Mesh ? intersect.object : null;
      renderer.domElement.style.cursor = hoveredMesh ? "pointer" : "grab";
    };

    const handlePointerLeave = () => {
      hoveredMesh = null;
      renderer.domElement.style.cursor = "grab";
    };

    const handlePointerDown = (event: PointerEvent) => {
      const intersect = getIntersect(event);
      const planet = intersect?.object.userData.planet as Planet | undefined;
      if (planet) {
        onSelectRef.current(planet);
      }
    };

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.04);
      const motionFactor = reducedMotion ? 0.08 : 1;

      objects.forEach(({ planet, pivot, mesh, baseScale }) => {
        pivot.rotation.y += planet.orbitSpeed * delta * motionFactor;
        mesh.rotation.y += planet.rotationSpeed * delta * motionFactor;
        const isSelected = planet.name === selectedNameRef.current;
        const isHovered = hoveredMesh === mesh;
        const targetScale = isSelected ? baseScale * 1.28 : isHovered ? baseScale * 1.16 : baseScale;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
      });

      sunGlow.rotation.y += 0.05 * delta * motionFactor;
      stars.rotation.y += 0.004 * delta * motionFactor;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [theme]);

  return <div ref={mountRef} className="solar-system-canvas" aria-hidden="true" />;
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>("night");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(sun);
  const objects = useMemo(() => [sun, ...planets], []);

  return (
    <main className={`solar-page solar-page--${theme}`}>
      <SolarSystemScene selectedName={selectedPlanet.name} theme={theme} onSelect={setSelectedPlanet} />

      <section className="solar-overlay" aria-label="Dreaming Flower solar-system entrance">
        <div className="solar-brand-panel">
          <div className="solar-logo">DF</div>
          <div>
            <p className="solar-kicker">dogfooding.cn</p>
            <h1>Dreaming Flower Solar System</h1>
            <p className="solar-intro">
              A galaxy entrance for personal space, IP building, product experience, and blog output.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="solar-theme-toggle"
          onClick={() => setTheme((currentTheme) => (currentTheme === "night" ? "day" : "night"))}
          aria-label={`Switch to ${theme === "night" ? "day" : "night"} mode`}
        >
          {theme === "night" ? "Day mode" : "Night mode"}
        </button>
      </section>

      <section className="planet-panel" aria-live="polite">
        <p className="planet-status">Coming soon</p>
        <h2>{selectedPlanet.name}</h2>
        <p>{selectedPlanet.description}</p>
        <p className="planet-texture-slot">Texture slot: {selectedPlanet.texturePath}</p>
      </section>

      <nav className="planet-dock" aria-label="Solar system objects">
        {objects.map((planet) => (
          <button
            key={planet.name}
            type="button"
            className={planet.name === selectedPlanet.name ? "planet-chip planet-chip--active" : "planet-chip"}
            onClick={() => setSelectedPlanet(planet)}
            style={{ "--planet-color": planet.color } as CSSProperties}
          >
            <span />
            {planet.name}
          </button>
        ))}
      </nav>
    </main>
  );
}
