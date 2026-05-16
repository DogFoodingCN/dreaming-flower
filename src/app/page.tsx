"use client";

import { useMemo, useState } from "react";
import { HomeOverlay } from "@/components/home/HomeOverlay";
import { PlanetDock } from "@/components/home/PlanetDock";
import { planets, solarSystemObjects, sun } from "@/components/home/planets";
import { SolarSystemScene } from "@/components/home/SolarSystemScene";
import { useSiteTheme } from "@/components/site/SiteThemeProvider";
import type { Planet } from "@/components/home/types";

export default function Home() {
  const { theme, toggleTheme } = useSiteTheme();
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
      <HomeOverlay theme={theme} onToggleTheme={toggleTheme} />
      <PlanetDock objects={objects} selectedName={selectedName} onSelect={setSelectedPlanet} />
    </main>
  );
}
