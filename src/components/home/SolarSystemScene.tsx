"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Planet, Theme } from "./types";

type SolarSystemSceneProps = {
  selectedName: string | null;
  theme: Theme;
  sun: Planet;
  planets: Planet[];
  onSelect: (planet: Planet | null) => void;
};

type Disposable = THREE.BufferGeometry | THREE.Material | THREE.Texture;

type SceneObject = {
  planet: Planet;
  pivot: THREE.Object3D;
  mesh: THREE.Mesh;
  baseScale: number;
  orbitPhase: number;
};

type DragMode = "camera" | "orbit" | "pinch" | null;

type DragState = {
  active: boolean;
  moved: boolean;
  mode: DragMode;
  pointerId: number | null;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  rotationX: number;
  rotationY: number;
};

const GALAXY_BACKGROUND_TEXTURE_PATH = "/textures/solar-system/stars_milky_way.jpg";

type GalaxyBackground = {
  distantStars: THREE.Points;
  galaxyDisk: THREE.Points;
  galaxyArms: THREE.Points;
};

function createGalaxyPoints({
  count,
  color,
  size,
  opacity,
  getPosition,
  disposables,
}: {
  count: number;
  color: number;
  size: number;
  opacity: number;
  getPosition: (index: number) => [number, number, number];
  disposables: Disposable[];
}) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const [x, y, z] = getPosition(index);
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  disposables.push(geometry, material);
  return points;
}

function createGalaxyBackground({
  scene,
  theme,
  loader,
  disposables,
}: {
  scene: THREE.Scene;
  theme: Theme;
  loader: THREE.TextureLoader;
  disposables: Disposable[];
}): GalaxyBackground {
  loader.load(
    GALAXY_BACKGROUND_TEXTURE_PATH,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
      disposables.push(texture);
    },
    undefined,
    () => undefined,
  );

  const distantStars = createGalaxyPoints({
    count: 1200,
    color: theme === "night" ? 0xffffff : 0x4d6498,
    size: theme === "night" ? 0.038 : 0.026,
    opacity: theme === "night" ? 0.9 : 0.46,
    disposables,
    getPosition: () => [(Math.random() - 0.5) * 54, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 46],
  });

  const galaxyDisk = createGalaxyPoints({
    count: 920,
    color: theme === "night" ? 0x9bb7ff : 0x5b75b7,
    size: theme === "night" ? 0.032 : 0.023,
    opacity: theme === "night" ? 0.5 : 0.28,
    disposables,
    getPosition: () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 16;
      return [Math.cos(angle) * radius, (Math.random() - 0.5) * 1.8, Math.sin(angle) * radius * 0.42 - 10];
    },
  });

  const galaxyArms = createGalaxyPoints({
    count: 720,
    color: theme === "night" ? 0xf6d6ff : 0x7d6aa8,
    size: theme === "night" ? 0.034 : 0.024,
    opacity: theme === "night" ? 0.58 : 0.3,
    disposables,
    getPosition: (index) => {
      const arm = index % 2 === 0 ? 0 : Math.PI;
      const radius = 2 + Math.random() * 17;
      const angle = arm + radius * 0.38 + (Math.random() - 0.5) * 0.8;
      return [Math.cos(angle) * radius, (Math.random() - 0.5) * 1.2, Math.sin(angle) * radius * 0.5 - 9];
    },
  });

  distantStars.renderOrder = -3;
  galaxyDisk.renderOrder = -2;
  galaxyArms.renderOrder = -1;
  scene.add(distantStars, galaxyDisk, galaxyArms);
  return { distantStars, galaxyDisk, galaxyArms };
}

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
  const material = emissive
    ? new THREE.MeshBasicMaterial({
        color: planet.color,
      })
    : new THREE.MeshStandardMaterial({
        color: planet.color,
        emissive: "#08040f",
        emissiveIntensity: 0.03,
        roughness: 0.58,
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

function getSteppedOrbitPhase(planet: Planet, index: number, total: number) {
  let hash = 0;
  for (const char of planet.name) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997;
  }

  const step = total > 0 ? (index / total) * Math.PI * 2 : 0;
  const jitter = ((hash % 37) / 37 - 0.5) * 0.48;
  return step + jitter;
}

function createOrbitingPlanet({
  planet,
  orbitPhase,
  theme,
  scene,
  loader,
  renderer,
  disposables,
  selectableMeshes,
  objects,
}: {
  planet: Planet;
  orbitPhase: number;
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
  scene.add(pivot);

  const mesh = createPlanetMesh({
    planet,
    material: createMaterial({ planet, loader, renderer, disposables }),
    widthSegments: 40,
    heightSegments: 28,
    disposables,
  });
  mesh.position.set(Math.cos(orbitPhase) * planet.orbitRadius, 0, Math.sin(orbitPhase) * planet.orbitRadius * 0.62);
  mesh.scale.y = 0.98;
  pivot.add(mesh);
  selectableMeshes.push(mesh);
  objects.push({ planet, pivot, mesh, baseScale: 1, orbitPhase });
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
    const cameraRig = new THREE.Group();
    scene.add(cameraRig);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 7.2, 10.8);
    camera.lookAt(0, 0, 0);
    cameraRig.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(
      theme === "night" ? 0x8ba4ff : 0xffffff, // 环境光颜色：影响全场基础亮度，夜间偏蓝，白天偏白。
      theme === "night" ? 0.75 : 1.2, // 环境光强度：数值越大，星球暗面越亮；降低可增强明暗对比。
    );
    const sunLight = new THREE.PointLight(
      0xffd36f, // 太阳点光源颜色：越偏黄/橙，太阳照明越暖。
      theme === "night" ? 38.5 : 34.2, // 太阳点光源强度：数值越大，太阳周围和行星受光越亮。
      140, // 太阳点光源照射距离：数值越大，外层行星也会受到更明显照亮。
    );
    sunLight.position.set(0, 0, 0); // 太阳光源位置：保持在中心，与太阳模型重合。
    scene.add(ambientLight, sunLight);

    const loader = new THREE.TextureLoader();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const selectableMeshes: THREE.Mesh[] = [];
    const disposables: Disposable[] = [];
    const objects: SceneObject[] = [];
    const focusTarget = new THREE.Vector3(0, 0, 0);
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    const lookTarget = new THREE.Vector3(0, 0, 0);
    const nextLookTarget = new THREE.Vector3(0, 0, 0);
    const zoomState = {
      current: 10.8,
      target: 10.8,
      min: 5.8,
      max: 22,
    };
    const activePointers = new Map<number, PointerEvent>();
    let pinchStartDistance = 0;
    let pinchStartZoom = zoomState.target;
    let orbitDragOffset = 0;
    const dragState: DragState = {
      active: false,
      moved: false,
      mode: null,
      pointerId: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      rotationX: 0,
      rotationY: 0,
    };

    const sunMesh = createPlanetMesh({
      planet: sun,
      material: createMaterial({ planet: sun, emissive: true, loader, renderer, disposables }),
      widthSegments: 48,
      heightSegments: 32,
      disposables,
    });
    scene.add(sunMesh);
    selectableMeshes.push(sunMesh);
    objects.push({ planet: sun, pivot: scene, mesh: sunMesh, baseScale: 1, orbitPhase: 0 });

    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(
        sun.radius * 2.42, // 太阳光晕半径：相对太阳半径放大；越大光晕范围越大。
        48, // 太阳光晕横向分段：越大越圆滑，但渲染成本略高。
        32, // 太阳光晕纵向分段：越大越圆滑，但渲染成本略高。
      ),
      new THREE.MeshBasicMaterial({
        color: sun.color, // 太阳光晕颜色：默认跟随 planets.ts 中 Sun 的 color。
        transparent: true, // 太阳光晕透明开关：保持 true 才能呈现柔和叠加。
        opacity: theme === "night" ? 0.18 : 0.11, // 太阳光晕透明度：数值越大越明显，白天建议更低。
      }),
    );

    const galaxyBackground = createGalaxyBackground({ scene, theme, loader, disposables });

    planets.forEach((planet, index) => {
      createOrbitingPlanet({
        planet,
        orbitPhase: getSteppedOrbitPhase(planet, index, planets.length),
        theme,
        scene,
        loader,
        renderer,
        disposables,
        selectableMeshes,
        objects,
      });
    });

    let frame = 0;
    let hoveredMesh: THREE.Mesh | null = null;
    const clock = new THREE.Clock();

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const defaultZoom = width < 720 ? 16 : 12.5;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      zoomState.current = THREE.MathUtils.clamp(zoomState.current || defaultZoom, zoomState.min, zoomState.max);
      zoomState.target = THREE.MathUtils.clamp(zoomState.target || defaultZoom, zoomState.min, zoomState.max);
      camera.position.y = width < 720 ? 9 : 7.6;
      camera.updateProjectionMatrix();
    };

    const getIntersect = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(selectableMeshes, true)[0];
    };

    const getPointerDistance = () => {
      const pointers = [...activePointers.values()];
      if (pointers.length < 2) {
        return 0;
      }

      return Math.hypot(pointers[0].clientX - pointers[1].clientX, pointers[0].clientY - pointers[1].clientY);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomState.target = THREE.MathUtils.clamp(zoomState.target + event.deltaY * 0.008, zoomState.min, zoomState.max);
    };

    const updateDragRotation = (event: PointerEvent) => {
      const deltaX = event.clientX - dragState.lastX;
      const deltaY = event.clientY - dragState.lastY;
      dragState.lastX = event.clientX;
      dragState.lastY = event.clientY;

      if (Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY) > 4) {
        dragState.moved = true;
      }

      if (dragState.mode === "orbit") {
        orbitDragOffset += deltaX * 0.01;
        return;
      }

      dragState.rotationY += deltaX * 0.006;
      dragState.rotationX = THREE.MathUtils.clamp(dragState.rotationX + deltaY * 0.0035, -0.55, 0.55);
      cameraRig.rotation.y = dragState.rotationY;
      cameraRig.rotation.x = dragState.rotationX;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointers.has(event.pointerId)) {
        activePointers.set(event.pointerId, event);
      }

      if (dragState.active && dragState.pointerId === event.pointerId) {
        if (dragState.mode === "pinch") {
          const distance = getPointerDistance();
          if (distance > 0 && pinchStartDistance > 0) {
            zoomState.target = THREE.MathUtils.clamp(pinchStartZoom * (pinchStartDistance / distance), zoomState.min, zoomState.max);
          }
          return;
        }

        updateDragRotation(event);
        renderer.domElement.style.cursor = "grabbing";
        return;
      }

      const intersect = getIntersect(event);
      hoveredMesh = intersect?.object instanceof THREE.Mesh ? intersect.object : null;
      renderer.domElement.style.cursor = hoveredMesh ? "pointer" : "grab";
    };

    const handlePointerLeave = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      dragState.active = false;
      dragState.mode = null;
      dragState.pointerId = null;
      hoveredMesh = null;
      renderer.domElement.style.cursor = "grab";
    };

    const handlePointerDown = (event: PointerEvent) => {
      activePointers.set(event.pointerId, event);
      const intersect = getIntersect(event);
      const planet = intersect?.object.userData.planet as Planet | undefined;
      dragState.active = true;
      dragState.moved = false;
      dragState.mode = planet && planet.orbitRadius > 0 ? "orbit" : "camera";
      dragState.pointerId = event.pointerId;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;
      dragState.lastX = event.clientX;
      dragState.lastY = event.clientY;

      if (activePointers.size >= 2) {
        dragState.mode = "pinch";
        pinchStartDistance = getPointerDistance();
        pinchStartZoom = zoomState.target;
      }

      renderer.domElement.setPointerCapture(event.pointerId);
      renderer.domElement.style.cursor = "grabbing";
    };

    const handlePointerUp = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      if (dragState.pointerId !== event.pointerId) {
        return;
      }

      const wasPinching = dragState.mode === "pinch";
      dragState.active = false;
      dragState.mode = null;
      dragState.pointerId = null;
      renderer.domElement.releasePointerCapture(event.pointerId);
      renderer.domElement.style.cursor = "grab";

      if (dragState.moved || wasPinching) {
        return;
      }

      const intersect = getIntersect(event);
      const planet = intersect?.object.userData.planet as Planet | undefined;
      onSelectRef.current(planet ?? null);
    };

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.04);
      const motionFactor = reducedMotion ? 0.08 : 1;
      const selectedObject = objects.find(({ planet }) => planet.name === selectedNameRef.current);

      objects.forEach((object) => {
        const { planet, mesh, baseScale } = object;
        if (planet.orbitRadius > 0) {
          object.orbitPhase += planet.orbitSpeed * delta * motionFactor;
          const phase = object.orbitPhase + orbitDragOffset;
          mesh.position.set(Math.cos(phase) * planet.orbitRadius, 0, Math.sin(phase) * planet.orbitRadius * 0.62);
        }
        mesh.rotation.y += planet.rotationSpeed * delta * motionFactor;
        const isSelected = planet.name === selectedNameRef.current;
        const isHovered = hoveredMesh === mesh;
        const targetScale = isSelected ? baseScale * 1.28 : isHovered ? baseScale * 1.16 : baseScale;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
      });

      if (selectedObject) {
        selectedObject.mesh.getWorldPosition(focusTarget);
        cameraTarget.copy(focusTarget).multiplyScalar(0.55);
        nextLookTarget.copy(focusTarget);
      } else {
        cameraTarget.set(0, 0, 0);
        nextLookTarget.set(0, 0, 0);
      }
      cameraRig.position.lerp(cameraTarget.multiplyScalar(-1), 0.07);
      lookTarget.lerp(nextLookTarget, 0.1);
      camera.lookAt(lookTarget);
      zoomState.current = THREE.MathUtils.lerp(zoomState.current, zoomState.target, 0.12);
      camera.position.z = zoomState.current;

      sunGlow.rotation.y += 0.05 * delta * motionFactor; // 太阳光晕自转速度：数值越大，光晕视觉旋转越快。
      galaxyBackground.distantStars.rotation.y += 0.003 * delta * motionFactor;
      galaxyBackground.galaxyDisk.rotation.y += 0.0018 * delta * motionFactor;
      galaxyBackground.galaxyArms.rotation.y -= 0.0012 * delta * motionFactor;
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("wheel", handleWheel);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerLeave);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [planets, sun, theme]);

  return <div ref={mountRef} className="solar-system-canvas" aria-hidden="true" />;
}