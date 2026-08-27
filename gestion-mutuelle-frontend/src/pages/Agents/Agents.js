import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';

const Agents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewAgent, setViewAgent] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [initialBeneficiaires, setInitialBeneficiaires] = useState([]);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  const API_URL = 'http://localhost:8081/api/agents';
  const BENE_API_URL = 'http://localhost:8081/api/beneficiaires';
  const SERVICES_API_URL = 'http://localhost:8081/api/services';

  const showAlert = (message, type = 'success') => { setAlertModal({ show: true, message, type }); };
  const getAuthHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token || ''}` });

  const formatDateForInput = (dateVal) => {
    if (!dateVal) return '';
    try {
      const dateObj = new Date(dateVal);
      if (isNaN(dateObj.getTime())) return '';
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch (e) {
      return '';
    }
  };

  useEffect(() => { 
    fetchAgents(); 
    fetchServices();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) setAgents(await response.json());
    } catch (error) { console.error("Erreur agents", error); }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(SERVICES_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setServices(await response.json());
    } catch (error) { console.error("Erreur services", error); }
  };

  const handleAdd = () => {
    setCurrentAgent({ 
      matricule: '', 
      nom: '', 
      prenom: '', 
      situationFamiliale: 'Célibataire', 
      dateNaissance: '', 
      telephone: '', 
      dateRecrutement: '', 
      dateTitularisation: '',
      dateEntreeRegie: '',
      ville: '',
      adresse: '',
      statut: 'Actif', 
      email: '',
      idService: ''
    });
    setBeneficiaires([]);
    setInitialBeneficiaires([]);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleEdit = (agentFromTable) => {
    const agentToEdit = agents.find(a => a.idAgent === agentFromTable.idAgent);
    if (!agentToEdit) {
      console.error("Agent non trouvé !");
      showAlert("Impossible de trouver les détails de l'agent.", "error");
      return;
    }

    const agentData = {
      ...agentToEdit,
      dateNaissance: formatDateForInput(agentToEdit.dateNaissance),
      dateRecrutement: formatDateForInput(agentToEdit.dateRecrutement),
      dateTitularisation: formatDateForInput(agentToEdit.dateTitularisation),
      dateEntreeRegie: formatDateForInput(agentToEdit.dateEntreeRegie),
      ville: agentToEdit.ville || '',
      adresse: agentToEdit.adresse || '',
      idService: agentToEdit.idService || ''
    };
    setCurrentAgent(agentData);
    
    // Fetch beneficiaries for this agent
    fetch(`${BENE_API_URL}/agent/${agentToEdit.idAgent}`, { headers: getAuthHeaders() })
      .then(response => response.json())
      .then(data => {
        setBeneficiaires(data);
        setInitialBeneficiaires(data);
      })
      .catch(error => console.error("Erreur bene", error));
    
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleView = async (item) => {
    const raw = agents.find(a => a.idAgent == item.idAgent);
    setViewAgent(raw);
    
    // Fetch beneficiaries for this agent
    try {
      const response = await fetch(`${BENE_API_URL}/agent/${item.idAgent}`, { headers: getAuthHeaders() });
      if (response.ok) setBeneficiaires(await response.json());
    } catch (error) { console.error("Erreur bene", error); }
    
    setIsViewModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idAgent}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchAgents(); showAlert('Agent supprimé.'); }
    } catch (error) { showAlert('Erreur.', 'error'); }
  };

  const addBeneficiaire = () => {
    setBeneficiaires([...beneficiaires, { nom: '', prenom: '', lienParente: 'Enfant', dateNaissance: '', estSalarie: null, lieuNaissance: '' }]);
  };

  const updateBeneficiaire = (index, field, value) => {
    const newList = [...beneficiaires];
    newList[index][field] = value;
    setBeneficiaires(newList);
  };

  const removeBeneficiaire = (index) => {
    setBeneficiaires(beneficiaires.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const method = currentAgent.idAgent ? 'PUT' : 'POST';
    const url = currentAgent.idAgent ? `${API_URL}/${currentAgent.idAgent}` : API_URL;
    
    try {
      // 1. Save Agent
      const agentRes = await fetch(url, { 
        method, 
        headers: getAuthHeaders(), 
        body: JSON.stringify(currentAgent) 
      });
      
      if (agentRes.ok) {
        const savedAgent = await agentRes.json();
        const agentId = savedAgent.idAgent;

        // 1.5 Delete removed beneficiaries (or all if situationFamiliale became Célibataire)
        const activeBeneficiaires = currentAgent.situationFamiliale === 'Célibataire' ? [] : beneficiaires;
        const deletedBenes = initialBeneficiaires.filter(init => !activeBeneficiaires.some(b => b.idBeneficiaire === init.idBeneficiaire));
        for (const db of deletedBenes) {
          await fetch(`${BENE_API_URL}/${db.idBeneficiaire}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
        }
 
        // 2. Save Beneficiaries
        if (currentAgent.situationFamiliale !== 'Célibataire') {
          for (const bene of activeBeneficiaires) {
            const beneToSave = { ...bene, idAgent: agentId };
            const beneUrl = bene.idBeneficiaire ? `${BENE_API_URL}/${bene.idBeneficiaire}` : BENE_API_URL;
            const beneMethod = bene.idBeneficiaire ? 'PUT' : 'POST';
            
            await fetch(beneUrl, {
              method: beneMethod,
              headers: getAuthHeaders(),
              body: JSON.stringify(beneToSave)
            });
          }
        }

        fetchAgents();
        setIsModalOpen(false);
        showAlert('Agent et bénéficiaires enregistrés avec succès.');
      }
    } catch (error) {
      showAlert('Erreur lors de l\'enregistrement.', 'error');
    }
  };

  const formattedData = agents.map(item => ({
    idAgent: item.idAgent,
    matricule: item.matricule,
    nom: item.nom || '',
    prenom: item.prenom || '',
    situationFamiliale: item.situationFamiliale || 'Célibataire',
    email: item.email || '',
    telephone: item.telephone || '',
    service: services.find(s => s.idService === item.idService)?.nom || 'N/A',
    ville: item.ville || 'N/A'
  }));

  const isSingle = currentAgent?.situationFamiliale === 'Célibataire';

  const steps = isSingle 
    ? [
        { id: 1, label: 'Informations Agent' },
        { id: 2, label: 'Récapitulatif' }
      ]
    : [
        { id: 1, label: 'Informations Agent' },
        { id: 2, label: 'Bénéficiaires' },
        { id: 3, label: 'Récapitulatif' }
      ];

  return (
    <div style={{ position: 'relative', fontFamily: 'Asap, sans-serif' }}>
      {alertModal.show && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ width: '350px', textAlign: 'center' }}>
            <h3 style={{ color: alertModal.type === 'success' ? '#10b981' : '#ef4444' }}>
              {alertModal.type === 'success' ? 'Succès !' : 'Erreur'}
            </h3>
            <p>{alertModal.message}</p>
            <button onClick={() => setAlertModal({ show: false, message: '', type: 'success' })} 
                    style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}>OK</button>
          </div>
        </div>
      )}

      <GenericTable 
        title="Gestion des Agents" 
        columns={['Matricule', 'Nom', 'Prénom', 'Situation Familiale', 'Email', 'Téléphone', 'Service', 'Lieu de Naissance']} 
        data={formattedData} 
        onAdd={handleAdd} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onView={handleView}
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            
            {/* Stepper Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
              <div style={{ position: 'absolute', top: '15px', left: '0', width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, height: '2px', background: '#006eb7', zIndex: 0, transition: 'width 0.3s ease' }}></div>
              
              {steps.map(step => (
                <div key={step.id} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: currentStep >= step.id ? '#006eb7' : '#fff',
                    color: currentStep >= step.id ? '#fff' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid', borderColor: currentStep >= step.id ? '#006eb7' : '#e2e8f0',
                    fontWeight: 'bold', fontSize: '0.9rem'
                  }}>
                    {step.id}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: currentStep === step.id ? 'bold' : 'normal', color: currentStep === step.id ? '#006eb7' : '#64748b' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>
              {currentStep === 1 && "Informations de l'Agent"}
              {currentStep === 2 && (isSingle ? "Vérification des données" : "Ajouter des Bénéficiaires")}
              {currentStep === 3 && "Vérification des données"}
            </h3>

            {/* Step 1 Content */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* Row 1: Matricule & Situation Familiale */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-id-card" style={{ marginRight: '6px', color: '#006eb7' }}></i> Matricule
                    </label>
                    <input type="text" value={currentAgent?.matricule || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, matricule: e.target.value })} 
                           placeholder="Ex: A100"
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-heart" style={{ marginRight: '6px', color: '#e11d48' }}></i> Situation Familiale
                    </label>
                    <select value={currentAgent?.situationFamiliale || 'Célibataire'} 
                            onChange={e => {
                              const val = e.target.value;
                              setCurrentAgent({ ...currentAgent, situationFamiliale: val });
                              if (val === 'Célibataire') {
                                setBeneficiaires([]);
                              }
                            }} 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: 'white', boxSizing: 'border-box' }}>
                      <option value="Célibataire">Célibataire</option>
                      <option value="Marié(e)">Marié(e)</option>
                      <option value="Divorcé(e)">Divorcé(e)</option>
                      <option value="Veuf(ve)">Veuf(ve)</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Nom & Prénom */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-user" style={{ marginRight: '6px', color: '#006eb7' }}></i> Nom
                    </label>
                    <input type="text" value={currentAgent?.nom || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, nom: e.target.value })} 
                           placeholder="Nom de famille"
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-user" style={{ marginRight: '6px', color: '#006eb7' }}></i> Prénom
                    </label>
                    <input type="text" value={currentAgent?.prenom || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, prenom: e.target.value })} 
                           placeholder="Prénom de l'agent"
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Row 3: Date de Naissance & Téléphone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-birthday-cake" style={{ marginRight: '6px', color: '#006eb7' }}></i> Date de Naissance
                    </label>
                    <input type="date" value={currentAgent?.dateNaissance || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, dateNaissance: e.target.value })} 
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-phone" style={{ marginRight: '6px', color: '#10b981' }}></i> Téléphone
                    </label>
                    <input type="text" value={currentAgent?.telephone || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, telephone: e.target.value })} 
                           placeholder="Ex: 0612345678"
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Row 4: Date de Recrutement & Date d'Entrée à la Régie */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-calendar-alt" style={{ marginRight: '6px', color: '#006eb7' }}></i> Date de Recrutement
                    </label>
                    <input type="date" value={currentAgent?.dateRecrutement || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, dateRecrutement: e.target.value })} 
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-calendar-check" style={{ marginRight: '6px', color: '#006eb7' }}></i> Date d'Entrée à la Régie
                    </label>
                    <input type="date" value={currentAgent?.dateEntreeRegie || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, dateEntreeRegie: e.target.value })} 
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Row 5: Date de Titularisation & Ville */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-award" style={{ marginRight: '6px', color: '#006eb7' }}></i> Date de Titularisation
                    </label>
                    <input type="date" value={currentAgent?.dateTitularisation || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, dateTitularisation: e.target.value })} 
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-map-marker-alt" style={{ marginRight: '6px', color: '#006eb7' }}></i> Lieu de Naissance
                    </label>
                    <input type="text" value={currentAgent?.ville || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, ville: e.target.value })} 
                           placeholder="Ex: Marrakech"
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Row 6: Adresse (Quartier, Rue) */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                    <i className="fas fa-map-marker-alt" style={{ marginRight: '6px', color: '#e11d48' }}></i> Adresse (Quartier, Rue)
                  </label>
                  <input type="text" value={currentAgent?.adresse || ''} 
                         onChange={e => setCurrentAgent({ ...currentAgent, adresse: e.target.value })} 
                         placeholder="Ex: Bd. Abdelkrim Al Khattabi, Quartier Guéliz"
                         style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>

                {/* Row 7: Email & Service */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-envelope" style={{ marginRight: '6px', color: '#006eb7' }}></i> Adresse Email
                    </label>
                    <input type="email" value={currentAgent?.email || ''} 
                           onChange={e => setCurrentAgent({ ...currentAgent, email: e.target.value })} 
                           placeholder="Ex: agent@radeema.ma"
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                      <i className="fas fa-briefcase" style={{ marginRight: '6px', color: '#006eb7' }}></i> Service
                    </label>
                    <select value={currentAgent?.idService || ''} 
                            onChange={e => setCurrentAgent({ ...currentAgent, idService: e.target.value ? Number(e.target.value) : '' })} 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: 'white', boxSizing: 'border-box' }}>
                      <option value="">-- Sélectionner un Service --</option>
                      {services.map(s => (
                        <option key={s.idService} value={s.idService}>{s.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* Step 2 Content */}
            {currentStep === 2 && !isSingle && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                  {beneficiaires.map((bene, index) => (
                    <div key={index} style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px', position: 'relative', border: '1px solid #e2e8f0' }}>
                      <button onClick={() => removeBeneficiaire(index)} style={{ position: 'absolute', top: '10px', right: '10px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <i className="fas fa-times"></i>
                      </button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <input placeholder="Nom" value={bene.nom} onChange={e => updateBeneficiaire(index, 'nom', e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        <input placeholder="Prénom" value={bene.prenom} onChange={e => updateBeneficiaire(index, 'prenom', e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <select value={bene.lienParente} onChange={e => {
                          const val = e.target.value;
                          updateBeneficiaire(index, 'lienParente', val);
                          if (val !== 'Conjoint') {
                            updateBeneficiaire(index, 'estSalarie', null);
                            updateBeneficiaire(index, 'lieuNaissance', '');
                          }
                        }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <option value="Enfant">Enfant</option>
                          <option value="Conjoint">Conjoint</option>
                        </select>
                        <input type="date" value={bene.dateNaissance ? bene.dateNaissance.split('T')[0] : ''} onChange={e => updateBeneficiaire(index, 'dateNaissance', e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>

                      {bene.lienParente === 'Conjoint' && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #edf2f7' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Est-elle salarié(e) ?</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                              <input type="radio" name={`estSalarie-${index}`} checked={bene.estSalarie === true} onChange={() => updateBeneficiaire(index, 'estSalarie', true)} /> Oui
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                              <input type="radio" name={`estSalarie-${index}`} checked={bene.estSalarie === false} onChange={() => updateBeneficiaire(index, 'estSalarie', false)} /> Non
                            </label>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Lieu de naissance</label>
                            <input type="text" placeholder="Lieu de naissance" value={bene.lieuNaissance || ''} onChange={e => updateBeneficiaire(index, 'lieuNaissance', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addBeneficiaire} style={{ padding: '12px', borderRadius: '10px', border: '2px dashed #006eb7', background: '#f0f7ff', color: '#006eb7', fontWeight: 'bold', cursor: 'pointer' }}>
                  <i className="fas fa-plus"></i> Ajouter un bénéficiaire
                </button>
              </div>
            )}

            {/* Step 3 Content */}
            {((currentStep === 3 && !isSingle) || (currentStep === 2 && isSingle)) && (
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ marginBottom: '10px', color: '#006eb7' }}>Résumé de l'Agent</h4>
                <p><strong>Nom :</strong> {currentAgent.nom}</p>
                <p><strong>Prénom :</strong> {currentAgent.prenom}</p>
                <p><strong>Situation Familiale :</strong> {currentAgent.situationFamiliale || 'Célibataire'}</p>
                <p><strong>Matricule :</strong> {currentAgent.matricule}</p>
                <p><strong>Email :</strong> {currentAgent.email}</p>
                <p><strong>Service :</strong> {services.find(s => s.idService === currentAgent.idService)?.nom || 'Aucun'}</p>
                <p><strong>Lieu de Naissance :</strong> {currentAgent.ville || 'Aucun'}</p>
                <p><strong>Adresse :</strong> {currentAgent.adresse || 'Aucune'}</p>
                <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                <h4 style={{ marginBottom: '10px', color: '#006eb7' }}>Bénéficiaires ({beneficiaires.length})</h4>
                {beneficiaires.length === 0 ? <p>Aucun bénéficiaire ajouté.</p> : (
                  <ul>
                    {beneficiaires.map((b, i) => (
                      <li key={i}>
                        {b.nom} {b.prenom} ({b.lienParente})
                        {b.lienParente === 'Conjoint' && b.estSalarie !== null && b.estSalarie !== undefined && (
                          <span> - {b.estSalarie ? 'Salarié(e)' : 'Non Salarié(e)'}</span>
                        )}
                        {b.lienParente === 'Conjoint' && b.lieuNaissance && (
                          <span> - Né(e) à {b.lieuNaissance}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Modal Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
              <button 
                onClick={() => currentStep === 1 ? setIsModalOpen(false) : setCurrentStep(currentStep - 1)}
                style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {currentStep === 1 ? 'Annuler' : 'Précédent'}
              </button>
              
              {currentStep < steps.length ? (
                <button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#006eb7', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Suivant
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Confirmer et Enregistrer
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {isViewModalOpen && viewAgent && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '700px', width: '90%', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
            <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #006eb7 0%, #004e82 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Fiche Agent - {viewAgent.nom} {viewAgent.prenom}</h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Matricule: {viewAgent.matricule}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>

            <div style={{ background: 'white', padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.8rem 0', color: '#006eb7', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', fontSize: '0.95rem' }}>Informations Personnelles</h4>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Nom :</strong> {viewAgent.nom}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Prénom :</strong> {viewAgent.prenom}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Date de Naissance :</strong> {formatDateForInput(viewAgent.dateNaissance) || 'N/A'}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Situation Familiale :</strong> {viewAgent.situationFamiliale || 'Célibataire'}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Lieu de Naissance :</strong> {viewAgent.ville || 'N/A'}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Adresse :</strong> {viewAgent.adresse || 'N/A'}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.8rem 0', color: '#006eb7', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', fontSize: '0.95rem' }}>Informations Professionnelles</h4>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Email :</strong> {viewAgent.email}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Téléphone :</strong> {viewAgent.telephone}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Date de Recrutement :</strong> {formatDateForInput(viewAgent.dateRecrutement) || 'N/A'}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Date Entrée à la Régie :</strong> {formatDateForInput(viewAgent.dateEntreeRegie) || 'N/A'}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Date de Titularisation :</strong> {formatDateForInput(viewAgent.dateTitularisation) || 'N/A'}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Service :</strong> {services.find(s => s.idService === viewAgent.idService)?.nom || 'N/A'}</p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: '#006eb7', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', fontSize: '0.95rem' }}>Bénéficiaires Associés ({beneficiaires.length})</h4>
                {beneficiaires.length === 0 ? (
                  <p style={{ margin: '6px 0', fontSize: '0.9rem', color: '#64748b' }}>Aucun bénéficiaire enregistré pour cet agent.</p>
                ) : (
                  <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>
                          <th style={{ padding: '6px' }}>Nom</th>
                          <th style={{ padding: '6px' }}>Prénom</th>
                          <th style={{ padding: '6px' }}>Lien Parenté</th>
                          <th style={{ padding: '6px' }}>Date Naissance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beneficiaires.map((b, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                            <td style={{ padding: '8px 6px' }}>{b.nom}</td>
                            <td style={{ padding: '8px 6px' }}>{b.prenom}</td>
                            <td style={{ padding: '8px 6px' }}>
                              {b.lienParente}
                              {b.lienParente === 'Conjoint' && b.estSalarie !== undefined && b.estSalarie !== null && (
                                <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block', fontStyle: 'italic' }}>
                                  ({b.estSalarie ? 'Salarié(e)' : 'Non Salarié(e)'})
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '8px 6px' }}>
                              {b.dateNaissance ? b.dateNaissance.split('T')[0] : 'N/A'}
                              {b.lienParente === 'Conjoint' && b.lieuNaissance && (
                                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                                  Né(e) à: {b.lieuNaissance}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button onClick={() => setIsViewModalOpen(false)} style={{ padding: '10px 24px', background: '#006eb7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
