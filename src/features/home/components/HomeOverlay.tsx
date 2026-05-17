import { SiteChrome } from "@/components/site/SiteChrome";
import type { Theme } from "@/lib/theme";

type HomeOverlayProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function HomeOverlay({ theme, onToggleTheme }: HomeOverlayProps) {
  return <SiteChrome theme={theme} activePath="/" onToggleTheme={onToggleTheme} />;
}
