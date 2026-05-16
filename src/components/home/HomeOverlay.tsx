import type { Theme } from "./types";

type HomeOverlayProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function HomeOverlay({ theme, onToggleTheme }: HomeOverlayProps) {
  return (
    <section className="solar-overlay" aria-label="Dreaming Flower solar-system entrance">
      <div className="solar-brand-panel">
        <div className="solar-title-row">
          <span className="solar-logo-text">DF</span>
          <span className="solar-title-divider" aria-hidden="true" />
          <h1>繁花盛景</h1>
        </div>
        <p className="solar-kicker">Independent Developer · Product Lab</p>
      </div>

      <button
        type="button"
        className="solar-theme-toggle"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === "night" ? "day" : "night"} mode`}
      >
        {theme === "night" ? "Day mode" : "Night mode"}
      </button>
    </section>
  );
}