import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';

const CarteMutuelle = () => {
  const { user } = useAuth();
  const [cartes, setCartes] = useState([]);
  const [agents, setAgents] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentCarte, setCurrentCarte] = useState(null);
  const [viewCarte, setViewCarte] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const API_URL = 'http://localhost:8081/api/cartes';
  const AGENT_API_URL = 'http://localhost:8081/api/agents';
  const BENE_API_URL = 'http://localhost:8081/api/beneficiaires';

  const showAlert = (message, type = 'success') => { setAlertModal({ show: true, message, type }); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token || ''}` });

  useEffect(() => { fetchCartes(); fetchAgents(); fetchBeneficiaries(); }, []);

  const fetchCartes = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) setCartes(await response.json());
    } catch (error) { console.error("Erreur cartes", error); }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(AGENT_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setAgents(await response.json());
    } catch (error) { console.error("Erreur agents", error); }
  };

  const fetchBeneficiaries = async () => {
    try {
      const response = await fetch(BENE_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setBeneficiaries(await response.json());
    } catch (error) { console.error("Erreur bénéficiaires", error); }
  };

  const handleAdd = () => {
    setCurrentCarte({ idBeneficiaire: '', typeDemande: 'Adhésion', raisonChangement: '', statut: 'En attente' });
    setSelectedAgentId('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const raw = cartes.find(c => c.idCarte == item.idCarte);
    setCurrentCarte(raw);
    const bene = beneficiaries.find(b => b.idBeneficiaire == raw.idBeneficiaire);
    setSelectedAgentId(bene?.idAgent || '');
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    const raw = cartes.find(c => c.idCarte == item.idCarte);
    setViewCarte({ ...item, ...raw });
    setIsViewModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idCarte}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchCartes(); showAlert('Demande supprimée.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentCarte.idCarte ? 'PUT' : 'POST';
    const url = currentCarte.idCarte ? `${API_URL}/${currentCarte.idCarte}` : API_URL;
    try {
      const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(currentCarte) });
      if (response.ok) { fetchCartes(); setIsModalOpen(false); showAlert('Enregistré.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const handleDecision = async (id, decision) => {
    try {
      const raw = cartes.find(c => c.idCarte == id);
      const updated = { ...raw, statut: decision, dateValidation: new Date().toISOString().split('T')[0] };
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updated)
      });
      if (response.ok) {
        fetchCartes();
        setViewCarte(prev => ({ ...prev, statut: decision }));
        showAlert(`Demande ${decision.toLowerCase()}.`);
      }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const printBulletin = (id) => {
    window.open(`${API_URL}/${id}/bulletin`, '_blank');
  };

  const filteredBeneficiaries = beneficiaries.filter(b => b.idAgent == selectedAgentId);

  const formattedData = cartes.map(item => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    const agent = bene ? agents.find(a => a.idAgent == bene.idAgent) : null;
    return {
      idCarte: item.idCarte,
      matricule: agent ? agent.matricule : 'N/A',
      beneficiaire: bene ? `${bene.nom} ${bene.prenom}` : 'N/A',
      relation: bene ? bene.lienParente : 'N/A',
      type: item.typeDemande,
      date: item.dateDemande ? item.dateDemande.split('T')[0] : '',
      statut: item.statut
    };
  });

  const filteredGridData = formattedData.filter(item => {
    const matchesSearch = item.matricule.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.beneficiaire.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? item.statut === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .mutuelle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-top: 1.5rem;
        }
        .mutuelle-card {
          position: relative;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 250px;
          cursor: pointer;
        }
        .mutuelle-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(0,0,0,0.1);
        }
        .card-header-band {
          padding: 16px 20px;
          color: white;
          position: relative;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .card-header-band::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .card-relation-badge {
          font-size: 0.7rem;
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 6px;
          font-weight: bold;
          color: #ffffff;
        }
        .card-body-section {
          padding: 20px;
          background: #ffffff;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .card-label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .card-value-matricule {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          font-family: 'Courier New', Courier, monospace;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }
        .card-chip-mini {
          width: 32px;
          height: 24px;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          border-radius: 4px;
          position: relative;
          opacity: 0.8;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .card-chip-mini::after {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          right: 4px;
          bottom: 4px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 2px;
        }
        .card-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255,255,255,0.3);
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .card-actions-dark {
          display: flex;
          gap: 8px;
          margin-top: 15px;
          justify-content: flex-end;
          border-top: 1px solid #f1f5f9;
          padding-top: 12px;
        }
        .card-btn-dark {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
        }
        .card-btn-dark:hover {
          background: #f1f5f9;
          color: #1e293b;
          border-color: #cbd5e1;
          transform: scale(1.05);
        }
        .btn-delete-dark {
          color: #ef4444;
          border-color: #fca5a5;
          background: #fef2f2;
        }
        .btn-delete-dark:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #f87171;
        }
        .btn-pdf-dark {
          color: #eab308;
          border-color: #fde047;
          background: #fefce8;
        }
        .btn-pdf-dark:hover {
          background: #fef9c3;
          color: #ca8a04;
          border-color: #facc15;
        }
      `}</style>

      {alertModal.show && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ width: '350px', textAlign: 'center' }}>
            <h3>{alertModal.type === 'success' ? 'Succès !' : 'Erreur'}</h3>
            <p>{alertModal.message}</p>
            <button onClick={() => setAlertModal({ show: false, message: '', type: 'success' })} style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      )}

      {/* Control Panel / View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setViewMode('table')} 
          style={{ 
            padding: '8px 16px', 
            borderRadius: '8px', 
            border: '1px solid #cbd5e1',
            background: viewMode === 'table' ? '#006eb7' : 'white', 
            color: viewMode === 'table' ? 'white' : '#64748b', 
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <i className="fas fa-table"></i> Tableau
        </button>
        <button 
          onClick={() => setViewMode('grid')} 
          style={{ 
            padding: '8px 16px', 
            borderRadius: '8px', 
            border: '1px solid #cbd5e1',
            background: viewMode === 'grid' ? '#006eb7' : 'white', 
            color: viewMode === 'grid' ? 'white' : '#64748b', 
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <i className="fas fa-th-large"></i> Grille
        </button>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          {/* Header for grid mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Gestion Cartes Mutuelle</h2>
            {!user?.roles?.includes('ROLE_CONSULTANT') && (
              <button 
                onClick={handleAdd} 
                style={{ 
                  padding: '10px 20px', 
                  background: '#006eb7', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 10px rgba(0, 110, 183, 0.2)'
                }}
              >
                <i className="fas fa-plus"></i> Nouveau
              </button>
            )}
          </div>

          {/* Filters for Grid view */}
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '1.5rem',
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 250px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Rechercher par matricule, nom..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div style={{ flex: '0 0 200px' }}>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  background: 'white'
                }}
              >
                <option value="">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="Accordée">Accordée</option>
                <option value="Refusée">Refusée</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredGridData.length > 0 ? (
            <div className="mutuelle-grid">
              {filteredGridData.map((item) => {
                const getGradient = (statut) => {
                  if (statut === 'Accordée') return 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)';
                  if (statut === 'Refusée') return 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)';
                  return 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
                };

                const getStatusIcon = (statut) => {
                  if (statut === 'Accordée') return <i className="fas fa-check-circle"></i>;
                  if (statut === 'Refusée') return <i className="fas fa-times-circle"></i>;
                  return <i className="fas fa-clock"></i>;
                };

                return (
                  <div key={item.idCarte} className="mutuelle-card">
                    {/* Card Header Band with status gradient */}
                    <div className="card-header-band" style={{ background: getGradient(item.statut) }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.9 }}>RADEEMA MUTUELLE</span>
                        <div className="card-badge">
                          {getStatusIcon(item.statut)} {item.statut}
                        </div>
                      </div>
                      <div style={{ marginTop: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#ffffff' }}>
                          {item.beneficiaire}
                        </h4>
                        <span className="card-relation-badge">
                          {item.relation}
                        </span>
                      </div>
                    </div>

                    {/* Card Body in Crisp White */}
                    <div className="card-body-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className="card-label">Matricule Agent</div>
                          <div className="card-value-matricule">{item.matricule}</div>
                        </div>
                        <div className="card-chip-mini"></div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                        <div>Type: <span style={{ fontWeight: '500', color: '#334155' }}>{item.type}</span></div>
                        <div>Date: <span style={{ fontWeight: '500', color: '#334155' }}>{item.date}</span></div>
                      </div>

                      {/* Actions */}
                      <div className="card-actions-dark">
                        <button type="button" className="card-btn-dark" onClick={() => handleView(item)} title="Voir détails">
                          <i className="fas fa-eye"></i>
                        </button>
                        {!user?.roles?.includes('ROLE_CONSULTANT') && (
                          <button type="button" className="card-btn-dark" onClick={() => handleEdit(item)} title="Modifier">
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        {!user?.roles?.includes('ROLE_CONSULTANT') && user?.roles?.includes('ROLE_ADMIN') && (
                          <button type="button" className="card-btn-dark btn-delete-dark" onClick={() => handleDelete(item)} title="Supprimer">
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                        {item.statut === 'Accordée' && (
                          <button type="button" className="card-btn-dark btn-pdf-dark" onClick={() => printBulletin(item.idCarte)} title="Imprimer Bulletin">
                            <i className="fas fa-file-pdf"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#94a3b8' }}></i>
              <p style={{ margin: 0 }}>Aucune carte mutuelle ne correspond aux filtres.</p>
            </div>
          )}
        </div>
      ) : (
        <GenericTable
          title="Gestion Cartes Mutuelle"
          columns={['Matricule Agent', 'Bénéficiaire', 'Type Demande', 'Date Demande', 'Statut']}
          data={formattedData}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3>{currentCarte?.idCarte ? 'Modifier Demande' : 'Nouvelle Demande de Carte'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label>Agent (Matricule)</label>
                <select required value={selectedAgentId} onChange={e => { setSelectedAgentId(e.target.value); setCurrentCarte({ ...currentCarte, idBeneficiaire: '' }); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="">Choisir un agent...</option>
                  {agents.map(a => <option key={a.idAgent} value={a.idAgent}>{a.matricule} - {a.nomComplet}</option>)}
                </select>
              </div>
              <div>
                <label>Bénéficiaire</label>
                <select required value={currentCarte?.idBeneficiaire || ''} onChange={e => setCurrentCarte({ ...currentCarte, idBeneficiaire: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} disabled={!selectedAgentId}>
                  <option value="">{selectedAgentId ? 'Choisir un bénéficiaire...' : 'Sélectionnez d\'abord un agent'}</option>
                  {filteredBeneficiaries.map(b => <option key={b.idBeneficiaire} value={b.idBeneficiaire}>{b.nom} {b.prenom} ({b.lienParente})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Type de Demande</label>
                  <select value={currentCarte?.typeDemande || 'Adhésion'} onChange={e => setCurrentCarte({ ...currentCarte, typeDemande: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="Adhésion">Adhésion (Première carte)</option>
                    <option value="Duplicata">Duplicata (Perte/Vol)</option>
                    <option value="Changement">Changement (Données)</option>
                  </select>
                </div>
                <div>
                  <label>Statut</label>
                  <select value={currentCarte?.statut || 'En attente'} onChange={e => setCurrentCarte({ ...currentCarte, statut: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="En attente">En attente</option>
                    <option value="Accordée">Accordée</option>
                    <option value="Refusée">Refusée</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Raison (si duplicata/changement)</label>
                <textarea value={currentCarte?.raisonChangement || ''} onChange={e => setCurrentCarte({ ...currentCarte, raisonChangement: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#edf2f7' }}>Annuler</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#006eb7', color: 'white', fontWeight: 'bold' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && viewCarte && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3>Détails de la demande #{viewCarte.idCarte}</h3>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <p><strong>Agent :</strong> {viewCarte.matricule}</p>
                <p><strong>Bénéficiaire :</strong> {viewCarte.beneficiaire}</p>
                <p><strong>Type :</strong> {viewCarte.type}</p>
              </div>
              <div>
                <p><strong>Date Demande :</strong> {viewCarte.date}</p>
                <p><strong>Statut :</strong> <span style={{ color: viewCarte.statut === 'Accordée' ? '#10b981' : viewCarte.statut === 'Refusée' ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>{viewCarte.statut}</span></p>
              </div>
            </div>

            {viewCarte.raisonChangement && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <p><strong>Raison/Observation :</strong></p>
                <p>{viewCarte.raisonChangement}</p>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {viewCarte.statut === 'En attente' && (
                <>
                  <button onClick={() => handleDecision(viewCarte.idCarte, 'Accordée')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                    <i className="fas fa-check"></i> Accorder
                  </button>
                  <button onClick={() => handleDecision(viewCarte.idCarte, 'Refusée')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                    <i className="fas fa-times"></i> Refuser
                  </button>
                </>
              )}

              {viewCarte.statut === 'Accordée' && (
                <button onClick={() => printBulletin(viewCarte.idCarte)} style={{ padding: '12px 30px', borderRadius: '8px', border: 'none', background: '#006eb7', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-file-pdf"></i> Imprimer Bulletin d'Adhésion
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarteMutuelle;

