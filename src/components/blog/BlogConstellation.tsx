"use client";

import { useMemo } from "react";

type Star = {
  x: number;
  y: number;
  size: number;
  delay: number;
};

function createStars() {
  return Array.from({ length: 28 }, (_, index) => {
    const angle = index * 2.399963229728653;
    const radius = 18 + ((index * 17) % 58);

    return {
      x: 50 + Math.cos(angle) * radius,
      y: 48 + Math.sin(angle) * radius * 0.62,
      size: 2 + (index % 4) * 0.7,
      delay: (index % 9) * 0.28,
    };
  });
}

function createLines(stars: Star[]) {
  return Array.from({ length: 12 }, (_, index) => ({
    start: stars[(index * 2) % stars.length],
    end: stars[(index * 2 + 5) % stars.length],
    delay: index * 0.22,
  }));
}

export function BlogConstellation() {
  const { stars, lines } = useMemo(() => {
    const generatedStars = createStars();
    return { stars: generatedStars, lines: createLines(generatedStars) };
  }, []);

  return (
    <div className="blog-constellation" aria-hidden="true">
      <svg className="blog-constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        {lines.map((line, index) => (
          <line
            key={`${line.start.x}-${line.end.x}-${index}`}
            x1={line.start.x}
            y1={line.start.y}
            x2={line.end.x}
            y2={line.end.y}
            style={{ animationDelay: `${line.delay}s` }}
          />
        ))}
      </svg>
      {stars.map((star, index) => (
        <span
          key={`${star.x}-${star.y}-${index}`}
          className="blog-constellation-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
