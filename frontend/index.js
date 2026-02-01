import {
  initializeBlock,
  useBase,
  useRecords
} from "@airtable/blocks/ui";
import React from "react";
import "./style.css";
import Column from "./src/ui/column"
import ProjectsPanel from "./src/ui/projectspanel";
import ProfileCard from "./src/ui/profilecard";
import RadarNotes from "./src/ui/radarnotes";


function getField(record, fieldName) {
  const value = record.getCellValue(fieldName);
  if (!value || value.length === 0) return "—";

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
function getCount(record, fieldName) {
  const val = record.getCellValue(fieldName);
  if (!val) return 0;
  if (Array.isArray(val)) return val.length;
  if (typeof val === "number") return val;
  // se for string "2" etc
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}


function Dashboard() {
  // placeholders; quando ligar ao Airtable, substituímos estes arrays por dados reais.
  const base = useBase();
  const table = base.getTableByName("Dados - Alocação");
  const records = useRecords(table);

  const [selectedPerson, setSelectedPerson] = React.useState(null);

  console.log("RECORDS DO AIRTABLE:", records);

  const people = (records || []).map(record => ({
  id: record.id,
  name: record.name,
  setor: getField(record, "Setor"),
  prefere: getField(record, "Qual Prefere"),
  domina: getField(record, "Qual Domina"),
  dificuldade: getField(record, "Qual Tem Dificuldade"),
  extra: getField(record, "Disposto a fazer mais um"),
  // número de alocações (0 quando vazio)
  alocacoes: getCount(record, "Alocações"),
  // opcional: campo "Membro" bruto (se for usado para filtrar roles)
  membroRaw: record.getCellValue("Membro"),
}));

// filtrar por role (ajuste os termos 'consultor', 'gerent', 'madrinha' se necessário)
const consultores = people.filter(p => {
  if (!p.membroRaw) return false;
  if (Array.isArray(p.membroRaw)) {
    return p.membroRaw.some(m => (m.name || String(m)).toLowerCase().includes("consultor"));
  }
  return String(p.membroRaw).toLowerCase().includes("consultor");
});
const gerentes = people.filter(p => {
  if (!p.membroRaw) return false;
  if (Array.isArray(p.membroRaw)) {
    return p.membroRaw.some(m => (m.name || String(m)).toLowerCase().includes("gerent"));
  }
  return String(p.membroRaw).toLowerCase().includes("gerent");
});
const madrinhas = people.filter(p => {
  if (!p.membroRaw) return false;
  if (Array.isArray(p.membroRaw)) {
    return p.membroRaw.some(m => (m.name || String(m)).toLowerCase().includes("madrinha"));
  }
  return String(p.membroRaw).toLowerCase().includes("madrinha");
});


  return (
    <div className="app">
      <h1>Dashboard de Alocações</h1>
      <header className="app-header">
        <div className="logo">FGV Jr.</div>
        <div className="title">Dashboard de Alocações</div>
      </header>

      <main className="grid-container">
        <section className="left">
          <ProjectsPanel />
        </section>

        <section className="middle">
          <Column
            title="Membros"
            items={people}
            onSelect={setSelectedPerson}
          />

        </section>

        <aside className="right">
          <ProfileCard person={selectedPerson} />
          <RadarNotes />
        </aside>
      </main>
    </div>
  );
}

initializeBlock(() => <Dashboard />);