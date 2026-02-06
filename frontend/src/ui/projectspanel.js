import React, { useState, useEffect } from "react";
import "../../style.css";


export default function ProjectsPanel({
  selectedProject,
  onSelectProject = () => {},
  projects = [],
  projectInfo = null,
  selectedArea = "consultores",
  onSelectArea = () => {},
}) {
  const [open, setOpen] = useState(false);

  const allProjects = [ ...projects.filter(p => !["Projeto 1", "Projeto 2", "Projeto 3"].includes(p))];

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
              onClick={() => onSelectArea(area.id)}
            >
              <span className="area-button-icon">{area.icon}</span>
              <span className="area-button-label">{area.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="projects-panel">
      <div className="projects-header" onClick={() => setOpen((s) => !s)}>
        <div className="projects-header-title">
          <span className="project-icon">📁</span>
          {selectedProject || "Todos os Projetos"}
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

          {allProjects.map((projectName, i) => {
            // Determinar macroetapa para cada projeto
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
                    {projectName === "Projeto 1" && `Cliente A • Em andamento • ${macroEtapa}`}
                    {projectName === "Projeto 2" && `Cliente B • Planejamento • ${macroEtapa}`}
                    {projectName === "Projeto 3" && `Cliente C • Concluído • ${macroEtapa}`}
                    {!["Projeto 1", "Projeto 2", "Projeto 3"].includes(projectName) && `Cliente • Status • ${macroEtapa}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="project-info">
        {selectedProject ? (
          <>
            {renderAreaSelector()}
            <div className="project-big-box">
            <h3>{selectedProject}</h3>
              <p>Selecione a área acima para editar os pesos no painel ao lado.</p>
            </div>
          </>
        ) : (
          <div className="project-big-box">
            <h3>Dashboard de Alocações</h3>
            <p>Selecione um projeto para começar.</p>
            {renderAreaSelector()}
          </div>
        )}
      </div>
    </div>
  );
}