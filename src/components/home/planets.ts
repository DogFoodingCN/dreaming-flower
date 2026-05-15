import type { Planet } from "./types";

function createPlanet(planet: Planet): Planet {
  return planet;
}

export const sun = createPlanet({
  name: "Sun", // 星球名称：会显示在底部按钮和信息卡标题中。
  radius: 0.82, // 星球半径：数值越大，模型越大。
  orbitRadius: 0, // 轨道半径：太阳固定在中心，所以保持 0。
  orbitSpeed: 0, // 公转速度：太阳不绕中心公转，所以保持 0。
  rotationSpeed: 0.18, // 自转速度：控制太阳贴图表面的旋转速度。
  color: "#ffd166", // 基础颜色：贴图未加载时的备用颜色，也影响发光色。
  texturePath: "/textures/solar-system/sun.jpg", // 贴图路径：文件放在 public/textures/solar-system/ 下。
  description: "Dreaming Flower is the center: a personal galaxy for IP building, product experience, and blog output.",
});

export const planets: Planet[] = [
  createPlanet({
    name: "Mercury", // 星球名称：保持与太阳系参考站点一致。
    radius: 0.22, // 星球半径：水星较小，调大可提升可见度。
    orbitRadius: 1.45, // 轨道半径：距离太阳的远近。
    orbitSpeed: 0.44, // 公转速度：数值越大，绕太阳越快。
    rotationSpeed: 0.4, // 自转速度：控制贴图自身旋转。
    color: "#b8aaa1", // 基础颜色：贴图未加载时显示。
    texturePath: "/textures/solar-system/mercury.jpg", // 贴图路径：替换同名文件即可调整外观。
    description: "The closest signal to the center, reserved for fast notes and small experiments.",
  }),
  createPlanet({
    name: "Venus", // 星球名称：显示文案与交互标识。
    radius: 0.32, // 星球半径：用于控制 Venus 视觉大小。
    orbitRadius: 2.05, // 轨道半径：越大越远离太阳。
    orbitSpeed: 0.32, // 公转速度：越大移动越快。
    rotationSpeed: 0.32, // 自转速度：贴图旋转速度。
    color: "#d8b46a", // 基础颜色：贴图失败时的备用色。
    texturePath: "/textures/solar-system/venus.jpg", // 贴图路径：对应 public 下的图片。
    description: "A warm orbit for product experience fragments and visual studies.",
  }),
  createPlanet({
    name: "Earth", // 星球名称：底部按钮和信息卡使用。
    radius: 0.36, // 星球半径：Earth 的视觉大小。
    orbitRadius: 2.72, // 轨道半径：控制和太阳的距离。
    orbitSpeed: 0.26, // 公转速度：越小越平静。
    rotationSpeed: 0.55, // 自转速度：地球贴图可稍快，增强生命感。
    color: "#3f8edc", // 基础颜色：贴图未加载时的蓝色备用。
    texturePath: "/textures/solar-system/earth.jpg", // 贴图路径：放置 earth.jpg 后自动应用。
    description: "The home node for personal space, dogfooding notes, and present-tense updates.",
  }),
  createPlanet({
    name: "Mars", // 星球名称：保持英文太阳系命名。
    radius: 0.28, // 星球半径：Mars 比 Earth 略小。
    orbitRadius: 3.42, // 轨道半径：控制 Mars 所在轨道。
    orbitSpeed: 0.21, // 公转速度：外侧行星建议更慢。
    rotationSpeed: 0.5, // 自转速度：控制贴图转动。
    color: "#c9674a", // 基础颜色：红橙色备用外观。
    texturePath: "/textures/solar-system/mars.jpg", // 贴图路径：替换 mars.jpg 即可。
    description: "A sharper orbit for building logs, prototypes, and unfinished product questions.",
  }),
  createPlanet({
    name: "Jupiter", // 星球名称：木星节点。
    radius: 0.68, // 星球半径：最大行星，用于制造视觉重心。
    orbitRadius: 4.45, // 轨道半径：控制木星离太阳的距离。
    orbitSpeed: 0.14, // 公转速度：外层行星慢一些更稳。
    rotationSpeed: 0.75, // 自转速度：木星条纹贴图适合稍快自转。
    color: "#d2a679", // 基础颜色：贴图失败时的暖棕色。
    texturePath: "/textures/solar-system/jupiter.jpg", // 贴图路径：对应 jupiter.jpg。
    description: "A large gravity well for long-form writing, essays, and durable thinking.",
  }),
  createPlanet({
    name: "Saturn", // 星球名称：土星节点。
    radius: 0.58, // 星球半径：不包含星环，星环由 ring 单独控制。
    orbitRadius: 5.65, // 轨道半径：控制土星轨道位置。
    orbitSpeed: 0.11, // 公转速度：越外侧越慢。
    rotationSpeed: 0.68, // 自转速度：控制土星贴图转动。
    color: "#d9c48f", // 基础颜色：贴图失败时的土黄色。
    texturePath: "/textures/solar-system/saturn.jpg", // 贴图路径：对应 saturn.jpg。
    description: "A ringed placeholder for future collections, archives, and curated references.",
    ring: {
      innerRadiusRatio: 1.35, // 星环内径比例：相对星球半径计算。
      outerRadiusRatio: 2.05, // 星环外径比例：数值越大，星环越宽。
      color: 0xe9d69a, // 星环颜色：使用 Three.js 十六进制数字。
      opacity: 0.72, // 星环透明度：0 到 1，越大越明显。
      tilt: Math.PI / 2.45, // 星环倾斜角：调整星环朝向。
    },
  }),
  createPlanet({
    name: "Uranus", // 星球名称：天王星节点。
    radius: 0.44, // 星球半径：控制可见大小。
    orbitRadius: 6.75, // 轨道半径：更外侧的轨道。
    orbitSpeed: 0.08, // 公转速度：慢速营造平静感。
    rotationSpeed: 0.46, // 自转速度：贴图旋转速度。
    color: "#8fd6df", // 基础颜色：青蓝色备用外观。
    texturePath: "/textures/solar-system/uranus.jpg", // 贴图路径：对应 uranus.jpg。
    description: "A quiet outer orbit for slow ideas and exploratory interface experiments.",
  }),
  createPlanet({
    name: "Neptune", // 星球名称：海王星节点。
    radius: 0.43, // 星球半径：控制海王星大小。
    orbitRadius: 7.8, // 轨道半径：靠近最外层。
    orbitSpeed: 0.06, // 公转速度：外层低速。
    rotationSpeed: 0.44, // 自转速度：控制贴图旋转。
    color: "#496fdf", // 基础颜色：深蓝色备用外观。
    texturePath: "/textures/solar-system/neptune.jpg", // 贴图路径：对应 neptune.jpg。
    description: "The far blue node for future modules that should stay visible but not yet implemented.",
  }),
];

export const solarSystemObjects = [sun, ...planets];
