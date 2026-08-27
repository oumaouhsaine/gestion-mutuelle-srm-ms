import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';

// Modal de détail pour l'Entité
const DetailModal = ({ open, onClose, data, services, divisions, departements, directions }) => {
  if (!open || !data) return null;
  const svc = services.find(s => s.idService === data.idService);
  const div = svc ? divisions.find(d => d.idDivision === svc.idDivision) : null;
  const dep = div ? departements.find(d => d.idDepartement === div.idDepartement) : null;
  const dir = dep ? directions.find(d => d.idDirection === dep.idDirection) : null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0005', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, minWidth: 420, maxWidth: 700, margin: '40px 0', boxShadow: '0 8px 32px #0002', width: '100%' }}>
        <div style={{ background: '#006eb7', color: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '18px 28px 12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 26, fontWeight: 700 }}>Détail Entité</span>
          <span style={{ cursor: 'pointer', fontSize: 22, fontWeight: 700 }} onClick={onClose} title="Fermer">×</span>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 18 }}>
              <div style={{ color: '#006eb7', fontWeight: 600, marginBottom: 8 }}>Informations de l'Entité</div>
              <div style={{ marginBottom: 8 }}><b>Nom:</b> {data.nom}</div>
              <div style={{ marginBottom: 8 }}><b>Type:</b> {data.type}</div>
              <div style={{ marginBottom: 8 }}><b>Service Parent:</b> {svc ? `${svc.nom} (${svc.code})` : 'Inconnu'}</div>
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

const Entite = () => {
  const { user } = useAuth();
  const [entites, setEntites] = useState([]);
  const [services, setServices] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [directions, setDirections] = useState([]);
  
  const [selectedDirectionId, setSelectedDirectionId] = useState('');
  const [selectedDepartementId, setSelectedDepartementId] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntite, setCurrentEntite] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [detailModal, setDetailModal] = useState({ show: false, data: null });

  const API_URL = 'http://localhost:8081/api/entites';
  const SERVICES_API_URL = 'http://localhost:8081/api/services';
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
      const svcResponse = await fetch(SERVICES_API_URL, { headers: getAuthHeaders() });
      const entResponse = await fetch(API_URL, { headers: getAuthHeaders() });
      if (dirResponse.ok && depResponse.ok && divResponse.ok && svcResponse.ok && entResponse.ok) {
        setDirections(await dirResponse.json());
        setDepartements(await depResponse.json());
        setDivisions(await divResponse.json());
        setServices(await svcResponse.json());
        setEntites(await entResponse.json());
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
    const firstDiv = filteredDivs[0]?.idDivision || '';
    const filteredSvcs = services.filter(s => s.idDivision === firstDiv);
    
    setSelectedDirectionId(firstDir);
    setSelectedDepartementId(firstDep);
    setSelectedDivisionId(firstDiv);
    setCurrentEntite({
      nom: '',
      type: 'Technique',
      idService: filteredSvcs[0]?.idService || ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const svc = services.find(s => s.idService === item.idService);
    const div = svc ? divisions.find(d => d.idDivision === svc.idDivision) : null;
    const dep = div ? departements.find(d => d.idDepartement === div.idDepartement) : null;
    setSelectedDirectionId(dep ? dep.idDirection : '');
    setSelectedDepartementId(dep ? dep.idDepartement : '');
    setSelectedDivisionId(div ? div.idDivision : '');
    setCurrentEntite(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idEntite}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchData();
        showAlert('Entité supprimée.');
      } else if (response.status === 409) {
        const errMsg = await response.text();
        showAlert(errMsg || 'Impossible de supprimer cette entité car elle est liée à d\'autres structures ou agents.', 'error');
      } else {
        showAlert('Erreur lors de la suppression.', 'error');
      }
    } catch (error) {
      showAlert('Erreur réseau lors de la suppression.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentEntite.idEntite ? 'PUT' : 'POST';
    const url = currentEntite.idEntite ? `${API_URL}/${currentEntite.idEntite}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(currentEntite)
      });
      if (response.ok) {
        fetchData();
        setIsModalOpen(false);
        showAlert(`Entité ${currentEntite.idEntite ? 'modifiée' : 'ajoutée'} avec succès !`);
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
    const firstDiv = filteredDivs[0]?.idDivision || '';
    setSelectedDivisionId(firstDiv);

    const filteredSvcs = services.filter(s => s.idDivision === firstDiv);
    setCurrentEntite({
      ...currentEntite,
      idService: filteredSvcs[0]?.idService || ''
    });
  };

  const handleDepartementChange = (depId) => {
    const numericDepId = Number(depId);
    setSelectedDepartementId(numericDepId);

    const filteredDivs = divisions.filter(d => d.idDepartement === numericDepId);
    const firstDiv = filteredDivs[0]?.idDivision || '';
    setSelectedDivisionId(firstDiv);

    const filteredSvcs = services.filter(s => s.idDivision === firstDiv);
    setCurrentEntite({
      ...currentEntite,
      idService: filteredSvcs[0]?.idService || ''
    });
  };

  const handleDivisionChange = (divId) => {
    const numericDivId = Number(divId);
    setSelectedDivisionId(numericDivId);

    const filteredSvcs = services.filter(s => s.idDivision === numericDivId);
    setCurrentEntite({
      ...currentEntite,
      idService: filteredSvcs[0]?.idService || ''
    });
  };

  const formattedData = entites.map(item => {
    const svc = services.find(s => s.idService === item.idService);
    const div = svc ? divisions.find(d => d.idDivision === svc.idDivision) : null;
    const dep = div ? departements.find(d => d.idDepartement === div.idDepartement) : null;
    const dir = dep ? directions.find(d => d.idDirection === dep.idDirection) : null;
    return {
      idEntite: item.idEntite,
      idService: item.idService,
      nom: item.nom,
      type: item.type,
      service: svc ? `${svc.nom} (${svc.code})` : 'Inconnu',
      division: div ? `${div.nom} (${div.code})` : 'Inconnu',
      departement: dep ? `${dep.nom} (${dep.code})` : 'Inconnu',
      direction: dir ? `${dir.nom} (${dir.code})` : 'Inconnu'
    };
  });

  const availableDepartements = departements.filter(d => d.idDirection === Number(selectedDirectionId));
  const availableDivisions = divisions.filter(d => d.idDepartement === Number(selectedDepartementId));
  const availableServices = services.filter(s => s.idDivision === Number(selectedDivisionId));

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
        title="Gestion des Entités"
        columns={['Nom', 'Type', 'Service', 'Division', 'Département', 'Direction']}
        data={formattedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={item => setDetailModal({ show: true, data: item })}
      />
      <DetailModal open={detailModal.show} data={detailModal.data} services={services} divisions={divisions} departements={departements} directions={directions} onClose={() => setDetailModal({ show: false, data: null })} />

      {isModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 2500 }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ borderBottom: '2px solid #006eb7', paddingBottom: '10px' }}>
              {currentEntite?.idEntite ? 'Modifier Entité' : 'Nouvelle Entité'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Nom de l'Entité</label>
                <input required type="text" value={currentEntite?.nom || ''} onChange={e => setCurrentEntite({ ...currentEntite, nom: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Type d'Entité</label>
                <select required value={currentEntite?.type || 'Technique'} onChange={e => setCurrentEntite({ ...currentEntite, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                  <option value="Technique">Technique</option>
                  <option value="Administratif">Administratif</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Support">Support</option>
                  <option value="Exploitation">Exploitation</option>
                </select>
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
                <select required value={selectedDivisionId} onChange={e => handleDivisionChange(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                  <option value="" disabled>Choisir une division</option>
                  {availableDivisions.map(div => (
                    <option key={div.idDivision} value={div.idDivision}>{div.nom} ({div.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Service Parent</label>
                <select required value={currentEntite?.idService || ''} onChange={e => setCurrentEntite({ ...currentEntite, idService: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>
                  <option value="" disabled>Choisir un service</option>
                  {availableServices.map(svc => (
                    <option key={svc.idService} value={svc.idService}>{svc.nom} ({svc.code})</option>
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

export default Entite;
