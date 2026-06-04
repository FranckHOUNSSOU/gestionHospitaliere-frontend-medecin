import { useEffect, useState } from 'react';
import type { Diagnostic, SoinInfirmier } from '../../types/auth.types';
import { getMesHospitalisations, getSejourDetail } from '../../services/medecinService';
import DiagnosticCard from './DiagnosticCard';
import SoinCard from './SoinCard';

export default function ValiderDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [soins,       setSoins]       = useState<SoinInfirmier[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const hospiRes = await getMesHospitalisations('actif');
        const sejours  = hospiRes.data;

        const details = await Promise.allSettled(
          sejours.map((s) => getSejourDetail(s.id)),
        );

        const allDiags: Diagnostic[]     = [];
        const allSoins: SoinInfirmier[]  = [];

        details.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            const sejour = r.value.data;
            const hospi  = sejours[i];

            (sejour.diagnostics ?? [])
              .filter((d) => !d.valide)
              .forEach((d) =>
                allDiags.push({
                  ...d,
                  sejour:  { id: sejour.id, numeroSejour: sejour.numeroSejour },
                  patient: hospi.patient,
                }),
              );

            (sejour.soinsInfirmiers ?? [])
              .filter((s) => !s.valide)
              .forEach((s) =>
                allSoins.push({
                  ...s,
                  sejour:  { id: sejour.id, numeroSejour: sejour.numeroSejour },
                  patient: hospi.patient,
                }),
              );
          }
        });

        setDiagnostics(allDiags);
        setSoins(allSoins);
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

  function handleSoinValidated(id: string) {
    setSoins((prev) => prev.filter((s) => s.id !== id));
  }

  const totalEnAttente = diagnostics.length + soins.length;

  return (
    <div>
      <div className="med-page-header">
        <h1>Valider les diagnostics et soins</h1>
        <p>Éléments en attente de validation médicale — séjours actifs</p>
      </div>

      {loading ? (
        <div className="med-spinner-wrap"><div className="med-spinner" /></div>
      ) : totalEnAttente === 0 ? (
        <div className="med-empty">
          <div className="med-empty-icon">✓</div>
          <div className="med-empty-title">Aucun élément en attente</div>
          <div className="med-empty-sub">Tous les diagnostics et soins ont été validés</div>
        </div>
      ) : (
        <>
          {/* Section diagnostics */}
          {diagnostics.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className="med-section-title" style={{ margin: 0 }}>
                  Diagnostics en attente
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
            </div>
          )}

          {/* Section soins infirmiers */}
          {soins.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className="med-section-title" style={{ margin: 0 }}>
                  Soins infirmiers en attente
                </div>
                <span className="med-badge med-badge-yellow">{soins.length}</span>
              </div>
              {soins.map((s) => (
                <SoinCard
                  key={s.id}
                  soin={s}
                  onValidated={handleSoinValidated}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
