import "../../style.css";
import React from "react";

// Componente de radar para visualização de habilidades
export default function RadarNotes({ values = [], labels = [] }) {
  // Configuração para 6 critérios (incluindo QAP)
  const N = 6;
  const safeValues = Array(N).fill(0).map((_, i) => values[i] || 0);
  const safeLabels = Array(N).fill(0).map((_, i) => labels[i] || `Critério ${i + 1}`);

  // Parâmetros de renderização do gráfico radar
  const cx = 200, cy = 200, radius = 140;
  const angle = (i) => -Math.PI / 2 + (i * (2 * Math.PI)) / N;

  // Cálculo dos pontos do polígono do radar
  const points = [];
  for (let i = 0; i < N; i++) {
    const a = angle(i);
    const val = Math.max(0, Math.min(10, Number(safeValues[i] || 0)));
    const norm = val / 10;
    const x = cx + radius * norm * Math.cos(a);
    const y = cy + radius * norm * Math.sin(a);
    points.push({ x, y, value: val });
  }

  // Configuração das grades concêntricas (3 níveis)
  const gridLevels = [0.33, 0.66, 1];
  const gridCircles = gridLevels.map(level => {
    const r = radius * level;
    return { r, stroke: level === 1 ? '#cbd5e1' : '#e2e8f0' };
  });

  // Definição de cores e estilos
  const axisColor = '#cbd5e1';
  const labelColor = '#4b5563';
  const polygonFill = 'url(#radar-gradient)';
  const polygonStroke = '#3b82f6';
  const pointColor = '#3b82f6';
  const pointHaloColor = '#93c5fd';

  return (
    <div className="radar-enhanced-container">
      <svg 
        className="radar-svg-enhanced" 
        viewBox="0 0 400 400" 
        width="100%" 
        height="100%"
        role="img" 
        aria-label="Radar de competências"
      >
        {/* Definições de gradientes e efeitos visuais */}
        <defs>
          <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <radialGradient id="point-gradient">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
        </defs>

        {/* Renderização das grades concêntricas */}
        {gridCircles.map((circle, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={circle.r}
            fill="none"
            stroke={circle.stroke}
            strokeWidth="1"
          />
        ))}

        {/* Renderização dos eixos do radar */}
        {Array.from({ length: N }).map((_, i) => {
          const a = angle(i);
          const x2 = cx + radius * Math.cos(a);
          const y2 = cy + radius * Math.sin(a);
          return (
            <line 
              key={`axis-${i}`}
              x1={cx} 
              y1={cy} 
              x2={x2} 
              y2={y2} 
              stroke={axisColor} 
              strokeWidth="1"
            />
          );
        })}

        {/* Polígono principal do radar */}
        <polygon 
          points={points.map(p => `${p.x},${p.y}`).join(" ")} 
          fill={polygonFill}
          stroke={polygonStroke}
          strokeWidth="2"
          filter="url(#glow)"
          className="radar-area"
        />

        {/* Pontos nos vértices do radar com efeito de halo */}
        {points.map((point, i) => (
          <g key={i} className="radar-point-group">
            <circle 
              cx={point.x} 
              cy={point.y} 
              r="8" 
              fill="url(#point-gradient)"
              stroke="white"
              strokeWidth="2"
              className="radar-point"
            />
            <circle 
              cx={point.x} 
              cy={point.y} 
              r="12" 
              fill={pointHaloColor}
              opacity="0.3"
              className="radar-point-halo"
            />
          </g>
        ))}

        {/* Rótulos dos eixos com valores numéricos */}
        {safeLabels.map((label, i) => {
          const a = angle(i);
          const labelRadius = radius + 45;
          const lx = cx + labelRadius * Math.cos(a);
          const ly = cy + labelRadius * Math.sin(a);
          
          let textAnchor = "middle";
          if (Math.cos(a) > 0.1) textAnchor = "start";
          if (Math.cos(a) < -0.1) textAnchor = "end";
          
          let baseline = "middle";
          if (Math.sin(a) < -0.1) baseline = "hanging";
          if (Math.sin(a) > 0.1) baseline = "baseline";
          
          return (
            <g key={i} className="radar-label-group">
              <text 
                x={lx} 
                y={ly} 
                fontSize="13" 
                textAnchor={textAnchor}
                dominantBaseline={baseline}
                fill={labelColor}
                fontWeight="600"
                className="radar-label"
              >
                {label}
              </text>
              <text 
                x={lx} 
                y={ly + 18} 
                fontSize="11" 
                textAnchor={textAnchor}
                dominantBaseline={baseline}
                fill="#3b82f6"
                fontWeight="700"
                className="radar-value"
              >
                {points[i].value.toFixed(1)}/10
              </text>
            </g>
          );
        })}

        {/* Marcadores de escala (0, 5, 10) */}
        <text x={cx} y={cy - radius - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">10</text>
        <text x={cx} y={cy - radius/2} textAnchor="middle" fontSize="10" fill="#9ca3af">5</text>
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="10" fill="#9ca3af">0</text>
      </svg>
    </div>
  );
}