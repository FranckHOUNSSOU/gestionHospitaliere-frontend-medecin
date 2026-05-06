import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ minimized, onToggleSidebar }: {
  minimized: boolean;
  onToggleSidebar: () => void;
}) => {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();

  const initiales = user
    ? `${user.nom?.[0] ?? ''}${user.prenom?.[0] ?? ''}`.toUpperCase()
    : 'DR';
  const nomComplet = user ? `Dr. ${user.prenom} ${user.nom}` : 'Médecin';

  return (
    <div className="med-topbar">
      <div className="med-topbar-l">
        <div className="med-logo">
          <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 46, width: 'auto' }} />
          <span className="med-logo-name">CHU-MEL</span>
          <span className="med-logo-chip">Médecin</span>
        </div>

        <button
          className="med-topbar-sidebar-toggle"
          onClick={onToggleSidebar}
          title={minimized ? 'Agrandir le menu' : 'Réduire le menu'}
        >
          {minimized ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          )}
        </button>
      </div>

      <div className="med-topbar-r">
        <div className="med-online-pill">
          <div className="med-online-dot" />
          Système opérationnel
        </div>

        <button className="med-icon-btn" title="Notifications">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div className="med-notif-badge" />
        </button>

        <button className="med-icon-btn" onClick={toggle} title={dark ? 'Mode clair' : 'Mode sombre'}>
          {dark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <div className="med-user-btn">
          <div className="med-avatar">{initiales}</div>
          <div>
            <div className="med-user-name">{nomComplet}</div>
            <div className="med-user-role">Médecin</div>
          </div>
        </div>

        <button className="med-icon-btn" onClick={logout} title="Déconnexion">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
