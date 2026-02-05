import { get_membros } from "./data_t";
import { get_info_proj } from "./data_q";
// ^^ Importações ^^ //

const macro_pe: string[] = [ "Avaliação Estratégica", "Plano Operacional", "Plano de Negócios", "Sumário Executivo" ]
const macro_sf: string[] = [ "Plano Financeiro", "EVE" ]
const macro_sm: string[] = [ "Plano de Marketing" ]
const macro_em: string[] = [ "Análise Setorial", "Pesquisa de Mercado", "Cliente Oculto" ]

// ^^ Constantes usadas ^^ //

export function score() {
    const dado = get_membros()
    const proj_dado = get_info_proj()

    const scores = dado.map(record => {
        let score = 0;
        let apadrinhar = false;
        let nem_mostra = false;


        if (record.setor === "Gestão de Pessoas") { apadrinhar = true };

        if (record.extra === "Sim") {score += 1};
        if (record.alocacoes === 0) {score += 3}
        else if (record.alocacoes === 1) {score += 2} 
        else if (record.alocacoes === 2) {score += 1} 
        else if (record.alocacoes === 3) {nem_mostra = true};

        const proj = proj_dado.find(param => param.nome === record.name)

        return {
            ...(proj ?? {}),
            id: record.id,
            padrinho: apadrinhar,
            sobrecarga: nem_mostra,
            disponibilidade: record.alocacoes,
            bom: record.domina as string[],
            ruim: record.dificuldade as string[],
            gosta: record.prefere as string[],
            nota_120: record.nota120             
        }

    })  

    return scores;
}

