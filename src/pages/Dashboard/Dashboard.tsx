import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SejourHistorique } from '../../types/auth.types';
import { getDossiersRecents, getMesRendezVous } from '../../services/medecinService';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR');
}

function initiales(nom: string, prenom: string) {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}

const AV_COLORS = ['av-blue', 'av-green', 'av-red', 'av-yellow'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [recents, setRecents]   = useState<SejourHistorique[]>([]);
  const [stats, setStats]       = useState({ hospitalises: 0, rdvSemaine: 0, diagnostics: 0, aValider: 0, admissions: 0 });
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [recRes, rdvRes] = await Promise.allSettled([
          getDossiersRecents(),
          getMesRendezVous(),
        ]);

        if (recRes.status === 'fulfilled') {
          const data = recRes.value.data;
          setRecents(data);
          const actifs = data.filter((s) => s.statut === 'actif');
          const today  = new Date().toDateString();
          const admis  = actifs.filter((s) => new Date(s.dateAdmission).toDateString() === today);
          setStats((p) => ({ ...p, hospitalises: actifs.length, admissions: admis.length }));
        }

        if (rdvRes.status === 'fulfilled') {
          setStats((p) => ({ ...p, rdvSemaine: rdvRes.value.data.length }));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="med-page-header">
        <h1>Tableau de bord</h1>
        <p>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          {' · '}Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>

      {/* Statistiques */}
      <div className="med-stat-grid">
        <div className="med-stat-card blue">
          <div className="med-stat-label">Patients hospitalisés</div>
          <div className="med-stat-val">{loading ? '—' : stats.hospitalises}</div>
          <div className="med-stat-sub">↑ Pôle actif</div>
        </div>
        <div className="med-stat-card green">
          <div className="med-stat-label">RDV cette semaine</div>
          <div className="med-stat-val">{loading ? '—' : stats.rdvSemaine}</div>
          <div className="med-stat-sub">Rendez-vous programmés</div>
        </div>
        <div className="med-stat-card red">
          <div className="med-stat-label">Diagnostics posés</div>
          <div className="med-stat-val">{loading ? '—' : stats.diagnostics}</div>
          <div className="med-stat-sub">↑ {stats.aValider} à valider</div>
        </div>
        <div className="med-stat-card yellow">
          <div className="med-stat-label">Admissions du jour</div>
          <div className="med-stat-val">{loading ? '—' : stats.admissions}</div>
          <div className="med-stat-sub">Nouvelles admissions</div>
        </div>
      </div>

      {/* Dossiers récents */}
      <div className="med-section-title">Dossiers ouverts récemment</div>
      <div className="med-card">
        <div className="med-card-head">
          <span className="med-card-title">Patients consultés</span>
          <span className="med-badge med-badge-blue">
            {recents.length} dossier{recents.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="med-spinner-wrap"><div className="med-spinner" /></div>
        ) : recents.length === 0 ? (
          <div className="med-empty">
            <div className="med-empty-icon">📋</div>
            <div className="med-empty-title">Aucun dossier récent</div>
            <div className="med-empty-sub">Les dossiers consultés apparaîtront ici</div>
          </div>
        ) : (
          recents.map((s, i) => (
            <div
              key={s.id}
              className="med-row"
              onClick={() => navigate('/patients', { state: { patientId: s.patient.id } })}
            >
              <div className={`med-avatar ${AV_COLORS[i % AV_COLORS.length]}`}>
                {initiales(s.patient.nom, s.patient.prenom)}
              </div>
              <div style={{ flex: 1 }}>
                <div className="med-row-name">{s.patient.prenom} {s.patient.nom}</div>
                <div className="med-row-sub">IPP-{s.patient.numeroIpp} · {s.motifHospitalisation}</div>
              </div>
              <div className="med-row-right">
                {formatDate(s.dateAdmission)}<br />
                <span style={{ fontSize: 10, color: 'var(--med-tx3)' }}>Admis</span>
              </div>
              <span className={`med-badge ${s.statut === 'actif' ? 'med-badge-yellow' : 'med-badge-gray'}`}>
                {s.statut === 'actif' ? 'Hospitalisé' : 'Sorti'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}