"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2 } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useSiteTheme } from "@/components/site/SiteThemeProvider";

type MermaidDiagramProps = {
  chart: string;
};

const themeVariables = {
  night: {
    background: "transparent",
    primaryColor: "rgba(159, 181, 255, 0.18)",
    primaryTextColor: "rgba(248, 251, 255, 0.9)",
    primaryBorderColor: "rgba(159, 181, 255, 0.72)",
    lineColor: "rgba(198, 210, 255, 0.82)",
    secondaryColor: "rgba(255, 209, 102, 0.2)",
    tertiaryColor: "rgba(255, 255, 255, 0.08)",
    textColor: "rgba(248, 251, 255, 0.9)",
    edgeLabelBackground: "rgba(8, 13, 30, 0.92)",
  },
  day: {
    background: "transparent",
    primaryColor: "rgba(79, 124, 255, 0.16)",
    primaryTextColor: "rgba(17, 24, 39, 0.92)",
    primaryBorderColor: "rgba(53, 70, 112, 0.78)",
    lineColor: "rgba(39, 55, 91, 0.9)",
    secondaryColor: "rgba(255, 193, 79, 0.28)",
    tertiaryColor: "rgba(255, 255, 255, 0.42)",
    textColor: "rgba(17, 24, 39, 0.92)",
    edgeLabelBackground: "rgba(247, 250, 255, 0.94)",
  },
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const diagramId = `mermaid-${useId().replace(/:/g, "")}`;
  const { theme } = useSiteTheme();
  const [svg, setSvg] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: themeVariables[theme],
      });
      const result = await mermaid.render(`${diagramId}-${theme}`, chart);

      if (isMounted) {
        setSvg(result.svg);
      }
    }

    renderDiagram().catch(() => {
      if (isMounted) {
        setSvg("");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [chart, diagramId, theme]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFullscreen]);

  if (!svg) {
    return <pre className="blog-code-block blog-code-block--mermaid">{chart}</pre>;
  }

  const diagram = <div className="blog-mermaid-svg" dangerouslySetInnerHTML={{ __html: svg }} />;
  const fullscreen = isFullscreen ? (
    <div className={`blog-mermaid-fullscreen blog-mermaid-fullscreen--${theme}`} role="dialog" aria-modal="true" aria-label="Mermaid 图表全屏查看">
      <button type="button" className="blog-mermaid-fullscreen-backdrop" aria-label="关闭全屏查看" onClick={() => setIsFullscreen(false)} />
      <div className="blog-mermaid-fullscreen-panel">
        <TransformWrapper
          initialScale={1.18}
          minScale={0.45}
          maxScale={3}
          centerOnInit
          centerZoomedOut
          limitToBounds={false}
          wheel={{ step: 0.12 }}
          pinch={{ step: 8 }}
          panning={{ velocityDisabled: true }}
          doubleClick={{ disabled: true }}
        >
          {() => (
            <TransformComponent wrapperClass="blog-mermaid-fullscreen-canvas" contentClass="blog-mermaid-fullscreen-content">
              {diagram}
            </TransformComponent>
          )}
        </TransformWrapper>
      </div>
    </div>
  ) : null;

  return (
    <figure className="blog-mermaid">
      <button type="button" className="blog-mermaid-open-button" aria-label="全屏查看 Mermaid 图表" title="全屏查看" onClick={() => setIsFullscreen(true)}>
        <Maximize2 aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
      <div className="blog-mermaid-scroll">{diagram}</div>
      {fullscreen ? createPortal(fullscreen, document.body) : null}
    </figure>
  );
}
