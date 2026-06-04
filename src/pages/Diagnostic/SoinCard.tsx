import { useState } from 'react';
import type { SoinInfirmier } from '../../types/auth.types';
import { updateSoin } from '../../services/medecinService';

interface Props {
  soin: SoinInfirmier;
  onValidated: (id: string) => void;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function SoinCard({ soin, onValidated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleValider() {
    setLoading(true); setError('');
    try {
      await updateSoin(soin.sejour!.id, soin.id, { valide: true });
      onValidated(soin.id);
    } catch {
      setError('Erreur lors de la validation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="med-card" style={{ marginBottom: 14 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--med-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--med-tx)', flex: 1 }}>
          {soin.cible}
        </span>
        <span className="med-badge med-badge-yellow">En attente</span>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <div className="med-grid-2" style={{ gap: 8, marginBottom: 10 }}>
          <div>
            <div className="med-form-label" style={{ marginBottom: 2 }}>Patient</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--med-tx)' }}>
              {soin.patient ? `${soin.patient.prenom} ${soin.patient.nom}` : '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--med-tx2)' }}>
              IPP-{soin.patient?.numeroIpp} · {soin.sejour?.numeroSejour}
            </div>
          </div>
          <div>
            <div className="med-form-label" style={{ marginBottom: 2 }}>Saisi le</div>
            <div style={{ fontSize: 13, color: 'var(--med-tx)' }}>{formatDate(soin.dateHeure)}</div>
            {soin.saisiParNom && (
              <div style={{ fontSize: 11, color: 'var(--med-tx2)' }}>par {soin.saisiParNom}</div>
            )}
          </div>
        </div>

        {soin.donneesObservees && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--med-tx2)', fontWeight: 600 }}>Données observées : </span>
            <span style={{ fontSize: 12, color: 'var(--med-tx)' }}>{soin.donneesObservees}</span>
          </div>
        )}
        {soin.actionsRealisees && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--med-tx2)', fontWeight: 600 }}>Actions réalisées : </span>
            <span style={{ fontSize: 12, color: 'var(--med-tx)' }}>{soin.actionsRealisees}</span>
          </div>
        )}
        {soin.resultatsObtenus && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--med-tx2)', fontWeight: 600 }}>Résultats obtenus : </span>
            <span style={{ fontSize: 12, color: 'var(--med-tx)' }}>{soin.resultatsObtenus}</span>
          </div>
        )}

        {error && <div className="med-alert med-alert-warning">{error}</div>}
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--med-border)', display: 'flex', gap: 10 }}>
        <button className="med-btn med-btn-green" onClick={handleValider} disabled={loading}>
          ✓ Valider le soin
        </button>
      </div>
    </div>
  );
}
