import "../../style.css";

export default function ProfileCard() {
  return (
    <div className="profile-card">
      <div className="profile-header">Consultor(a)</div>
      <div className="profile-body">
        <div className="avatar">👤</div>
        <div className="profile-info">
          <div className="profile-name">Nome do Consultor</div>
          <div className="profile-details">Critérios e detalhes do indivíduo</div>
        </div>
      </div>
    </div>
  );
}