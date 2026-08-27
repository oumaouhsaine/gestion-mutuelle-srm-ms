import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Corbeille = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterEntity, setFilterEntity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, itemId: null, action: 'restore', entityName: '' });

  const API_URL = 'http://localhost:8081/api/deleted-items';

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        data.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        setItems(data);
      } else {
        showAlert('Erreur lors du chargement de l\'historique.', 'error');
      }
    } catch (error) {
      console.error(error);
      showAlert('Erreur de connexion avec le serveur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const handleRestore = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/restore`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        showAlert('L\'élément a été restauré avec succès.', 'success');
        fetchDeletedItems();
      } else {
        const errData = await response.json();
        showAlert(errData.error || 'Erreur lors de la restauration.', 'error');
      }
    } catch (error) {
      showAlert('Erreur réseau.', 'error');
    }
    setConfirmModal({ show: false, itemId: null, action: 'restore', entityName: '' });
  };

  const handlePurge = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/purge`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        showAlert('L\'élément a été définitivement supprimé.', 'success');
        fetchDeletedItems();
      } else {
        showAlert('Erreur lors de la suppression définitive.', 'error');
      }
    } catch (error) {
      showAlert('Erreur réseau.', 'error');
    }
    setConfirmModal({ show: false, itemId: null, action: 'restore', entityName: '' });
  };

  const formatEntityType = (type) => {
    const mapping = {
      'Agent': 'Agent',
      'Beneficiaire': 'Bénéficiaire',
      'DevisDentaire': 'Devis Dentaire',
      'DevisOptique': 'Devis Optique',
      'Remboursement': 'Remboursement',
      'Radio': 'Radio',
      'PriseEnCharge': 'Prise en Charge',
      'MaladieSpeciale': 'Maladie Spéciale',
      'Analyse': 'Analyse',
      'Ordonnance': 'Ordonnance',
      'CarteMutuelle': 'Carte Mutuelle',
      'Etablissement': 'Établissement',
      'Medecin': 'Médecin',
      'Direction': 'Direction',
      'Departement': 'Département',
      'Division': 'Division',
      'Service': 'Service',
      'Entite': 'Entité',
      'User': 'Utilisateur'
    };
    return mapping[type] || type;
  };

  const getEntityIcon = (type) => {
    const icons = {
      'Agent': 'fas fa-users',
      'Beneficiaire': 'fas fa-user-friends',
      'DevisDentaire': 'fas fa-teeth',
      'DevisOptique': 'fas fa-glasses',
      'Remboursement': 'fas fa-money-bill-wave',
      'Radio': 'fas fa-x-ray',
      'PriseEnCharge': 'fas fa-handshake',
      'MaladieSpeciale': 'fas fa-hospital',
      'Analyse': 'fas fa-microscope',
      'Ordonnance': 'fas fa-prescription',
      'CarteMutuelle': 'fas fa-id-card',
      'Etablissement': 'fas fa-building',
      'Medecin': 'fas fa-user-doctor',
      'Direction': 'fas fa-sitemap',
      'Departement': 'fas fa-sitemap',
      'Division': 'fas fa-sitemap',
      'Service': 'fas fa-sitemap',
      'Entite': 'fas fa-sitemap',
      'User': 'fas fa-user-shield'
    };
    return icons[type] || 'fas fa-file-alt';
  };

  const getEntityBadgeStyle = (type) => {
    const colors = {
      'Agent': { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      'DevisDentaire': { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
      'DevisOptique': { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
      'Remboursement': { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
      'PriseEnCharge': { bg: '#faf5ff', color: '#6b21a8', border: '#e9d5ff' },
      'CarteMutuelle': { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' }
    };
    return colors[type] || { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.deletedBy && item.deletedBy.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterEntity === 'Devis') {
      return matchesSearch && (item.entityName === 'DevisDentaire' || item.entityName === 'DevisOptique');
    }
    
    const matchesEntity = filterEntity ? item.entityName === filterEntity : true;
    return matchesSearch && matchesEntity;
  });

  return (
    <div style={{ padding: '24px', position: 'relative', minHeight: '80vh' }}>
      <style>{`
        .rec-container {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .rec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 16px;
        }
        .rec-title {
          font-size: 1.6rem;
          color: #1e293b;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rec-title i {
          color: #006eb7;
        }
        .rec-filters-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: center;
          flex-wrap: wrap;
        }
        .rec-search-input {
          flex: 1 1 300px;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .rec-search-input:focus {
          outline: none;
          border-color: #006eb7;
          box-shadow: 0 0 0 3px rgba(0, 110, 183, 0.15);
        }
        .rec-filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rec-filter-btn:hover {
          background: #f1f5f9;
          color: #334155;
        }
        .rec-filter-btn.active {
          background: #006eb7;
          color: white;
          border-color: #006eb7;
        }
        .rec-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          margin-top: 10px;
        }
        .rec-table th {
          background: #f8fafc;
          padding: 14px 16px;
          font-weight: 700;
          color: #475569;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
        }
        .rec-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 0.9rem;
        }
        .rec-table tr:hover {
          background: #fafafa;
        }
        .entity-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.75rem;
          border: 1px solid transparent;
        }
        .action-btns {
          display: flex;
          gap: 8px;
        }
        .action-btn-rec {
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          font-weight: bold;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .btn-restore {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }
        .btn-restore:hover {
          background: #d1fae5;
          color: #047857;
          transform: translateY(-1px);
        }
        .btn-purge {
          background: #fff5f5;
          color: #e53e3e;
          border: 1px solid #fed7d7;
        }
        .btn-purge:hover {
          background: #fed7d7;
          color: #c53030;
          transform: translateY(-1px);
        }
        .alert-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          padding: 16px 24px;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          z-index: 9999;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {alert.show && (
        <div className="alert-toast" style={{ background: alert.type === 'success' ? '#10b981' : '#ef4444' }}>
          <i className={alert.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'} style={{ marginRight: '8px' }}></i>
          {alert.message}
        </div>
      )}

      {confirmModal.show && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ width: '450px', textAlign: 'center', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#1e293b' }}>
              {confirmModal.action === 'restore' ? 'Confirmer la Restauration' : 'Confirmation de Suppression Définitive'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
              {confirmModal.action === 'restore' 
                ? `Voulez-vous restaurer l'élément "${confirmModal.entityName}" dans le système ?`
                : `Êtes-vous sûr de vouloir supprimer définitivement "${confirmModal.entityName}" ? Cette action est irréversible.`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button 
                onClick={() => setConfirmModal({ show: false, itemId: null, action: 'restore', entityName: '' })} 
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}
              >
                Annuler
              </button>
              <button 
                onClick={() => confirmModal.action === 'restore' ? handleRestore(confirmModal.itemId) : handlePurge(confirmModal.itemId)} 
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: confirmModal.action === 'restore' ? '#10b981' : '#ef4444', 
                  color: 'white', 
                  cursor: 'pointer', 
                  fontWeight: '600' 
                }}
              >
                {confirmModal.action === 'restore' ? 'Restaurer' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rec-container">
        <div className="rec-header">
          <h2 className="rec-title">
            <i className="fas fa-trash-alt"></i> Centre de Récupération
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
            Zone de Restauration Administrative
          </span>
        </div>

        <div className="rec-filters-bar">
          <input
            type="text"
            className="rec-search-input"
            placeholder="Rechercher par libellé, type, supprimé par..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className={`rec-filter-btn ${filterEntity === '' ? 'active' : ''}`} onClick={() => setFilterEntity('')}>Tout</button>
            <button className={`rec-filter-btn ${filterEntity === 'Agent' ? 'active' : ''}`} onClick={() => setFilterEntity('Agent')}>Agents</button>
            <button className={`rec-filter-btn ${filterEntity === 'Devis' ? 'active' : ''}`} onClick={() => setFilterEntity('Devis')}>Devis</button>
            <button className={`rec-filter-btn ${filterEntity === 'Remboursement' ? 'active' : ''}`} onClick={() => setFilterEntity('Remboursement')}>Remboursements</button>
            <button className={`rec-filter-btn ${filterEntity === 'CarteMutuelle' ? 'active' : ''}`} onClick={() => setFilterEntity('CarteMutuelle')}>Cartes</button>
            <button className={`rec-filter-btn ${filterEntity === 'PriseEnCharge' ? 'active' : ''}`} onClick={() => setFilterEntity('PriseEnCharge')}>PEC</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#006eb7', marginBottom: '10px' }}></i>
            <p style={{ color: '#64748b', margin: 0 }}>Chargement de l'archive des suppressions...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="rec-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Type d'élément</th>
                  <th style={{ width: '40%' }}>Détails / Nom de l'élément supprimé</th>
                  <th style={{ width: '15%' }}>Date Suppression</th>
                  <th style={{ width: '15%' }}>Supprimé par</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const badge = getEntityBadgeStyle(item.entityName);
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="entity-badge" style={{ backgroundColor: badge.bg, color: badge.color, borderColor: badge.border }}>
                          <i className={getEntityIcon(item.entityName)} style={{ marginRight: '6px' }}></i>
                          {formatEntityType(item.entityName)}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#1e293b' }}>{item.displayName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>ID original: #{item.entityId}</div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {new Date(item.deletedAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: '500' }}>
                          <i className="fas fa-user" style={{ fontSize: '0.75rem', marginRight: '5px', color: '#94a3b8' }}></i>
                          {item.deletedBy || 'Admin'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="action-btn-rec btn-restore"
                            title="Restaurer l'élément"
                            onClick={() => setConfirmModal({ show: true, itemId: item.id, action: 'restore', entityName: item.displayName })}
                          >
                            <i className="fas fa-undo"></i> Restaurer
                          </button>
                          <button
                            className="action-btn-rec btn-purge"
                            title="Supprimer définitivement"
                            onClick={() => setConfirmModal({ show: true, itemId: item.id, action: 'purge', entityName: item.displayName })}
                          >
                            <i className="fas fa-trash-alt"></i> Purger
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', marginTop: '20px' }}>
            <i className="fas fa-trash-restore-alt" style={{ fontSize: '3rem', marginBottom: '16px', color: '#cbd5e1' }}></i>
            <h4 style={{ margin: '0 0 6px 0', color: '#475569' }}>L'espace de récupération est vide</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Aucun élément supprimé trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Corbeille;
