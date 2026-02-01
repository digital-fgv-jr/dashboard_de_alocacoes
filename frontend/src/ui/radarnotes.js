import "../../style.css";

export default function RadarNotes() {
  // placeholder SVG small radar-like graphic
  return (
    <div className="radar-card">
      <div className="radar-header">Notas do Consultor...</div>
      <div className="radar-body">
        <svg width="200" height="160" viewBox="0 0 200 160" aria-hidden>
          <polygon points="100,20 140,70 120,120 80,120 60,70" fill="#e6eefc" stroke="#cbd5e1" />
          <polygon points="100,40 132,78 116,110 84,110 68,78" fill="#cfe8ff" stroke="#a3bffa" />
        </svg>
      </div>
    </div>
  );
}
