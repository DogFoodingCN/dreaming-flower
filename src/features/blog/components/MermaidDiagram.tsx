"use client";

import { useEffect, useId, useState } from "react";

type MermaidDiagramProps = {
  chart: string;
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const diagramId = `mermaid-${useId().replace(/:/g, "")}`;
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "dark" });
      const result = await mermaid.render(diagramId, chart);

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
  }, [chart, diagramId]);

  if (!svg) {
    return <pre className="blog-code-block blog-code-block--mermaid">{chart}</pre>;
  }

  return <div className="blog-mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
}
