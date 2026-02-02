import { base } from '@airtable/blocks';
import Field from '@airtable/blocks/dist/types/src/models/field';
import RecordQueryResult from '@airtable/blocks/dist/types/src/models/record_query_result';
// ^^ Importações ^^ //

const dados = base.getTableByName("Dados - Alocação")
const historico = base.getTableByName("Forms - Alocação")
const querry_d = await dados.selectRecordsAsync();
const querry_h = await historico.selectRecordsAsync();
var id: number = 0
// ^^ constantes usadas ^^ //

export function Dispon(id) {
    const disponibilidade = dados.getFieldByName("Alocações")
    if (disponibilidade.type !== "multipleSelects") {
        throw new Error("Tipo de campo incompatível")
    }

    var alocado = querry_d.records[id]
}