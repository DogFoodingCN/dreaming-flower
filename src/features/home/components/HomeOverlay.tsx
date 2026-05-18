import { SiteChrome } from "@/components/site/SiteChrome";
import type { Theme } from "@/lib/theme";

type HomeOverlayProps = {
  theme: Theme;
  onToggleThemeAction: () => void;
};

export function HomeOverlay({ theme, onToggleThemeAction }: HomeOverlayProps) {
  return <SiteChrome theme={theme} activePath="/" onToggleThemeAction={onToggleThemeAction} />;
}
