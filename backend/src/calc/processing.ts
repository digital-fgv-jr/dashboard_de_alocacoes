import { get_membros } from "./data_t";
import { get_info_proj } from "./data_q";
// ^^ Importações ^^ //

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

        const proj = proj_dado.find(param => param.name == record.name)

        return {
            id: record.id,
            name: record.name,
            padrinho: apadrinhar,
            sobrecarga: nem_mostra,
            score: score+record.nota120,
            notas: proj
        }

    })  

    return scores;
}

// Manter em mente o fato de faltar adicionar os pesos inputáveis //