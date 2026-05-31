import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, marquerLu, marquerToutLu, type Notification } from '../../services/notificationService';

export const Topbar = ({ minimized, onToggleSidebar }: {
  minimized: boolean;
  onToggleSidebar: () => void;
}) => {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();

  const [notifs,       setNotifs]       = useState<Notification[]>([]);
  const [showNotifs,   setShowNotifs]   = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.lu).length;

  // Charger les notifs au montage + toutes les 60s
  useEffect(() => {
    function load() {
      getNotifications().then(r => setNotifs(r.data)).catch(() => {});
    }
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Fermer le panneau au clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleMarquerLu(id: string) {
    await marquerLu(id).catch(() => {});
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  }

  async function handleToutLu() {
    await marquerToutLu().catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
  }

  const initiales = user ? `${user.nom?.[0] ?? ''}${user.prenom?.[0] ?? ''}`.toUpperCase() : 'DR';
  const nomComplet = user ? `Dr. ${user.prenom} ${user.nom}` : 'Médecin';

  return (
    <div className="med-topbar">
      <div className="med-topbar-l">
        <div className="med-logo">
          <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 46, width: 'auto' }} />
          <span className="med-logo-name">CHU-MEL</span>
          <span className="med-logo-chip">Médecin</span>
        </div>

        <button className="med-topbar-sidebar-toggle" onClick={onToggleSidebar}
          title={minimized ? 'Agrandir le menu' : 'Réduire le menu'}>
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

        {/* ── Cloche notifications ── */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="med-icon-btn"
            title="Notifications"
            onClick={() => setShowNotifs(prev => !prev)}
            style={{ position: 'relative' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 16, height: 16, borderRadius: '50%',
                background: '#dc2626', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 500,
              width: 320, background: 'var(--med-bg, #fff)', border: '1px solid var(--med-bdr, #e2e8f0)',
              borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.14)', overflow: 'hidden',
            }}>
              {/* Header panneau */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--med-bdr, #e2e8f0)' }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications {unreadCount > 0 && <span style={{ color: '#dc2626' }}>({unreadCount})</span>}</span>
                {unreadCount > 0 && (
                  <button onClick={handleToutLu} style={{ fontSize: 11, color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Tout marquer lu
                  </button>
                )}
              </div>

              {/* Liste */}
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '24px 14px', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                    Aucune notification
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.lu && handleMarquerLu(n.id)}
                      style={{
                        padding: '10px 14px', borderBottom: '1px solid var(--med-bdr, #e2e8f0)',
                        background: n.lu ? 'transparent' : 'rgba(14,165,233,0.05)',
                        cursor: n.lu ? 'default' : 'pointer',
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}
                    >
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                        background: n.lu ? 'transparent' : '#0ea5e9',
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: n.lu ? '#64748b' : '#1e293b' }}>
                          {n.message}
                        </p>
                        <p style={{ margin: '3px 0 0', fontSize: 10.5, color: '#94a3b8' }}>
                          {new Date(n.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
