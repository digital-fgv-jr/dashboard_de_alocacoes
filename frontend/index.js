import React from "react";
import { initializeBlock, useBase, useRecords } from "@airtable/blocks/ui";

import "./style.css";

import Column from "./src/ui/column";
import ProjectsPanel from "./src/ui/projectspanel";
import RadarNotes from "./src/ui/radarnotes";

// Componente principal do Dashboard de Alocações
function Dashboard() {
  // Configuração inicial: base de dados, tabela e registros
  const base = useBase();
  const table = base.getTableByName ? base.getTableByName("Dados - Alocação") : null;
  const records = useRecords(table) || [];

  // Mapeamento de campos disponíveis na tabela
  const fieldNames = React.useMemo(() => {
    if (!table || !table.fields) return new Set();
    return new Set(table.fields.map((f) => f.name));
  }, [table]);
  
  const hasField = React.useCallback((n) => fieldNames.has(n), [fieldNames]);

  // Identificação de campos relacionados ao gráfico de radar
  const radarFields = React.useMemo(() => {
    if (!table || !table.fields) return [];
    const keywords = ["comunic", "tecni", "proativ", "prazo", "qualidade", "nota", "score", "avalia", "qap"];
    return table.fields
      .map((f) => f.name)
      .filter((name) => keywords.some((k) => name.toLowerCase().includes(k)))
      .slice(0, 6);
  }, [table]);

  // Processamento dos dados dos membros da equipe
  const people = React.useMemo(() => {
    return (records || []).map((r) => {
      // Função auxiliar para obter valores de células
      const get = (n) => (hasField(n) && r.getCellValue ? r.getCellValue(n) : null);
      
      // Extração de informações básicas
      const name = (get("Name") || r.name || get("Membro") || "").toString().trim();
      const role = (get("Função") || get("Cargo") || "").toString() || "";
      const alocacoes = Number(get("Alocações") || get("Alocacoes") || get("Aloc") || 0) || 0;

      // Processamento da foto do membro
      let photoUrl = null;
      const photoCell = get("Foto") || get("Image");
      if (Array.isArray(photoCell) && photoCell[0] && photoCell[0].url) {
        photoUrl = photoCell[0].url;
      }

      const description = (get("Descrição") || get("Descricao") || get("Bio") || "") || "";

      // Processamento dos projetos vinculados
      let projectsLinked = [];
      const projVal = get("Projeto") || get("Projetos");
      if (projVal) {
        if (Array.isArray(projVal)) {
          projectsLinked = projVal.map((x) => (x && x.name ? x.name : String(x)));
        } else {
          projectsLinked = [String(projVal)];
        }
      }

      // Construção dos dados do gráfico de radar
      const radar = { labels: [], values: [] };
      radarFields.forEach((f) => {
        radar.labels.push(f);
        const raw = (hasField(f) && r.getCellValue) ? r.getCellValue(f) : null;
        let v = 0;
        if (typeof raw === "number") v = raw;
        else if (typeof raw === "string") v = parseFloat(raw.replace(",", ".")) || 0;
        else if (raw && raw.value !== undefined) v = Number(raw.value) || 0;
        radar.values.push(v);
      });

      return {
        id: r.id,
        name,
        role,
        alocacoes,
        photoUrl,
        description,
        radar,
        projectsLinked,
        __rawRecord: r,
      };
    });
  }, [records, hasField, radarFields]);

  // Extração da lista de projetos únicos
  const projects = React.useMemo(() => {
    const s = new Set();
    (people || []).forEach((p) => {
      (p.projectsLinked || []).forEach((pr) => {
        if (pr && pr.trim()) s.add(pr.trim());
      });
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "pt", { sensitivity: "base" }));
  }, [people]);

  // Estados de controle da interface
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [selectedPerson, setSelectedPerson] = React.useState(null);
  const [selectedProjects, setSelectedProjects] = React.useState({});

  // Lista de macroetapas do processo
  const MACRO_ETAPAS = [
    "Avaliação Estratégica",
    "Plano Operacional", 
    "Plano de Negócios",
    "Sumário Executivo",
    "Plano Financeiro",
    "EVE",
    "Plano de Marketing",
    "Análise Setorial",
    "Pesquisa de Mercado",
    "Cliente Oculto"
  ];

  // Determinação da macroetapa com base no projeto
  const getMacroEtapaForProject = (projectName) => {
    if (!projectName) return "Plano de Negócios";
    
    // Mapeamento para projetos de exemplo
    if (projectName === "Projeto 1") return "Plano de Negócios";
    if (projectName === "Projeto 2") return "Plano Financeiro";
    if (projectName === "Projeto 3") return "Pesquisa de Mercado";
    
    // Para projetos reais, busca do campo "Macroetapa"
    const peopleInProject = (people || []).filter((p) => 
      (p.projectsLinked || []).includes(projectName)
    );
    
    if (peopleInProject.length === 0) return "Plano de Negócios";
    
    const sample = peopleInProject[0] ? peopleInProject[0].__rawRecord : null;
    if (sample && sample.getCellValue) {
      const macroEtapa = (hasField("Macroetapa") ? sample.getCellValue("Macroetapa") : 
                         (hasField("Macro etapa") ? sample.getCellValue("Macro etapa") : 
                         (hasField("Etapa") ? sample.getCellValue("Etapa") : null))) || null;
      
      if (macroEtapa) {
        return String(macroEtapa);
      }
    }
    
    return MACRO_ETAPAS[0];
  };

  // Construção do objeto do projeto selecionado
  const selectedProjectObj = React.useMemo(() => {
    if (!selectedProject) return null;
    const peopleInProject = (people || []).filter((p) => 
      (p.projectsLinked || []).includes(selectedProject)
    );
    
    if (peopleInProject.length === 0) return null;
    
    const sample = peopleInProject[0] ? peopleInProject[0].__rawRecord : null;
    let client = "-", status = "-";
    
    if (sample && sample.getCellValue) {
      client = (hasField("Cliente") ? sample.getCellValue("Cliente") : 
               (hasField("Client") ? sample.getCellValue("Client") : "-")) || "-";
      status = (hasField("Status") ? sample.getCellValue("Status") : "-") || "-";
    }
    
    const macroEtapa = getMacroEtapaForProject(selectedProject);
    
    return { 
      name: selectedProject, 
      client, 
      status, 
      macroEtapa,
      peopleCount: peopleInProject.length 
    };
  }, [selectedProject, people, hasField]);

  // Filtragem de pessoas com base no projeto selecionado
  const filteredPeople = selectedProject 
    ? people.filter((p) => (p.projectsLinked || []).includes(selectedProject))
    : people;

  // Função de ordenação por nome
  const byName = (a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" });
  
  // Categorização dos membros por função
  let consultants = (filteredPeople || []).filter((p) => 
    /consultor/i.test(p.role)
  ).sort(byName);
  
  let managers = (filteredPeople || []).filter((p) => 
    /gerent|manager|gerente/i.test(p.role)
  ).sort(byName);
  
  let madrinhas = (filteredPeople || []).filter((p) => 
    /madrinh/i.test(p.role)
  ).sort(byName);

  // Distribuição alternativa caso não haja categorias definidas
  if (consultants.length === 0 && managers.length === 0 && madrinhas.length === 0) {
    const sorted = [...(filteredPeople || [])].sort(byName);
    const n = sorted.length;
    const firstCut = Math.ceil(n / 3);
    const secondCut = Math.ceil((2 * n) / 3);
    consultants = sorted.slice(0, firstCut);
    managers = sorted.slice(firstCut, secondCut);
    madrinhas = sorted.slice(secondCut);
  }

  // Manipulação da seleção de pessoa
  const handleSelectPerson = (p) => {
    if (!p) return;
    setSelectedPerson(p);
    setSelectedProjects({});
  };

  const handleGoBack = () => {
    setSelectedPerson(null);
    setSelectedProjects({});
  };

  // Determinação da função específica do membro
  const getSpecificRole = (person) => {
    const role = person?.role || "";
    const roleLower = role.toLowerCase();
    
    if (/consultor/i.test(roleLower)) {
      return "Consultor(a)";
    }
    
    if (/gerent|manager|gerente/i.test(roleLower)) {
      return "Gerente";
    }
    
    if (/madrinh/i.test(roleLower)) {
      return "Madrinha";
    }
    
    if (consultants.some(c => c.id === person.id)) {
      return "Consultor(a)";
    } else if (managers.some(m => m.id === person.id)) {
      return "Gerente";
    } else if (madrinhas.some(m => m.id === person.id)) {
      return "Madrinha";
    }
    
    return role || "Membro da Equipe";
  };

  // Descrições dos critérios de avaliação
  const getCriterionDescription = (name, value) => {
    if (name && name.includes('NPS')) return 'Satisfação média do cliente com atendimento';
    if (name && name.includes('Experiência')) return 'Experiência na área relacionada';
    if (name && name.includes('Avaliação')) return 'Feedback 120° da equipe interna';
    if (name && name.includes('Disponibilidade')) return 'Capacidade atual de dedicação ao projeto';
    if (name && name.includes('Preferência')) return 'Afinidade pessoal com o tipo de projeto';
    if (name && name.includes('QAP')) return 'Qualidade no Atendimento ao Projeto';
    return 'Critério de avaliação de desempenho';
  };

  // Cálculo da pontuação de disponibilidade
  const getAvailabilityScore = (alocacoes) => {
    if (alocacoes === 0) return 10;
    if (alocacoes === 1) return 6.67;
    if (alocacoes === 2) return 3.33;
    if (alocacoes >= 3) return 0;
    return 0;
  };

  // Determinação do status de disponibilidade
  const getAvailabilityStatus = (alocacoes) => {
    const score = getAvailabilityScore(alocacoes);
    
    if (alocacoes === 0) return { 
      text: '🟢 Totalmente Livre', 
      color: '#10b981', 
      description: 'Disponível para novos projetos - Nenhuma alocação atual',
      score: score
    };
    if (alocacoes === 1) return { 
      text: '🟡 Parcialmente Disponível', 
      color: '#f59e0b', 
      description: 'Alocado em 1 projeto - Pode assumir mais atividades',
      score: score
    };
    if (alocacoes === 2) return { 
      text: '🟠 Pouco Disponível', 
      color: '#f97316', 
      description: 'Alocado em 2 projetos - Capacidade limitada',
      score: score
    };
    if (alocacoes >= 3) return { 
      text: '🔴 Indisponível', 
      color: '#ef4444', 
      description: 'Máximo de alocações atingido - Não pode assumir novos projetos',
      score: score
    };
    return { 
      text: '🔴 Ocupado', 
      color: '#ef4444', 
      description: 'Com múltiplas alocações',
      score: score
    };
  };

  // Cálculo do total de alocações
  const getTotalAllocations = (person) => {
    const baseAllocations = person.alocacoes || 0;
    const selectedCount = Object.values(selectedProjects).filter(Boolean).length;
    return baseAllocations + selectedCount;
  };

  // Alternar seleção de projeto para alocação
  const toggleProjectSelection = (projectId) => {
    const totalAllocations = getTotalAllocations(selectedPerson);
    
    if (totalAllocations >= 3 && !selectedProjects[projectId]) {
      return;
    }
    
    setSelectedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Lista de sugestões de projetos para alocação
  const projectSuggestions = [
    { id: 1, name: "Projeto 1" },
    { id: 2, name: "Projeto 2" },
    { id: 3, name: "Projeto 3" },
    ...projects.filter(p => !["Projeto 1", "Projeto 2", "Projeto 3"].includes(p))
      .map((p, index) => ({ 
        id: index + 4, 
        name: p
      }))
  ];

  // Renderização da sessão de detalhes do membro
  const renderSession2 = () => {
    if (!selectedPerson) return null;

    const criteriaList = [
      { id: 'nps', name: 'NPS do Profissional', color: '#3b82f6' },
      { id: 'experience', name: 'Experiência', color: '#10b981' },
      { id: 'technical', name: 'Avaliação 120°', color: '#f59e0b' },
      { id: 'availability', name: 'Disponibilidade', color: '#8b5cf6' },
      { id: 'cultural', name: 'Preferência', color: '#ef4444' },
      { id: 'qap', name: 'QAP', color: '#ec4899' }
    ];

    const totalAllocations = getTotalAllocations(selectedPerson);
    const availabilityStatus = getAvailabilityStatus(totalAllocations);
    const availabilityScore = getAvailabilityScore(totalAllocations);

    let radarLabels = [];
    let radarValues = [];

    if (selectedPerson.radar && selectedPerson.radar.values && selectedPerson.radar.values.length > 0) {
      radarLabels = selectedPerson.radar.labels.slice(0, 6);
      radarValues = selectedPerson.radar.values.slice(0, 6);
      
      while (radarLabels.length < 6) {
        radarLabels.push(criteriaList[radarLabels.length]?.name || `Critério ${radarLabels.length + 1}`);
      }
      while (radarValues.length < 6) {
        radarValues.push(7.5);
      }
    } else {
      radarLabels = criteriaList.map(c => c.name);
      radarValues = [8.5, 7.2, 9.0, availabilityScore, 7.5, 8.3];
    }

    const availabilityIndex = radarLabels.findIndex(label => 
      label.toLowerCase().includes('disponibilidade')
    );
    if (availabilityIndex !== -1) {
      radarValues[availabilityIndex] = availabilityScore;
    }

    let overallScore = 8.2;
    if (radarValues.length > 0) {
      const sum = radarValues.reduce((a, b) => a + b, 0);
      overallScore = sum / radarValues.length;
    }

    const memberRole = getSpecificRole(selectedPerson);
    const currentProjects = selectedPerson.projectsLinked || [];

    return (
      <div className="bottom-section">
        <div className="profile-section-header">
          <div className="profile-header-content">
            <button className="profile-back-button" onClick={handleGoBack}>
              <span className="back-icon">←</span>
              <span className="back-label">Voltar para Alocações</span>
            </button>
            <div className="profile-header-info">
              <h1 className="profile-main-title">{selectedPerson.name}</h1>
              <p className="profile-subtitle">
                {memberRole} • {currentProjects.length} projeto{currentProjects.length !== 1 ? 's' : ''} ativo{currentProjects.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="member-detail-grid-three">
          
          <div className="profile-left-card">
            <div className="profile-header-left">
              <div className="avatar-container-left">
                {selectedPerson.photoUrl ? (
                  <img src={selectedPerson.photoUrl} alt={selectedPerson.name} className="profile-image-left" />
                ) : (
                  <div className="avatar-initial-left">
                    {selectedPerson.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="availability-indicator-left" 
                     style={{ 
                       backgroundColor: availabilityStatus.color,
                       boxShadow: `0 0 0 3px ${availabilityStatus.color}20`
                     }}>
                  {availabilityStatus.text.includes('Livre') ? '🟢' : 
                   availabilityStatus.text.includes('1') ? '🟡' : 
                   availabilityStatus.text.includes('2') ? '🟠' : '🔴'}
                </div>
              </div>
              <div className="profile-info-left">
                <h3 className="member-name-left">{selectedPerson.name}</h3>
                <div className="member-role-badge-left">{memberRole}</div>
                
                <div className="occupation-display">
                  <div className="occupation-label">Nível de Ocupação:</div>
                  <div className="occupation-value">{totalAllocations}/3 projetos</div>
                  <div className="occupation-bar">
                    <div className="occupation-track"></div>
                    <div 
                      className="occupation-fill" 
                      style={{ 
                        width: `${(totalAllocations / 3) * 100}%`,
                        backgroundColor: availabilityStatus.color
                      }}
                    ></div>
                  </div>
                  <div className="occupation-labels">
                    <span>Livre</span>
                    <span>Máximo</span>
                  </div>
                </div>
                
                <div className="member-meta-left">
                  <div className="meta-item-left">
                    <span className="meta-label-left">ID:</span>
                    <span className="meta-value-left">{selectedPerson.id || 'N/A'}</span>
                  </div>
                  <div className="meta-item-left">
                    <span className="meta-label-left">ALOCAÇÕES:</span>
                    <span className="meta-value-left">{totalAllocations}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-description-left">
              <h4 className="description-title-left">Sobre</h4>
              <p className="description-content-left">
                {selectedPerson.description || 
                  "Membro da equipe FGV Jr. Sem descrição adicional disponível."}
              </p>
            </div>

            <div className="availability-status-left">
              <div className="status-header-left">
                <h4>Status de Disponibilidade</h4>
              </div>
              <div className="status-content-left">
                <div className="status-indicator-left" style={{ color: availabilityStatus.color }}>
                  {availabilityStatus.text}
                </div>
                <div className="status-score-left">
                  <span className="score-label-left">Pontuação:</span>
                  <span className="score-value-left">{availabilityScore.toFixed(1)}/10</span>
                </div>
                <p className="status-description-left">{availabilityStatus.description}</p>
              </div>
            </div>

            <div className="overall-score-left">
              <div className="score-header-left">
                <h4>Nota Geral</h4>
              </div>
              <div className="score-content-left">
                <div className="score-value-left-large">{overallScore.toFixed(1)}<span className="score-max-left">/10</span></div>
                <div className="score-rating-left">
                  {overallScore >= 8 ? '⭐ Excelente' : 
                   overallScore >= 6 ? '👍 Bom' : 
                   overallScore >= 4 ? '👌 Regular' : '📝 A Melhorar'}
                </div>
              </div>
            </div>
          </div>

          <div className="radar-middle-card">
            <div className="card-header-middle">
              <h3>Perfil de Habilidades</h3>
              <div className="score-badge-middle">
                <span className="score-icon-middle">★</span>
                <span className="score-text-middle">{overallScore.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="radar-container-middle">
              <div className="radar-wrapper-middle">
                <RadarNotes 
                  values={radarValues} 
                  labels={radarLabels} 
                />
              </div>
              <div className="radar-legend-middle">
                <div className="legend-item-middle">
                  <div className="legend-dot-middle" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span>Perfil do Membro</span>
                </div>
                <div className="legend-item-middle">
                  <div className="legend-dot-middle" style={{ backgroundColor: '#e2e8f0' }}></div>
                  <span>Escala de Referência</span>
                </div>
              </div>
            </div>
            
            <div className="allocation-suggestions-container">
              <div className="suggestions-header-elegant">
                <div className="suggestions-title-wrapper">
                  <div className="suggestion-icon">
                    <span>📋</span>
                  </div>
                  <h4>Sugerir Alocação para:</h4>
                </div>
                <div className="suggestions-count-badge">
                  <span>3</span>
                </div>
              </div>
              
              <div className="suggestions-list-elegant">
                {projectSuggestions.slice(0, 3).map((project, index) => {
                  const isSelected = selectedProjects[project.id];
                  const canSelect = totalAllocations < 3 || isSelected;
                  
                  return (
                    <div 
                      key={project.id} 
                      className={`suggestion-item-elegant ${isSelected ? 'selected' : ''} ${!canSelect && !isSelected ? 'disabled' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="suggestion-item-content">
                        <div className="project-info-minimal">
                          <div className="project-name-elegant">{project.name}</div>
                        </div>
                        
                        <button 
                          className={`allocate-btn-elegant ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleProjectSelection(project.id)}
                          disabled={!canSelect && !isSelected}
                          title={!canSelect && !isSelected ? "Membro já está no máximo de projetos (3)" : ""}
                        >
                          {isSelected ? (
                            <>
                              <span className="check-icon">✓</span>
                              Selecionado
                            </>
                          ) : 'Alocar'}
                        </button>
                      </div>
                      
                      {!canSelect && !isSelected && (
                        <div className="allocation-warning">
                          <span className="warning-icon">⚠️</span>
                          Limite de projetos atingido
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="metrics-right-card">
            <div className="card-header-right">
              <h3>Métricas Detalhadas</h3>
              <div className="metrics-count-right">
                {criteriaList.length} critérios
              </div>
            </div>

            <div className="metrics-list-right">
              {criteriaList.map((criterion, index) => {
                let value = 0;
                let name = criterion.name;
                
                if (name.includes('NPS')) value = 8.5;
                else if (name.includes('Experiência')) value = 7.2;
                else if (name.includes('Avaliação')) value = 9.0;
                else if (name.includes('Disponibilidade')) value = availabilityScore;
                else if (name.includes('Preferência')) value = 7.5;
                else if (name.includes('QAP')) value = 8.3;
                
                const percentage = (value / 10) * 100;
                
                return (
                  <div key={index} className="metric-item-right">
                    <div className="metric-header-right">
                      <div className="metric-title-right">
                        <span className="metric-number-right">0{index + 1}</span>
                        <span className="metric-name-right">{name}</span>
                      </div>
                      <div className="metric-score-right">
                        <span className="score-value-right">{value.toFixed(1)}</span>
                        <span className="score-max-right">/10</span>
                      </div>
                    </div>
                    
                    <div className="metric-description-right">
                      {getCriterionDescription(name, value)}
                    </div>
                    
                    <div className="progress-container-right">
                      <div className="progress-bar-right">
                        <div 
                          className="progress-fill-right" 
                          style={{ 
                            width: `${percentage}%`,
                            background: criterion.color
                          }}
                        ></div>
                      </div>
                      <div className="progress-labels-right">
                        <span className="progress-percentage-right">{percentage.toFixed(0)}%</span>
                        <span className={`progress-status-right ${
                          value >= 8 ? 'status-excellent' :
                          value >= 6 ? 'status-good' :
                          value >= 4 ? 'status-regular' : 'status-needs-improvement'
                        }`}>
                          {value >= 8 ? 'Excelente' : 
                           value >= 6 ? 'Bom' : 
                           value >= 4 ? 'Regular' : 'A Melhorar'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid-container">
      {!selectedPerson && (
        <header className="header-with-logo">
          <h1 className="app-title">FGV Jr. — Dashboard de Alocações</h1>
        </header>
      )}

      <div className="main-content">
        {!selectedPerson && (
          <div className="top-section">
            <ProjectsPanel
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
              projectInfo={selectedProjectObj}
            />

            <div className="columns-container">
              <Column 
                title="Consultores" 
                items={consultants} 
                onSelect={handleSelectPerson} 
              />
              <Column 
                title="Gerentes" 
                items={managers} 
                onSelect={handleSelectPerson} 
              />
              <Column 
                title="Madrinhas" 
                items={madrinhas} 
                onSelect={handleSelectPerson} 
              />
            </div>
          </div>
        )}

        {selectedPerson && renderSession2()}
      </div>
    </div>
  );
}

initializeBlock(() => <Dashboard />);