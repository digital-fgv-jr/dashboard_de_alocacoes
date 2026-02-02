import { base } from '@airtable/blocks';
import { useBase, useRecords } from '@airtable/blocks/ui'
import Field from '@airtable/blocks/dist/types/src/models/field';
import RecordQueryResult from '@airtable/blocks/dist/types/src/models/record_query_result';

// ^^ Importações ^^ //

const dados = base.getTableByName("Dados - Alocação")
const querry_d = await dados.selectRecordsAsync();

// ^^ constantes usadas ^^ //

type AirtableRecord = {
    id: string,
    name: string,
    getCellValue(fieldName: string): unknown;

};

// ^^ Types ^^ //



function get_field(record:AirtableRecord, fieldName:string) {
  const value = record.getCellValue(fieldName);
  if (
    typeof value === "string" && value.length === 0
    ||
    Array.isArray(value) && value.length === 0
  ) {
    return "—";
    } 
    else if (!value) 
    {
        return "—";
    }
 
  // Para múltiplas seleções
  if (Array.isArray(value)) {
    return value.map(v => v.name).join(", ");
  }

  // Para checkbox
  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  return value;
}


// Retorna um número seguro a partir do campo (linked records array, number, string)
function get_count(record:AirtableRecord, fieldName:string) {

  const val = record.getCellValue(fieldName);
  if (typeof val === "number" || !val || Array.isArray(val) || typeof val === "string") {

    if (!val) return 0;
    if (Array.isArray(val)) return val.length;
    if (typeof val === "number" && !Number.isNaN(val)) return val;
    if (Number.isNaN(val)) return 0;
  }

    if (typeof val == "string") {
        // se for string "2" etc
        const n = parseInt(val, 10);
        return isNaN(n) ? 0 : n;
        }

}



// ^^ funções usadas ^^ //


export function get_membros() {
    const info = useRecords(dados);

    const membro = (info || []).map(record => ({
        id: record.id,
        name: record.name,
        setor: get_field(record, "Setor"),
        prefere: get_field(record, "Qual Prefere"),
        domina: get_field(record, "Qual Domina"),
        dificuldade: get_field(record, "Qual Tem Dificuldade"),
        extra: get_field(record, "Disposto a fazer mais um"),
        alocacoes: get_count(record, "Alocações"),
        membroRaw: record.getCellValue("Membro"),

    }))
    return membro;

}
