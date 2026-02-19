import React from "react";

export default function Column({
  title,
  items = [],
  onSelect,
  col_papel,
  scores = null,
}) {
  return (
    <div
      className={[
        "flex flex-col min-h-0 overflow-hidden border",
        "rounded-[10px]",
        "shadow-[0_3px_12px_rgba(0,0,0,0.08)]",
        "flex-[0_0_180px] min-w-[263px]",
        "bg-[var(--card-bg,#fff)] border-[var(--border,#e5e7eb)]",
      ].join(" ")}
    >
      <div
        className={[
          "text-white text-center font-bold text-[14px]",
          "px-3",
          "h-[44px]",
          "flex items-center justify-center",
          "rounded-t-[10px]",
          "bg-[var(--brand,#0b2540)]",
        ].join(" ")}
      >
        {title}
      </div>

      <div
        className={[
          "p-[14px]",
          "flex-1 min-h-0 overflow-y-auto",
          "flex flex-col gap-2",
          "min-h-[300px]",
          "max-h-[calc(100vh-160px)]",
        ].join(" ")}
      >
        {items.length === 0 && (
          <div
            className={[
              "text-center italic text-[12px]",
              "px-[15px] py-[25px]",
              "text-[var(--muted-2,#9ca3af)]",
            ].join(" ")}
          >
            Sem dados
          </div>
        )}

        {items.map((it, idx) => {
          const name = it.name || `Pessoa ${idx + 1}`;
          const alocacoes = it.disponibilidade ?? 0;
          const m_alocacoes = it.disp_madrinha ?? 0;

          const score_pessoas = scores?.find((p) => p.nome === it.name);
          const score_total_quebrado = score_pessoas?.score;
          const score_total = Math.round(score_total_quebrado * 100) / 100;

          let badgeClass = "badge-free";
          let badgeText = score_total ? String(score_total) : 0;

          if (col_papel === "Madrinhas") {
            badgeClass = "badge-free";
            if (m_alocacoes === 0) badgeClass = "badge-free";
            else if (m_alocacoes === 1) badgeClass = "badge-semifree";
            else if (m_alocacoes === 2) badgeClass = "badge-busy";
          } else if (col_papel === "Gerentes") {
            badgeClass = "badge-free";
            if (alocacoes === 0) badgeClass = "badge-free";
            else if (alocacoes === 1) badgeClass = "badge-semifree";
            else if (alocacoes === 2) badgeClass = "badge-busy";
          } else if (col_papel === "Consultores") {
            badgeClass = "badge-free";
            if (alocacoes === 0) badgeClass = "badge-free";
            else if (alocacoes === 1) badgeClass = "badge-semifree";
            else if (alocacoes === 2) badgeClass = "badge-busy";
          } else {
            badgeText = "Livre";
            badgeClass = "badge-free";
          }

          const badgeBg =
            badgeClass === "badge-free"
              ? "bg-[var(--free-color,#10b981)]"
              : badgeClass === "badge-semifree"
              ? "bg-[var(--semibusy-color,#fdca40)]"
              : "bg-[var(--busy-color,#ef4444)]";

          return (
            <div
              key={it.id || idx}
              onClick={() => onSelect && onSelect(it)}
              className={[
                "flex items-center gap-[10px] p-[9px]",
                "rounded-[7px] border cursor-pointer",
                "transition-all duration-200 flex-shrink-0",
                "bg-[var(--item-bg,#fbfdff)] border-[var(--border,#e5e7eb)]",
                "hover:-translate-y-[1px]",
                "hover:shadow-[0_4px_10px_rgba(0,0,0,0.08)]",
                "hover:border-[var(--primary-soft-border,#dbeafe)]",
                "hover:bg-[var(--card-bg,#ffffff)]",
              ].join(" ")}
            >
              <div
                className={[
                  "w-8 h-8",
                  "text-white font-bold",
                  "flex items-center justify-center",
                  "rounded-[6px] flex-shrink-0 text-[12px]",
                  "bg-[var(--brand,#0b2540)]",
                ].join(" ")}
              >
                #{String(idx + 1).padStart(2, "0")}
              </div>

              <div className="flex-1 min-w-0 overflow-hidden flex flex-col gap-[2px]">
                <div className="text-[12px] font-medium whitespace-nowrap overflow-hidden text-ellipsis text-[var(--text-strong,#1f2937)]">
                  {name}
                </div>

                {it.role && (
                  <div className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis text-[var(--muted,#6b7280)]">
                    {it.role}
                  </div>
                )}
              </div>

              <div
                className={[
                  "px-[9px] py-1",
                  "rounded-full font-bold text-white whitespace-nowrap",
                  "text-[10px] min-w-[50px] text-center flex-shrink-0",
                  badgeBg,
                ].join(" ")}
              >
                {badgeText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
