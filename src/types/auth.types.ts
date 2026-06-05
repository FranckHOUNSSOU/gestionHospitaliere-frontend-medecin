export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export type UserRole = 'ADMINISTRATEUR' | 'MEDECIN' | 'AGENT_ADMINISTRATIF' | 'AGENT_RENSEIGNEMENT';
export type Pole = 'POLE MERE' | 'POLE ENFANT' | 'POLE DES SERVICES COMMUNS';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nom: string;
  prenom: string;
  service: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
}

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: User;
}

export interface Allergie {
  id: string;
  allergene: string;
  typeReaction?: string | null;
  severite?: 'Légère' | 'Modérée' | 'Sévère' | 'Mortelle' | null;
  dateDecouverte?: string | null;
  observations?: string | null;
}

export interface TraitementARisque {
  id: string;
  nomMedicament: string;
  classe?: string | null;
  posologieEnCours?: string | null;
  niveauAlerte?: 'Faible' | 'Modéré' | 'Élevé' | 'Critique' | null;
  observations?: string | null;
}
 
export interface ContactUrgence {
  id: string;
  nom: string;
  prenom: string;
  lienParente?: string | null;
  telephone?: string | null;
  estPersonneConfiance?: boolean;
}

export interface CouvertureSociale {
  id: string;
  typeCouverture?: string | null;
  nomOrganisme?: string | null;
  numeroAssure?: string | null;
  estActive?: boolean;
}

export interface Patient {
  id: string;
  numeroIpp: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: 'M' | 'F';
  telephone?: string;
  adresse?: string;
  groupeSanguinAbo?: string;
  groupeSanguinRhesus?: string;
  statutReanimatoire?: string;
  statutProfil?: 'Complet' | 'Incomplet';
  allergies?: Allergie[];
  traitementsARisque?: TraitementARisque[];
  contactsUrgence?: ContactUrgence[];
  couverturesSociales?: CouvertureSociale[];
}
 
// ── Séjour ────────────────────────────────────────────────────────────────────

export interface SoinInfirmier {
  id: string;
  cible: string;
  donneesObservees?: string | null;
  actionsRealisees?: string | null;
  resultatsObtenus?: string | null;
  dateHeure: string;
  valide: boolean;
  saisiParId?: string | null;
  saisiParNom?: string | null;
  valideParId?: string | null;
  valideParNom?: string | null;
  dateValidation?: string | null;
  patient?: Pick<Patient, 'id' | 'nom' | 'prenom' | 'numeroIpp'>;
  sejour?: { id: string; numeroSejour: string };
}

export interface Sejour {
  id: string;
  numeroSejour: string;
  dateAdmission: string;
  dateSortie?: string;
  modeEntree: string;
  modeSortie?: string;
  motifHospitalisation: string;
  typeSejour?: 'Hospitalisation' | 'Consultation' | 'Urgences';
  medecinResponsable?: { id: string; numeroOrdre?: string; user?: { id: string; nom: string; prenom: string } };
  statut?: 'actif' | 'cloture';
  diagnostics?: Diagnostic[];
  soinsInfirmiers?: SoinInfirmier[];
  prescriptions?: Prescription[];
  examens?: Examen[];
  constantes?: Constante[];
}
 
export interface SejourHistorique {
  id: string;
  numeroSejour: string;
  dateAdmission: string;
  dateSortie?: string;
  motifHospitalisation: string;
  typeSejour: 'Hospitalisation' | 'Consultation' | 'Urgences';
  statut: 'actif' | 'cloture';
  patient: Pick<Patient, 'id' | 'nom' | 'prenom' | 'numeroIpp' | 'dateNaissance' | 'sexe'>;
}
 
export interface DossierComplet {
  patient: Patient;
  sejourActif?: Sejour;
  historiqueSejours?: Sejour[];
}
 
// ── Actes cliniques ───────────────────────────────────────────────────────────
 
export interface Diagnostic {
  id: string;
  codeCim10: string;
  libelle: string;
  type: 'Principal' | 'Associé' | 'Complication';
  statut: 'Confirmé' | 'Suspecté' | 'Écarté';
  valide?: boolean;
  createdAt?: string;
  saisiParId?: string | null;
  saisiParNom?: string | null;
  valideParId?: string | null;
  valideParNom?: string | null;
  dateValidation?: string | null;
  patient?: Pick<Patient, 'id' | 'nom' | 'prenom' | 'numeroIpp'>;
  sejour?: { id: string; numeroSejour: string };
}

export interface CreateDiagnosticDto {
  codeCim10: string;
  libelle: string;
  type: Diagnostic['type'];
  statut: Diagnostic['statut'];
}
 
export interface Prescription {
  id: string;
  nomMedicamentDci: string;
  nomCommercial?: string | null;
  dose: number;
  unite: string;
  frequence: string;
  voieAdministration: string;
  statut: 'Active' | 'Suspendue' | 'Terminee';
  dateDebut?: string;
  dateFin?: string;
  observations?: string | null;
  createdAt?: string;
  medecinPrescripteur?: { id: string; user: { nom: string; prenom: string } } | null;
}
 
export interface CreatePrescriptionDto {
  nomMedicamentDci: string;
  dose: number;
  unite: string;
  frequence: string;
  voieAdministration: string;
  dateDebut?: string;
  dateFin?: string;
}
 
/** Ligne locale (avant envoi API) */
export interface LignePrescription extends CreatePrescriptionDto {
  _key: string;
}
 
export interface Examen {
  id: string;
  typeExamen: string;
  sousType?: string;
  statut: 'Prescrit' | 'EnCours' | 'ResultatDisponible';
  dateCreation: string;
}
 
export interface Constante {
  id: string;
  tensionSystolique?: number;
  tensionDiastolique?: number;
  frequenceCardiaque?: number;
  temperature?: number;
  spo2?: number;
  poids?: number;
  glasgow?: number;
  douleurEva?: number;
  dateCreation: string;
}
 
// ── Rendez-vous ───────────────────────────────────────────────────────────────
 
export interface RendezVous {
  id: string;
  patient: Pick<Patient, 'id' | 'nom' | 'prenom' | 'numeroIpp'>;
  dateHeure: string;
  motif: string;
  statut: 'Programme' | 'Confirme' | 'Annule' | 'Effectue';
  dureeMinutes?: number;
}

// ── Profil médecin complet ────────────────────────────────────────────────────

export type StatutOrdre  = 'Inscrit' | 'Suspendu' | 'Radié';
export type SexeMedecin  = 'M' | 'F' | 'Autre';
export type TypeContrat  = 'Titulaire' | 'Contractuel' | 'Vacataire' | 'Libéral' | 'Interne' | 'Résident';
export type TypeDiplome  = 'DOCTORAT' | 'DES' | 'DESC' | 'DU' | 'DIU' | 'MASTER' | 'AUTRE';
export type RoleDansService = 'Chef de service' | 'Praticien' | 'Assistant' | 'Interne' | 'Consultant';

export interface MedecinSpecialite {
  id: string;
  specialite: string;
  estPrincipale: boolean;
  dateObtention?: string | null;
}

export interface MedecinDiplome {
  id: string;
  intitule: string;
  type: TypeDiplome;
  etablissement?: string | null;
  pays?: string | null;
  dateObtention?: string | null;
  documentUrl?: string | null;
}

export interface MedecinAccreditation {
  id: string;
  intitule: string;
  organismeCertificateur?: string | null;
  dateObtention?: string | null;
  dateExpiration?: string | null;
  estValide?: boolean;
  documentUrl?: string | null;
}

export interface MedecinAffectation {
  id: string;
  service: { id: string; nom: string; code: string };
  roleDansService: RoleDansService;
  estPrincipal: boolean;
  dateDebut: string;
  dateFin?: string | null;
  estActive: boolean;
}

export interface MedecinProfil {
  id: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    role: string;
    numeroOrdre: string | null;
  };
  numeroOrdre: string;
  dateInscriptionOrdre?: string | null;
  statutOrdre: StatutOrdre;
  dateNaissance?: string | null;
  sexe?: SexeMedecin | null;
  nationalite?: string | null;
  photoUrl?: string | null;
  telephoneUrgence?: string | null;
  typeContrat?: TypeContrat | null;
  datePriseDeFonction?: string | null;
  dateFinContrat?: string | null;
  estActif: boolean;
  specialites: MedecinSpecialite[];
  diplomes: MedecinDiplome[];
  accreditations: MedecinAccreditation[];
  affectations: MedecinAffectation[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialiteDto {
  specialite: string;
  estPrincipale?: boolean;
  dateObtention?: string;
}

export interface CreateDiplomeDto {
  intitule: string;
  type: TypeDiplome;
  etablissement?: string;
  pays?: string;
  dateObtention?: string;
  documentUrl?: string;
}

export interface CreateAccreditationDto {
  intitule: string;
  organismeCertificateur?: string;
  dateObtention?: string;
  dateExpiration?: string;
  documentUrl?: string;
}

export interface UpdateMedecinDto {
  dateInscriptionOrdre?: string;
  statutOrdre?: StatutOrdre;
  dateNaissance?: string;
  sexe?: SexeMedecin;
  nationalite?: string;
  photoUrl?: string;
  telephoneUrgence?: string;
  typeContrat?: TypeContrat;
  datePriseDeFonction?: string;
  dateFinContrat?: string;
}