import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';

// Modal de détail pour la Direction
const DetailModal = ({ open, onClose, data }) => {
  if (!open || !data) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0005', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, minWidth: 420, maxWidth: 700, margin: '40px 0', boxShadow: '0 8px 32px #0002', width: '100%' }}>
        <div style={{ background: '#006eb7', color: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '18px 28px 12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 26, fontWeight: 700 }}>Détail Direction</span>
          <span style={{ cursor: 'pointer', fontSize: 22, fontWeight: 700 }} onClick={onClose} title="Fermer">×</span>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Informations de la Direction</div>
              <div style={{ marginBottom: 8 }}><b>Code:</b> {data.code}</div>
              <div><b>Nom:</b> {data.nom}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Direction = () => {
  const { user } = useAuth();
  const [directions, setDirections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDir, setCurrentDir] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const API_URL = 'http://localhost:8081/api/directions';

  const showAlert = (message, type = 'success') => {
    setAlertModal({ show: true, message, type });
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  useEffect(() => {
    fetchDirections();
  }, []);

  const fetchDirections = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        setDirections(await response.json());
      }
    } catch (error) {
      console.error("Erreur récupération directions", error);
    }
  };

  const handleAdd = () => {
    setCurrentDir({
      nom: '',
      code: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setCurrentDir(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idDirection}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchDirections();
        showAlert('Direction supprimée.');
      } else if (response.status === 409) {
        const errMsg = await response.text();
        showAlert(errMsg || 'Impossible de supprimer cette direction car elle est liée à d\'autres structures.', 'error');
      } else {
        showAlert('Erreur lors de la suppression.', 'error');
      }
    } catch (error) {
      showAlert('Erreur réseau lors de la suppression.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentDir.idDirection ? 'PUT' : 'POST';
    const url = currentDir.idDirection ? `${API_URL}/${currentDir.idDirection}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(currentDir)
      });
      if (response.ok) {
        fetchDirections();
        setIsModalOpen(false);
        showAlert(`Direction ${currentDir.idDirection ? 'modifiée' : 'ajoutée'} avec succès !`);
      } else {
        showAlert('Erreur lors de la sauvegarde.', 'error');
      }
    } catch (error) {
      showAlert('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const formattedData = directions.map(item => ({
    idDirection: item.idDirection,
    code: item.code,
    nom: item.nom
  }));

  return (
    <div style={{ position: 'relative' }}>
      {alertModal.show && (
        <div className="modal-overlay" style={{ zIndex: 3500 }}>
          <div className="modal-content" style={{ width: '350px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: alertModal.type === 'success' ? '#10b981' : '#ef4444', marginBottom: '1rem' }}>
              <i className={`fas ${alertModal.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </div>
            <h3>{alertModal.type === 'success' ? 'Succès !' : 'Erreur'}</h3>
            <p style={{ margin: '1rem 0' }}>{alertModal.message}</p>
            <button onClick={() => setAlertModal({ show: false, message: '', type: 'success' })} style={{ padding: '10px 24px', background: alertModal.type === 'success' ? '#10b981' : '#ef4444', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', border: 'none' }}>OK</button>
          </div>
        </div>
      )}

      <GenericTable
        title="Gestion des Directions"
        columns={['Code', 'Nom']}
        data={formattedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={item => setDetailModal({ show: true, data: item })}
      />
      <DetailModal open={detailModal.show} data={detailModal.data} onClose={() => setDetailModal({ show: false, data: null })} />

      {isModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 2500 }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ borderBottom: '2px solid #006eb7', paddingBottom: '10px' }}>
              {currentDir?.idDirection ? 'Modifier Direction' : 'Nouvelle Direction'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Code</label>
                <input required type="text" value={currentDir?.code || ''} onChange={e => setCurrentDir({ ...currentDir, code: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Nom de la Direction</label>
                <input required type="text" value={currentDir?.nom || ''} onChange={e => setCurrentDir({ ...currentDir, nom: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#edf2f7', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#006eb7', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Direction;
