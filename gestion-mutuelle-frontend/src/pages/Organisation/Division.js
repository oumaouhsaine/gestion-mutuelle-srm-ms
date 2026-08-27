import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';

// Modal de détail pour la Division
const DetailModal = ({ open, onClose, data, departements, directions }) => {
  if (!open || !data) return null;
  const dep = departements.find(d => d.idDepartement === data.idDepartement);
  const dir = dep ? directions.find(d => d.idDirection === dep.idDirection) : null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0005', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, minWidth: 420, maxWidth: 700, margin: '40px 0', boxShadow: '0 8px 32px #0002', width: '100%' }}>
        <div style={{ background: '#006eb7', color: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '18px 28px 12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 26, fontWeight: 700 }}>Détail Division</span>
          <span style={{ cursor: 'pointer', fontSize: 22, fontWeight: 700 }} onClick={onClose} title="Fermer">×</span>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Informations de la Division</div>
              <div style={{ marginBottom: 8 }}><b>Code:</b> {data.code}</div>
              <div style={{ marginBottom: 8 }}><b>Nom:</b> {data.nom}</div>
              <div style={{ marginBottom: 8 }}><b>Département Parent:</b> {dep ? `${dep.nom} (${dep.code})` : 'Inconnu'}</div>
              <div><b>Direction Parente:</b> {dir ? `${dir.nom} (${dir.code})` : 'Inconnue'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Division = () => {
  const { user } = useAuth();
  const [divisions, setDivisions] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [directions, setDirections] = useState([]);
  const [selectedDirectionId, setSelectedDirectionId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDiv, setCurrentDiv] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const API_URL = 'http://localhost:8081/api/divisions';
  const DEPARTEMENTS_API_URL = 'http://localhost:8081/api/departements';
  const DIRECTIONS_API_URL = 'http://localhost:8081/api/directions';

  const showAlert = (message, type = 'success') => {
    setAlertModal({ show: true, message, type });
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const dirResponse = await fetch(DIRECTIONS_API_URL, { headers: getAuthHeaders() });
      const depResponse = await fetch(DEPARTEMENTS_API_URL, { headers: getAuthHeaders() });
      const divResponse = await fetch(API_URL, { headers: getAuthHeaders() });
      if (dirResponse.ok && depResponse.ok && divResponse.ok) {
        setDirections(await dirResponse.json());
        setDepartements(await depResponse.json());
        setDivisions(await divResponse.json());
      }
    } catch (error) {
      console.error("Erreur récupération données", error);
    }
  };

  const handleAdd = () => {
    const firstDir = directions[0]?.idDirection || '';
    const filteredDeps = departements.filter(d => d.idDirection === firstDir);
    setSelectedDirectionId(firstDir);
    setCurrentDiv({
      nom: '',
      code: '',
      idDepartement: filteredDeps[0]?.idDepartement || ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const dep = departements.find(d => d.idDepartement === item.idDepartement);
    setSelectedDirectionId(dep ? dep.idDirection : '');
    setCurrentDiv(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idDivision}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchData();
        showAlert('Division supprimée.');
      } else if (response.status === 409) {
        const errMsg = await response.text();
        showAlert(errMsg || 'Impossible de supprimer cette division car elle est liée à d\'autres structures.', 'error');
      } else {
        showAlert('Erreur lors de la suppression.', 'error');
      }
    } catch (error) {
      showAlert('Erreur réseau lors de la suppression.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentDiv.idDivision ? 'PUT' : 'POST';
    const url = currentDiv.idDivision ? `${API_URL}/${currentDiv.idDivision}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(currentDiv)
      });
      if (response.ok) {
        fetchData();
        setIsModalOpen(false);
        showAlert(`Division ${currentDiv.idDivision ? 'modifiée' : 'ajoutée'} avec succès !`);
      } else {
        showAlert('Erreur lors de la sauvegarde.', 'error');
      }
    } catch (error) {
      showAlert('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDirectionChange = (dirId) => {
    const numericId = Number(dirId);
    setSelectedDirectionId(numericId);
    const filteredDeps = departements.filter(d => d.idDirection === numericId);
    setCurrentDiv({
      ...currentDiv,
      idDepartement: filteredDeps[0]?.idDepartement || ''
    });
  };

  const formattedData = divisions.map(item => {
    const dep = departements.find(d => d.idDepartement === item.idDepartement);
    const dir = dep ? directions.find(d => d.idDirection === dep.idDirection) : null;
    return {
      idDivision: item.idDivision,
      idDepartement: item.idDepartement,
      code: item.code,
      nom: item.nom,
      departement: dep ? `${dep.nom} (${dep.code})` : 'Inconnu',
      direction: dir ? `${dir.nom} (${dir.code})` : 'Inconnu'
    };
  });

  const availableDepartements = departements.filter(d => d.idDirection === Number(selectedDirectionId));

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
        title="Gestion des Divisions"
        columns={['Code', 'Nom', 'Département', 'Direction']}
        data={formattedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={item => setDetailModal({ show: true, data: item })}
      />
      <DetailModal open={detailModal.show} data={detailModal.data} departements={departements} directions={directions} onClose={() => setDetailModal({ show: false, data: null })} />

      {isModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 2500 }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ borderBottom: '2px solid #006eb7', paddingBottom: '10px' }}>
              {currentDiv?.idDivision ? 'Modifier Division' : 'Nouvelle Division'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Code</label>
                <input required type="text" value={currentDiv?.code || ''} onChange={e => setCurrentDiv({ ...currentDiv, code: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Nom de la Division</label>
                <input required type="text" value={currentDiv?.nom || ''} onChange={e => setCurrentDiv({ ...currentDiv, nom: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Direction Parente</label>
                <select required value={selectedDirectionId} onChange={e => handleDirectionChange(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                  <option value="" disabled>Choisir une direction</option>
                  {directions.map(dir => (
                    <option key={dir.idDirection} value={dir.idDirection}>{dir.nom} ({dir.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Département Parent</label>
                <select required value={currentDiv?.idDepartement || ''} onChange={e => setCurrentDiv({ ...currentDiv, idDepartement: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                  <option value="" disabled>Choisir un département</option>
                  {availableDepartements.map(dep => (
                    <option key={dep.idDepartement} value={dep.idDepartement}>{dep.nom} ({dep.code})</option>
                  ))}
                </select>
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

export default Division;
