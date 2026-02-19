import React, { useEffect, useMemo, useState } from "react";

export default function ProjectRankingConfig({
  projectId,
  macro,
  criteria: initialCriteria,
  onWeightsChange,
  area,
  onAreaChange,
}) {
  const [criteria, setCriteria] = useState(
    initialCriteria || [
      { id: "nps", name: "NPS do Consultor", weight: 30, description: "Satisfação média dos clientes anteriores" },
      { id: "experience", name: "Experiência na Área", weight: 25, description: "Número de projetos completos no setor do projeto" },
      { id: "preferencia", name: "Preferência", weight: 20, description: "Avaliação técnica específica" },
      { id: "availability", name: "Disponibilidade", weight: 15, description: "Capacidade de dedicação ao projeto" },
      { id: "av_120", name: "Avaliação 120°", weight: 5, description: "Média final da avaliação 120 rodada" },
      { id: "qap", name: "Eficiência", weight: 5, description: "Média dos QAPs dos projetos realizados" },
    ]
  );

  useEffect(() => {
    if (initialCriteria) setCriteria(initialCriteria);
  }, [initialCriteria, area, projectId]);

  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  const map_pesos = useMemo(() => {
    const total = criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0) || 1;
    const peso = {};
    for (const c of criteria) peso[c.id] = (Number(c.weight) || 0) / total;
    return peso;
  }, [criteria]);

  const handleWeightChange = (id, newWeight) => {
    setCriteria((prev) =>
      prev.map((criterion) =>
        criterion.id === id ? { ...criterion, weight: newWeight } : criterion
      )
    );
  };

  const handleSave = () => {
    if (!totalWeight) return;

    const obj = Object.fromEntries(
      (criteria || []).map((c) => [c.id, (Number(c.weight) || 0) / 100])
    );

    onWeightsChange?.(area, obj);
  };

  const handleReset = () => {
    if (initialCriteria) {
      setCriteria(initialCriteria);
    } else {
      setCriteria([
        { id: "nps", name: "NPS do Consultor", weight: 30, description: "Satisfação média dos clientes anteriores" },
        { id: "experience", name: "Experiência na Área", weight: 25, description: "Anos de experiência no setor do projeto" },
        { id: "skill_match", name: "Habilidade Técnica", weight: 20, description: "Avaliação técnica específica" },
        { id: "availability", name: "Disponibilidade", weight: 15, description: "Capacidade de dedicação ao projeto" },
        { id: "cultural_fit", name: "Fit Cultural", weight: 10, description: "Adequação à cultura do cliente" },
      ]);
    }
  };

  return (
    <div className="project-ranking-config">
      {/* micro-css ONLY pra ficar idêntico: ::after e thumb do range */}
      <style>{`
        /* Thumb do slider (sem isso NÃO fica idêntico) */
        .tw-weight-slider {
          -webkit-appearance: none;
          appearance: none;
        }
        .tw-weight-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          background: var(--card-bg, #ffffff);
          border: 3px solid var(--primary, #3b82f6);
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          transition: all 0.2s;
        }
        .tw-weight-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }
        .tw-weight-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: var(--card-bg, #ffffff);
          border: 3px solid var(--primary, #3b82f6);
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
      `}</style>

      {/* Header */}
      <div className="ranking-header">
        <div
          className="ranking-project
                     bg-[var(--brand,#0b2540)] text-white px-4 py-3
                     flex items-center justify-between
                     rounded-t-[10px]"
        >
          <div className="min-w-0">
            <div className="ranking-project-name font-bold text-[14px] truncate">
              {projectId}
            </div>
            <div className="ranking-project-macro text-[11px] opacity-90 mt-0.5 truncate">
              MACROETAPA • {macro || "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[var(--border,#e5e7eb)] rounded-b-[10px] shadow-[0_3px_12px_rgba(0,0,0,0.08)] p-[18px]">
        {/* Title (idêntico ao project-title com “after”) */}
        <div className="relative m-0 mb-4 pb-3 border-b-2 border-b-[var(--border,#e5e7eb)]">
          <h3 className="m-0 text-[20px] font-bold text-[var(--brand-dark,#0f3550)]">
            Critérios de Ranking
          </h3>
          {/* substitui o :after de forma idêntica */}
          <span className="absolute left-0 -bottom-[2px] w-[50px] h-[2px] bg-gradient-to-r from-[var(--primary,#3b82f6)] to-[var(--accent,#8b5cf6)]" />
        </div>

        <p className="m-0 text-[14px] leading-[1.5] text-[var(--muted,#6b7280)]">
          Ajuste a importância de cada critério para este projeto específico. Os pesos podem ser diferentes para cada área.
        </p>

        {/* Área selector */}
        <div className="rounded-xl p-[14px] border my-[14px] mb-[18px]
                        bg-[var(--surface,#f8fafc)] border-[var(--surface-border,#e2e8f0)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-[10px]">
              <span className="w-[34px] h-[34px] rounded-[10px]
                               inline-flex items-center justify-center
                               text-[16px] text-white
                               bg-gradient-to-br from-[var(--primary,#3b82f6)] to-[var(--primary-dark,#1d4ed8)]
                               shadow-[0_6px_14px_rgba(59,130,246,0.25)]">
                🎯
              </span>
              <h4 className="m-0 text-[14px] font-extrabold text-[var(--brand-dark,#0f3550)]">
                <strong>Editar pesos para:</strong>
              </h4>
            </div>
          </div>

          <div className="grid gap-[10px] grid-cols-2">
            <button
              type="button"
              className={[
                "appearance-none bg-white rounded-xl border px-[10px] py-3 cursor-pointer",
                "flex flex-col items-center justify-center gap-2",
                "transition-[transform,box-shadow,border-color,background] duration-150 ease-in-out min-h-[88px]",
                "border-[var(--border,#e5e7eb)] shadow-[0_2px_8px_rgba(15,23,42,0.05)]",
                "hover:-translate-y-[1px] hover:border-[var(--border-3,#cbd5e1)] hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)]",
                area === "consultores"
                  ? "bg-gradient-to-br from-[var(--primary,#3b82f6)] to-[var(--primary-dark,#1d4ed8)] border-[var(--primary-2,#2563eb)] shadow-[0_10px_20px_rgba(59,130,246,0.25)]"
                  : "",
              ].join(" ")}
              onClick={() => onAreaChange?.("consultores")}
            >
              <span className={["text-[24px] leading-none", area === "consultores" ? "drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]" : ""].join(" ")}>
                🧑‍💼
              </span>
              <span className={["text-[13px] font-bold", area === "consultores" ? "text-white" : "text-[var(--brand-dark,#0f3550)]"].join(" ")}>
                Consultores
              </span>
            </button>

            <button
              type="button"
              className={[
                "appearance-none bg-white rounded-xl border px-[10px] py-3 cursor-pointer",
                "flex flex-col items-center justify-center gap-2",
                "transition-[transform,box-shadow,border-color,background] duration-150 ease-in-out min-h-[88px]",
                "border-[var(--border,#e5e7eb)] shadow-[0_2px_8px_rgba(15,23,42,0.05)]",
                "hover:-translate-y-[1px] hover:border-[var(--border-3,#cbd5e1)] hover:shadow-[0_8px_18px_rgba(15,23,42,0.10)]",
                area === "gerentes"
                  ? "bg-gradient-to-br from-[var(--primary,#3b82f6)] to-[var(--primary-dark,#1d4ed8)] border-[var(--primary-2,#2563eb)] shadow-[0_10px_20px_rgba(59,130,246,0.25)]"
                  : "",
              ].join(" ")}
              onClick={() => onAreaChange?.("gerentes")}
            >
              <span className={["text-[24px] leading-none", area === "gerentes" ? "drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]" : ""].join(" ")}>
                👔
              </span>
              <span className={["text-[13px] font-bold", area === "gerentes" ? "text-white" : "text-[var(--brand-dark,#0f3550)]"].join(" ")}>
                Gerentes
              </span>
            </button>
          </div>
        </div>

        {/* Criteria list */}
        <div className="criteria-list flex flex-col gap-5">
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              className="criterion-item bg-white rounded-xl p-5 border border-[var(--border,#e5e7eb)]
                         transition-all duration-200 ease-in-out
                         shadow-[0_1px_3px_rgba(0,0,0,0.05)]
                         hover:border-[var(--primary-soft-border,#dbeafe)]
                         hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                         hover:-translate-y-[1px]"
            >
              <div className="criterion-header flex items-center justify-between mb-4">
                <span className="criterion-name text-[16px] font-semibold text-[var(--text-strong,#1f2937)]">
                  {criterion.name}
                </span>

                {/* Badge do % (idêntico) */}
                <div className="weight-display flex items-center justify-center gap-1
                                px-3 py-2 rounded-[10px] border-2 min-w-[80px]
                                bg-[var(--info-bg,#f0f9ff)] border-[var(--primary-soft-border,#dbeafe)]">
                  <span className="weight-value text-[18px] font-bold text-[var(--brand-dark,#0f3550)]">
                    {criterion.weight}
                  </span>
                  <span className="weight-unit text-[14px] font-semibold text-[var(--primary,#3b82f6)]">
                    %
                  </span>
                </div>
              </div>

              <div className="slider-container mt-5 mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={criterion.weight}
                  onChange={(e) => {
                    const valor = Number(e.target.value);
                    handleWeightChange(criterion.id, Number.isFinite(valor) ? valor : 0);
                  }}
                  className="tw-weight-slider w-full h-2 rounded outline-none"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--primary-soft-border,#dbeafe) 0%, var(--primary,#3b82f6) 50%, var(--primary-soft-border,#dbeafe) 100%)",
                  }}
                />
              </div>

              <div className="criterion-description text-[13px] leading-[1.4] text-[var(--muted,#6b7280)]">
                {criterion.description}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="action-buttons flex gap-4 mt-4">
          <button
            type="button"
            className="btn-secondary flex-1 flex items-center justify-center gap-2
                       px-6 py-[14px] rounded-[10px] text-[14px] font-semibold
                       cursor-pointer outline-none border-0 transition-all duration-300 ease-in-out
                       bg-white text-[var(--muted-3,#4b5563)]
                       border-2 border-[var(--border,#e5e7eb)]
                       hover:bg-[#f9fafb] hover:border-[var(--border-2,#d1d5db)]
                       hover:-translate-y-[2px] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05)]"
            onClick={handleReset}
          >
            <span className="btn-icon text-[16px]">↺</span>
            Restaurar Padrões
          </button>

          <button
            type="button"
            className="btn-primary flex-1 flex items-center justify-center gap-2
                       px-6 py-[14px] rounded-[10px] text-[14px] font-semibold
                       cursor-pointer outline-none border-0 transition-all duration-300 ease-in-out
                       text-white
                       bg-gradient-to-br from-[var(--primary,#3b82f6)] to-[var(--primary-dark,#1d4ed8)]
                       shadow-[0_4px_6px_rgba(59,130,246,0.2)]
                       hover:bg-[linear-gradient(135deg,var(--primary-2,#2563eb),#1e40af)]
                       hover:-translate-y-[2px] hover:shadow-[0_6px_12px_rgba(59,130,246,0.3)]"
            onClick={handleSave}
          >
            <span className="btn-icon text-[16px]">📊</span>
            Atualizar Ranking
          </button>
        </div>
      </div>
    </div>
  );
}
