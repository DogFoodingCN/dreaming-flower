import type { Planet } from "./types";

const EARTH_RADIUS_KM = 6371;
const MERCURY_ORBIT_MILLION_KM = 57.9;

function mapDisplayRadius(realRadiusKm: number, radiusScale: number) {
  return Math.sqrt(realRadiusKm / EARTH_RADIUS_KM) * 0.34 * radiusScale;
}

function mapDisplayOrbit(realOrbitMillionKm: number, orbitScale: number) {
  if (realOrbitMillionKm === 0) {
    return 0;
  }

  return (1.65 + Math.log10(realOrbitMillionKm / MERCURY_ORBIT_MILLION_KM + 1) * 7.4) * orbitScale;
}

type PlanetConfig = Omit<Planet, "radius" | "orbitRadius">;

function createPlanet(planet: PlanetConfig): Planet {
  return {
    ...planet,
    radius: mapDisplayRadius(planet.realRadiusKm, planet.radiusScale),
    orbitRadius: mapDisplayOrbit(planet.realOrbitMillionKm, planet.orbitScale),
  };
}

export const sun = createPlanet({
  name: "太阳", // 星球名称：会显示在底部按钮和信息卡标题中。
  realRadiusKm: 696340, // 真实半径：太阳实际半径，单位 km，用于计算展示半径。
  realOrbitMillionKm: 0, // 真实轨道半径：太阳固定在中心，所以保持 0。
  radiusScale: 0.24, // 展示半径倍率：太阳真实尺寸极大，调小可避免吞掉内侧行星。
  orbitScale: 1, // 展示轨道倍率：太阳无轨道，保持 1 即可。
  orbitSpeed: 0, // 公转速度：太阳不绕中心公转，所以保持 0。
  rotationSpeed: 0.18, // 自转速度：控制太阳贴图表面的旋转速度。
  color: "#ffd166", // 基础颜色：贴图未加载时的备用颜色，也影响发光色。
  texturePath: "/textures/solar-system/sun.jpg", // 贴图路径：文件放在 public/textures/solar-system/ 下。
  description: "Dreaming Flower is the center: a personal galaxy for IP building, product experience, and blog output.",
});

export const planets: Planet[] = [
  createPlanet({
    name: "水星", // 星球名称：底部按钮和信息卡使用。
    realRadiusKm: 2439.7, // 真实半径：水星实际半径，单位 km。
    realOrbitMillionKm: 57.9, // 真实轨道半径：水星到太阳的平均距离，单位百万 km。
    radiusScale: 1.55, // 展示半径倍率：调大可让小行星更容易被点击和看见。
    orbitScale: 0.96, // 展示轨道倍率：调大可让轨道更远离太阳。
    orbitSpeed: 0.44, // 公转速度：数值越大，绕太阳越快。
    rotationSpeed: 0.4, // 自转速度：控制贴图自身旋转。
    color: "#b8aaa1", // 基础颜色：贴图未加载时显示。
    texturePath: "/textures/solar-system/mercury.jpg", // 贴图路径：替换同名文件即可调整外观。
    description: "The closest signal to the center, reserved for fast notes and small experiments.",
  }),
  createPlanet({
    name: "金星", // 星球名称：显示文案与交互标识。
    realRadiusKm: 6051.8, // 真实半径：金星实际半径，单位 km。
    realOrbitMillionKm: 108.2, // 真实轨道半径：金星到太阳的平均距离，单位百万 km。
    radiusScale: 1.08, // 展示半径倍率：调大或调小可微调视觉大小。
    orbitScale: 1.02, // 展示轨道倍率：调大可让轨道更远离太阳。
    orbitSpeed: 0.32, // 公转速度：越大移动越快。
    rotationSpeed: 0.32, // 自转速度：贴图旋转速度。
    color: "#d8b46a", // 基础颜色：贴图失败时的备用色。
    texturePath: "/textures/solar-system/venus.jpg", // 贴图路径：对应 public 下的图片。
    description: "A warm orbit for product experience fragments and visual studies.",
  }),
  createPlanet({
    name: "地球", // 星球名称：底部按钮和信息卡使用。
    realRadiusKm: 6371, // 真实半径：地球实际半径，单位 km，是视觉映射的基准。
    realOrbitMillionKm: 149.6, // 真实轨道半径：地球到太阳的平均距离，单位百万 km。
    radiusScale: 1.08, // 展示半径倍率：以地球为中小型行星视觉基准。
    orbitScale: 1.08, // 展示轨道倍率：调大可让轨道更远离太阳。
    orbitSpeed: 0.26, // 公转速度：越小越平静。
    rotationSpeed: 0.55, // 自转速度：地球贴图可稍快，增强生命感。
    color: "#3f8edc", // 基础颜色：贴图未加载时的蓝色备用。
    texturePath: "/textures/solar-system/earth.jpg", // 贴图路径：放置 earth.jpg 后自动应用。
    description: "The home node for personal space, dogfooding notes, and present-tense updates.",
    satellites: [
      {
        name: "月球",
        radiusRatio: 0.28,
        orbitRadiusRatio: 2.45,
        orbitSpeed: 1.45,
        rotationSpeed: 0.35,
        texturePath: "/textures/satellites/moon.jpg",
        color: "#c9c6bd",
        phase: 0.5,
        tilt: 0.18,
      },
    ],
  }),
  createPlanet({
    name: "火星", // 星球名称：底部按钮和信息卡使用。
    realRadiusKm: 3389.5, // 真实半径：火星实际半径，单位 km。
    realOrbitMillionKm: 227.9, // 真实轨道半径：火星到太阳的平均距离，单位百万 km。
    radiusScale: 1.22, // 展示半径倍率：调大可补偿火星真实尺寸偏小的问题。
    orbitScale: 1.14, // 展示轨道倍率：调大可让轨道更远离太阳。
    orbitSpeed: 0.21, // 公转速度：外侧行星建议更慢。
    rotationSpeed: 0.5, // 自转速度：控制贴图转动。
    color: "#c9674a", // 基础颜色：红橙色备用外观。
    texturePath: "/textures/solar-system/mars.jpg", // 贴图路径：替换 mars.jpg 即可。
    description: "A sharper orbit for building logs, prototypes, and unfinished product questions.",
  }),
  createPlanet({
    name: "木星", // 星球名称：木星节点。
    realRadiusKm: 69911, // 真实半径：木星实际半径，单位 km。
    realOrbitMillionKm: 778.5, // 真实轨道半径：木星到太阳的平均距离，单位百万 km。
    radiusScale: 0.58, // 展示半径倍率：木星真实尺寸很大，调小可保持构图平衡。
    orbitScale: 1.12, // 展示轨道倍率：调大可让轨道更远离太阳。
    orbitSpeed: 0.14, // 公转速度：外层行星慢一些更稳。
    rotationSpeed: 0.75, // 自转速度：木星条纹贴图适合稍快自转。
    color: "#d2a679", // 基础颜色：贴图失败时的暖棕色。
    texturePath: "/textures/solar-system/jupiter.jpg", // 贴图路径：对应 jupiter.jpg。
    description: "A large gravity well for long-form writing, essays, and durable thinking.",
    satellites: [
      {
        name: "Io",
        radiusRatio: 0.1,
        orbitRadiusRatio: 1.42,
        orbitSpeed: 1.05,
        rotationSpeed: 0.45,
        texturePath: "/textures/satellites/io.jpg",
        color: "#d6b05f",
        phase: 0.15,
        tilt: 0.06,
      },
      {
        name: "Europa",
        radiusRatio: 0.09,
        orbitRadiusRatio: 1.72,
        orbitSpeed: 0.88,
        rotationSpeed: 0.38,
        texturePath: "/textures/satellites/europa.jpg",
        color: "#d8d3c8",
        phase: 1.75,
        tilt: -0.1,
      },
      {
        name: "Ganymede",
        radiusRatio: 0.13,
        orbitRadiusRatio: 2.05,
        orbitSpeed: 0.72,
        rotationSpeed: 0.32,
        texturePath: "/textures/satellites/ganymede.jpg",
        color: "#9d9487",
        phase: 3.25,
        tilt: 0.12,
      },
      {
        name: "Callisto",
        radiusRatio: 0.12,
        orbitRadiusRatio: 2.42,
        orbitSpeed: 0.56,
        rotationSpeed: 0.28,
        texturePath: "/textures/satellites/callisto.jpg",
        color: "#7d7167",
        phase: 4.8,
        tilt: -0.08,
      },
    ],
  }),
  createPlanet({
    name: "土星", // 星球名称：土星节点。
    realRadiusKm: 58232, // 真实半径：土星实际半径，单位 km，不包含星环。
    realOrbitMillionKm: 1433.5, // 真实轨道半径：土星到太阳的平均距离，单位百万 km。
    radiusScale: 0.56, // 展示半径倍率：调小可避免星环占据过大画面。
    orbitScale: 1.2, // 展示轨道倍率：调大可让轨道更远离太阳。
    orbitSpeed: 0.11, // 公转速度：越外侧越慢。
    rotationSpeed: 0.68, // 自转速度：控制土星贴图转动。
    color: "#d9c48f", // 基础颜色：贴图失败时的土黄色。
    texturePath: "/textures/solar-system/saturn.jpg", // 贴图路径：对应 saturn.jpg。
    description: "A ringed placeholder for future collections, archives, and curated references.",
    satellites: [
      {
        name: "Titan",
        radiusRatio: 0.18,
        orbitRadiusRatio: 2.7,
        orbitSpeed: 0.48,
        rotationSpeed: 0.26,
        texturePath: "/textures/satellites/titan.jpg",
        color: "#c69a55",
        phase: 2.35,
        tilt: 0.22,
      },
    ],
    ring: {
      innerRadiusRatio: 1.35, // 星环内径比例：相对星球半径计算。
      outerRadiusRatio: 2.05, // 星环外径比例：数值越大，星环越宽。
      color: 0xe9d69a, // 星环颜色：使用 Three.js 十六进制数字。
      opacity: 0.72, // 星环透明度：0 到 1，越大越明显。
      tilt: Math.PI / 2.45, // 星环倾斜角：调整星环朝向。
    },
  }),
  createPlanet({
    name: "天王星", // 星球名称：天王星节点。
    realRadiusKm: 25362, // 真实半径：天王星实际半径，单位 km。
    realOrbitMillionKm: 2872.5, // 真实轨道半径：天王星到太阳的平均距离，单位百万 km。
    radiusScale: 0.66, // 展示半径倍率：调节冰巨星视觉大小。
    orbitScale: 1.18, // 展示轨道倍率：调大可让轨道更远离太阳。
    orbitSpeed: 0.08, // 公转速度：慢速营造平静感。
    rotationSpeed: 0.46, // 自转速度：贴图旋转速度。
    color: "#8fd6df", // 基础颜色：青蓝色备用外观。
    texturePath: "/textures/solar-system/uranus.jpg", // 贴图路径：对应 uranus.jpg。
    description: "A quiet outer orbit for slow ideas and exploratory interface experiments.",
  }),
  createPlanet({
    name: "海王星", // 星球名称：海王星节点。
    realRadiusKm: 24622, // 真实半径：海王星实际半径，单位 km。
    realOrbitMillionKm: 4495.1, // 真实轨道半径：海王星到太阳的平均距离，单位百万 km。
    radiusScale: 0.66, // 展示半径倍率：调节冰巨星视觉大小。
    orbitScale: 1.25, // 展示轨道倍率：调大可让轨道更远离太阳。
    orbitSpeed: 0.06, // 公转速度：外层低速。
    rotationSpeed: 0.44, // 自转速度：控制贴图旋转。
    color: "#496fdf", // 基础颜色：深蓝色备用外观。
    texturePath: "/textures/solar-system/neptune.jpg", // 贴图路径：对应 neptune.jpg。
    description: "The far blue node for future modules that should stay visible but not yet implemented.",
    satellites: [
      {
        name: "Triton",
        radiusRatio: 0.16,
        orbitRadiusRatio: 2.25,
        orbitSpeed: -0.42,
        rotationSpeed: 0.24,
        texturePath: "/textures/satellites/triton.jpg",
        color: "#c2c8d0",
        phase: 3.8,
        tilt: -0.18,
      },
    ],
  }),
];

export const solarSystemObjects = [sun, ...planets];
