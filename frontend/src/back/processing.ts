import { useMembros, useMemMembros, useAloc } from "./data_t";
import { get_info_proj, useProjetos } from "./data_q";
import { useXp } from "./exp"

// ^^ Importações ^^ //

const macro_pe: string[] = [ "Avaliação Estratégica", "Plano Operacional", "Plano de Negócios", "Sumário Executivo" ]
const macro_sf: string[] = [ "Plano Financeiro", "EVE" ]
const macro_sm: string[] = [ "Plano de Marketing" ]
const macro_em: string[] = [ "Análise Setorial", "Pesquisa de Mercado", "Cliente Oculto" ]

type Projeto = {
  id: string;
  nome_p: string;
  macro: string;
  equipe: string[];
  NPS: number;
  QAP: number;
  cliente: string;
  status: string;
  escopo: number;
};

type MembroScore = {
  id: string;
  m_id: string;
  nome: string;
  padrinho: boolean;
  sobrecarga: boolean;
  bom: string[];
  ruim: string[];
  gosta: string[];
  nota_120: number;
  maem_exp: number;
  mape_exp: number;
  masf_exp: number;
  masm_exp: number;
  maem_nps: number;
  masf_nps: number;
  masm_nps: number;
  mape_nps: number;
  maem_ef: number;
  masf_ef: number;
  mape_ef: number;
  masm_ef: number;
  disponibilidade: number;
  disp_madrinha: number;
  status: string;
};

// ^^ Types ^^ //

export function useScores(selproj: Projeto | null): MembroScore[] {
  const xp = useXp(selproj);
  const dado = useMembros();
  const dado_2 = useMemMembros();
  const proj = useProjetos();
  const alocacao = useAloc();
  const proj_dado = get_info_proj(dado_2, proj, alocacao, xp);

  return dado.map((record): MembroScore => {
    const apadrinhar = record.setor === "Gestão de Pessoas";
    const projInfo = proj_dado.find((p) => p.m_id === record.id_membro);

    const info = projInfo ?? {
      m_id: "",
      nome: "",
      maem_exp: 0,
      mape_exp: 0,
      masf_exp: 0,
      masm_exp: 0,
      maem_nps: 0,
      masf_nps: 0,
      masm_nps: 0,
      mape_nps: 0,
      maem_ef: 0,
      masf_ef: 0,
      mape_ef: 0,
      masm_ef: 0,
      disponibilidade: 0,
      disp_madrinha: 0,
      status: "",
    };
    console.log("Test", { 
      maem_nps: info.maem_nps,
      masf_nps: info.masf_nps,
      masm_nps: info.masm_nps,
      mape_nps: info.mape_nps,
      maem_ef: info.maem_ef,
      masf_ef: info.masf_ef,
      mape_ef: info.mape_ef,
      masm_ef: info.masm_ef,
    })

    const sobrecarga = info.disponibilidade >= 3;

    return {
      id: record.id ?? "",
      m_id: info.m_id,
      nome: info.nome,
      maem_exp: info.maem_exp,
      mape_exp: info.mape_exp,
      masf_exp: info.masf_exp,
      masm_exp: info.masm_exp,
      maem_nps: info.maem_nps,
      masf_nps: info.masf_nps,
      masm_nps: info.masm_nps,
      mape_nps: info.mape_nps,
      maem_ef: info.maem_ef *2,
      masf_ef: info.masf_ef *2,
      mape_ef: info.mape_ef *2,
      masm_ef: info.masm_ef *2,
      disponibilidade: info.disponibilidade,
      disp_madrinha: info.disp_madrinha,
      status: info.status,
      padrinho: apadrinhar,
      sobrecarga,
      bom: record.domina ?? [],
      ruim: record.dificuldade ?? [],
      gosta: record.prefere ?? [],
      nota_120: record.nota120 ?? 0,
    };
  });
}