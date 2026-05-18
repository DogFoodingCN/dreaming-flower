"use client";

import { useMemo, useState } from "react";
import { HomeOverlay } from "@/features/home/components/HomeOverlay";
import { PlanetDock } from "@/features/home/components/PlanetDock";
import { planets, solarSystemObjects, sun } from "@/features/home/data/planets";
import { SolarSystemScene } from "@/features/home/components/SolarSystemScene";
import { useSiteTheme } from "@/components/site/SiteThemeProvider";
import type { Planet } from "@/features/home/types";

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
      <HomeOverlay theme={theme} onToggleThemeAction={toggleTheme} />
      <PlanetDock objects={objects} selectedName={selectedName} onSelect={setSelectedPlanet} />
    </main>
  );
}
