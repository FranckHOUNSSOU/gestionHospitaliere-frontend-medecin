export interface Patient {
  id: string;
  numeroIpp: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: 'M' | 'F';
  groupeSanguinAbo?: string;
  groupeSanguinRhesus?: string;
  statutReanimatoire?: string;
  allergies?: Allergie[];
  traitementsARisque?: TraitementARisque[];
}

export interface Allergie {
  id: string;
  substance: string;
  type: string;
  gravite: 'Legere' | 'Moderee' | 'Severe';
  description?: string;
}

export interface TraitementARisque {
  id: string;
  nom: string;
  risque: string;
}

export interface Sejour {
  id: string;
  numeroSejour: string;
  dateAdmission: string;
  dateSortie?: string;
  modeEntree: string;
  modeSortie?: string;
  motifHospitalisation: string;
  medecinResponsable?: { id: string; nom: string; prenom: string };
  statut?: 'actif' | 'cloture';
  diagnostics?: Diagnostic[];
  prescriptions?: Prescription[];
  examens?: Examen[];
  constantes?: Constante[];
}

export interface Diagnostic {
  id: string;
  codeCim10: string;
  libelle: string;
  type: 'Principal' | 'Associe' | 'Complication';
  statut: 'Confirme' | 'Suspecte' | 'Ecarte';
  valide?: boolean;
  dateCreation?: string;
  saisiPar?: string;
  patient?: Pick<Patient, 'id' | 'nom' | 'prenom' | 'numeroIpp'>;
  sejour?: { id: string; numeroSejour: string };
}

export interface CreateDiagnosticDto {
  codeCim10: string;
  libelle: string;
  type: 'Principal' | 'Associe' | 'Complication';
  statut: 'Confirme' | 'Suspecte' | 'Ecarte';
}

export interface Prescription {
  id: string;
  nomMedicamentDci: string;
  dose: number;
  unite: string;
  frequence: string;
  voieAdministration: string;
  statut: 'Active' | 'Suspendue' | 'Terminee';
  dateDebut?: string;
  dateFin?: string;
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

export interface LignePrescription extends CreatePrescriptionDto {
  _key: string; // clé locale pour la liste
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

export interface RendezVous {
  id: string;
  patient: Pick<Patient, 'id' | 'nom' | 'prenom' | 'numeroIpp'>;
  dateHeure: string; // ISO string
  motif: string;
  statut: 'Programme' | 'Confirme' | 'Annule' | 'Effectue';
  dureeMinutes?: number;
}

export interface DossierComplet {
  patient: Patient;
  sejourActif?: Sejour;
  historiqueSejours?: Sejour[];
}

export interface SejourHistorique {
  id: string;
  numeroSejour: string;
  dateAdmission: string;
  dateSortie?: string;
  motifHospitalisation: string;
  patient: Pick<Patient, 'id' | 'nom' | 'prenom' | 'numeroIpp' | 'dateNaissance' | 'sexe'>;
  statut: 'actif' | 'cloture';
}