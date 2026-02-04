// frontend/index.js - Dashboard de Alocações FGV Jr. (Botão Voltar ao lado do avatar)
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

  // Dados de exemplo para a sessão 2
  const consultantNotes = React.useMemo(() => [
    { letter: 'A', value: 8.5, label: 'Comunicação' },
    { letter: 'B', value: 7.2, label: 'Habilidade Técnica' },
    { letter: 'C', value: 9.0, label: 'Proatividade' },
    { letter: 'D', value: 8.8, label: 'Entrega no Prazo' },
    { letter: 'E', value: 7.5, label: 'Qualidade' }
  ], []);

  const competencyMetrics = React.useMemo(() => [
    { name: 'Comunicação', value: 85, color: '#3b82f6' },
    { name: 'Técnica', value: 72, color: '#10b981' },
    { name: 'Proatividade', value: 90, color: '#f59e0b' },
    { name: 'Prazo', value: 88, color: '#8b5cf6' },
    { name: 'Qualidade', value: 75, color: '#ef4444' }
  ], []);

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
  };

  // Renderizar a sessão 2
  const renderSession2 = () => {
    if (!selectedPerson) return null;

    return (
      <div className="bottom-section">
        {/* Painel de Perfil e Notas (Esquerda) */}
        <div className="profile-panel">
          {/* Header com botão Voltar e Avatar */}
          <div className="profile-header-with-back">
            <button className="back-button" onClick={handleGoBack}>
              ← Voltar
            </button>
            <div className="profile-avatar">
              {selectedPerson.photoUrl ? (
                <img src={selectedPerson.photoUrl} alt={selectedPerson.name} />
              ) : (
                selectedPerson.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <div className="profile-info">
            <h2 className="profile-name">{selectedPerson.name}</h2>
            <span className="profile-role">{selectedPerson.role || "Consultor(a)"}</span>
          </div>

          <div className="profile-meta">
            <div className="meta-item">
              <strong>Alocações:</strong> {selectedPerson.alocacoes || 0}
            </div>
            <div className="meta-item">
              <strong>ID:</strong> {selectedPerson.id}
            </div>
          </div>

          {/* Notas do Consultor */}
          <div className="consultant-notes">
            <h3 className="notes-title">Notas do Consultor</h3>
            <div className="notes-grid">
              {consultantNotes.map((note, index) => (
                <div key={index} className="note-item">
                  <div className="note-letter">{note.letter}</div>
                  <div className="note-label">{note.label}</div>
                  <div className="note-value">{note.value.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel de Competências (Direita) */}
        <div className="competencies-panel">
          <div className="competencies-header">
            <h2 className="competencies-title">Competências</h2>
            <div className="overall-score">
              <span className="score-icon">★</span>
              <span>8.2</span>
            </div>
          </div>

          {/* Radar ou Placeholder */}
          <div className="radar-container">
            {selectedPerson.radar && selectedPerson.radar.values && selectedPerson.radar.values.length > 0 ? (
              <div className="radar-wrapper">
                <RadarNotes 
                  values={selectedPerson.radar.values} 
                  labels={selectedPerson.radar.labels} 
                />
              </div>
            ) : (
              <div className="radar-placeholder">
                <div className="placeholder-icon">📊</div>
                <div>Sem métricas de competências disponíveis</div>
                <small>Adicione dados de avaliação para visualizar o gráfico</small>
              </div>
            )}
          </div>

          {/* Métricas Detalhadas */}
          <div className="metrics-grid">
            {competencyMetrics.map((metric, index) => (
              <div key={index} className="metric-card">
                <div className="metric-header">
                  <span className="metric-name">{metric.name}</span>
                  <span className="metric-value">{metric.value}%</span>
                </div>
                <div className="metric-bar">
                  <div 
                    className="metric-progress" 
                    style={{ 
                      width: `${metric.value}%`,
                      background: metric.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid-container">
      <header className="header-with-logo">
        <h1 className="app-title">FGV Jr. — Dashboard de Alocações</h1>
      </header>

      <div className="main-content">
        {/* SESSÃO 1: Projetos + 3 Colunas */}
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

        {/* SESSÃO 2: Detalhes do Consultor (apenas quando selecionado) */}
        {selectedPerson && renderSession2()}
      </div>
    </div>
  );
}

initializeBlock(() => <Dashboard />);