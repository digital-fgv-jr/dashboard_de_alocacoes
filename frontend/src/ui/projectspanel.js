import React, { useState } from "react";

export default function ProjectsPanel({
  selectedProject,
  onSelectProject = () => {},
  projects = [],
  projectInfo = null,
}) {
  const [open, setOpen] = useState(false);

  let indicador = "";
  if (projects.length === 0) indicador = "Sem Projetos Para Alocar";
  else indicador = "Todos os Projetos";

  return (
    <div
      className={[
        "w-[380px] bg-white flex flex-col overflow-hidden",
        "border border-[#e5e7eb]",
        "rounded-[10px]",
        "shadow-[0_3px_12px_rgba(0,0,0,0.08)]",
      ].join(" ")}
    >
      <div
        className={[
          "text-white",
          "px-4 py-3",
          "rounded-t-[10px]",
          "flex items-center justify-between",
          "cursor-pointer",
          "transition-all duration-200",
          "border-0 w-full",
          "text-[14px]",
          "h-[48px]",
          "bg-[var(--brand)]",
          "hover:bg-[var(--brand-hover)]",
        ].join(" ")}
        onClick={() => setOpen((s) => !s)}
      >
        <div className="flex-1 text-center font-bold">
          <span className="project-icon">📁</span>
          {selectedProject || indicador}
        </div>

        <button
          className={[
            "bg-[rgba(255,255,255,0.1)]",
            "border-0 text-white cursor-pointer",
            "text-[12px]",
            "px-2 py-1",
            "rounded-[5px]",
            "transition-[color,background] duration-200",
            "hover:bg-[rgba(255,255,255,0.2)]",
          ].join(" ")}
        >
          {open ? "▲" : "▼"}
        </button>
      </div>

      {open && (
        <div
          className={[
            "bg-white",
            "rounded-b-[10px]",
            "p-[10px]",
            "max-h-[180px]",
            "overflow-y-auto",
            "border-t border-[#e5e7eb]",
            "z-10",
            "shadow-[0_3px_10px_rgba(0,0,0,0.05)]",
          ].join(" ")}
        >
          <div
            className={[
              "px-[10px] py-2",
              "cursor-pointer",
              "rounded-[5px]",
              "transition-[background-color] duration-200",
              "text-[13px]",
              !selectedProject
                ? "bg-[#eff6ff] text-[#2563eb] font-semibold"
                : "text-[#374151] hover:bg-[#f3f4f6]",
            ].join(" ")}
            onClick={() => {
              onSelectProject(null);
              setOpen(false);
            }}
          >
            <span className="dropdown-project-icon">📂</span>

            <div className="flex flex-col">
              <div className="font-semibold text-[14px] text-[#1f2937]">
                Todos os projeto
              </div>
              <div className="text-[11px] text-[#9ca3af] mt-[0.125rem]">
                Visualização geral • {projects.length} projetos
              </div>
            </div>
          </div>

          {projects.map((projectName, i) => {
            const getProjectMacroEtapa = (name) => {
              switch (name) {
                default:
                  return "Conferir";
              }
            };

            const macroEtapa = getProjectMacroEtapa(projectName);

            const isActive = projectName === selectedProject;

            return (
              <div
                key={i}
                className={[
                  "px-[10px] py-2",
                  "cursor-pointer",
                  "rounded-[5px]",
                  "transition-[background-color] duration-200",
                  "text-[13px]",
                  isActive
                    ? "bg-[#eff6ff] text-[#2563eb] font-semibold"
                    : "text-[#374151] hover:bg-[#f3f4f6]",
                ].join(" ")}
                onClick={() => {
                  onSelectProject(projectName);
                  setOpen(false);
                }}
              >
                <span className="dropdown-project-icon">📂</span>

                <div className="flex flex-col">
                  <div className="font-semibold text-[14px] text-[#1f2937]">
                    {projectName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div
        className={[
          "bg-white",
          "p-[18px]",
          "flex-1",
          "flex flex-col",
          "border-t border-[#e5e7eb]",
          "overflow-y-auto",
          "min-h-0",
        ].join(" ")}
      >
        {selectedProject ? (
          <>
            <div
              className={[
                "flex-1",
                "rounded-[7px]",
                "p-[22px]",
                "flex flex-col items-center justify-center",
                "text-center",
                "mt-[10px]",
                "min-h-0",
                "bg-[#0f172a]",
                "text-[#e6eefc]",
                "shadow-[inset_0_0_0_4px_rgba(255,255,255,0.02)]",
              ].join(" ")}
            >
              <h3 className="my-[10px] text-[16px] font-bold text-[#93c5fd]">
                {selectedProject}
              </h3>

              <p className="max-w-[90%] leading-[1.4] text-[14px] text-[#dbeafe] m-0">
                Ajuste os sliders abaixo para editar os pesos do painel ao lado.
              </p>
            </div>
          </>
        ) : (
          <div
            className={[
              "flex-1",
              "rounded-[7px]",
              "p-[22px]",
              "flex flex-col items-center justify-center",
              "text-center",
              "mt-[10px]",
              "min-h-0",
              "bg-[#0f172a]",
              "text-[#e6eefc]",
              "shadow-[inset_0_0_0_4px_rgba(255,255,255,0.02)]",
            ].join(" ")}
          >
            <div className="text-[38px] leading-none mb-[6px] opacity-[0.95]">
              📊
            </div>

            <h3 className="my-[10px] text-[16px] font-bold text-[#93c5fd]">
              Dashboard de Alocações
            </h3>

            <p className="max-w-[90%] leading-[1.4] text-[14px] text-[#dbeafe] m-0">
              Selecione um projeto para configurar seus critérios de ranking específicos.
              Cada projeto pode ter pesos diferentes para NPS, Experiência, QAP e outras métricas.
            </p>

            <div
              className={[
                "mt-6",
                "p-5",
                "rounded-[10px]",
                "border border-[rgba(255,255,255,0.2)]",
                "bg-[rgba(255,255,255,0.1)]",
              ].join(" ")}
            >
              <h4 className="text-[#93c5fd] mb-3 text-[15px]">
                ⚙️ Como configurar:
              </h4>

              <ul className="list-none p-0 m-0">
                <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                  <span className="help-dot">•</span>{" "}
                  <span>
                    <strong className="text-[#bfdbfe]">Selecione a área</strong>{" "}
                    (Consultores, Gerentes ou Madrinhas) para editar seus pesos específicos
                  </span>
                </li>

                <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                  <span className="help-dot">•</span>{" "}
                  <span>
                    <strong className="text-[#bfdbfe]">Clique nas porcentagens</strong>{" "}
                    para editar valores exatos
                  </span>
                </li>

                <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                  <span className="help-dot">•</span>{" "}
                  <span>
                    <strong className="text-[#bfdbfe]">Arraste os sliders</strong>{" "}
                    para ajustar visualmente
                  </span>
                </li>

                <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                  <span className="help-dot">•</span>{" "}
                  <span className="help-blue">
                    <strong className="text-[#bfdbfe]">A soma deve ser 100%</strong>{" "}
                    para gerar o ranking
                  </span>
                </li>

                <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                  <span className="help-dot">•</span>{" "}
                  <span>
                    <strong className="text-[#bfdbfe]">Clique em</strong>{" "}
                    "Atualizar Ranking"{" "}
                    <strong className="text-[#bfdbfe]">para recalcular</strong>
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
