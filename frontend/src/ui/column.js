import "../../style/columns.css"
import "../../style/base.css"
import "../../style/layout.css"
import "../../style/projects_panel.css"
import "../../style/responsive.css"
import "../../style/scroll.css"
import "../../style/session2.css"
import "../../style/weights.css"
import React from "react";

export default function Column({ 
  title, 
  items = [], 
  onSelect, 
  col_papel,
  scores = null,
  }) {

  
  return (
    <div className="col-card">
      <div className="col-header">{title}</div>

      <div className="col-list">
        {items.length === 0 && <div className="col-empty">Sem dados</div>}

        {items.map((it, idx) => {
          const name = it.name || `Pessoa ${idx + 1}`;
          const alocacoes = it.disponibilidade ?? 0;
          const m_alocacoes = it.disp_madrinha ?? 0;
          const score_pessoas = scores.find(p => p.nome === it.name)
          const score_total_quebrado = score_pessoas?.score
          const score_total = Math.round(score_total_quebrado*100)/100
          var badgeClass = "badge-free"
          var badgeText = score_total ? String(score_total) : 0;

          if (col_papel === "Madrinhas") {
            badgeClass = "badge-free"
            if(m_alocacoes === 0){badgeClass = "badge-free"} else 
            if(m_alocacoes === 1){badgeClass = "badge-semifree"} else
            if(m_alocacoes === 2){badgeClass = "badge-busy"};
          } else
          if (col_papel === "Gerentes") {
            badgeClass = "badge-free"
            if(alocacoes === 0){badgeClass = "badge-free"} else 
            if(alocacoes === 1){badgeClass = "badge-semifree"} else
            if(alocacoes === 2){badgeClass = "badge-busy"};
          } else 
          if (col_papel === "Consultores"){
            badgeClass = "badge-free"
            if(alocacoes === 0){badgeClass = "badge-free"} else 
            if(alocacoes === 1){badgeClass = "badge-semifree"} else
            if(alocacoes === 2){badgeClass = "badge-busy"};
          }else {
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