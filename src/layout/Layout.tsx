import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar/Topbar';
import { Sidebar } from './Sidebar/Sidebar';
import { Footer } from './Footer/Footer';
import { useTheme } from '../context/ThemeContext';
import '../styles/design-system.css';

export const Layout = () => {
  const { dark } = useTheme();
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="med" data-theme={dark ? 'dark' : ''}>
      <div className="med-wrap">
        <Topbar minimized={minimized} onToggleSidebar={() => setMinimized(m => !m)} />
        <div className="med-body">
          <Sidebar minimized={minimized} />
          <div className="med-content-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <div className="med-main" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <Outlet />
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};
