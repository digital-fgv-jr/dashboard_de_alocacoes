import "../../style.css";
import React from "react";

export default function ProfileCard({ person }) {
  // Se não houver pessoa selecionada, não renderiza nada.
  if (!person) return null;

  return (
    <div className="profile-card">
      <div className="avatar-placeholder">
        {person.photoUrl ? (
          <img src={person.photoUrl} alt={person.name} />
        ) : (
          <div className="avatar-initial">{person.name ? person.name[0] : "?"}</div>
        )}
      </div>

      <div className="profile-meta">
        <div className="profile-name">{person.name}</div>
        {person.role && <div className="profile-role">{person.role}</div>}
        <div className="profile-alloc"><strong>Alocações:</strong> {person.alocacoes ?? 0}</div>
      </div>
    </div>
  );
}
