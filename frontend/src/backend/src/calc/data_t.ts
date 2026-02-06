import { base } from '@airtable/blocks';
import { useBase, useRecords } from '@airtable/blocks/ui'

// ^^ Importações ^^ //

const dados = base.getTableByName("Dados - Alocação")

// ^^ constantes usadas ^^ //

type AirtableRecord = {
    id: string,
    name: string,
    getCellValue(fieldName: string): unknown;

};

type Membro = {
    id: string,
    nome: string,
    setor: string,
    prefere: string[],
    domina: string[],
    dificuldade: string[],
    extra: boolean,
    alocacoes: number,
    nota120: number,
}

// ^^ Types ^^ //


export function get_field(record:AirtableRecord, fieldName:string) {
  const value = record.getCellValue(fieldName);

  if (typeof value === "boolean") return value;

  if (typeof value === "number") return value;

  if (value == null) return "-";

  if (typeof value === "object" && "name" in value && typeof (value as any).name === "string") {
    return (value as any).name;
  }

  if (typeof value === "string") {
    return value.length === 0 ? "-" : value;
  }

  return "-";
}


export function get_count(record:AirtableRecord, fieldName:string) {

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
    
      return 0;

}

export function get_list(record: AirtableRecord, fieldName: string): string[] {
  const value = record.getCellValue(fieldName);

  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((v:any) => v?.name ?? String(v));
  }

  // fallback defensivo (não deveria acontecer pelo seu modelo)
  if (typeof value === "string" && value !== "-") {
    return [value];
  }

  return [];
}




// ^^ funções usadas ^^ //



export function useMembros(): Membro[] {
  const base = useBase();
  const table = base.getTableByName("Dados - Alocação");
  const records = useRecords(table);

  const membros = (records || []).map((record) => ({
    id: record.id,
    nome: get_field(record, "Membro"),
    setor: get_field(record, "Setor") as string,
    prefere: get_list(record, "Qual Prefere") as string[],
    domina: get_list(record, "Qual Domina") as string[],
    dificuldade: get_list(record, "Qual Tem Dificuldade") as string[],
    extra: get_field(record, "Disposto a fazer mais um") as boolean,
    alocacoes: get_count(record, "Alocações"),
    nota120: get_count(record, "Av 120"),
  }));

  return membros;
}
