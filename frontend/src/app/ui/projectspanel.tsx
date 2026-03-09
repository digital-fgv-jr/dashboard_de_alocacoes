import React from "react";
import { Folder, BarChart3, Settings } from "lucide-react";

type ProjectsPanelProps = {
  selectedProject: string | null;
  onSelectProject?: (project: string | null) => void;
  projects?: string[];
};

export default function ProjectsPanel({
  selectedProject,
  onSelectProject = () => {},
  projects = [],
}: ProjectsPanelProps): JSX.Element {
  let indicador = "";
  if (projects.length === 0) indicador = "Sem Projetos Para Alocar";
  else indicador = `Existem ${projects.length} Projetos sem alocação`;

  return (
    <div
      className={[
        "w-full bg-white flex flex-col overflow-visible",
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
          "gap-2",
          "text-[14px]",
          "h-[48px]",
          "bg-[var(--brand)]",
        ].join(" ")}
      >
        <Folder size={24} className="shrink-0" />
        <span className="flex-1 text-center font-bold">
          {selectedProject || indicador}
        </span>
      </div>

      <div
        className={[
          "flex flex-row",
          "flex-1",
          "min-h-0",
          "border-t",
          "border-[#e5e7eb]",
        ].join(" ")}
      >
        <div className="w-[45%] flex flex-col border-r border-gray-300 min-h-0">
          <div className="flex-1 overflow-y-auto p-[10px] min-h-0">
            {projects.map((projectName, i) => {
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
                    "items-center",
                    isActive
                      ? "bg-[#eff6ff] text-[#2563eb] font-semibold"
                      : "text-[#374151] hover:bg-[#f3f4f6]",
                  ].join(" ")}
                  onClick={() => {
                    if (projectName === selectedProject) {
                      onSelectProject(null);
                    } else {
                      onSelectProject(projectName);
                    }
                  }}
                >
                  <span className="flex items-center gap-1">
                    <Folder size={14} className="shrink-0" />
                  </span>

                  <div className="font-semibold text-[14px] text-[#1f2937]">
                    {projectName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 p-[18px] overflow-y-auto min-h-0">
          {selectedProject ? (
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
                <span className="flex items-center gap-1">
                  <BarChart3 size={52} className="shrink-0" />
                </span>
              </div>

              <h3 className="my-[10px] text-[16px] font-bold text-[#93c5fd]">
                Dashboard de Alocações
              </h3>

              <p className="max-w-[90%] leading-[1.4] text-[14px] text-[#dbeafe] m-0">
                Selecione um projeto para configurar seus critérios de ranking
                específicos. Cada projeto pode ter pesos diferentes para NPS,
                Experiência, QAP e outras métricas.
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
                  <span className="flex items-center gap-1">
                    <Settings size={24} className="shrink-0" />
                  </span>{" "}
                  Como configurar:
                </h4>

                <ul className="list-none p-0 m-0">
                  <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                    <span className="help-dot">*</span>{" "}
                    <span>
                      <strong className="text-[#bfdbfe]">
                        Selecione a área
                      </strong>{" "}
                      (Consultores, Gerentes ou Madrinhas) para editar seus
                      pesos específicos
                    </span>
                  </li>

                  <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                    <span className="help-dot">*</span>{" "}
                    <span>
                      <strong className="text-[#bfdbfe]">
                        Clique nas porcentagens
                      </strong>{" "}
                      para editar valores exatos
                    </span>
                  </li>

                  <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                    <span className="help-dot">*</span>{" "}
                    <span>
                      <strong className="text-[#bfdbfe]">
                        Arraste os handlers
                      </strong>{" "}
                      para ajustar visualmente
                    </span>
                  </li>

                  <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                    <span className="help-dot">*</span>{" "}
                    <span>
                      Clique em{" "}
                      <strong className="text-[#bfdbfe]">
                        Atualizar Ranking{" "}
                      </strong>{" "}
                      para recalcular
                    </span>
                  </li>

                  <li className="mb-2 text-[13px] leading-[1.4] text-[#dbeafe]">
                    <span className="help-dot">*</span>{" "}
                    <span>
                      Clique em{" "}
                      <strong className="text-[#bfdbfe]">Reset </strong> pra
                      retornar aos padrões iniciais
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}