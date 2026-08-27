import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';
import Tesseract from 'tesseract.js';

const Radio = () => {
  const { user } = useAuth();

  const [radios, setRadios] = useState([]);
  const [agents, setAgents] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [currentRadio, setCurrentRadio] = useState(null);
  const [viewRadio, setViewRadio] = useState(null);
  const [decisionType, setDecisionType] = useState('');
  const [tempMontantAccorde, setTempMontantAccorde] = useState('');

  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  const API_URL = 'http://localhost:8081/api/radios';
  const BENE_API_URL = 'http://localhost:8081/api/beneficiaires';
  const AGENTS_API_URL = 'http://localhost:8081/api/agents';

  const showAlert = (message, type = 'success') => {
    setAlertModal({ show: true, message, type });
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  useEffect(() => {
    fetchRadios();
    fetchAgents();
    fetchBeneficiaries();
  }, []);

  const fetchRadios = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setRadios(data);
      }
    } catch (error) {
      console.error("Erreur récupération radios", error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(AGENTS_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setAgents(await response.json());
    } catch (error) {
      console.error("Erreur récupération agents", error);
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      const response = await fetch(BENE_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setBeneficiaries(await response.json());
    } catch (error) {
      console.error("Erreur récupération bénéficiaires", error);
    }
  };

  useEffect(() => {
    if (selectedAgentId) {
      setFilteredBeneficiaries(beneficiaries.filter(b => b.idAgent == selectedAgentId));
    } else {
      setFilteredBeneficiaries([]);
    }
  }, [selectedAgentId, beneficiaries]);

  const handleAdd = () => {
    setCurrentRadio({
      idBeneficiaire: '',
      dateDemande: new Date().toISOString().split('T')[0],
      total: '',
      montantAccorde: '0',
      statut: 'En cours',
      typeRadio: '',
      observation: ''
    });
    setSelectedAgentId('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    setSelectedAgentId(bene ? bene.idAgent : '');

    const numericTotal = item.total ? item.total.toString().replace(' DH', '').trim() : '';
    const numericAccorde = item.montantAccorde ? item.montantAccorde.toString().replace(' DH', '').trim() : '';

    setCurrentRadio({
      ...item,
      total: numericTotal,
      montantAccorde: numericAccorde,
      dateDemande: item.dateDemande ? item.dateDemande.split('T')[0] : '',
      dateReponse: item.dateReponse ? item.dateReponse.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    setViewRadio(item);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idRadio}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchRadios();
        showAlert('Demande supprimée.', 'success');
      }
    } catch (error) {
      showAlert('Erreur de connexion.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentRadio.idRadio ? 'PUT' : 'POST';
    const url = currentRadio.idRadio ? `${API_URL}/${currentRadio.idRadio}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(currentRadio)
      });
      if (response.ok) {
        fetchRadios();
        setIsModalOpen(false);
        showAlert(`Demande de radio ${currentRadio.idRadio ? 'modifiée' : 'ajoutée'} avec succès !`);
      }
    } catch (error) {
      showAlert('Erreur lors de la sauvegarde.', 'error');
    }
  };

  // Ordre strict des champs pour correspondre aux colonnes
  const formattedData = radios.map(item => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    const agent = bene ? agents.find(a => a.idAgent == bene.idAgent) : null;
    return {
      agent: agent ? agent.matricule : 'N/A', // Matricule Agent
      beneficiaire: bene ? `${bene.nom} ${bene.prenom}` : `ID: ${item.idBeneficiaire}`,
      dateDemande: item.dateDemande ? item.dateDemande.split('T')[0] : '',
      total: (item.total || 0) + ' DH',
      montantAccorde: (item.montantAccorde || 0) + ' DH',
      statut: item.statut || 'En cours',
      typeRadio: item.typeRadio || 'N/A'
      // Les champs id, scanRadio, dateReponse sont exclus du tableau principal
    };
  });

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsScanning(true);
      setScanProgress(0);
      let detectedAmount = null;

      try {
        const fileName = file.name.toLowerCase();
        const isImage = file.type.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

        if (isImage) {
          try {
            const result = await Tesseract.recognize(file, 'fra+eng', {
              logger: m => { if (m.status === 'recognizing text') setScanProgress(Math.round(m.progress * 100)); }
            });
            const text = result.data.text;
            const lines = text.split('\n');
            const totalKeywords = [/total/i, /ttc/i, /net/i, /payer/i, /montant/i, /somme/i];
            for (const line of lines) {
              if (totalKeywords.some(kw => kw.test(line))) {
                const amountMatch = line.match(/(\d+[\s,.]\d{2})|(\d{2,})/);
                if (amountMatch) {
                  detectedAmount = amountMatch[0].replace(',', '.').replace(/\s/g, '');
                  break;
                }
              }
            }
          } catch (ocrError) { console.warn("OCR failed", ocrError); }
        }

        const formData = new FormData();
        formData.append('file', file);
        const uploadResponse = await fetch('http://localhost:8081/api/files/upload', { method: 'POST', body: formData });

        if (uploadResponse.ok) {
          const savedFileName = await uploadResponse.text();
          setCurrentRadio(prev => ({ ...prev, scanRadio: savedFileName }));
          if (detectedAmount) setCurrentRadio(prev => ({ ...prev, total: detectedAmount }));
        }
        setIsScanning(false);
        showAlert(detectedAmount ? `Fichier envoyé ! Montant détecté : ${detectedAmount} DH.` : "Fichier envoyé avec succès.", 'success');
      } catch (error) {
        console.error("Scan error:", error);
        setIsScanning(false);
        showAlert("Erreur lors du traitement du document.", 'error');
      }
    }
  };

  const handleTakeCharge = async () => {
    try {
      const raw = radios.find(r => r.idRadio == viewRadio.idRadio);
      const updatedPayload = { ...raw, statut: 'En cours d\'analyse' };

      const response = await fetch(`${API_URL}/${viewRadio.idRadio}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPayload)
      });
      if (response.ok) {
        setViewRadio(prev => ({ ...prev, statut: 'En cours d\'analyse' }));
        fetchRadios();

        const agent = agents.find(a => a.idAgent == selectedAgentId);
        if (agent && agent.email) {
          await fetch('http://localhost:8081/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: agent.email,
              subject: `[SRM - MS] Prise en charge de votre demande Radio #${viewRadio.idRadio}`,
              body: `Bonjour ${agent.nomComplet},\n\nVotre demande de radiologie #${viewRadio.idRadio} est désormais en cours d'analyse par nos services.\n\nCordialement,\nL'équipe SRM - MS`
            })
          });
        }
        showAlert("Prise en charge effectuée et email envoyé.", 'success');
      }
    } catch (error) { showAlert("Erreur lors de la prise en charge.", 'error'); }
  };

  const handleDecision = async () => {
    try {
      const raw = radios.find(r => r.idRadio == viewRadio.idRadio);
      const dateNow = new Date().toISOString().split('T')[0];
      const updatedPayload = {
        ...raw,
        statut: decisionType,
        dateReponse: dateNow,
        montantAccorde: decisionType === 'Accordé' ? parseFloat(tempMontantAccorde) : raw.montantAccorde
      };

      const response = await fetch(`${API_URL}/${viewRadio.idRadio}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPayload)
      });
      if (response.ok) {
        setIsDecisionModalOpen(false);
        setIsViewModalOpen(false);
        fetchRadios();

        const agent = agents.find(a => a.idAgent == selectedAgentId);
        if (agent && agent.email) {
          await fetch('http://localhost:8081/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: agent.email,
              subject: `[SRM - MS] Décision sur votre demande Radio #${viewRadio.idRadio}`,
              body: `Bonjour ${agent.nomComplet},\n\nUne décision a été prise concernant votre demande de radiologie #${viewRadio.idRadio}.\nStatut final : ${decisionType}.\n\nCordialement,\nL'équipe SRM - MS`
            })
          });
        }
        showAlert(`Décision enregistrée : ${decisionType}`, 'success');
      }
    } catch (error) { showAlert("Erreur lors de l'enregistrement.", 'error'); }
  };

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
        title="Gestion des Radiographies"
        columns={['Matricule Agent', 'Bénéficiaire', 'Date Demande', 'Montant Estimé', 'Montant Accordé', 'Statut', 'Type Radio']}
        data={formattedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ borderBottom: '2px solid #006eb7', paddingBottom: '10px' }}>
              {currentRadio?.idRadio ? 'Modifier Demande Radio' : 'Nouvelle Demande Radio'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Agent (Matricule)</label>
                  <select required value={selectedAgentId} onChange={e => { setSelectedAgentId(e.target.value); setCurrentRadio({ ...currentRadio, idBeneficiaire: '' }); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="">Choisir un agent</option>
                    {agents.map(a => <option key={a.idAgent} value={a.idAgent}>{a.matricule} - {a.nomComplet}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Bénéficiaire</label>
                  <select required value={currentRadio?.idBeneficiaire || ''} onChange={e => setCurrentRadio({ ...currentRadio, idBeneficiaire: e.target.value })} disabled={!selectedAgentId} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="">{selectedAgentId ? 'Choisir bénéficiaire' : 'Sélectionner agent d\'abord'}</option>
                    {filteredBeneficiaries.map(b => <option key={b.idBeneficiaire} value={b.idBeneficiaire}>{b.nom} {b.prenom} ({b.lienParente})</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Type de Radio</label>
                  <input required type="text" placeholder="Ex: Panoramique, Scanner..." value={currentRadio?.typeRadio || ''} onChange={e => setCurrentRadio({ ...currentRadio, typeRadio: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Date Demande</label>
                  <input required type="date" value={currentRadio?.dateDemande || ''} onChange={e => setCurrentRadio({ ...currentRadio, dateDemande: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Montant Estimé (DH)</label>
                  <input required type="number" step="0.01" value={currentRadio?.total || ''} onChange={e => setCurrentRadio({ ...currentRadio, total: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Statut</label>
                  <select value={currentRadio?.statut || 'En cours'} onChange={e => setCurrentRadio({ ...currentRadio, statut: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="En cours">En cours</option>
                    <option value="En cours d'analyse">En cours d'analyse</option>
                    <option value="Accordé">Accordé</option>
                    <option value="Refusé">Refusé</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Observation</label>
                <textarea value={currentRadio?.observation || ''} onChange={e => setCurrentRadio({ ...currentRadio, observation: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '60px' }} />
              </div>

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568', marginBottom: '10px' }}>
                  <i className="fas fa-barcode"></i> Scanner l'Ordonnance de Radio
                </label>
                <input type="file" accept="image/*,application/pdf" onChange={handleScan} style={{ width: '100%', fontSize: '0.8rem' }} />

                {isScanning && (
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${scanProgress}%`, height: '100%', background: '#006eb7', transition: 'width 0.3s' }}></div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '5px' }}>Analyse du document... {scanProgress}%</p>
                  </div>
                )}
                {currentRadio?.scanRadio && !isScanning && (
                  <p style={{ fontSize: '0.8rem', color: '#166534', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fas fa-check-circle"></i> Fichier prêt : {currentRadio.scanRadio}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#edf2f7', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#006eb7', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && viewRadio && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '900px', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
            <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #006eb7 0%, #004e82 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Dossier Radio #{viewRadio.idRadio}</h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Demande faite le {viewRadio.dateDemande}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>

            <div style={{ background: 'white' }}>
              <div style={{ padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-x-ray" style={{ color: '#3b82f6' }}></i>
                  <span style={{ fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.9rem' }}>Dossier Radiologique</span>
                </div>
                <div style={{
                  padding: '6px 16px',
                  background: viewRadio.statut === 'Accordé' ? '#dcfce7' :
                    viewRadio.statut === 'Refusé' ? '#fee2e2' :
                      viewRadio.statut === 'En cours d\'analyse' ? '#fef3c7' : '#f1f5f9',
                  color: viewRadio.statut === 'Accordé' ? '#166534' :
                    viewRadio.statut === 'Refusé' ? '#991b1b' :
                      viewRadio.statut === 'En cours d\'analyse' ? '#92400e' : '#475569',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  border: `1px solid ${viewRadio.statut === 'Accordé' ? '#166534' :
                      viewRadio.statut === 'Refusé' ? '#991b1b' :
                        viewRadio.statut === 'En cours d\'analyse' ? '#92400e' : '#475569'
                    }33`
                }}>
                  {(viewRadio.statut || 'EN COURS').toUpperCase()}
                </div>
              </div>

              {/* Graphical Workflow */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 40px', marginTop: '3rem' }}>
                <div style={{ position: 'absolute', top: '25px', left: '80px', right: '80px', height: '2px', background: '#e2e8f0', zIndex: 1 }}></div>

                <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%', background: '#3b82f6', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
                    boxShadow: '0 0 0 5px white'
                  }}>
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '0.9rem' }}>Demande</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{viewRadio.dateDemande}</div>
                </div>

                <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: (viewRadio.statut === 'En cours d\'analyse' || viewRadio.statut === 'Accordé' || viewRadio.statut === 'Refusé') ? '#3b82f6' : 'white',
                    color: (viewRadio.statut === 'En cours d\'analyse' || viewRadio.statut === 'Accordé' || viewRadio.statut === 'Refusé') ? 'white' : '#e2e8f0',
                    border: '2px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
                    boxShadow: '0 0 0 5px white'
                  }}>
                    <i className="fas fa-search-dollar"></i>
                  </div>
                  <div style={{ fontWeight: 'bold', color: (viewRadio.statut === 'En cours d\'analyse' || viewRadio.statut === 'Accordé' || viewRadio.statut === 'Refusé') ? '#3b82f6' : '#94a3b8', fontSize: '0.9rem' }}>Analyse</div>
                </div>

                <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: (viewRadio.statut === 'Accordé' || viewRadio.statut === 'Refusé') ? '#3b82f6' : 'white',
                    color: (viewRadio.statut === 'Accordé' || viewRadio.statut === 'Refusé') ? 'white' : '#e2e8f0',
                    border: '2px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
                    boxShadow: '0 0 0 5px white'
                  }}>
                    <i className="fas fa-check-double"></i>
                  </div>
                  <div style={{ fontWeight: 'bold', color: (viewRadio.statut === 'Accordé' || viewRadio.statut === 'Refusé') ? '#3b82f6' : '#94a3b8', fontSize: '0.9rem' }}>Décision</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.5rem', padding: '3rem 2.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Détails Radio</h4>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Bénéficiaire:</strong> {viewRadio.beneficiaire}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Type Radio:</strong> {viewRadio.typeRadio}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Montant Estimé:</strong> {viewRadio.total}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Observation:</strong> {viewRadio.observation || 'Aucune'}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Scan Ordonnance</h4>
                  {viewRadio.scanRadio ? (
                    <div style={{ paddingTop: '10px' }}>
                      <a href={`http://localhost:8081/uploads/scans/${viewRadio.scanRadio}`} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '12px', background: '#006eb7', color: 'white', borderRadius: '8px',
                        textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}>
                        <i className="fas fa-eye"></i> Voir le Scan
                      </a>
                    </div>
                  ) : (
                    <div style={{ height: '50px', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <i className="fas fa-file-image" style={{ marginRight: '8px' }}></i> Aucun scan
                    </div>
                  )}
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Décision Mutuelle</h4>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Prise en charge:</strong> <span style={{ color: '#166534', fontWeight: 'bold' }}>{viewRadio.montantAccorde}</span></p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Date Réponse:</strong> {viewRadio.dateReponse || 'En attente'}</p>
                </div>
              </div>

              <div style={{ padding: '1.5rem 2.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '15px' }}>
                {(viewRadio.statut === 'En cours' || !viewRadio.statut) && (
                  <button onClick={handleTakeCharge} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '10px', backgroundColor: '#006eb7', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0, 110, 183, 0.2)' }}>
                    <i className="fas fa-spinner"></i> Passer en Analyse
                  </button>
                )}

                {viewRadio.statut === 'En cours d\'analyse' && (
                  <>
                    <button onClick={() => {
                      setDecisionType('Accordé');
                      setTempMontantAccorde(viewRadio.total ? viewRadio.total.toString().replace(' DH', '').trim() : '');
                      setIsDecisionModalOpen(true);
                    }} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '10px', backgroundColor: '#065f46', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.95rem' }}>
                      <i className="fas fa-check-circle"></i> Accorder la Radio
                    </button>
                    <button onClick={() => { setDecisionType('Refusé'); setIsDecisionModalOpen(true); }} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '10px', backgroundColor: '#991b1b', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.95rem' }}>
                      <i className="fas fa-times-circle"></i> Refuser
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isDecisionModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ width: '400px', textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', color: decisionType === 'Accordé' ? '#065f46' : '#991b1b', marginBottom: '1rem' }}>
              <i className={`fas ${decisionType === 'Accordé' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Confirmer : {decisionType} ?</h3>

            {decisionType === 'Accordé' && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px' }}>
                  Montant Accordé (DH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tempMontantAccorde}
                  onChange={(e) => setTempMontantAccorde(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #065f46', fontSize: '1rem', fontWeight: 'bold' }}
                />
              </div>
            )}

            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Un email de notification sera envoyé à l'adhérent pour l'informer de cette décision.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsDecisionModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>Annuler</button>
              <button onClick={handleDecision} style={{ flex: 1, padding: '12px', background: decisionType === 'Accordé' ? '#065f46' : '#991b1b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Radio;
