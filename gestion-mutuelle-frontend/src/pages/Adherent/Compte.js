import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Adherent.css';

const Compte = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [agent, setAgent] = useState(null);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  useEffect(() => {
    const loadProfileAndAgent = async () => {
      try {
        setLoading(true);
        // 1. Fetch user profile (/api/utilisateurs/me)
        const meRes = await fetch('http://localhost:8081/api/utilisateurs/me', { headers: getAuthHeaders() });
        if (!meRes.ok) throw new Error('Impossible de charger les données du profil.');
        const meData = await meRes.json();
        setProfile(meData);

        // 2. Fetch agent info (/api/agents) to find the matricule
        const agentsRes = await fetch('http://localhost:8081/api/agents', { headers: getAuthHeaders() });
        if (agentsRes.ok) {
          const agents = await agentsRes.json();
          const myAgent = agents.find(a => Number(a.idUser) === Number(meData.id));
          if (myAgent) {
            setAgent(myAgent);
          }
        }
      } catch (err) {
        console.error("Erreur de chargement du profil", err);
        showAlert(err.message || 'Une erreur est survenue lors de la récupération des données.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadProfileAndAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      showAlert('Veuillez saisir un nouveau mot de passe.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Les mots de passe ne correspondent pas.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Le mot de passe doit comporter au moins 6 caractères.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`http://localhost:8081/api/utilisateurs/modifier-mot-de-passe/${profile.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        showAlert('Votre mot de passe a été modifié avec succès !', 'success');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showAlert(data.error || 'Erreur lors de la modification du mot de passe.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Erreur réseau ou serveur inaccessible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid #e2e8f0', borderTop: '5px solid #006eb7', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#64748b', fontWeight: '500' }}>Chargement de vos informations...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="adherent-compte-page" style={{ position: 'relative' }}>
      {alert.show && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ width: '350px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: alert.type === 'success' ? '#10b981' : '#ef4444', marginBottom: '1rem' }}>
              <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </div>
            <h3>{alert.type === 'success' ? 'Succès !' : 'Erreur'}</h3>
            <p>{alert.message}</p>
            <button 
              onClick={() => setAlert({ show: false, message: '', type: 'success' })} 
              style={{ 
                padding: '10px 24px', 
                background: alert.type === 'success' ? '#10b981' : '#ef4444', 
                color: 'white', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                width: '100%', 
                border: 'none' 
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>Mon Compte</h1>
        <p style={{ color: '#64748b' }}>Gérez vos informations de connexion et sécurisez votre espace adhérent.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Profile Card */}
        <div className="adherent-card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid #edf2f7', paddingBottom: '2rem' }}>
            <div style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #006eb7 0%, #004e82 100%)', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '2.2rem', 
              margin: '0 auto 1rem',
              boxShadow: '0 8px 16px rgba(0, 110, 183, 0.15)',
              fontWeight: 'bold'
            }}>
              {profile ? (profile.nom ? profile.nom.charAt(0) : '') + (profile.prenom ? profile.prenom.charAt(0) : '') : 'A'}
            </div>
            <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.3rem' }}>
              {profile ? `${profile.nom} ${profile.prenom}` : 'Adhérent'}
            </h3>
            <span style={{ 
              background: '#e0f2fe', 
              color: '#0369a1', 
              padding: '4px 12px', 
              borderRadius: '12px', 
              fontSize: '0.8rem', 
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {profile?.role === 'ROLE_CLIENT' ? 'Adhérent' : 'Utilisateur'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Matricule Agent</label>
              <div style={{ 
                padding: '12px', 
                background: '#f8fafc', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0', 
                color: '#334155', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-id-card" style={{ color: '#006eb7' }}></i>
                <span>{agent ? agent.matricule : 'Non disponible'}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  <i className="fas fa-lock" style={{ marginRight: '4px' }}></i>Non modifiable
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Adresse Email (Identifiant)</label>
              <div style={{ 
                padding: '12px', 
                background: '#f8fafc', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0', 
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-envelope" style={{ color: '#006eb7' }}></i>
                <span>{profile ? profile.username : ''}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  <i className="fas fa-lock" style={{ marginRight: '4px' }}></i>Non modifiable
                </span>
              </div>
            </div>

            {agent && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #edf2f7', paddingTop: '1.2rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>SITUATION FAMILIALE</span>
                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>{agent.situationFamiliale || 'Célibataire'}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>TÉLÉPHONE</span>
                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>{agent.telephone || 'Non renseigné'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="adherent-card" style={{ padding: '2rem' }}>
          <h2 style={{ borderBottom: '2px solid #006eb7', paddingBottom: '10px', marginTop: 0 }}>
            <i className="fas fa-shield-alt"></i> Sécurité du Compte
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Vous pouvez mettre à jour le mot de passe de votre espace à tout moment. Choisissez un mot de passe sécurisé.
          </p>

          <form onSubmit={handlePasswordChange} className="workflow-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="form-group">
              <label style={{ fontWeight: '600', color: '#475569' }}>
                <i className="fas fa-lock" style={{ marginRight: '6px', color: '#64748b' }}></i> Nouveau mot de passe
              </label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Saisissez votre nouveau mot de passe"
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: '600', color: '#475569' }}>
                <i className="fas fa-check-double" style={{ marginRight: '6px', color: '#64748b' }}></i> Confirmer le nouveau mot de passe
              </label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ressaisissez le nouveau mot de passe"
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={saving}
                style={{ 
                  padding: '12px 30px', 
                  fontSize: '1rem', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Compte;
