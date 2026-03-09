import { useBase, useRecords } from "@airtable/blocks/ui";
import {
  get_field,
  get_count,
  useMembros,
  get_list,
  get_linked_ids,
  useMemMembros,
} from "./data_t";

// ^^ Imports ^^ //

const macro_pe: string[] = [
  "Avaliação Estratégica",
  "Plano Operacional",
  "Plano de Negócios",
  "Sumário Executivo",
];
const macro_sf: string[] = ["Plano Financeiro", "EVE"];
const macro_sm: string[] = ["Plano de Marketing"];
const macro_em: string[] = [
  "Análise Setorial",
  "Pesquisa de Mercado",
  "Cliente Oculto",
];

// ^^ Constantes usadas ^^ //

type InfoProj = {
  m_id: string;
  nome: string;
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

type Experiencia = {
  nome: string;
  xp_pe: number;
  xp_sf: number;
  xp_sm: number;
  xp_em: number;
};

type MemMembro = {
  id: string;
  nome: string;
  alocacoes: string[];
  n_aloc: number;
  status: string;
};

type Alocacao = {
  id: string;
  nome: string[];
  proj: string[];
  papel: string;
};

// ^^ Types ^^ //

export function useProjetos(): Projeto[] {
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
    escopo: get_count(proj, "Dias de Escopo"),
  }));
}

// ^^ funções usadas ^^ //

export function get_info_proj(
  membros: MemMembro[],
  projetos: Projeto[],
  aloca: Alocacao[],
  xp: Experiencia[]
): InfoProj[] {
  const xp_max_em = () => {
    const membro_mais_xp: Experiencia = xp.reduce((max, membro) => {
      return membro.xp_em > max.xp_em ? membro : max;
    });
    return membro_mais_xp.xp_em;
  };

  const xp_max_sf = () => {
    const membro_mais_xp: Experiencia = xp.reduce((max, membro) => {
      return membro.xp_sf > max.xp_sf ? membro : max;
    });
    return membro_mais_xp.xp_sf;
  };

  const xp_max_pe = () => {
    const membro_mais_xp: Experiencia = xp.reduce((max, membro) => {
      return membro.xp_pe > max.xp_pe ? membro : max;
    });
    return membro_mais_xp.xp_pe;
  };

  const xp_max_sm = () => {
    const membro_mais_xp: Experiencia = xp.reduce((max, membro) => {
      return membro.xp_sm > max.xp_sm ? membro : max;
    });
    return membro_mais_xp.xp_sm;
  };

  return membros.map((mem) => {
    var maem_n = 0,
      mape_n = 0,
      masf_n = 0,
      masm_n = 0;
    var maem_mnps = 0,
      mape_mnps = 0,
      masf_mnps = 0,
      masm_mnps = 0;
    var maem_mqap = 0,
      mape_mqap = 0,
      masf_mqap = 0,
      masm_mqap = 0;

    var dispon = 0;
    var dipon_mad = 0;
    var em_xp = 0,
      pe_xp = 0,
      sf_xp = 0,
      sm_xp = 0;
    const status = mem.status;

    projetos.forEach((exp) => {
      const status = String(exp.status ?? "")
        .trim()
        .toLowerCase();
      const finalizado = status.includes("finaliz");

      if (exp.equipe.some((eq) => mem.alocacoes.includes(eq))) {
        const macro = exp.macro;

        let grupo = aloca.filter((p) => mem.id === p.nome[0]);
        let papel = grupo.find((p) => exp.id === p.proj[0]);

        if (
          macro_em.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          finalizado &&
          papel?.papel !== "Coordenador"
        )
          maem_n++;
        else if (
          macro_pe.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          finalizado &&
          papel?.papel !== "Coordenador"
        )
          mape_n++;
        else if (
          macro_sf.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          finalizado &&
          papel?.papel !== "Coordenador"
        )
          masf_n++;
        else if (
          macro_sm.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          finalizado &&
          papel?.papel !== "Coordenador"
        )
          masm_n++;

        if (
          macro_em.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          papel?.papel !== "Coordenador"
        )
          maem_mnps += exp.NPS;
        else if (
          macro_pe.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          papel?.papel !== "Coordenador"
        )
          mape_mnps += exp.NPS;
        else if (
          macro_sf.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          papel?.papel !== "Coordenador"
        )
          masf_mnps += exp.NPS;
        else if (
          macro_sm.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          papel?.papel !== "Coordenador"
        )
          masm_mnps += exp.NPS;

        if (
          macro_em.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          papel?.papel !== "Coordenador"
        )
          maem_mqap += exp.QAP;
        else if (
          macro_pe.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          papel?.papel !== "Coordenador"
        )
          mape_mqap += exp.QAP;
        else if (
          macro_sf.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          papel?.papel !== "Coordenador"
        )
          masf_mqap += exp.QAP;
        else if (
          macro_sm.includes(macro) &&
          papel?.papel !== "Padrinho" &&
          papel?.papel !== "Coordenador"
        )
          masm_mqap += exp.QAP;

        if (
          !finalizado &&
          papel?.papel !== "Padrinho" &&
          papel?.papel !== "Coordenador"
        )
          dispon += 1;
        if (!finalizado && papel?.papel === "Padrinho") dipon_mad += 1;

        xp.forEach((x) => {
          if (x.nome === mem.nome)
            if (
              macro_sf.includes(macro) &&
              papel?.papel !== "Padrinho" &&
              papel?.papel !== "Coordenador"
            )
              sf_xp = x.xp_sf;
            else if (
              macro_em.includes(macro) &&
              papel?.papel !== "Padrinho" &&
              papel?.papel !== "Coordenador"
            )
              em_xp = x.xp_em;
            else if (
              macro_pe.includes(macro) &&
              papel?.papel !== "Padrinho" &&
              papel?.papel !== "Coordenador"
            )
              pe_xp = x.xp_pe;
            else if (
              macro_sm.includes(macro) &&
              papel?.papel !== "Padrinho" &&
              papel?.papel !== "Coordenador"
            )
              sm_xp = x.xp_sm;
        });
      }
    });

    return {
      m_id: mem.id ?? "",
      nome: mem.nome ?? "",
      maem_exp: (em_xp / xp_max_em()) * 10,
      mape_exp: (pe_xp / xp_max_pe()) * 10,
      masf_exp: (sf_xp / xp_max_sf()) * 10,
      masm_exp: (sm_xp / xp_max_sm()) * 10,
      maem_nps: maem_n > 0 ? maem_mnps / maem_n : 0,
      masf_nps: masf_n > 0 ? masf_mnps / masf_n : 0,
      masm_nps: masm_n > 0 ? masm_mnps / masm_n : 0,
      mape_nps: mape_n > 0 ? mape_mnps / mape_n : 0,
      maem_ef: maem_n > 0 ? maem_mqap / maem_n : 0,
      masf_ef: masf_n > 0 ? masf_mqap / masf_n : 0,
      mape_ef: mape_n > 0 ? mape_mqap / mape_n : 0,
      masm_ef: masm_n > 0 ? masm_mqap / masm_n : 0,
      disponibilidade: dispon ?? 0,
      disp_madrinha: dipon_mad ?? 0,
      status: status,
    };
  });
}
