export default function ConfidentialitePage() {
  return (
    <div>
      <div className="med-page-h">
        <h1 className="med-page-title">Confidentialité</h1>
        <p className="med-page-sub">Paramètres de confidentialité et données personnelles</p>
      </div>
      <div className="med-card">
        <div className="med-card-head">
          <div className="med-card-title">Politique de confidentialité</div>
        </div>
        <div className="med-card-body" style={{ color: 'var(--c-t2)', fontSize: 12.5, lineHeight: 1.7 }}>
          <p>Les données médicales sont traitées conformément au RGPD et aux réglementations en vigueur.</p>
          <p style={{ marginTop: 8 }}>Toute consultation ou modification de dossier patient est enregistrée dans les journaux d'activité.</p>
        </div>
      </div>
    </div>
  );
}
