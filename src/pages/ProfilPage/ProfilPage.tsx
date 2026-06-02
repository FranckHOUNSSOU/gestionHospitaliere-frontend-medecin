import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  User, Calendar, Phone, Globe, Award, BookOpen, ShieldCheck,
  Stethoscope, Briefcase, CheckCircle, AlertTriangle, X,
  Plus, Trash2, ChevronRight, Clock,
} from 'lucide-react';
import {
  getMonProfilMedecin,
  updateMonProfilMedecin,
  addSpecialite,
  removeSpecialite,
  addDiplome,
  removeDiplome,
  addAccreditation,
  removeAccreditation,
} from '../../services/medecinService';
import type {
  MedecinProfil,
  StatutOrdre,
  SexeMedecin,
  TypeContrat,
  TypeDiplome,
  CreateSpecialiteDto,
  CreateDiplomeDto,
  CreateAccreditationDto,
  UpdateMedecinDto,
} from '../../types/auth.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateInput(v?: string | null) {
  if (!v) return '';
  return v.substring(0, 10);
}

function formatDate(v?: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function calcCompletion(p: MedecinProfil): number {
  const checks = [
    !!p.dateNaissance,
    !!p.sexe,
    !!p.nationalite,
    !!p.telephoneUrgence,
    !!p.photoUrl,
    !!p.dateInscriptionOrdre,
    !!p.typeContrat,
    !!p.datePriseDeFonction,
    p.specialites.length > 0,
    p.diplomes.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUTS_ORDRE: { value: StatutOrdre; label: string }[] = [
  { value: 'INSCRIT',  label: 'Inscrit'  },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'RADIE',    label: 'Radié'    },
];

const TYPES_CONTRAT: { value: TypeContrat; label: string }[] = [
  { value: 'TITULAIRE',    label: 'Titulaire'    },
  { value: 'CONTRACTUEL',  label: 'Contractuel'  },
  { value: 'VACATAIRE',    label: 'Vacataire'    },
  { value: 'LIBERAL',      label: 'Libéral'      },
  { value: 'INTERNE',      label: 'Interne'      },
  { value: 'RESIDENT',     label: 'Résident'     },
];

const TYPES_DIPLOME: { value: TypeDiplome; label: string }[] = [
  { value: 'DOCTORAT', label: 'Doctorat en médecine'              },
  { value: 'DES',      label: 'DES – Diplôme d'études spécialisées' },
  { value: 'DESC',     label: 'DESC – Diplôme complémentaire'     },
  { value: 'DU',       label: 'DU – Diplôme universitaire'        },
  { value: 'DIU',      label: 'DIU – Diplôme inter-universitaire' },
  { value: 'MASTER',   label: 'Master'                            },
  { value: 'AUTRE',    label: 'Autre'                             },
];

// ── Toast ─────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';
interface Toast { type: ToastType; msg: string }

// ── Modal : Diplôme ───────────────────────────────────────────────────────────

interface DiplomeModalProps {
  medecinId: string;
  onClose: () => void;
  onSaved: () => void;
}

function DiplomeModal({ medecinId, onClose, onSaved }: DiplomeModalProps) {
  const [form, setForm] = useState<CreateDiplomeDto>({ intitule: '', type: 'DOCTORAT' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSave() {
    if (!form.intitule.trim()) { setErr('Le titre du diplôme est obligatoire.'); return; }
    setSaving(true); setErr('');
    try {
      await addDiplome(medecinId, form);
      onSaved(); onClose();
    } catch { setErr("Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  }

  return (
    <div className="med-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="med-modal" style={{ maxWidth: '36rem' }}>
        <div className="med-modal-head">
          <span className="med-modal-title">Ajouter un diplôme</span>
          <button className="med-modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="med-modal-body">
          {err && <div className="med-alert med-alert-danger" style={{ marginBottom: 12 }}><AlertTriangle size={14} />{err}</div>}
          <div className="med-form-grid med-form-grid-2" style={{ rowGap: 12 }}>
            <div className="med-form-field" style={{ gridColumn: 'span 2' }}>
              <label className="med-label">Intitulé du diplôme *</label>
              <input className="med-input" placeholder="ex : Doctorat en médecine générale"
                value={form.intitule} onChange={e => setForm(p => ({ ...p, intitule: e.target.value }))} />
            </div>
            <div className="med-form-field">
              <label className="med-label">Type</label>
              <select className="med-input" value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as TypeDiplome }))}>
                {TYPES_DIPLOME.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="med-form-field">
              <label className="med-label">Date d'obtention</label>
              <input className="med-input" type="date" value={form.dateObtention ?? ''}
                onChange={e => setForm(p => ({ ...p, dateObtention: e.target.value || undefined }))} />
            </div>
            <div className="med-form-field">
              <label className="med-label">Établissement</label>
              <input className="med-input" placeholder="ex : Université d'Abomey-Calavi"
                value={form.etablissement ?? ''}
                onChange={e => setForm(p => ({ ...p, etablissement: e.target.value || undefined }))} />
            </div>
            <div className="med-form-field">
              <label className="med-label">Pays</label>
              <input className="med-input" placeholder="ex : Bénin"
                value={form.pays ?? ''}
                onChange={e => setForm(p => ({ ...p, pays: e.target.value || undefined }))} />
            </div>
            <div className="med-form-field" style={{ gridColumn: 'span 2' }}>
              <label className="med-label">URL du document (optionnel)</label>
              <input className="med-input" placeholder="https://…"
                value={form.documentUrl ?? ''}
                onChange={e => setForm(p => ({ ...p, documentUrl: e.target.value || undefined }))} />
            </div>
          </div>
        </div>
        <div className="med-modal-foot">
          <button className="med-btn" onClick={onClose} disabled={saving}>Annuler</button>
          <button className="med-btn med-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Ajouter le diplôme'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal : Accréditation ─────────────────────────────────────────────────────

interface AccreditationModalProps {
  medecinId: string;
  onClose: () => void;
  onSaved: () => void;
}

function AccreditationModal({ medecinId, onClose, onSaved }: AccreditationModalProps) {
  const [form, setForm] = useState<CreateAccreditationDto>({ intitule: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSave() {
    if (!form.intitule.trim()) { setErr("L'intitulé est obligatoire."); return; }
    setSaving(true); setErr('');
    try {
      await addAccreditation(medecinId, form);
      onSaved(); onClose();
    } catch { setErr("Erreur lors de l'enregistrement."); }
    finally { setSaving(false); }
  }

  return (
    <div className="med-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="med-modal" style={{ maxWidth: '36rem' }}>
        <div className="med-modal-head">
          <span className="med-modal-title">Ajouter une accréditation</span>
          <button className="med-modal-close" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="med-modal-body">
          {err && <div className="med-alert med-alert-danger" style={{ marginBottom: 12 }}><AlertTriangle size={14} />{err}</div>}
          <div className="med-form-grid med-form-grid-2" style={{ rowGap: 12 }}>
            <div className="med-form-field" style={{ gridColumn: 'span 2' }}>
              <label className="med-label">Intitulé de la certification *</label>
              <input className="med-input" placeholder="ex : Accréditation en chirurgie cardiaque"
                value={form.intitule} onChange={e => setForm(p => ({ ...p, intitule: e.target.value }))} />
            </div>
            <div className="med-form-field" style={{ gridColumn: 'span 2' }}>
              <label className="med-label">Organisme certificateur</label>
              <input className="med-input" placeholder="ex : Ordre National des Médecins"
                value={form.organismeCertificateur ?? ''}
                onChange={e => setForm(p => ({ ...p, organismeCertificateur: e.target.value || undefined }))} />
            </div>
            <div className="med-form-field">
              <label className="med-label">Date d'obtention</label>
              <input className="med-input" type="date" value={form.dateObtention ?? ''}
                onChange={e => setForm(p => ({ ...p, dateObtention: e.target.value || undefined }))} />
            </div>
            <div className="med-form-field">
              <label className="med-label">Date d'expiration</label>
              <input className="med-input" type="date" value={form.dateExpiration ?? ''}
                onChange={e => setForm(p => ({ ...p, dateExpiration: e.target.value || undefined }))} />
            </div>
            <div className="med-form-field" style={{ gridColumn: 'span 2' }}>
              <label className="med-label">URL du document (optionnel)</label>
              <input className="med-input" placeholder="https://…"
                value={form.documentUrl ?? ''}
                onChange={e => setForm(p => ({ ...p, documentUrl: e.target.value || undefined }))} />
            </div>
          </div>
        </div>
        <div className="med-modal-foot">
          <button className="med-btn" onClick={onClose} disabled={saving}>Annuler</button>
          <button className="med-btn med-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : "Ajouter l'accréditation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProfilPage ────────────────────────────────────────────────────────────────

type Tab = 'identite' | 'professionnel' | 'specialites' | 'diplomes' | 'accreditations';

export default function ProfilPage() {
  const [profil,  setProfil]  = useState<MedecinProfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [tab, setTab] = useState<Tab>('identite');
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [showDiplomeModal,       setShowDiplomeModal]       = useState(false);
  const [showAccreditationModal, setShowAccreditationModal] = useState(false);

  // Inline add-specialite form
  const [showAddSpec, setShowAddSpec] = useState(false);
  const [specForm, setSpecForm]       = useState<CreateSpecialiteDto>({ specialite: '', estPrincipale: false });
  const [specSaving, setSpecSaving]   = useState(false);

  // Section saving flags
  const [savingIdentite, setSavingIdentite]           = useState(false);
  const [savingProfessionnel, setSavingProfessionnel] = useState(false);

  // Form state — Identité
  const [fIdent, setFIdent] = useState({
    dateNaissance: '', sexe: '' as SexeMedecin | '',
    nationalite: '', telephoneUrgence: '', photoUrl: '',
  });

  // Form state — Professionnel
  const [fPro, setFPro] = useState({
    statutOrdre: 'INSCRIT' as StatutOrdre,
    dateInscriptionOrdre: '', typeContrat: '' as TypeContrat | '',
    datePriseDeFonction: '', dateFinContrat: '',
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────

  async function fetchProfil() {
    setLoading(true); setFetchErr('');
    try {
      const { data } = await getMonProfilMedecin();
      setProfil(data);
      setFIdent({
        dateNaissance:    toDateInput(data.dateNaissance),
        sexe:             data.sexe ?? '',
        nationalite:      data.nationalite ?? '',
        telephoneUrgence: data.telephoneUrgence ?? '',
        photoUrl:         data.photoUrl ?? '',
      });
      setFPro({
        statutOrdre:          data.statutOrdre,
        dateInscriptionOrdre: toDateInput(data.dateInscriptionOrdre),
        typeContrat:          data.typeContrat ?? '',
        datePriseDeFonction:  toDateInput(data.datePriseDeFonction),
        dateFinContrat:       toDateInput(data.dateFinContrat),
      });
    } catch (e: any) {
      const status = e?.response?.status;
      setFetchErr(status === 404
        ? 'Aucun profil médecin trouvé. Contactez un administrateur.'
        : 'Impossible de charger votre profil. Veuillez réessayer.');
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchProfil(); }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────

  function showToast(type: ToastType, msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, msg });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // ── Sauvegardes ───────────────────────────────────────────────────────────

  async function saveIdentite() {
    if (!profil) return;
    setSavingIdentite(true);
    try {
      const dto: UpdateMedecinDto = {
        ...(fIdent.dateNaissance && { dateNaissance: fIdent.dateNaissance }),
        ...(fIdent.sexe          && { sexe: fIdent.sexe as SexeMedecin }),
        ...(fIdent.nationalite   && { nationalite: fIdent.nationalite }),
        ...(fIdent.telephoneUrgence && { telephoneUrgence: fIdent.telephoneUrgence }),
        ...(fIdent.photoUrl      && { photoUrl: fIdent.photoUrl }),
      };
      await updateMonProfilMedecin(profil.id, dto);
      await fetchProfil();
      showToast('success', 'Informations personnelles sauvegardées.');
    } catch { showToast('error', 'Erreur lors de la sauvegarde.'); }
    finally { setSavingIdentite(false); }
  }

  async function saveProfessionnel() {
    if (!profil) return;
    setSavingProfessionnel(true);
    try {
      const dto: UpdateMedecinDto = {
        statutOrdre: fPro.statutOrdre,
        ...(fPro.dateInscriptionOrdre && { dateInscriptionOrdre: fPro.dateInscriptionOrdre }),
        ...(fPro.typeContrat          && { typeContrat: fPro.typeContrat as TypeContrat }),
        ...(fPro.datePriseDeFonction  && { datePriseDeFonction: fPro.datePriseDeFonction }),
        ...(fPro.dateFinContrat       && { dateFinContrat: fPro.dateFinContrat }),
      };
      await updateMonProfilMedecin(profil.id, dto);
      await fetchProfil();
      showToast('success', 'Informations professionnelles sauvegardées.');
    } catch { showToast('error', 'Erreur lors de la sauvegarde.'); }
    finally { setSavingProfessionnel(false); }
  }

  // ── Spécialités ───────────────────────────────────────────────────────────

  async function handleAddSpec() {
    if (!profil || !specForm.specialite.trim()) return;
    setSpecSaving(true);
    try {
      await addSpecialite(profil.id, specForm);
      await fetchProfil();
      setShowAddSpec(false);
      setSpecForm({ specialite: '', estPrincipale: false });
      showToast('success', 'Spécialité ajoutée.');
    } catch { showToast('error', "Erreur lors de l'ajout de la spécialité."); }
    finally { setSpecSaving(false); }
  }

  async function handleRemoveSpec(sid: string) {
    if (!profil) return;
    try {
      await removeSpecialite(profil.id, sid);
      await fetchProfil();
      showToast('success', 'Spécialité supprimée.');
    } catch { showToast('error', 'Erreur lors de la suppression.'); }
  }

  async function handleRemoveDiplome(did: string) {
    if (!profil) return;
    try {
      await removeDiplome(profil.id, did);
      await fetchProfil();
      showToast('success', 'Diplôme supprimé.');
    } catch { showToast('error', 'Erreur lors de la suppression.'); }
  }

  async function handleRemoveAccreditation(aid: string) {
    if (!profil) return;
    try {
      await removeAccreditation(profil.id, aid);
      await fetchProfil();
      showToast('success', 'Accréditation supprimée.');
    } catch { showToast('error', 'Erreur lors de la suppression.'); }
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  function statutBadge(s: StatutOrdre) {
    const map = {
      INSCRIT:  { cls: 'med-badge med-badge-green', label: 'Inscrit' },
      SUSPENDU: { cls: 'med-badge med-badge-yellow', label: 'Suspendu' },
      RADIE:    { cls: 'med-badge med-badge-red', label: 'Radié' },
    };
    return <span className={map[s].cls}>{map[s].label}</span>;
  }

  function completionColor(pct: number) {
    if (pct >= 70) return 'var(--c-green)';
    if (pct >= 40) return 'var(--c-amber)';
    return 'var(--c-red)';
  }

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <div className="med-page-h">
          <h1 className="med-page-title">Mon profil</h1>
          <p className="med-page-sub">Chargement en cours…</p>
        </div>
        <div className="med-spinner-wrap"><div className="med-spinner" /></div>
      </div>
    );
  }

  if (fetchErr || !profil) {
    return (
      <div>
        <div className="med-page-h">
          <h1 className="med-page-title">Mon profil</h1>
        </div>
        <div className="med-alert med-alert-warning">
          <AlertTriangle size={16} />
          {fetchErr || 'Profil introuvable.'}
        </div>
      </div>
    );
  }

  const pct       = calcCompletion(profil);
  const initiales = `${profil.user.nom[0] ?? ''}${profil.user.prenom[0] ?? ''}`.toUpperCase();
  const specialitePrincipale = profil.specialites.find(s => s.estPrincipale)?.specialite
    ?? profil.specialites[0]?.specialite ?? null;
  const affectationActive = profil.affectations.find(a => a.estActive);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            position: 'fixed', top: 72, right: 20, zIndex: 2000,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px', borderRadius: 10, minWidth: 260,
            boxShadow: '0 8px 32px rgba(0,0,0,.18)',
            background: toast.type === 'success' ? 'var(--c-green)' : 'var(--c-red)',
            color: '#fff', fontSize: '0.8125rem', fontWeight: 500,
            animation: 'fadeIn .2s ease',
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="med-page-h">
        <h1 className="med-page-title">Mon profil</h1>
        <p className="med-page-sub">Complétez votre profil pour accéder à toutes les fonctionnalités</p>
      </div>

      {/* ── Hero card ── */}
      <div className="med-card" style={{ marginBottom: '1.25rem', overflow: 'visible' }}>
        <div className="med-card-body" style={{ padding: '1.5rem 1.375rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profil.photoUrl ? (
                <img
                  src={profil.photoUrl}
                  alt="Photo de profil"
                  style={{
                    width: 72, height: 72, borderRadius: '50%',
                    objectFit: 'cover', border: '3px solid var(--c-accent-bd)',
                  }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--c-accent) 0%, #0369a1 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700, color: '#fff',
                  border: '3px solid var(--c-accent-bd)', flexShrink: 0,
                }}>
                  {initiales}
                </div>
              )}
              {profil.estActif && (
                <span style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'var(--c-green)', border: '2px solid var(--c-surf)',
                }} title="Compte actif" />
              )}
            </div>

            {/* Identity */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--c-t0)' }}>
                  Dr. {profil.user.prenom} {profil.user.nom}
                </span>
                {statutBadge(profil.statutOrdre)}
              </div>
              {specialitePrincipale && (
                <div style={{ fontSize: '0.78125rem', color: 'var(--c-t2)', marginBottom: 6 }}>
                  <Stethoscope size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {specialitePrincipale}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {affectationActive && (
                  <span className="med-badge med-badge-blue">
                    {affectationActive.service.nom} · {affectationActive.roleDansService.replace(/_/g, ' ')}
                  </span>
                )}
                <span className="med-badge med-badge-gray">
                  N° ordre : {profil.numeroOrdre}
                </span>
              </div>
            </div>

            {/* Completion */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', width: 68, height: 68, margin: '0 auto 6px' }}>
                <svg width="68" height="68" viewBox="0 0 68 68">
                  <circle cx="34" cy="34" r="28" fill="none" stroke="var(--c-surf3)" strokeWidth="5" />
                  <circle
                    cx="34" cy="34" r="28" fill="none"
                    stroke={completionColor(pct)} strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                    transform="rotate(-90 34 34)"
                    style={{ transition: 'stroke-dashoffset .6s ease' }}
                  />
                  <text x="34" y="34" textAnchor="middle" dominantBaseline="central"
                    style={{ fill: 'var(--c-t0)', fontSize: 13, fontWeight: 700, fontFamily: 'Roboto,sans-serif' }}>
                    {pct}%
                  </text>
                </svg>
              </div>
              <div style={{ fontSize: '0.65625rem', color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Complété
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 8, marginTop: '1rem', borderTop: '1px solid var(--c-bdr)', paddingTop: '1rem',
          }}>
            {[
              { icon: <Stethoscope size={13} />, count: profil.specialites.length, label: 'Spécialité(s)', color: 'var(--c-accent)' },
              { icon: <BookOpen size={13} />,    count: profil.diplomes.length,    label: 'Diplôme(s)',    color: 'var(--c-green)' },
              { icon: <ShieldCheck size={13} />, count: profil.accreditations.length, label: 'Accréditation(s)', color: 'var(--c-amber)' },
              { icon: <Briefcase size={13} />,   count: profil.affectations.filter(a => a.estActive).length, label: 'Affectation(s)', color: 'var(--c-t3)' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8, background: 'var(--c-surf2)',
              }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-t0)', lineHeight: 1 }}>{s.count}</div>
                  <div style={{ fontSize: '0.65625rem', color: 'var(--c-t3)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="med-tabs" style={{ marginBottom: 0 }}>
        {([
          { id: 'identite',       icon: <User size={13} />,        label: 'Identité' },
          { id: 'professionnel',  icon: <Briefcase size={13} />,   label: 'Professionnel' },
          { id: 'specialites',    icon: <Stethoscope size={13} />, label: `Spécialités${profil.specialites.length ? ` (${profil.specialites.length})` : ''}` },
          { id: 'diplomes',       icon: <BookOpen size={13} />,    label: `Diplômes${profil.diplomes.length ? ` (${profil.diplomes.length})` : ''}` },
          { id: 'accreditations', icon: <ShieldCheck size={13} />, label: `Accréditations${profil.accreditations.length ? ` (${profil.accreditations.length})` : ''}` },
        ] as { id: Tab; icon: ReactNode; label: string }[]).map(t => (
          <button
            key={t.id}
            className={`med-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Identité ── */}
      {tab === 'identite' && (
        <div className="med-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <div className="med-card-head" style={{ background: 'var(--c-accent-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="med-form-section-icon med-fsi-blue"><User size={13} /></div>
              <div>
                <div className="med-card-title">Informations personnelles</div>
                <div className="med-card-sub">Données d'identité et de contact</div>
              </div>
            </div>
          </div>
          <div className="med-card-body">

            {/* Read-only fields */}
            <div style={{
              background: 'var(--c-surf2)', borderRadius: 8, padding: '10px 14px',
              marginBottom: 16, border: '1px solid var(--c-bdr)',
            }}>
              <div style={{ fontSize: '0.59375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--c-t3)', marginBottom: 10 }}>
                Informations du compte (lecture seule)
              </div>
              <div className="med-form-grid med-form-grid-2" style={{ rowGap: 10 }}>
                {[
                  { label: 'Nom',     value: profil.user.nom },
                  { label: 'Prénom',  value: profil.user.prenom },
                  { label: 'Email',   value: profil.user.email },
                  { label: 'Téléphone principal', value: profil.user.telephone ?? '—' },
                ].map(f => (
                  <div className="med-form-field" key={f.label}>
                    <label className="med-label">{f.label}</label>
                    <input className="med-input" value={f.value} readOnly />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.59375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--c-t3)', marginBottom: 10 }}>
              Informations complémentaires
            </div>

            <div className="med-form-grid med-form-grid-2" style={{ rowGap: 12 }}>
              <div className="med-form-field">
                <label className="med-label"><Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />Date de naissance</label>
                <input className="med-input" type="date" value={fIdent.dateNaissance}
                  onChange={e => setFIdent(p => ({ ...p, dateNaissance: e.target.value }))} />
              </div>
              <div className="med-form-field">
                <label className="med-label"><User size={10} style={{ display: 'inline', marginRight: 4 }} />Sexe</label>
                <select className="med-input" value={fIdent.sexe}
                  onChange={e => setFIdent(p => ({ ...p, sexe: e.target.value as SexeMedecin | '' }))}>
                  <option value="">— Sélectionner —</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div className="med-form-field">
                <label className="med-label"><Globe size={10} style={{ display: 'inline', marginRight: 4 }} />Nationalité</label>
                <input className="med-input" placeholder="ex : Béninoise"
                  value={fIdent.nationalite}
                  onChange={e => setFIdent(p => ({ ...p, nationalite: e.target.value }))} />
              </div>
              <div className="med-form-field">
                <label className="med-label"><Phone size={10} style={{ display: 'inline', marginRight: 4 }} />Téléphone d'urgence</label>
                <input className="med-input" type="tel" placeholder="+229 97 00 00 00"
                  value={fIdent.telephoneUrgence}
                  onChange={e => setFIdent(p => ({ ...p, telephoneUrgence: e.target.value }))} />
              </div>
              <div className="med-form-field" style={{ gridColumn: 'span 2' }}>
                <label className="med-label">URL de la photo de profil</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="med-input" placeholder="https://…"
                    value={fIdent.photoUrl}
                    onChange={e => setFIdent(p => ({ ...p, photoUrl: e.target.value }))} />
                  {fIdent.photoUrl && (
                    <img src={fIdent.photoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--c-bdr)', flexShrink: 0 }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="med-card-footer" style={{ justifyContent: 'flex-end' }}>
            <button
              className="med-btn med-btn-primary"
              onClick={saveIdentite}
              disabled={savingIdentite}
              style={{ minWidth: 180 }}
            >
              {savingIdentite ? 'Enregistrement…' : <><CheckCircle size={14} /> Enregistrer</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Professionnel ── */}
      {tab === 'professionnel' && (
        <div className="med-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <div className="med-card-head" style={{ background: 'var(--c-green-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="med-form-section-icon med-fsi-green"><Briefcase size={13} /></div>
              <div>
                <div className="med-card-title">Informations professionnelles</div>
                <div className="med-card-sub">Ordre, contrat et affectation</div>
              </div>
            </div>
          </div>
          <div className="med-card-body">

            {/* N° ordre read-only */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--c-surf2)', borderRadius: 8, padding: '10px 14px',
              marginBottom: 16, border: '1px solid var(--c-bdr)',
            }}>
              <Award size={16} style={{ color: 'var(--c-accent)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.65625rem', color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Numéro d'ordre professionnel</div>
                <div style={{ fontWeight: 700, color: 'var(--c-t0)', fontSize: '0.9375rem', fontFamily: "'JetBrains Mono', monospace" }}>
                  {profil.numeroOrdre}
                </div>
              </div>
              <span className="med-badge med-badge-gray" style={{ marginLeft: 'auto' }}>Lecture seule</span>
            </div>

            <div className="med-form-grid med-form-grid-2" style={{ rowGap: 12 }}>
              <div className="med-form-field">
                <label className="med-label"><Award size={10} style={{ display: 'inline', marginRight: 4 }} />Statut à l'ordre</label>
                <select className="med-input" value={fPro.statutOrdre}
                  onChange={e => setFPro(p => ({ ...p, statutOrdre: e.target.value as StatutOrdre }))}>
                  {STATUTS_ORDRE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="med-form-field">
                <label className="med-label"><Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />Date d'inscription à l'ordre</label>
                <input className="med-input" type="date" value={fPro.dateInscriptionOrdre}
                  onChange={e => setFPro(p => ({ ...p, dateInscriptionOrdre: e.target.value }))} />
              </div>
              <div className="med-form-field">
                <label className="med-label"><Briefcase size={10} style={{ display: 'inline', marginRight: 4 }} />Type de contrat</label>
                <select className="med-input" value={fPro.typeContrat}
                  onChange={e => setFPro(p => ({ ...p, typeContrat: e.target.value as TypeContrat | '' }))}>
                  <option value="">— Sélectionner —</option>
                  {TYPES_CONTRAT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="med-form-field">
                <label className="med-label"><Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />Date de prise de fonction</label>
                <input className="med-input" type="date" value={fPro.datePriseDeFonction}
                  onChange={e => setFPro(p => ({ ...p, datePriseDeFonction: e.target.value }))} />
              </div>
              <div className="med-form-field" style={{ gridColumn: 'span 2' }}>
                <label className="med-label"><Clock size={10} style={{ display: 'inline', marginRight: 4 }} />Date de fin de contrat (si applicable)</label>
                <input className="med-input" type="date" value={fPro.dateFinContrat}
                  onChange={e => setFPro(p => ({ ...p, dateFinContrat: e.target.value }))} />
              </div>
            </div>

            {/* Affectations actives (lecture seule) */}
            {profil.affectations.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: '0.59375rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--c-t3)', marginBottom: 8 }}>
                  Affectations (gérées par l'administration)
                </div>
                {profil.affectations.map(a => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 7, background: 'var(--c-surf2)',
                    border: '1px solid var(--c-bdr)', marginBottom: 6,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--c-t0)', fontSize: '0.8125rem' }}>{a.service.nom}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--c-t3)' }}>
                        {a.roleDansService.replace(/_/g, ' ')} · Depuis {formatDate(a.dateDebut)}
                        {a.dateFin ? ` → ${formatDate(a.dateFin)}` : ''}
                      </div>
                    </div>
                    <span className={a.estActive ? 'med-badge med-badge-green' : 'med-badge med-badge-gray'}>
                      {a.estActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="med-card-footer" style={{ justifyContent: 'flex-end' }}>
            <button
              className="med-btn med-btn-green"
              onClick={saveProfessionnel}
              disabled={savingProfessionnel}
              style={{ minWidth: 180 }}
            >
              {savingProfessionnel ? 'Enregistrement…' : <><CheckCircle size={14} /> Enregistrer</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Spécialités ── */}
      {tab === 'specialites' && (
        <div className="med-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <div className="med-card-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="med-form-section-icon med-fsi-blue"><Stethoscope size={13} /></div>
              <div>
                <div className="med-card-title">Mes spécialités</div>
                <div className="med-card-sub">{profil.specialites.length} spécialité(s) enregistrée(s)</div>
              </div>
            </div>
            <button className="med-btn med-btn-primary med-btn-sm"
              onClick={() => { setShowAddSpec(s => !s); }}>
              <Plus size={13} />{showAddSpec ? 'Annuler' : 'Ajouter'}
            </button>
          </div>

          {/* Inline add form */}
          {showAddSpec && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-bdr)', background: 'var(--c-accent-bg)' }}>
              <div className="med-form-grid" style={{ gridTemplateColumns: '1fr auto auto auto', gap: 10, alignItems: 'flex-end' }}>
                <div className="med-form-field">
                  <label className="med-label">Nom de la spécialité *</label>
                  <input className="med-input" placeholder="ex : Cardiologie"
                    value={specForm.specialite}
                    onChange={e => setSpecForm(p => ({ ...p, specialite: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddSpec()} />
                </div>
                <div className="med-form-field">
                  <label className="med-label">Date obtention</label>
                  <input className="med-input" type="date"
                    value={specForm.dateObtention ?? ''}
                    onChange={e => setSpecForm(p => ({ ...p, dateObtention: e.target.value || undefined }))} />
                </div>
                <div className="med-form-field" style={{ alignSelf: 'flex-end', paddingBottom: 2 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={!!specForm.estPrincipale}
                      onChange={e => setSpecForm(p => ({ ...p, estPrincipale: e.target.checked }))} />
                    <span className="med-label" style={{ margin: 0 }}>Principale</span>
                  </label>
                </div>
                <button className="med-btn med-btn-green" onClick={handleAddSpec} disabled={specSaving || !specForm.specialite.trim()}>
                  {specSaving ? '…' : <><Plus size={12} /> Ajouter</>}
                </button>
              </div>
            </div>
          )}

          <div className="med-card-body" style={{ padding: profil.specialites.length === 0 ? '2rem' : '0.5rem' }}>
            {profil.specialites.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--c-t3)' }}>
                <Stethoscope size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                <div style={{ fontWeight: 600, color: 'var(--c-t2)', marginBottom: 4 }}>Aucune spécialité</div>
                <div style={{ fontSize: '0.8125rem' }}>Ajoutez votre première spécialité médicale.</div>
              </div>
            ) : (
              profil.specialites.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
                  padding: '10px 14px', borderBottom: '1px solid var(--c-bdr)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: 'var(--c-accent-bg)', color: 'var(--c-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Stethoscope size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--c-t0)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {s.specialite}
                        {s.estPrincipale && <span className="med-badge med-badge-blue" style={{ fontSize: '0.59375rem' }}>Principale</span>}
                      </div>
                      {s.dateObtention && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--c-t3)' }}>
                          <Calendar size={10} style={{ display: 'inline', marginRight: 3 }} />
                          Depuis {formatDate(s.dateObtention)}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="med-btn med-btn-sm" onClick={() => handleRemoveSpec(s.id)}
                    style={{ color: 'var(--c-red)', borderColor: 'var(--c-red-bd)' }}
                    title="Supprimer">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Diplômes ── */}
      {tab === 'diplomes' && (
        <div className="med-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <div className="med-card-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="med-form-section-icon med-fsi-green"><BookOpen size={13} /></div>
              <div>
                <div className="med-card-title">Mes diplômes</div>
                <div className="med-card-sub">{profil.diplomes.length} diplôme(s) enregistré(s)</div>
              </div>
            </div>
            <button className="med-btn med-btn-primary med-btn-sm" onClick={() => setShowDiplomeModal(true)}>
              <Plus size={13} /> Ajouter un diplôme
            </button>
          </div>

          <div className="med-card-body" style={{ padding: profil.diplomes.length === 0 ? '2rem' : '0.5rem' }}>
            {profil.diplomes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--c-t3)' }}>
                <BookOpen size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                <div style={{ fontWeight: 600, color: 'var(--c-t2)', marginBottom: 4 }}>Aucun diplôme</div>
                <div style={{ fontSize: '0.8125rem' }}>Ajoutez vos diplômes et titres académiques.</div>
              </div>
            ) : (
              profil.diplomes.map(d => (
                <div key={d.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between',
                  padding: '12px 14px', borderBottom: '1px solid var(--c-bdr)',
                }}>
                  <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: 'var(--c-green-bg)', color: 'var(--c-green)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <BookOpen size={15} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, color: 'var(--c-t0)', fontSize: '0.8125rem' }}>{d.intitule}</span>
                        <span className="med-badge med-badge-blue" style={{ fontSize: '0.59375rem' }}>{d.type}</span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--c-t3)' }}>
                        {[d.etablissement, d.pays].filter(Boolean).join(' · ')}
                        {d.dateObtention && <span> · {formatDate(d.dateObtention)}</span>}
                      </div>
                      {d.documentUrl && (
                        <a href={d.documentUrl} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.6875rem', color: 'var(--c-accent)', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                          <ChevronRight size={10} /> Voir le document
                        </a>
                      )}
                    </div>
                  </div>
                  <button className="med-btn med-btn-sm" onClick={() => handleRemoveDiplome(d.id)}
                    style={{ color: 'var(--c-red)', borderColor: 'var(--c-red-bd)', flexShrink: 0 }}
                    title="Supprimer">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Accréditations ── */}
      {tab === 'accreditations' && (
        <div className="med-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <div className="med-card-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="med-form-section-icon med-fsi-amber"><ShieldCheck size={13} /></div>
              <div>
                <div className="med-card-title">Mes accréditations</div>
                <div className="med-card-sub">{profil.accreditations.length} accréditation(s) enregistrée(s)</div>
              </div>
            </div>
            <button className="med-btn med-btn-primary med-btn-sm" onClick={() => setShowAccreditationModal(true)}>
              <Plus size={13} /> Ajouter une accréditation
            </button>
          </div>

          <div className="med-card-body" style={{ padding: profil.accreditations.length === 0 ? '2rem' : '0.5rem' }}>
            {profil.accreditations.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--c-t3)' }}>
                <ShieldCheck size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                <div style={{ fontWeight: 600, color: 'var(--c-t2)', marginBottom: 4 }}>Aucune accréditation</div>
                <div style={{ fontSize: '0.8125rem' }}>Ajoutez vos certifications et accréditations professionnelles.</div>
              </div>
            ) : (
              profil.accreditations.map(a => {
                const isExpired = a.dateExpiration
                  ? new Date(a.dateExpiration) < new Date()
                  : false;
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between',
                    padding: '12px 14px', borderBottom: '1px solid var(--c-bdr)',
                  }}>
                    <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: isExpired ? 'var(--c-red-bg)' : 'var(--c-amber-bg)',
                        color: isExpired ? 'var(--c-red)' : 'var(--c-amber)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <ShieldCheck size={15} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                          <span style={{ fontWeight: 600, color: 'var(--c-t0)', fontSize: '0.8125rem' }}>{a.intitule}</span>
                          {isExpired
                            ? <span className="med-badge med-badge-red" style={{ fontSize: '0.59375rem' }}>Expirée</span>
                            : <span className="med-badge med-badge-green" style={{ fontSize: '0.59375rem' }}>Valide</span>
                          }
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--c-t3)' }}>
                          {a.organismeCertificateur && <span>{a.organismeCertificateur}</span>}
                          {a.dateObtention && <span> · Obtenu le {formatDate(a.dateObtention)}</span>}
                          {a.dateExpiration && (
                            <span style={{ color: isExpired ? 'var(--c-red)' : 'var(--c-t3)' }}>
                              {' '}· Expire le {formatDate(a.dateExpiration)}
                            </span>
                          )}
                        </div>
                        {a.documentUrl && (
                          <a href={a.documentUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '0.6875rem', color: 'var(--c-accent)', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                            <ChevronRight size={10} /> Voir le document
                          </a>
                        )}
                      </div>
                    </div>
                    <button className="med-btn med-btn-sm" onClick={() => handleRemoveAccreditation(a.id)}
                      style={{ color: 'var(--c-red)', borderColor: 'var(--c-red-bd)', flexShrink: 0 }}
                      title="Supprimer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showDiplomeModal && profil && (
        <DiplomeModal
          medecinId={profil.id}
          onClose={() => setShowDiplomeModal(false)}
          onSaved={() => { fetchProfil(); showToast('success', 'Diplôme ajouté avec succès.'); }}
        />
      )}
      {showAccreditationModal && profil && (
        <AccreditationModal
          medecinId={profil.id}
          onClose={() => setShowAccreditationModal(false)}
          onSaved={() => { fetchProfil(); showToast('success', 'Accréditation ajoutée avec succès.'); }}
        />
      )}
    </div>
  );
}
