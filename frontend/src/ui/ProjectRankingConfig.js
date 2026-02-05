// ProjectRankingConfig.js
import React, { useState, useEffect } from "react";

export default function ProjectRankingConfig({ projectId, criteria: initialCriteria, onWeightsChange }) {
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

  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  const map_pesos = useMemo(() =>{
    const total = criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0) || 1;
    const peso = {};
    for (const c of criteria){
      m[c.id] = (Number(c.weight) || 0) / total
    }
    return peso;
  }, [criteria])

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

    onWeightsChange?.(obj);
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
      <h3>Configurar Critérios de Ranking para o Projeto</h3>
      <p className="config-description">
        Ajuste a importância de cada critério para este projeto específico. Os pesos serão usados pelo backend para calcular o ranking.
      </p>

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

      <div className="total-panel">
        <span>Soma dos pesos:</span>
        <span className={`total-weight ${totalWeight === 100 ? 'valid' : 'invalid'}`}>
          {totalWeight}%
        </span>
        <span className="total-status">
          {totalWeight === 100 ? '✅ Distribuição válida' : `⚠️ A soma deve ser 100% (faltam ${100 - totalWeight}%)`}
        </span>
      </div>

      <div className="config-actions">
        <button className="btn-reset" onClick={handleReset}>Restaurar Padrões</button>
        <button className="btn-save" onClick={handleSave} disabled={totalWeight !== 100}>
          Salvar Pesos para Este Projeto
        </button>
      </div>
    </div>
  );
}