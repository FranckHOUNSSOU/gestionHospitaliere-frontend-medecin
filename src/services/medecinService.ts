import apiClient from './clients';
import type {
  Patient,
  Sejour,
  Diagnostic,
  CreateDiagnosticDto,
  Prescription,
  CreatePrescriptionDto,
  RendezVous,
  SejourHistorique,
} from '../types/auth.types';

// ─── Patients ────────────────────────────────────────────────────────────────

/** Recherche par nom/IPP – uniquement les patients ayant au moins un séjour
 *  (admission enregistrée par l'agent administratif)
 */
export const searchPatients = (q: string) =>
  apiClient.get<Patient[]>(`/patients/recherche?q=${encodeURIComponent(q)}`);

export const getPatientByIpp = (ipp: string) =>
  apiClient.get<Patient>(`/patients/ipp/${ipp}`);

export const getPatientById = (id: string) =>
  apiClient.get<Patient>(`/patients/${id}`);

/** Dossier complet : allergies, traitements à risque, séjours */
export const getPatientDossier = (id: string) =>
  apiClient.get<Patient>(`/patients/${id}/dossier`);

// ─── Séjours ─────────────────────────────────────────────────────────────────

/** Tous les patients pris en charge par les médecins du même service */
export const getPatientsMonService = (q?: string) =>
  apiClient.get<Patient[]>('/sejours/patients-du-service', {
    params: q?.trim() ? { q } : {},
  });

/** Tous les séjours d'un patient (avec médecin responsable et diagnostics) */
export const getSejoursPatient = (patientId: string) =>
  apiClient.get<Sejour[]>(`/sejours/patient/${patientId}`);

export const getSejourActif = (patientId: string) =>
  apiClient.get<Sejour>(`/sejours/patient/${patientId}/actif`);

export const getHistoriqueSejours = (patientId: string) =>
  apiClient.get<Sejour[]>(`/sejours/patient/${patientId}/historique`);

export const getSejourDetail = (sejourId: string) =>
  apiClient.get<Sejour>(`/sejours/${sejourId}`);

// ─── Actes cliniques ─────────────────────────────────────────────────────────

export const createDiagnostic = (sejourId: string, data: CreateDiagnosticDto) =>
  apiClient.post<Diagnostic>(`/sejours/${sejourId}/diagnostics`, data);

/** Valider / modifier un diagnostic (statut, validation) */
export const updateDiagnostic = (
  sejourId: string,
  diagId: string,
  data: Partial<Omit<Diagnostic, 'id' | 'patient' | 'sejour'>>,
) => apiClient.patch<Diagnostic>(`/sejours/${sejourId}/diagnostics/${diagId}`, data);

export const createPrescription = (sejourId: string, data: CreatePrescriptionDto) =>
  apiClient.post<Prescription>(`/sejours/${sejourId}/prescriptions`, data);

export const updatePrescription = (
  sejourId: string,
  prescId: string,
  data: Partial<Prescription>,
) => apiClient.patch<Prescription>(`/sejours/${sejourId}/prescriptions/${prescId}`, data);

// ─── Historique des hospitalisations ─────────────────────────────────────────

/** Patients hospitalisés du médecin connecté (actifs et/ou terminés) */
export const getMesHospitalisations = (statut?: 'actif' | 'cloture') =>
  apiClient.get<SejourHistorique[]>('/sejours', {
    params: statut ? { statut } : undefined,
  });

// ─── Rendez-vous ─────────────────────────────────────────────────────────────

/** Rendez-vous du médecin connecté pour la semaine courante */
export const getMesRendezVous = (debut?: string, fin?: string) =>
  apiClient.get<RendezVous[]>('/rendezvous/moi', {
    params: { debut, fin },
  });

// ─── Profil médecin ───────────────────────────────────────────────────────────

export const getMonProfil = () => apiClient.get('/auth/profil');

// ─── Dashboard ────────────────────────────────────────────────────────────────

/** Patients dont le dossier a été ouvert récemment (séjour actif ou récent) */
export const getDossiersRecents = () =>
  apiClient.get<SejourHistorique[]>('/sejours/recents');