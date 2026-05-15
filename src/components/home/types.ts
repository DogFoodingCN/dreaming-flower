export type Theme = "night" | "day";

export type PlanetRing = {
  innerRadiusRatio: number;
  outerRadiusRatio: number;
  color: number;
  opacity: number;
  tilt: number;
};

export type Planet = {
  name: string;
  realRadiusKm: number;
  realOrbitMillionKm: number;
  radiusScale: number;
  orbitScale: number;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  color: string;
  texturePath: string;
  description: string;
  ring?: PlanetRing;
};
