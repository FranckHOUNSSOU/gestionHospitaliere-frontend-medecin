import { useAuth } from '../../context/AuthContext';

export default function ProfilPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="med-page-h">
        <h1 className="med-page-title">Mon profil</h1>
        <p className="med-page-sub">Informations de votre compte médecin</p>
      </div>
      <div className="med-card" style={{ maxWidth: 480 }}>
        <div className="med-card-head">
          <div className="med-card-title">Informations personnelles</div>
        </div>
        <div className="med-card-body">
          <div className="med-form-grid">
            <div className="med-form-field">
              <label className="med-label">Nom</label>
              <input className="med-input" value={user?.nom ?? ''} readOnly />
            </div>
            <div className="med-form-field">
              <label className="med-label">Prénom</label>
              <input className="med-input" value={user?.prenom ?? ''} readOnly />
            </div>
            <div className="med-form-field">
              <label className="med-label">Email</label>
              <input className="med-input" value={user?.email ?? ''} readOnly />
            </div>
            <div className="med-form-field">
              <label className="med-label">Rôle</label>
              <input className="med-input" value={user?.role ?? ''} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
