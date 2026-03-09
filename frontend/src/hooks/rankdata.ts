import React from "react";

export type ScoreItem = {
  id: string;
  nome: string;
  score: number;
};

export type Person = {
  id: string;
  name: string;
  status?: string;
  padrinho?: boolean;
  score?: number;
  [key: string]: unknown;
};

type RankedPerson = Person & {
  score: number;
};

export default function useRankdata(
  people: Person[] = [],
  score_recalc_consultores: ScoreItem[] = [],
  score_recalc_gerentes: ScoreItem[] = [],
  score_recalc_madrinhas: ScoreItem[] = []
) {
  const score_array_consultores = React.useMemo(() => {
    const m = new Map<string, number>();
    (score_recalc_consultores || []).forEach((r) => {
      if (r?.id) m.set(r.id, r.score);
    });
    return m;
  }, [score_recalc_consultores]);

  const score_array_gerentes = React.useMemo(() => {
    const m = new Map<string, number>();
    (score_recalc_gerentes || []).forEach((r) => {
      if (r?.id) m.set(r.id, r.score);
    });
    return m;
  }, [score_recalc_gerentes]);

  const score_array_madrinhas = React.useMemo(() => {
    const m = new Map<string, number>();
    (score_recalc_madrinhas || []).forEach((r) => {
      if (r?.id) m.set(r.id, r.score);
    });
    return m;
  }, [score_recalc_madrinhas]);

  const consultores_rank = React.useMemo<RankedPerson[]>(() => {
    return (people || []).map((p) => {
      const s = score_array_consultores.get(p.id);
      return typeof s === "number" ? { ...p, score: s } : { ...p, score: 0 };
    });
  }, [people, score_array_consultores]);

  const gerentes_rank = React.useMemo<RankedPerson[]>(() => {
    return (people || []).map((p) => {
      const s = score_array_gerentes.get(p.id);
      return typeof s === "number" ? { ...p, score: s } : { ...p, score: 0 };
    });
  }, [people, score_array_gerentes]);

  const madrinhas_rank = React.useMemo<RankedPerson[]>(() => {
    return (people || []).map((p) => {
      const s = score_array_madrinhas.get(p.id);
      return typeof s === "number" ? { ...p, score: s } : { ...p, score: 0 };
    });
  }, [people, score_array_madrinhas]);

  const byScoreThenName = React.useCallback(
    (a: RankedPerson, b: RankedPerson): number => {
      const diferenca = (b.score ?? 0) - (a.score ?? 0);
      if (diferenca !== 0) return diferenca;
      return a.name.localeCompare(b.name, "pt", { sensitivity: "base" });
    },
    []
  );

  const consultants = React.useMemo<RankedPerson[]>(() => {
    return (consultores_rank || [])
      .filter((p) => p.status !== "Ex-membro")
      .sort(byScoreThenName);
  }, [consultores_rank, byScoreThenName]);

  const managers = React.useMemo<RankedPerson[]>(() => {
    return (gerentes_rank || [])
      .filter((p) => p.status !== "Ex-membro")
      .sort(byScoreThenName);
  }, [gerentes_rank, byScoreThenName]);

  const madrinhas = React.useMemo<RankedPerson[]>(() => {
    return (madrinhas_rank || [])
      .filter((p) => p.padrinho === true)
      .filter((p) => p.status !== "Ex-membro")
      .sort(byScoreThenName)
      .reverse();
  }, [madrinhas_rank, byScoreThenName]);

  return {
    score_array_consultores,
    score_array_gerentes,
    score_array_madrinhas,
    consultores_rank,
    gerentes_rank,
    madrinhas_rank,
    consultants,
    managers,
    madrinhas,
  };
}