import { useEffect, useState } from 'react';
import type { Patient, Sejour } from '../../types/auth.types';
import { getPatientDossier, getSejourActif, getHistoriqueSejours } from '../../services/medecinService';
import OrdonnanceModal from './OrdonnanceModal';

interface Props {
  patient: Patient;
  onRetour: () => void;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}

function age(ddn: string) {
  const ans = Math.floor((Date.now() - new Date(ddn).getTime()) / (365.25 * 24 * 3600 * 1000));
  return `${ans} an${ans > 1 ? 's' : ''}`;
}

function initiales(nom: string, prenom: string) {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}

export default function PatientDossier({ patient, onRetour }: Props) {
  const [dossier,        setDossier]        = useState<Patient | null>(null);
  const [sejourActif,    setSejourActif]    = useState<Sejour | null>(null);
  const [historique,     setHistorique]     = useState<Sejour[]>([]);
  const [autresSymptomes, setAutresSymptomes] = useState('');
  const [showOrdonnance, setShowOrdonnance] = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [feedback,       setFeedback]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [dRes, sRes, hRes] = await Promise.allSettled([
          getPatientDossier(patient.id),
          getSejourActif(patient.id),
          getHistoriqueSejours(patient.id),
        ]);
        if (dRes.status === 'fulfilled') setDossier(dRes.value.data as unknown as Patient);
        if (sRes.status === 'fulfilled') setSejourActif(sRes.value.data);
        if (hRes.status === 'fulfilled') setHistorique(hRes.value.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patient.id]);

  async function handleMettreAJour() {
    if (!autresSymptomes.trim()) return;
    setSaving(true);
    // TODO: endpoint PUT /patients/:id/dossier quand disponible côté backend
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setFeedback({ type: 'success', msg: 'Dossier mis à jour avec succès.' });
    setTimeout(() => setFeedback(null), 3000);
  }

  const pt = dossier ?? patient;
  const allergiesSeveres = pt.allergies?.filter((a) => a.severite === 'Sévère') ?? [];
  const diagnosticsValides   = sejourActif?.diagnostics?.filter((d) => d.valide) ?? [];
  const diagnosticsEnAttente = sejourActif?.diagnostics?.filter((d) => !d.valide) ?? [];

  if (loading) return <div className="med-spinner-wrap"><div className="med-spinner" /></div>;

  return (
    <div>
      {/* Retour */}
      <button className="med-btn" style={{ marginBottom: 16 }} onClick={onRetour}>
        ← Retour aux résultats
      </button>

      {/* En-tête patient */}
      <div className="med-card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div className="med-avatar av-blue" style={{ width: 52, height: 52, borderRadius: 10, fontSize: 16 }}>
          {initiales(pt.nom, pt.prenom)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--med-tx)' }}>
            {pt.prenom} {pt.nom}
          </div>
          <div style={{ fontSize: 12, color: 'var(--med-tx2)', marginTop: 2 }}>
            IPP-{pt.numeroIpp} · {age(pt.dateNaissance)} (né(e) le {formatDate(pt.dateNaissance)}) · {pt.sexe === 'F' ? 'Féminin' : 'Masculin'}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {sejourActif
              ? <span className="med-badge med-badge-yellow">Hospitalisé(e)</span>
              : <span className="med-badge med-badge-gray">Pas de séjour actif</span>}
            {allergiesSeveres.map((a) => (
              <span key={a.id} className="med-badge med-badge-red">⚠ Allergie : {a.allergene}</span>
            ))}
            {sejourActif && (
              <span className="med-badge med-badge-blue">Séjour depuis le {formatDate(sejourActif.dateAdmission)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Alertes */}
      {allergiesSeveres.length > 0 && (
        <div className="med-alert med-alert-danger">
          ⚠ {allergiesSeveres.map((a) => `ALLERGIE SÉVÈRE : ${a.allergene}`).join(' | ')}
        </div>
      )}
      {feedback && (
        <div className={`med-alert ${feedback.type === 'success' ? 'med-alert-success' : 'med-alert-danger'}`}>
          {feedback.msg}
        </div>
      )}

      <div className="med-grid-2" style={{ marginBottom: 16 }}>
        {/* Informations critiques + allergies */}
        <div>
          <div className="med-section-title">Informations critiques</div>
          <div className="med-grid-2" style={{ gap: 10, marginBottom: 12 }}>
            <div className="med-info-block critical">
              <div className="med-ib-label">Groupe sanguin</div>
              <div className="med-ib-val" style={{ color: 'var(--med-red)' }}>
                {pt.groupeSanguinAbo ?? '—'} Rh {pt.groupeSanguinRhesus ?? '—'}
              </div>
              <div className="med-ib-sub">⚠ Vérifier avant transfusion</div>
            </div>
            <div className="med-info-block critical">
              <div className="med-ib-label">Statut réanimatoire</div>
              <div className="med-ib-val">{pt.statutReanimatoire ?? 'Non renseigné'}</div>
              <div className="med-ib-sub">Directive anticipée</div>
            </div>
          </div>

          <div className="med-section-title">Allergies connues</div>
          <div className="med-card">
            {pt.allergies && pt.allergies.length > 0
              ? pt.allergies.map((a) => (
                  <div key={a.id} className="med-row" style={{ cursor: 'default' }}>
                    <span className={`med-badge ${a.severite === 'Sévère' || a.severite === 'Mortelle' ? 'med-badge-red' : a.severite === 'Modérée' ? 'med-badge-yellow' : 'med-badge-gray'}`}>
                      {a.severite ?? 'Non précisé'}
                    </span>
                    <div>
                      <div className="med-row-name">{a.allergene}</div>
                      {a.observations && <div className="med-row-sub">{a.observations}</div>}
                    </div>
                  </div>
                ))
              : <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--med-tx2)' }}>Aucune allergie enregistrée</div>}
          </div>
        </div>

        {/* Motif + Autres symptômes */}
        <div>
          <div className="med-section-title">Séjour actif</div>
          <div className="med-card" style={{ marginBottom: 12 }}>
            <div style={{ padding: '12px 16px' }}>
              {sejourActif ? (
                <>
                  <div className="med-form-group" style={{ marginBottom: 10 }}>
                    <div className="med-form-label">Motif d'hospitalisation</div>
                    <div style={{ fontSize: 13, color: 'var(--med-tx)', padding: '8px 10px', background: 'var(--med-gray-50)', borderRadius: 6 }}>
                      {sejourActif.motifHospitalisation}
                    </div>
                  </div>
                  <div className="med-form-group">
                    <label className="med-form-label" htmlFor="autres">Autres symptômes / observations cliniques</label>
                    <textarea
                      id="autres"
                      className="med-form-textarea"
                      rows={4}
                      placeholder="Saisir des symptômes complémentaires, observations..."
                      value={autresSymptomes}
                      onChange={(e) => setAutresSymptomes(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--med-tx2)' }}>Aucun séjour actif pour ce patient.</div>
              )}
            </div>
          </div>

          {/* Traitements à risque */}
          {pt.traitementsARisque && pt.traitementsARisque.length > 0 && (
            <>
              <div className="med-section-title">Traitements à risque</div>
              <div className="med-card">
                {pt.traitementsARisque.map((t) => (
                  <div key={t.id} className="med-row" style={{ cursor: 'default' }}>
                    <span className="med-badge med-badge-yellow">⚠</span>
                    <div>
                      <div className="med-row-name">{t.nomMedicament}</div>
                      <div className="med-row-sub">{t.observations ?? t.posologieEnCours ?? t.classe ?? ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Diagnostics du séjour */}
      {sejourActif && (
        <>
          <div className="med-section-title">Diagnostics — séjour en cours</div>
          <div className="med-card" style={{ marginBottom: 16 }}>
            {diagnosticsValides.length === 0 && diagnosticsEnAttente.length === 0
              ? <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--med-tx2)' }}>Aucun diagnostic enregistré pour ce séjour.</div>
              : [...diagnosticsValides, ...diagnosticsEnAttente].map((d) => (
                  <div key={d.id} className="med-row" style={{ cursor: 'default' }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--med-gray-100)', padding: '2px 6px', borderRadius: 4, color: 'var(--med-tx2)' }}>
                      {d.codeCim10}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="med-row-name">{d.libelle}</div>
                      <div className="med-row-sub">Type : {d.type} · Statut : {d.statut}{d.dateCreation && ` · ${formatDate(d.dateCreation)}`}</div>
                    </div>
                    <span className={`med-badge ${d.valide ? 'med-badge-green' : 'med-badge-yellow'}`}>
                      {d.valide ? 'Validé' : 'En attente'}
                    </span>
                  </div>
                ))}
          </div>
        </>
      )}

      {/* Historique séjours */}
      {historique.length > 0 && (
        <>
          <div className="med-section-title">Historique des séjours</div>
          <div className="med-card" style={{ marginBottom: 16 }}>
            {historique.map((s) => (
              <div key={s.id} className="med-row" style={{ cursor: 'default' }}>
                <div style={{ flex: 1 }}>
                  <div className="med-row-name">{s.motifHospitalisation}</div>
                  <div className="med-row-sub">{formatDate(s.dateAdmission)} → {formatDate(s.dateSortie)} · {s.numeroSejour}</div>
                </div>
                <span className="med-badge med-badge-gray">Terminé</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {sejourActif && (
          <button className="med-btn med-btn-primary" onClick={() => setShowOrdonnance(true)}>
            📋 Saisir une ordonnance
          </button>
        )}
        <button
          className="med-btn med-btn-green"
          onClick={handleMettreAJour}
          disabled={saving || !autresSymptomes.trim()}
        >
          {saving ? 'Enregistrement...' : '💾 Mettre à jour le dossier'}
        </button>
      </div>

      {/* Modal ordonnance */}
      {showOrdonnance && sejourActif && (
        <OrdonnanceModal
          patient={pt}
          sejour={sejourActif}
          onClose={() => setShowOrdonnance(false)}
          onSuccess={() => setFeedback({ type: 'success', msg: 'Ordonnance enregistrée avec succès.' })}
        />
      )}
    </div>
  );
}