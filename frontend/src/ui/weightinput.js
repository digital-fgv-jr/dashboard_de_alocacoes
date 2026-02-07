import React, { useState, useEffect, useMemo } from "react";

export default function ProjectRankingConfig({
  projectId,
  macro,
  criteria: initialCriteria,
  onWeightsChange,
  area,
  onAreaChange,
  }) {

  // Se não forem fornecidos critérios, usamos exemplos
  const [criteria, setCriteria] = useState(
    initialCriteria || [
      { id: 'nps', name: 'NPS do Consultor', weight: 30, description: 'Satisfação média dos clientes anteriores' },
      { id: 'experience', name: 'Experiência na Área', weight: 25, description: 'Número de projetos completos no setor do projeto' },
      { id: 'preferencia', name: 'Preferência', weight: 20, description: 'Avaliação técnica específica' },
      { id: 'availability', name: 'Disponibilidade', weight: 15, description: 'Capacidade de dedicação ao projeto' },
      { id: 'av_120', name: 'Avaliação 120°', weight: 5, description: 'Média final da avaliação 120 rodada' },
      { id: 'qap', name: 'Eficiência', weight: 5, description: 'Média dos QAPs dos projetos realizados'},

    ]
  );

  useEffect(() => {
    if (initialCriteria) setCriteria(initialCriteria);
  }, [initialCriteria, area, projectId]);


  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  const map_pesos = useMemo(() => {
    const total =
      criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0) || 1;

    const peso = {};

    for (const c of criteria) {
      peso[c.id] = (Number(c.weight) || 0) / total;
    }

    return peso;
  }, [criteria]);



  const handleWeightChange = (id, newWeight) => {
    setCriteria(prev =>
      prev.map(criterion =>
        criterion.id === id ? { ...criterion, weight: newWeight } : criterion
      )
    );
  };

  const handleSave = () => {
    if (totalWeight !== 100) return;

      const obj = Object.fromEntries(
        (criteria || []).map(c => [c.id, (Number(c.weight) || 0) / 100])
      );

    onWeightsChange?.(area, obj);
  };

  const handleReset = () => {
    // Restaurar os pesos padrão (inicialCriteria)
    if (initialCriteria) {
      setCriteria(initialCriteria);
    } else {
      setCriteria([
        { id: 'nps', name: 'NPS do Consultor', weight: 30, description: 'Satisfação média dos clientes anteriores' },
        { id: 'experience', name: 'Experiência na Área', weight: 25, description: 'Anos de experiência no setor do projeto' },
        { id: 'skill_match', name: 'Habilidade Técnica', weight: 20, description: 'Avaliação técnica específica' },
        { id: 'availability', name: 'Disponibilidade', weight: 15, description: 'Capacidade de dedicação ao projeto' },
        { id: 'cultural_fit', name: 'Fit Cultural', weight: 10, description: 'Adequação à cultura do cliente' },
      ]);
    }
  };

  return (
    <div className="project-ranking-config">
      <div className="ranking-header">
        <div className="ranking-project">
          <div className="ranking-project-name">{projectId}</div>
          <div className="ranking-project-macro">MACROETAPA • {macro || "-"}</div>
        </div>
      </div>

      <h3 className="ranking-title">Critérios de Ranking</h3>
      <p className="ranking-subtitle">
        Ajuste a importância de cada critério para este projeto específico. Os pesos podem ser diferentes para cada área.
      </p>

      <div className="area-selector-container">
        <div className="area-selector-header">
          <div className="selector-title">
            <span className="selector-icon">🎯</span>
            <h4 className="selector-text"><strong>Editar pesos para:</strong></h4>
          </div>
        </div>

        <div className="area-buttons-grid">
          <button
            type="button"
            className={`area-button ${area === "consultores" ? "selected" : ""}`}
            onClick={() => onAreaChange?.("consultores")}
          >
            <span className="area-button-icon">🧑‍💼</span>
            <span className="area-button-label">Consultores</span>
          </button>

          <button
            type="button"
            className={`area-button ${area === "gerentes" ? "selected" : ""}`}
            onClick={() => onAreaChange?.("gerentes")}
          >
            <span className="area-button-icon">👔</span>
            <span className="area-button-label">Gerentes</span>
          </button>

          <button
            type="button"
            className={`area-button ${area === "madrinhas" ? "selected" : ""}`}
            onClick={() => onAreaChange?.("madrinhas")}
          >
            <span className="area-button-icon">👩‍💼</span>
            <span className="area-button-label">Madrinhas</span>
          </button>
        </div>
      </div>



      <div className="criteria-list">
        {criteria.map(criterion => (
          <div key={criterion.id} className="criterion-item">
            <div className="criterion-header">
              <span className="criterion-name">{criterion.name}</span>
              <span className="criterion-weight">{criterion.weight}%</span>
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={criterion.weight}
                onChange={(e) => {
                  const valor = Number(e.target.value)
                  handleWeightChange(criterion.id, Number.isFinite(valor) ? valor : 0)}}
                className="weight-slider"
              />
            </div>
            <div className="criterion-description">{criterion.description}</div>
          </div>
        ))}
      </div>

      {/* ✅ Painel de soma (igual ao mock) */}
      <div className={`total-panel ${totalWeight === 100 ? "valid" : "invalid"}`}>
        <div className="total-info">
          <div className="total-label">Soma total dos pesos:</div>
          <div className="total-value">{totalWeight}%</div>
              </div>

        <div className={`total-status ${totalWeight === 100 ? "status-valid" : "status-invalid"}`}>
          <span className="total-status-icon">{totalWeight === 100 ? "✅" : "⚠️"}</span>
          <span>
            {totalWeight === 100
              ? "Pronto para calcular ranking"
              : `A soma deve ser 100% (faltam ${100 - totalWeight}%)`}
          </span>
        </div>
      </div>

      {/* ✅ Botões (igual ao mock) */}
      <div className="action-buttons">
        <button type="button" className="btn-secondary" onClick={handleReset}>
          <span className="btn-icon">↺</span>
          Restaurar Padrões
        </button>

        <button
          type="button"
          className={`btn-primary ${totalWeight !== 100 ? "disabled" : ""}`}
          onClick={handleSave}
          disabled={totalWeight !== 100}
        >
          <span className="btn-icon">📊</span>
          Atualizar Ranking
        </button>
      </div>
    </div>
  )
}
