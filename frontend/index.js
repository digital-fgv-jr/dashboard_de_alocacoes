// frontend/index.js - Versão atualizada compacta
import React from "react";
import { initializeBlock, useBase, useRecords } from "@airtable/blocks/ui";

import "./style.css";

import Column from "./src/ui/column";
import ProjectsPanel from "./src/ui/projectspanel";
import ProfileCard from "./src/ui/profilecard";
import RadarNotes from "./src/ui/radarnotes";
import MemberDetail from "./src/ui/memberdetail";

function Dashboard() {
  const base = useBase();
  const table = base.getTableByName ? base.getTableByName("Dados - Alocação") : null;
  const records = useRecords(table) || [];

  const fieldNames = React.useMemo(() => {
    if (!table || !table.fields) return new Set();
    return new Set(table.fields.map((f) => f.name));
  }, [table]);
  
  const hasField = React.useCallback((n) => fieldNames.has(n), [fieldNames]);

  const radarFields = React.useMemo(() => {
    if (!table || !table.fields) return [];
    const keywords = ["comunic", "tecni", "proativ", "prazo", "qualidade", "nota", "score", "avalia"];
    return table.fields
      .map((f) => f.name)
      .filter((name) => keywords.some((k) => name.toLowerCase().includes(k)))
      .slice(0, 5);
  }, [table]);

  const people = React.useMemo(() => {
    return (records || []).map((r) => {
      const get = (n) => (hasField(n) && r.getCellValue ? r.getCellValue(n) : null);
      const name = (get("Name") || r.name || get("Membro") || "").toString().trim();
      const role = (get("Função") || get("Cargo") || "").toString() || "";
      const alocacoes = Number(get("Alocações") || get("Alocacoes") || get("Aloc") || 0) || 0;

      let photoUrl = null;
      const photoCell = get("Foto") || get("Image");
      if (Array.isArray(photoCell) && photoCell[0] && photoCell[0].url) {
        photoUrl = photoCell[0].url;
      }

      const description = (get("Descrição") || get("Descricao") || get("Bio") || "") || "";

      let projectsLinked = [];
      const projVal = get("Projeto") || get("Projetos");
      if (projVal) {
        if (Array.isArray(projVal)) {
          projectsLinked = projVal.map((x) => (x && x.name ? x.name : String(x)));
        } else {
          projectsLinked = [String(projVal)];
        }
      }

      const radar = { labels: [], values: [] };
      radarFields.forEach((f) => {
        radar.labels.push(f);
        const raw = (hasField(f) && r.getCellValue) ? r.getCellValue(f) : null;
        let v = 0;
        if (typeof raw === "number") v = raw;
        else if (typeof raw === "string") v = parseFloat(raw.replace(",", ".")) || 0;
        else if (raw && raw.value !== undefined) v = Number(raw.value) || 0;
        radar.values.push(v);
      });

      return {
        id: r.id,
        name,
        role,
        alocacoes,
        photoUrl,
        description,
        radar,
        projectsLinked,
        __rawRecord: r,
      };
    });
  }, [records, hasField, radarFields]);

  const projects = React.useMemo(() => {
    const s = new Set();
    (people || []).forEach((p) => {
      (p.projectsLinked || []).forEach((pr) => {
        if (pr && pr.trim()) s.add(pr.trim());
      });
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, "pt", { sensitivity: "base" }));
  }, [people]);

  const [selectedProject, setSelectedProject] = React.useState(null);
  const [selectedPerson, setSelectedPerson] = React.useState(null);
  const [view, setView] = React.useState("dashboard");

  const selectedProjectObj = React.useMemo(() => {
    if (!selectedProject) return null;
    const peopleInProject = (people || []).filter((p) => 
      (p.projectsLinked || []).includes(selectedProject)
    );
    
    if (peopleInProject.length === 0) return null;
    
    const sample = peopleInProject[0] ? peopleInProject[0].__rawRecord : null;
    let client = "-", status = "-";
    
    if (sample && sample.getCellValue) {
      client = (hasField("Cliente") ? sample.getCellValue("Cliente") : 
               (hasField("Client") ? sample.getCellValue("Client") : "-")) || "-";
      status = (hasField("Status") ? sample.getCellValue("Status") : "-") || "-";
    }
    
    return { 
      name: selectedProject, 
      client, 
      status, 
      peopleCount: peopleInProject.length 
    };
  }, [selectedProject, people, hasField]);

  const filteredPeople = selectedProject 
    ? people.filter((p) => (p.projectsLinked || []).includes(selectedProject))
    : people;

  const byName = (a, b) => a.name.localeCompare(b.name, "pt", { sensitivity: "base" });
  
  let consultants = (filteredPeople || []).filter((p) => 
    /consultor/i.test(p.role)
  ).sort(byName);
  
  let managers = (filteredPeople || []).filter((p) => 
    /gerent|manager|gerente/i.test(p.role)
  ).sort(byName);
  
  let madrinhas = (filteredPeople || []).filter((p) => 
    /madrinh/i.test(p.role)
  ).sort(byName);

  if (consultants.length === 0 && managers.length === 0 && madrinhas.length === 0) {
    const sorted = [...(filteredPeople || [])].sort(byName);
    const n = sorted.length;
    const firstCut = Math.ceil(n / 3);
    const secondCut = Math.ceil((2 * n) / 3);
    consultants = sorted.slice(0, firstCut);
    managers = sorted.slice(firstCut, secondCut);
    madrinhas = sorted.slice(secondCut);
  }

  const handleSelectPerson = (p) => {
    if (!p) return;
    const sanitized = {
      id: p.id,
      name: p.name,
      role: p.role,
      alocacoes: p.alocacoes,
      photoUrl: p.photoUrl,
      description: p.description,
      radar: p.radar,
      projectsLinked: p.projectsLinked,
    };
    setSelectedPerson(sanitized);
    setView("detail");
  };

  if (view === "detail" && selectedPerson) {
    return (
      <MemberDetail 
        person={selectedPerson} 
        onBack={() => { 
          setSelectedPerson(null); 
          setView("dashboard"); 
        }} 
      />
    );
  }

  return (
    <div className="grid-container">
      <header className="header-with-logo">
        <h1 className="app-title">FGV Jr. — Dashboard de Alocações</h1>
      </header>

      <div className="main-content">
        {/* SESSÃO 1: Projetos + 3 Colunas */}
        <div className="top-section">
          <ProjectsPanel
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            projectInfo={selectedProjectObj}
          />

          <div className="columns-container">
            <Column 
              title="Consultores" 
              items={consultants} 
              onSelect={handleSelectPerson} 
            />
            <Column 
              title="Gerentes" 
              items={managers} 
              onSelect={handleSelectPerson} 
            />
            <Column 
              title="Madrinhas" 
              items={madrinhas} 
              onSelect={handleSelectPerson} 
            />
          </div>
        </div>

        {/* SESSÃO 2: Aside Direito (SÓ APARECE QUANDO HÁ PESSOA SELECIONADA) */}
        {selectedPerson && (
          <div className="bottom-section">
            <aside className="right-aside">
              <ProfileCard person={selectedPerson} />
              {selectedPerson.radar && selectedPerson.radar.values && selectedPerson.radar.values.length > 0 ? (
                <div className="radar-card">
                  <h3 className="radar-header">Competências</h3>
                  <RadarNotes 
                    values={selectedPerson.radar.values} 
                    labels={selectedPerson.radar.labels} 
                  />
                </div>
              ) : (
                <div className="radar-card">
                  <h3 className="radar-header">Competências</h3>
                  <div className="radar-empty">Sem métricas para exibir</div>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

initializeBlock(() => <Dashboard />);