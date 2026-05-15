import type { Planet } from "./types";

type PlanetPanelProps = {
  planet: Planet;
};

export function PlanetPanel({ planet }: PlanetPanelProps) {
  return (
    <section className="planet-panel" aria-live="polite">
      <p className="planet-status">Coming soon</p>
      <h2>{planet.name}</h2>
      <p>{planet.description}</p>
      <p className="planet-texture-slot">Texture slot: {planet.texturePath}</p>
    </section>
  );
}
