import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

import { useAuth } from '../context/AuthContext';

const translations = {
  fr: {
    welcome: 'Bienvenue.',
    srmDescription: "La SRM-MS Mutuelle a pour mission d'assurer la gestion efficace des prestations médicales et sociales destinées à ses adhérents et à leurs ayants droit.",
    address: 'Avenue de France, B.P. 520, Marrakech',
    title: 'Espace Mutuelle',
    usernameLabel: "Nom d'utilisateur / Matricule",
    usernamePlaceholder: "Votre nom d'utilisateur ou matricule",
    passwordLabel: 'Mot de passe / CIN',
    passwordPlaceholder: 'Votre mot de passe ou CIN',
    loginBtn: 'Se connecter',
    loadingBtn: 'Connexion...',
    errorMsg: 'Identifiants incorrects. Veuillez réessayer.',
    emptyFields: 'Veuillez remplir tous les champs.',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    notMember: 'Pas de compte ? Contactez le support',
    supportLink: 'Contacter le support'
  },
  ar: {
    welcome: 'مرحباً بكم.',
    srmDescription: 'تتمثل مهمة تعاضدية SRM-MS في ضمان التدبير الفعال للخدمات الطبية والاجتماعية الموجهة للمنخرطين وذوي حقوقهم.',
    address: 'شارع فرنسا، ص.ب 520، مراكش',
    title: 'فضاء التعاضدية',
    usernameLabel: 'اسم المستخدم / رقم التسجيل',
    usernamePlaceholder: 'أدخل اسم المستخدم أو رقم التسجيل',
    passwordLabel: 'كلمة المرور / رقم البطاقة الوطنية',
    passwordPlaceholder: 'أدخل كلمة المرور أو رقم البطاقة الوطنية',
    loginBtn: 'تسجيل الدخول',
    loadingBtn: 'جاري الاتصال...',
    errorMsg: 'معلومات الدخول غير صحيحة. يرجى المحاولة مجدداً.',
    emptyFields: 'يرجى ملء جميع الخانات.',
    rememberMe: 'تذكرني',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    notMember: 'ليس لديك حساب؟ اتصل بالدعم الفني',
    supportLink: 'اتصل بالدعم'
  }
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('fr');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError(t.emptyFields);
      return;
    }
    setLoading(true);
    try {
      const userData = await login(username, password);
      if (userData.roles.includes('ROLE_ADMIN') || userData.roles.includes('ROLE_OPERATEUR') || userData.roles.includes('ROLE_CONSULTANT')) {
        navigate('/dashboard');
      } else if (userData.roles.includes('ROLE_CLIENT')) {
        navigate('/adherent');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`login-container lang-${lang} theme-${theme}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="login-card-split">
        {/* Left Panel - Login Form */}
        <div className="login-panel-form">
          <div className="panel-header">
            <div className="logo-brand">
              <img src="/images/logo.jpg" alt="Logo SRM-MS" className="logo-img-small" />
              <div className="brand-names">
                <span className="brand-main">SRM-MS</span>
                <span className="brand-sub">Marrakech-Safi</span>
              </div>
            </div>
            
            <div className="controls-group">
              <button 
                type="button" 
                className="theme-toggle-btn" 
                onClick={toggleTheme}
                title={theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
              >
                {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
              </button>
              <div className="language-selector-split">
                <button 
                  type="button" 
                  className={`lang-btn-split ${lang === 'fr' ? 'active' : ''}`} 
                  onClick={() => setLang('fr')}
                >
                  FR
                </button>
                <span className="lang-separator-split">|</span>
                <button 
                  type="button" 
                  className={`lang-btn-split ${lang === 'ar' ? 'active' : ''}`} 
                  onClick={() => setLang('ar')}
                >
                  العربية
                </button>
              </div>
            </div>
          </div>

          <div className="panel-body">
            <div className="avatar-container">
              <div className="avatar-circle">
                <i className="fas fa-user-shield"></i>
              </div>
            </div>

            <h3 className="form-title">{t.title}</h3>

            <form onSubmit={handleLogin} className="login-form-split">
              {error && <div className="error-message-split">{error}</div>}
              
              <div className="form-group-split">
                <div className="input-wrapper-split">
                  <span className="input-icon-split">
                    <i className="fas fa-user"></i>
                  </span>
                  <input
                    type="text"
                    placeholder={t.usernamePlaceholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-split">
                <div className="input-wrapper-split">
                  <span className="input-icon-split">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-options-split">
                <label className="remember-me-label">
                  <input type="checkbox" className="remember-checkbox" />
                  <span>{t.rememberMe}</span>
                </label>
                <a href="#forgot" className="forgot-password-link">{t.forgotPassword}</a>
              </div>

              <button type="submit" className="login-button-split" disabled={loading}>
                {loading ? t.loadingBtn : t.loginBtn}
              </button>
            </form>
          </div>

          <div className="panel-footer">
            <p className="footer-support-text">
              {t.notMember} • <a href="#support" className="support-link">{t.supportLink}</a>
            </p>
          </div>
        </div>

        {/* Right Panel - Info Banner (Wave Graphic) */}
        <div className="login-panel-info">
          <div className="info-header">
            <span className="info-tag">SRM-MS Mutuelle</span>
          </div>
          
          <div className="info-content">
            <div className="info-logo-wrapper">
              <img src="/images/logo.jpg" alt="Logo SRM-MS" className="info-panel-logo" />
            </div>
            <h1 className="info-welcome">{t.welcome}</h1>
            <p className="info-desc-highlight">{t.srmDescription}</p>
          </div>
          
          <div className="info-footer">
            <div className="info-address">
              <i className="fas fa-map-marker-alt"></i>
              <span>{t.address}</span>
            </div>
            <span className="info-copyright">© 2026 SRM Marrakech-Safi. Tous droits réservés.</span>
          </div>

          {/* Abstract glowing waves decoration */}
          <div className="wave-decor-1"></div>
          <div className="wave-decor-2"></div>
          <div className="wave-decor-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
