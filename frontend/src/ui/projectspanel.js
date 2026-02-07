import React, { useState, useEffect } from "react";
import "../../style.css";


export default function ProjectsPanel({
  selectedProject,
  onSelectProject = () => {},
  projects = [],
  projectInfo = null,
}) {
  const [open, setOpen] = useState(false);

  const allProjects = [ ...projects.filter(p => !["Projeto 1", "Projeto 2", "Projeto 3"].includes(p))];


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
            <div className="project-big-box">
            <h3>{selectedProject}</h3>
              <p>Ajuste os sliders abaixo para editar os pesos do painel ao lado.</p>
            </div>
          </>
        ) : (
          <div className="project-big-box project-big-box--empty">
            <div className="empty-icon">📊</div>

            <h3>Dashboard de Alocações</h3>

            <p className="empty-text">
              Selecione um projeto para configurar seus critérios de ranking específicos.
              Cada projeto pode ter pesos diferentes para NPS, Experiência, QAP e outras métricas.
            </p>

            <div className="help-tips">
              <h4>⚙️ Como configurar:</h4>

              <ul className="help-list">
                <li>
                  <span className="help-dot">•</span>
                  <span>
                    <strong>Selecione a área</strong> (Consultores, Gerentes ou Madrinhas) para editar seus pesos específicos
                  </span>
                </li>

                <li>
                  <span className="help-dot">•</span>
                  <span>
                    <strong>Clique nas porcentagens</strong> para editar valores exatos
                  </span>
                </li>

                <li>
                  <span className="help-dot">•</span>
                  <span>
                    <strong>Arraste os sliders</strong> para ajustar visualmente
                  </span>
                </li>

                <li>
                  <span className="help-dot">•</span>
                  <span className="help-blue">
                    <strong>A soma deve ser 100%</strong> para gerar o ranking
                  </span>
                </li>

                <li>
                  <span className="help-dot">•</span>
                  <span>
                    <strong>Clique em</strong> "Atualizar Ranking" <strong>para recalcular</strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}