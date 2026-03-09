import { macro_em, macro_pe, macro_sf, macro_sm } from "../Utils/proj_macros";

export type PesosRanking = {
  nps: number;
  experience: number;
  preferencia: number;
  availability: number;
  av_120: number;
  qap: number;
};

export type ProjectObj = {
  macro?: string;
} | null;

export type ScoreResult = {
  id: string;
  nome: string;
  score: number;
};

export type MembroScore = {
  id: string;
  nome: string;
  disponibilidade?: number;
  disp_madrinha?: number;
  nota_120?: number;
  gosta?: string[];
  bom?: string[];
  ruim?: string[];
  extra?: boolean;

  maem_exp?: number;
  masf_exp?: number;
  masm_exp?: number;
  mape_exp?: number;

  maem_nps?: number;
  masf_nps?: number;
  masm_nps?: number;
  mape_nps?: number;

  maem_ef?: number;
  masf_ef?: number;
  masm_ef?: number;
  mape_ef?: number;
};

export function recalcConsultores(
  scores: MembroScore[] = [],
  selectedProjectObj: ProjectObj,
  pesosConsultores: PesosRanking
): ScoreResult[] {
  return (scores || []).map((membro) => {
    const dispon = membro.disponibilidade;
    const macroe = selectedProjectObj?.macro ?? "";
    const av_120 = membro.nota_120 ?? 0;
    const prefere = Array.isArray(membro.gosta) ? membro.gosta : [];
    const bom = Array.isArray(membro.bom) ? membro.bom : [];
    const ruim = Array.isArray(membro.ruim) ? membro.ruim : [];
    const em_exp = membro.maem_exp ?? 0;
    const sf_exp = membro.masf_exp ?? 0;
    const sm_exp = membro.masm_exp ?? 0;
    const pe_exp = membro.mape_exp ?? 0;
    const em_nps = membro.maem_nps ?? 0;
    const sf_nps = membro.masf_nps ?? 0;
    const sm_nps = membro.masm_nps ?? 0;
    const pe_nps = membro.mape_nps ?? 0;
    const em_qap = membro.maem_ef ?? 0;
    const sf_qap = membro.masf_ef ?? 0;
    const sm_qap = membro.masm_ef ?? 0;
    const pe_qap = membro.mape_ef ?? 0;

    const pesos = pesosConsultores;
    let nota = 0;

    if (dispon === 0) nota += 3 * pesos.availability;
    else if (dispon === 1) nota += 2 * pesos.availability;
    else if (dispon === 2) nota += 1 * pesos.availability;

    nota += av_120 * pesos.av_120;

    let pref = 5;
    if (prefere.includes(macroe)) pref += 2;
    if (bom.includes(macroe)) pref += 3;
    if (ruim.includes(macroe)) pref -= 5;

    nota += pref * pesos.preferencia;

    if (macro_em.includes(macroe)) nota += em_exp * pesos.experience;
    else if (macro_pe.includes(macroe)) nota += pe_exp * pesos.experience;
    else if (macro_sf.includes(macroe)) nota += sf_exp * pesos.experience;
    else if (macro_sm.includes(macroe)) nota += sm_exp * pesos.experience;

    if (macro_em.includes(macroe)) nota += em_nps * pesos.nps;
    else if (macro_pe.includes(macroe)) nota += pe_nps * pesos.nps;
    else if (macro_sf.includes(macroe)) nota += sf_nps * pesos.nps;
    else if (macro_sm.includes(macroe)) nota += sm_nps * pesos.nps;

    if (macro_em.includes(macroe)) nota += em_qap * pesos.qap;
    else if (macro_pe.includes(macroe)) nota += pe_qap * pesos.qap;
    else if (macro_sf.includes(macroe)) nota += sf_qap * pesos.qap;
    else if (macro_sm.includes(macroe)) nota += sm_qap * pesos.qap;

    if ((dispon ?? 0) >= 3) nota = 0;

    return {
      id: membro.id,
      nome: membro.nome,
      score: nota,
    };
  });
}

export function recalcGerentes(
  scores: MembroScore[] = [],
  selectedProjectObj: ProjectObj,
  pesosGerentes: PesosRanking
): ScoreResult[] {
  return (scores || []).map((membro) => {
    const extra = membro.extra;
    const dispon = membro.disponibilidade;
    const macroe = selectedProjectObj?.macro ?? "";
    const av_120 = membro.nota_120 ?? 0;
    const prefere = Array.isArray(membro.gosta) ? membro.gosta : [];
    const bom = Array.isArray(membro.bom) ? membro.bom : [];
    const ruim = Array.isArray(membro.ruim) ? membro.ruim : [];
    const em_exp = membro.maem_exp ?? 0;
    const sf_exp = membro.masf_exp ?? 0;
    const sm_exp = membro.masm_exp ?? 0;
    const pe_exp = membro.mape_exp ?? 0;
    const em_nps = membro.maem_nps ?? 0;
    const sf_nps = membro.masf_nps ?? 0;
    const sm_nps = membro.masm_nps ?? 0;
    const pe_nps = membro.mape_nps ?? 0;
    const em_qap = membro.maem_ef ?? 0;
    const sf_qap = membro.masf_ef ?? 0;
    const sm_qap = membro.masm_ef ?? 0;
    const pe_qap = membro.mape_ef ?? 0;

    const pesos = pesosGerentes;
    let nota = 0;

    if (dispon === 0) nota += 3 * pesos.availability;
    else if (dispon === 1) nota += 2 * pesos.availability;
    else if (dispon === 2) nota += 1 * pesos.availability;

    nota += av_120 * pesos.av_120;

    let pref = 5;
    if (prefere.includes(macroe)) pref += 2;
    if (bom.includes(macroe)) pref += 2;
    if (ruim.includes(macroe)) pref -= 5;
    if (extra) pref += 1;

    nota += pref * pesos.preferencia;

    if (macro_em.includes(macroe)) nota += em_exp * pesos.experience;
    else if (macro_pe.includes(macroe)) nota += pe_exp * pesos.experience;
    else if (macro_sf.includes(macroe)) nota += sf_exp * pesos.experience;
    else if (macro_sm.includes(macroe)) nota += sm_exp * pesos.experience;

    if (macro_em.includes(macroe)) nota += em_nps * pesos.nps;
    else if (macro_pe.includes(macroe)) nota += pe_nps * pesos.nps;
    else if (macro_sf.includes(macroe)) nota += sf_nps * pesos.nps;
    else if (macro_sm.includes(macroe)) nota += sm_nps * pesos.nps;

    if (macro_em.includes(macroe)) nota += em_qap * pesos.qap;
    else if (macro_pe.includes(macroe)) nota += pe_qap * pesos.qap;
    else if (macro_sf.includes(macroe)) nota += sf_qap * pesos.qap;
    else if (macro_sm.includes(macroe)) nota += sm_qap * pesos.qap;

    if ((dispon ?? 0) >= 3) nota = 0;

    return {
      id: membro.id,
      nome: membro.nome,
      score: nota,
    };
  });
}

export function recalcMadrinhas(
  scores: MembroScore[] = []
): ScoreResult[] {
  return (scores || []).map((membro) => {
    const dispon = membro.disp_madrinha ?? 0;

    return {
      id: membro.id,
      nome: membro.nome,
      score: dispon,
    };
  });
}