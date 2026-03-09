export type Pesos = {
  nps?: number;
  experience?: number;
  preferencia?: number;
  availability?: number;
  av_120?: number;
  qap?: number;
};

export type CriteriaUI = {
  id: string;
  name: string;
  weight: number;
  description: string;
  cor: string;
};

export function buildCriteriaForUI(pesosAtuais: Pesos): CriteriaUI[] {
  return [
    {
      id: "nps",
      name: "NPS do Profissional",
      weight: Math.round((pesosAtuais.nps ?? 0) * 100),
      description: "Satisfação média do cliente",
      cor: "#7B4DE2",
    },
    {
      id: "experience",
      name: "Experiência",
      weight: Math.round((pesosAtuais.experience ?? 0) * 100),
      description: "Experiência na macroetapa",
      cor: "#64C273",
    },
    {
      id: "preferencia",
      name: "Preferência",
      weight: Math.round((pesosAtuais.preferencia ?? 0) * 100),
      description: "Afinidade com o tipo de projeto",
      cor: "#F5C247",
    },
    {
      id: "availability",
      name: "Disponibilidade",
      weight: Math.round((pesosAtuais.availability ?? 0) * 100),
      description: "Capacidade de dedicação",
      cor: "#F4431E",
    },
    {
      id: "av_120",
      name: "Avaliação 120°",
      weight: Math.round((pesosAtuais.av_120 ?? 0) * 100),
      description: "Média final da avaliação 120",
      cor: "#E641A9",
    },
    {
      id: "qap",
      name: "Eficiência",
      weight: Math.round((pesosAtuais.qap ?? 0) * 100),
      description: "Média dos QAPs",
      cor: "#4AA3DF",
    },
  ];
}