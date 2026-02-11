import React from "react";
import { initializeBlock, useBase, useRecords } from "@airtable/blocks/ui";

import "./style.css";

import Column from "./src/ui/column";
import ProjectsPanel from "./src/ui/projectspanel";
import RadarNotes from "./src/ui/radarnotes";
import ProjectRankingConfig from "./src/ui/weightinput";
import { useScores } from "./src/backend/src/calc/processing";
import { get_field, get_count } from "./src/backend/src/calc/data_t";
import { useMemo } from "react";

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
      equipe: get_count(records, "Alocações")
    }))
  }, [base_projetos]);

  const nomes_projetos = React.useMemo (() => {
    return (lista_projetos || [])
    .filter(projeto => projeto.equipe === 0)
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
    nps: 0.17,
    experience: 0.17,
    preferencia: 0.17,
    availability: 0.17,
    av_120: 0.16,
    qap: 0.16,
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

    let pesos = pesosConsultores

    let nota = 0

    if (dispon === 0) { nota += 3 * (pesos.availability)}
    else if (dispon === 1) {nota += 2 * (pesos.availability)}
    else if (dispon === 2) {nota += 1 * (pesos.availability)};

    nota += NPS * (pesos.nps)
    nota += eficiencia * (pesos.preferencia)
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

    let pesos = pesosGerentes

    let nota = 0

    if (dispon === 0) { nota += 3 * (pesos.availability)}
    else if (dispon === 1) {nota += 2 * (pesos.availability)}
    else if (dispon === 2) {nota += 1 * (pesos.availability)};

    nota += NPS * (pesos.nps)
    nota += eficiencia * (pesos.preferencia)
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

    return {
      id: membro.id,
      nome: membro.nome,
      score: nota
    }

  })

   const score_recalc_madrinhas = (scores || []).map(membro =>{
    const NPS = membro.nps;
    const dispon = membro.disp_madrinha;
    const macroe = selectedProjectObj?.macro ?? "";
    const av_120 = membro.nota_120;
    const prefere = Array.isArray(membro.gosta) ? membro.gosta : [];
    const bom = Array.isArray(membro.bom) ? membro.bom : [];
    const ruim = Array.isArray(membro.ruim) ? membro.ruim : [];
    const eficiencia = membro.eficiencia;
    const em_exp = membro.maem_exp;
    const sf_exp = membro.masf_exp;
    const sm_exp = membro.masm_exp;
    const pe_exp = membro.mape_exp;

    let pesos = pesosMadrinhas

    let nota = 0

    if (dispon === 0) { nota += 3 * (pesos.availability)}
    else if (dispon === 1) {nota += 2 * (pesos.availability)}
    else if (dispon === 2) {nota += 1 * (pesos.availability)};

    nota += NPS * (pesos.nps)
    nota += eficiencia * (pesos.preferencia)
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

  const filter_ppl_consultores = React.useMemo(() =>{
    return (consultores_rank || []).filter(pessoa => {
      if(pessoa.padrinho === true) return true;
      return pessoa.sobrecarga !== true;
    })
  }, [consultores_rank])

  const filter_ppl_gerentes = React.useMemo(() => {
    return (gerentes_rank || []).filter(pessoa => {
      if(pessoa.padrinho === true) return true;
      return pessoa.sobrecarga !== true;
    })
  })

  const filter_ppl_madrinhas = React.useMemo(() => {
    return (madrinhas_rank || []).filter(pessoa => {
      if(pessoa.padrinho === true) return true;
    })
  })
  
  const byScoreThenName = (a, b) => {
    const diferenca = (b.score ?? 0) - (a.score ?? 0);
    if (diferenca != 0 ) return diferenca;
    else return a.name.localeCompare(b.name, "pt", { sensitivity: "base"})
  }
  

  let consultants = (filter_ppl_consultores || [])
    .filter(p => p.sobrecarga !== true)
    .sort(byScoreThenName);

  let managers = (filter_ppl_gerentes || [])
    .filter(p => p.sobrecarga !== true)
    .sort(byScoreThenName);
  
  let madrinhas = (filter_ppl_madrinhas || [])
    .filter((p) => p.padrinho === true ) 
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
    // Se não está alocado em nenhum projeto: disponibilidade 10/10
    if (alocacoes === 0) return 10;
    // Se está em 1 projeto: 6.67/10 (3 projetos seria 0, então linearmente: 10 - (alocações * 3.33))
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
    const totalAllocations = selectedPerson?.disponibilidade ?? 0;
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

      const overallScore = radarValues.length
        ? radarValues.reduce((a, b) => a + b, 0) / radarValues.length
        : 0;

    // Obter status de disponibilidade    
    const currentProjects = selectedPerson.projectsLinked || [];
    
    return (
      <div className="bottom-section">
         {/* Novo cabeçalho para a segunda sessão - SEM O HEADER ORIGINAL */}
        <div className="profile-section-header">
          <div className="profile-header-content">
            <button className="profile-back-button" onClick={handleGoBack}>
              <span className="back-icon">←</span>
              <span className="back-label">Voltar para Alocações</span>
            </button>
            <div className="profile-header-info">
              <h1 className="profile-main-title">Perfil do Membro</h1>
              <p className="profile-subtitle">Detalhes e métricas de avaliação</p>
            </div>
          </div>
        </div>

          {/* Grid Principal com 3 colunas */}
        <div className="member-detail-grid-three">
          
          {/* Coluna 1: Perfil */}
          <div className="profile-left-card">
            <div className="profile-header-left">
              <div className="avatar-container-left">
                {selectedPerson.photoUrl ? (
                  <img src={selectedPerson.photoUrl} alt={selectedPerson.name} className="profile-image-left" />
                ) : (
                  <div className="avatar-initial-left">
                    {selectedPerson.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="availability-indicator-left" 
                     style={{ 
                       backgroundColor: availabilityStatus.color,
                       boxShadow: `0 0 0 3px ${availabilityStatus.color}20`
                     }}>
                  {availabilityStatus.text.includes('Livre') ? '🟢' : 
                   availabilityStatus.text.includes('1') ? '🟡' : 
                   availabilityStatus.text.includes('2') ? '🟠' : '🔴'}
                </div>
              </div>
              <div className="profile-info-left">
                <h3 className="member-name-left">{selectedPerson.name}</h3>
                <div className="member-meta-left">
                  <div className="meta-item-left">
                  </div>
                  <div className="meta-item-left">
                    <span className="meta-label-left">ALOCAÇÕES:</span>
                    <span className="meta-value-left">{selectedPerson.disponibilidade || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Descrição */}
            <div className="profile-description-left">
              <h4 className="description-title-left">Sobre</h4>
              <p className="description-content-left">
                {selectedPerson.description || 
                  "Membro da equipe FGV Jr. Sem descrição adicional disponível."}
              </p>
            </div>

          {/* Status de Disponibilidade */}
            <div className="availability-status-left">
              <div className="status-header-left">
                <h4>Status de Disponibilidade</h4>
              </div>
              <div className="status-content-left">
                <div className="status-indicator-left" style={{ color: availabilityStatus.color }}>
                  {availabilityStatus.text}
                </div>
                <div className="status-score-left">
                  <span className="score-label-left">Pontuação:</span>
                  <span className="score-value-left">{availabilityScore.toFixed(1)}/10</span>
                </div>
                <p className="status-description-left">{availabilityStatus.description}</p>
              </div>
            </div>

        {/* Nota Geral */}
            <div className="overall-score-left">
              <div className="score-header-left">
                <h4>Nota Geral</h4>
              </div>
              <div className="score-content-left">
                <div className="score-value-left-large">{overallScore.toFixed(1)}<span className="score-max-left">/10</span></div>
                <div className="score-rating-left">
                  {overallScore >= 8 ? '⭐ Excelente' : 
                   overallScore >= 6 ? '👍 Bom' : 
                   overallScore >= 4 ? '👌 Regular' : '📝 A Melhorar'}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Radar + Sugestões de Alocação */}
          <div className="radar-middle-card">
            <div className="card-header-middle">
              <h3>Perfil de Habilidades</h3>
              <div className="score-badge-middle">
                <span className="score-icon-middle">★</span>
                <span className="score-text-middle">{overallScore.toFixed(1)}</span>
              </div>
            </div>
            
            {radarValues.length > 0 ? (
              <div className="radar-container-middle">
                <div className="radar-wrapper-middle">
                  <RadarNotes 
                    values={radarValues} 
                    labels={radarLabels} 
                  />
                </div>
                <div className="radar-legend-middle">
                  <div className="legend-item-middle">
                    <div className="legend-dot-middle" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span>Avaliação do Membro</span>
                  </div>
                  <div className="legend-item-middle">
                    <div className="legend-dot-middle" style={{ backgroundColor: '#e2e8f0' }}></div>
                    <span>Escala de Referência</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="radar-placeholder-middle">
                <div className="placeholder-icon-middle">📊</div>
                <div className="placeholder-title-middle">Sem dados de habilidades</div>
                <p className="placeholder-text-middle">
                  Adicione métricas de avaliação para visualizar o perfil gráfico.
                </p>
              </div>
            )}

            {/* Sugestões de Alocação (sempre visível) */}
            <div className="project-suggestions-always">
              <div className="suggestions-header-always">
                <h4>Sugerir Alocação para:</h4>
              </div>
              <div className="suggestions-list-always">
                {projectSuggestions.slice(0, 3).map((project) => (
                  <div key={project.id} className="project-suggestion-item-always">
                    <div className="project-info-always">
                      <div className="project-name-always">{project.name}</div>
                      <div className="project-details-always">
                        <span className="project-client-always">{project.client}</span>
                        <span className="project-status-always">{project.status}</span>
                      </div>
                    </div>
                    <button 
                      className={`select-project-btn-always ${selectedProjects[project.id] ? 'selected' : ''}`}
                      onClick={() => toggleProjectSelection(project.id)}
                    >
                      {selectedProjects[project.id] ? '✓ Selecionado' : 'Selecionar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna 3: Métricas Detalhadas */}
          <div className="metrics-right-card">
            <div className="card-header-right">
              <h3>Métricas Detalhadas</h3>
              <div className="metrics-count-right">
                {criteriaList.length} critérios
              </div>
              </div>

            <div className="metrics-list-right">
              {criteriaList.map((metric, index) => (
                <div key={index} className="metric-item-right">
                  <div className="metric-header-right">
                    <div className="metric-title-right">
                      <span className="metric-number-right">0{index + 1}</span>
                      <span className="metric-name-right">{metric.name}</span>
                    </div>
                    <div className="metric-score-right">
                      <span className="score-value-right">{metric.value}</span>
                      <span className="score-max-right">/10</span>
                    </div>
                  </div>
                  
                  <div className="metric-description-right">{metric.description}</div>
                  
                  <div className="progress-container-right">
                    <div className="progress-bar-right">
                      <div 
                        className="progress-fill-right" 
                        style={{ 
                          width: `${metric.percentage}%`,
                          background: metric.color
                        }}
                      ></div>
                    </div>
                    <div className="progress-labels-right">
                      <span className="progress-percentage-right">{metric.percentage}%</span>
                      <span className={`progress-status-right ${
                        parseFloat(metric.value) >= 8 ? 'status-excellent' :
                        parseFloat(metric.value) >= 6 ? 'status-good' :
                        parseFloat(metric.value) >= 4 ? 'status-regular' : 'status-needs-improvement'
                      }`}>
                        {parseFloat(metric.value) >= 8 ? 'Excelente' : 
                         parseFloat(metric.value) >= 6 ? 'Bom' : 
                         parseFloat(metric.value) >= 4 ? 'Regular' : 'A Melhorar'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nota Explicativa */}
            <div className="metrics-note-right">
              <p>
                <strong>Disponibilidade:</strong> Calculada baseada no número de projetos atuais.
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
    <div className="grid-container">
      {/* HEADER APENAS NA PRIMEIRA SESSÃO */}
      {!selectedPerson && (
        <header className="header-with-logo">
          <h1 className="app-title">FGV Jr. — Dashboard de Alocações</h1>
        </header>
      )}

      <div className="main-content">
        {/* SESSÃO 1: (some quando seleciona alguém) */}
        {!selectedPerson && (
          <div className="top-section">
            <div className="left-sidebar">
              <ProjectsPanel
                projects={nomes_projetos}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
                projectInfo={selectedProjectObj}
              />

              {selectedProject &&(

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

            <div className="columns-container">
              <Column title="Consultores" items={consultants} onSelect={handleSelectPerson} />
              <Column title="Gerentes" items={managers} onSelect={handleSelectPerson} />
              <Column title="Madrinhas" items={madrinhas} onSelect={handleSelectPerson} />
            </div>
          </div>
        )}

        {/* SESSÃO 2 */}
        {selectedPerson && renderSession2()}
      </div>
    </div>
  );
}

initializeBlock(() => <Dashboard />);
