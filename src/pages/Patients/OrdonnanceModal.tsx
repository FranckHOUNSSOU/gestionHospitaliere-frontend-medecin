import { useState } from 'react';
import type { LignePrescription, Patient, Sejour } from '../../types/auth.types';
import { createPrescription } from '../../services/medecinService';

interface Props {
  patient: Patient;
  sejour: Sejour;
  onClose: () => void;
  onSuccess?: () => void;
}

const UNITES = ['mg', 'ml', 'µg', 'UI', 'g'];
const VOIES  = ['Orale', 'Intraveineuse (IV)', 'Intramusculaire (IM)', 'Sous-cutanée (SC)', 'Rectale', 'Inhalée', 'Topique'];

function newLigne(): LignePrescription {
  return {
    _key: Math.random().toString(36).slice(2),
    nomMedicamentDci: '',
    dose: 0,
    unite: 'mg',
    frequence: '',
    voieAdministration: 'Orale',
    dateDebut: '',
    dateFin: '',
  };
}

export default function OrdonnanceModal({ patient, sejour, onClose, onSuccess }: Props) {
  const [lignes,  setLignes]  = useState<LignePrescription[]>([newLigne()]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const allergiesSeveres = patient.allergies?.filter((a) => a.gravite === 'Severe') ?? [];

  function update(key: string, field: keyof LignePrescription, value: string | number) {
    setLignes((prev) => prev.map((l) => (l._key === key ? { ...l, [field]: value } : l)));
  }

  function remove(key: string) {
    setLignes((prev) => prev.filter((l) => l._key !== key));
  }

  async function handleSubmit() {
    const invalides = lignes.filter((l) => !l.nomMedicamentDci.trim() || !l.dose || !l.frequence.trim());
    if (invalides.length > 0) {
      setError('Veuillez compléter tous les champs obligatoires (médicament, dose, fréquence).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await Promise.all(
        lignes.map(({ _key, ...dto }) => createPrescription(sejour.id, dto)),
      );
      onSuccess?.();
      onClose();
    } catch {
      setError("Erreur lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="med-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="med-modal">
        <div className="med-modal-head">
          <div className="med-modal-title">
            📋 Saisir une ordonnance — {patient.prenom} {patient.nom}
          </div>
          <button className="med-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="med-modal-body">
          {/* Récap patient + alertes */}
          <div style={{ padding: '8px 12px', background: 'var(--med-gray-50)', borderRadius: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--med-tx2)' }}>
              IPP-{patient.numeroIpp} · {patient.sexe === 'F' ? 'Féminin' : 'Masculin'}
            </span>
            {allergiesSeveres.map((a) => (
              <div key={a.id} style={{ marginTop: 4 }}>
                <span className="med-badge med-badge-red">⚠ Allergie sévère : {a.substance}</span>
              </div>
            ))}
          </div>

          {error && <div className="med-alert med-alert-warning" style={{ marginBottom: 14 }}>⚠ {error}</div>}

          {/* Lignes de prescription */}
          {lignes.map((ligne, idx) => (
            <div
              key={ligne._key}
              style={{ background: 'var(--med-gray-50)', borderRadius: 6, padding: '12px 14px', marginBottom: 10 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--med-blue)' }}>
                  Médicament {idx + 1}
                </span>
                {lignes.length > 1 && (
                  <button className="med-btn med-btn-sm med-btn-danger" onClick={() => remove(ligne._key)}>
                    Supprimer
                  </button>
                )}
              </div>

              <div className="med-form-group" style={{ marginBottom: 8 }}>
                <label className="med-form-label">Médicament (DCI) *</label>
                <input
                  className="med-form-input"
                  placeholder="ex: Amoxicilline"
                  value={ligne.nomMedicamentDci}
                  onChange={(e) => update(ligne._key, 'nomMedicamentDci', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div className="med-form-group">
                  <label className="med-form-label">Dose *</label>
                  <input
                    className="med-form-input" type="number" min={0} placeholder="500"
                    value={ligne.dose || ''}
                    onChange={(e) => update(ligne._key, 'dose', Number(e.target.value))}
                  />
                </div>
                <div className="med-form-group">
                  <label className="med-form-label">Unité</label>
                  <select className="med-form-select" value={ligne.unite}
                    onChange={(e) => update(ligne._key, 'unite', e.target.value)}>
                    {UNITES.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="med-form-group">
                  <label className="med-form-label">Fréquence *</label>
                  <input className="med-form-input" placeholder="3x/jour"
                    value={ligne.frequence}
                    onChange={(e) => update(ligne._key, 'frequence', e.target.value)}
                  />
                </div>
                <div className="med-form-group">
                  <label className="med-form-label">Voie</label>
                  <select className="med-form-select" value={ligne.voieAdministration}
                    onChange={(e) => update(ligne._key, 'voieAdministration', e.target.value)}>
                    {VOIES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div className="med-form-group">
                  <label className="med-form-label">Date de début</label>
                  <input className="med-form-input" type="date"
                    value={ligne.dateDebut ?? ''}
                    onChange={(e) => update(ligne._key, 'dateDebut', e.target.value)}
                  />
                </div>
                <div className="med-form-group">
                  <label className="med-form-label">Date de fin</label>
                  <input className="med-form-input" type="date"
                    value={ligne.dateFin ?? ''}
                    onChange={(e) => update(ligne._key, 'dateFin', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button className="med-btn" onClick={() => setLignes((p) => [...p, newLigne()])}>
            + Ajouter un médicament
          </button>
        </div>

        <div className="med-modal-foot">
          <button className="med-btn" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="med-btn med-btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enregistrement...' : "Enregistrer l'ordonnance"}
          </button>
        </div>
      </div>
    </div>
  );
}