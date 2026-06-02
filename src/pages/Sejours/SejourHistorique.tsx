import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SejourHistorique } from '../../types/auth.types';
import { getMesHospitalisations } from '../../services/medecinService';

type FiltreType = 'Tous' | 'Hospitalisation' | 'Consultation' | 'Urgences';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

function duree(debut: string, fin?: string) {
  const ms    = (fin ? new Date(fin) : new Date()).getTime() - new Date(debut).getTime();
  const jours = Math.floor(ms / (1000 * 3600 * 24));
  return jours === 0 ? 'Même jour' : `${jours} jour${jours > 1 ? 's' : ''}`;
}

function initiales(nom: string, prenom: string) {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}

function debutSemaine(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
  return d;
}

const TYPE_COLORS: Record<string, string> = {
  'Hospitalisation': 'med-badge-blue',
  'Consultation':    'med-badge-green',
  'Urgences':        'med-badge-red',
};

const TYPE_ICON: Record<string, string> = {
  'Hospitalisation': '🏥',
  'Consultation':    '🩺',
  'Urgences':        '🚨',
};

const AV_COLORS = ['av-blue', 'av-green', 'av-red', 'av-yellow'];

export default function SejourHistorique() {
  const navigate = useNavigate();

  const [tous,         setTous]         = useState<SejourHistorique[]>([]);
  const [filtreType,   setFiltreType]   = useState<FiltreType>('Tous');
  const [semaineSeulement, setSemaine]  = useState(true);
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    getMesHospitalisations()
      .then(res => setTous(res.data))
      .finally(() => setLoading(false));
  }, []);

  const lundiSemaine = debutSemaine();

  const filtres = tous.filter(s => {
    // Filtre semaine
    if (semaineSeulement && new Date(s.dateAdmission) < lundiSemaine) return false;

    // Filtre type
    const type = s.typeSejour ?? 'Hospitalisation';
    if (filtreType !== 'Tous' && type !== filtreType) return false;

    // Recherche
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.patient.nom.toLowerCase().includes(q) ||
        s.patient.prenom.toLowerCase().includes(q) ||
        s.patient.numeroIpp.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const nbType = (t: string) =>
    (semaineSeulement
      ? tous.filter(s => new Date(s.dateAdmission) >= lundiSemaine)
      : tous
    ).filter(s => (s.typeSejour ?? 'Hospitalisation') === t).length;

  const FILTRES: { value: FiltreType; label: string }[] = [
    { value: 'Tous',           label: `Tous (${semaineSeulement ? tous.filter(s => new Date(s.dateAdmission) >= lundiSemaine).length : tous.length})` },
    { value: 'Hospitalisation', label: `Hospitalisé (${nbType('Hospitalisation')})` },
    { value: 'Consultation',    label: `Consultation (${nbType('Consultation')})` },
    { value: 'Urgences',        label: `Urgences (${nbType('Urgences')})` },
  ];

  return (
    <div>
      <div className="med-page-header">
        <h1>Historique</h1>
        <p>Séjours pris en charge — {semaineSeulement ? 'semaine en cours' : 'tout l\'historique'}</p>
      </div>

      {/* Barre de recherche + toggle semaine */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          className="med-form-input"
          placeholder="Rechercher par nom, prénom ou IPP..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320, flex: 1 }}
        />
        <button
          onClick={() => setSemaine(v => !v)}
          style={{
            padding: '7px 14px', fontSize: 12, fontWeight: 500,
            borderRadius: 6, border: '1px solid var(--med-border)',
            cursor: 'pointer',
            background: semaineSeulement ? 'var(--med-blue)' : '#fff',
            color: semaineSeulement ? '#fff' : 'var(--med-tx2)',
            transition: 'background 0.12s, color 0.12s',
            whiteSpace: 'nowrap',
          }}
        >
          {semaineSeulement ? '📅 Cette semaine' : '📋 Tout l\'historique'}
        </button>
      </div>

      {/* Filtres par type */}
      <div style={{ display: 'flex', border: '1px solid var(--med-border)', borderRadius: 6, overflow: 'hidden', marginBottom: 16, width: 'fit-content' }}>
        {FILTRES.map((f, i) => (
          <button
            key={f.value}
            onClick={() => setFiltreType(f.value)}
            style={{
              padding: '7px 16px', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border: 'none',
              borderRight: i < FILTRES.length - 1 ? '1px solid var(--med-border)' : 'none',
              background: filtreType === f.value ? 'var(--med-blue)' : '#fff',
              color: filtreType === f.value ? '#fff' : 'var(--med-tx2)',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="med-spinner-wrap"><div className="med-spinner" /></div>
      ) : filtres.length === 0 ? (
        <div className="med-empty">
          <div className="med-empty-icon">
            {filtreType === 'Tous' ? '🏥' : TYPE_ICON[filtreType]}
          </div>
          <div className="med-empty-title">
            {search
              ? 'Aucun résultat'
              : semaineSeulement
                ? `Aucune ${filtreType === 'Tous' ? 'prise en charge' : filtreType.toLowerCase()} cette semaine`
                : `Aucune ${filtreType === 'Tous' ? 'prise en charge' : filtreType.toLowerCase()}`
            }
          </div>
          <div className="med-empty-sub">
            {semaineSeulement && (
              <button
                onClick={() => setSemaine(false)}
                style={{ background: 'none', border: 'none', color: 'var(--med-blue)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
              >
                Voir tout l'historique
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="med-card">
          {filtres.map((s, i) => {
            const type = s.typeSejour ?? 'Hospitalisation';
            return (
              <div key={s.id} className="med-row" onClick={() => navigate('/patients', { state: { patientId: s.patient.id } })}>
                <div className={`med-avatar ${AV_COLORS[i % AV_COLORS.length]}`}>
                  {initiales(s.patient.nom, s.patient.prenom)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="med-row-name">{s.patient.prenom} {s.patient.nom}</span>
                    <span style={{ fontSize: 11, color: 'var(--med-tx2)', fontFamily: 'monospace' }}>
                      {s.patient.numeroIpp}
                    </span>
                    <span className={`med-badge ${TYPE_COLORS[type] ?? 'med-badge-gray'}`} style={{ fontSize: 10 }}>
                      {TYPE_ICON[type]} {type}
                    </span>
                  </div>
                  <div className="med-row-sub">{s.motifHospitalisation}</div>
                  <div style={{ fontSize: 11, color: 'var(--med-tx3)', marginTop: 2 }}>
                    Admis le {formatDate(s.dateAdmission)}
                    {s.dateSortie ? ` → Sorti le ${formatDate(s.dateSortie)}` : ' → En cours'}
                  </div>
                </div>
                <div className="med-row-right">
                  {duree(s.dateAdmission, s.dateSortie)}<br />
                  <span style={{ fontSize: 10, color: 'var(--med-tx3)' }}>Durée</span>
                </div>
                <span className={`med-badge ${s.statut === 'actif' ? 'med-badge-yellow' : 'med-badge-gray'}`}>
                  {s.statut === 'actif' ? 'En cours' : 'Terminé'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--med-blue)', fontWeight: 500 }}>Dossier →</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}