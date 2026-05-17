export type PlanetRing = {
  innerRadiusRatio: number;
  outerRadiusRatio: number;
  color: number;
  opacity: number;
  tilt: number;
};

export type PlanetSatellite = {
  name: string;
  radiusRatio: number;
  orbitRadiusRatio: number;
  orbitSpeed: number;
  rotationSpeed: number;
  texturePath: string;
  color: string;
  phase: number;
  tilt?: number;
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
  satellites?: PlanetSatellite[];
};
