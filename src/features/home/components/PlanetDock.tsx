import type { CSSProperties } from "react";
import type { Planet } from "../types";

type PlanetDockProps = {
  objects: Planet[];
  selectedName: string | null;
  onSelectAction: (planet: Planet | null) => void;
};

export function PlanetDock({ objects, selectedName, onSelectAction }: PlanetDockProps) {
  return (
    <nav className="planet-dock" aria-label="Solar system objects">
      <button
        type="button"
        className={selectedName === null ? "planet-chip planet-chip--active" : "planet-chip"}
        onClick={() => onSelectAction(null)}
        style={{ "--planet-color": "#9fb5ff" } as CSSProperties}
      >
        <span />
        远景
      </button>
      {objects.map((planet) => {
        const isSelected = planet.name === selectedName;

        return (
          <button
            key={planet.name}
            type="button"
            className={isSelected ? "planet-chip planet-chip--active" : "planet-chip"}
            onClick={() => onSelectAction(isSelected ? null : planet)}
            style={{ "--planet-color": planet.color } as CSSProperties}
          >
            <span />
            {planet.name}
          </button>
        );
      })}
    </nav>
  );
}
