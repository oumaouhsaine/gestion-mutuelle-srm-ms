
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
          <span style={{ fontSize: 26, fontWeight: 700 }}>Ordonnance #{data.idOrdonnance}</span>
          <span style={{ cursor: 'pointer', fontSize: 22, fontWeight: 700 }} onClick={onClose} title="Fermer">×</span>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Informations</div>
              <div><b>Bénéficiaire:</b> {data.beneficiaire}</div>
              <div><b>Agent:</b> {data.matricule}</div>
              <div><b>Médecin:</b> {data.medecin}</div>
              <div><b>Date:</b> {data.date}</div>
            </div>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Détails Ordonnance</div>
              <div><b>N° Ordonnance:</b> {data.numeroOrdonnance}</div>
              <div><b>Montant Total:</b> {data.montant}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Ordonnance = () => {
  const { user } = useAuth();
  const [ordonnances, setOrdonnances] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [agents, setAgents] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrd, setCurrentOrd] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const API_URL = 'http://localhost:8081/api/ordonnances';
  const BENE_API_URL = 'http://localhost:8081/api/beneficiaires';
  const AGENT_API_URL = 'http://localhost:8081/api/agents';
  const MED_API_URL = 'http://localhost:8081/api/medecins';

  const showAlert = (message, type = 'success') => { setAlertModal({ show: true, message, type }); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token || ''}` });

  useEffect(() => { 
    fetchOrdonnances(); 
    fetchBeneficiaries(); 
    fetchAgents();
    fetchMedecins();
  }, []);

  const fetchOrdonnances = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) setOrdonnances(await response.json());
    } catch (error) { console.error("Erreur ordonnances", error); }
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

  const fetchMedecins = async () => {
    try {
      const response = await fetch(MED_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setMedecins(await response.json());
    } catch (error) { console.error("Erreur médecins", error); }
  };

  const handleAdd = () => {
    setCurrentOrd({ idBeneficiaire: '', idMedecin: '', dateOrdonnance: new Date().toISOString().split('T')[0], numeroOrdonnance: '', montantTotal: '', observation: '' });
    setSelectedAgentId('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const raw = ordonnances.find(o => o.idOrdonnance == item.idOrdonnance);
    setCurrentOrd(raw);
    const bene = beneficiaries.find(b => b.idBeneficiaire == raw.idBeneficiaire);
    setSelectedAgentId(bene?.idAgent || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idOrdonnance}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchOrdonnances(); showAlert('Supprimée.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentOrd.idOrdonnance ? 'PUT' : 'POST';
    const url = currentOrd.idOrdonnance ? `${API_URL}/${currentOrd.idOrdonnance}` : API_URL;
    try {
      const response = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(currentOrd) });
      if (response.ok) { fetchOrdonnances(); setIsModalOpen(false); showAlert('Enregistré.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => b.idAgent == selectedAgentId);

  const formattedData = ordonnances.map(item => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    const agent = bene ? agents.find(a => a.idAgent == bene.idAgent) : null;
    const med = medecins.find(m => m.idMedecin == item.idMedecin);
    return {
      idOrdonnance: item.idOrdonnance,
      matricule: agent ? agent.matricule : 'N/A',
      numeroOrdonnance: item.numeroOrdonnance,
      beneficiaire: bene ? `${bene.nom} ${bene.prenom}` : 'N/A',
      medecin: med ? `Dr. ${med.nom}` : 'N/A',
      date: item.dateOrdonnance ? item.dateOrdonnance.split('T')[0] : '',
      montant: (item.montantTotal || 0) + ' DH'
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
        title="Gestion des Ordonnances"
        columns={['Matricule Agent', 'N° Ordonnance', 'Bénéficiaire', 'Médecin', 'Date', 'Montant Total']}
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
            <h3>{currentOrd?.idOrdonnance ? 'Modifier Ordonnance' : 'Nouvelle Ordonnance'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label>Agent (Matricule)</label>
                <select required value={selectedAgentId} onChange={e => { setSelectedAgentId(e.target.value); setCurrentOrd({ ...currentOrd, idBeneficiaire: '' }); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="">Choisir un agent...</option>
                  {agents.map(a => <option key={a.idAgent} value={a.idAgent}>{a.matricule} - {a.nomComplet}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Bénéficiaire</label>
                  <select required value={currentOrd?.idBeneficiaire || ''} onChange={e => setCurrentOrd({ ...currentOrd, idBeneficiaire: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} disabled={!selectedAgentId}>
                    <option value="">{selectedAgentId ? 'Choisir un bénéficiaire...' : 'Sélectionnez d\'abord un agent'}</option>
                    {filteredBeneficiaries.map(b => <option key={b.idBeneficiaire} value={b.idBeneficiaire}>{b.nom} {b.prenom}</option>)}
                  </select>
                </div>
                <div>
                  <label>Médecin</label>
                  <select required value={currentOrd?.idMedecin || ''} onChange={e => setCurrentOrd({ ...currentOrd, idMedecin: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="">Choisir un médecin</option>
                    {medecins.map(m => <option key={m.idMedecin} value={m.idMedecin}>Dr. {m.nom} {m.prenom}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>N° Ordonnance</label>
                  <input required type="text" value={currentOrd?.numeroOrdonnance || ''} onChange={e => setCurrentOrd({ ...currentOrd, numeroOrdonnance: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label>Date</label>
                  <input required type="date" value={currentOrd?.dateOrdonnance || ''} onChange={e => setCurrentOrd({ ...currentOrd, dateOrdonnance: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div>
                <label>Montant Total (DH)</label>
                <input required type="number" value={currentOrd?.montantTotal || ''} onChange={e => setCurrentOrd({ ...currentOrd, montantTotal: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
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
export default Ordonnance;
