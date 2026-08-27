import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';

const Beneficiaires = () => {
  const { user } = useAuth();
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBene, setCurrentBene] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  const API_URL = 'http://localhost:8081/api/beneficiaires';
  const AGENT_API_URL = 'http://localhost:8081/api/agents';

  const showAlert = (message, type = 'success') => { setAlertModal({ show: true, message, type }); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token || ''}` });

  useEffect(() => { fetchBeneficiaires(); fetchAgents(); }, []);

  const fetchBeneficiaires = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) setBeneficiaires(await response.json());
    } catch (error) { console.error("Erreur bénéficiaires", error); }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(AGENT_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setAgents(await response.json());
    } catch (error) { console.error("Erreur agents", error); }
  };

  const handleAdd = () => {
    setCurrentBene({ nom: '', prenom: '', lienParente: 'Conjoint', dateNaissance: '', idAgent: '', estSalarie: null, lieuNaissance: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const raw = beneficiaires.find(b => b.idBeneficiaire == item.idBeneficiaire);
    setCurrentBene(raw);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idBeneficiaire}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchBeneficiaires(); showAlert('Bénéficiaire supprimé.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentBene.idBeneficiaire ? 'PUT' : 'POST';
    const url = currentBene.idBeneficiaire ? `${API_URL}/${currentBene.idBeneficiaire}` : API_URL;
    try {
      const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(currentBene) });
      if (response.ok) { fetchBeneficiaires(); setIsModalOpen(false); showAlert('Enregistré.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const formattedData = beneficiaires.map(item => {
    const agent = agents.find(a => a.idAgent == item.idAgent);
    let parentalLink = item.lienParente;
    if (item.lienParente === 'Conjoint') {
      const salarieInfo = item.estSalarie !== null && item.estSalarie !== undefined 
        ? ` (${item.estSalarie ? 'Salarié' : 'Non Salarié'}` 
        : '';
      const birthPlaceInfo = item.lieuNaissance 
        ? (salarieInfo ? ` - Né(e) à ${item.lieuNaissance}` : ` (Né(e) à ${item.lieuNaissance}`)
        : '';
      const closure = salarieInfo || birthPlaceInfo ? ')' : '';
      parentalLink += `${salarieInfo}${birthPlaceInfo}${closure}`;
    }
    return {
      idBeneficiaire: item.idBeneficiaire,
      nom: item.nom,
      prenom: item.prenom,
      lienParente: parentalLink,
      agent: agent ? agent.nomComplet : 'N/A'
    };
  });

  return (
    <div style={{ position: 'relative' }}>
      {alertModal.show && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ width: '350px', textAlign: 'center' }}>
            <h3>{alertModal.type === 'success' ? 'Succès !' : 'Erreur'}</h3>
            <p>{alertModal.message}</p>
            <button onClick={() => setAlertModal({ show: false, message: '', type: 'success' })} style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      )}
      <GenericTable title="Gestion des Bénéficiaires" columns={['Nom', 'Prénom', 'Lien Parenté', 'Agent Rattaché']} data={formattedData} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3>{currentBene?.idBeneficiaire ? 'Modifier' : 'Nouveau'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Nom</label>
                  <input required type="text" value={currentBene?.nom || ''} onChange={e => setCurrentBene({ ...currentBene, nom: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label>Prénom</label>
                  <input required type="text" value={currentBene?.prenom || ''} onChange={e => setCurrentBene({ ...currentBene, prenom: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>
              <div>
                <label>Agent Rattaché</label>
                <select required value={currentBene?.idAgent || ''} onChange={e => setCurrentBene({ ...currentBene, idAgent: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="">Choisir un agent...</option>
                  {agents.map(a => <option key={a.idAgent} value={a.idAgent}>{a.nomComplet} ({a.matricule})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Lien Parenté</label>
                  <select value={currentBene?.lienParente || 'Conjoint'} onChange={e => {
                    const val = e.target.value;
                    setCurrentBene({ ...currentBene, lienParente: val, estSalarie: val === 'Conjoint' ? (currentBene.estSalarie ?? false) : null, lieuNaissance: val === 'Conjoint' ? (currentBene.lieuNaissance ?? '') : '' });
                  }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="Conjoint">Conjoint</option>
                    <option value="Enfant">Enfant</option>
                  </select>
                </div>
                <div>
                  <label>Date Naissance</label>
                  <input type="date" value={currentBene?.dateNaissance ? currentBene.dateNaissance.split('T')[0] : ''} onChange={e => setCurrentBene({ ...currentBene, dateNaissance: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              {currentBene?.lienParente === 'Conjoint' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>Est-elle salarié(e) ?</label>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="radio" checked={currentBene?.estSalarie === true} onChange={() => setCurrentBene({ ...currentBene, estSalarie: true })} /> Oui
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="radio" checked={currentBene?.estSalarie === false} onChange={() => setCurrentBene({ ...currentBene, estSalarie: false })} /> Non
                      </label>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.9rem' }}>Lieu de naissance</label>
                    <input type="text" placeholder="Lieu de naissance" value={currentBene?.lieuNaissance || ''} onChange={e => setCurrentBene({ ...currentBene, lieuNaissance: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.95rem' }} />
                  </div>
                </div>
              )}

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
export default Beneficiaires;
