import { useState, useEffect, useCallback } from 'react';
import { getNotifications, marquerLu, marquerToutLu, type Notification } from '../../services/notificationService';

export default function NotificationsPage() {
  const [notifs,   setNotifs]   = useState<Notification[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [marking,  setMarking]  = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getNotifications()
      .then(r => setNotifs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleMarquerLu(id: string) {
    await marquerLu(id).catch(() => {});
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  }

  async function handleToutLu() {
    setMarking(true);
    await marquerToutLu().catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
    setMarking(false);
  }

  const unread = notifs.filter(n => !n.lu).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div className="med-page-h" style={{ margin: 0 }}>
          <h1 className="med-page-title">Notifications</h1>
          <p className="med-page-sub">
            {loading ? 'Chargement…' : unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est lu'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleToutLu}
            disabled={marking}
            style={{
              padding: '7px 14px', borderRadius: 7, border: '1px solid var(--med-bdr, #e2e8f0)',
              background: 'var(--med-surf, #f8fafc)', color: 'var(--med-t1, #334155)',
              cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
            }}
          >
            {marking ? 'En cours…' : 'Tout marquer comme lu'}
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="med-card">
        {loading ? (
          <div className="med-card-body" style={{ color: 'var(--med-t3)', fontSize: 12, textAlign: 'center', padding: 24 }}>
            Chargement…
          </div>
        ) : notifs.length === 0 ? (
          <div className="med-card-body" style={{ color: 'var(--med-t3)', fontSize: 13, textAlign: 'center', padding: 32 }}>
            Aucune notification pour le moment.
          </div>
        ) : (
          <div>
            {notifs.map((n, i) => (
              <div
                key={n.id}
                onClick={() => !n.lu && handleMarquerLu(n.id)}
                style={{
                  display: 'flex', gap: 14, padding: '14px 18px',
                  borderBottom: i < notifs.length - 1 ? '1px solid var(--med-bdr, #e2e8f0)' : 'none',
                  background: n.lu ? 'transparent' : 'rgba(14,165,233,0.04)',
                  cursor: n.lu ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!n.lu) (e.currentTarget as HTMLDivElement).style.background = 'rgba(14,165,233,0.08)'; }}
                onMouseLeave={e => { if (!n.lu) (e.currentTarget as HTMLDivElement).style.background = 'rgba(14,165,233,0.04)'; }}
              >
                {/* Indicateur lu / non-lu */}
                <div style={{ paddingTop: 5, flexShrink: 0 }}>
                  <span style={{
                    display: 'block', width: 8, height: 8, borderRadius: '50%',
                    background: n.lu ? 'var(--med-bdr, #e2e8f0)' : '#0ea5e9',
                  }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 13, lineHeight: 1.55,
                    color: n.lu ? 'var(--med-t2, #64748b)' : 'var(--med-t0, #0f172a)',
                    fontWeight: n.lu ? 400 : 500,
                  }}>
                    {n.message}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--med-t3, #94a3b8)' }}>
                    {new Date(n.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {!n.lu && <span style={{ marginLeft: 8, color: '#0ea5e9', fontWeight: 600 }}>· Non lue</span>}
                  </p>
                </div>

                {!n.lu && (
                  <button
                    onClick={e => { e.stopPropagation(); handleMarquerLu(n.id); }}
                    style={{
                      flexShrink: 0, alignSelf: 'center',
                      padding: '4px 10px', borderRadius: 5,
                      border: '1px solid #0ea5e9', background: 'transparent',
                      color: '#0ea5e9', cursor: 'pointer', fontSize: 11,
                      fontFamily: 'inherit', whiteSpace: 'nowrap',
                    }}
                  >
                    Marquer lu
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
