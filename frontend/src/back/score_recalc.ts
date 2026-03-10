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

function clamp10(value: number): number {
  return Math.max(0, Math.min(10, value));
}

function getMacroScore(
  macroe: string,
  values: {
    em?: number;
    pe?: number;
    sf?: number;
    sm?: number;
  }
): number {
  if (macro_em.includes(macroe)) return values.em ?? 0;
  if (macro_pe.includes(macroe)) return values.pe ?? 0;
  if (macro_sf.includes(macroe)) return values.sf ?? 0;
  if (macro_sm.includes(macroe)) return values.sm ?? 0;
  return 0;
}

function getAvailabilityScore(disponibilidade?: number): number {
  if (disponibilidade === 0) return 10;
  if (disponibilidade === 1) return 6.67;
  if (disponibilidade === 2) return 3.33;
  return 0;
}

function getPreferenciaConsultor(
  macroe: string,
  gosta?: string[],
  bom?: string[],
  ruim?: string[]
): number {
  const prefere = Array.isArray(gosta) ? gosta : [];
  const domina = Array.isArray(bom) ? bom : [];
  const dificuldade = Array.isArray(ruim) ? ruim : [];

  let pref = 5;

  if (prefere.includes(macroe)) pref += 2;
  if (domina.includes(macroe)) pref += 3;
  if (dificuldade.includes(macroe)) pref -= 5;

  return clamp10(pref);
}

function getPreferenciaGerente(
  macroe: string,
  gosta?: string[],
  bom?: string[],
  ruim?: string[],
  extra?: boolean
): number {
  const prefere = Array.isArray(gosta) ? gosta : [];
  const domina = Array.isArray(bom) ? bom : [];
  const dificuldade = Array.isArray(ruim) ? ruim : [];

  let pref = 5;

  if (prefere.includes(macroe)) pref += 2;
  if (domina.includes(macroe)) pref += 2;
  if (dificuldade.includes(macroe)) pref -= 5;
  if (extra) pref += 1;

  return clamp10(pref);
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}

export function recalcConsultores(
  scores: MembroScore[] = [],
  selectedProjectObj: ProjectObj,
  pesosConsultores: PesosRanking
): ScoreResult[] {
  return (scores || []).map((membro) => {
    const macroe = selectedProjectObj?.macro ?? "";

    const disponibilidadeScore = getAvailabilityScore(membro.disponibilidade);
    const av120Score = clamp10(membro.nota_120 ?? 0);
    const preferenciaScore = getPreferenciaConsultor(
      macroe,
      membro.gosta,
      membro.bom,
      membro.ruim
    );

    const experienceScore = clamp10(
      getMacroScore(macroe, {
        em: membro.maem_exp,
        pe: membro.mape_exp,
        sf: membro.masf_exp,
        sm: membro.masm_exp,
      })
    );

    const npsScore = clamp10(
      getMacroScore(macroe, {
        em: membro.maem_nps,
        pe: membro.mape_nps,
        sf: membro.masf_nps,
        sm: membro.masm_nps,
      })
    );

    const qapScore = clamp10(
      getMacroScore(macroe, {
        em: membro.maem_ef,
        pe: membro.mape_ef,
        sf: membro.masf_ef,
        sm: membro.masm_ef,
      })
    );

    let nota = 0;

    nota += disponibilidadeScore * pesosConsultores.availability;
    nota += av120Score * pesosConsultores.av_120;
    nota += preferenciaScore * pesosConsultores.preferencia;
    nota += experienceScore * pesosConsultores.experience;
    nota += npsScore * pesosConsultores.nps;
    nota += qapScore * pesosConsultores.qap;


    if ((membro.disponibilidade ?? 0) >= 3) {
      nota = 0;
    }

    return {
      id: membro.id,
      nome: (membro.nome ?? "").trim(),
      score: roundScore(nota),
    };
  });
}

export function recalcGerentes(
  scores: MembroScore[] = [],
  selectedProjectObj: ProjectObj,
  pesosGerentes: PesosRanking
): ScoreResult[] {
  return (scores || []).map((membro) => {
    const macroe = selectedProjectObj?.macro ?? "";

    const disponibilidadeScore = getAvailabilityScore(membro.disponibilidade);
    const av120Score = clamp10(membro.nota_120 ?? 0);
    const preferenciaScore = getPreferenciaGerente(
      macroe,
      membro.gosta,
      membro.bom,
      membro.ruim,
      membro.extra
    );

    const experienceScore = clamp10(
      getMacroScore(macroe, {
        em: membro.maem_exp,
        pe: membro.mape_exp,
        sf: membro.masf_exp,
        sm: membro.masm_exp,
      })
    );

    const npsScore = clamp10(
      getMacroScore(macroe, {
        em: membro.maem_nps,
        pe: membro.mape_nps,
        sf: membro.masf_nps,
        sm: membro.masm_nps,
      })
    );

    const qapScore = clamp10(
      getMacroScore(macroe, {
        em: membro.maem_ef,
        pe: membro.mape_ef,
        sf: membro.masf_ef,
        sm: membro.masm_ef,
      })
    );

    let nota = 0;

    nota += disponibilidadeScore * pesosGerentes.availability;
    nota += av120Score * pesosGerentes.av_120;
    nota += preferenciaScore * pesosGerentes.preferencia;
    nota += experienceScore * pesosGerentes.experience;
    nota += npsScore * pesosGerentes.nps;
    nota += qapScore * pesosGerentes.qap;

    if ((membro.disponibilidade ?? 0) >= 3) {
      nota = 0;
    }

    return {
      id: membro.id,
      nome: (membro.nome ?? "").trim(),
      score: roundScore(nota),
    };
  });
}

export function recalcMadrinhas(
  scores: MembroScore[] = []
): ScoreResult[] {
  return (scores || []).map((membro) => {
    const disp = membro.disp_madrinha ?? 0;

    let score = 0;
    if (disp === 0) score = 10;
    else if (disp === 1) score = 8;
    else if (disp === 2) score = 6;
    else if (disp === 3) score = 4;
    else if (disp === 4) score = 2;
    else score = 0;

    return {
      id: membro.id,
      nome: (membro.nome ?? "").trim(),
      score,
    };
  });
}