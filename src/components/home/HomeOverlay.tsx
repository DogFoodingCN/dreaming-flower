import type { Theme } from "./types";

type HomeOverlayProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function HomeOverlay({ theme, onToggleTheme }: HomeOverlayProps) {
  return (
    <section className="solar-overlay" aria-label="Dreaming Flower solar-system entrance">
      <div className="solar-brand-panel">
        <div className="solar-logo">DF</div>
        <div>
          <p className="solar-kicker">dogfooding.cn</p>
          <h1>Dreaming Flower Solar System</h1>
          <p className="solar-intro">
            A galaxy entrance for personal space, IP building, product experience, and blog output.
          </p>
        </div>
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