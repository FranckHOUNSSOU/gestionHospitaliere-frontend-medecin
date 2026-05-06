import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SejourHistorique } from '../../types/auth.types';
import { getMesHospitalisations } from '../../services/medecinService';

type Filtre = 'actif' | 'all' | 'cloture';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

function duree(debut: string, fin?: string) {
  const ms   = (fin ? new Date(fin) : new Date()).getTime() - new Date(debut).getTime();
  const jours = Math.floor(ms / (1000 * 3600 * 24));
  return `${jours} jour${jours > 1 ? 's' : ''}`;
}

function initiales(nom: string, prenom: string) {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}

const AV_COLORS = ['av-blue', 'av-green', 'av-red', 'av-yellow'];

export default function SejourHistorique() {
  const navigate = useNavigate();
  const [filtre,  setFiltre]  = useState<Filtre>('actif');
  const [tous,    setTous]    = useState<SejourHistorique[]>([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getMesHospitalisations();
        setTous(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtres = tous.filter((s) => {
    const matchStatut =
      filtre === 'all' ||
      (filtre === 'actif'   && s.statut === 'actif') ||
      (filtre === 'cloture' && s.statut === 'cloture');

    if (!matchStatut) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.patient.nom.toLowerCase().includes(q) ||
        s.patient.prenom.toLowerCase().includes(q) ||
        s.patient.numeroIpp.toLowerCase().includes(q) ||
        s.numeroSejour.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const nbActifs  = tous.filter((s) => s.statut === 'actif').length;
  const nbClotures = tous.filter((s) => s.statut === 'cloture').length;

  const FILTRES: { value: Filtre; label: string }[] = [
    { value: 'actif',   label: `Actifs (${nbActifs})` },
    { value: 'all',     label: `Tous (${tous.length})` },
    { value: 'cloture', label: `Terminés (${nbClotures})` },
  ];

  function openDossier(s: SejourHistorique) {
    navigate('/patients', { state: { patientId: s.patient.id } });
  }

  return (
    <div>
      <div className="med-page-header">
        <h1>Historique des hospitalisations</h1>
        <p>Patients pris en charge — les actifs sont affichés par défaut</p>
      </div>

      {/* Barre de recherche + filtres */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          className="med-form-input"
          placeholder="Rechercher par nom, prénom ou IPP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />

        <div style={{ display: 'flex', border: '1px solid var(--med-border)', borderRadius: 6, overflow: 'hidden' }}>
          {FILTRES.map((f, i) => (
            <button
              key={f.value}
              onClick={() => setFiltre(f.value)}
              style={{
                padding: '7px 16px', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: 'none',
                borderRight: i < 2 ? '1px solid var(--med-border)' : 'none',
                background: filtre === f.value ? 'var(--med-blue)' : '#fff',
                color: filtre === f.value ? '#fff' : 'var(--med-tx2)',
                transition: 'background 0.12s, color 0.12s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="med-badge med-badge-blue" style={{ marginLeft: 'auto' }}>
          {filtres.length} patient{filtres.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="med-spinner-wrap"><div className="med-spinner" /></div>
      ) : filtres.length === 0 ? (
        <div className="med-empty">
          <div className="med-empty-icon">🏥</div>
          <div className="med-empty-title">
            {search ? 'Aucun résultat' : filtre === 'actif' ? 'Aucun patient hospitalisé' : 'Aucune hospitalisation'}
          </div>
          <div className="med-empty-sub">
            {search ? `Aucun patient trouvé pour « ${search} »` : 'Aucune hospitalisation dans cette catégorie'}
          </div>
        </div>
      ) : (
        <div className="med-card">
          {filtres.map((s, i) => (
            <div key={s.id} className="med-row" onClick={() => openDossier(s)}>
              <div className={`med-avatar ${AV_COLORS[i % AV_COLORS.length]}`}>
                {initiales(s.patient.nom, s.patient.prenom)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="med-row-name">{s.patient.prenom} {s.patient.nom}</span>
                  <span style={{ fontSize: 11, color: 'var(--med-tx2)', fontFamily: 'monospace' }}>
                    IPP-{s.patient.numeroIpp}
                  </span>
                </div>
                <div className="med-row-sub">{s.motifHospitalisation}</div>
                <div style={{ fontSize: 11, color: 'var(--med-tx3)', marginTop: 2 }}>
                  {s.numeroSejour} · Admis le {formatDate(s.dateAdmission)}
                  {s.dateSortie ? ` → Sorti le ${formatDate(s.dateSortie)}` : ' → En cours'}
                </div>
              </div>
              <div className="med-row-right">
                {duree(s.dateAdmission, s.dateSortie)}<br />
                <span style={{ fontSize: 10, color: 'var(--med-tx3)' }}>Durée</span>
              </div>
              <span className={`med-badge ${s.statut === 'actif' ? 'med-badge-yellow' : 'med-badge-gray'}`}>
                {s.statut === 'actif' ? 'Hospitalisé' : 'Sorti'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--med-blue)', fontWeight: 500 }}>
                Dossier →
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}