import React from "react";

export default function RadarNotes({ values = [], labels = [] }) {
  const N = values.length;
  if (N === 0) return <div>Sem métricas</div>;

  const cx = 100, cy = 100, radius = 70;
  const angle = (i) => -Math.PI / 2 + (i * (2 * Math.PI)) / N;

  const outer = [];
  const inner = [];
  for (let i = 0; i < N; i++) {
    const a = angle(i);
    const ox = cx + radius * Math.cos(a);
    const oy = cy + radius * Math.sin(a);
    outer.push(`${ox},${oy}`);

    const val = Math.max(0, Number(values[i] || 0));
    const norm = Math.min(1, val / 10);
    const ix = cx + radius * norm * Math.cos(a);
    const iy = cy + radius * norm * Math.sin(a);
    inner.push(`${ix},${iy}`);
  }

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => {
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = angle(i);
      pts.push(`${cx + radius * f * Math.cos(a)},${cy + radius * f * Math.sin(a)}`);
    }
    return pts.join(" ");
  });

  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="180"
      role="img"
      aria-label="Radar de competências"
    >
      {gridLines.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#ddd" strokeWidth="0.8" />
      ))}

      <polygon points={outer.join(" ")} fill="none" stroke="#ccc" strokeWidth="1" />
      <polygon
        points={inner.join(" ")}
        fill="#60a5fa"
        fillOpacity="0.35"
        stroke="#3b82f6"
        strokeWidth="1.5"
      />

      {labels.map((lab, i) => {
        const a = angle(i);
        const lx = cx + (radius + 18) * Math.cos(a);
        const ly = cy + (radius + 18) * Math.sin(a);
        const anchor =
          Math.abs(Math.cos(a)) < 0.2 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        return (
          <text key={i} x={lx} y={ly} fontSize="10" textAnchor={anchor}>
            {lab}
          </text>
        );
      })}
    </svg>
  );
}
