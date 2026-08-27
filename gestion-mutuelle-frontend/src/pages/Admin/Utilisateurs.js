import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';
import './Utilisateurs.css';

// Styled Detail Modal triggered by the eye button
const DetailModal = ({ open, onClose, data }) => {
  if (!open || !data) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-content-animated" style={{ maxWidth: '450px' }}>
        <div style={{ 
          borderBottom: '2px solid #006eb7', 
          paddingBottom: '12px', 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>
            <i className="fas fa-id-card-alt" style={{ marginRight: '10px', color: '#006eb7' }}></i>
            Détails de l'utilisateur
          </h3>
          <span style={{ cursor: 'pointer', fontSize: 24, fontWeight: 700, color: '#64748b' }} onClick={onClose}>&times;</span>
        </div>
        <div className="detail-card">
          <div className="detail-row">
            <span className="detail-label">Nom</span>
            <span className="detail-value">{data.nom}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Prénom</span>
            <span className="detail-value">{data.prenom}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email (Nom d'utilisateur)</span>
            <span className="detail-value">{data.username}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Rôle</span>
            <span className="detail-value">
              {(() => {
                const displayValue = data.role || 'Adhérent';
                let badgeClass = 'role-client';
                let iconClass = 'fa-user';
                if (displayValue === 'Administrateur') {
                  badgeClass = 'role-admin';
                  iconClass = 'fa-user-shield';
                } else if (displayValue === 'Opérateur') {
                  badgeClass = 'role-operator';
                  iconClass = 'fa-user-cog';
                } else if (displayValue === 'Consultant') {
                  badgeClass = 'role-consultant';
                  iconClass = 'fa-user-tie';
                }
                return (
                  <span className={`role-badge ${badgeClass}`}>
                    <i className={`fas ${iconClass}`} style={{ marginRight: '6px' }}></i>
                    {displayValue}
                  </span>
                );
              })()}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Statut</span>
            <span className="detail-value">
              <span className={`status-badge ${data.statut === 'Actif' ? 'status-active' : 'status-inactive'}`}>
                <span className="status-dot"></span>
                {data.statut}
              </span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date Création</span>
            <span className="detail-value">
              {data.dateCreation ? new Date(data.dateCreation).toLocaleDateString('fr-FR') : 'N/A'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button 
            onClick={onClose} 
            style={{ 
              padding: '10px 24px', 
              background: '#006eb7', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(0, 110, 183, 0.2)'
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

const Utilisateurs = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const API_URL = 'http://localhost:8081/api/utilisateurs';

  const showAlert = (message, type = 'success') => {
    setAlertModal({ show: true, message, type });
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        setUsers(await response.json());
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs", error);
    }
  };

  const handleAdd = () => {
    setCurrentUser({
      nom: '',
      prenom: '',
      username: '',
      password: '',
      role: 'ROLE_CLIENT',
      statut: 'Actif'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    // We pass empty password in the editing form so we don't display the current hash
    setCurrentUser({
      ...item,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchUsers();
        showAlert('Utilisateur supprimé avec succès !');
      } else {
        showAlert('Erreur lors de la suppression.', 'error');
      }
    } catch (error) {
      showAlert('Erreur lors de la suppression.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const isEditing = !!currentUser.id;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/${currentUser.id}` : API_URL;

    // Check password requirement for new user
    if (!isEditing && (!currentUser.password || currentUser.password.trim() === '')) {
      showAlert('Le mot de passe est obligatoire pour un nouvel utilisateur.', 'error');
      return;
    }

    // Build payload. Omit password if editing and password field is blank
    const payload = {
      nom: currentUser.nom,
      prenom: currentUser.prenom,
      username: currentUser.username,
      role: currentUser.role,
      statut: currentUser.statut,
      dateCreation: currentUser.dateCreation || new Date()
    };

    if (currentUser.password && currentUser.password.trim() !== '') {
      payload.password = currentUser.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchUsers();
        setIsModalOpen(false);
        showAlert(`Utilisateur ${isEditing ? 'modifié' : 'ajouté'} avec succès !`);
      } else {
        const errorData = await response.text();
        showAlert(errorData || 'Erreur lors de la sauvegarde.', 'error');
      }
    } catch (error) {
      showAlert('Erreur lors de la sauvegarde.', 'error');
    }
  };

  // Maps values for GenericTable columns: Nom, Prénom, Email, Rôle, Statut
  const formattedData = users.map(u => ({
    id: u.id,
    nom: u.nom,
    prenom: u.prenom,
    username: u.username,
    role: u.role === 'ROLE_ADMIN' ? 'Administrateur' : u.role === 'ROLE_OPERATEUR' ? 'Opérateur' : u.role === 'ROLE_CONSULTANT' ? 'Consultant' : 'Adhérent',
    statut: u.statut || 'Actif',
    dateCreation: u.dateCreation
  }));

  const columns = [
    { Header: 'Nom', accessor: 'nom' },
    { Header: 'Prénom', accessor: 'prenom' },
    { Header: 'Email', accessor: 'username' },
    {
      Header: 'Rôle',
      accessor: 'role',
      Cell: ({ value }) => {
        const displayValue = value || 'Adhérent';
        let badgeClass = 'role-client';
        let iconClass = 'fa-user';
        if (displayValue === 'Administrateur') {
          badgeClass = 'role-admin';
          iconClass = 'fa-user-shield';
        } else if (displayValue === 'Opérateur') {
          badgeClass = 'role-operator';
          iconClass = 'fa-user-cog';
        } else if (displayValue === 'Consultant') {
          badgeClass = 'role-consultant';
          iconClass = 'fa-user-tie';
        }
        return (
          <span className={`role-badge ${badgeClass}`}>
            <i className={`fas ${iconClass}`} style={{ marginRight: '6px' }}></i>
            {displayValue}
          </span>
        );
      }
    },
    { Header: 'Statut', accessor: 'statut' }
  ];

  return (
    <div className="utilisateurs-container">
      {alertModal.show && (
        <div className="modal-overlay" style={{ zIndex: 4000 }}>
          <div className="modal-content-animated" style={{ width: '350px', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3.5rem', color: alertModal.type === 'success' ? '#10b981' : '#ef4444', marginBottom: '1rem' }}>
              <i className={`fas ${alertModal.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
              {alertModal.type === 'success' ? 'Succès !' : 'Erreur'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>{alertModal.message}</p>
            <button 
              onClick={() => setAlertModal({ show: false, message: '', type: 'success' })} 
              style={{ 
                padding: '10px 24px', 
                background: alertModal.type === 'success' ? '#10b981' : '#ef4444', 
                color: 'white', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                width: '100%', 
                border: 'none',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <GenericTable
        title="Gestion des Utilisateurs"
        columns={columns}
        data={formattedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={item => setDetailModal({ show: true, data: item })}
      />

      <DetailModal 
        open={detailModal.show} 
        data={detailModal.data} 
        onClose={() => setDetailModal({ show: false, data: null })} 
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-animated">
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '1.5rem', 
              color: '#1e293b', 
              borderBottom: '2px solid #006eb7', 
              paddingBottom: '10px',
              fontSize: '1.4rem'
            }}>
              <i className={`fas ${currentUser?.id ? 'fa-user-edit' : 'fa-user-plus'}`} style={{ marginRight: '10px', color: '#006eb7' }}></i>
              {currentUser?.id ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
            </h3>
            <form onSubmit={handleSave} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Dummy inputs to prevent browser autofill */}
              <input type="text" name="prevent_autofill_username" style={{ display: 'none' }} />
              <input type="password" name="prevent_autofill_password" style={{ display: 'none' }} />
              
              <div className="modal-grid">
                <div>
                  <label className="form-label-with-spacing">Nom</label>
                  <div className="input-icon-wrapper">
                    <input 
                      required 
                      type="text" 
                      placeholder="Nom"
                      value={currentUser?.nom || ''} 
                      onChange={e => setCurrentUser({ ...currentUser, nom: e.target.value })} 
                    />
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div>
                  <label className="form-label-with-spacing">Prénom</label>
                  <div className="input-icon-wrapper">
                    <input 
                      required 
                      type="text" 
                      placeholder="Prénom"
                      value={currentUser?.prenom || ''} 
                      onChange={e => setCurrentUser({ ...currentUser, prenom: e.target.value })} 
                    />
                    <i className="fas fa-user"></i>
                  </div>
                </div>
              </div>

              <div className="modal-full-width">
                <label className="form-label-with-spacing">Email (Nom d'utilisateur)</label>
                <div className="input-icon-wrapper">
                  <input 
                    required 
                    type="email" 
                    placeholder="email@example.com"
                    autoComplete="new-password"
                    value={currentUser?.username || ''} 
                    onChange={e => setCurrentUser({ ...currentUser, username: e.target.value })} 
                  />
                  <i className="fas fa-envelope"></i>
                </div>
              </div>

              <div className="modal-full-width">
                <label className="form-label-with-spacing">
                  Mot de passe {currentUser?.id && <span style={{ fontWeight: 'normal', color: '#94a3b8', fontSize: '0.8rem' }}>(Laisser vide pour ne pas modifier)</span>}
                </label>
                <div className="input-icon-wrapper">
                  <input 
                    type="password" 
                    placeholder={currentUser?.id ? "••••••••" : "Saisir un mot de passe"}
                    autoComplete="new-password"
                    value={currentUser?.password || ''} 
                    onChange={e => setCurrentUser({ ...currentUser, password: e.target.value })} 
                  />
                  <i className="fas fa-lock"></i>
                </div>
              </div>

              <div className="modal-grid">
                <div>
                  <label className="form-label-with-spacing">Rôle</label>
                  <div className="input-icon-wrapper">
                    <select 
                      value={currentUser?.role || 'ROLE_CLIENT'} 
                      onChange={e => setCurrentUser({ ...currentUser, role: e.target.value })}
                    >
                      <option value="ROLE_ADMIN">Administrateur</option>
                      <option value="ROLE_OPERATEUR">Opérateur</option>
                      <option value="ROLE_CONSULTANT">Consultant</option>
                      <option value="ROLE_CLIENT">Adhérent</option>
                    </select>
                    <i className="fas fa-user-tag"></i>
                  </div>
                </div>
                <div>
                  <label className="form-label-with-spacing">Statut</label>
                  <div className="input-icon-wrapper">
                    <select 
                      value={currentUser?.statut || 'Actif'} 
                      onChange={e => setCurrentUser({ ...currentUser, statut: e.target.value })}
                    >
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                    <i className="fas fa-toggle-on"></i>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn-cancel"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilisateurs;
