import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [profile, setProfile] = useState(null);
  const [agent, setAgent] = useState(null);
  
  const notifRef = useRef(null);
  const prevNotificationsRef = useRef([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isClient = user?.roles?.includes('ROLE_CLIENT') || user?.roles?.includes('ROLE_ADHERENT');
  const isOperator = user?.roles?.includes('ROLE_OPERATEUR');
  const isConsultant = user?.roles?.includes('ROLE_CONSULTANT');
  const hideNotifications = isOperator || isConsultant;

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token || ''}`
    };
  };

  const fetchNotifications = async () => {
    if (!user || hideNotifications) return;
    try {
      if (isClient) {
        // Fetch agents and beneficiaries to match with user
        const [agentsRes, beneRes] = await Promise.all([
          fetch('http://localhost:8081/api/agents', { headers: getAuthHeaders() }),
          fetch('http://localhost:8081/api/beneficiaires', { headers: getAuthHeaders() })
        ]);
        if (!agentsRes.ok || !beneRes.ok) return;
        const agents = await agentsRes.json();
        const beneficiaries = await beneRes.json();
        
        const myAgent = agents.find(a => Number(a.idUser) === Number(user?.id));
        if (!myAgent) return;

        // Fetch devis
        const [dentaireRes, optiqueRes] = await Promise.all([
          fetch('http://localhost:8081/api/devis-dentaire', { headers: getAuthHeaders() }),
          fetch('http://localhost:8081/api/devis-optique', { headers: getAuthHeaders() })
        ]);
        if (!dentaireRes.ok || !optiqueRes.ok) return;
        const dentaire = await dentaireRes.json();
        const optique = await optiqueRes.json();

        const myNotifications = [];
        dentaire.forEach(d => {
          const bene = beneficiaries.find(b => Number(b.idBeneficiaire) === Number(d.idBeneficiaire));
          if (bene && Number(bene.idAgent) === Number(myAgent.idAgent)) {
            if (d.etatReponse !== 'En attente' && d.etatReponse !== 'En attente admin') {
              const isRead = localStorage.getItem(`read_${user.id}_${d.idDevis}_${d.etatReponse}`) === 'true';
              if (!isRead) {
                let msg = `Votre devis dentaire n°${d.idDevis} est passé au statut "${d.etatReponse}"`;
                if (d.etatReponse === 'Refusé' && d.motifRefus) {
                  msg = `Votre devis dentaire n°${d.idDevis} a été refusé. Motif : ${d.motifRefus}`;
                }
                myNotifications.push({
                  idDevis: d.idDevis,
                  type: 'Dentaire',
                  link: `/adherent/devis/dentaire`,
                  message: msg,
                  date: d.dateReponse || d.dateDepot,
                  etatReponse: d.etatReponse
                });
              }
            }
          }
        });

        optique.forEach(d => {
          const bene = beneficiaries.find(b => Number(b.idBeneficiaire) === Number(d.idBeneficiaire));
          if (bene && Number(bene.idAgent) === Number(myAgent.idAgent)) {
            if (d.etatReponse !== 'En attente' && d.etatReponse !== 'En attente admin') {
              const isRead = localStorage.getItem(`read_${user.id}_${d.idDevis}_${d.etatReponse}`) === 'true';
              if (!isRead) {
                let msg = `Votre devis optique n°${d.idDevis} est passé au statut "${d.etatReponse}"`;
                if (d.etatReponse === 'Refusé' && d.motifRefus) {
                  msg = `Votre devis optique n°${d.idDevis} a été refusé. Motif : ${d.motifRefus}`;
                }
                myNotifications.push({
                  idDevis: d.idDevis,
                  type: 'Optique',
                  link: `/adherent/devis/optique`,
                  message: msg,
                  date: d.dateReponse || d.dateDepot,
                  etatReponse: d.etatReponse
                });
              }
            }
          }
        });

        // Sort by date/id descending
        myNotifications.sort((a, b) => b.idDevis - a.idDevis);
        setNotifications(myNotifications);
      } else {
        // Fetch devis pending admin validation
        const [dentaireRes, optiqueRes] = await Promise.all([
          fetch('http://localhost:8081/api/devis-dentaire', { headers: getAuthHeaders() }),
          fetch('http://localhost:8081/api/devis-optique', { headers: getAuthHeaders() })
        ]);
        if (!dentaireRes.ok || !optiqueRes.ok) return;
        const dentaire = await dentaireRes.json();
        const optique = await optiqueRes.json();

        const pending = [];
        dentaire
          .filter(d => d.etatReponse === 'En attente admin')
          .forEach(d => {
            const isRead = localStorage.getItem(`read_${user.id}_${d.idDevis}_${d.etatReponse}`) === 'true';
            if (!isRead) {
              pending.push({
                idDevis: d.idDevis,
                type: 'Dentaire',
                link: `/dashboard/devis/dentaire`,
                message: `Nouveau devis dentaire soumis (ID: ${d.idDevis})`,
                date: d.dateDepot,
                etatReponse: d.etatReponse
              });
            }
          });
        optique
          .filter(d => d.etatReponse === 'En attente admin')
          .forEach(d => {
            const isRead = localStorage.getItem(`read_${user.id}_${d.idDevis}_${d.etatReponse}`) === 'true';
            if (!isRead) {
              pending.push({
                idDevis: d.idDevis,
                type: 'Optique',
                link: `/dashboard/devis/optique`,
                message: `Nouveau devis optique soumis (ID: ${d.idDevis})`,
                date: d.dateDepot,
                etatReponse: d.etatReponse
              });
            }
          });

        pending.sort((a, b) => b.idDevis - a.idDevis);
        setNotifications(pending);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isClient]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/utilisateurs/me', { headers: getAuthHeaders() });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }

        if (isClient) {
          const agentsRes = await fetch('http://localhost:8081/api/agents', { headers: getAuthHeaders() });
          if (agentsRes.ok) {
            const agents = await agentsRes.json();
            const myAgent = agents.find(a => Number(a.idUser) === Number(user.id));
            if (myAgent) {
              setAgent(myAgent);
            }
          }
        }
      } catch (error) {
        console.error("Erreur chargement profil", error);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isClient]);

  useEffect(() => {
    if (!user) return;
    
    // Find new notifications that weren't in the previous list (by idDevis + etatReponse)
    const newNotifications = notifications.filter(
      newNotif => !prevNotificationsRef.current.some(
        oldNotif => oldNotif.idDevis === newNotif.idDevis && oldNotif.etatReponse === newNotif.etatReponse
      )
    );

    // Only show toast if the page is not loading for the first time
    if (newNotifications.length > 0 && prevNotificationsRef.current.length > 0) {
      setActiveToast(newNotifications[0]);
      
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }

    prevNotificationsRef.current = notifications;
  }, [notifications, user]);

  const handleNotifClick = (notif) => {
    localStorage.setItem(`read_${user.id}_${notif.idDevis}_${notif.etatReponse}`, 'true');
    fetchNotifications();
    setShowNotif(false);
    navigate(`${notif.link}?openDevis=${notif.idDevis}`);
  };

  const handleViewAll = () => {
    setShowNotif(false);
    if (!isClient) {
      navigate('/dashboard/notifications');
    }
  };

  // Fonction pour formater le rôle (ex: ROLE_ADMIN -> Admin)
  const formatRole = (roles) => {
    if (!roles || roles.length === 0) return 'Utilisateur';
    const primaryRole = roles[0];
    if (primaryRole === 'ROLE_ADMIN') return 'Admin';
    if (primaryRole === 'ROLE_OPERATEUR') return 'Opérateur';
    if (primaryRole === 'ROLE_CONSULTANT') return 'Consultant';
    if (primaryRole === 'ROLE_CLIENT') return 'Adhérent';
    return 'Utilisateur';
  };

  const userRole = formatRole(user?.roles);
  const userName = user?.username || 'Utilisateur';
  
  let nameParts = [];
  if (agent) {
    if (agent.nom) nameParts.push(agent.nom);
    if (agent.prenom) nameParts.push(agent.prenom);
  } else if (profile) {
    if (profile.nom) nameParts.push(profile.nom);
    if (profile.prenom) nameParts.push(profile.prenom);
  }
  const displayName = nameParts.length > 0 ? nameParts.join(' ') : userName;

  return (
    <header className="navbar">
      <div className="navbar-user" style={{ marginLeft: 'auto' }}>
        {!hideNotifications && (
          <div className="notification" ref={notifRef} style={{ position: 'relative' }}>
            <span className="bell-icon" onClick={() => setShowNotif(!showNotif)}>
              <i className="fas fa-bell"></i>
            </span>
            {notifications.length > 0 && (
              <span className="badge" onClick={() => setShowNotif(!showNotif)}>
                {notifications.length}
              </span>
            )}
            
            {showNotif && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <span>Notifications ({notifications.length})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!isClient && (
                      <button onClick={handleViewAll}>Voir tout</button>
                    )}
                    <span 
                      className="notification-header-close-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNotif(false);
                      }} 
                      title="Fermer"
                    >
                      <i className="fas fa-times"></i>
                    </span>
                  </div>
                </div>
                <div className="notification-body">
                  {notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                      <div 
                        key={index} 
                        className="notification-item" 
                        onClick={() => handleNotifClick(notif)}
                        style={{ position: 'relative', paddingRight: '35px' }}
                      >
                        <span className="notification-item-title">
                          <i className={`fas ${notif.type === 'Dentaire' ? 'fa-tooth' : 'fa-glasses'}`} style={{ color: '#006eb7' }}></i>
                          Devis {notif.type}
                        </span>
                        <span className="notification-item-msg">{notif.message}</span>
                        <span className="notification-item-date">{notif.date}</span>
                        <span 
                          className="notification-item-close-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            localStorage.setItem(`read_${user.id}_${notif.idDevis}_${notif.etatReponse}`, 'true');
                            fetchNotifications();
                          }}
                          title="Marquer comme lu"
                        >
                          <i className="fas fa-times"></i>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="notification-empty">
                      <i className="fas fa-bell-slash"></i>
                      <span>Aucune nouvelle notification</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="user-profile">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=006eb7&color=fff`} 
            alt="User Avatar" 
            className="avatar" 
          />
          <div className="user-info">
            <span className="user-greeting">Bonjour,</span>
            <span className="user-name">{displayName}</span>
          </div>
        </div>
      </div>

      {activeToast && !hideNotifications && (
        <div 
          className="floating-toast" 
          onClick={() => {
            localStorage.setItem(`read_${user.id}_${activeToast.idDevis}_${activeToast.etatReponse}`, 'true');
            fetchNotifications();
            setActiveToast(null);
            navigate(`${activeToast.link}?openDevis=${activeToast.idDevis}`);
          }}
        >
          <div className="floating-toast-icon">
            <i className={`fas ${activeToast.type === 'Dentaire' ? 'fa-tooth' : 'fa-glasses'}`}></i>
          </div>
          <div className="floating-toast-content">
            <span className="floating-toast-title">Nouveau message</span>
            <span className="floating-toast-msg">{activeToast.message}</span>
          </div>
          <button 
            className="floating-toast-close" 
            onClick={(e) => {
              e.stopPropagation();
              setActiveToast(null);
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;

