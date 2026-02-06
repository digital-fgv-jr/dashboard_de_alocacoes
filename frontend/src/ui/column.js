import "../../style.css";
import React from "react";

// Componente de coluna para exibição de membros por categoria
export default function Column({ title, items = [], onSelect }) {
  return (
    <div className="col-card">
      <div className="col-header">{title}</div>

      <div className="col-list">
        {items.length === 0 && <div className="col-empty">Sem dados</div>}

        {items.map((it, idx) => {
          const name = it.name || `Pessoa ${idx + 1}`;
          const alocacoes = it.alocacoes ?? 0;
          
          // Determinação do badge baseado no nível de ocupação
          const badgeText = alocacoes > 0 ? `${alocacoes}` : "Livre";
          const badgeClass = alocacoes > 0 ? "badge-busy" : "badge-free";

          return (
            <div
              key={it.id || idx}
              className="col-item"
              onClick={() => onSelect && onSelect(it)}
            >
              {/* Número de ranking */}
              <div className="col-rank">#{String(idx + 1).padStart(2, "0")}</div>

              <div className="col-item-body">
                <div className="col-item-name">{name}</div>
                {it.role && <div className="col-item-role">{it.role}</div>}
              </div>

              {/* Badge de status de alocação */}
              <div className={`badge ${badgeClass}`}>{badgeText}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}