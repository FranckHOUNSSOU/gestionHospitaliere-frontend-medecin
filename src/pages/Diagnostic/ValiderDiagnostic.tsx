import { useEffect, useState } from 'react';
import type { Diagnostic } from '../../types/auth.types';
import { getMesHospitalisations, getSejourDetail } from '../../services/medecinService';
import DiagnosticCard from './DiagnosticCard';

export default function ValiderDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const hospiRes = await getMesHospitalisations('actif');
        const sejours  = hospiRes.data;

        const details = await Promise.allSettled(
          sejours.map((s) => getSejourDetail(s.id)),
        );

        const all: Diagnostic[] = [];
        details.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            const sejour = r.value.data;
            const hospi  = sejours[i];
            (sejour.diagnostics ?? [])
              .filter((d) => !d.valide)
              .forEach((d) =>
                all.push({
                  ...d,
                  sejour:  { id: sejour.id, numeroSejour: sejour.numeroSejour },
                  patient: hospi.patient,
                }),
              );
          }
        });

        setDiagnostics(all);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleValidated(updated: Diagnostic) {
    setDiagnostics((prev) => prev.filter((d) => d.id !== updated.id));
  }

  function handleEcarte(id: string) {
    setDiagnostics((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div>
      <div className="med-page-header">
        <h1>Valider les diagnostics</h1>
        <p>Diagnostics en attente de validation médicale — séjours actifs</p>
      </div>

      {loading ? (
        <div className="med-spinner-wrap"><div className="med-spinner" /></div>
      ) : diagnostics.length === 0 ? (
        <div className="med-empty">
          <div className="med-empty-icon">✓</div>
          <div className="med-empty-title">Aucun diagnostic en attente</div>
          <div className="med-empty-sub">Tous les diagnostics ont été validés ou écartés</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="med-section-title" style={{ margin: 0 }}>
              {diagnostics.length} diagnostic{diagnostics.length > 1 ? 's' : ''} en attente
            </div>
            <span className="med-badge med-badge-yellow">{diagnostics.length}</span>
          </div>

          {diagnostics.map((d) => (
            <DiagnosticCard
              key={d.id}
              diagnostic={d}
              onValidated={handleValidated}
              onEcarte={handleEcarte}
            />
          ))}
        </>
      )}
    </div>
  );
}