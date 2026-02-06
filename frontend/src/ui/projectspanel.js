import React, { useState, useEffect } from "react";
import "../../style.css";

// Painel de projetos com configuração de critérios de ranking
export default function ProjectsPanel({
  selectedProject,
  onSelectProject = () => {},
  projects = [],
  projectInfo = null,
}) {
  // Estado de controle do dropdown
  const [open, setOpen] = useState(false);
  
  // Configuração dos pesos por área (consultores, gerentes, madrinhas)
  const [weightsByArea, setWeightsByArea] = useState({
    consultores: [
      { id: 'nps', name: 'NPS do Profissional', weight: 25 },
      { id: 'experience', name: 'Experiência na Área', weight: 20 },
      { id: 'technical', name: 'Avaliação 120°', weight: 20 },
      { id: 'availability', name: 'Disponibilidade', weight: 15 },
      { id: 'cultural', name: 'Preferência', weight: 10 },
      { id: 'qap', name: 'QAP', weight: 10 }
    ],
    gerentes: [
      { id: 'nps', name: 'NPS do Profissional', weight: 20 },
      { id: 'experience', name: 'Experiência na Área', weight: 25 },
      { id: 'technical', name: 'Avaliação 120°', weight: 15 },
      { id: 'availability', name: 'Disponibilidade', weight: 15 },
      { id: 'cultural', name: 'Preferência', weight: 15 },
      { id: 'qap', name: 'QAP', weight: 10 }
    ],
    madrinhas: [
      { id: 'nps', name: 'NPS do Profissional', weight: 15 },
      { id: 'experience', name: 'Experiência na Área', weight: 15 },
      { id: 'technical', name: 'Avaliação 120°', weight: 20 },
      { id: 'availability', name: 'Disponibilidade', weight: 20 },
      { id: 'cultural', name: 'Preferência', weight: 20 },
      { id: 'qap', name: 'QAP', weight: 10 }
    ]
  });
  
  // Estados para controle da edição de pesos
  const [selectedArea, setSelectedArea] = useState('consultores');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [totalWeight, setTotalWeight] = useState(100);

  // Lista completa de projetos (incluindo exemplos)
  const allProjects = ["Projeto 1", "Projeto 2", "Projeto 3", ...projects.filter(p => !["Projeto 1", "Projeto 2", "Projeto 3"].includes(p))];

  // Critérios atuais baseados na área selecionada
  const currentCriteria = weightsByArea[selectedArea];

  // Atualização do peso total sempre que os critérios mudam
  useEffect(() => {
    const total = currentCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    setTotalWeight(total);
  }, [currentCriteria]);

  // Manipulação da alteração de pesos
  const handleWeightChange = (id, newWeight) => {
    const weight = Math.max(0, Math.min(100, parseInt(newWeight) || 0));
    
    setWeightsByArea(prev => ({
      ...prev,
      [selectedArea]: prev[selectedArea].map(criterion => 
        criterion.id === id ? { ...criterion, weight } : criterion
      )
    }));
  };

  const handleSliderChange = (id, value) => {
    handleWeightChange(id, parseInt(value));
  };

  // Controles para edição direta dos valores
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

  // Restauração dos pesos padrão para a área atual
  const handleResetWeights = () => {
    const defaultWeights = {
      consultores: [
        { id: 'nps', name: 'NPS do Profissional', weight: 25 },
        { id: 'experience', name: 'Experiência na Área', weight: 20 },
        { id: 'technical', name: 'Avaliação 120°', weight: 20 },
        { id: 'availability', name: 'Disponibilidade', weight: 15 },
        { id: 'cultural', name: 'Preferência', weight: 10 },
        { id: 'qap', name: 'QAP', weight: 10 }
      ],
      gerentes: [
        { id: 'nps', name: 'NPS do Profissional', weight: 20 },
        { id: 'experience', name: 'Experiência na Área', weight: 25 },
        { id: 'technical', name: 'Avaliação 120°', weight: 15 },
        { id: 'availability', name: 'Disponibilidade', weight: 15 },
        { id: 'cultural', name: 'Preferência', weight: 15 },
        { id: 'qap', name: 'QAP', weight: 10 }
      ],
      madrinhas: [
        { id: 'nps', name: 'NPS do Profissional', weight: 15 },
        { id: 'experience', name: 'Experiência na Área', weight: 15 },
        { id: 'technical', name: 'Avaliação 120°', weight: 20 },
        { id: 'availability', name: 'Disponibilidade', weight: 20 },
        { id: 'cultural', name: 'Preferência', weight: 20 },
        { id: 'qap', name: 'QAP', weight: 10 }
      ]
    };
    
    setWeightsByArea(prev => ({
      ...prev,
      [selectedArea]: [...defaultWeights[selectedArea]]
    }));
  };

  // Salvamento dos pesos configurados
  const handleSaveWeights = () => {
    if (totalWeight === 100) {
      console.log(`Pesos salvos para ${selectedProject} - ${selectedArea}:`, currentCriteria);
      alert(`Pesos salvos para ${selectedProject} - ${selectedArea}! O ranking será recalculado.`);
    }
  };

  // Renderização do seletor de área
  const renderAreaSelector = () => {
    const areas = [
      { id: 'consultores', label: 'Consultores', icon: '👨‍💼' },
      { id: 'gerentes', label: 'Gerentes', icon: '👔' },
      { id: 'madrinhas', label: 'Madrinhas', icon: '👩‍💼' }
    ];

    return (
      <div className="area-selector-container">
        <div className="area-selector-header">
          <div className="selector-title">
            <span className="selector-icon">🎯</span>
            <h4>Editar pesos para:</h4>
          </div>
        </div>
        
        <div className="area-buttons-grid">
          {areas.map(area => (
            <button
              key={area.id}
              className={`area-button ${selectedArea === area.id ? 'selected' : ''}`}
              onClick={() => setSelectedArea(area.id)}
            >
              <span className="area-button-icon">{area.icon}</span>
              <span className="area-button-label">{area.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Renderização dos controles de critérios
  const renderCriteriaControls = () => {
    if (!selectedProject) return null;

    // Determinação da macroetapa específica para cada projeto
    const getMacroEtapaForProject = (projectName) => {
      switch(projectName) {
        case "Projeto 1":
          return "Plano de Negócios";
        case "Projeto 2":
          return "Plano Financeiro";
        case "Projeto 3":
          return "Pesquisa de Mercado";
        default:
          return projectInfo?.macroEtapa || "Avaliação Estratégica";
      }
    };

    const macroEtapa = getMacroEtapaForProject(selectedProject);

    return (
      <>
        <div className="project-header-info">
          <h2 className="project-title">{selectedProject}</h2>
          
          {/* Exibição da macroetapa do projeto */}
          <div className="macroetapa-simple">
            <div className="macroetapa-header-simple">
              <div className="macroetapa-icon-simple">📊</div>
              <div>
                <div className="macroetapa-label-simple">MACROETAPA</div>
                <div className="macroetapa-value-simple">{macroEtapa}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="criteria-controls-section">
          <div className="section-header">
            <h3 className="section-title">Critérios de Ranking</h3>
            <p className="section-subtitle">
              Ajuste a importância de cada critério para este projeto específico.
              Os pesos podem ser diferentes para cada área.
            </p>
          </div>
          
          {/* Seletor de Área */}
          {renderAreaSelector()}
          
          {/* Lista vertical de critérios com controles de peso */}
          <div className="criteria-list-vertical">
            {currentCriteria.map((criterion, index) => (
              <div 
                key={criterion.id} 
                className="criterion-card-vertical"
              >
                <div className="criterion-header-vertical">
                  <div className="criterion-info-vertical">
                    <h4 className="criterion-name-vertical">{criterion.name}</h4>
                    <div className="criterion-description-vertical">
                      {criterion.id === 'nps' && 'Satisfação média do cliente com atendimento'}
                      {criterion.id === 'experience' && 'Anos de experiência na área relacionada'}
                      {criterion.id === 'technical' && 'Feedback 120° da equipe interna'}
                      {criterion.id === 'availability' && 'Capacidade atual de dedicação ao projeto'}
                      {criterion.id === 'cultural' && 'Afinidade pessoal com o tipo de projeto'}
                      {criterion.id === 'qap' && 'Qualidade no Atendimento ao Projeto'}
                    </div>
                  </div>
                  <div className="weight-control-vertical">
                    {editingId === criterion.id ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        className="weight-input-editable-vertical"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="weight-display-vertical"
                        onClick={() => handleInputClick(criterion.id, criterion.weight)}
                        title="Clique para editar"
                      >
                        <span className="weight-value-vertical">{criterion.weight}</span>
                        <span className="weight-unit-vertical">%</span>
                        <span className="edit-icon-vertical">✏️</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Controle deslizante para ajuste visual do peso */}
                <div className="slider-container-vertical">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={criterion.weight}
                    onChange={(e) => handleSliderChange(criterion.id, e.target.value)}
                    className="weight-slider-vertical"
                  />
                  <div className="slider-labels-vertical">
                    <span className="slider-label-min">0%</span>
                    <span className="slider-label-mid">50%</span>
                    <span className="slider-label-max">100%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Painel de validação do peso total */}
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
          
          {/* Botões de ação */}
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

  // Renderização da tela de boas-vindas
  const renderWelcomeBox = () => {
    if (selectedProject) return null;
    
    return (
      <div className="project-big-box">
        <h3>Dashboard de Alocações</h3>
        <p>
          Selecione um projeto para configurar seus critérios de ranking específicos.
          Cada projeto pode ter pesos diferentes para NPS, Experiência, QAP e outras métricas.
        </p>
        <div className="help-tips">
          <h4>Como configurar:</h4>
          <ul>
            <li><strong>Selecione a área</strong> (Consultores, Gerentes ou Madrinhas) para editar seus pesos específicos</li>
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
      {/* Cabeçalho com seletor de projetos */}
      <div className="projects-header" onClick={() => setOpen((s) => !s)}>
        <div className="projects-header-title">
          <span className="project-icon">📁</span>
          {selectedProject || "Todos os Projetos"}
        </div>
        <button className="projects-toggle">
          {open ? "▲" : "▼"}
        </button>
      </div>

      {/* Dropdown com lista de projetos */}
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

          {allProjects.map((projectName, i) => {
            // Determinação da macroetapa para cada projeto
            const getProjectMacroEtapa = (name) => {
              switch(name) {
                case "Projeto 1":
                  return "Plano de Negócios";
                case "Projeto 2":
                  return "Plano Financeiro";
                case "Projeto 3":
                  return "Pesquisa de Mercado";
                default:
                  return "Avaliação Estratégica";
              }
            };

            const macroEtapa = getProjectMacroEtapa(projectName);
            
            return (
              <div
                key={i}
                className={`project-dropdown-item ${projectName === selectedProject ? "active" : ""}`}
                onClick={() => { onSelectProject(projectName); setOpen(false); }}
              >
                <span className="dropdown-project-icon">📂</span>
                <div className="dropdown-project-info">
                  <div className="dropdown-project-name">{projectName}</div>
                  <div className="dropdown-project-meta">
                    {projectName === "Projeto 1" && `${macroEtapa}`}
                    {projectName === "Projeto 2" && `${macroEtapa}`}
                    {projectName === "Projeto 3" && `${macroEtapa}`}
                    {!["Projeto 1", "Projeto 2", "Projeto 3"].includes(projectName) && `Cliente • Status • ${macroEtapa}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Área principal de informações e controles */}
      <div className="project-info">
        {selectedProject ? renderCriteriaControls() : renderWelcomeBox()}
      </div>
    </div>
  );
}