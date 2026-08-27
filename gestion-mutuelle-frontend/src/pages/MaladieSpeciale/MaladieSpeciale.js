
import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';

// Modal de détail pour le bouton œil
const DetailModal = ({ open, onClose, data }) => {
  if (!open || !data) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal-content" style={{ maxWidth: 420, padding: 32, borderRadius: 16, background: '#fff', boxShadow: '0 8px 32px #0002' }}>
        <h2 style={{ marginBottom: 20, color: '#006eb7', fontWeight: 700 }}>Détail Maladie Spéciale</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Matricule Agent</div>
            <div style={{ fontWeight: 600 }}>{data.matricule}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Bénéficiaire</div>
            <div style={{ fontWeight: 600 }}>{data.beneficiaire}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Type Maladie</div>
            <div style={{ fontWeight: 600 }}>{data.type}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b' }}>État</div>
            <div style={{ fontWeight: 600 }}>{data.etat}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Date Dépôt</div>
            <div style={{ fontWeight: 600 }}>{data.dateDepot}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} style={{ padding: '8px 24px', borderRadius: 8, background: '#006eb7', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

const MaladieSpeciale = () => {
  const { user } = useAuth();
  const [maladies, setMaladies] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMal, setCurrentMal] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const API_URL = 'http://localhost:8081/api/maladies-speciales';
  const BENE_API_URL = 'http://localhost:8081/api/beneficiaires';
  const AGENT_API_URL = 'http://localhost:8081/api/agents';

  const showAlert = (message, type = 'success') => { setAlertModal({ show: true, message, type }); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token || ''}` });

  useEffect(() => {
    fetchMaladies();
    fetchBeneficiaries();
    fetchAgents();
  }, []);

  const fetchMaladies = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) setMaladies(await response.json());
    } catch (error) { console.error("Erreur maladies", error); }
  };

  const fetchBeneficiaries = async () => {
    try {
      const response = await fetch(BENE_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setBeneficiaries(await response.json());
    } catch (error) { console.error("Erreur bénéficiaires", error); }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(AGENT_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setAgents(await response.json());
    } catch (error) { console.error("Erreur agents", error); }
  };

  const handleAdd = () => {
    setCurrentMal({ idBeneficiaire: '', type: '', etatMaladie: 'En cours', dateDepot: new Date().toISOString().split('T')[0], observation: '' });
    setSelectedAgentId('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const raw = maladies.find(m => m.idMaladie == item.idMaladie);
    setCurrentMal(raw);
    const bene = beneficiaries.find(b => b.idBeneficiaire == raw.idBeneficiaire);
    setSelectedAgentId(bene?.idAgent || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idMaladie}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchMaladies(); showAlert('Supprimé.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentMal.idMaladie ? 'PUT' : 'POST';
    const url = currentMal.idMaladie ? `${API_URL}/${currentMal.idMaladie}` : API_URL;
    try {
      const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(currentMal) });
      if (response.ok) { fetchMaladies(); setIsModalOpen(false); showAlert('Enregistré.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => b.idAgent == selectedAgentId);

  const formattedData = maladies.map(item => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    const agent = bene ? agents.find(a => a.idAgent == bene.idAgent) : null;
    return {
      idMaladie: item.idMaladie,
      matricule: agent ? agent.matricule : 'N/A',
      beneficiaire: bene ? `${bene.nom} ${bene.prenom}` : 'N/A',
      type: item.type,
      etat: item.etatMaladie,
      dateDepot: item.dateDepot ? item.dateDepot.split('T')[0] : ''
    };
  });

  return (
    <div style={{ position: 'relative' }}>
      {alertModal.show && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ width: '350px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: alertModal.type === 'success' ? '#10b981' : '#ef4444', marginBottom: '1rem' }}>
              <i className={`fas ${alertModal.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </div>
            <h3>{alertModal.type === 'success' ? 'Succès !' : 'Erreur'}</h3>
            <p>{alertModal.message}</p>
            <button onClick={() => setAlertModal({ show: false, message: '', type: 'success' })} style={{ padding: '10px 24px', background: alertModal.type === 'success' ? '#10b981' : '#ef4444', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', border: 'none' }}>OK</button>
          </div>
        </div>
      )}
      <GenericTable
        title="Gestion Maladies Spéciales"
        columns={['Matricule Agent', 'Bénéficiaire', 'Type Maladie', 'État', 'Date Dépôt']}
        data={formattedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={item => setDetailModal({ show: true, data: item })}
      />
      <DetailModal open={detailModal.show} data={detailModal.data} onClose={() => setDetailModal({ show: false, data: null })} />
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3>{currentMal?.idMaladie ? 'Modifier' : 'Nouveau'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label>Agent (Matricule)</label>
                <select required value={selectedAgentId} onChange={e => { setSelectedAgentId(e.target.value); setCurrentMal({ ...currentMal, idBeneficiaire: '' }); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="">Choisir un agent...</option>
                  {agents.map(a => <option key={a.idAgent} value={a.idAgent}>{a.matricule} - {a.nomComplet}</option>)}
                </select>
              </div>

              <div>
                <label>Bénéficiaire</label>
                <select required value={currentMal?.idBeneficiaire || ''} onChange={e => setCurrentMal({ ...currentMal, idBeneficiaire: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} disabled={!selectedAgentId}>
                  <option value="">{selectedAgentId ? 'Choisir un bénéficiaire...' : 'Sélectionnez d\'abord un agent'}</option>
                  {filteredBeneficiaries.map(b => <option key={b.idBeneficiaire} value={b.idBeneficiaire}>{b.nom} {b.prenom} ({b.lienParente})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Type Maladie</label>
                  <input required type="text" value={currentMal?.type || ''} onChange={e => setCurrentMal({ ...currentMal, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label>État</label>
                  <select value={currentMal?.etatMaladie || 'En cours'} onChange={e => setCurrentMal({ ...currentMal, etatMaladie: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="En cours">En cours</option>
                    <option value="Stabilisé">Stabilisé</option>
                    <option value="Guéri">Guéri</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Date Dépôt</label>
                <input required type="date" value={currentMal?.dateDepot || ''} onChange={e => setCurrentMal({ ...currentMal, dateDepot: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#edf2f7' }}>Annuler</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#006eb7', color: 'white', fontWeight: 'bold' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MaladieSpeciale;
