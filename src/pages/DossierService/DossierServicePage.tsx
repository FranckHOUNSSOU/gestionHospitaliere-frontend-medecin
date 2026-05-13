import { useState, useEffect, useRef } from 'react';
import {
  Search, ArrowLeft, User, AlertTriangle, Pill, Phone, Building2,
  Stethoscope, FileText, Activity, ClipboardList, Calendar,
  ChevronRight, X, Filter,
} from 'lucide-react';
import {
  getPatientsMonService, getSejoursPatient, getSejourDetail,
} from '../../services/medecinService';
import type { Patient, Sejour, Allergie, TraitementARisque } from '../../types/auth.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function age(ddn?: string | null) {
  if (!ddn) return '—';
  return `${Math.floor((Date.now() - new Date(ddn).getTime()) / (365.25 * 24 * 3600 * 1000))} ans`;
}
function initiales(prenom: string, nom: string) {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}
function fd(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR');
}
function fdt(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

const AVATAR_COLORS = ['#0ea5e9', '#059669', '#7c3aed', '#d97706', '#dc2626'];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function medecinNom(sejour: Sejour) {
  const u = sejour.medecinResponsable?.user;
  return u ? `Dr. ${u.prenom} ${u.nom}` : '—';
}

// ── Composants UI locaux ──────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--med-tx2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: 'var(--med-tx)', wordBreak: 'break-word' }}>
        {value || '—'}
      </span>
    </div>
  );
}

function SectionTitle({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '16px 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--med-tx2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {icon}{text}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`med-badge ${active ? 'med-badge-green' : 'med-badge-gray'}`}>
      {active ? 'En cours' : 'Terminé'}
    </span>
  );
}

function Spinner() {
  return (
    <div className="med-spinner-wrap">
      <div className="med-spinner" />
    </div>
  );
}

// ── Vue Recherche ─────────────────────────────────────────────────────────────

function SearchView({ onSelect }: { onSelect: (p: Patient) => void }) {
  const [searchType, setSearchType] = useState('nom');
  const [query,    setQuery]    = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPatients = async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPatientsMonService(q);
      setPatients(res.data);
    } catch {
      setError('Impossible de charger les patients du service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounce.current) clearTimeout(debounce.current);
    const q = searchType === 'ipp' ? val.trim().replace(/^ipp-?/i, '') : val;
    debounce.current = setTimeout(() => fetchPatients(q || undefined), 350);
  };

  const reset = () => {
    setQuery('');
    if (debounce.current) clearTimeout(debounce.current);
    fetchPatients();
  };

  const placeholder = searchType === 'ipp' ? 'Ex: IPP-20210 ou 20210' : 'Ex: HOUNSOU ou Franck';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* En-tête */}
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>
          Dossiers Service
        </p>
        <p style={{ fontSize: 13, color: 'var(--c-t2)', margin: '4px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
          Patients pris en charge par les médecins de votre service
        </p>
      </div>

      {/* Formulaire de recherche */}
      <div className="med-card" style={{ overflow: 'hidden', marginBottom: 0 }}>
        <div className="med-card-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--c-amber-bg)', color: 'var(--c-amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Search size={16} />
            </div>
            <div>
              <p className="med-card-title">Dossiers du service</p>
              <p className="med-card-sub">
                {loading ? 'Chargement…' : `${patients.length} patient(s) dans votre service`}
              </p>
            </div>
          </div>
        </div>

        <div className="med-card-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="med-input"
            style={{ width: 'auto', minWidth: 190, flexShrink: 0 }}
            value={searchType}
            onChange={(e) => { setSearchType(e.target.value); reset(); }}
          >
            <option value="nom">Par Nom / Prénom</option>
            <option value="ipp">Par IPP</option>
          </select>

          <div className="med-search" style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span className="med-search-icon"><Search size={13} /></span>
            <input
              className="med-search-input"
              placeholder={placeholder}
              value={query}
              onChange={e => handleChange(e.target.value)}
            />
            {query && (
              <button
                onClick={reset}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--c-t3)', display: 'flex', alignItems: 'center', padding: 2,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            className="med-btn med-btn-primary"
            onClick={() => {
              const q = searchType === 'ipp' ? query.trim().replace(/^ipp-?/i, '') : query;
              fetchPatients(q || undefined);
            }}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Search size={13} /> {loading ? 'Chargement…' : 'Rechercher'}
          </button>
        </div>
      </div>

      {/* Alerte erreur */}
      {error && (
        <div className="med-alert med-alert-danger">
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Chargement initial */}
      {loading && (
        <div className="med-card" style={{ marginBottom: 0 }}>
          <div className="med-card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', margin: '0 auto 14px',
              border: '3px solid var(--c-bdr)', borderTopColor: 'var(--c-accent)',
              animation: 'med-spin 0.7s linear infinite',
            }} />
            <p style={{ fontSize: 13, color: 'var(--c-t2)' }}>Chargement des dossiers…</p>
          </div>
        </div>
      )}

      {/* Résultats */}
      {!loading && (
        <>
          {query && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--c-t2)', fontWeight: 600 }}>
                {patients.length > 0
                  ? `${patients.length} résultat(s) pour « ${query} »`
                  : `Aucun résultat pour « ${query} »`}
              </span>
              <button className="med-btn" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={11} /> Réinitialiser
              </button>
            </div>
          )}

          <div className="med-card" style={{ overflow: 'hidden', marginBottom: 0 }}>
            {patients.length === 0 ? (
              <div className="med-card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12, background: 'var(--c-surf2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                }}>
                  <User size={26} color="var(--c-t3)" />
                </div>
                <p style={{ fontWeight: 700, color: 'var(--c-t0)', marginBottom: 4 }}>
                  {query ? 'Aucun patient trouvé' : 'Aucun patient dans votre service'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--c-t2)' }}>
                  {query
                    ? "Vérifiez l'orthographe ou essayez un autre critère"
                    : 'Les patients admis par les médecins de votre service apparaîtront ici'}
                </p>
              </div>
            ) : (
              patients.map((p, i) => {
                const allergiesSev = p.allergies?.filter(a => a.severite === 'Sévère' || a.severite === 'Mortelle') ?? [];
                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderBottom: '1px solid var(--c-bdr)',
                      cursor: 'pointer', transition: 'background .1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-surf2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => onSelect(p)}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 9, flexShrink: 0,
                      background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff',
                    }}>
                      {initiales(p.prenom, p.nom)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--c-t0)', marginBottom: 4 }}>
                        {p.nom}, {p.prenom}
                      </p>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11, color: 'var(--c-t3)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={10} />{p.sexe === 'F' ? 'Féminin' : 'Masculin'}
                        </span>
                        {p.dateNaissance && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={10} />{age(p.dateNaissance)}
                          </span>
                        )}
                        {p.telephone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={10} />{p.telephone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {allergiesSev.length > 0 && (
                        <span className="med-tag med-t-red" style={{ fontSize: 10 }}>⚠ Allergie sévère</span>
                      )}
                      <span className="med-tag med-t-blue" style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
                        IPP-{p.numeroIpp}
                      </span>
                      <ChevronRight size={15} color="var(--c-t3)" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Vue Dossier Patient ───────────────────────────────────────────────────────

type DossierTab = 'identite' | 'medical' | 'contacts' | 'sejours';

function DossierView({
  patient,
  onBack,
  onSejourClick,
}: {
  patient: Patient;
  onBack: () => void;
  onSejourClick: (id: string) => void;
}) {
  const [tab,     setTab]     = useState<DossierTab>('identite');
  const [sejours, setSejours] = useState<Sejour[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab !== 'sejours') return;
    setLoading(true);
    getSejoursPatient(patient.id)
      .then(r => setSejours(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, patient.id]);

  const allergiesSev = patient.allergies?.filter(a => a.severite === 'Sévère' || a.severite === 'Mortelle') ?? [];
  const TABS: { id: DossierTab; label: string; icon: React.ReactNode }[] = [
    { id: 'identite', label: 'Identité',  icon: <User size={13} /> },
    { id: 'medical',  label: 'Médical',   icon: <Stethoscope size={13} /> },
    { id: 'contacts', label: 'Contacts',  icon: <Phone size={13} /> },
    { id: 'sejours',  label: 'Séjours',   icon: <Calendar size={13} /> },
  ];

  return (
    <div>
      {/* Retour */}
      <button className="med-btn" style={{ marginBottom: 16 }} onClick={onBack}>
        <ArrowLeft size={14} style={{ marginRight: 4 }} /> Retour à la liste
      </button>

      {/* En-tête patient */}
      <div className="med-card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div className="med-avatar" style={{ width: 52, height: 52, borderRadius: 12, fontSize: 17, flexShrink: 0, background: avatarColor(patient.id) }}>
          {initiales(patient.prenom, patient.nom)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--med-tx)' }}>
            {patient.prenom} {patient.nom}
          </div>
          <div style={{ fontSize: 12, color: 'var(--med-tx2)', marginTop: 2 }}>
            IPP-{patient.numeroIpp} · {age(patient.dateNaissance)} · {patient.sexe === 'F' ? 'Féminin' : 'Masculin'}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {allergiesSev.map(a => (
              <span key={a.id} className="med-badge med-badge-red">⚠ Allergie : {a.allergene}</span>
            ))}
            {patient.statutProfil === 'Incomplet' && (
              <span className="med-badge med-badge-yellow">Profil incomplet</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--med-gray-200)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? 'var(--med-blue)' : 'var(--med-tx2)',
              borderBottom: tab === t.id ? '2px solid var(--med-blue)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Onglet Identité */}
      {tab === 'identite' && (
        <div className="med-card" style={{ padding: 16 }}>
          <SectionTitle icon={<User size={13} />} text="Informations personnelles" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 20px' }}>
            <InfoRow label="Nom"             value={patient.nom} />
            <InfoRow label="Prénom"          value={patient.prenom} />
            <InfoRow label="Sexe"            value={patient.sexe === 'F' ? 'Féminin' : patient.sexe === 'M' ? 'Masculin' : 'Autre'} />
            <InfoRow label="Date de naissance" value={fd(patient.dateNaissance)} />
            <InfoRow label="Âge"             value={age(patient.dateNaissance)} />
            <InfoRow label="N° IPP"          value={`IPP-${patient.numeroIpp}`} />
            <InfoRow label="Téléphone"       value={patient.telephone} />
            <InfoRow label="Adresse"         value={patient.adresse} />
            <InfoRow label="Statut profil"   value={patient.statutProfil} />
          </div>
        </div>
      )}

      {/* Onglet Médical */}
      {tab === 'medical' && (
        <div>
          <div className="med-card" style={{ padding: 16, marginBottom: 12 }}>
            <SectionTitle icon={<AlertTriangle size={13} />} text="Données critiques" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="med-info-block critical">
                <div className="med-ib-label">Groupe sanguin</div>
                <div className="med-ib-val" style={{ color: 'var(--med-red)' }}>
                  {patient.groupeSanguinAbo ?? '—'}{patient.groupeSanguinRhesus ? ` Rh ${patient.groupeSanguinRhesus}` : ''}
                </div>
                <div className="med-ib-sub">⚠ Vérifier avant transfusion</div>
              </div>
              <div className="med-info-block critical">
                <div className="med-ib-label">Statut réanimatoire</div>
                <div className="med-ib-val">{patient.statutReanimatoire ?? 'Non renseigné'}</div>
                <div className="med-ib-sub">Directive anticipée</div>
              </div>
            </div>
          </div>

          <div className="med-card" style={{ padding: 16, marginBottom: 12 }}>
            <SectionTitle icon={<AlertTriangle size={13} />} text={`Allergies (${patient.allergies?.length ?? 0})`} />
            {!patient.allergies?.length
              ? <p style={{ fontSize: 13, color: 'var(--med-tx2)', margin: 0 }}>Aucune allergie enregistrée.</p>
              : patient.allergies.map(a => (
                <div key={a.id} className="med-row" style={{ cursor: 'default' }}>
                  <span className={`med-badge ${a.severite === 'Sévère' || a.severite === 'Mortelle' ? 'med-badge-red' : a.severite === 'Modérée' ? 'med-badge-yellow' : 'med-badge-gray'}`}>
                    {a.severite ?? '—'}
                  </span>
                  <div>
                    <div className="med-row-name">{a.allergene}</div>
                    {a.typeReaction && <div className="med-row-sub">Réaction : {a.typeReaction}</div>}
                  </div>
                </div>
              ))}
          </div>

          <div className="med-card" style={{ padding: 16 }}>
            <SectionTitle icon={<Pill size={13} />} text={`Traitements à risque (${patient.traitementsARisque?.length ?? 0})`} />
            {!patient.traitementsARisque?.length
              ? <p style={{ fontSize: 13, color: 'var(--med-tx2)', margin: 0 }}>Aucun traitement à risque.</p>
              : patient.traitementsARisque.map((t: TraitementARisque) => (
                <div key={t.id} className="med-row" style={{ cursor: 'default' }}>
                  <span className="med-badge med-badge-yellow">⚠</span>
                  <div>
                    <div className="med-row-name">{t.nomMedicament}</div>
                    {(t.posologieEnCours || t.classe) && (
                      <div className="med-row-sub">{[t.classe, t.posologieEnCours].filter(Boolean).join(' · ')}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Onglet Contacts */}
      {tab === 'contacts' && (
        <div>
          <div className="med-card" style={{ padding: 16, marginBottom: 12 }}>
            <SectionTitle icon={<Phone size={13} />} text="Contacts d'urgence" />
            {!patient.contactsUrgence?.length
              ? <p style={{ fontSize: 13, color: 'var(--med-tx2)', margin: 0 }}>Aucun contact enregistré.</p>
              : patient.contactsUrgence.map((c: any) => (
                <div key={c.id} className="med-row" style={{ cursor: 'default' }}>
                  {c.estPersonneConfiance && <span className="med-badge med-badge-blue">Confiance</span>}
                  <div>
                    <div className="med-row-name">{c.prenom} {c.nom}</div>
                    <div className="med-row-sub">{c.lienParente} · {c.telephone}</div>
                  </div>
                </div>
              ))}
          </div>

          <div className="med-card" style={{ padding: 16 }}>
            <SectionTitle icon={<Building2 size={13} />} text="Couvertures sociales" />
            {!patient.couverturesSociales?.length
              ? <p style={{ fontSize: 13, color: 'var(--med-tx2)', margin: 0 }}>Aucune couverture enregistrée.</p>
              : patient.couverturesSociales.map((c: any) => (
                <div key={c.id} className="med-row" style={{ cursor: 'default' }}>
                  <span className={`med-badge ${c.estActive ? 'med-badge-green' : 'med-badge-gray'}`}>
                    {c.estActive ? 'Active' : 'Expirée'}
                  </span>
                  <div>
                    <div className="med-row-name">{c.nomOrganisme}</div>
                    <div className="med-row-sub">{c.typeCouverture} · N° {c.numeroAssure}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Onglet Séjours */}
      {tab === 'sejours' && (
        <div className="med-card" style={{ padding: loading ? 24 : 0 }}>
          {loading
            ? <Spinner />
            : sejours.length === 0
              ? <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--med-tx2)', fontSize: 13 }}>Aucun séjour enregistré.</div>
              : sejours.map(s => {
                  const actif = !s.dateSortie;
                  return (
                    <button
                      key={s.id}
                      onClick={() => onSejourClick(s.id)}
                      style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}
                    >
                      <div
                        className="med-row"
                        style={{ padding: '14px 16px', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--med-gray-50)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        <StatusBadge active={actif} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="med-row-name">{s.numeroSejour}</span>
                            {s.diagnostics && s.diagnostics.length > 0 && (
                              <span className="med-badge med-badge-blue" style={{ fontSize: 10 }}>
                                {s.diagnostics.length} diag.
                              </span>
                            )}
                          </div>
                          <div className="med-row-sub">
                            {fd(s.dateAdmission)} → {s.dateSortie ? fd(s.dateSortie) : 'En cours'}
                            {' · '}{medecinNom(s)}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--med-tx2)', marginTop: 2 }}>
                            {s.motifHospitalisation}
                          </div>
                        </div>
                        <ArrowLeft size={14} style={{ color: 'var(--med-tx2)', transform: 'rotate(180deg)', flexShrink: 0 }} />
                      </div>
                    </button>
                  );
                })}
        </div>
      )}
    </div>
  );
}

// ── Vue Séjour Complet ────────────────────────────────────────────────────────

function SejourView({
  sejourId,
  onBack,
}: {
  sejourId: string;
  onBack: () => void;
}) {
  const [sejour,  setSejour]  = useState<Sejour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getSejourDetail(sejourId)
      .then(r => setSejour(r.data))
      .catch(() => setError('Impossible de charger le séjour.'))
      .finally(() => setLoading(false));
  }, [sejourId]);

  if (loading) return <Spinner />;
  if (error || !sejour) return (
    <div>
      <button className="med-btn" onClick={onBack} style={{ marginBottom: 16 }}>
        <ArrowLeft size={14} style={{ marginRight: 4 }} /> Retour
      </button>
      <div className="med-alert med-alert-warning">{error ?? 'Séjour introuvable.'}</div>
    </div>
  );

  const actif = !sejour.dateSortie;

  return (
    <div>
      {/* Retour */}
      <button className="med-btn" style={{ marginBottom: 16 }} onClick={onBack}>
        <ArrowLeft size={14} style={{ marginRight: 4 }} /> Retour au dossier
      </button>

      {/* En-tête séjour */}
      <div className="med-card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--med-tx)' }}>
                Séjour {sejour.numeroSejour}
              </span>
              <StatusBadge active={actif} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--med-tx2)' }}>
              Admission : {fd(sejour.dateAdmission)} · Sortie : {sejour.dateSortie ? fd(sejour.dateSortie) : 'En cours'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--med-tx2)', marginTop: 2 }}>
              {medecinNom(sejour)} · Mode d'entrée : {sejour.modeEntree}
            </div>
            <div style={{ fontSize: 13, color: 'var(--med-tx)', marginTop: 6, fontStyle: 'italic' }}>
              « {sejour.motifHospitalisation} »
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics */}
      <div className="med-card" style={{ marginBottom: 12 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--med-gray-200)' }}>
          <SectionTitle icon={<Stethoscope size={13} />} text={`Diagnostics (${sejour.diagnostics?.length ?? 0})`} />
        </div>
        {!sejour.diagnostics?.length
          ? <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--med-tx2)' }}>Aucun diagnostic enregistré.</div>
          : sejour.diagnostics.map(d => (
            <div key={d.id} className="med-row" style={{ padding: '10px 16px', cursor: 'default' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 56 }}>
                <span style={{ fontSize: 10, fontFamily: 'monospace', background: 'var(--med-gray-100)', padding: '2px 6px', borderRadius: 4, color: 'var(--med-tx2)' }}>
                  {d.codeCim10}
                </span>
                <span className={`med-badge ${d.valide ? 'med-badge-green' : 'med-badge-yellow'}`} style={{ fontSize: 10 }}>
                  {d.valide ? 'Validé' : 'En attente'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="med-row-name">{d.libelle}</div>
                <div className="med-row-sub">
                  Type : {d.type} · Statut : {d.statut}
                  {d.dateCreation && ` · ${fd(d.dateCreation)}`}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Ordonnances / Prescriptions */}
      <div className="med-card" style={{ marginBottom: 12 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--med-gray-200)' }}>
          <SectionTitle icon={<ClipboardList size={13} />} text={`Ordonnances (${sejour.prescriptions?.length ?? 0})`} />
        </div>
        {!sejour.prescriptions?.length
          ? <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--med-tx2)' }}>Aucune ordonnance.</div>
          : sejour.prescriptions.map(p => (
            <div key={p.id} className="med-row" style={{ padding: '10px 16px', cursor: 'default', flexWrap: 'wrap', gap: '6px 12px' }}>
              <span className={`med-badge ${p.statut === 'Active' ? 'med-badge-green' : p.statut === 'Suspendue' ? 'med-badge-yellow' : 'med-badge-gray'}`}>
                {p.statut}
              </span>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div className="med-row-name">{p.nomMedicamentDci}</div>
                <div className="med-row-sub">
                  {p.dose} {p.unite} · {p.frequence} · {p.voieAdministration}
                  {p.dateDebut && ` · du ${fd(p.dateDebut)}`}
                  {p.dateFin   && ` au ${fd(p.dateFin)}`}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Examens */}
      {(sejour.examens?.length ?? 0) > 0 && (
        <div className="med-card" style={{ marginBottom: 12 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--med-gray-200)' }}>
            <SectionTitle icon={<FileText size={13} />} text={`Examens (${sejour.examens!.length})`} />
          </div>
          {sejour.examens!.map(e => (
            <div key={e.id} className="med-row" style={{ padding: '10px 16px', cursor: 'default' }}>
              <span className={`med-badge ${e.statut === 'ResultatDisponible' ? 'med-badge-green' : e.statut === 'EnCours' ? 'med-badge-yellow' : 'med-badge-gray'}`}>
                {e.statut === 'ResultatDisponible' ? 'Résultat' : e.statut === 'EnCours' ? 'En cours' : 'Prescrit'}
              </span>
              <div>
                <div className="med-row-name">{e.typeExamen}{e.sousType ? ` · ${e.sousType}` : ''}</div>
                <div className="med-row-sub">{fd(e.dateCreation)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constantes */}
      {(sejour.constantes?.length ?? 0) > 0 && (
        <div className="med-card" style={{ marginBottom: 12 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--med-gray-200)' }}>
            <SectionTitle icon={<Activity size={13} />} text={`Constantes vitales (${sejour.constantes!.length})`} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--med-gray-50)' }}>
                  {['Date', 'TA', 'FC', 'Temp.', 'SpO2', 'Poids', 'Glasgow', 'EVA'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--med-tx2)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--med-gray-200)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sejour.constantes!.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < sejour.constantes!.length - 1 ? '1px solid var(--med-gray-200)' : 'none' }}>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', color: 'var(--med-tx2)' }}>{fdt(c.dateCreation)}</td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{c.tensionSystolique && c.tensionDiastolique ? `${c.tensionSystolique}/${c.tensionDiastolique}` : '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{c.frequenceCardiaque ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{c.temperature != null ? `${c.temperature}°C` : '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{c.spo2 != null ? `${c.spo2}%` : '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{c.poids != null ? `${c.poids} kg` : '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{c.glasgow ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>{c.douleurEva ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function DossierServicePage() {
  const [view,      setView]      = useState<'search' | 'dossier' | 'sejour'>('search');
  const [patient,   setPatient]   = useState<Patient | null>(null);
  const [sejourId,  setSejourId]  = useState<string | null>(null);

  const goToDossier = (p: Patient) => {
    setPatient(p);
    setView('dossier');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToSejour = (sid: string) => {
    setSejourId(sid);
    setView('sejour');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (view === 'sejour') {
      setSejourId(null);
      setView('dossier');
    } else {
      setPatient(null);
      setView('search');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {view === 'search' && <SearchView onSelect={goToDossier} />}
      {view === 'dossier' && patient && (
        <DossierView patient={patient} onBack={goBack} onSejourClick={goToSejour} />
      )}
      {view === 'sejour' && sejourId && (
        <SejourView sejourId={sejourId} onBack={goBack} />
      )}
    </>
  );
}
