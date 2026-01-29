import {
  initializeBlock,
  useBase,
  useRecords
} from "@airtable/blocks/ui";
import React from "react";
import "./style.css";

/**
 * Dashboard principal - skeleton
 * - Mantém estrutura: left big project, middle columns, right profile+radar
 * - Dados: placeholders (vamos ligar ao Airtable depois)
 */

function Column({ title, items = [] }) {
  return (
    <div className="col-card">
      <div className="col-header">{title}</div>
      <div className="col-list">
        {items.length === 0 && <div className="col-empty">Sem dados</div>}
        {items.map((it, idx) => (
          <div key={idx} className="col-item">
            <div className="col-item-name">{it.name || `Pessoa ${idx + 1}`}</div>
            <div className={`badge ${idx <= 1 ? "badge-free" : idx === 2 ? "badge-1" : "badge-2"}`}>
              {idx <= 1 ? "Livre" : idx === 2 ? "1 Projeto" : "2 Projetos"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsPanel() {
  return (
    <div className="projects-panel">
      <div className="projects-header">Projeto...</div>
      <div className="projects-body">
        <p>
          Pesos e critérios usados para a avaliação do indivíduo selecionado
          (Depende do projeto)
        </p>
      </div>
    </div>
  );
}

function ProfileCard() {
  return (
    <div className="profile-card">
      <div className="profile-header">Consultor(a)</div>
      <div className="profile-body">
        <div className="avatar">👤</div>
        <div className="profile-info">
          <div className="profile-name">Nome do Consultor</div>
          <div className="profile-details">Critérios e detalhes do indivíduo</div>
        </div>
      </div>
    </div>
  );
}

function RadarNotes() {
  // placeholder SVG small radar-like graphic
  return (
    <div className="radar-card">
      <div className="radar-header">Notas do Consultor...</div>
      <div className="radar-body">
        <svg width="200" height="160" viewBox="0 0 200 160" aria-hidden>
          <polygon points="100,20 140,70 120,120 80,120 60,70" fill="#e6eefc" stroke="#cbd5e1" />
          <polygon points="100,40 132,78 116,110 84,110 68,78" fill="#cfe8ff" stroke="#a3bffa" />
        </svg>
      </div>
    </div>
  );
}

function Dashboard() {
  // placeholders; quando ligar ao Airtable, substituímos estes arrays por dados reais.
  const base = useBase();
  const table = base.getTableByName("Dados - Alocação");
  const records = useRecords(table);

  console.log("RECORDS DO AIRTABLE:", records);

  const samplePeople = new Array(12).fill(0).map((_, i) => ({ name: `Pessoa ${i + 1}` }));

  return (
    <div className="app">
      <h1>TESTE RELOAD</h1>
      <header className="app-header">
        <div className="logo">FGV Jr.</div>
        <div className="title">Dashboard de Alocações</div>
      </header>

      <main className="grid-container">
        <section className="left">
          <ProjectsPanel />
        </section>

        <section className="middle">
          <Column title="Consultores" items={samplePeople.slice(0, 12)} />
          <Column title="Gerentes" items={samplePeople.slice(0, 12)} />
          <Column title="Madrinhas" items={samplePeople.slice(0, 12)} />
        </section>

        <aside className="right">
          <ProfileCard />
          <RadarNotes />
        </aside>
      </main>
    </div>
  );
}

initializeBlock(() => <Dashboard />);