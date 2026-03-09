import React from "react";
import { useBase, useRecords } from "@airtable/blocks/ui";
import { get_field, get_count } from "./data_t";

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

export default function useProjectData() {
  const base = useBase();

  const table = base.getTableByName
    ? base.getTableByName("Dados - Alocação")
    : null;

  const tabela_proj = base.getTableByName
    ? base.getTableByName("Zapier - Pipefy - Projetos")
    : null;

  const records = table ? useRecords(table) : [];
  const base_projetos = tabela_proj ? useRecords(tabela_proj) : [];

  const lista_projetos = React.useMemo<Projeto[]>(() => {
    return base_projetos.map((record) => ({
      id: record.id,
      nome_p: get_field(record, "Projeto"),
      macro: get_field(record, "Macroetapas"),
      equipe: get_field(record, "Alocações"),
      NPS: get_count(record, "NPS"),
      QAP: get_count(record, "QAP"),
      cliente: record.getCellValue("Acompanhamento dos Projetos 4") as string,
      status: get_field(record, "Status"),
      escopo: get_count(record, "Dias de Escopo"),
    }));
  }, [base_projetos]);

  function semKickoff(value: unknown) {
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;

    if (typeof value === "string") {
      const v = value.trim();
      return v === "" || v === "-";
    }

    return false;
  }

  const nomes_projetos = React.useMemo<string[]>(() => {
    return (lista_projetos || [])
      .filter((projeto) => semKickoff(projeto.cliente))
      .map((projeto) => projeto.nome_p)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "pt", { sensitivity: "base" }));
  }, [lista_projetos]);

  return {
    base,
    table,
    records,
    lista_projetos,
    nomes_projetos,
  };
}
