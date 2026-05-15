"use client";

import { useMemo, useState } from "react";
import { HomeOverlay } from "@/components/home/HomeOverlay";
import { PlanetDock } from "@/components/home/PlanetDock";
import { PlanetPanel } from "@/components/home/PlanetPanel";
import { planets, solarSystemObjects, sun } from "@/components/home/planets";
import { SolarSystemScene } from "@/components/home/SolarSystemScene";
import type { Planet, Theme } from "@/components/home/types";

export default function Home() {
  const [theme, setTheme] = useState<Theme>("night");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(sun);
  const objects = useMemo(() => solarSystemObjects, []);

  return (
    <main className={`solar-page solar-page--${theme}`}>
      <SolarSystemScene
        selectedName={selectedPlanet.name}
        theme={theme}
        sun={sun}
        planets={planets}
        onSelect={setSelectedPlanet}
      />
      <HomeOverlay theme={theme} onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "night" ? "day" : "night"))} />
      <PlanetPanel planet={selectedPlanet} />
      <PlanetDock objects={objects} selectedName={selectedPlanet.name} onSelect={setSelectedPlanet} />
    </main>
  );
}
