export type AvailabilityStatus = {
  text: string;
  color: string;
  description: string;
  score: number;
};

export function getAvailabilityScore(alocacoes: number): number {
  if (alocacoes === 0) return 10;
  if (alocacoes === 1) return 6.67;
  if (alocacoes === 2) return 3.33;
  if (alocacoes >= 3) return 0;
  return 0;
}

export function getAvailabilityStatus(alocacoes: number): AvailabilityStatus {
  if (alocacoes === 0)
    return {
      text: "Livre",
      color: "#10b981",
      description: "Disponível para novos projetos",
      score: 10,
    };

  if (alocacoes === 1)
    return {
      text: "1 projeto",
      color: "#f59e0b",
      description: "Alocado em 1 projeto",
      score: 6.67,
    };

  if (alocacoes === 2)
    return {
      text: "2 projetos",
      color: "#f97316",
      description: "Alocado em 2 projetos",
      score: 3.33,
    };

  if (alocacoes >= 3)
    return {
      text: "3+ projetos",
      color: "#ef4444",
      description: "Máximo de alocações atingido",
      score: 0,
    };

  return {
    text: "Ocupado",
    color: "#ef4444",
    description: "Com múltiplas alocações",
    score: 0,
  };
}