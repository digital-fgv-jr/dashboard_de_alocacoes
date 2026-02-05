import React from "react";
import { initializeBlock, useBase, useRecords } from "@airtable/blocks/ui";

import "./style.css";

import Column from "./src/ui/column";
import ProjectsPanel from "./src/ui/projectspanel";
import RadarNotes from "./src/ui/radarnotes";

function Dashboard() {
  const base = useBase();
  const table = base.getTableByName ? base.getTableByName("Dados - Alocação") : null;
  const records = useRecords(table) || [];

  const fieldNames = React.useMemo(() => {
    if (!table || !table.fields) return new Set();
    return new Set(table.fields.map((f) => f.name));
  }, [table]);
  
  const hasField = React.useCallback((n) => fieldNames.has(n), [fieldNames]);

  const radarFields = React.useMemo(() => {
    if (!table || !table.fields) return [];
    const keywords = ["comunic", "tecni", "proativ", "prazo", "qualidade", "nota", "score", "avalia"];
    return table.fields
      .map((f) => f.name)
      .filter((name) => keywords.some((k) => name.toLowerCase().includes(k)))
      .slice(0, 5);
  }, [table]);

  const people = React.useMemo(() => {
    return (records || []).map((r) => {
      const get = (n) => (hasField(n) && r.getCellValue ? r.getCellValue(n) : null);
      const name = (get("Name") || r.name || get("Membro") || "").toString().trim();
      const role = (get("Função") || get("Cargo") || "").toString() || "";
      const alocacoes = Number(get("Alocações") || get("Alocacoes") || get("Aloc") || 0) || 0;

      let photoUrl = null;
      const photoCell = get("Foto") || get("Image");
      if (Array.isArray(photoCell) && photoCell[0] && photoCell[0].url) {
        photoUrl = photoCell[0].url;
      }

      const description = (get("Descrição") || get("Descricao") || get("Bio") || "") || "";

      let projectsLinked = [];
      const projVal = get("Projeto") || get("Projetos");
      if (projVal) {
        if (Array.isArray(projVal)) {
          projectsLinked = projVal.map((x) => (x && x.name ? x.name : String(x)));
        } else {
          projectsLinked = [String(projVal)];
        }
      }

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

  const projects = React.useMemo(() => {
    const s = new Set();
    (people || []).forEach((p) => {
      (p.projectsLinked || []).forEach((pr) => {
        if (pr && pr.trim()) s.add(pr.trim());
      });
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "pt", { sensitivity: "base" }));
  }, [people]);

  const [selectedProject, setSelectedProject] = React.useState(null);
  const [selectedPerson, setSelectedPerson] = React.useState(null);
  const [selectedProjects, setSelectedProjects] = React.useState({});

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
    
    return { 
      name: selectedProject, 
      client, 
      status, 
      peopleCount: peopleInProject.length 
    };
  }, [selectedProject, people, hasField]);

  const filteredPeople = selectedProject 
    ? people.filter((p) => (p.projectsLinked || []).includes(selectedProject))
    : people;

  const byName = (a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" });
  
  let consultants = (filteredPeople || []).filter((p) => 
    /consultor/i.test(p.role)
  ).sort(byName);
  
  let managers = (filteredPeople || []).filter((p) => 
    /gerent|manager|gerente/i.test(p.role)
  ).sort(byName);
  
  let madrinhas = (filteredPeople || []).filter((p) => 
    /madrinh/i.test(p.role)
  ).sort(byName);

  if (consultants.length === 0 && managers.length === 0 && madrinhas.length === 0) {
    const sorted = [...(filteredPeople || [])].sort(byName);
    const n = sorted.length;
    const firstCut = Math.ceil(n / 3);
    const secondCut = Math.ceil((2 * n) / 3);
    consultants = sorted.slice(0, firstCut);
    managers = sorted.slice(firstCut, secondCut);
    madrinhas = sorted.slice(secondCut);
  }

  const handleSelectPerson = (p) => {
    if (!p) return;
    setSelectedPerson(p);
  };

  const handleGoBack = () => {
    setSelectedPerson(null);
    setSelectedProjects({});
  };

  // Função para determinar o cargo baseado na role
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

  // Função para obter descrição do critério
  const getCriterionDescription = (name, value) => {
    if (name && name.includes('NPS')) return 'Satisfação média do cliente';
    if (name && name.includes('Experiência')) return 'Anos na área relacionada';
    if (name && name.includes('Avaliação')) return 'Feedback 120° da equipe';
    if (name && name.includes('Disponibilidade')) return 'Capacidade de dedicação';
    if (name && name.includes('Preferência')) return 'Afinidade com o projeto';
    return 'Critério de avaliação';
  };

  // Função para calcular a disponibilidade baseado nas alocações
  const getAvailabilityScore = (alocacoes) => {
    // Se não está alocado em nenhum projeto: disponibilidade 10/10
    if (alocacoes === 0) return 10;
    // Se está em 1 projeto: 6.67/10 (3 projetos seria 0, então linearmente: 10 - (alocações * 3.33))
    if (alocacoes === 1) return 6.67;
    if (alocacoes === 2) return 3.33;
    if (alocacoes >= 3) return 0;
    return 0;
  };

  // Função para obter status de disponibilidade baseado no número de alocações
  const getAvailabilityStatus = (alocacoes) => {
    if (alocacoes === 0) return { 
      text: '🟢 Livre', 
      color: '#10b981', 
      description: 'Disponível para novos projetos',
      score: 10
    };
    if (alocacoes === 1) return { 
      text: '🟡 1 projeto', 
      color: '#f59e0b', 
      description: 'Alocado em 1 projeto',
      score: 6.67
    };
    if (alocacoes === 2) return { 
      text: '🟠 2 projetos', 
      color: '#f97316', 
      description: 'Alocado em 2 projetos',
      score: 3.33
    };
    if (alocacoes >= 3) return { 
      text: '🔴 3+ projetos', 
      color: '#ef4444', 
      description: 'Máximo de alocações atingido',
      score: 0
    };
    return { 
      text: '🔴 Ocupado', 
      color: '#ef4444', 
      description: 'Com múltiplas alocações',
      score: 0
    };
  };

  // Função para alternar a seleção de um projeto
  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Lista de projetos para sugestão (mesmos da primeira sessão)
  const projectSuggestions = [
    { id: 1, name: "Projeto 1", status: "Em andamento", client: "Cliente A" },
    { id: 2, name: "Projeto 2", status: "Planejamento", client: "Cliente B" },
    { id: 3, name: "Projeto 3", status: "Concluído", client: "Cliente C" },
    ...projects.filter(p => !["Projeto 1", "Projeto 2", "Projeto 3"].includes(p))
      .map((p, index) => ({ 
        id: index + 4, 
        name: p, 
        status: "Status", 
        client: "Cliente" 
      }))
  ];

  // Renderizar a sessão 2
  const renderSession2 = () => {
    if (!selectedPerson) return null;

    // Critérios de avaliação
    const criteriaList = [
      { id: 'nps', name: 'NPS do Profissional', color: '#3b82f6' },
      { id: 'experience', name: 'Experiência na Área', color: '#10b981' },
      { id: 'technical', name: 'Avaliação 120°', color: '#f59e0b' },
      { id: 'availability', name: 'Disponibilidade', color: '#8b5cf6' },
      { id: 'cultural', name: 'Preferência', color: '#ef4444' }
    ];

    // Usar dados do radar ou dados padrão
    let radarLabels = [];
    let radarValues = [];

    if (selectedPerson.radar && selectedPerson.radar.values && selectedPerson.radar.values.length > 0) {
      radarLabels = selectedPerson.radar.labels;
      radarValues = selectedPerson.radar.values;
    } else {
      radarLabels = criteriaList.map(c => c.name);
      radarValues = [8.5, 7.2, 9.0, 8.8, 7.5];
    }

    // Calcular nota geral
    let overallScore = 8.2;
    if (radarValues.length > 0) {
      const sum = radarValues.reduce((a, b) => a + b, 0);
      overallScore = sum / radarValues.length;
    }

    // Obter status de disponibilidade
    const availabilityStatus = getAvailabilityStatus(selectedPerson.alocacoes || 0);
    
    // Calcular pontuação de disponibilidade
    const availabilityScore = getAvailabilityScore(selectedPerson.alocacoes || 0);

    // Preparar dados para as métricas (substituindo a disponibilidade com o valor calculado)
    const metricsData = [];
    for (let i = 0; i < Math.min(radarLabels.length, 5); i++) {
      let value = radarValues[i] || 0;
      let name = radarLabels[i] || criteriaList[i]?.name || `Critério ${i + 1}`;
      
      // Se for a métrica de disponibilidade, usar o valor calculado
      if (name.includes('Disponibilidade')) {
        value = availabilityScore;
      }
      
      const percentage = (value / 10) * 100;
      metricsData.push({
        name,
        value: value.toFixed(1),
        percentage: percentage.toFixed(0),
        color: criteriaList[i]?.color || '#3b82f6',
        description: getCriterionDescription(name, value)
      });
    }

    // Determinar o cargo específico
    const memberRole = getSpecificRole(selectedPerson);

    return (
      <div className="bottom-section">
        {/* Novo cabeçalho para a segunda sessão - SEM O HEADER ORIGINAL */}
        <div className="profile-section-header">
          <div className="profile-header-content">
            <button className="profile-back-button" onClick={handleGoBack}>
              <span className="back-icon">←</span>
              <span className="back-label">Voltar para Alocações</span>
            </button>
            <div className="profile-header-info">
              <h1 className="profile-main-title">Perfil do Membro</h1>
              <p className="profile-subtitle">Detalhes e métricas de avaliação</p>
            </div>
          </div>
        </div>

        {/* Grid Principal com 3 colunas */}
        <div className="member-detail-grid-three">
          
          {/* Coluna 1: Perfil */}
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
                <div className="member-meta-left">
                  <div className="meta-item-left">
                    <span className="meta-label-left">ID:</span>
                    <span className="meta-value-left">{selectedPerson.id || 'N/A'}</span>
                  </div>
                  <div className="meta-item-left">
                    <span className="meta-label-left">ALOCAÇÕES:</span>
                    <span className="meta-value-left">{selectedPerson.alocacoes || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="profile-description-left">
              <h4 className="description-title-left">Sobre</h4>
              <p className="description-content-left">
                {selectedPerson.description || 
                  "Membro da equipe FGV Jr. Sem descrição adicional disponível."}
              </p>
            </div>

            {/* Status de Disponibilidade */}
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

            {/* Nota Geral */}
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

          {/* Coluna 2: Radar + Sugestões de Alocação */}
          <div className="radar-middle-card">
            <div className="card-header-middle">
              <h3>Perfil de Habilidades</h3>
              <div className="score-badge-middle">
                <span className="score-icon-middle">★</span>
                <span className="score-text-middle">{overallScore.toFixed(1)}</span>
              </div>
            </div>
            
            {selectedPerson.radar && selectedPerson.radar.values && selectedPerson.radar.values.length > 0 ? (
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
                    <span>Avaliação do Membro</span>
                  </div>
                  <div className="legend-item-middle">
                    <div className="legend-dot-middle" style={{ backgroundColor: '#e2e8f0' }}></div>
                    <span>Escala de Referência</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="radar-placeholder-middle">
                <div className="placeholder-icon-middle">📊</div>
                <div className="placeholder-title-middle">Sem dados de habilidades</div>
                <p className="placeholder-text-middle">
                  Adicione métricas de avaliação para visualizar o perfil gráfico.
                </p>
              </div>
            )}
            
            {/* Sugestões de Alocação (sempre visível) */}
            <div className="project-suggestions-always">
              <div className="suggestions-header-always">
                <h4>Sugerir Alocação para:</h4>
              </div>
              <div className="suggestions-list-always">
                {projectSuggestions.slice(0, 3).map((project) => (
                  <div key={project.id} className="project-suggestion-item-always">
                    <div className="project-info-always">
                      <div className="project-name-always">{project.name}</div>
                      <div className="project-details-always">
                        <span className="project-client-always">{project.client}</span>
                        <span className="project-status-always">{project.status}</span>
                      </div>
                    </div>
                    <button 
                      className={`select-project-btn-always ${selectedProjects[project.id] ? 'selected' : ''}`}
                      onClick={() => toggleProjectSelection(project.id)}
                    >
                      {selectedProjects[project.id] ? '✓ Selecionado' : 'Selecionar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna 3: Métricas Detalhadas */}
          <div className="metrics-right-card">
            <div className="card-header-right">
              <h3>Métricas Detalhadas</h3>
              <div className="metrics-count-right">
                {metricsData.length} critérios
              </div>
            </div>

            <div className="metrics-list-right">
              {metricsData.map((metric, index) => (
                <div key={index} className="metric-item-right">
                  <div className="metric-header-right">
                    <div className="metric-title-right">
                      <span className="metric-number-right">0{index + 1}</span>
                      <span className="metric-name-right">{metric.name}</span>
                    </div>
                    <div className="metric-score-right">
                      <span className="score-value-right">{metric.value}</span>
                      <span className="score-max-right">/10</span>
                    </div>
                  </div>
                  
                  <div className="metric-description-right">{metric.description}</div>
                  
                  <div className="progress-container-right">
                    <div className="progress-bar-right">
                      <div 
                        className="progress-fill-right" 
                        style={{ 
                          width: `${metric.percentage}%`,
                          background: metric.color
                        }}
                      ></div>
                    </div>
                    <div className="progress-labels-right">
                      <span className="progress-percentage-right">{metric.percentage}%</span>
                      <span className={`progress-status-right ${
                        parseFloat(metric.value) >= 8 ? 'status-excellent' :
                        parseFloat(metric.value) >= 6 ? 'status-good' :
                        parseFloat(metric.value) >= 4 ? 'status-regular' : 'status-needs-improvement'
                      }`}>
                        {parseFloat(metric.value) >= 8 ? 'Excelente' : 
                         parseFloat(metric.value) >= 6 ? 'Bom' : 
                         parseFloat(metric.value) >= 4 ? 'Regular' : 'A Melhorar'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nota Explicativa */}
            <div className="metrics-note-right">
              <p>
                <strong>Disponibilidade:</strong> Calculada baseada no número de projetos atuais.
                <br />
                0 projetos = 10/10 • 1 projeto = 6.7/10 • 2 projetos = 3.3/10 • 3+ projetos = 0/10
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid-container">
      {/* HEADER APENAS NA PRIMEIRA SESSÃO */}
      {!selectedPerson && (
        <header className="header-with-logo">
          <h1 className="app-title">FGV Jr. — Dashboard de Alocações</h1>
        </header>
      )}

      <div className="main-content">
        {/* SESSÃO 1: Projetos + 3 Colunas */}
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

        {/* SESSÃO 2: Detalhes do Membro (apenas quando selecionado) */}
        {selectedPerson && renderSession2()}
      </div>
    </div>
  );
}

initializeBlock(() => <Dashboard />);