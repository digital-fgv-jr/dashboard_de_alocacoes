import "../../style.css";
import React from "react";

export default function Column({ title, items = [], onSelect }) {

  
  return (
    <div className="col-card">
      <div className="col-header">{title}</div>

      <div className="col-list">
        {items.length === 0 && <div className="col-empty">Sem dados</div>}

        {items.map((it, idx) => {
          const name = it.name || `Pessoa ${idx + 1}`;
          const alocacoes = it.disponibilidade ?? 0;
          const badgeText = alocacoes > 0 ? `${alocacoes}` : "Livre";
          var badgeClass = 0
          if(alocacoes === 0){badgeClass = "badge-free"} else 
          if(alocacoes === 1){badgeClass = "badge-semifree"} else
          if(alocacoes === 2){badgeClass = "badge-busy"};

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