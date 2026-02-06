import { useMembros, useMemMembros } from "./data_t";
import { get_info_proj, useProjetos } from "./data_q";
// ^^ Importações ^^ //

const macro_pe: string[] = [ "Avaliação Estratégica", "Plano Operacional", "Plano de Negócios", "Sumário Executivo" ]
const macro_sf: string[] = [ "Plano Financeiro", "EVE" ]
const macro_sm: string[] = [ "Plano de Marketing" ]
const macro_em: string[] = [ "Análise Setorial", "Pesquisa de Mercado", "Cliente Oculto" ]

// ^^ Constantes usadas ^^ //

export function useScores() {
  const dado = useMembros();
  const dado_2 = useMemMembros();
  const proj = useProjetos();
  const proj_dado = get_info_proj(dado_2, proj);

  return dado.map(record => {
    const apadrinhar = record.setor === "Gestão de Pessoas";
    const projInfo = proj_dado.find(p => p.m_id === record.id_membro);
    let sobrecarga = false;
    if(record.disponibilidade >= 3) {sobrecarga = true}
    console.log(projInfo?.disponibilidade)

    return {
      ...(projInfo ?? {}),
      id: record.id,
      padrinho: apadrinhar,
      sobrecarga: sobrecarga,
      bom: record.domina,
      ruim: record.dificuldade,
      gosta: record.prefere,
      nota_120: record.nota120,
      //disponibilidade: record.disponibilidade
    };
  });
}