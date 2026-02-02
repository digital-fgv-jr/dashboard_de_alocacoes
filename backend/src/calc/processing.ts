import { get_membros } from "./data";
import { base } from "@airtable/blocks"
import { useBase, useRecords } from '@airtable/blocks/ui'

// ^^ Importações ^^ //

const historico = base.getTableByName("Forms - Alocação")
const querry_h = await historico.selectRecordsAsync()

// ^^ Constantes usadas ^^ //



export function score() {
    const dado = get_membros()
    var score = 0;
    var apadrinhar = false;
    var nem_mostra = false;
    
    const scores = dado.map(record => {
        if (record.setor === "Gestão de Pessoas") { apadrinhar = true };

        if (record.extra === "Sim") {score += 5};

        if (record.alocacoes === 0) {score += 15}
        else if (record.alocacoes === 1) {score += 10} 
        else if (record.alocacoes === 2) {score += 5} 
        else if (record.alocacoes === 3) {nem_mostra = true};

        return {
            id: record.id,
            nome: record.name,
            padrinho: apadrinhar,
            sobrecarga: nem_mostra,
            score: score

        }

    })  

    return scores;
}