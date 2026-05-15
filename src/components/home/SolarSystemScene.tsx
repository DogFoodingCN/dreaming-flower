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

type DragState = {
  active: boolean;
  moved: boolean;
  pointerId: number | null;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  rotationX: number;
  rotationY: number;
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
    const dragState: DragState = {
      active: false,
      moved: false,
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
    objects.push({ planet: sun, pivot: scene, mesh: sunMesh, baseScale: 1 });

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

    const updateDragRotation = (event: PointerEvent) => {
      const deltaX = event.clientX - dragState.lastX;
      const deltaY = event.clientY - dragState.lastY;
      dragState.lastX = event.clientX;
      dragState.lastY = event.clientY;

      if (Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY) > 4) {
        dragState.moved = true;
      }

      dragState.rotationY += deltaX * 0.006;
      dragState.rotationX = THREE.MathUtils.clamp(dragState.rotationX + deltaY * 0.0035, -0.55, 0.55);
      cameraRig.rotation.y = dragState.rotationY;
      cameraRig.rotation.x = dragState.rotationX;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (dragState.active && dragState.pointerId === event.pointerId) {
        updateDragRotation(event);
        renderer.domElement.style.cursor = "grabbing";
        return;
      }

      const intersect = getIntersect(event);
      hoveredMesh = intersect?.object instanceof THREE.Mesh ? intersect.object : null;
      renderer.domElement.style.cursor = hoveredMesh ? "pointer" : "grab";
    };

    const handlePointerLeave = () => {
      dragState.active = false;
      dragState.pointerId = null;
      hoveredMesh = null;
      renderer.domElement.style.cursor = "grab";
    };

    const handlePointerDown = (event: PointerEvent) => {
      dragState.active = true;
      dragState.moved = false;
      dragState.pointerId = event.pointerId;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;
      dragState.lastX = event.clientX;
      dragState.lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
      renderer.domElement.style.cursor = "grabbing";
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (dragState.pointerId !== event.pointerId) {
        return;
      }

      dragState.active = false;
      dragState.pointerId = null;
      renderer.domElement.releasePointerCapture(event.pointerId);
      renderer.domElement.style.cursor = "grab";

      if (dragState.moved) {
        return;
      }

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

      sunGlow.rotation.y += 0.05 * delta * motionFactor; // 太阳光晕自转速度：数值越大，光晕视觉旋转越快。
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
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
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