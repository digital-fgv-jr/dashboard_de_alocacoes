import React from "react";
import "../../style.css";

export default function ProjectsPanel({
  projects = [],
  selectedProject = null,
  onSelectProject = () => {},
  projectInfo = null,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="projects-panel">
      <div className="projects-header" onClick={() => setOpen((s) => !s)}>
        <div className="projects-header-title">{selectedProject || "Projetos"}</div>
        <button className="projects-toggle">{open ? "▲" : "▼"}</button>
      </div>

      {open && (
        <div className="projects-dropdown">
          <div
            className={`project-dropdown-item ${!selectedProject ? "active" : ""}`}
            onClick={() => { onSelectProject(null); setOpen(false); }}
          >
            Todos os projetos
          </div>

          {projects.map((p, i) => (
            <div
              key={i}
              className={`project-dropdown-item ${p === selectedProject ? "active" : ""}`}
              onClick={() => { onSelectProject(p); setOpen(false); }}
            >
              {p}
            </div>
          ))}
        </div>
      )}

      <div className="project-info">
        {projectInfo ? (
          <>
            <div className="project-info-title">{projectInfo.name}</div>
            <div className="project-info-meta">
              <div><strong>Cliente:</strong> {projectInfo.client}</div>
              <div><strong>Status:</strong> {projectInfo.status}</div>
              <div><strong>Membros:</strong> {projectInfo.peopleCount}</div>
            </div>
          </>
        ) : (
          <div className="project-info-empty">
            Selecione um projeto para ver detalhes (ou mantenha "Todos os projetos").
          </div>
        )}
      </div>
    </div>
  );
}
