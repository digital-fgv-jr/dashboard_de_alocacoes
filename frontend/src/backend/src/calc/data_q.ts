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
  proj: string[],
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
    var maem_mnps = 0, mape_mnps = 0, masf_mnps = 0, masm_mnps = 0;
    var maem_mqap = 0, mape_mqap = 0, masf_mqap = 0, masm_mqap = 0;

    var dispon = 0
    var dipon_mad = 0
    const status = mem.status

    projetos.forEach((exp) => {


      const status = String(exp.status ?? "").trim().toLowerCase();
      const finalizado = status.includes("finaliz");

      if (exp.equipe.some(eq => mem.alocacoes.includes(eq))) {
        const macro = exp.macro;

        let grupo = aloca.filter(p => mem.id === p.nome[0])
        let papel = grupo.find(p => exp.id === p.proj[0])

        if (macro_em.includes(macro) && papel?.papel !== "Padrinho") maem_mexp += 1;
        else if (macro_pe.includes(macro) && papel?.papel !== "Padrinho") mape_mexp += 1;
        else if (macro_sf.includes(macro) && papel?.papel !== "Padrinho") masf_mexp += 1;
        else if (macro_sm.includes(macro) && papel?.papel !== "Padrinho") masm_mexp += 1;

        if (macro_em.includes(macro) && papel?.papel !== "Padrinho") maem_mnps += exp.NPS;
        else if (macro_pe.includes(macro) && papel?.papel !== "Padrinho") mape_mnps += exp.NPS;
        else if (macro_sf.includes(macro) && papel?.papel !== "Padrinho") masf_mnps += exp.NPS;
        else if (macro_sm.includes(macro) && papel?.papel !== "Padrinho") masm_mnps += exp.NPS;

        if (macro_em.includes(macro) && papel?.papel !== "Padrinho") maem_mqap += exp.QAP;
        else if (macro_pe.includes(macro) && papel?.papel !== "Padrinho") mape_mqap += exp.QAP;
        else if (macro_sf.includes(macro) && papel?.papel !== "Padrinho") masf_mqap += exp.QAP;
        else if (macro_sm.includes(macro) && papel?.papel !== "Padrinho") masm_mqap += exp.QAP;

        if (!finalizado && papel?.papel !== "Padrinho") dispon += 1
        if (!finalizado && papel?.papel === "Padrinho") dipon_mad += 1

        console.log(mem.nome)
        console.log(dispon)
        console.log(dipon_mad)
        console.log(papel?.papel)

      }
    });

    return {
      m_id: mem.id,
      nome: mem.nome,
      maem_exp: maem_mexp,
      mape_exp: mape_mexp,
      masf_exp: masf_mexp,
      masm_exp: masm_mexp,
      maem_nps: maem_mexp > 0 ? maem_mnps/maem_mexp : 0,
      masf_nps: masf_mexp > 0 ? masf_mnps/masf_mexp : 0,
      masm_nps: masm_mexp > 0 ? masm_mnps/masm_mexp : 0,
      mape_nps: mape_mexp > 0 ? mape_mnps/mape_mexp : 0,
      maem_ef: maem_mexp > 0 ? maem_mqap/maem_mexp : 0,
      masf_ef: masf_mexp > 0 ? masf_mexp/masf_mexp : 0,
      mape_ef: mape_mexp > 0 ? mape_mqap/mape_mexp : 0,
      masm_ef: masm_mexp > 0 ? masm_mqap/masm_mexp : 0,
      disponibilidade: dispon,
      disp_madrinha: dipon_mad,
      status: status,
    };
  });
}