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


// ^^ Constantes usadas ^^ //

export function useScores(selproj: Projeto) {
  const xp = useXp(selproj)
  const dado = useMembros();
  const dado_2 = useMemMembros();
  const proj = useProjetos();
  const alocacao = useAloc();
  const proj_dado = get_info_proj(dado_2, proj, alocacao, xp);

  return dado.map(record => {
    const apadrinhar = record.setor === "Gestão de Pessoas";
    const projInfo = proj_dado.find(p => p.m_id === record.id_membro);
    let sobrecarga = false;
    let dis_nor = projInfo?.disponibilidade ?? 0
    if(dis_nor >= 3) {sobrecarga = true}
    

    return {
      ...(projInfo ?? {}),
      id: record.id,
      padrinho: apadrinhar,
      sobrecarga: sobrecarga,
      bom: record.domina,
      ruim: record.dificuldade,
      gosta: record.prefere,
      nota_120: record.nota120,

    };
  });
}