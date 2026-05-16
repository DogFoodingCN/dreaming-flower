"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Planet, PlanetSatellite, Theme } from "./types";

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

type SatelliteObject = {
  satellite: PlanetSatellite;
  mesh: THREE.Mesh;
  orbitPhase: number;
  orbitRadius: number;
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

type ConstellationGuideConfig = {
  name: string;
  position: THREE.Vector3;
  scale: number;
  rotation: THREE.Euler;
  points: readonly (readonly [number, number])[];
  segments: readonly (readonly [number, number])[];
  labelOffset: readonly [number, number];
};

const NEBULA_TEXTURES = [
  {
    path: "/textures/nebulae/orion.jpg",
    position: new THREE.Vector3(10.2, -3.4, -28),
    scale: [8.6, 5.3] as const,
    rotation: -0.16,
    seed: 11,
    colors: [0x9fc4ff, 0xd8b7ff, 0xffffff] as const,
  },
  {
    path: "/textures/nebulae/eagle.jpg",
    position: new THREE.Vector3(16.6, -0.4, -31),
    scale: [7.8, 4.8] as const,
    rotation: 0.18,
    seed: 23,
    colors: [0x8fb9ff, 0xffd89a, 0xf4f7ff] as const,
  },
  {
    path: "/textures/nebulae/carina.jpg",
    position: new THREE.Vector3(-5.6, -8.3, -34),
    scale: [10.8, 6.4] as const,
    rotation: 0.06,
    seed: 37,
    colors: [0xffa6d6, 0xb9c8ff, 0xffefd1] as const,
  },
];

const CONSTELLATION_GUIDES: ConstellationGuideConfig[] = [
  {
    name: "北斗七星",
    position: new THREE.Vector3(-12.5, 7.4, -25),
    scale: 1.35,
    rotation: new THREE.Euler(-0.18, -0.32, -0.2),
    points: [
      [-2.2, 0.25],
      [-1.45, 0.05],
      [-0.7, 0.18],
      [0.05, 0.02],
      [0.62, 0.55],
      [1.35, 0.75],
      [2.05, 0.52],
    ],
    segments: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    labelOffset: [2.45, 0.92],
  },
  {
    name: "狮子座",
    position: new THREE.Vector3(-16.2, 1.9, -29),
    scale: 1.08,
    rotation: new THREE.Euler(0.08, 0.42, 0.12),
    points: [
      [-1.85, -0.28],
      [-1.22, 0.2],
      [-0.52, 0.42],
      [0.18, 0.16],
      [0.82, 0.52],
      [1.35, 0.18],
      [1.08, -0.44],
      [0.2, -0.68],
      [-0.75, -0.5],
    ],
    segments: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 0], [3, 7]],
    labelOffset: [1.75, 0.82],
  },
  {
    name: "猎户座",
    position: new THREE.Vector3(10.5, -4.4, -24),
    scale: 1.12,
    rotation: new THREE.Euler(0.16, -0.18, 0.1),
    points: [
      [-1.2, 1.25],
      [1.05, 1.05],
      [-0.42, 0.22],
      [0.05, 0.12],
      [0.52, 0.02],
      [-1.15, -1.05],
      [1.0, -1.25],
    ],
    segments: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
    labelOffset: [1.45, -1.55],
  },
  {
    name: "人马座",
    position: new THREE.Vector3(2.2, -9.5, -26),
    scale: 1.12,
    rotation: new THREE.Euler(-0.24, 0.12, -0.12),
    points: [
      [-1.8, 0.2],
      [-1.05, 0.58],
      [-0.35, 0.24],
      [0.25, 0.62],
      [1.0, 0.2],
      [1.58, -0.22],
      [0.78, -0.42],
      [0.1, -0.82],
      [-0.66, -0.52],
    ],
    segments: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7], [7, 8], [8, 2], [2, 6]],
    labelOffset: [1.82, -0.66],
  },
  {
    name: "仙女座星系",
    position: new THREE.Vector3(-8.8, 4.8, -30),
    scale: 1.2,
    rotation: new THREE.Euler(0.28, -0.22, 0.38),
    points: [
      [-1.55, 0],
      [-0.78, 0.34],
      [0, 0],
      [0.78, -0.34],
      [1.55, 0],
      [-0.72, -0.32],
      [0.72, 0.32],
    ],
    segments: [[0, 1], [1, 2], [2, 3], [3, 4], [5, 2], [2, 6]],
    labelOffset: [1.8, 0.58],
  },
  {
    name: "天蝎座",
    position: new THREE.Vector3(13.8, -7.1, -27),
    scale: 1.05,
    rotation: new THREE.Euler(-0.18, 0.3, -0.42),
    points: [
      [-1.85, 0.65],
      [-1.15, 0.2],
      [-0.48, 0.02],
      [0.2, -0.22],
      [0.78, -0.62],
      [1.32, -0.92],
      [1.75, -0.55],
      [1.42, -0.15],
    ],
    segments: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
    labelOffset: [1.95, -0.9],
  },
  {
    name: "银河核心",
    position: new THREE.Vector3(5.2, -10.8, -33),
    scale: 1.36,
    rotation: new THREE.Euler(-0.38, 0.08, 0.24),
    points: [
      [-1.7, -0.12],
      [-0.95, 0.34],
      [-0.18, 0.18],
      [0.54, -0.2],
      [1.24, -0.04],
      [1.74, 0.3],
      [-0.72, -0.36],
      [0.82, 0.32],
    ],
    segments: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [6, 2], [2, 7]],
    labelOffset: [1.88, 0.58],
  },
];
const DEFAULT_PLANET_EMISSIVE = new THREE.Color("#08040f");
const SELECTED_PLANET_EMISSIVE = new THREE.Color("#6f5b2a");
const DEFAULT_PLANET_EMISSIVE_INTENSITY = 0.03;
const SELECTED_PLANET_EMISSIVE_INTENSITY = 0.22;
const SELECTED_PLANET_LIGHTING_SPEED = 0.22;

type GalaxyBackground = {
  distantStars: THREE.Points;
  galaxyDisk: THREE.Points;
  galaxyArms: THREE.Points;
  nebulae: THREE.Group;
  constellationGuide: THREE.Group;
};

function updateSelectedLighting(mesh: THREE.Mesh, isSelected: boolean) {
  if (!(mesh.material instanceof THREE.MeshStandardMaterial)) {
    return;
  }

  const speed = isSelected ? SELECTED_PLANET_LIGHTING_SPEED : 0.12;
  mesh.material.emissive.lerp(isSelected ? SELECTED_PLANET_EMISSIVE : DEFAULT_PLANET_EMISSIVE, speed);
  mesh.material.emissiveIntensity = THREE.MathUtils.lerp(
    mesh.material.emissiveIntensity,
    isSelected ? SELECTED_PLANET_EMISSIVE_INTENSITY : DEFAULT_PLANET_EMISSIVE_INTENSITY,
    speed,
  );
}

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

function createNebulaAlphaTexture(seed: number, disposables: Disposable[]) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const imageData = context.createImageData(size, size);
  const data = imageData.data;
  const center = size / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / center;
      const dy = (y - center) / center;
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);
      const edge = 0.52 + Math.sin(angle * 3 + seed) * 0.12 + Math.sin(angle * 7 + seed * 0.73) * 0.08;
      const filaments = Math.sin((dx * 5.2 + dy * 2.1 + seed) * Math.PI) * 0.1 + Math.sin((dx * -2.7 + dy * 6.4 + seed * 0.31) * Math.PI) * 0.08;
      const cloud = Math.max(0, 1 - distance / (edge + filaments));
      const feather = Math.pow(THREE.MathUtils.smoothstep(cloud, 0, 1), 1.9);
      const index = (y * size + x) * 4;
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = Math.round(255 * feather);
    }
  }

  context.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  disposables.push(texture);
  return texture;
}

function createNebulaCloud({
  scale,
  colors,
  seed,
  theme,
  disposables,
}: {
  scale: readonly [number, number];
  colors: readonly number[];
  seed: number;
  theme: Theme;
  disposables: Disposable[];
}) {
  const group = new THREE.Group();
  const radius = Math.max(scale[0], scale[1]) * 0.5;
  const layers = [
    { count: 180, size: 0.22, opacity: theme === "night" ? 0.085 : 0.024, radiusScale: 0.94, color: colors[0] },
    { count: 120, size: 0.14, opacity: theme === "night" ? 0.12 : 0.036, radiusScale: 0.58, color: colors[1] },
    { count: 28, size: 0.048, opacity: theme === "night" ? 0.38 : 0.12, radiusScale: 0.34, color: colors[2] },
  ];

  layers.forEach((layer, layerIndex) => {
    const positions = new Float32Array(layer.count * 3);

    for (let index = 0; index < layer.count; index += 1) {
      const angle = (Math.random() + seed * 0.017 + layerIndex * 0.13) * Math.PI * 2;
      const distance = Math.pow(Math.random(), 1.75) * radius * layer.radiusScale;
      const wave = Math.sin(angle * 3 + seed) * radius * 0.08;
      positions[index * 3] = Math.cos(angle) * (distance + wave) * (scale[0] / radius) * 0.54;
      positions[index * 3 + 1] = Math.sin(angle) * distance * (scale[1] / radius) * 0.34 + (Math.random() - 0.5) * scale[1] * 0.08;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 0.72;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: layer.color,
      size: layer.size,
      transparent: true,
      opacity: layer.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geometry, material);
    points.renderOrder = -3;
    group.add(points);
    disposables.push(geometry, material);
  });

  return group;
}

function createNebulae({
  theme,
  loader,
  disposables,
}: {
  theme: Theme;
  loader: THREE.TextureLoader;
  disposables: Disposable[];
}) {
  const group = new THREE.Group();

  NEBULA_TEXTURES.forEach(({ path, position, scale, rotation, seed, colors }) => {
    const texture = loader.load(path, (loadedTexture) => {
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      loadedTexture.offset.set(0.12, 0.12);
      loadedTexture.repeat.set(0.76, 0.76);
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.offset.set(0.12, 0.12);
    texture.repeat.set(0.76, 0.76);
    const alphaMap = createNebulaAlphaTexture(seed, disposables);
    const geometry = new THREE.PlaneGeometry(scale[0], scale[1], 1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaMap: alphaMap ?? undefined,
      transparent: true,
      opacity: theme === "night" ? 0.11 : 0.03,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const plane = new THREE.Mesh(geometry, material);
    const cloud = createNebulaCloud({ scale, colors, seed, theme, disposables });
    plane.position.z = -0.12;
    plane.renderOrder = -5;
    cloud.renderOrder = -4;

    const nebula = new THREE.Group();
    nebula.position.copy(position);
    nebula.rotation.z = rotation;
    nebula.add(plane, cloud);
    group.add(nebula);
    disposables.push(texture, geometry, material);
  });

  return group;
}

function createConstellationLabel(text: string, theme: Theme, disposables: Disposable[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.font = "600 32px Arial, Helvetica, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = theme === "night" ? "rgba(234, 241, 255, 0.78)" : "rgba(40, 59, 103, 0.32)";
  context.shadowColor = theme === "night" ? "rgba(114, 151, 255, 0.48)" : "rgba(255, 255, 255, 0.28)";
  context.shadowBlur = 12;
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: theme === "night" ? 0.72 : 0.26,
    depthWrite: false,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.1, 0.78, 1);
  sprite.renderOrder = -1;
  disposables.push(texture, material);
  return sprite;
}

function createConstellationGuide(config: ConstellationGuideConfig, theme: Theme, disposables: Disposable[]) {
  const group = new THREE.Group();
  group.position.copy(config.position);
  group.rotation.copy(config.rotation);

  const linePositions: number[] = [];
  config.segments.forEach(([start, end]) => {
    const [startX, startY] = config.points[start];
    const [endX, endY] = config.points[end];
    linePositions.push(startX * config.scale, startY * config.scale, 0, endX * config.scale, endY * config.scale, 0);
  });

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    color: theme === "night" ? 0xbfd1ff : 0x526aa3,
    transparent: true,
    opacity: theme === "night" ? 0.32 : 0.12,
    depthWrite: false,
    depthTest: false,
  });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  lines.renderOrder = -2;
  group.add(lines);
  disposables.push(lineGeometry, lineMaterial);

  const starPositions = new Float32Array(config.points.length * 3);
  config.points.forEach(([x, y], index) => {
    starPositions[index * 3] = x * config.scale;
    starPositions[index * 3 + 1] = y * config.scale;
    starPositions[index * 3 + 2] = 0;
  });
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: theme === "night" ? 0xffffff : 0x526aa3,
    size: theme === "night" ? 0.075 : 0.052,
    transparent: true,
    opacity: theme === "night" ? 0.86 : 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.renderOrder = -1;
  group.add(stars);
  disposables.push(starGeometry, starMaterial);

  const label = createConstellationLabel(config.name, theme, disposables);
  if (label) {
    label.position.set(config.labelOffset[0] * config.scale, config.labelOffset[1] * config.scale, 0);
    group.add(label);
  }

  return group;
}

function createConstellationGuides(theme: Theme, disposables: Disposable[]) {
  const group = new THREE.Group();

  CONSTELLATION_GUIDES.forEach((config) => {
    group.add(createConstellationGuide(config, theme, disposables));
  });

  return group;
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
  const nebulae = createNebulae({ theme, loader, disposables });
  const constellationGuide = createConstellationGuides(theme, disposables);

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
  scene.add(nebulae, constellationGuide, distantStars, galaxyDisk, galaxyArms);
  return { distantStars, galaxyDisk, galaxyArms, nebulae, constellationGuide };
}

function createMaterial({
  planet,
  emissive = false,
  loader,
  renderer,
  disposables,
}: {
  planet: Pick<Planet, "color" | "texturePath">;
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
          emissive: DEFAULT_PLANET_EMISSIVE,
          emissiveIntensity: DEFAULT_PLANET_EMISSIVE_INTENSITY,
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

function createOrbit(planet: Planet, theme: Theme, scene: THREE.Scene, disposables: Disposable[], incline = 0) {
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
    new THREE.EllipseCurve(0, 0, planet.orbitRadius, planet.orbitRadius * 0.62, 0, Math.PI * 2, false, 0).getPoints(192),
  );
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: theme === "night" ? 0x9bb7ff : 0x345ca8,
    transparent: true,
    opacity: theme === "night" ? 0.36 : 0.28,
  });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2 - incline;
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

function createSatelliteMesh({
  satellite,
  radius,
  loader,
  renderer,
  disposables,
}: {
  satellite: PlanetSatellite;
  radius: number;
  loader: THREE.TextureLoader;
  renderer: THREE.WebGLRenderer;
  disposables: Disposable[];
}) {
  const geometry = new THREE.SphereGeometry(radius, 24, 16);
  const mesh = new THREE.Mesh(
    geometry,
    createMaterial({
      planet: satellite,
      loader,
      renderer,
      disposables,
    }),
  );
  disposables.push(geometry);
  return mesh;
}

function createSatellites({
  planet,
  parentMesh,
  loader,
  renderer,
  disposables,
  satellites,
}: {
  planet: Planet;
  parentMesh: THREE.Mesh;
  loader: THREE.TextureLoader;
  renderer: THREE.WebGLRenderer;
  disposables: Disposable[];
  satellites: SatelliteObject[];
}) {
  planet.satellites?.forEach((satellite) => {
    const orbitRadius = planet.radius * satellite.orbitRadiusRatio;
    const mesh = createSatelliteMesh({
      satellite,
      radius: planet.radius * satellite.radiusRatio,
      loader,
      renderer,
      disposables,
    });
    parentMesh.add(mesh);
    const satelliteObject = { satellite, mesh, orbitPhase: satellite.phase, orbitRadius };
    updateSatellitePosition(satelliteObject);
    satellites.push(satelliteObject);
  });
}

function updateSatellitePosition(object: SatelliteObject) {
  const tilt = object.satellite.tilt ?? 0;
  object.mesh.position.set(
    Math.cos(object.orbitPhase) * object.orbitRadius,
    Math.sin(tilt) * Math.sin(object.orbitPhase) * object.orbitRadius * 0.38,
    Math.sin(object.orbitPhase) * object.orbitRadius * Math.cos(tilt),
  );
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

function getOrbitPosition(phase: number, orbitRadius: number, incline = 0) {
  return new THREE.Vector3(
    Math.cos(phase) * orbitRadius,
    Math.sin(phase) * Math.sin(incline) * orbitRadius * 0.42,
    Math.sin(phase) * Math.cos(incline) * orbitRadius,
  );
}

function getOrbitIncline(index: number) {
  return ((index % 5) - 2) * 0.045;
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
  satellites,
  orbitIncline,
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
  satellites: SatelliteObject[];
  orbitIncline: number;
}) {
  createOrbit(planet, theme, scene, disposables, orbitIncline);

  const pivot = new THREE.Group();
  scene.add(pivot);

  const mesh = createPlanetMesh({
    planet,
    material: createMaterial({ planet, loader, renderer, disposables }),
    widthSegments: 40,
    heightSegments: 28,
    disposables,
  });
  mesh.position.copy(getOrbitPosition(orbitPhase, planet.orbitRadius, orbitIncline));
  mesh.scale.y = 0.98;
  pivot.add(mesh);
  selectableMeshes.push(mesh);
  objects.push({ planet, pivot, mesh, baseScale: 1, orbitPhase });
  createRing(planet, mesh, disposables);
  createSatellites({ planet, parentMesh: mesh, loader, renderer, disposables, satellites });
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

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 140);
    camera.position.set(0, 8.4, 22);
    camera.lookAt(0, 0, 0);
    cameraRig.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(
      theme === "night" ? 0x6f86d8 : 0xfff4dc, // 环境光颜色：影响全场基础亮度，夜间偏蓝，白天偏白。
      theme === "night" ? 0.48 : 0.72, // 环境光强度：数值越大，星球暗面越亮；降低可增强明暗对比。
    );
    const sunLight = new THREE.PointLight(
      0xffd36f, // 太阳点光源颜色：越偏黄/橙，太阳照明越暖。
      theme === "night" ? 68 : 56, // 太阳点光源强度：数值越大，太阳周围和行星受光越亮。
      260, // 太阳点光源照射距离：数值越大，外层行星也会受到更明显照亮。
      0.58,
    );
    sunLight.position.set(0, 0, 0); // 太阳光源位置：保持在中心，与太阳模型重合。
    const selectedFillLight = new THREE.PointLight(theme === "night" ? 0xfff1cf : 0xffffff, 0, 7.6, 0.8);
    scene.add(ambientLight, sunLight, selectedFillLight);

    const loader = new THREE.TextureLoader();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const selectableMeshes: THREE.Mesh[] = [];
    const disposables: Disposable[] = [];
    const objects: SceneObject[] = [];
    const satellites: SatelliteObject[] = [];
    const focusTarget = new THREE.Vector3(0, 0, 0);
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    const lookTarget = new THREE.Vector3(0, 0, 0);
    const nextLookTarget = new THREE.Vector3(0, 0, 0);
    const zoomState = {
      current: 24,
      target: 24,
      min: 4.8,
      max: 24,
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
        orbitIncline: getOrbitIncline(index),
        theme,
        scene,
        loader,
        renderer,
        disposables,
        selectableMeshes,
        objects,
        satellites,
      });
    });

    let frame = 0;
    let hoveredMesh: THREE.Mesh | null = null;
    const clock = new THREE.Clock();

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      const defaultZoom = zoomState.max;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      zoomState.current = THREE.MathUtils.clamp(zoomState.current || defaultZoom, zoomState.min, zoomState.max);
      zoomState.target = THREE.MathUtils.clamp(zoomState.target || defaultZoom, zoomState.min, zoomState.max);
      camera.position.y = width < 720 ? 10.2 : 8.4;
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
      zoomState.target = THREE.MathUtils.clamp(zoomState.target + event.deltaY * 0.018, zoomState.min, zoomState.max);
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
            zoomState.target = THREE.MathUtils.clamp(pinchStartZoom * Math.pow(pinchStartDistance / distance, 1.45), zoomState.min, zoomState.max);
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
          mesh.position.copy(getOrbitPosition(phase, planet.orbitRadius, getOrbitIncline(objects.indexOf(object) - 1)));
        }
        mesh.rotation.y += planet.rotationSpeed * delta * motionFactor;
        const isSelected = planet.name === selectedNameRef.current;
        const isHovered = hoveredMesh === mesh;
        updateSelectedLighting(mesh, isSelected);
        const targetScale = isSelected ? baseScale * 1.5 : isHovered ? baseScale * 1.16 : baseScale;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
      });

      satellites.forEach((object) => {
        object.orbitPhase += object.satellite.orbitSpeed * delta * motionFactor;
        updateSatellitePosition(object);
        object.mesh.rotation.y += object.satellite.rotationSpeed * delta * motionFactor;
      });

      if (selectedObject) {
        selectedObject.mesh.getWorldPosition(focusTarget);
        cameraTarget.copy(focusTarget).multiplyScalar(0.78);
        nextLookTarget.copy(focusTarget);
        selectedFillLight.position.copy(focusTarget);
        selectedFillLight.intensity = THREE.MathUtils.lerp(selectedFillLight.intensity, theme === "night" ? 7.8 : 6.2, 0.12);
        zoomState.target = zoomState.min;
      } else {
        cameraTarget.set(0, 0, 0);
        nextLookTarget.set(0, 0, 0);
        selectedFillLight.intensity = THREE.MathUtils.lerp(selectedFillLight.intensity, 0, 0.18);
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
      galaxyBackground.nebulae.rotation.y += 0.0009 * delta * motionFactor;
      galaxyBackground.constellationGuide.rotation.y += 0.00035 * delta * motionFactor;
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