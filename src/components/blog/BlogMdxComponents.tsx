import { isValidElement } from "react";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { MermaidDiagram } from "@/components/blog/MermaidDiagram";

type CodeElementProps = ComponentPropsWithoutRef<"code">;

type PreElementProps = ComponentPropsWithoutRef<"pre"> & {
  children?: ReactElement<CodeElementProps>;
};

function getTextContent(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(getTextContent).join("");
  }

  return "";
}

export const blogMdxComponents = {
  pre({ children, ...props }: PreElementProps) {
    if (isValidElement<CodeElementProps>(children) && children.props.className?.includes("language-mermaid")) {
      return <MermaidDiagram chart={getTextContent(children.props.children).trim()} />;
    }

    return (
      <pre className="blog-code-block" {...props}>
        {children}
      </pre>
    );
  },
};
