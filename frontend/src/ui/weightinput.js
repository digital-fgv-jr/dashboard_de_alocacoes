import React, { useEffect, useMemo, useState, useRef } from "react";
import { RefreshCcw, BarChart3, User, UserCog, WeightIcon } from "lucide-react";
//import { backgroundColor, height} from "@airtable/blocks/dist/types/src/ui/system";

function trava_100(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

function handle_mannager(pesos, altura) {
  let acc = 0;
  const handles = [];

  for (let i = 0; i < pesos.length - 1; i++) {
    acc += (pesos[i].weight / 100) * altura;
    handles.push(acc);
  }
  return handles;
}

function montar_percentual(handles, altura, n) {
  const pontos = [0, ...handles, altura];

  const tamanho = [];

  for (let i = 0; i < n; i++) {
    tamanho.push(pontos[i + 1] - pontos[i]);
  }

  const total = tamanho.reduce((a, b) => a + b, 0) || 1;

  let percentual = tamanho.map((px) => Math.round((px / total) * 100));

  const eh_100 = percentual.reduce((a, b) => a + b, 0);
  percentual[percentual.length - 1] += 100 - eh_100;

  return percentual;
}

function nao_sobrepor(handles, idx, altura_mudada, altura, espacamento) {
  const antigo = idx === 0 ? 0 : handles[idx - 1];
  const novo = idx === handles.length - 1 ? altura : handles[idx + 1];

  const miny = antigo + espacamento;
  const maxy = novo - espacamento;

  return trava_100(altura_mudada, miny, maxy);
}

function getlocaly(e, barra) {
  const rect = barra.getBoundingClientRect();
  return e.clientY - rect.top;
}

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
      {
        id: "nps",
        name: "NPS do Consultor",
        weight: 30,
        description: "Satisfação média dos clientes anteriores",
        cor: "#7B4DE2",
      },
      {
        id: "experience",
        name: "Experiência na Área",
        weight: 25,
        description: "Número de projetos completos no setor do projeto",
        cor: "#64C273",
      },
      {
        id: "preferencia",
        name: "Preferência",
        weight: 20,
        description: "Avaliação técnica específica",
        cor: "#F5C247",
      },
      {
        id: "availability",
        name: "Disponibilidade",
        weight: 15,
        description: "Capacidade de dedicação ao projeto",
        cor: "#F4431E",
      },
      {
        id: "av_120",
        name: "Avaliação 120°",
        weight: 5,
        description: "Média final da avaliação 120 rodada",
        cor: "#E641A9",
      },
      {
        id: "qap",
        name: "Eficiência",
        weight: 5,
        description: "Média dos QAPs dos projetos realizados",
        cor: "#4AA3DF",
      },
    ]
  );

  useEffect(() => {
    if (initialCriteria) setCriteria(initialCriteria);
  }, [initialCriteria, area, projectId]);

  const totalWeight = criteria.reduce(
    (sum, criterion) => sum + criterion.weight,
    0
  );
  const barRef = useRef(null);
  const draggingIndexRef = useRef(null);

  const altura = 360;
  const minPct = 3;
  const espacamento = (minPct / 100) * altura;

  const n = criteria.length;

  const initialHandles = useMemo(() => {
    const src = initialCriteria ?? criteria;
    return handle_mannager(src, altura);
  }, [initialCriteria, altura, criteria]);

  const [handles, setHandles] = useState(initialHandles);

  function emitChange(nova_posicao) {
    const pct = montar_percentual(nova_posicao, altura, n);

    setCriteria((antes) =>
      antes.map((c, i) => ({
        ...c,
        weight: pct[i],
      }))
    );
  }

  useEffect(() => {
    setHandles(handle_mannager(initialCriteria ?? criteria, altura));
    draggingIndexRef.current = null;
  }, [initialCriteria, area, projectId, altura]);

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
        {
          id: "nps",
          name: "NPS do Consultor",
          weight: 30,
          description: "Satisfação média dos clientes anteriores",
        },
        {
          id: "experience",
          name: "Experiência na Área",
          weight: 25,
          description: "Anos de experiência no setor do projeto",
        },
        {
          id: "skill_match",
          name: "Habilidade Técnica",
          weight: 20,
          description: "Avaliação técnica específica",
        },
        {
          id: "availability",
          name: "Disponibilidade",
          weight: 15,
          description: "Capacidade de dedicação ao projeto",
        },
        {
          id: "cultural_fit",
          name: "Fit Cultural",
          weight: 10,
          description: "Adequação à cultura do cliente",
        },
      ]);
    }
  };

  function onPointerDownHandle(idx, e) {
    e.preventDefault();
    e.stopPropagation();

    draggingIndexRef.current = idx;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    const idx = draggingIndexRef.current;
    if (idx == null) return;

    const bar = barRef.current;
    if (!bar) return;

    const ymouse = getlocaly(e, bar);
    const ysafe = nao_sobrepor(handles, idx, ymouse, altura, espacamento);

    setHandles((anterior) => {
      const copia = [...anterior];
      copia[idx] = ysafe;

      emitChange(copia);

      return copia;
    });
  }

  function onpointerup() {
    if (draggingIndexRef.current == null) return;
    draggingIndexRef.current = null;
  }

  const segmentacao = useMemo(() => {
    const pontos = [0, ...handles, altura];
    const segmentos = [];

    for (let i = 0; i < n; i++) {
      segmentos.push(pontos[i + 1] - pontos[i]);
    }
    return segmentos;
  }, [handles, altura, n]);

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
        <div className="relative m-0 mb-4 pb-3 border-b-2 border-b-[var(--border,#e5e7eb)]">
          <h3 className="m-0 text-[20px] font-bold text-[var(--brand-dark,#0f3550)]">
            Critérios de Ranking
          </h3>
          <span className="absolute left-0 -bottom-[2px] w-[50px] h-[2px] bg-gradient-to-r from-[var(--primary,#3b82f6)] to-[var(--accent,#8b5cf6)]" />
        </div>
        <p className="m-0 text-[14px] leading-[1.5] text-[var(--muted,#6b7280)]">
          Ajuste a importância de cada critério para este projeto específico. Os
          pesos podem ser diferentes para cada área.
        </p>
        {/* Área selector */}
        <div
          className="rounded-xl p-[14px] border my-[14px] mb-[18px]
                        bg-[var(--surface,#f8fafc)] border-[var(--surface-border,#e2e8f0)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-[10px]">
              <span
                className="w-[34px] h-[34px] rounded-[10px]
                               inline-flex items-center justify-center
                               text-[16px] text-white
                               bg-gradient-to-br from-[var(--primary,#3b82f6)] to-[var(--primary-dark,#1d4ed8)]
                               shadow-[0_6px_14px_rgba(59,130,246,0.25)]"
              >
                <span className="flex items-center gap-1">
                  <WeightIcon size={14} className="shrink-0" />
                </span>
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
              <span
                className={[
                  "text-[24px] leading-none",
                  area === "consultores"
                    ? "drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]"
                    : "",
                ].join(" ")}
              >
                <span className="flex items-center gap-1">
                  <User size={32} className="shrink-0" />
                </span>
              </span>
              <span
                className={[
                  "text-[13px] font-bold",
                  area === "consultores"
                    ? "text-white"
                    : "text-[var(--brand-dark,#0f3550)]",
                ].join(" ")}
              >
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
              <span
                className={[
                  "text-[24px] leading-none",
                  area === "gerentes"
                    ? "drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]"
                    : "",
                ].join(" ")}
              >
                <span className="flex items-center gap-1">
                  <UserCog size={32} className="shrink-0" />
                </span>
              </span>
              <span
                className={[
                  "text-[13px] font-bold",
                  area === "gerentes"
                    ? "text-white"
                    : "text-[var(--brand-dark,#0f3550)]",
                ].join(" ")}
              >
                Gerentes
              </span>
            </button>
          </div>
        </div>
        <div className="flex gap-6 items-start">
          <div className="relative" style={{ width: 120 }}>
            <div
              ref={barRef}
              className="relative rounded-[12px] overflow-hidden border border-gray-300 select-none touch-none"
              style={{ width: 42, height: altura }}
              onPointerMove={onPointerMove}
              onPointerUp={onpointerup}
              onPointerCancel={onpointerup}
              onPointerLeave={onpointerup}
            >
              {segmentacao.map((h, i) => (
                <div
                  key={criteria[i]?.id ?? i}
                  style={{
                    height: h,
                    backgroundColor: criteria[i]?.cor ?? "#FFFFFF",
                  }}
                />
              ))}
            </div>

            {handles.map((y, i) => (
              <div
                key={i}
                className="absolute left-[42px]"
                style={{ top: y - 16 }}
              >
                <div className="flex items-center">
                  <div className="h-[3px] w-[28px] bg-gray-500" />
                  <div
                    className="w-8 h-8 rounded-full border-[3px] border-gray-500 bg-white cursor-grab active:cursor-grabbing select-none"
                    onPointerDown={(e) => onPointerDownHandle(i, e)}
                    title="Arraste para ajustar"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6 w-full" style={{ paddingTop: 6 }}>
            {criteria.map((criterion, i) => (
              <div
                key={criterion.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: criterion.cor ?? "#FFFFFF" }}
                  />
                  <span className="text-[16px] text-gray-700">
                    {criterion.name}
                  </span>
                </div>

                <div className="px-3 py-1 rounded-md border-2 border-gray-400 text-[14px] font-semibold min-w-[64px] text-center">
                  {criterion.weight}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="action-buttons flex gap-4 mt-4">
          <button
            type="button"
            className="btn-secondary flex-1 flex items-center justify-center gap-2
                       px-6 py-[14px] rounded-[10px] text-[14px] font-semibold
                       cursor-pointer outline-none border-0 transition-all duration-300 ease-in-out
                       bg-white text-[var(--muted-3,#4b5563)]
                       border-[var(--border,#e5e7eb)]
                       hover:bg-[#f9fafb] hover:border-[var(--border-2,#d1d5db)]
                       hover:-translate-y-[2px] hover:shadow-[0_4px_6px_rgba(0,0,0,0.05)]"
            onClick={handleReset}
          >
            <span className="btn-icon text-[16px]">
              <span className="flex items-center gap-1">
                <RefreshCcw size={18} className="shrink-0" />
              </span>
            </span>
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
            <span className="btn-icon text-[16px]">
              <span className="flex items-center gap-1">
                <BarChart3 size={18} className="shrink-0" />
              </span>
            </span>
            Atualizar Ranking
          </button>
        </div>
      </div>
    </div>
  );
}
