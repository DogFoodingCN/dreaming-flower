import { SiteChrome } from "@/components/site/SiteChrome";
import type { Theme } from "./types";

type HomeOverlayProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function HomeOverlay({ theme, onToggleTheme }: HomeOverlayProps) {
  return <SiteChrome theme={theme} activePath="/" onToggleTheme={onToggleTheme} />;
}
