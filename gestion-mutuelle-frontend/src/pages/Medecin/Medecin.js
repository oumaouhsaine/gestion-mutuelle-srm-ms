
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
          <span style={{ fontSize: 26, fontWeight: 700 }}>Médecin</span>
          <span style={{ cursor: 'pointer', fontSize: 22, fontWeight: 700 }} onClick={onClose} title="Fermer">×</span>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Informations</div>
              <div><b>Nom:</b> {data.nom}</div>
              <div><b>Prénom:</b> {data.prenom}</div>
              <div><b>Spécialité:</b> {data.specialite}</div>
              <div><b>Conventionné:</b> {data.convention}</div>
              <div><b>Téléphone:</b> {data.telephone}</div>
              <div><b>Établissement:</b> {data.etablissement}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Medecin = () => {
  const { user } = useAuth();
  const [medecins, setMedecins] = useState([]);
  const [etablissements, setEtablissements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedecin, setCurrentMedecin] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const API_URL = 'http://localhost:8081/api/medecins';
  const ETAB_API_URL = 'http://localhost:8081/api/etablissements';

  const showAlert = (message, type = 'success') => {
    setAlertModal({ show: true, message, type });
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  useEffect(() => {
    fetchMedecins();
    fetchEtablissements();
  }, []);

  const fetchMedecins = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) setMedecins(await response.json());
    } catch (error) { console.error("Erreur récupération médecins", error); }
  };

  const fetchEtablissements = async () => {
    try {
      const response = await fetch(ETAB_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setEtablissements(await response.json());
    } catch (error) { console.error("Erreur récupération établissements", error); }
  };

  const handleAdd = () => {
    setCurrentMedecin({
      nom: '',
      prenom: '',
      specialite: '',
      convention: 1,
      telephone: '',
      email: '',
      idEtablissement: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setCurrentMedecin(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idMedecin}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchMedecins();
        showAlert('Médecin supprimé.');
      }
    } catch (error) { showAlert('Erreur lors de la suppression.', 'error'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentMedecin.idMedecin ? 'PUT' : 'POST';
    const url = currentMedecin.idMedecin ? `${API_URL}/${currentMedecin.idMedecin}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(currentMedecin)
      });
      if (response.ok) {
        fetchMedecins();
        setIsModalOpen(false);
        showAlert(`Médecin ${currentMedecin.idMedecin ? 'modifié' : 'ajouté'} avec succès !`);
      }
    } catch (error) { showAlert('Erreur lors de la sauvegarde.', 'error'); }
  };

  const formattedData = medecins.map(item => ({
    idMedecin: item.idMedecin,
    nom: item.nom,
    prenom: item.prenom,
    specialite: item.specialite,
    convention: item.convention === 1 ? 'Oui' : 'Non',
    telephone: item.telephone,
    etablissement: etablissements.find(e => e.idEtablissement == item.idEtablissement)?.raisonSociale || 'N/A'
  }));

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
        title="Gestion des Médecins"
        columns={['Nom', 'Prénom', 'Spécialité', 'Conventionné', 'Téléphone', 'Établissement']}
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
            <h3 style={{ borderBottom: '2px solid #006eb7', paddingBottom: '10px' }}>
              {currentMedecin?.idMedecin ? 'Modifier Médecin' : 'Nouveau Médecin'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Nom</label>
                  <input required type="text" value={currentMedecin?.nom || ''} onChange={e => setCurrentMedecin({ ...currentMedecin, nom: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Prénom</label>
                  <input required type="text" value={currentMedecin?.prenom || ''} onChange={e => setCurrentMedecin({ ...currentMedecin, prenom: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Spécialité</label>
                <input required type="text" value={currentMedecin?.specialite || ''} onChange={e => setCurrentMedecin({ ...currentMedecin, specialite: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Téléphone</label>
                  <input type="text" value={currentMedecin?.telephone || ''} onChange={e => setCurrentMedecin({ ...currentMedecin, telephone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Conventionné</label>
                  <select value={currentMedecin?.convention || 1} onChange={e => setCurrentMedecin({ ...currentMedecin, convention: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value={1}>Oui</option>
                    <option value={0}>Non</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Établissement</label>
                <select required value={currentMedecin?.idEtablissement || ''} onChange={e => setCurrentMedecin({ ...currentMedecin, idEtablissement: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="">Choisir un établissement</option>
                  {etablissements.map(etab => <option key={etab.idEtablissement} value={etab.idEtablissement}>{etab.raisonSociale}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
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

export default Medecin;
