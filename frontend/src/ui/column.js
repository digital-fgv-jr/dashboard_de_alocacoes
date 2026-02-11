import "../../style.css";
import React from "react";

export default function Column({ title, items = [], onSelect, col_papel }) {

  
  return (
    <div className="col-card">
      <div className="col-header">{title}</div>

      <div className="col-list">
        {items.length === 0 && <div className="col-empty">Sem dados</div>}

        {items.map((it, idx) => {
          const name = it.name || `Pessoa ${idx + 1}`;
          const alocacoes = it.disponibilidade ?? 0;
          const m_alocacoes = it.disp_madrinha ?? 0;
          var badgeClass = "badge-free"
          var badgeText = alocacoes > 0 ? `${alocacoes}` : "Livre";

          if (col_papel === "Madrinhas") {
            badgeText = m_alocacoes > 0 ? `${m_alocacoes}` : "Livre";
            badgeClass = "badge-free"
            if(m_alocacoes === 0){badgeClass = "badge-free"} else 
            if(m_alocacoes === 1){badgeClass = "badge-semifree"} else
            if(m_alocacoes === 2){badgeClass = "badge-busy"};
          } else
          if (col_papel !== "Madrinhas") {
            badgeText = alocacoes > 0 ? `${alocacoes}` : "Livre";
            badgeClass = "badge-free"
            if(alocacoes === 0){badgeClass = "badge-free"} else 
            if(alocacoes === 1){badgeClass = "badge-semifree"} else
            if(alocacoes === 2){badgeClass = "badge-busy"};
          } else {
            badgeText = "Livre";
            badgeClass = "badge-free"
          }

          return (
            <div
              key={it.id || idx}
              className="col-item"
              onClick={() => onSelect && onSelect(it)}
            >
              <div className="col-rank">#{String(idx + 1).padStart(2, "0")}</div>

              <div className="col-item-body">
                <div className="col-item-name">{name}</div>
                {it.role && <div className="col-item-role">{it.role}</div>}
              </div>

              <div className={`badge ${badgeClass}`}>{badgeText}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}