import { useBase, useRecords } from "@airtable/blocks/ui"
import { get_field, get_count, useMembros, get_list, get_linked_ids , useMemMembros} from "./data_t"

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

type MemMembro = {
  id: string,
  nome: string,
  alocacoes: string[],
  n_aloc: number,
  status: string,
}

type Alocacao ={
  id: string,
  nome: string[],
  papel: string,
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
    equipe: get_linked_ids(proj, "Alocações"),
    NPS: get_count(proj, "NPS"),
    QAP: get_count(proj, "QAP"),
    cliente: String(get_field(proj, "Cliente")),
    status: String(get_field(proj, "Status")),
  }));
}



// ^^ funções usadas ^^ //


export function get_info_proj(membros: MemMembro[], projetos: Projeto[], aloca: Alocacao[]) {
  return membros.map((mem) => {
    var maem_mexp = 0, mape_mexp = 0, masf_mexp = 0, masm_mexp = 0;
    var m_nps = 0, m_qap = 0;
    var dispon = 0
    var dipon_mad = 0
    const status = mem.status

    projetos.forEach((exp) => {


      const status = String(exp.status ?? "").trim().toLowerCase();
      const finalizado = status.includes("finaliz");

      if (exp.equipe.some(eq => mem.alocacoes.includes(eq))) {
        const macro = exp.macro;

        if (macro_em.includes(macro)) maem_mexp += 1;
        else if (macro_pe.includes(macro)) mape_mexp += 1;
        else if (macro_sf.includes(macro)) masf_mexp += 1;
        else if (macro_sm.includes(macro)) masm_mexp += 1;

        
        const papel = aloca.find(p => p.nome[0] === mem.id)
        if (!finalizado && papel?.papel !== "Padrinho") dispon += 1
        if (papel?.papel === "Padrinho") dipon_mad += 1

        m_nps += Number(exp.NPS || 0);
        m_qap += Number(exp.QAP || 0);

      }
    });

    const total = maem_mexp + mape_mexp + masf_mexp + masm_mexp;
    console.log(mem.nome)
    console.log(dispon)
    console.log(dipon_mad)

    return {
      m_id: mem.id,
      nome: mem.nome,
      maem_exp: maem_mexp,
      mape_exp: mape_mexp,
      masf_exp: masf_mexp,
      masm_exp: masm_mexp,
      nps: total > 0 ? (m_nps / total) : 0,
      eficiencia: total > 0 ? (m_qap / total) : 0,
      disponibilidade: dispon,
      disp_madrinha: dipon_mad,
      status: status,
    };
  });
}