import React from "react";
import { initializeBlock, useBase, useRecords } from "@airtable/blocks/ui";


import "./style/base.css"
import "./style/layout.css"
import "./style/scroll.css"

import "./style/responsive.css"

import Column from "./src/ui/column";
import ProjectsPanel from "./src/ui/projectspanel";
import RadarNotes from "./src/ui/radarnotes";
import ProjectRankingConfig from "./src/ui/weightinput";
import { useScores } from "./src/backend/src/calc/processing";
import { get_field, get_count } from "./src/backend/src/calc/data_t";
import { useMemo } from "react";
import { useTailwindReady } from "../tailwind-cdn";

function Dashboard() {
  const base = useBase();
  const table = base.getTableByName ? base.getTableByName("Dados - Alocação") : null;
  const tabela_proj = base.getTableByName ? base.getTableByName("Zapier - Pipefy - Projetos") : null;
  const records = useRecords(table) || [];
  const scores = useScores()
  const base_projetos = tabela_proj ? useRecords(tabela_proj) : [];
  const macro_pe = [ "Avaliação Estratégica", "Plano Operacional", "Plano de Negócios", "Sumário Executivo" ]
  const macro_sf = [ "Plano Financeiro", "EVE" ]
  const macro_sm = [ "Plano de Marketing" ]
  const macro_em = [ "Análise Setorial", "Pesquisa de Mercado", "Cliente Oculto" ]

  const lista_projetos = React.useMemo(() => {
    return base_projetos.map((records) => ({
      id:records.id,
      nome: get_field(records, "Projeto"),
      macro: get_field(records, "Macroetapas"),
      equipe: get_count(records, "Alocações"),
      kickoff: records.getCellValue("Acompanhamento dos Projetos 4")
    }))
  }, [base_projetos]);

  const nomes_projetos = React.useMemo (() => {
    return (lista_projetos || [])
    .filter(projeto => !projeto.kickoff)
    .map(projeto => projeto.nome)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt", {sensitivity: "base"}));
  }, [lista_projetos]);

  const [pesosConsultores, setPesosConsultores] = React.useState({
    nps: 0.17,
    experience: 0.17,
    preferencia: 0.17,
    availability: 0.17,
    av_120: 0.16,
    qap: 0.16,
  });

  const [pesosGerentes, setPesosGerentes] = React.useState({
    nps: 0.17,
    experience: 0.17,
    preferencia: 0.17,
    availability: 0.17,
    av_120: 0.16,
    qap: 0.16,
  });

  const [pesosMadrinhas, setPesosMadrinhas] = React.useState({
    nps: 0,
    experience: 0,
    preferencia: 0,
    availability: 1,
    av_120: 0,
    qap: 0,
  });


  const fieldNames = React.useMemo(() => {
    if (!table || !table.fields) return new Set();
    return new Set(table.fields.map((f) => f.name));
  }, [table]);

  const scoresArr = React.useMemo(() => {
    if (scores instanceof Map) return Array.from(scores.values());
    return Array.isArray(scores) ? scores : [];
  }, [scores]);


  const nota_membro = React.useMemo(() => {
    const membro = new Map();

    scoresArr.forEach((rec) => {
     if (rec && rec.id != null) {
        membro.set(rec.id, rec);
      }
    });

   return membro;
  }, [scoresArr]);

  
  const hasField = React.useCallback((n) => fieldNames.has(n), [fieldNames]);

  const radarFields = React.useMemo(() => {
    if (!table || !table.fields) return [];
    const keywords = ["comunic", "tecni", "proativ", "prazo", "qualidade", "nota", "score", "avalia", "qap"];    
    return table.fields
      .map((f) => f.name)
      .filter((name) => keywords.some((k) => name.toLowerCase().includes(k)))
      .slice(0, 6);
  }, [table]);

  const people = React.useMemo(() => {
  return (records || []).map((r) => {
    const get = (n) => {
      if (!r || !r.getCellValue) return null;
      try {
        return r.getCellValue(n);
      } catch (e) {
        return null;
      }
    };

    const name = String(get("Name") || r.name || get("Membro") || "").trim();
    const role = String(get("Função") || get("Cargo") || "");

    let photoUrl = null;
    const photoCell = get("Foto") || get("Image");
    if (Array.isArray(photoCell) && photoCell[0] && photoCell[0].url) {
      photoUrl = photoCell[0].url;
    }

    const de_process = nota_membro ? nota_membro.get(r.id) : null;

    const description = String(get("Descrição") || get("Descricao") || get("Bio") || "");

    let projectsLinked = [];
    const projVal = get("Projeto") || get("Projetos");
    if (projVal) {
      projectsLinked = Array.isArray(projVal)
        ? projVal.map((x) => (x && x.name ? x.name : String(x)))
        : [String(projVal)];
    }

    const radar = { labels: [], values: [] };
    (radarFields || []).forEach((f) => {
      radar.labels.push(f);
      const raw = get(f);
      let v = 0;
      if (typeof raw === "number") v = raw;
      else if (typeof raw === "string") v = parseFloat(raw.replace(",", ".")) || 0;
      else if (raw && raw.value !== undefined) v = Number(raw.value) || 0;
      radar.values.push(v);
    });


    return {
      ...(de_process || {}),
      id: r.id,
      name,
      role,
      photoUrl,
      description,
      radar,
      projectsLinked,
      __rawRecord: r,
    };
  });
}, [records, radarFields, nota_membro]);


  const [selectedProject, setSelectedProject] = React.useState(null);
  const [selectedPerson, setSelectedPerson] = React.useState(null);
  const [colunaOrigem, setColunaOrigem] = React.useState(null);
  const [selectedProjects, setSelectedProjects] = React.useState({});
  const [selectedArea, setSelectedArea] = React.useState("consultores");


  const handleWeightsChange = (area, obj) => {
    if (area === "consultores") setPesosConsultores(obj);
    else if (area === "gerentes") setPesosGerentes(obj);
    else if (area === "madrinhas") setPesosMadrinhas(obj);
  };

  const selectedProjectObj = React.useMemo(() => {
    if (!selectedProject) return null;

    const projeto = lista_projetos.find(proj => proj.nome === selectedProject);
    
    return { 
      name: selectedProject, 
      macro: projeto?.macro ?? "-",
    };
  }, [selectedProject, lista_projetos]);

  const score_recalc_consultores = (scores || []).map(membro =>{
    const dispon = membro.disponibilidade
    const macroe = selectedProjectObj?.macro ?? "";
    const av_120 = membro.nota_120
    const prefere = Array.isArray(membro.gosta) ? membro.gosta : [];
    const bom = Array.isArray(membro.bom) ? membro.bom : [];
    const ruim = Array.isArray(membro.ruim) ? membro.ruim : [];
    const em_exp = membro.maem_exp
    const sf_exp = membro.masf_exp
    const sm_exp = membro.masm_exp
    const pe_exp = membro.mape_exp
    const em_nps = membro.maem_nps
    const sf_nps = membro.masf_nps
    const sm_nps = membro.masm_nps
    const pe_nps = membro.mape_nps
    const em_qap = membro.maem_ef
    const sf_qap = membro.masf_ef
    const sm_qap = membro.masm_ef
    const pe_qap = membro.mape_ef

    let pesos = pesosConsultores

    let nota = 0

    if (dispon === 0) { nota += 3 * (pesos.availability)}
    else if (dispon === 1) {nota += 2 * (pesos.availability)}
    else if (dispon === 2) {nota += 1 * (pesos.availability)};

    nota += av_120 * (pesos.av_120)

    let pref = 5

    if (prefere.includes(macroe)) pref += 2;
    if (bom.includes(macroe)) pref += 3;
    if (ruim.includes(macroe)) pref -= 5;
    
    nota += pref * (pesos.preferencia)

    if (macro_em.includes(macroe)) nota += em_exp * (pesos.experience)
    else if (macro_pe.includes(macroe)) nota += pe_exp * (pesos.experience)
    else if (macro_sf.includes(macroe)) nota += sf_exp * (pesos.experience)
    else if (macro_sm.includes(macroe)) nota += sm_exp * (pesos.experience);

    if (macro_em.includes(macroe)) nota += em_nps * (pesos.nps)
    else if (macro_pe.includes(macroe)) nota += pe_nps * (pesos.nps)
    else if (macro_sf.includes(macroe)) nota += sf_nps * (pesos.nps)
    else if (macro_sm.includes(macroe)) nota += sm_nps * (pesos.nps);

    if (macro_em.includes(macroe)) nota += em_qap * (pesos.qap)
    else if (macro_pe.includes(macroe)) nota += pe_qap * (pesos.qap)
    else if (macro_sf.includes(macroe)) nota += sf_qap * (pesos.qap)
    else if (macro_sm.includes(macroe)) nota += sm_qap * (pesos.qap);

    return {
      id: membro.id,
      nome: membro.nome,
      score: nota
    }

  })

   const score_recalc_gerentes = (scores || []).map(membro =>{
    const NPS = membro.nps
    const dispon = membro.disponibilidade
    const macroe = selectedProjectObj?.macro ?? "";
    const av_120 = membro.nota_120
    const prefere = Array.isArray(membro.gosta) ? membro.gosta : [];
    const bom = Array.isArray(membro.bom) ? membro.bom : [];
    const ruim = Array.isArray(membro.ruim) ? membro.ruim : [];
    const eficiencia = membro.eficiencia
    const em_exp = membro.maem_exp
    const sf_exp = membro.masf_exp
    const sm_exp = membro.masm_exp
    const pe_exp = membro.mape_exp
    const em_nps = membro.maem_nps
    const sf_nps = membro.masf_nps
    const sm_nps = membro.masm_nps
    const pe_nps = membro.mape_nps
    const em_qap = membro.maem_ef
    const sf_qap = membro.masf_ef
    const sm_qap = membro.masm_ef
    const pe_qap = membro.mape_ef

    let pesos = pesosGerentes

    let nota = 0

    if (dispon === 0) { nota += 3 * (pesos.availability)}
    else if (dispon === 1) {nota += 2 * (pesos.availability)}
    else if (dispon === 2) {nota += 1 * (pesos.availability)};

    nota += av_120 * (pesos.av_120)

    let pref = 5

    if (prefere.includes(macroe)) pref += 2;
    if (bom.includes(macroe)) pref += 3;
    if (ruim.includes(macroe)) pref -= 5;
    
    nota += pref * (pesos.preferencia)

    if (macro_em.includes(macroe)) nota += em_exp * (pesos.experience)
    else if (macro_pe.includes(macroe)) nota += pe_exp * (pesos.experience)
    else if (macro_sf.includes(macroe)) nota += sf_exp * (pesos.experience)
    else if (macro_sm.includes(macroe)) nota += sm_exp * (pesos.experience);

    if (macro_em.includes(macroe)) nota += em_nps * (pesos.nps)
    else if (macro_pe.includes(macroe)) nota += pe_nps * (pesos.nps)
    else if (macro_sf.includes(macroe)) nota += sf_nps * (pesos.nps)
    else if (macro_sm.includes(macroe)) nota += sm_nps * (pesos.nps);

    if (macro_em.includes(macroe)) nota += em_qap * (pesos.qap)
    else if (macro_pe.includes(macroe)) nota += pe_qap * (pesos.qap)
    else if (macro_sf.includes(macroe)) nota += sf_qap * (pesos.qap)
    else if (macro_sm.includes(macroe)) nota += sm_qap * (pesos.qap);

    return {
      id: membro.id,
      nome: membro.nome,
      score: nota
    }

  })

   const score_recalc_madrinhas = (scores || []).map(membro =>{
    const dispon = membro.disp_madrinha;

    let pesos = pesosMadrinhas

    let nota = 0

    if (dispon === 0) { nota += 10 * (pesos.availability)}
    else if (dispon === 1) {nota += 6.66 * (pesos.availability)}
    else if (dispon === 2) {nota += 3.33 * (pesos.availability)};

    return {
      id: membro.id,
      nome: membro.nome,
      score: nota
    }

  })

  const score_array_consultores = React.useMemo(() => {
    const m = new Map();
    (score_recalc_consultores || []).forEach(r => { if (r?.id) m.set(r.id, r.score); });
    return m;
  }, [score_recalc_consultores]);

  const score_array_gerentes = React.useMemo(() => {
    const m = new Map();
    (score_recalc_gerentes || []).forEach(r => { if (r?.id) m.set(r.id, r.score); });
    return m;
  }, [score_recalc_gerentes]);

  const score_array_madrinhas = React.useMemo(() => {
    const m = new Map();
    (score_recalc_madrinhas || []).forEach(r => { if (r?.id) m.set(r.id, r.score); });
    return m;
  }, [score_recalc_madrinhas]);

  const consultores_rank = React.useMemo(() => {
    return (people || []).map(p => {
      const s = score_array_consultores.get(p.id);
      return typeof s === "number" ? { ...p, score: s } : { ...p, score: 0 };
    });
  }, [people, score_array_consultores]);

  const gerentes_rank = React.useMemo(() => {
    return (people || []).map(p => {
      const s = score_array_gerentes.get(p.id);
      return typeof s === "number" ? { ...p, score: s } : { ...p, score: 0 };
    });
  }, [people, score_array_gerentes]);

  const madrinhas_rank = React.useMemo(() => {
    return (people || []).map(p => {
      const s = score_array_madrinhas.get(p.id);
      return typeof s === "number" ? { ...p, score: s } : { ...p, score: 0 };
    });
  }, [people, score_array_madrinhas]);
  
  const byScoreThenName = (a, b) => {
    const diferenca = (b.score ?? 0) - (a.score ?? 0);
    if (diferenca != 0 ) return diferenca;
    else return a.name.localeCompare(b.name, "pt", { sensitivity: "base"})
  }

  let consultants = (consultores_rank || [])
    .filter(p => p.sobrecarga !== true)
    .filter(p => p.status !== "Ex-membro")
    .sort(byScoreThenName);

  let managers = (gerentes_rank|| [])
    .filter(p => p.sobrecarga !== true)
    .filter(p => p.status !== "Ex-membro")
    .sort(byScoreThenName);
  
  let madrinhas = (madrinhas_rank || [])
    .filter((p) => p.padrinho === true )
    .filter(p => p.status !== "Ex-membro")
    .sort(byScoreThenName);


  if (!people?.length) {
    console.warn("Nenhuma pessoa carregada do Airtable");
  }

  const handleSelectPerson = (p) => {
    if (!p) return;
    setSelectedPerson(p);
    setSelectedProjects({});
  };

  const handleGoBack = () => {
    setSelectedPerson(null);
    setSelectedProjects({});
  };

  // Função para calcular a disponibilidade baseado nas alocações
  const getAvailabilityScore = (alocacoes) => {
    if (alocacoes === 0) return 10;
    if (alocacoes === 1) return 6.67;
    if (alocacoes === 2) return 3.33;
    if (alocacoes >= 3) return 0;
    return 0;
  };

  // Função para obter status de disponibilidade baseado no número de alocações
  const getAvailabilityStatus = (alocacoes) => {
    if (alocacoes === 0) return { 
      text: '🟢 Livre', 
      color: '#10b981', 
      description: 'Disponível para novos projetos',
      score: 10
    };
    if (alocacoes === 1) return { 
      text: '🟡 1 projeto', 
      color: '#f59e0b', 
      description: 'Alocado em 1 projeto',
      score: 6.67
    };
    if (alocacoes === 2) return { 
      text: '🟠 2 projetos', 
      color: '#f97316', 
      description: 'Alocado em 2 projetos',
      score: 3.33
    };
    if (alocacoes >= 3) return { 
      text: '🔴 3+ projetos', 
      color: '#ef4444', 
      description: 'Máximo de alocações atingido',
      score: 0
    };
    return { 
      text: '🔴 Ocupado', 
      color: '#ef4444', 
      description: 'Com múltiplas alocações',
      score: 0
    };
  };

  // Função para alternar a seleção de um projeto
  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const projectSuggestions = React.useMemo(() => {

    return (lista_projetos || [])
      .filter(p => (p.equipe ?? 0) === 0)
      .map(p => ({
        id: p.id, 
        name: p.nome,
        macro: p.macro,
      }));
  }, [lista_projetos]);


  const pesosAtuais = selectedArea === "consultores"
    ? pesosConsultores
    : selectedArea === "gerentes"
    ? pesosGerentes
    : pesosMadrinhas;

  const criteriaForUI = React.useMemo(() => ([
    { id: "nps", name: "NPS do Profissional", weight: Math.round((pesosAtuais.nps ?? 0) * 100), description: "Satisfação média do cliente" },
    { id: "experience", name: "Experiência", weight: Math.round((pesosAtuais.experience ?? 0) * 100), description: "Experiência na macroetapa" },
    { id: "preferencia", name: "Preferência", weight: Math.round((pesosAtuais.preferencia ?? 0) * 100), description: "Afinidade com o tipo de projeto" },
    { id: "availability", name: "Disponibilidade", weight: Math.round((pesosAtuais.availability ?? 0) * 100), description: "Capacidade de dedicação" },
    { id: "av_120", name: "Avaliação 120°", weight: Math.round((pesosAtuais.av_120 ?? 0) * 100), description: "Média final da avaliação 120" },
    { id: "qap", name: "Eficiência", weight: Math.round((pesosAtuais.qap ?? 0) * 100), description: "Média dos QAPs" },
  ]), [selectedArea, pesosConsultores, pesosGerentes, pesosMadrinhas]);


  const renderSession2 = () => {
    if (!selectedPerson) return null;


    // Usar dados do radar ou dados padrão
    const Allocations = selectedPerson?.disponibilidade ?? 0;
    const Aloc_Madrinha = selectedPerson.disp_madrinha ?? 0;
    var totalAllocations = "-"
    if(colunaOrigem === "Madrinhas") 
      {totalAllocations = Aloc_Madrinha} 
    else if(colunaOrigem === "Consultores" || colunaOrigem === "Gerentes") 
      {totalAllocations = Allocations}
    else {totalAllocations = 0};

    const availabilityStatus = getAvailabilityStatus(totalAllocations);
    const availabilityScore = getAvailabilityScore(totalAllocations);

    const clamp10 = (v) => Math.max(0, Math.min(10, v));

    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const macro = selectedProjectObj?.macro ?? "";

    const experienceScore =
      macro_em.includes(macro) ? num(selectedPerson?.maem_exp) :
      macro_pe.includes(macro) ? num(selectedPerson?.mape_exp) :
      macro_sf.includes(macro) ? num(selectedPerson?.masf_exp) :
      macro_sm.includes(macro) ? num(selectedPerson?.masm_exp) :
      0;

      const preferenciaScore = (() => {
        const gosta = Array.isArray(selectedPerson?.gosta) ? selectedPerson.gosta : [];
        const bom = Array.isArray(selectedPerson?.bom) ? selectedPerson.bom : [];
        const ruim = Array.isArray(selectedPerson?.ruim) ? selectedPerson.ruim : [];

        let s = 5;
        if (gosta.includes(macro)) s += 2;
        if (bom.includes(macro)) s += 3;
        if (ruim.includes(macro)) s -= 5;

        return clamp10(s);
      })();


      const radarLabels = [
        "NPS",
        "Experiência",
        "Avaliação 120°",
        "Disponibilidade",
        "Preferência",
        "Eficiência"
      ];

      const radarValues = [
        clamp10(num(selectedPerson?.nps)),
        clamp10(experienceScore),
        clamp10(num(selectedPerson?.nota_120)),
        clamp10(availabilityScore),
        clamp10(preferenciaScore),
        clamp10(num(selectedPerson?.eficiencia)),
      ];

      const criteriaList = [
        { name: "NPS do Profissional", value: radarValues[0], description: "Satisfação média do cliente", color: "#3b82f6" },
        { name: "Experiência na Área", value: radarValues[1], description: "Experiência na macroetapa selecionada", color: "#10b981" },
        { name: "Avaliação 120°", value: radarValues[2], description: "Média final da avaliação 120°", color: "#f59e0b" },
        { name: "Disponibilidade", value: radarValues[3], description: "Baseada no número de projetos", color: "#8b5cf6" },
        { name: "Preferência", value: radarValues[4], description: "Afinidade com o tipo de projeto", color: "#ef4444" },
        { name: "Eficiência", value: radarValues[5], description: "Média dos QAPs", color: "#ec4899" },
      ].map(m => ({
        ...m,
        percentage: Math.round((m.value / 10) * 100),
      }));

      var peso = 0
      if (colunaOrigem === "Consultores"){peso = pesosConsultores} else
      if (colunaOrigem === "Gerentes"){peso = pesosGerentes} else
      if (colunaOrigem === "Madrinhas"){peso = pesosMadrinhas};

      const overallScore = radarValues.length
        ? radarValues.reduce((a, b) => a + b, 0) / radarValues.length
        : 0;

    // Obter status de disponibilidade    
    const currentProjects = selectedPerson.projectsLinked || [];

		return (
		  <div className="w-full">
		    {/* Novo cabeçalho para a segunda sessão - SEM O HEADER ORIGINAL */}
		    <div className="col-span-full bg-white rounded-xl px-6 py-5 mb-6 border border-[var(--border,#e5e7eb)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
		      <div className="flex items-center gap-6 max-[1200px]:flex-col max-[1200px]:items-start max-[1200px]:gap-4">
		        <button
		          className="bg-white border border-[var(--border-2,#d1d5db)] text-[14px] font-medium cursor-pointer px-[18px] py-[10px] rounded-lg flex items-center gap-2 h-[44px] shrink-0 transition-all duration-200 text-[var(--muted-3,#4b5563)] hover:bg-[#f3f4f6] hover:border-[var(--muted-2,#9ca3af)] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] max-[1200px]:self-start"
		          onClick={handleGoBack}
		        >
		          <span className="text-[18px]">←</span>
		          <span className="whitespace-nowrap">Voltar para Alocações</span>
		        </button>

		        <div className="flex-1 flex flex-col gap-[6px]">
		          <h1 className="text-[28px] font-extrabold m-0 leading-[1.2] text-[var(--brand-dark,#0f3550)]">
		            Perfil do Membro
		          </h1>
		          <p className="text-[15px] m-0 font-medium text-[var(--muted,#6b7280)]">
		            Detalhes e métricas de avaliação
		          </p>
		        </div>
		      </div>
		    </div>

		    {/* Grid Principal com 3 colunas */}
		    <div className="col-span-full grid gap-5 grid-cols-[320px_1fr_380px] h-[calc(100vh-240px)] min-h-[600px] max-[1200px]:grid-cols-1 max-[1200px]:h-auto max-[1200px]:gap-4">
		      {/* Coluna 1: Perfil */}
		      <div className="bg-white rounded-xl p-6 border border-[var(--border,#e5e7eb)] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
		        <div className="flex flex-col items-center text-center gap-4 pb-5 border-b border-[var(--border,#e5e7eb)]">
		          <div className="relative w-[100px] h-[100px]">
		            {selectedPerson.photoUrl ? (
		              <img
		                src={selectedPerson.photoUrl}
		                alt={selectedPerson.name}
		                className="w-full h-full rounded-full object-cover border-4 border-[var(--card-bg,#ffffff)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
		              />
		            ) : (
		              <div className="w-full h-full rounded-full flex items-center justify-center text-[36px] font-bold text-white bg-[linear-gradient(135deg,var(--brand-dark,#0f3550),var(--brand-mid,#1e4a6e))] border-4 border-[var(--card-bg,#ffffff)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
		                {selectedPerson.name.charAt(0).toUpperCase()}
		              </div>
		            )}

		            <div
		              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-[14px] border-[3px] border-[var(--card-bg,#ffffff)]"
		              style={{
		                backgroundColor: availabilityStatus.color,
		                boxShadow: `0 0 0 3px ${availabilityStatus.color}20`,
		              }}
		            >
		              {availabilityStatus.text.includes("Livre")
		                ? "🟢"
		                : availabilityStatus.text.includes("1")
		                ? "🟡"
		                : availabilityStatus.text.includes("2")
		                ? "🟠"
		                : "🔴"}
		            </div>
		          </div>

		          <div className="w-full">
		            <h3 className="text-[20px] font-bold m-0 mb-2 text-[var(--brand-dark,#0f3550)]">
		              {selectedPerson.name}
		            </h3>
		          </div>
		        </div>

		        {/* Status de Disponibilidade */}
		        <div className="bg-white rounded-[10px] p-4 border border-[var(--border,#e5e7eb)] flex flex-col gap-3">
		          <div>
		            <h4 className="text-[15px] font-semibold m-0 text-[var(--brand-dark,#0f3550)]">
		              Status de Disponibilidade
		            </h4>
		          </div>

		          <div className="flex flex-col gap-2">
		            <div
		              className="text-[16px] font-bold flex items-center gap-2"
		              style={{ color: availabilityStatus.color }}
		            >
		              {availabilityStatus.text}
		            </div>

		            <div className="flex items-center justify-between py-2 border-y border-[var(--border,#e5e7eb)]">
		              <span className="text-[13px] font-semibold text-[var(--muted,#6b7280)]">
		                Pontuação:
		              </span>
		              <span className="text-[16px] font-bold text-[var(--text-strong,#1f2937)]">
		                {availabilityScore.toFixed(1)}/10
		              </span>
		            </div>

		            <p className="text-[13px] m-0 leading-[1.4] text-[var(--muted,#6b7280)]">
		              {availabilityStatus.description}
		            </p>
		          </div>
		        </div>

		        {/* Nota Geral */}
		        <div className="rounded-[10px] p-[18px] border border-[var(--primary-soft-border,#dbeafe)] text-center bg-[linear-gradient(135deg,var(--surface,#f8fafc),var(--surface-2,#e2e8f0))]">
		          <div>
		            <h4 className="text-[15px] font-semibold m-0 mb-3 text-[var(--brand-dark,#0f3550)]">
		              Nota Geral
		            </h4>
		          </div>

		          <div className="flex flex-col gap-2">
		            <div className="text-[32px] font-extrabold leading-none text-[var(--brand-dark,#0f3550)]">
		              {overallScore.toFixed(1)}
		              <span className="text-[18px] font-semibold ml-1 text-[var(--muted,#6b7280)]">
		                /10
		              </span>
		            </div>

		            <div className="inline-block text-[14px] font-semibold px-3 py-[6px] rounded-full text-[var(--primary,#3b82f6)] bg-[color-mix(in_srgb,var(--primary,#3b82f6)_12%,transparent)]">
		              {overallScore >= 8
		                ? "⭐ Excelente"
		                : overallScore >= 6
		                ? "👍 Bom"
		                : overallScore >= 4
		                ? "👌 Regular"
		                : "📝 A Melhorar"}
		            </div>
		          </div>
		        </div>
		      </div>

		      {/* Coluna 2: Radar + Sugestões de Alocação */}
		      <div className="bg-white rounded-xl p-6 border border-[var(--border,#e5e7eb)] flex flex-col gap-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
		        <div className="flex items-center justify-between pb-4 border-b border-[var(--border,#e5e7eb)]">
		          <h3 className="text-[18px] font-bold m-0 text-[var(--brand-dark,#0f3550)]">
		            Perfil de Habilidades
		          </h3>

		          <div className="text-white px-[14px] py-[6px] rounded-full font-bold text-[15px] flex items-center gap-[6px] bg-[linear-gradient(135deg,var(--primary,#3b82f6),var(--primary-dark,#1d4ed8))]">
		            <span className="text-[14px]">★</span>
		            <span>{overallScore.toFixed(1)}</span>
		          </div>
		        </div>

		        {radarValues.length > 0 ? (
		          <div className="flex flex-col items-center justify-center rounded-[10px] border border-[var(--surface-border,#e2e8f0)] p-[10px] bg-[var(--surface,#f8fafc)] h-[340px] mb-[10px]">
		            <div className="w-full flex items-center justify-center h-[300px]">
		              <RadarNotes values={radarValues} labels={radarLabels} />
		            </div>

		            <div className="flex justify-center gap-5 mt-[15px] pt-[15px] border-t border-[var(--border,#e5e7eb)] w-full">
		              <div className="flex items-center gap-2 text-[12px] text-[var(--muted,#6b7280)]">
		                <div className="w-[10px] h-[10px] rounded-full bg-[#3b82f6]" />
		                <span>Avaliação do Membro</span>
		              </div>
		              <div className="flex items-center gap-2 text-[12px] text-[var(--muted,#6b7280)]">
		                <div className="w-[10px] h-[10px] rounded-full bg-[#e2e8f0]" />
		                <span>Escala de Referência</span>
		              </div>
		            </div>
		          </div>
		        ) : (
		          <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] p-[30px] border-2 border-dashed w-full bg-[var(--surface,#f8fafc)] border-[var(--border-2,#d1d5db)] h-[340px]">
		            <div className="text-[40px] opacity-40 mb-[10px]">📊</div>
		            <div className="text-[16px] font-semibold text-center text-[var(--muted-3,#4b5563)]">
		              Sem dados de habilidades
		            </div>
		            <p className="text-[14px] text-center m-0 leading-[1.4] max-w-[80%] text-[var(--muted-2,#9ca3af)]">
		              Adicione métricas de avaliação para visualizar o perfil gráfico.
		            </p>
		          </div>
		        )}
		      </div>

		      {/* Coluna 3: Métricas Detalhadas */}
		      <div className="bg-white rounded-xl p-6 border border-[var(--border,#e5e7eb)] flex flex-col gap-6 overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
		        <div className="flex items-center justify-between pb-4 border-b border-[var(--border,#e5e7eb)]">
		          <h3 className="text-[18px] font-bold m-0 text-[var(--brand-dark,#0f3550)]">
		            Métricas Detalhadas
		          </h3>

		          <div className="px-3 py-1 rounded-xl text-[13px] font-semibold bg-[var(--chip-bg,#f3f4f6)] text-[var(--muted,#6b7280)]">
		            {criteriaList.length} critérios
		          </div>
		        </div>

		        <div className="flex flex-col gap-5">
		          {criteriaList.map((metric, index) => {
		            const v = parseFloat(metric.value);

		            const statusClass =
		              v >= 8
		                ? "bg-[#d1fae5] text-[#065f46]"
		                : v >= 6
		                ? "bg-[#fef3c7] text-[#92400e]"
		                : v >= 4
		                ? "bg-[#dbeafe] text-[#1e40af]"
		                : "bg-[#fee2e2] text-[#991b1b]";

		            const statusText =
		              v >= 8 ? "Excelente" : v >= 6 ? "Bom" : v >= 4 ? "Regular" : "A Melhorar";

		            return (
		              <div
		                key={index}
		                className="rounded-[10px] p-[18px] border border-[var(--surface-border,#e2e8f0)] bg-[var(--surface,#f8fafc)]"
		              >
		                <div className="flex items-center justify-between mb-[10px]">
		                  <div className="flex items-center gap-[10px]">
		                    <span className="text-[12px] font-bold w-6 h-6 rounded-[6px] flex items-center justify-center border border-[var(--primary-soft-border,#dbeafe)] text-[var(--primary,#3b82f6)] bg-[var(--card-bg,#ffffff)]">
		                      0{index + 1}
		                    </span>
		                    <span className="text-[15px] font-semibold text-[var(--text-strong,#1f2937)]">
		                      {metric.name}
		                    </span>
		                  </div>

		                  <div className="flex items-baseline gap-[2px]">
		                    <span className="text-[20px] font-bold text-[var(--brand-dark,#0f3550)]">
		                      {metric.value}
		                    </span>
		                    <span className="text-[14px] text-[var(--muted-2,#9ca3af)]">
		                      /10
		                    </span>
		                  </div>
		                </div>

		                <div className="text-[13px] mb-3 leading-[1.4] text-[var(--muted,#6b7280)]">
		                  {metric.description}
		                </div>

		                <div className="mt-3">
		                  <div className="h-2 rounded overflow-hidden mb-2 bg-[var(--border,#e5e7eb)]">
		                    <div
		                      className="h-full rounded transition-[width] duration-[700ms] ease-out"
		                      style={{
		                        width: `${metric.percentage}%`,
		                        background: metric.color,
		                      }}
		                    />
		                  </div>

		                  <div className="flex items-center justify-between">
		                    <span className="text-[12px] font-semibold text-[var(--muted,#6b7280)]">
		                      {metric.percentage}%
		                    </span>

		                    <span className={`text-[11px] font-bold px-[10px] py-1 rounded-xl uppercase ${statusClass}`}>
		                      {statusText}
		                    </span>
		                  </div>
		                </div>
		              </div>
		            );
		          })}
		        </div>

		        {/* Nota Explicativa */}
		        <div className="rounded-lg p-[14px] text-[12px] leading-[1.4] mt-[10px] bg-[var(--note-bg,#f0f9ff)] text-[var(--muted-3,#4b5563)] border-l-4 border-l-[var(--primary,#3b82f6)]">
		          <p className="m-0">
		            <strong className="text-[var(--text-strong,#1f2937)]">Disponibilidade:</strong>{" "}
		            Calculada baseada no número de projetos atuais.
		            <br />
		            0 projetos = 10/10 • 1 projeto = 6.7/10 • 2 projetos = 3.3/10 • 3+ projetos = 0/10
		          </p>
		        </div>
		      </div>
		    </div>
		  </div>
		);
		};

		return (
		<div className="grid grid-cols-1 grid-rows-[auto_1fr] gap-4 max-w-[1400px] mx-auto h-screen p-4 overflow-hidden box-border max-[1200px]:p-3 max-[1200px]:h-auto max-[1200px]:min-h-screen max-[768px]:p-[10px] max-[768px]:gap-3">
		  {/* HEADER APENAS NA PRIMEIRA SESSÃO */}
		  {!selectedPerson && (
		    <header className="col-span-full flex items-center justify-center px-4 py-3 bg-white border-b border-b-[rgba(0,0,0,0.05)] h-[60px] rounded-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.04)] max-[768px]:p-[10px] max-[768px]:h-[52px]">
		      <h1 className="text-[20px] font-bold text-[var(--brand)] tracking-[0.2px] m-0 text-center max-[768px]:text-[17px] max-[480px]:text-[15px]">
		        FGV Jr. — Dashboard de Alocações
		      </h1>
		    </header>
		  )}

		  <div className="col-span-full flex flex-col gap-4 overflow-y-auto pr-1 h-[calc(100vh-92px)] max-[1200px]:h-auto max-[1200px]:flex-col">
		    {/* SESSÃO 1: (some quando seleciona alguém) */}
		    {!selectedPerson && (
          selectedProject ? (
		      <div className="grid gap-5 min-h-0 items-stretch grid-cols-[380px_1fr] h-[calc(100vh-140px)] max-[1200px]:flex max-[1200px]:flex-col max-[1200px]:h-auto">
		        <div className="grid gap-3 h-full min-h-0 grid-rows-[auto_1fr] max-[1200px]:w-full max-[1200px]:flex-[0_0_auto] max-[1200px]:min-h-[320px]">
		          <ProjectsPanel
		            projects={nomes_projetos}
		            selectedProject={selectedProject}
		            onSelectProject={setSelectedProject}
		            projectInfo={selectedProjectObj}
		          />

		          {selectedProject && (
		            <ProjectRankingConfig
		              projectId={selectedProjectObj?.name ?? ""}
		              macro={selectedProjectObj?.macro ?? "-"}
		              area={selectedArea}
		              onAreaChange={setSelectedArea}
		              criteria={criteriaForUI}
		              onWeightsChange={handleWeightsChange}
		            />
		          )}
		        </div>

		        <div className="min-h-0 w-full overflow-hidden max-[1200px]:w-full">
		          <div className="flex flex-1 gap-3 min-w-0 min-h-0 overflow-x-auto pb-2">
		            {selectedProject &&  <Column
		              title="Consultores"
		              items={consultants}
		              col_papel={"Consultores"}
		              onSelect={(p) => {
		                handleSelectPerson(p);
		                setColunaOrigem("Consultores");
		              }}
		              scores={score_recalc_consultores}
		              />
                }

		            {selectedProject && <Column
		              title="Gerentes"
		              items={managers}
		              col_papel={"Gerentes"}
		              onSelect={(p) => {
		                handleSelectPerson(p);
		                setColunaOrigem("Gerentes");
		              }}
		              scores={score_recalc_gerentes}
		              />
                  }

		            {selectedProject && <Column
		              title="Madrinhas"
		              items={madrinhas}
		              col_papel={"Madrinhas"}
		              onSelect={(p) => {
		                handleSelectPerson(p);
		                setColunaOrigem("Madrinhas");
		              }}
		              scores={score_recalc_madrinhas}
		            />
                }
		          </div>
		        </div>
		      </div>
          ) : (
            <div className="h-[calc(100vh-140px)] flex justify-center pt-10">
              <div className="flex flex-col items-center">
                <ProjectsPanel
                  projects={nomes_projetos}
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                  projectInfo={selectedProjectObj}
                  />
                </div>
              </div>
          )
		    )}

		    {/* SESSÃO 2 */}
		    {selectedPerson ? renderSession2() : null}
		  </div>
		</div>
		);

}

function CssLoading() {
  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      Carregando estilos...
    </div>
  );
}


function AppBoot() {
  const twReady = useTailwindReady();

  if(!twReady){

    return(<CssLoading />)
  }
  return <Dashboard/>
}

initializeBlock(() => <AppBoot />);
