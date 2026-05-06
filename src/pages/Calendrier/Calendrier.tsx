import { useEffect, useState } from 'react';
import type { RendezVous } from '../../types/auth.types';
import { getMesRendezVous } from '../../services/medecinService';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const STATUT_BADGE: Record<string, string> = {
  Programme: 'med-badge-blue',
  Confirme:  'med-badge-green',
  Annule:    'med-badge-red',
  Effectue:  'med-badge-gray',
};
const STATUT_LABELS: Record<string, string> = {
  Programme: 'Programmé',
  Confirme:  'Confirmé',
  Annule:    'Annulé',
  Effectue:  'Effectué',
};

function firstDayOfMonth(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7; // lundi=0
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function sameDay(iso: string, y: number, m: number, d: number) {
  const dt = new Date(iso);
  return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
}

function fmtHour(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function Calendrier() {
  const today  = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selDay, setSelDay] = useState(today.getDate());
  const [rdvs,  setRdvs]  = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const debut = new Date(year, month, 1).toISOString();
        const fin   = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
        const res   = await getMesRendezVous(debut, fin);
        setRdvs(res.data);
      } catch {
        setRdvs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [year, month]);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const firstDay  = firstDayOfMonth(year, month);
  const totalDays = daysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const rdvsSelected  = rdvs.filter((r) => sameDay(r.dateHeure, year, month, selDay));
  const rdvsAujourdHui = rdvs.filter((r) => sameDay(r.dateHeure, today.getFullYear(), today.getMonth(), today.getDate()));
  const rdvsAVenir     = rdvs.filter((r) => new Date(r.dateHeure) > today).sort((a, b) => +new Date(a.dateHeure) - +new Date(b.dateHeure));

  return (
    <div>
      <div className="med-page-header">
        <h1>Mes rendez-vous</h1>
        <p>Calendrier des consultations et rendez-vous programmés</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* ── Calendrier mensuel ── */}
        <div>
          <div className="med-card">
            <div className="med-card-head">
              <button className="med-btn med-btn-sm" onClick={prevMonth}>←</button>
              <span className="med-card-title" style={{ fontSize: 15 }}>
                {MOIS[month]} {year}
              </span>
              <button className="med-btn med-btn-sm" onClick={nextMonth}>→</button>
            </div>

            <div style={{ padding: '12px 16px' }}>
              {/* Jours semaine */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {JOURS.map((j) => (
                  <div key={j} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--med-tx2)', padding: '4px 0' }}>
                    {j}
                  </div>
                ))}
              </div>

              {/* Cases */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={`e${i}`} />;
                  const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  const isSelected = day === selDay;
                  const rdvsDay    = rdvs.filter((r) => sameDay(r.dateHeure, year, month, day));

                  return (
                    <div
                      key={day}
                      onClick={() => setSelDay(day)}
                      style={{
                        textAlign: 'center', padding: '7px 4px', borderRadius: 6, cursor: 'pointer',
                        background: isSelected ? 'var(--med-blue)' : isToday ? 'var(--med-blue-light)' : 'transparent',
                        border: isToday && !isSelected ? '1px solid var(--med-blue-mid)' : '1px solid transparent',
                        transition: 'background 0.12s',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: isToday || isSelected ? 600 : 400, color: isSelected ? '#fff' : 'var(--med-tx)' }}>
                        {day}
                      </div>
                      {rdvsDay.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                          {rdvsDay.slice(0, 3).map((_, k) => (
                            <div key={k} style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--med-blue)' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RDV du jour sélectionné */}
          <div className="med-section-title">
            RDV du {selDay} {MOIS[month]} {year}
          </div>
          <div className="med-card">
            {loading ? (
              <div className="med-spinner-wrap"><div className="med-spinner" /></div>
            ) : rdvsSelected.length === 0 ? (
              <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--med-tx2)' }}>
                Aucun rendez-vous ce jour
              </div>
            ) : (
              rdvsSelected
                .sort((a, b) => +new Date(a.dateHeure) - +new Date(b.dateHeure))
                .map((rdv) => (
                  <div key={rdv.id} className="med-row" style={{ cursor: 'default' }}>
                    <div style={{ width: 42, fontSize: 12, fontWeight: 600, color: 'var(--med-blue)', flexShrink: 0, textAlign: 'center' }}>
                      {fmtHour(rdv.dateHeure)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="med-row-name">{rdv.patient.prenom} {rdv.patient.nom}</div>
                      <div className="med-row-sub">IPP-{rdv.patient.numeroIpp} · {rdv.motif}</div>
                    </div>
                    <span className={`med-badge ${STATUT_BADGE[rdv.statut] ?? 'med-badge-gray'}`}>
                      {STATUT_LABELS[rdv.statut] ?? rdv.statut}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* ── Colonne droite ── */}
        <div>
          <div className="med-section-title">Aujourd'hui</div>
          <div className="med-card" style={{ marginBottom: 16 }}>
            {rdvsAujourdHui.length === 0 ? (
              <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--med-tx2)' }}>
                Aucun rendez-vous aujourd'hui
              </div>
            ) : (
              rdvsAujourdHui
                .sort((a, b) => +new Date(a.dateHeure) - +new Date(b.dateHeure))
                .map((rdv) => (
                  <div key={rdv.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--med-border)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                      <div style={{ width: 3, flexShrink: 0, background: rdv.statut === 'Confirme' ? 'var(--med-green)' : 'var(--med-blue)', borderRadius: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--med-blue)' }}>
                          {fmtHour(rdv.dateHeure)}{rdv.dureeMinutes ? ` · ${rdv.dureeMinutes} min` : ''}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--med-tx)' }}>
                          {rdv.patient.prenom} {rdv.patient.nom}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--med-tx2)' }}>{rdv.motif}</div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="med-section-title">À venir — {MOIS[month]}</div>
          <div className="med-card">
            {loading ? (
              <div className="med-spinner-wrap"><div className="med-spinner" /></div>
            ) : rdvsAVenir.length === 0 ? (
              <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--med-tx2)' }}>
                Aucun rendez-vous à venir ce mois
              </div>
            ) : (
              rdvsAVenir.slice(0, 8).map((rdv) => {
                const d = new Date(rdv.dateHeure);
                return (
                  <div key={rdv.id} className="med-row" style={{ cursor: 'default' }}>
                    <div style={{ textAlign: 'center', minWidth: 34 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--med-tx)', lineHeight: 1 }}>{d.getDate()}</div>
                      <div style={{ fontSize: 9, color: 'var(--med-tx2)', textTransform: 'uppercase' }}>{MOIS[d.getMonth()].slice(0, 3)}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="med-row-name">{rdv.patient.prenom} {rdv.patient.nom}</div>
                      <div className="med-row-sub">{fmtHour(rdv.dateHeure)} · {rdv.motif}</div>
                    </div>
                    <span className={`med-badge ${STATUT_BADGE[rdv.statut] ?? 'med-badge-gray'}`}>
                      {STATUT_LABELS[rdv.statut] ?? rdv.statut}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}