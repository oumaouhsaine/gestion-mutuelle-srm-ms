import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';

// Modal de détail pour le Service
const DetailModal = ({ open, onClose, data, divisions, departements, directions }) => {
  if (!open || !data) return null;
  const div = divisions.find(d => d.idDivision === data.idDivision);
  const dep = div ? departements.find(d => d.idDepartement === div.idDepartement) : null;
  const dir = dep ? directions.find(d => d.idDirection === dep.idDirection) : null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0005', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, minWidth: 420, maxWidth: 700, margin: '40px 0', boxShadow: '0 8px 32px #0002', width: '100%' }}>
        <div style={{ background: '#006eb7', color: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '18px 28px 12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 26, fontWeight: 700 }}>Détail Service</span>
          <span style={{ cursor: 'pointer', fontSize: 22, fontWeight: 700 }} onClick={onClose} title="Fermer">×</span>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Informations du Service</div>
              <div style={{ marginBottom: 8 }}><b>Code:</b> {data.code}</div>
              <div style={{ marginBottom: 8 }}><b>Nom:</b> {data.nom}</div>
              <div style={{ marginBottom: 8 }}><b>Division Parente:</b> {div ? `${div.nom} (${div.code})` : 'Inconnue'}</div>
              <div style={{ marginBottom: 8 }}><b>Département Parent:</b> {dep ? `${dep.nom} (${dep.code})` : 'Inconnu'}</div>
              <div><b>Direction Parente:</b> {dir ? `${dir.nom} (${dir.code})` : 'Inconnue'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Service = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [directions, setDirections] = useState([]);
  
  const [selectedDirectionId, setSelectedDirectionId] = useState('');
  const [selectedDepartementId, setSelectedDepartementId] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSvc, setCurrentSvc] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const API_URL = 'http://localhost:8081/api/services';
  const DIVISIONS_API_URL = 'http://localhost:8081/api/divisions';
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
      const divResponse = await fetch(DIVISIONS_API_URL, { headers: getAuthHeaders() });
      const svcResponse = await fetch(API_URL, { headers: getAuthHeaders() });
      if (dirResponse.ok && depResponse.ok && divResponse.ok && svcResponse.ok) {
        setDirections(await dirResponse.json());
        setDepartements(await depResponse.json());
        setDivisions(await divResponse.json());
        setServices(await svcResponse.json());
      }
    } catch (error) {
      console.error("Erreur récupération données", error);
    }
  };

  const handleAdd = () => {
    const firstDir = directions[0]?.idDirection || '';
    const filteredDeps = departements.filter(d => d.idDirection === firstDir);
    const firstDep = filteredDeps[0]?.idDepartement || '';
    const filteredDivs = divisions.filter(d => d.idDepartement === firstDep);
    
    setSelectedDirectionId(firstDir);
    setSelectedDepartementId(firstDep);
    setCurrentSvc({
      nom: '',
      code: '',
      idDivision: filteredDivs[0]?.idDivision || ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const div = divisions.find(d => d.idDivision === item.idDivision);
    const dep = div ? departements.find(d => d.idDepartement === div.idDepartement) : null;
    setSelectedDirectionId(dep ? dep.idDirection : '');
    setSelectedDepartementId(dep ? dep.idDepartement : '');
    setCurrentSvc(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idService}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchData();
        showAlert('Service supprimé.');
      } else if (response.status === 409) {
        const errMsg = await response.text();
        showAlert(errMsg || 'Impossible de supprimer ce service car il est lié à d\'autres structures.', 'error');
      } else {
        showAlert('Erreur lors de la suppression.', 'error');
      }
    } catch (error) {
      showAlert('Erreur réseau lors de la suppression.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentSvc.idService ? 'PUT' : 'POST';
    const url = currentSvc.idService ? `${API_URL}/${currentSvc.idService}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(currentSvc)
      });
      if (response.ok) {
        fetchData();
        setIsModalOpen(false);
        showAlert(`Service ${currentSvc.idService ? 'modifié' : 'ajouté'} avec succès !`);
      } else {
        showAlert('Erreur lors de la sauvegarde.', 'error');
      }
    } catch (error) {
      showAlert('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const handleDirectionChange = (dirId) => {
    const numericDirId = Number(dirId);
    setSelectedDirectionId(numericDirId);
    
    const filteredDeps = departements.filter(d => d.idDirection === numericDirId);
    const firstDep = filteredDeps[0]?.idDepartement || '';
    setSelectedDepartementId(firstDep);

    const filteredDivs = divisions.filter(d => d.idDepartement === firstDep);
    setCurrentSvc({
      ...currentSvc,
      idDivision: filteredDivs[0]?.idDivision || ''
    });
  };

  const handleDepartementChange = (depId) => {
    const numericDepId = Number(depId);
    setSelectedDepartementId(numericDepId);

    const filteredDivs = divisions.filter(d => d.idDepartement === numericDepId);
    setCurrentSvc({
      ...currentSvc,
      idDivision: filteredDivs[0]?.idDivision || ''
    });
  };

  const formattedData = services.map(item => {
    const div = divisions.find(d => d.idDivision === item.idDivision);
    const dep = div ? departements.find(d => d.idDepartement === div.idDepartement) : null;
    const dir = dep ? directions.find(d => d.idDirection === dep.idDirection) : null;
    return {
      idService: item.idService,
      idDivision: item.idDivision,
      code: item.code,
      nom: item.nom,
      division: div ? `${div.nom} (${div.code})` : 'Inconnu',
      departement: dep ? `${dep.nom} (${dep.code})` : 'Inconnu',
      direction: dir ? `${dir.nom} (${dir.code})` : 'Inconnu'
    };
  });

  const availableDepartements = departements.filter(d => d.idDirection === Number(selectedDirectionId));
  const availableDivisions = divisions.filter(d => d.idDepartement === Number(selectedDepartementId));

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
        title="Gestion des Services"
        columns={['Code', 'Nom', 'Division', 'Département', 'Direction']}
        data={formattedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={item => setDetailModal({ show: true, data: item })}
      />
      <DetailModal open={detailModal.show} data={detailModal.data} divisions={divisions} departements={departements} directions={directions} onClose={() => setDetailModal({ show: false, data: null })} />

      {isModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 2500 }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ borderBottom: '2px solid #006eb7', paddingBottom: '10px' }}>
              {currentSvc?.idService ? 'Modifier Service' : 'Nouveau Service'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Code</label>
                <input required type="text" value={currentSvc?.code || ''} onChange={e => setCurrentSvc({ ...currentSvc, code: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Nom du Service</label>
                <input required type="text" value={currentSvc?.nom || ''} onChange={e => setCurrentSvc({ ...currentSvc, nom: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
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
                <select required value={selectedDepartementId} onChange={e => handleDepartementChange(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                  <option value="" disabled>Choisir un département</option>
                  {availableDepartements.map(dep => (
                    <option key={dep.idDepartement} value={dep.idDepartement}>{dep.nom} ({dep.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Division Parente</label>
                <select required value={currentSvc?.idDivision || ''} onChange={e => setCurrentSvc({ ...currentSvc, idDivision: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                  <option value="" disabled>Choisir une division</option>
                  {availableDivisions.map(div => (
                    <option key={div.idDivision} value={div.idDivision}>{div.nom} ({div.code})</option>
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

export default Service;
