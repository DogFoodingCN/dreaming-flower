import type { Planet } from "./types";

type PlanetPanelProps = {
  planet: Planet | null;
};

export function PlanetPanel({ planet }: PlanetPanelProps) {
  return (
    <section className="planet-panel" aria-live="polite">
      <p className="planet-status">Coming soon</p>
      <h2>{planet?.name ?? "Default View"}</h2>
      <p>
        {planet?.description ??
          "Start from the full Dreaming Flower galaxy, then select a planet to focus on a single orbit."}
      </p>
      {planet ? <p className="planet-texture-slot">Texture slot: {planet.texturePath}</p> : null}
    </section>
  );
}
