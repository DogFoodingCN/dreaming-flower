"use client";

import { useMemo, useState } from "react";
import { HomeOverlay } from "@/components/home/HomeOverlay";
import { PlanetDock } from "@/components/home/PlanetDock";
import { planets, solarSystemObjects, sun } from "@/components/home/planets";
import { SolarSystemScene } from "@/components/home/SolarSystemScene";
import type { Planet, Theme } from "@/components/home/types";

export default function Home() {
  const [theme, setTheme] = useState<Theme>("night");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const objects = useMemo(() => solarSystemObjects, []);
  const selectedName = selectedPlanet?.name ?? null;

  return (
    <main className={`solar-page solar-page--${theme}`}>
      <SolarSystemScene
        selectedName={selectedName}
        theme={theme}
        sun={sun}
        planets={planets}
        onSelect={setSelectedPlanet}
      />
      <HomeOverlay theme={theme} onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "night" ? "day" : "night"))} />
      <PlanetDock objects={objects} selectedName={selectedName} onSelect={setSelectedPlanet} />
    </main>
  );
}
