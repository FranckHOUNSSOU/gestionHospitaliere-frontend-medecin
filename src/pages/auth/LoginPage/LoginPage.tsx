import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { LoginFormData } from '../../../types/auth.types';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await login(formData);
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container fluid className="h-100 g-0">
        <Row className="h-100 g-0">

          {/* ── PANNEAU GAUCHE : illustration ── */}
          <Col xs={12} lg={7} className="login-left d-none d-lg-flex flex-column justify-content-between">
            <div className="login-bg-circle login-bg-circle--1" />
            <div className="login-bg-circle login-bg-circle--2" />
            <div className="login-bg-dots" />

            <div className="login-logo d-flex align-items-center gap-3">
              <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 52, width: 'auto' }} />
              <div>
                <div className="login-logo__name">CHU-MEL</div>
                <div className="login-logo__tag">Espace Médecin — Gestion clinique</div>
              </div>
            </div>

            <div className="login-illus flex-grow-1 d-flex align-items-center justify-content-center">
              <svg
                className="login-illus__svg"
                viewBox="0 0 520 440"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* SOL */}
                <rect x="40" y="370" width="440" height="6" rx="3" fill="rgba(255,255,255,0.1)"/>
                <rect x="80" y="374" width="360" height="3" rx="1.5" fill="rgba(255,255,255,0.05)"/>

                {/* BÂTIMENT */}
                <rect x="160" y="160" width="200" height="210" rx="3"
                  fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
                <polygon points="148,160 260,95 372,160"
                  fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
                <rect x="247" y="108" width="26" height="26" rx="4"
                  fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5"/>
                <rect x="255" y="114" width="10" height="14" rx="1.5" fill="rgba(255,255,255,0.7)"/>
                <rect x="250" y="119" width="20" height="6" rx="1.5" fill="rgba(255,255,255,0.7)"/>

                {/* Fenêtres */}
                <rect x="175" y="178" width="32" height="26" rx="3"
                  fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.16)" strokeWidth="1"/>
                <rect x="217" y="178" width="32" height="26" rx="3"
                  fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.16)" strokeWidth="1"/>
                <rect x="309" y="178" width="32" height="26" rx="3"
                  fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.16)" strokeWidth="1"/>

                {/* Porte */}
                <rect x="234" y="286" width="52" height="84" rx="3"
                  fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
                <circle cx="262" cy="330" r="2.5" fill="rgba(255,255,255,0.4)"/>

                {/* MÉDECIN */}
                <circle cx="108" cy="200" r="22"
                  fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5"/>
                <path d="M80 290 Q82 250 108 232 Q134 250 136 290 L140 370 L76 370 Z"
                  fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <rect x="103" y="252" width="8" height="14" rx="1.5" fill="rgba(255,255,255,0.55)"/>
                <rect x="99" y="257" width="16" height="5" rx="1.5" fill="rgba(255,255,255,0.55)"/>
                <path d="M80 270 Q60 280 52 300 Q46 316 54 322"
                  stroke="rgba(255,255,255,0.28)" strokeWidth="10" strokeLinecap="round" fill="none"/>
                <path d="M52 300 Q44 316 50 330 Q56 342 66 336 Q76 330 72 318"
                  stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="72" cy="318" r="8"
                  stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="rgba(255,255,255,0.15)"/>
                <circle cx="72" cy="318" r="3.5" fill="rgba(255,255,255,0.4)"/>

                {/* ECG Monitor */}
                <rect x="390" y="82" width="110" height="58" rx="10"
                  fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
                <polyline
                  points="396,112 408,112 414,96 420,128 426,112 436,112 442,100 448,124 454,112 496,112"
                  stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none"
                  strokeLinecap="round" strokeLinejoin="round"/>
                <text x="396" y="130" fontFamily="Inter,sans-serif" fontSize="8"
                  fill="rgba(255,255,255,0.28)" fontWeight="500" letterSpacing="1">MONITORING</text>
              </svg>
            </div>
          </Col>

          {/* ── PANNEAU DROIT : formulaire ── */}
          <Col xs={12} lg={5} className="login-right d-flex flex-column align-items-center justify-content-center">
            <div className="login-form-wrap w-100">

              <div className="d-flex align-items-center gap-3 mb-4 d-lg-none">
                <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 36, width: 'auto' }} />
                <div className="login-logo__name" style={{ color: '#1355a8' }}>CHU-MEL</div>
              </div>

              <div className="mb-4">
                <h1 className="login-title">Connexion Médecin</h1>
                <p className="login-subtitle">
                  Saisissez vos identifiants pour accéder à votre espace clinique.
                </p>
              </div>

              <Form onSubmit={handleSubmit} noValidate>

                <Form.Group className="mb-3" controlId="loginEmail">
                  <Form.Label className="login-label">Adresse email</Form.Label>
                  <div className="login-input-wrap">
                    <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <Form.Control
                      type="email"
                      placeholder="Votre email professionnel"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="login-input"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="loginPassword">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="login-label mb-0">Mot de passe</Form.Label>
                    <span className="login-forgot">Mot de passe oublié ?</span>
                  </div>
                  <div className="login-input-wrap">
                    <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <Form.Control
                      type="password"
                      placeholder="Votre mot de passe"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="login-input"
                    />
                  </div>
                </Form.Group>

                {error && (
                  <Alert variant="danger" className="login-alert py-2 px-3">
                    {error}
                  </Alert>
                )}

                <Form.Group className="mb-4" controlId="loginRemember">
                  <Form.Check
                    type="checkbox"
                    id="loginRemember"
                    label="Se souvenir de moi sur cet appareil"
                    checked={formData.rememberMe}
                    onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="login-check"
                  />
                </Form.Group>

                <Button type="submit" disabled={loading} className="login-btn w-100">
                  {loading
                    ? <><Spinner animation="border" size="sm" className="me-2"/>Connexion...</>
                    : 'Se connecter'
                  }
                </Button>

              </Form>
            </div>

            <p className="login-copy">
              &copy; 2026 CHU-MEL &nbsp;&middot;&nbsp; Tous droits réservés
            </p>
          </Col>

        </Row>
      </Container>
    </div>
  );
}
