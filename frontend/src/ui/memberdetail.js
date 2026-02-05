import React from "react";
import "../../style.css";
import RadarNotes from "./radarnotes";

export default function MemberDetail({ person, onBack }) {
  if (!person) return null;

  const { name, role, description, photoUrl, alocacoes, id, radar } = person;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button onClick={() => onBack && onBack()} className="back-button">← Voltar</button>
        <h2 className="detail-title">{name}</h2>
      </div>

      <div className="detail-body">
        <div className="detail-left">
          <div className="detail-photo">
            {photoUrl ? <img src={photoUrl} alt={name} /> : <div className="no-photo">Sem foto</div>}
          </div>

          <div className="detail-desc">
            <h3>Descrição</h3>
            <div>{description || "Sem descrição."}</div>
          </div>

          <div className="meta-card">
            <p><strong>Alocações:</strong> {alocacoes ?? 0}</p>
            <p><strong>ID:</strong> {id}</p>
          </div>
        </div>

        <div className="detail-right">
          <h3>Competências</h3>
          {radar && radar.values && radar.values.length > 0 ? (
            <RadarNotes values={radar.values} labels={radar.labels} />
          ) : (
            <div>Sem métricas para exibir</div>
          )}
        </div>
      </div>
    </div>
  );
}
