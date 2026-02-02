// projectspanel.js - VERSÃO SIMPLIFICADA E FUNCIONAL
import React, { useState, useEffect } from "react";
import "../../style.css";

// Projetos fictícios para demonstração
const FICTIONAL_PROJECTS = {
  "Projeto 1": {
    name: "Projeto 1",
    client: "Cliente A",
    status: "Em andamento",
    peopleCount: "8 membros",
    criteria: [
      { id: 'nps', name: 'NPS do Profissional', weight: 30, description: 'Satisfação média de clientes anteriores' },
      { id: 'experience', name: 'Experiência na Área', weight: 25, description: 'Anos de experiência no setor do projeto' },
      { id: 'technical_skill', name: 'Habilidade Técnica', weight: 20, description: 'Avaliação em habilidades específicas' },
      { id: 'availability', name: 'Disponibilidade', weight: 15, description: 'Capacidade de dedicação ao projeto' },
      { id: 'cultural_fit', name: 'Fit Cultural', weight: 10, description: 'Adequação à cultura do cliente' }
    ]
  },
  "Projeto 2": {
    name: "Projeto 2",
    client: "Cliente B",
    status: "Planejamento",
    peopleCount: "5 membros",
    criteria: [
      { id: 'nps', name: 'NPS do Profissional', weight: 30, description: 'Satisfação média de clientes anteriores' },
      { id: 'experience', name: 'Experiência na Área', weight: 25, description: 'Anos de experiência no setor do projeto' },
      { id: 'technical_skill', name: 'Habilidade Técnica', weight: 20, description: 'Avaliação em habilidades específicas' },
      { id: 'availability', name: 'Disponibilidade', weight: 15, description: 'Capacidade de dedicação ao projeto' },
      { id: 'cultural_fit', name: 'Fit Cultural', weight: 10, description: 'Adequação à cultura do cliente' }
    ]
  },
  "Projeto 3": {
    name: "Projeto 3",
    client: "Cliente C",
    status: "Concluído",
    peopleCount: "12 membros",
    criteria: [
      { id: 'nps', name: 'NPS do Profissional', weight: 30, description: 'Satisfação média de clientes anteriores' },
      { id: 'experience', name: 'Experiência na Área', weight: 25, description: 'Anos de experiência no setor do projeto' },
      { id: 'technical_skill', name: 'Habilidade Técnica', weight: 20, description: 'Avaliação em habilidades específicas' },
      { id: 'availability', name: 'Disponibilidade', weight: 15, description: 'Capacidade de dedicação ao projeto' },
      { id: 'cultural_fit', name: 'Fit Cultural', weight: 10, description: 'Adequação à cultura do cliente' }
    ]
  }
};

export default function ProjectsPanel({
  selectedProject,
  onSelectProject = () => {},
  projects = [],
  projectInfo = null,
}) {
  const [open, setOpen] = useState(false);
  const [criteria, setCriteria] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [editingCriterionId, setEditingCriterionId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Combine projetos fictícios com projetos reais
  const allProjects = ["Projeto 1", "Projeto 2", "Projeto 3", ...projects.filter(p => !["Projeto 1", "Projeto 2", "Projeto 3"].includes(p))];

  // Carregar critérios quando o projeto muda
  useEffect(() => {
    if (selectedProject && FICTIONAL_PROJECTS[selectedProject]) {
      setCriteria(FICTIONAL_PROJECTS[selectedProject].criteria);
      calculateTotal(FICTIONAL_PROJECTS[selectedProject].criteria);
    } else if (selectedProject) {
      const defaultCriteria = [
        { id: 'nps', name: 'NPS do Profissional', weight: 30, description: 'Satisfação média de clientes anteriores' },
        { id: 'experience', name: 'Experiência na Área', weight: 25, description: 'Anos de experiência no setor do projeto' },
        { id: 'technical_skill', name: 'Habilidade Técnica', weight: 20, description: 'Avaliação em habilidades específicas' },
        { id: 'availability', name: 'Disponibilidade', weight: 15, description: 'Capacidade de dedicação ao projeto' },
        { id: 'cultural_fit', name: 'Fit Cultural', weight: 10, description: 'Adequação à cultura do cliente' }
      ];
      setCriteria(defaultCriteria);
      calculateTotal(defaultCriteria);
    } else {
      // Modo "Todos os Projetos" - limpa os critérios
      setCriteria([]);
      setTotalWeight(0);
    }
  }, [selectedProject]);

  const calculateTotal = (criteriaList) => {
    const total = criteriaList.reduce((sum, criterion) => sum + criterion.weight, 0);
    setTotalWeight(total);
  };

  const handleWeightChange = (id, value) => {
    const updatedCriteria = criteria.map(criterion => 
      criterion.id === id ? { ...criterion, weight: parseInt(value) || 0 } : criterion
    );
    setCriteria(updatedCriteria);
    calculateTotal(updatedCriteria);
    
    if (selectedProject && FICTIONAL_PROJECTS[selectedProject]) {
      FICTIONAL_PROJECTS[selectedProject].criteria = updatedCriteria;
    }
  };

  const handleSaveWeights = () => {
    console.log('Salvando pesos para:', selectedProject, criteria);
    alert(`Pesos salvos para ${selectedProject}! O ranking será recalculado.`);
  };

  const handleResetWeights = () => {
    const defaultCriteria = [
      { id: 'nps', name: 'NPS do Profissional', weight: 30, description: 'Satisfação média de clientes anteriores' },
      { id: 'experience', name: 'Experiência na Área', weight: 25, description: 'Anos de experiência no setor do projeto' },
      { id: 'technical_skill', name: 'Habilidade Técnica', weight: 20, description: 'Avaliação em habilidades específicas' },
      { id: 'availability', name: 'Disponibilidade', weight: 15, description: 'Capacidade de dedicação ao projeto' },
      { id: 'cultural_fit', name: 'Fit Cultural', weight: 10, description: 'Adequação à cultura do cliente' }
    ];
    
    setCriteria(defaultCriteria);
    calculateTotal(defaultCriteria);
    
    if (selectedProject && FICTIONAL_PROJECTS[selectedProject]) {
      FICTIONAL_PROJECTS[selectedProject].criteria = defaultCriteria;
    }
  };

  // Funções para edição por clique
  const handleWeightClick = (criterionId, currentWeight) => {
    setEditingCriterionId(criterionId);
    setEditValue(currentWeight.toString());
  };

  const handleEditBlur = () => {
    if (editingCriterionId) {
      handleWeightChange(editingCriterionId, editValue);
      setEditingCriterionId(null);
      setEditValue('');
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditBlur();
    }
  };

  const renderCriteriaControls = () => {
    if (!selectedProject) return null;

    const projectData = FICTIONAL_PROJECTS[selectedProject] || {
      name: selectedProject,
      client: projectInfo?.client || "Cliente Desconhecido",
      status: projectInfo?.status || "Status Desconhecido",
      peopleCount: projectInfo?.peopleCount || "N/A"
    };

    return (
      <div className="ranking-config-panel">
        <div className="project-badge">
          <span className="project-tag">{projectData.status}</span>
          <span className="project-client">{projectData.client}</span>
        </div>
        
        <h3>Critérios de Ranking - {selectedProject}</h3>
        <p className="config-description">
          Ajuste a importância de cada critério para este projeto específico.
        </p>
        
        <div className="criteria-list">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="criterion-item">
              <div className="criterion-header">
                <span className="criterion-name">{criterion.name}</span>
                {editingCriterionId === criterion.id ? (
                  <div className="criterion-weight-edit">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleEditBlur}
                      onKeyDown={handleEditKeyDown}
                      autoFocus
                      className="weight-input"
                    />
                    <span>%</span>
                  </div>
                ) : (
                  <span 
                    className="criterion-weight clickable" 
                    onClick={() => handleWeightClick(criterion.id, criterion.weight)}
                    title="Clique para editar"
                  >
                    {criterion.weight}%
                  </span>
                )}
              </div>
              
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criterion.weight}
                  onChange={(e) => handleWeightChange(criterion.id, e.target.value)}
                  className="weight-slider"
                />
                <div className="slider-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="criterion-description">{criterion.description}</div>
            </div>
          ))}
        </div>
        
        <div className={`total-panel ${totalWeight === 100 ? 'valid' : 'invalid'}`}>
          <div className="total-left">
            <span>Soma dos pesos:</span>
            <span className="total-value">{totalWeight}%</span>
          </div>
          <span className="total-status">
            {totalWeight === 100 ? '✅ Pronto para calcular ranking' : `⚠️ Ajuste os pesos para totalizar 100%`}
          </span>
        </div>
        
        <div className="config-actions">
          <button className="btn-reset" onClick={handleResetWeights}>
            Restaurar Padrões
          </button>
          <button 
            className="btn-save" 
            onClick={handleSaveWeights}
            disabled={totalWeight !== 100}
          >
            Atualizar Ranking
          </button>
        </div>
      </div>
    );
  };

  const renderWelcomeBox = () => {
    if (selectedProject) return null;
    
    return (
      <div className="project-big-box">
        <h3>Dashboard de Alocações</h3>
        <p>
          Selecione um projeto para configurar seus critérios de ranking específicos.
          Cada projeto pode ter pesos diferentes para NPS, Experiência e outras métricas.
        </p>
        <div className="projects-help">
          <h4>Como funciona:</h4>
          <ul>
            <li><strong>📊 Modo Geral</strong>: Com "Todos os projetos", veja todos os membros em ordem alfabética</li>
            <li><strong>⚙️ Modo Projeto</strong>: Selecione um projeto para configurar critérios específicos</li>
            <li><strong>👥 Rankings</strong>: O sistema ranqueia os melhores profissionais baseado nos pesos configurados</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="projects-panel">
      <div className="projects-header" onClick={() => setOpen((s) => !s)}>
        <div className="projects-header-title">
          <span className="project-icon">📁</span>
          {selectedProject || "Todos os Projetos"}
          {selectedProject && (
            <span className="project-count">
              {FICTIONAL_PROJECTS[selectedProject]?.peopleCount || projectInfo?.peopleCount || ""}
            </span>
          )}
        </div>
        <button className="projects-toggle">
          {open ? "▲" : "▼"}
        </button>
      </div>

      {open && (
        <div className="projects-dropdown">
          <div
            className={`project-dropdown-item ${!selectedProject ? "active" : ""}`}
            onClick={() => { onSelectProject(null); setOpen(false); }}
          >
            <span className="dropdown-project-icon">📂</span>
            <div className="dropdown-project-info">
              <div className="dropdown-project-name">Todos os projetos</div>
              <div className="dropdown-project-meta">
                Visualização geral • {allProjects.length} projetos
              </div>
            </div>
          </div>

          {allProjects.map((projectName, i) => (
            <div
              key={i}
              className={`project-dropdown-item ${projectName === selectedProject ? "active" : ""}`}
              onClick={() => { onSelectProject(projectName); setOpen(false); }}
            >
              <span className="dropdown-project-icon">📂</span>
              <div className="dropdown-project-info">
                <div className="dropdown-project-name">{projectName}</div>
                <div className="dropdown-project-meta">
                  {FICTIONAL_PROJECTS[projectName]?.client || "Cliente"} • {FICTIONAL_PROJECTS[projectName]?.status || "Status"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="project-info">
        {selectedProject ? renderCriteriaControls() : renderWelcomeBox()}
      </div>
    </div>
  );
}