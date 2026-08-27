import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../Dashboard/Sidebar.css'; // Reusing existing styling but we can add more specific if needed
import './Adherent.css';
import { useAuth } from '../../context/AuthContext';

const AdherentSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isDevisExpanded, setIsDevisExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active menu-item' : 'menu-item';
  };

  const toggleDevis = () => {
    setIsDevisExpanded(!isDevisExpanded);
  };

  return (
    <aside className="sidebar adherent-sidebar">
      <div className="sidebar-header">
        <img src="/images/logo.jpg" alt="Logo Mutuelle" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        <ul className="menu">
          <li>
            <Link to="/adherent" className={isActive('/adherent')}>
              <span className="icon"><i className="fas fa-home"></i></span>
              <span>Accueil Adhérent</span>
            </Link>
          </li>
          
          <li className="menu-group">Espace Santé</li>
          
          <li>
            <Link to="/adherent/medicaments" className={isActive('/adherent/medicaments')}>
              <span className="icon"><i className="fas fa-pills"></i></span>
              <span>Médicaments</span>
            </Link>
          </li>


          <li className={`has-submenu ${isDevisExpanded ? 'expanded' : ''}`}>
            <div className="menu-item submenu-toggle" onClick={toggleDevis}>
              <div className="item-left">
                 <span className="icon"><i className="fas fa-file-invoice"></i></span>
                 <span>Mes Devis</span>
              </div>
              <span className="arrow">{isDevisExpanded ? '▼' : '▶'}</span>
            </div>
            {isDevisExpanded && (
              <ul className="submenu">
                <li>
                  <Link to="/adherent/devis/dentaire" className={isActive('/adherent/devis/dentaire')}>
                    <span className="submenu-dot"></span>
                    Devis Dentaire
                  </Link>
                </li>
                <li>
                  <Link to="/adherent/devis/optique" className={isActive('/adherent/devis/optique')}>
                    <span className="submenu-dot"></span>
                    Devis Optique
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="menu-group">Mon Compte</li>
          
          <li>
            <Link to="/adherent/historique" className={isActive('/adherent/historique')}>
              <span className="icon"><i className="fas fa-history"></i></span>
              <span>Historique Complet</span>
            </Link>
          </li>

          <li>
            <Link to="/adherent/compte" className={isActive('/adherent/compte')}>
              <span className="icon"><i className="fas fa-user-cog"></i></span>
              <span>Mon Compte</span>
            </Link>
          </li>

          <li className="logout-item">
            <button onClick={handleLogout}>
              <span className="icon"><i className="fas fa-sign-out-alt"></i></span>
              <span>Déconnexion</span>
            </button>
          </li>
          
        </ul>
      </nav>
    </aside>
  );
};

export default AdherentSidebar;
