import { useBase, useRecords } from '@airtable/blocks/ui'

// ^^ Importações ^^ //

// ^^ constantes usadas ^^ //

type AirtableRecord = {
    id: string,
    name: string,
    getCellValue(fieldName: string): unknown;

};

type LinkedRecordCellValue = Array<{ id: string; name?: string }>;

type Membro = {
    id: string,
    nome: string,
    id_membro: string,
    setor: string,
    prefere: string[],
    domina: string[],
    dificuldade: string[],
    extra: boolean,
    alocacoes: string[],
    disponibilidade: number,
    nota120: number,
}

type MemMembro = {
  id: string,
  nome: string,
  alocacoes: string[],
  n_aloc: number,
}

type Alocacao ={
  id: string,
  nome: string[],
  papel: string,
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

export function get_linked_ids(record: AirtableRecord, fieldName: string): string[] {
  const value = record.getCellValue(fieldName) as LinkedRecordCellValue | null;
  if (!value) return [];
  return value.map(v => v.id);
}


// ^^ funções usadas ^^ //



export function useMembros(): Membro[] {
  const base = useBase();
  const table = base.getTableByName("Dados - Alocação");
  const records = useRecords(table);

  const membros = (records || []).map((record) => ({
    id: record.id,
    nome: String(get_field(record, "Membro")),
    id_membro: String(get_linked_ids(record, "Membro")),
    setor: String(get_field(record, "Setor")),
    prefere: get_list(record, "Qual Prefere") as string[],
    domina: get_list(record, "Qual Domina") as string[],
    dificuldade: get_list(record, "Qual Tem Dificuldade") as string[],
    extra: get_field(record, "Disposto a fazer mais um") as boolean,
    alocacoes: get_list(record, "Alocações"),
    disponibilidade: get_count(record, "Alocações"),
    nota120: get_count(record, "Av 120"),
  }));

  return membros;
}

export function useMemMembros(): MemMembro[] {
  const base = useBase();
  const tabela = base.getTableByName("Membros");
  const dados = useRecords(tabela);

  const memembros = (dados || []).map(record => ({
    id: record.id,
    nome: get_field(record, "Nome"),
    alocacoes: get_linked_ids(record, "Alocações"),
    n_aloc: get_count(record, "Alocações")
  }))

  return memembros;
}

export function useAloc(): Alocacao[] {
  const base = useBase();
  const tabela_aloc = base.getTableByName("Forms - Alocações")
  const dados_aloc = useRecords(tabela_aloc)

  const alocacoes_g = (dados_aloc || []).map(record => ({
    id: record.id,
    nome: get_linked_ids(record, "Membro"),
    papel: get_field(record, "Papel"),
  }))

  return alocacoes_g;
}
