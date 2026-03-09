import React from "react";
import { useScores } from "../back/processing";

import "../style/base.css";
import "../style/layout.css";
import "../style/scroll.css";
import "../style/responsive.css";

import Column from "./ui/column";
import ProjectsPanel from "./ui/projectspanel";
import ProjectRankingConfig from "./ui/weightinput";
import Session2 from "./ui/session2";

import useProjData from "../back/useProjData";
import usePpldata from "../hooks/ppldata";
import useRankdata from "../hooks/rankdata";

import { buildCriteriaForUI } from "../Utils/criteria";
import {
  recalcConsultores,
  recalcGerentes,
  recalcMadrinhas,
} from "../back/score_recalc";

type Pesos = {
  nps: number;
  experience: number;
  preferencia: number;
  availability: number;
  av_120: number;
  qap: number;
};

type WeightsObj = {
  nps: number;
  experience: number;
  preferencia: number;
  availability: number;
  av_120: number;
  qap: number;
};

type Person = {
  id: string;
  name: string;
  score?: number;
  [key: string]: unknown;
};

type ColumnItem = {
  id?: string | number;
  name?: string;
  score?: number;
  disponibilidade?: number;
  disp_madrinha?: number;
  role?: string;
  [key: string]: unknown;
};

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

type Area = "consultores" | "gerentes" | "madrinhas";
type ColunaOrigem = "Consultores" | "Gerentes" | "Madrinhas";

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = React.useState<string | null>(
    null
  );
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(
    null
  );
  const [colunaOrigem, setColunaOrigem] = React.useState<ColunaOrigem | null>(
    null
  );
  const [selectedArea, setSelectedArea] = React.useState<Area>("consultores");

  const { table, records, lista_projetos, nomes_projetos } = useProjData();

  const selectedProjectObj = React.useMemo<Projeto | null>(() => {
    if (!selectedProject) return null;

    return (
      lista_projetos.find((proj) => proj.nome_p === selectedProject) ?? null
    );
  }, [selectedProject, lista_projetos]);

  const scores = useScores(selectedProjectObj);

  const [pesosConsultores, setPesosConsultores] = React.useState<Pesos>({
    nps: 0.17,
    experience: 0.17,
    preferencia: 0.17,
    availability: 0.17,
    av_120: 0.16,
    qap: 0.16,
  });

  const [pesosGerentes, setPesosGerentes] = React.useState<Pesos>({
    nps: 0.17,
    experience: 0.17,
    preferencia: 0.17,
    availability: 0.17,
    av_120: 0.16,
    qap: 0.16,
  });

  const [pesosMadrinhas, setPesosMadrinhas] = React.useState<Pesos>({
    nps: 0,
    experience: 0,
    preferencia: 0,
    availability: 1,
    av_120: 0,
    qap: 0,
  });

  const { people } = usePpldata(table, records, scores);

  const handleWeightsChange = (area: string, obj: WeightsObj) => {
    const pesos: Pesos = {
      nps: obj.nps,
      experience: obj.experience,
      preferencia: obj.preferencia,
      availability: obj.availability,
      av_120: obj.av_120,
      qap: obj.qap,
    };

    if (area === "consultores") setPesosConsultores(pesos);
    else if (area === "gerentes") setPesosGerentes(pesos);
    else if (area === "madrinhas") setPesosMadrinhas(pesos);
  };

  const projectInfo = React.useMemo(() => {
    return {
      name: selectedProjectObj?.nome_p ?? "",
      macro: selectedProjectObj?.macro ?? "-",
    };
  }, [selectedProjectObj]);

  const score_recalc_consultores = React.useMemo(() => {
    return recalcConsultores(scores, projectInfo, pesosConsultores);
  }, [scores, projectInfo, pesosConsultores]);

  const score_recalc_gerentes = React.useMemo(() => {
    return recalcGerentes(scores, projectInfo, pesosGerentes);
  }, [scores, projectInfo, pesosGerentes]);

  const score_recalc_madrinhas = React.useMemo(() => {
    return recalcMadrinhas(scores);
  }, [scores]);

  const { consultants, managers, madrinhas } = useRankdata(
    people,
    score_recalc_consultores,
    score_recalc_gerentes,
    score_recalc_madrinhas
  );

  if (!people?.length) {
    console.warn("Nenhuma pessoa carregada do Airtable");
  }

  const handleSelectPerson = (item: ColumnItem) => {
    const person: Person = {
      ...item,
      id: String(item.id ?? ""),
      name: String(item.name ?? ""),
    };

    setSelectedPerson(person);
  };

  const handleGoBack = () => {
    setSelectedPerson(null);
  };

  const pesosAtuais =
    selectedArea === "consultores"
      ? pesosConsultores
      : selectedArea === "gerentes"
      ? pesosGerentes
      : pesosMadrinhas;

  const criteriaForUI = React.useMemo(() => {
    return buildCriteriaForUI(pesosAtuais);
  }, [pesosAtuais]);

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_1fr] gap-4 max-w-[1400px] mx-auto h-screen p-4 overflow-hidden box-border max-[1200px]:p-3 max-[1200px]:h-auto max-[1200px]:min-h-screen max-[900px]:p-[10px] max-[900px]:gap-3">
      {!selectedPerson && (
        <header className="col-span-full flex items-center justify-center px-4 py-3 bg-white border-b border-b-[rgba(0,0,0,0.05)] h-[60px] rounded-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.04)] max-[768px]:p-[10px] max-[768px]:h-[52px]">
          <h1 className="text-[20px] font-bold text-[var(--brand)] tracking-[0.2px] m-0 text-center max-[768px]:text-[17px] max-[480px]:text-[15px]">
            FGV Jr. — Dashboard de Alocações
          </h1>
        </header>
      )}

      <div className="col-span-full flex flex-col gap-4 overflow-y-auto pr-1 h-[calc(100vh-92px)] max-[1200px]:h-auto max-[1200px]:flex-col">
        {!selectedPerson &&
          (selectedProject ? (
            <div className="grid gap-2 min-h-0 items-stretch grid-cols-[540px_1fr] h-[calc(100vh-140px)] max-[1200px]:flex max-[1200px]:flex-col max-[1200px]:h-auto">
              <div className="grid gap-2 h-full min-h-0 grid-rows-[auto_1fr] max-[1200px]:w-full max-[1200px]:flex-[0_0_auto] max-[1500px]:min-h-[320px]">
                <ProjectsPanel
                  projects={nomes_projetos}
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                />

                {selectedProject && (
                  <ProjectRankingConfig
                    projectId={projectInfo.name}
                    macro={projectInfo.macro}
                    area={selectedArea}
                    onAreaChange={(area: string) =>
                      setSelectedArea(area as Area)
                    }
                    criteria={criteriaForUI}
                    onWeightsChange={handleWeightsChange}
                  />
                )}
              </div>

              <div className="min-h-0 w-full overflow-hidden h-full max-[1200px]:w-full">
                <div className="flex gap-2 min-w-0 min-h-0 h-full overflow-x-auto pb-2">
                  {selectedProject && (
                    <Column
                      title="Consultores"
                      items={consultants}
                      col_papel="Consultores"
                      onSelect={(item) => {
                        handleSelectPerson(item);
                        setColunaOrigem("Consultores");
                      }}
                      scores={score_recalc_consultores}
                    />
                  )}

                  {selectedProject && (
                    <Column
                      title="Gerentes"
                      items={managers}
                      col_papel="Gerentes"
                      onSelect={(item) => {
                        handleSelectPerson(item);
                        setColunaOrigem("Gerentes");
                      }}
                      scores={score_recalc_gerentes}
                    />
                  )}

                  {selectedProject && (
                    <Column
                      title="Madrinhas"
                      items={madrinhas}
                      col_papel="Madrinhas"
                      onSelect={(item) => {
                        handleSelectPerson(item);
                        setColunaOrigem("Madrinhas");
                      }}
                      scores={score_recalc_madrinhas}
                    />
                  )}
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
                />
              </div>
            </div>
          ))}

        {selectedPerson ? (
          <Session2
            selectedPerson={selectedPerson}
            colunaOrigem={colunaOrigem}
            selectedProject={selectedProject}
            selectedProjectObj={projectInfo}
            selectedArea={selectedArea}
            pesosConsultores={pesosConsultores}
            pesosGerentes={pesosGerentes}
            pesosMadrinhas={pesosMadrinhas}
            score_recalc_consultores={score_recalc_consultores}
            score_recalc_gerentes={score_recalc_gerentes}
            score_recalc_madrinhas={score_recalc_madrinhas}
            handleGoBack={handleGoBack}
          />
        ) : null}
      </div>
    </div>
  );
}
