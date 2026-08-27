import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDevisExpanded, setIsDevisExpanded] = useState(
    location.pathname.startsWith('/dashboard/devis')
  );
  const [isOrganisationExpanded, setIsOrganisationExpanded] = useState(
    location.pathname.startsWith('/dashboard/organisation')
  );
  const [isRemboursementExpanded, setIsRemboursementExpanded] = useState(false);

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

  const toggleRemboursement = () => {
    setIsRemboursementExpanded(!isRemboursementExpanded);
  };

  const toggleOrganisation = () => {
    setIsOrganisationExpanded(!isOrganisationExpanded);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/images/logo.jpg" alt="Logo SRM-MS" className="sidebar-logo" />
      </div>

      <nav className="sidebar-nav">
        <ul className="menu">
          <li>
            <Link to="/dashboard" className={isActive('/dashboard')}>
              <span className="icon"><i className="fas fa-chart-bar"></i></span>
              <span>Statistiques</span>
            </Link>
          </li>
          

          
          <li className="menu-group">Section Opérationnelle</li>
          
          <li>
            <Link to="/dashboard/agents" className={isActive('/dashboard/agents')}>
              <span className="icon"><i className="fas fa-users"></i></span>
              <span>Agents</span>
            </Link>
          </li>
          
          <li className={`has-submenu ${isDevisExpanded ? 'expanded' : ''}`}>
            <div className="menu-item submenu-toggle" onClick={toggleDevis}>
              <div className="item-left">
                 <span className="icon"><i className="fas fa-file-invoice"></i></span>
                 <span>Devis</span>
              </div>
              <span className="arrow">{isDevisExpanded ? '▼' : '▶'}</span>
            </div>
            {isDevisExpanded && (
              <ul className="submenu">
                <li>
                  <Link to="/dashboard/devis/dentaire" className={isActive('/dashboard/devis/dentaire')}>
                    <span className="submenu-dot"></span>
                    Devis Dentaire
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/devis/optique" className={isActive('/dashboard/devis/optique')}>
                    <span className="submenu-dot"></span>
                    Devis Optique
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link to="/dashboard/remboursement" className={isActive('/dashboard/remboursement')}>
              <span className="icon"><i className="fas fa-money-bill-wave"></i></span>
              <span>Remboursement</span>
            </Link>
          </li>
          
          <li>
            <Link to="/dashboard/radio" className={isActive('/dashboard/radio')}>
              <span className="icon"><i className="fas fa-x-ray"></i></span>
              <span>Radio</span>
            </Link>
          </li>
          
          <li>
            <Link to="/dashboard/prise-en-charge" className={isActive('/dashboard/prise-en-charge')}>
              <span className="icon"><i className="fas fa-handshake"></i></span>
              <span>Prise en charge</span>
            </Link>
          </li>
          
          {user?.roles?.includes('ROLE_ADMIN') && (
            <li>
              <Link to="/dashboard/maladie-speciale" className={isActive('/dashboard/maladie-speciale')}>
                <span className="icon"><i className="fas fa-hospital"></i></span>
                <span>Maladie spéciale</span>
              </Link>
            </li>
          )}
          
          <li>
            <Link to="/dashboard/analyse" className={isActive('/dashboard/analyse')}>
              <span className="icon"><i className="fas fa-microscope"></i></span>
              <span>Analyse</span>
            </Link>
          </li>
          
          <li>
            <Link to="/dashboard/ordonnance" className={isActive('/dashboard/ordonnance')}>
              <span className="icon"><i className="fas fa-prescription"></i></span>
              <span>Ordonnance</span>
            </Link>
          </li>

          <li>
            <Link to="/dashboard/carte-mutuelle" className={isActive('/dashboard/carte-mutuelle')}>
              <span className="icon"><i className="fas fa-id-card"></i></span>
              <span>Carte Mutuelle</span>
            </Link>
          </li>

          <li className="menu-group">Référentiel</li>
          
          <li>
            <Link to="/dashboard/etablissement" className={isActive('/dashboard/etablissement')}>
              <span className="icon"><i className="fas fa-building"></i></span>
              <span>Établissement</span>
            </Link>
          </li>
          
          <li>
            <Link to="/dashboard/medecin" className={isActive('/dashboard/medecin')}>
              <span className="icon"><i className="fas fa-user-doctor"></i></span>
              <span>Médecin</span>
            </Link>
          </li>

          <li className={`has-submenu ${isOrganisationExpanded ? 'expanded' : ''}`}>
            <div className="menu-item submenu-toggle" onClick={toggleOrganisation}>
              <div className="item-left">
                 <span className="icon"><i className="fas fa-sitemap"></i></span>
                 <span>Organisation</span>
              </div>
              <span className="arrow">{isOrganisationExpanded ? '▼' : '▶'}</span>
            </div>
            {isOrganisationExpanded && (
              <ul className="submenu">
                <li>
                  <Link to="/dashboard/organisation/direction" className={isActive('/dashboard/organisation/direction')}>
                    <span className="submenu-dot"></span>
                    Direction
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/organisation/departement" className={isActive('/dashboard/organisation/departement')}>
                    <span className="submenu-dot"></span>
                    Département
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/organisation/division" className={isActive('/dashboard/organisation/division')}>
                    <span className="submenu-dot"></span>
                    Division
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/organisation/service" className={isActive('/dashboard/organisation/service')}>
                    <span className="submenu-dot"></span>
                    Service
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/organisation/entite" className={isActive('/dashboard/organisation/entite')}>
                    <span className="submenu-dot"></span>
                    Entité
                  </Link>
                </li>
              </ul>
            )}
          </li>
          
          {user?.roles?.includes('ROLE_ADMIN') && (
            <>
              <li>
                <Link to="/dashboard/utilisateurs" className={isActive('/dashboard/utilisateurs')}>
                  <span className="icon"><i className="fas fa-user-shield"></i></span>
                  <span>Utilisateurs</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard/corbeille" className={isActive('/dashboard/corbeille')}>
                  <span className="icon"><i className="fas fa-trash-restore-alt"></i></span>
                  <span>Centre de Récupération</span>
                </Link>
              </li>
            </>
          )}
          
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

export default Sidebar;
