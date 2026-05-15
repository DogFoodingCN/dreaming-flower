"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Planet, Theme } from "./types";

type SolarSystemSceneProps = {
  selectedName: string;
  theme: Theme;
  sun: Planet;
  planets: Planet[];
  onSelect: (planet: Planet) => void;
};

type Disposable = THREE.BufferGeometry | THREE.Material | THREE.Texture;

type SceneObject = {
  planet: Planet;
  pivot: THREE.Object3D;
  mesh: THREE.Mesh;
  baseScale: number;
};

function createMaterial({
  planet,
  emissive = false,
  loader,
  renderer,
  disposables,
}: {
  planet: Planet;
  emissive?: boolean;
  loader: THREE.TextureLoader;
  renderer: THREE.WebGLRenderer;
  disposables: Disposable[];
}) {
  const material = new THREE.MeshStandardMaterial({
    color: planet.color,
    emissive: emissive ? planet.color : "#08040f",
    emissiveIntensity: emissive ? 2.35 : 0.03,
    roughness: emissive ? 0.28 : 0.58,
    metalness: 0.02,
    toneMapped: false,
  });

  if (planet.texturePath) {
    loader.load(
      planet.texturePath,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        material.map = texture;
        material.color.set(emissive ? "#fff2bf" : "#f2f4ff");
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
}

function createOrbit(planet: Planet, theme: Theme, scene: THREE.Scene, disposables: Disposable[]) {
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
    new THREE.EllipseCurve(0, 0, planet.orbitRadius, planet.orbitRadius * 0.62, 0, Math.PI * 2, false, 0).getPoints(192),
  );
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: theme === "night" ? 0x9bb7ff : 0x345ca8,
    transparent: true,
    opacity: theme === "night" ? 0.36 : 0.28,
  });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);
  disposables.push(orbitGeometry, orbitMaterial);
}

function createPlanetMesh({
  planet,
  material,
  widthSegments,
  heightSegments,
  disposables,
}: {
  planet: Planet;
  material: THREE.Material;
  widthSegments: number;
  heightSegments: number;
  disposables: Disposable[];
}) {
  const geometry = new THREE.SphereGeometry(planet.radius, widthSegments, heightSegments);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.planet = planet;
  disposables.push(geometry);
  return mesh;
}

function createRing(planet: Planet, mesh: THREE.Mesh, disposables: Disposable[]) {
  if (!planet.ring) {
    return;
  }

  const ringGeometry = new THREE.RingGeometry(
    planet.radius * planet.ring.innerRadiusRatio,
    planet.radius * planet.ring.outerRadiusRatio,
    72,
  );
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: planet.ring.color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: planet.ring.opacity,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = planet.ring.tilt;
  mesh.add(ring);
  disposables.push(ringGeometry, ringMaterial);
}

function createOrbitingPlanet({
  planet,
  index,
  theme,
  scene,
  loader,
  renderer,
  disposables,
  selectableMeshes,
  objects,
}: {
  planet: Planet;
  index: number;
  theme: Theme;
  scene: THREE.Scene;
  loader: THREE.TextureLoader;
  renderer: THREE.WebGLRenderer;
  disposables: Disposable[];
  selectableMeshes: THREE.Mesh[];
  objects: SceneObject[];
}) {
  createOrbit(planet, theme, scene, disposables);

  const pivot = new THREE.Group();
  pivot.rotation.y = index * 0.62;
  scene.add(pivot);

  const mesh = createPlanetMesh({
    planet,
    material: createMaterial({ planet, loader, renderer, disposables }),
    widthSegments: 40,
    heightSegments: 28,
    disposables,
  });
  mesh.position.x = planet.orbitRadius;
  mesh.scale.y = 0.98;
  pivot.add(mesh);
  selectableMeshes.push(mesh);
  objects.push({ planet, pivot, mesh, baseScale: 1 });
  createRing(planet, mesh, disposables);
}

export function SolarSystemScene({ selectedName, theme, sun, planets, onSelect }: SolarSystemSceneProps) {
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
    sunLight.position.set(0, 0, 0);
    scene.add(ambientLight, sunLight);

    const loader = new THREE.TextureLoader();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const selectableMeshes: THREE.Mesh[] = [];
    const disposables: Disposable[] = [];
    const objects: SceneObject[] = [];

    const sunMesh = createPlanetMesh({
      planet: sun,
      material: createMaterial({ planet: sun, emissive: true, loader, renderer, disposables }),
      widthSegments: 48,
      heightSegments: 32,
      disposables,
    });
    scene.add(sunMesh);
    selectableMeshes.push(sunMesh);
    objects.push({ planet: sun, pivot: scene, mesh: sunMesh, baseScale: 1 });

    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(sun.radius * 1.42, 48, 32),
      new THREE.MeshBasicMaterial({
        color: sun.color,
        transparent: true,
        opacity: theme === "night" ? 0.18 : 0.11,
      }),
    );
    scene.add(sunGlow);
    disposables.push(sunGlow.geometry, sunGlow.material);

    planets.forEach((planet, index) => {
      createOrbitingPlanet({
        planet,
        index,
        theme,
        scene,
        loader,
        renderer,
        disposables,
        selectableMeshes,
        objects,
      });
    });

    const starCount = 920;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      starPositions[index * 3] = (Math.random() - 0.5) * 42;
      starPositions[index * 3 + 1] = (Math.random() - 0.5) * 24;
      starPositions[index * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: theme === "night" ? 0xffffff : 0x39558f,
      size: theme === "night" ? 0.045 : 0.03,
      transparent: true,
      opacity: theme === "night" ? 0.92 : 0.54,
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
  }, [planets, sun, theme]);

  return <div ref={mountRef} className="solar-system-canvas" aria-hidden="true" />;
}