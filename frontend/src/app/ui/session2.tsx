import React from "react";
import {
  getAvailabilityStatus,
  getAvailabilityScore,
} from "../../Utils/dispon";
import {
  macro_em,
  macro_pe,
  macro_sf,
  macro_sm,
} from "../../Utils/proj_macros";
import {
  ArrowLeft,
  ClipboardEdit,
  Star,
  ThumbsUp,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import RadarNotes from "./radarnotes";

type ScoreItem = {
  id: string;
  nome: string;
  score: number;
};

type Pesos = {
  nps: number;
  experience: number;
  preferencia: number;
  availability: number;
  av_120: number;
  qap: number;
};

type SelectedProjectObj = {
  name: string;
  macro: string;
} | null;

type SelectedPerson = {
  id: string;
  name: string;
  photoUrl?: string | null;
  disponibilidade?: number;
  disp_madrinha?: number;
  gosta?: string[];
  bom?: string[];
  ruim?: string[];
  extra?: boolean;
  maem_exp?: number;
  mape_exp?: number;
  masf_exp?: number;
  masm_exp?: number;
  maem_nps?: number;
  mape_nps?: number;
  masf_nps?: number;
  masm_nps?: number;
  maem_ef?: number;
  mape_ef?: number;
  masf_ef?: number;
  masm_ef?: number;
  nps?: number;
  nota_120?: number;
  eficiencia?: number;
  [key: string]: unknown;
};

type CriteriaMetric = {
  name: string;
  value: number;
  description: string;
  color: string;
  percentage: number;
};

type Session2Props = {
  selectedPerson: SelectedPerson | null;
  colunaOrigem: string | null;
  selectedProject: string | null;
  selectedProjectObj: SelectedProjectObj;
  selectedArea: "consultores" | "gerentes" | "madrinhas" | string;
  pesosConsultores: Pesos;
  pesosGerentes: Pesos;
  pesosMadrinhas: Pesos;
  score_recalc_consultores: ScoreItem[];
  score_recalc_gerentes: ScoreItem[];
  score_recalc_madrinhas: ScoreItem[];
  handleGoBack: () => void;
};

export default function Session2(props: Session2Props): JSX.Element | null {
  const {
    selectedPerson,
    colunaOrigem,
    selectedProject,
    selectedProjectObj,
    selectedArea,
    pesosConsultores,
    pesosGerentes,
    pesosMadrinhas,
    score_recalc_consultores,
    score_recalc_gerentes,
    score_recalc_madrinhas,
    handleGoBack,
  } = props;

  if (!selectedPerson) return null;

  const Allocations = selectedPerson?.disponibilidade ?? 0;
  const Aloc_Madrinha = selectedPerson.disp_madrinha ?? 0;

  let totalAllocations: number | string = "-";
  if (colunaOrigem === "Madrinhas") {
    totalAllocations = Aloc_Madrinha;
  } else if (colunaOrigem === "Consultores" || colunaOrigem === "Gerentes") {
    totalAllocations = Allocations;
  } else {
    totalAllocations = 0;
  }

  const availabilityStatus = getAvailabilityStatus(Number(totalAllocations));
  const availabilityScore = getAvailabilityScore(Number(totalAllocations));

  const clamp10 = (v: number): number => Math.max(0, Math.min(10, v));

  const num = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const macro = selectedProjectObj?.macro ?? "";

  const experienceScore = macro_em.includes(macro)
    ? num(selectedPerson?.maem_exp)
    : macro_pe.includes(macro)
    ? num(selectedPerson?.mape_exp)
    : macro_sf.includes(macro)
    ? num(selectedPerson?.masf_exp)
    : macro_sm.includes(macro)
    ? num(selectedPerson?.masm_exp)
    : 0;


  const npsScore = macro_em.includes(macro)
    ? num(selectedPerson?.maem_nps)
    : macro_pe.includes(macro)
    ? num(selectedPerson?.mape_nps)
    : macro_sf.includes(macro)
    ? num(selectedPerson?.masf_nps)
    : macro_sm.includes(macro)
    ? num(selectedPerson?.masm_nps)
    : 0;

  const qapScore = macro_em.includes(macro)
    ? num(selectedPerson?.maem_ef)
    : macro_pe.includes(macro)
    ? num(selectedPerson?.mape_ef)
    : macro_sf.includes(macro)
    ? num(selectedPerson?.masf_ef)
    : macro_sm.includes(macro)
    ? num(selectedPerson?.masm_ef)
    : 0;


  const preferenciaScore = (() => {
    const gosta = Array.isArray(selectedPerson?.gosta)
      ? selectedPerson.gosta
      : [];
    const bom = Array.isArray(selectedPerson?.bom) ? selectedPerson.bom : [];
    const ruim = Array.isArray(selectedPerson?.ruim) ? selectedPerson.ruim : [];
    const extra = selectedPerson.extra;

    let s = 5;
    if (gosta.includes(macro)) s += 2;
    if (bom.includes(macro)) s += 2;
    if (ruim.includes(macro)) s -= 5;
    if (extra) s += 1;

    return clamp10(s);
  })();

  const radarLabels = [
    "NPS",
    "Experiência",
    "Avaliação 120°",
    "Disponibilidade",
    "Preferência",
    "Eficiência",
  ];

  const radarValues = [
    clamp10(num(npsScore)),
    clamp10(experienceScore),
    clamp10(num(selectedPerson?.nota_120)),
    clamp10(availabilityScore),
    clamp10(preferenciaScore),
    clamp10(num(qapScore)),
  ];

  const criteriaList: CriteriaMetric[] = [
    {
      name: "NPS do Profissional",
      value: radarValues[0],
      description: "Satisfação média do cliente",
      color: "#3b82f6",
    },
    {
      name: "Experiência na Área",
      value: radarValues[1],
      description: "Experiência na macroetapa selecionada",
      color: "#10b981",
    },
    {
      name: "Avaliação 120°",
      value: radarValues[2],
      description: "Média final da avaliação 120°",
      color: "#f59e0b",
    },
    {
      name: "Disponibilidade",
      value: radarValues[3],
      description: "Baseada no número de projetos",
      color: "#8b5cf6",
    },
    {
      name: "Preferência",
      value: radarValues[4],
      description: "Afinidade com o tipo de projeto",
      color: "#ef4444",
    },
    {
      name: "Eficiência",
      value: radarValues[5],
      description: "Média dos QAPs",
      color: "#ec4899",
    },
  ].map((m) => ({
    ...m,
    percentage: Math.round((m.value / 10) * 100),
  }));

  let peso: Pesos | number = 0;
  if (colunaOrigem === "Consultores") {
    peso = pesosConsultores;
  } else if (colunaOrigem === "Gerentes") {
    peso = pesosGerentes;
  } else if (colunaOrigem === "Madrinhas") {
    peso = pesosMadrinhas;
  }

  const layoutMode = selectedProject ? "selected" : "empty";

  const overallScore = radarValues.length
    ? radarValues.reduce((a, b) => a + b, 0) / radarValues.length
    : 0;

  return (
    <div className="w-full">
      <div className="col-span-full bg-white rounded-xl px-6 py-5 mb-6 border border-[var(--border,#e5e7eb)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-6 max-[1200px]:flex-col max-[1200px]:items-start max-[1200px]:gap-4">
          <button
            className="bg-white border border-[var(--border-2,#d1d5db)] text-[14px] font-medium cursor-pointer px-[18px] py-[10px] rounded-lg flex items-center gap-2 h-[44px] shrink-0 transition-all duration-200 text-[var(--muted-3,#4b5563)] hover:bg-[#f3f4f6] hover:border-[var(--muted-2,#9ca3af)] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] max-[1200px]:self-start"
            onClick={handleGoBack}
          >
            <ArrowLeft size={18} className="shrink-0" />
            <span className="whitespace-nowrap">Voltar para Alocações</span>
          </button>

          <div className="flex-1 flex flex-col gap-[6px]">
            <h1 className="text-[28px] font-extrabold m-0 leading-[1.2] text-[var(--brand-dark,#0f3550)]">
              Perfil do Membro
            </h1>
            <p className="text-[15px] m-0 font-medium text-[var(--muted,#6b7280)]">
              Detalhes e métricas de avaliação
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-full grid gap-5 grid-cols-[320px_1fr_380px] h-[calc(100vh-240px)] min-h-[600px] max-[1200px]:grid-cols-3 max-[1200px]:h-auto max-[1200px]:gap-4">
        <div className="bg-white rounded-xl p-6 border border-[var(--border,#e5e7eb)] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col items-center text-center gap-4 pb-5 border-b border-[var(--border,#e5e7eb)]">
            <div className="relative w-[100px] h-[100px]">
              {selectedPerson.photoUrl ? (
                <img
                  src={selectedPerson.photoUrl}
                  alt={selectedPerson.name}
                  className="w-full h-full rounded-full object-cover border-4 border-[var(--card-bg,#ffffff)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-[36px] font-bold text-white bg-[linear-gradient(135deg,var(--brand-dark,#0f3550),var(--brand-mid,#1e4a6e))] border-4 border-[var(--card-bg,#ffffff)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  {selectedPerson.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-[14px] border-[3px] border-[var(--card-bg,#ffffff)]"
                style={{
                  backgroundColor: availabilityStatus.color,
                  boxShadow: `0 0 0 3px ${availabilityStatus.color}20`,
                }}
              ></div>
            </div>

            <div className="w-full">
              <h3 className="text-[20px] font-bold m-0 mb-2 text-[var(--brand-dark,#0f3550)]">
                {selectedPerson.name}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-[10px] p-4 border border-[var(--border,#e5e7eb)] flex flex-col gap-3">
            <div>
              <h4 className="text-[15px] font-semibold m-0 text-[var(--brand-dark,#0f3550)]">
                Status de Disponibilidade
              </h4>
            </div>

            <div className="flex flex-col gap-2">
              <div
                className="text-[16px] font-bold flex items-center gap-2"
                style={{ color: availabilityStatus.color }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[14px] border-[3px] border-[var(--card-bg,#ffffff)]"
                  style={{
                    backgroundColor: availabilityStatus.color,
                    boxShadow: `0 0 0 3px ${availabilityStatus.color}20`,
                  }}
                ></div>
                <span className="ml-1">{availabilityStatus.text}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-y border-[var(--border,#e5e7eb)]">
                <span className="text-[13px] font-semibold text-[var(--muted,#6b7280)]">
                  Pontuação:
                </span>
                <span className="text-[16px] font-bold text-[var(--text-strong,#1f2937)]">
                  {availabilityScore.toFixed(1)}/10
                </span>
              </div>

              <p className="text-[13px] m-0 leading-[1.4] text-[var(--muted,#6b7280)]">
                {availabilityStatus.description}
              </p>
            </div>
          </div>

          <div className="rounded-[10px] p-[18px] border border-[var(--primary-soft-border,#dbeafe)] text-center bg-[linear-gradient(135deg,var(--surface,#f8fafc),var(--surface-2,#e2e8f0))]">
            <div>
              <h4 className="text-[15px] font-semibold m-0 mb-3 text-[var(--brand-dark,#0f3550)]">
                Nota Geral
              </h4>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-[32px] font-extrabold leading-none text-[var(--brand-dark,#0f3550)]">
                {selectedArea === "consultores"
                  ? score_recalc_consultores.find(
                      (p) => p.nome === selectedPerson.name
                    )?.score ?? "-"
                  : selectedArea === "gerentes"
                  ? score_recalc_gerentes.find(
                      (p) => p.nome === selectedPerson.name
                    )?.score ?? "-"
                  : score_recalc_madrinhas.find(
                      (p) => p.nome === selectedPerson.name
                    )?.score ?? "-"}
                <span className="text-[18px] font-semibold ml-1 text-[var(--muted,#6b7280)]">
                  /10
                </span>
              </div>

              <div className="inline-block text-[14px] font-semibold px-3 py-[6px] rounded-full text-[var(--primary,#3b82f6)] bg-[color-mix(in_srgb,var(--primary,#3b82f6)_12%,transparent)]">
                {overallScore >= 8 ? (
                  <span className="flex items-center gap-1">
                    <Star size={14} className="shrink-0" /> Excelente
                  </span>
                ) : overallScore >= 6 ? (
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} className="shrink-0" /> Bom
                  </span>
                ) : overallScore >= 4 ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle size={14} className="shrink-0" /> Regular
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <ClipboardEdit size={14} className="shrink-0" /> A Melhorar
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[var(--border,#e5e7eb)] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border,#e5e7eb)]">
            <h3 className="text-[18px] font-bold m-0 text-[var(--brand-dark,#0f3550)]">
              Perfil de Habilidades
            </h3>

            <div className="text-white px-[14px] py-[6px] rounded-full font-bold text-[15px] flex items-center gap-[6px] bg-[linear-gradient(135deg,var(--primary,#3b82f6),var(--primary-dark,#1d4ed8))]">
              <span className="flex items-center gap-1">
                <Star size={14} className="shrink-0" />
              </span>
              <span>{overallScore.toFixed(1)}</span>
            </div>
          </div>

          {radarValues.length > 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[10px] border border-[var(--surface-border,#e2e8f0)] p-[10px] bg-[var(--surface,#f8fafc)] h-[340px] mb-[10px]">
              <div className="w-full flex items-center justify-center h-[300px]">
                <RadarNotes values={radarValues} labels={radarLabels} />
              </div>

              <div className="flex justify-center gap-5 mt-[15px] pt-[15px] border-t border-[var(--border,#e5e7eb)] w-full">
                <div className="flex items-center gap-2 text-[12px] text-[var(--muted,#6b7280)]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#3b82f6]" />
                  <span>Avaliação do Membro</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[var(--muted,#6b7280)]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#e2e8f0]" />
                  <span>Escala de Referência</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] p-[30px] border-2 border-dashed w-full bg-[var(--surface,#f8fafc)] border-[var(--border-2,#d1d5db)] h-[340px]">
              <div className="text-[40px] opacity-40 mb-[10px]">
                <span className="flex items-center gap-1">
                  <BarChart3 size={14} className="shrink-0" />
                </span>
              </div>
              <div className="text-[16px] font-semibold text-center text-[var(--muted-3,#4b5563)]">
                Sem dados de habilidades
              </div>
              <p className="text-[14px] text-center m-0 leading-[1.4] max-w-[80%] text-[var(--muted-2,#9ca3af)]">
                Adicione métricas de avaliação para visualizar o perfil gráfico.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-[var(--border,#e5e7eb)] flex flex-col gap-6 overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border,#e5e7eb)]">
            <h3 className="text-[18px] font-bold m-0 text-[var(--brand-dark,#0f3550)]">
              Métricas Detalhadas
            </h3>

            <div className="px-3 py-1 rounded-xl text-[13px] font-semibold bg-[var(--chip-bg,#f3f4f6)] text-[var(--muted,#6b7280)]">
              {criteriaList.length} critérios
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {criteriaList.map((metric, index) => {
              const v = Number(metric.value.toFixed(1));

              const statusClass =
                v >= 8
                  ? "bg-[#d1fae5] text-[#065f46]"
                  : v >= 6
                  ? "bg-[#fef3c7] text-[#92400e]"
                  : v >= 4
                  ? "bg-[#dbeafe] text-[#1e40af]"
                  : "bg-[#fee2e2] text-[#991b1b]";

              const statusText =
                v >= 8
                  ? "Excelente"
                  : v >= 6
                  ? "Bom"
                  : v >= 4
                  ? "Regular"
                  : "A Melhorar";

              return (
                <div
                  key={index}
                  className="rounded-[10px] p-[18px] border border-[var(--surface-border,#e2e8f0)] bg-[var(--surface,#f8fafc)]"
                >
                  <div className="flex items-center justify-between mb-[10px]">
                    <div className="flex items-center gap-[10px]">
                      <span className="text-[12px] font-bold w-6 h-6 rounded-[6px] flex items-center justify-center border border-[var(--primary-soft-border,#dbeafe)] text-[var(--primary,#3b82f6)] bg-[var(--card-bg,#ffffff)]">
                        0{index + 1}
                      </span>
                      <span className="text-[15px] font-semibold text-[var(--text-strong,#1f2937)]">
                        {metric.name}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-[2px]">
                      <span className="text-[20px] font-bold text-[var(--brand-dark,#0f3550)]">
                        {Number(metric.value.toFixed(2))}
                      </span>
                      <span className="text-[14px] text-[var(--muted-2,#9ca3af)]">
                        /10
                      </span>
                    </div>
                  </div>

                  <div className="text-[13px] mb-3 leading-[1.4] text-[var(--muted,#6b7280)]">
                    {metric.description}
                  </div>

                  <div className="mt-3">
                    <div className="h-2 rounded overflow-hidden mb-2 bg-[var(--border,#e5e7eb)]">
                      <div
                        className="h-full rounded transition-[width] duration-[700ms] ease-out"
                        style={{
                          width: `${metric.percentage}%`,
                          background: metric.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[var(--muted,#6b7280)]">
                        {metric.percentage}%
                      </span>

                      <span
                        className={`text-[11px] font-bold px-[10px] py-1 rounded-xl uppercase ${statusClass}`}
                      >
                        {statusText}
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
}
