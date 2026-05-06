export default function NotificationsPage() {
  return (
    <div>
      <div className="med-page-h">
        <h1 className="med-page-title">Notifications</h1>
        <p className="med-page-sub">Alertes et messages système</p>
      </div>
      <div className="med-card">
        <div className="med-card-body" style={{ color: 'var(--c-t3)', fontSize: 12 }}>
          Aucune notification.
        </div>
      </div>
    </div>
  );
}
