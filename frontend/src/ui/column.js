import "../../style.css";

export default function Column({ title, items = [], onSelect }) {
  return (
    <div className="col-card">
      <div className="col-header">{title}</div>

      <div className="col-list">
        {items.length === 0 && (
          <div className="col-empty">Sem dados</div>
        )}

        {items.map((it, idx) => {
          // 🔒 Proteções para dados ainda vazios
          const name = it.name || `Pessoa ${idx + 1}`;
          const alocacoes = it.alocacoes ?? null;

          // 🎯 Lógica do badge (pronta para o futuro)
          let badgeClass = "badge-free";
          let badgeText = "Sem informação";

          if (typeof alocacoes === "number") {
            if (alocacoes === 0) {
              badgeClass = "badge-free";
              badgeText = "Livre";
            } else if (alocacoes === 1) {
              badgeClass = "badge-1";
              badgeText = "1 Projeto";
            } else {
              badgeClass = "badge-2";
              badgeText = `${alocacoes} Projetos`;
            }
          }
          
          console.log("ITEM DO MAP:", {
            name: it.name,
            alocacoes: it.alocacoes,
          });


          return (
            <div key={it.id || idx} className="col-item">
              <div className="col-item-name">{name}</div>

              <div className={`badge ${badgeClass}`}>
                {badgeText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

