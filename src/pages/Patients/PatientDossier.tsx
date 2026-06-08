import { useEffect, useState } from 'react';
import type { Patient, Prescription, Sejour } from '../../types/auth.types';
import { getPatientDossier, getSejourActif, getHistoriqueSejours, prendreEnCharge } from '../../services/medecinService';
import { useAuth } from '../../context/AuthContext';
import OrdonnanceModal from './OrdonnanceModal';

function printGroupePrescriptions(
  patient: Patient,
  medecin: { prenom: string; nom: string } | null | undefined,
  prescriptions: Prescription[],
) {
  const base  = window.location.origin;
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const lignes = prescriptions.map((p, i) => {
    const details = [
      p.dose && p.unite ? `${p.dose} ${p.unite}` : null,
      p.frequence,
      p.voieAdministration,
    ].filter(Boolean).join(' — ');
    const duree = p.dateDebut || p.dateFin
      ? `Du ${p.dateDebut ? new Date(p.dateDebut).toLocaleDateString('fr-FR') : '—'} au ${p.dateFin ? new Date(p.dateFin).toLocaleDateString('fr-FR') : '—'}`
      : '';
    return `
      <div class="med-block">
        <div class="med-num">${i + 1}.</div>
        <div class="med-content">
          <div class="med-name">
            ${p.nomMedicamentDci}
            ${p.nomCommercial ? `<span style="font-weight:400;font-size:13px;color:#555;">(${p.nomCommercial})</span>` : ''}
          </div>
          ${details ? `<div class="med-detail">${details}</div>` : ''}
          ${duree   ? `<div class="med-detail">${duree}</div>` : ''}
          ${p.observations ? `<div class="med-obs">${p.observations}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Ordonnance — ${patient.prenom} ${patient.nom}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #111; padding: 28px 36px; font-size: 13px; max-width: 210mm; margin: 0 auto; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      @page { size: A4 portrait; margin: 12mm 15mm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
    .btn-print { display: block; margin-bottom: 20px; padding: 9px 20px; background: #1e3a5f; color: #fff; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .header-grid { display: grid; grid-template-columns: 1fr 1.8fr 1fr; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid #1e3a5f; margin-bottom: 14px; }
    .header-center { text-align: center; font-size: 10px; font-weight: 800; color: #1e3a5f; text-transform: uppercase; line-height: 1.7; }
    .header-img { display: flex; justify-content: center; }
    .title { text-align: center; font-size: 13px; font-weight: 800; color: #1e3a5f; text-decoration: underline; text-transform: uppercase; letter-spacing: 0.06em; margin: 10px 0 14px; }
    .doctor-row { font-size: 13px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: baseline; }
    .patient-block { border: 1px solid #1e3a5f; border-radius: 3px; margin-bottom: 18px; overflow: hidden; }
    .patient-header { background: #1e3a5f; padding: 5px 12px; color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .patient-body { padding: 8px 12px; }
    .patient-name { font-size: 15px; font-weight: 700; }
    .med-block { display: flex; gap: 10px; margin-bottom: 12px; padding: 10px 14px; border-left: 3px solid #1e3a5f; background: #f8faff; }
    .med-num { font-size: 14px; font-weight: 700; color: #1e3a5f; min-width: 20px; }
    .med-content { flex: 1; }
    .med-name { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
    .med-detail { font-size: 12px; color: #444; margin-top: 3px; }
    .med-obs { font-size: 12px; color: #666; font-style: italic; margin-top: 4px; }
    .signature-wrap { margin-top: 48px; display: flex; justify-content: flex-end; }
    .signature-box { min-width: 220px; text-align: center; }
    .signature-line { border-top: 1px solid #333; padding-top: 8px; font-size: 12px; color: #555; margin-top: 40px; }
  </style>
</head>
<body>
  <button class="btn-print no-print" onclick="window.print()">Imprimer</button>

  <div class="header-grid">
    <div class="header-img">
      <img src="${base}/benin_embleme.png" alt="Armoiries du Bénin" style="height:90px;object-fit:contain;" />
    </div>
    <div class="header-center">
      CENTRE HOSPITALIER UNIVERSITAIRE<br />
      DE LA MÈRE ET DE L'ENFANT-LAGUNE<br />
      (CHU-MEL)<br />
      *****
    </div>
    <div class="header-img">
      <img src="${base}/chuMel-logo.png" alt="CHU-MEL" style="height:64px;object-fit:contain;" />
    </div>
  </div>

  <div class="title">Ordonnance Médicale</div>

  <div class="doctor-row">
    <strong>${medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Médecin non renseigné'}</strong>
    <span style="font-size:12px;color:#555;">${today}</span>
  </div>

  <div class="patient-block">
    <div class="patient-header">Patient</div>
    <div class="patient-body">
      <div class="patient-name">${patient.prenom} ${patient.nom}</div>
    </div>
  </div>

  ${lignes}

  <div class="signature-wrap">
    <div class="signature-box">
      <div style="font-size:11px;color:#555;text-align:left;">Signature et cachet du médecin</div>
      <div class="signature-line">
        ${medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=820,height=960');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

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
  const { user } = useAuth();
  const [dossier,        setDossier]        = useState<Patient | null>(null);
  const [sejourActif,    setSejourActif]    = useState<Sejour | null>(null);
  const [historique,     setHistorique]     = useState<Sejour[]>([]);
  const [autresSymptomes, setAutresSymptomes] = useState('');
  const [showOrdonnance, setShowOrdonnance] = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [priseEnCharge,  setPriseEnCharge]  = useState(false);
  const [feedback,       setFeedback]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function reloadSejourActif() {
    try {
      const res = await getSejourActif(patient.id);
      setSejourActif(res.data);
    } catch { /* silent */ }
  }

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

  async function handlePrendreEnCharge() {
    if (!sejourActif || !user) return;
    if (!window.confirm(`Prendre en charge ${pt.prenom} ${pt.nom} ? Vous deviendrez le médecin responsable de ce séjour.`)) return;
    setPriseEnCharge(true);
    try {
      const res = await prendreEnCharge(sejourActif.id, user.id);
      setSejourActif(res.data);
      setFeedback({ type: 'success', msg: `Vous êtes maintenant le médecin responsable de ${pt.prenom} ${pt.nom}.` });
    } catch {
      setFeedback({ type: 'error', msg: 'Impossible de prendre en charge ce patient. Veuillez réessayer.' });
    } finally {
      setPriseEnCharge(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  }

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
  const isResponsibleDoctor = !!user && !!sejourActif?.medecinResponsable?.user && sejourActif.medecinResponsable.user.id === user.id;
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
                      <div className="med-row-sub">Type : {d.type} · Statut : {d.statut}{d.createdAt && ` · ${formatDate(d.createdAt)}`}{d.saisiParNom && ` · Saisi par ${d.saisiParNom}`}</div>
                    </div>
                    <span className={`med-badge ${d.valide ? 'med-badge-green' : 'med-badge-yellow'}`}>
                      {d.valide ? 'Validé' : 'En attente'}
                    </span>
                  </div>
                ))}
          </div>
        </>
      )}

      {/* Prescriptions du séjour — groupées par médecin */}
      {sejourActif && (sejourActif.prescriptions ?? []).length > 0 && (() => {
        // Grouper par prescripteur (id ou 'inconnu')
        const groups: { key: string; medecin: { id: string; user: { prenom: string; nom: string } } | null; items: typeof sejourActif.prescriptions }[] = [];
        const seen: Record<string, number> = {};
        for (const p of sejourActif.prescriptions ?? []) {
          const k = p.medecinPrescripteur?.id ?? 'inconnu';
          if (seen[k] === undefined) {
            seen[k] = groups.length;
            groups.push({ key: k, medecin: p.medecinPrescripteur ?? null, items: [] });
          }
          groups[seen[k]].items!.push(p);
        }
        return (
          <>
            <div className="med-section-title">Prescriptions — séjour en cours</div>
            {groups.map(g => (
              <div key={g.key} className="med-card" style={{ marginBottom: 14 }}>
                {/* En-tête du groupe */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--med-border)', background: 'var(--med-gray-50)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--med-tx)' }}>
                    {g.medecin
                      ? `Dr. ${g.medecin.user.prenom} ${g.medecin.user.nom}`
                      : 'Médecin non renseigné'}
                  </span>
                  <button
                    className="med-btn"
                    style={{ fontSize: 11, padding: '4px 12px' }}
                    onClick={() => printGroupePrescriptions(pt, g.medecin?.user ?? null, g.items ?? [])}
                  >
                    Imprimer l'ordonnance
                  </button>
                </div>
                {/* Médicaments du groupe */}
                {(g.items ?? []).map((p, i) => (
                  <div key={p.id} className="med-row" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--med-blue)', minWidth: 20 }}>{i + 1}.</span>
                    <div style={{ flex: 1 }}>
                      <div className="med-row-name">
                        {p.nomMedicamentDci}
                        {p.nomCommercial && <span style={{ fontSize: 11, color: 'var(--med-tx2)', marginLeft: 6 }}>({p.nomCommercial})</span>}
                      </div>
                      <div className="med-row-sub">
                        {[p.dose && p.unite ? `${p.dose} ${p.unite}` : null, p.frequence, p.voieAdministration].filter(Boolean).join(' · ')}
                        {p.observations && <> · {p.observations}</>}
                      </div>
                    </div>
                    <span className={`med-badge ${p.statut === 'Active' ? 'med-badge-green' : p.statut === 'Suspendue' ? 'med-badge-yellow' : 'med-badge-gray'}`}>
                      {p.statut}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </>
        );
      })()}

      {/* Historique séjours */}
      {historique.length > 0 && (
        <>
          <div className="med-section-title">Historique des séjours</div>
          <div className="med-card" style={{ marginBottom: 16 }}>
            {historique.map((s) => (
              <div key={s.id} className="med-row" style={{ cursor: 'default' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="med-row-name">{s.motifHospitalisation}</span>
                    {s.typeSejour && (
                      <span className={`med-badge ${s.typeSejour === 'Hospitalisation' ? 'med-badge-blue' : s.typeSejour === 'Consultation' ? 'med-badge-green' : 'med-badge-red'}`} style={{ fontSize: 10 }}>
                        {s.typeSejour}
                      </span>
                    )}
                  </div>
                  <div className="med-row-sub">{formatDate(s.dateAdmission)} → {formatDate(s.dateSortie)} · {s.numeroSejour}</div>
                </div>
                <span className="med-badge med-badge-gray">Terminé</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {sejourActif && isResponsibleDoctor && (
          <button className="med-btn med-btn-primary" onClick={() => setShowOrdonnance(true)}>
            Saisir une ordonnance
          </button>
        )}
        {sejourActif && !isResponsibleDoctor && (
          <div style={{ fontSize: 12, color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '6px 12px' }}>
            ⚠ Prescription réservée au médecin responsable — cliquez sur <strong>"Prendre en charge"</strong> d'abord
          </div>
        )}
        <button
          className="med-btn med-btn-green"
          onClick={handleMettreAJour}
          disabled={saving || !autresSymptomes.trim()}
        >
          {saving ? 'Enregistrement...' : 'Mettre à jour le dossier'}
        </button>
        {sejourActif && (
          <button
            className="med-btn"
            style={{ borderColor: '#0891b2', color: '#0891b2' }}
            onClick={handlePrendreEnCharge}
            disabled={priseEnCharge}
            title="Vous devenez le médecin responsable de ce séjour"
          >
            {priseEnCharge ? 'Traitement...' : 'Prendre en charge'}
          </button>
        )}
        {sejourActif?.medecinResponsable && (
          <span style={{ fontSize: 12, color: 'var(--med-tx2)' }}>
            Responsable actuel : <strong>
              Dr. {sejourActif.medecinResponsable.user?.prenom} {sejourActif.medecinResponsable.user?.nom}
            </strong>
          </span>
        )}
      </div>

      {/* Modal ordonnance */}
      {showOrdonnance && sejourActif && (
        <OrdonnanceModal
          patient={pt}
          sejour={sejourActif}
          onClose={() => setShowOrdonnance(false)}
          onSuccess={() => {
            setFeedback({ type: 'success', msg: 'Ordonnance enregistrée avec succès.' });
            reloadSejourActif();
          }}
        />
      )}
    </div>
  );
}