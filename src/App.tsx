import './App.css';
import './styles/design-system.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }         from './context/AuthContext';
import { ThemeProvider }        from './context/ThemeContext';
import { PrivateRoute }         from './utils/PrivateRoute';
import LoginPage                from './pages/auth/LoginPage/LoginPage';
import { Layout }               from './layout/Layout';
import Dashboard                from './pages/Dashboard/Dashboard';
import PatientList              from './pages/Patients/PatientList';
import ValiderDiagnostic        from './pages/Diagnostic/ValiderDiagnostic';
import Calendrier               from './pages/Calendrier/Calendrier';
import SejourHistorique         from './pages/Sejours/SejourHistorique';
import DossierServicePage       from './pages/DossierService/DossierServicePage';
import ProfilPage               from './pages/ProfilPage/ProfilPage';
import ConfidentialitePage      from './pages/ConfidentialitePage/ConfidentialitePage';
import NotificationsPage        from './pages/NotificationsPage/NotificationsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <PrivateRoute requiredRole="MEDECIN">
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index                  element={<Dashboard />}        />
              <Route path="dashboard"       element={<Dashboard />}        />
              <Route path="patients"        element={<PatientList />}      />
              <Route path="diagnostics"     element={<ValiderDiagnostic />}/>
              <Route path="calendrier"      element={<Calendrier />}       />
              <Route path="hospitalisations"element={<SejourHistorique />} />
              <Route path="dossier-patients" element={<DossierServicePage />} />
              <Route path="profil"          element={<ProfilPage />}       />
              <Route path="notifications"   element={<NotificationsPage />}/>
              <Route path="confidentialite" element={<ConfidentialitePage />}/>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
