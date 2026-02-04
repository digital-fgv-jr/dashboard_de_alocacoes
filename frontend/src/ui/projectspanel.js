// projectspanel.js - VERSÃO PROFISSIONAL ORIGINAL
import React, { useState, useEffect } from "react";
import "../../style.css";

export default function ProjectsPanel({
  selectedProject,
  onSelectProject = () => {},
  projects = [],
  projectInfo = null,
}) {
  const [open, setOpen] = useState(false);
  const [criteria, setCriteria] = useState([
    { id: 'nps', name: 'NPS do Profissional', weight: 30, description: 'Satisfação média de clientes anteriores' },
    { id: 'experience', name: 'Experiência na Área', weight: 25, description: 'Anos de experiência no setor do projeto' },
    { id: 'technical', name: 'Avaliação 120', weight: 20, description: 'Avaliação de 120 horas do membro' },
    { id: 'availability', name: 'Disponibilidade', weight: 15, description: 'Capacidade de dedicação ao projeto' },
    { id: 'cultural', name: 'Preferencia', weight: 10, description: 'Preferência do cliente pelo profissional' }
  ]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [totalWeight, setTotalWeight] = useState(100);

  // Combine projetos fictícios com projetos reais
  const allProjects = ["Projeto 1", "Projeto 2", "Projeto 3", ...projects.filter(p => !["Projeto 1", "Projeto 2", "Projeto 3"].includes(p))];

  // Calcular peso total sempre que criteria mudar
  useEffect(() => {
    const total = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    setTotalWeight(total);
  }, [criteria]);

  const handleWeightChange = (id, newWeight) => {
    const weight = Math.max(0, Math.min(100, parseInt(newWeight) || 0));
    setCriteria(prev => prev.map(criterion => 
      criterion.id === id ? { ...criterion, weight } : criterion
    ));
  };

  const handleSliderChange = (id, value) => {
    handleWeightChange(id, parseInt(value));
  };

  const handleInputClick = (id, currentWeight) => {
    setEditingId(id);
    setEditValue(currentWeight.toString());
  };

  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (editingId && editValue !== '') {
      handleWeightChange(editingId, editValue);
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const handleResetWeights = () => {
    setCriteria([
      { id: 'nps', name: 'NPS do Profissional', weight: 30, description: 'Satisfação média de clientes anteriores' },
      { id: 'experience', name: 'Experiência na Área', weight: 25, description: 'Anos de experiência no setor do projeto' },
      { id: 'technical', name: 'Avaliação 120', weight: 20, description: 'Avaliação de 120 horas do membro' },
      { id: 'availability', name: 'Disponibilidade', weight: 15, description: 'Capacidade de dedicação ao projeto' },
      { id: 'cultural', name: 'Preferencia', weight: 10, description: 'Preferência do cliente pelo profissional' }
    ]);
  };

  const handleSaveWeights = () => {
    if (totalWeight === 100) {
      console.log('Pesos salvos:', criteria);
      alert(`Pesos salvos para ${selectedProject}! O ranking será recalculado.`);
      // Aqui você pode adicionar a lógica para recalcular o ranking
    }
  };

  const renderCriteriaControls = () => {
    if (!selectedProject) return null;

    const projectData = selectedProject === "Projeto 1" 
      ? { status: "Em andamento", client: "Cliente A", members: "8 membros" }
      : selectedProject === "Projeto 2"
      ? { status: "Planejamento", client: "Cliente B", members: "5 membros" }
      : selectedProject === "Projeto 3"
      ? { status: "Concluído", client: "Cliente C", members: "12 membros" }
      : { status: projectInfo?.status || "Status", client: projectInfo?.client || "Cliente", members: projectInfo?.peopleCount || "membros" };

    return (
      <>
        <div className="project-header-info">
          <div className="project-badge">
            <span className="project-status">{projectData.status}</span>
            <span className="project-client">{projectData.client}</span>
            <span className="project-members">{projectData.members}</span>
          </div>
          <h2 className="project-title">{selectedProject}</h2>
        </div>

        <div className="criteria-controls-section">
          <div className="section-header">
            <h3 className="section-title">Critérios de Ranking</h3>
            <p className="section-subtitle">
              Ajuste a importância de cada critério para este projeto específico.
            </p>
          </div>
          
          <div className="criteria-grid">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="criterion-card">
                <div className="criterion-header">
                  <h4 className="criterion-name">{criterion.name}</h4>
                  <div className="weight-control">
                    {editingId === criterion.id ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        className="weight-input-editable"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="weight-display"
                        onClick={() => handleInputClick(criterion.id, criterion.weight)}
                        title="Clique para editar"
                      >
                        <span className="weight-value">{criterion.weight}</span>
                        <span className="weight-unit">%</span>
                        <span className="edit-icon">✏️</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={criterion.weight}
                    onChange={(e) => handleSliderChange(criterion.id, e.target.value)}
                    className="weight-slider"
                  />
                  <div className="slider-scale">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>
                
                <p className="criterion-description">{criterion.description}</p>
              </div>
            ))}
          </div>
          
          <div className={`total-panel ${totalWeight === 100 ? 'valid' : 'invalid'}`}>
            <div className="total-info">
              <span className="total-label">Soma total dos pesos:</span>
              <span className="total-value">{totalWeight}%</span>
            </div>
            <div className="total-status">
              {totalWeight === 100 ? (
                <span className="status-valid">✅ Pronto para calcular ranking</span>
              ) : (
                <span className="status-invalid">❌ Ajuste os pesos para totalizar 100%</span>
              )}
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="btn-secondary" onClick={handleResetWeights}>
              <span className="btn-icon">↺</span>
              Restaurar Padrões
            </button>
            <button 
              className={`btn-primary ${totalWeight !== 100 ? 'disabled' : ''}`}
              onClick={handleSaveWeights}
              disabled={totalWeight !== 100}
            >
              <span className="btn-icon">📊</span>
              Atualizar Ranking
            </button>
          </div>
        </div>
      </>
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
        <div className="help-tips">
          <h4>Como configurar:</h4>
          <ul>
            <li><strong>Clique nas porcentagens</strong> para editar valores exatos</li>
            <li><strong>Arraste os sliders</strong> para ajustar visualmente</li>
            <li><strong>A soma deve ser 100%</strong> para gerar o ranking</li>
            <li><strong>Clique em "Atualizar Ranking"</strong> para recalcular</li>
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
              {selectedProject === "Projeto 1" ? "8 membros" : 
               selectedProject === "Projeto 2" ? "5 membros" : 
               selectedProject === "Projeto 3" ? "12 membros" : 
               projectInfo?.peopleCount || ""}
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
                  {projectName === "Projeto 1" && "Cliente A • Em andamento"}
                  {projectName === "Projeto 2" && "Cliente B • Planejamento"}
                  {projectName === "Projeto 3" && "Cliente C • Concluído"}
                  {!["Projeto 1", "Projeto 2", "Projeto 3"].includes(projectName) && "Cliente • Status"}
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