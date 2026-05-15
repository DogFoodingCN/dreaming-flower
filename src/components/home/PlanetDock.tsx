import type { CSSProperties } from "react";
import type { Planet } from "./types";

type PlanetDockProps = {
  objects: Planet[];
  selectedName: string;
  onSelect: (planet: Planet) => void;
};

export function PlanetDock({ objects, selectedName, onSelect }: PlanetDockProps) {
  return (
    <nav className="planet-dock" aria-label="Solar system objects">
      {objects.map((planet) => (
        <button
          key={planet.name}
          type="button"
          className={planet.name === selectedName ? "planet-chip planet-chip--active" : "planet-chip"}
          onClick={() => onSelect(planet)}
          style={{ "--planet-color": planet.color } as CSSProperties}
        >
          <span />
          {planet.name}
        </button>
      ))}
    </nav>
  );
}
