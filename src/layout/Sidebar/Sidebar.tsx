import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const Item = ({ to, icon, label, count, countCls, minimized }: {
  to: string; icon: ReactNode; label: string;
  count?: string; countCls?: string; minimized?: boolean;
}) => (
  <NavLink
    to={to}
    end={to === '/'}
    className={({ isActive }) => `med-nav-link${isActive ? ' active' : ''}`}
    title={minimized ? label : undefined}
  >
    <span className="med-nav-icon">{icon}</span>
    <span className="med-nav-label">{label}</span>
    {count && <span className={`med-nav-badge ${countCls}`}>{count}</span>}
  </NavLink>
);

export const Sidebar = ({ minimized }: { minimized: boolean }) => {
  return (
    <div className={`med-sidebar${minimized ? ' med-sidebar--min' : ''}`}>

      <div className="med-nav-sec">Tableau de bord</div>
      <Item to="/dashboard" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      } label="Vue d'ensemble" />

      <div className="med-nav-sec">Patients</div>
      <Item to="/patients" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
        </svg>
      } label="Recherche Dossier" />
      <Item to="/dossier-patients" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      } label="Dossiers Service" />

      <div className="med-nav-sec">Clinique</div>
      <Item to="/diagnostics" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      } label="Valider diagnostic" />
      <Item to="/calendrier" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      } label="Rendez-vous" />
      <Item to="/hospitalisations" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      } label="Hospitalisations" />

      <div className="med-nav-sec">Paramètres</div>
      <Item to="/notifications" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      } label="Notifications" />
      <Item to="/profil" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      } label="Mon profil" />
      <Item to="/confidentialite" minimized={minimized} icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      } label="Confidentialité" />

    </div>
  );
};
