import { useState } from 'react';
import type { Diagnostic } from '../../types/auth.types';
import { updateDiagnostic } from '../../services/medecinService';

interface Props {
  diagnostic: Diagnostic;
  onValidated: (d: Diagnostic) => void;
  onEcarte: (id: string) => void;
}

const STATUTS: Diagnostic['statut'][] = ['Suspecte', 'Confirme', 'Ecarte'];
const STATUT_LABELS: Record<string, string> = {
  Suspecte: 'Suspecté',
  Confirme: 'Confirmé',
  Ecarte: 'Écarté',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DiagnosticCard({ diagnostic: diag, onValidated, onEcarte }: Props) {
  const [statut,  setStatut]  = useState<Diagnostic['statut']>(diag.statut);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleValider() {
    setLoading(true); setError('');
    try {
      const res = await updateDiagnostic(diag.sejour!.id, diag.id, { statut, valide: true });
      onValidated(res.data);
    } catch {
      setError('Erreur lors de la validation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEcarter() {
    setLoading(true); setError('');
    try {
      await updateDiagnostic(diag.sejour!.id, diag.id, { statut: 'Ecarte', valide: false });
      onEcarte(diag.id);
    } catch {
      setError("Erreur lors de l'opération. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="med-card" style={{ marginBottom: 14 }}>
      {/* En-tête */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--med-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--med-gray-100)', padding: '2px 7px', borderRadius: 4, color: 'var(--med-tx2)' }}>
          {diag.codeCim10}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--med-tx)', flex: 1 }}>
          {diag.libelle}
        </span>
        <span className="med-badge med-badge-yellow">En attente</span>
      </div>

      {/* Corps */}
      <div style={{ padding: '12px 16px' }}>
        <div className="med-grid-2" style={{ gap: 8, marginBottom: 12 }}>
          <div>
            <div className="med-form-label" style={{ marginBottom: 2 }}>Patient</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--med-tx)' }}>
              {diag.patient ? `${diag.patient.prenom} ${diag.patient.nom}` : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--med-tx2)' }}>
              IPP-{diag.patient?.numeroIpp} · {diag.sejour?.numeroSejour}
            </div>
          </div>
          <div>
            <div className="med-form-label" style={{ marginBottom: 2 }}>Saisi le</div>
            <div style={{ fontSize: 13, color: 'var(--med-tx)' }}>{formatDate(diag.dateCreation)}</div>
            {diag.saisiPar && <div style={{ fontSize: 11, color: 'var(--med-tx2)' }}>par {diag.saisiPar}</div>}
          </div>
          <div>
            <div className="med-form-label" style={{ marginBottom: 2 }}>Type</div>
            <div style={{ fontSize: 13, color: 'var(--med-tx)' }}>{diag.type}</div>
          </div>
          <div>
            <div className="med-form-label" style={{ marginBottom: 2 }}>Statut proposé</div>
            <div style={{ fontSize: 13, color: 'var(--med-tx)' }}>{STATUT_LABELS[diag.statut]}</div>
          </div>
        </div>

        {editing && (
          <div className="med-form-group" style={{ marginBottom: 10 }}>
            <label className="med-form-label">Modifier le statut</label>
            <select
              className="med-form-select"
              value={statut}
              onChange={(e) => setStatut(e.target.value as Diagnostic['statut'])}
              style={{ maxWidth: 200 }}
            >
              {STATUTS.map((s) => (
                <option key={s} value={s}>{STATUT_LABELS[s]}</option>
              ))}
            </select>
          </div>
        )}

        {error && <div className="med-alert med-alert-warning">{error}</div>}
      </div>

      {/* Actions */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--med-border)', display: 'flex', gap: 10 }}>
        <button className="med-btn med-btn-green" onClick={handleValider} disabled={loading}>
          ✓ Valider et envoyer au dossier
        </button>
        <button className="med-btn" onClick={() => setEditing((v) => !v)} disabled={loading}>
          {editing ? 'Masquer' : '✎ Modifier'}
        </button>
        <button className="med-btn med-btn-danger" onClick={handleEcarter} disabled={loading}>
          ✕ Écarter
        </button>
      </div>
    </div>
  );
}