import React from "react";

type AirtableField = {
  name: string;
};

type AirtableRecordLike = {
  id: string;
  name?: string;
  getCellValue?: (fieldName: string) => unknown;
};

type TableLike = {
  fields?: AirtableField[];
} | null;

type ScoreRecord = {
  id: string;
  [key: string]: unknown;
};

type PhotoItem = {
  url?: string;
};

type RadarData = {
  labels: string[];
  values: number[];
};

export type PersonData = {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  description: string;
  radar: RadarData;
  projectsLinked: string[];
  __rawRecord: AirtableRecordLike;
  [key: string]: unknown;
};

export default function usePpldata(
  table: TableLike,
  records: AirtableRecordLike[] = [],
  scores: ScoreRecord[] | Map<unknown, ScoreRecord> = []
) {
  const fieldNames = React.useMemo<Set<string>>(() => {
    if (!table || !table.fields) return new Set();
    return new Set(table.fields.map((f) => f.name));
  }, [table]);

  const scoresArr = React.useMemo<ScoreRecord[]>(() => {
    if (scores instanceof Map) return Array.from(scores.values());
    return Array.isArray(scores) ? scores : [];
  }, [scores]);

  const nota_membro = React.useMemo<Map<string, ScoreRecord>>(() => {
    const membro = new Map<string, ScoreRecord>();

    scoresArr.forEach((rec) => {
      if (rec && rec.id != null) {
        membro.set(rec.id, rec);
      }
    });

    return membro;
  }, [scoresArr]);

  const radarFields = React.useMemo<string[]>(() => {
    if (!table || !table.fields) return [];
    const keywords = [
      "comunic",
      "tecni",
      "proativ",
      "prazo",
      "qualidade",
      "nota",
      "score",
      "avalia",
      "qap",
    ];
    return table.fields
      .map((f) => f.name)
      .filter((name) => keywords.some((k) => name.toLowerCase().includes(k)))
      .slice(0, 6);
  }, [table]);

  const people = React.useMemo<PersonData[]>(() => {
    return (records || []).map((r) => {
      const get = (n: string): unknown => {
        if (!r || !r.getCellValue) return null;
        try {
          return r.getCellValue(n);
        } catch (e) {
          return null;
        }
      };

      const name = String(get("Name") || r.name || get("Membro") || "").trim();
      const role = String(get("Função") || get("Cargo") || "");

      let photoUrl: string | null = null;
      const photoCell = get("Foto") || get("Image");
      if (Array.isArray(photoCell)) {
        const first = photoCell[0] as PhotoItem | undefined;
        if (first && first.url) {
          photoUrl = first.url;
        }
      }

      const de_process = nota_membro ? nota_membro.get(r.id) : null;

      const description = String(
        get("Descrição") || get("Descricao") || get("Bio") || ""
      );

      let projectsLinked: string[] = [];
      const projVal = get("Projeto") || get("Projetos");
      if (projVal) {
        projectsLinked = Array.isArray(projVal)
          ? projVal.map((x) => {
              if (
                x &&
                typeof x === "object" &&
                "name" in x &&
                typeof (x as { name?: unknown }).name === "string"
              ) {
                return (x as { name: string }).name;
              }
              return String(x);
            })
          : [String(projVal)];
      }

      const radar: RadarData = { labels: [], values: [] };
      (radarFields || []).forEach((f) => {
        radar.labels.push(f);
        const raw = get(f);
        let v = 0;

        if (typeof raw === "number") v = raw;
        else if (typeof raw === "string")
          v = parseFloat(raw.replace(",", ".")) || 0;
        else if (
          raw &&
          typeof raw === "object" &&
          "value" in raw &&
          typeof (raw as { value?: unknown }).value !== "undefined"
        ) {
          v = Number((raw as { value?: unknown }).value) || 0;
        }

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

  return {
    fieldNames,
    scoresArr,
    nota_membro,
    radarFields,
    people,
  };
}