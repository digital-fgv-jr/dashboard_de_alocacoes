import React from "react";
import "../../style.css";
import RadarNotes from "./radarnotes";

export default function MemberDetail({ person, onBack }) {
  if (!person) return null;

  const { name, role, description, photoUrl, alocacoes, id, radar } = person;

  // Calcular nota geral (média dos valores do radar)
  let overallScore = 0;
  if (radar && radar.values && radar.values.length > 0) {
    const sum = radar.values.reduce((a, b) => a + b, 0);
    overallScore = sum / radar.values.length;
  }

  return (
    <div className="bottom-section">
      {/* Painel de Perfil e Notas (Esquerda) */}
      <div className="profile-panel">
        {/* Header com botão Voltar e Avatar */}
        <div className="profile-header-with-back">
          <button className="back-button" onClick={onBack}>
            ← Voltar para Alocações
          </button>
          <div className="profile-avatar">
            {photoUrl ? (
              <img src={photoUrl} alt={name} />
            ) : (
              <span>{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="profile-info">
          <h2 className="profile-name">{name}</h2>
          <span className="profile-role">{role}</span>
        </div>

        <div className="profile-meta">
          <div className="meta-item">
            <strong>Alocações:</strong> {alocacoes || 0}
          </div>
          <div className="meta-item">
            <strong>ID:</strong> {id}
          </div>
        </div>

        {/* Critérios de Avaliação */}
        <div className="consultant-notes">
          <h3 className="notes-title">Critérios de Avaliação</h3>
          <div className="notes-grid">
            {radar && radar.labels && radar.labels.map((label, index) => {
              const value = radar.values[index] || 0;
              // Usar letras para cada critério (A, B, C, D, E)
              const letter = String.fromCharCode(65 + index); // A = 65
              
              return (
                <div key={index} className="note-item">
                  <div className="note-letter">{letter}</div>
                  <div className="note-label">{label}</div>
                  <div className="note-value">{value.toFixed(1)}/10</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Painel de Critérios (Direita) */}
      <div className="competencies-panel">
        <div className="competencies-header">
          <h2 className="competencies-title">Perfil de Critérios</h2>
          <div className="overall-score">
            <span className="score-icon">★</span>
            <span>{overallScore.toFixed(1)}</span>
          </div>
        </div>

        {/* Radar ou Placeholder */}
        <div className="radar-container">
          {radar && radar.values && radar.values.length > 0 ? (
            <div className="radar-wrapper">
              <RadarNotes 
                values={radar.values} 
                labels={radar.labels} 
              />
            </div>
          ) : (
            <div className="radar-placeholder">
              <div className="placeholder-icon">📊</div>
              <div>Sem métricas de critérios disponíveis</div>
              <small>Adicione dados de avaliação para visualizar o gráfico</small>
            </div>
          )}
        </div>

        {/* Métricas Detalhadas */}
        <div className="metrics-grid">
          {radar && radar.labels && radar.labels.map((label, index) => {
            const value = radar.values[index] || 0;
            const percentage = (value / 10) * 100;
            
            // Cores diferentes para cada critério
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
            const color = colors[index % colors.length];
            
            return (
              <div key={index} className="metric-card">
                <div className="metric-header">
                  <span className="metric-name">{label}</span>
                  <span className="metric-value">{value.toFixed(1)}/10</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-progress" 
                    style={{ 
                      width: `${percentage}%`,
                      background: color 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}