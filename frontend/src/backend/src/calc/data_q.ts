import { useBase, useRecords } from "@airtable/blocks/ui"
import { get_field, get_count, useMembros, get_list, get_linked_ids } from "./data_t"

// ^^ Imports ^^ //

const macro_pe: string[] = [ "Avaliação Estratégica", "Plano Operacional", "Plano de Negócios", "Sumário Executivo" ]
const macro_sf: string[] = [ "Plano Financeiro", "EVE" ]
const macro_sm: string[] = [ "Plano de Marketing" ]
const macro_em: string[] = [ "Análise Setorial", "Pesquisa de Mercado", "Cliente Oculto" ]

// ^^ Constantes usadas ^^ //

type Projeto = {
    id: string,
    nome_p: string,
    macro: string,
    equipe: string[],
    NPS: number,
    QAP: number,
    cliente: string,
    status: string,
}

type Membro = {
    id: string,
    nome: string,
    setor: string,
    prefere: string[],
    domina: string[],
    dificuldade: string[],
    extra: boolean,
    alocacoes: string[],
    nota120: number,
}

// ^^ Types ^^ //

export function useProjetos():Projeto[] {
  const base = useBase();
  const table = base.getTableByName("Zapier - Pipefy - Projetos");
  const records = useRecords(table);

  return (records || []).map((proj) => ({
    id: proj.id,
    nome_p: String(get_field(proj, "Projeto")),
    macro: String(get_field(proj, "Macroetapas")),
    equipe: get_list(proj, "Alocações"),
    NPS: get_count(proj, "NPS"),
    QAP: get_count(proj, "QAP"),
    cliente: String(get_field(proj, "Cliente")),
    status: String(get_field(proj, "Status")),
  }));
}



// ^^ funções usadas ^^ //


export function get_info_proj(membros: Membro[], projetos: Projeto[]) {
  return membros.map((mem) => {
    let maem_mexp = 0, mape_mexp = 0, masf_mexp = 0, masm_mexp = 0;
    let m_nps = 0, m_qap = 0;
    // let dispon = 0

    projetos.forEach((exp) => {
      const status = String(exp.status ?? "").trim().toLowerCase();
      // const finalizado = status === "finalizado";

      if (exp.equipe.some(equipe => mem.alocacoes.includes(equipe))) {
        const macro = Array.isArray(exp.macro) ? (exp.macro[0] ?? "") : (exp.macro ?? "");

        if (macro_em.includes(macro)) maem_mexp += 1;
        else if (macro_pe.includes(macro)) mape_mexp += 1;
        else if (macro_sf.includes(macro)) masf_mexp += 1;
        else if (macro_sm.includes(macro)) masm_mexp += 1;

        // if (!finalizado) dispon += 1

        m_nps += Number(exp.NPS || 0);
        m_qap += Number(exp.QAP || 0);
      }
    });

    const total = maem_mexp + mape_mexp + masf_mexp + masm_mexp;

    return {
      nome: mem.nome,
      maem_exp: maem_mexp,
      mape_exp: mape_mexp,
      masf_exp: masf_mexp,
      masm_exp: masm_mexp,
      nps: total > 0 ? (m_nps / total) : 0,
      eficiencia: total > 0 ? (m_qap / total) : 0,
      // disponibilidade: dispon
    };
  });
}