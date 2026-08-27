
import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';


// Modal de détail stylée pour le bouton œil
const DetailModal = ({ open, onClose, data }) => {
  if (!open || !data) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0005', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, minWidth: 420, maxWidth: 700, margin: '40px 0', boxShadow: '0 8px 32px #0002', width: '100%' }}>
        <div style={{ background: '#006eb7', color: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '18px 28px 12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 26, fontWeight: 700 }}>Analyse #{data.idAnalyse}</span>
          <span style={{ cursor: 'pointer', fontSize: 22, fontWeight: 700 }} onClick={onClose} title="Fermer">×</span>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Informations</div>
              <div><b>Bénéficiaire:</b> {data.beneficiaire}</div>
              <div><b>Agent:</b> {data.matricule}</div>
            </div>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Détails Analyse</div>
              <div><b>Montant Total:</b> {data.total}</div>
            </div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 18 }}>
            <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Observation</div>
            <div>{data.observation || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Analyse = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnalyse, setCurrentAnalyse] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const API_URL = 'http://localhost:8081/api/analyses';
  const BENE_API_URL = 'http://localhost:8081/api/beneficiaires';
  const AGENT_API_URL = 'http://localhost:8081/api/agents';

  const showAlert = (message, type = 'success') => { setAlertModal({ show: true, message, type }); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token || ''}` });

  useEffect(() => {
    fetchAnalyses();
    fetchBeneficiaries();
    fetchAgents();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) setAnalyses(await response.json());
    } catch (error) { console.error("Erreur analyses", error); }
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
    setCurrentAnalyse({ idBeneficiaire: '', observation: '', total: '' });
    setSelectedAgentId('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const raw = analyses.find(a => a.idAnalyse == item.idAnalyse);
    setCurrentAnalyse(raw);
    const bene = beneficiaries.find(b => b.idBeneficiaire == raw.idBeneficiaire);
    setSelectedAgentId(bene?.idAgent || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idAnalyse}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchAnalyses(); showAlert('Supprimé.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentAnalyse.idAnalyse ? 'PUT' : 'POST';
    const url = currentAnalyse.idAnalyse ? `${API_URL}/${currentAnalyse.idAnalyse}` : API_URL;
    try {
      const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(currentAnalyse) });
      if (response.ok) { fetchAnalyses(); setIsModalOpen(false); showAlert('Enregistré.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => b.idAgent == selectedAgentId);

  const formattedData = analyses.map(item => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    const agent = bene ? agents.find(a => a.idAgent == bene.idAgent) : null;
    return {
      idAnalyse: item.idAnalyse,
      matricule: agent ? agent.matricule : 'N/A',
      beneficiaire: bene ? `${bene.nom} ${bene.prenom}` : 'N/A',
      observation: item.observation,
      total: (item.total || 0) + ' DH'
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
        title="Gestion des Analyses"
        columns={['Matricule Agent', 'Bénéficiaire', 'Observation', 'Montant Total']}
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
            <h3>{currentAnalyse?.idAnalyse ? 'Modifier' : 'Nouveau'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label>Agent (Matricule)</label>
                <select required value={selectedAgentId} onChange={e => { setSelectedAgentId(e.target.value); setCurrentAnalyse({ ...currentAnalyse, idBeneficiaire: '' }); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="">Choisir un agent...</option>
                  {agents.map(a => <option key={a.idAgent} value={a.idAgent}>{a.matricule} - {a.nomComplet}</option>)}
                </select>
              </div>

              <div>
                <label>Bénéficiaire</label>
                <select required value={currentAnalyse?.idBeneficiaire || ''} onChange={e => setCurrentAnalyse({ ...currentAnalyse, idBeneficiaire: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} disabled={!selectedAgentId}>
                  <option value="">{selectedAgentId ? 'Choisir un bénéficiaire...' : 'Sélectionnez d\'abord un agent'}</option>
                  {filteredBeneficiaries.map(b => <option key={b.idBeneficiaire} value={b.idBeneficiaire}>{b.nom} {b.prenom} ({b.lienParente})</option>)}
                </select>
              </div>

              <div>
                <label>Montant Total (DH)</label>
                <input required type="number" value={currentAnalyse?.total || ''} onChange={e => setCurrentAnalyse({ ...currentAnalyse, total: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label>Observation</label>
                <textarea value={currentAnalyse?.observation || ''} onChange={e => setCurrentAnalyse({ ...currentAnalyse, observation: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}></textarea>
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
export default Analyse;
