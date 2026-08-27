import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';
import Tesseract from 'tesseract.js';

const PriseEnCharge = () => {
  const { user } = useAuth();

  const [prisesEnCharge, setPrisesEnCharge] = useState([]);
  const [agents, setAgents] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [etablissements, setEtablissements] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [currentPec, setCurrentPec] = useState(null);
  const [viewPec, setViewPec] = useState(null);
  const [decisionType, setDecisionType] = useState('');
  const [tempMontantAccorde, setTempMontantAccorde] = useState('');
  const [tempTauxAccorde, setTempTauxAccorde] = useState('');

  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  const API_URL = 'http://localhost:8081/api/prises-en-charge';
  const BENE_API_URL = 'http://localhost:8081/api/beneficiaires';
  const AGENTS_API_URL = 'http://localhost:8081/api/agents';
  const ETAB_API_URL = 'http://localhost:8081/api/etablissements';

  const showAlert = (message, type = 'success') => {
    setAlertModal({ show: true, message, type });
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  useEffect(() => {
    fetchPrisesEnCharge();
    fetchAgents();
    fetchBeneficiaries();
    fetchEtablissements();
  }, []);

  const fetchEtablissements = async () => {
    try {
      const response = await fetch(ETAB_API_URL, { headers: getAuthHeaders() });
      if (response.ok) setEtablissements(await response.json());
    } catch (error) {
      console.error("Erreur récupération établissements", error);
    }
  };

  const fetchPrisesEnCharge = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setPrisesEnCharge(data);
      }
    } catch (error) {
      console.error("Erreur récupération PEC", error);
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
    setCurrentPec({
      idBeneficiaire: '',
      datePec: new Date().toISOString().split('T')[0],
      montantEstime: '',
      montantAccorde: '0',
      tauxCharge: '80', // Par défaut 80%
      statut: 'En cours',
      scan: '',
      observation: '',
      nombreSeance: '',
      typeSoin: '',
      idEtablissement: ''
    });
    setSelectedAgentId('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const raw = prisesEnCharge.find(p => p.idPec == item.idPec) || {};
    const bene = beneficiaries.find(b => b.idBeneficiaire == raw.idBeneficiaire);
    setSelectedAgentId(bene ? bene.idAgent : '');

    const numericEstime = raw.montantEstime ? raw.montantEstime.toString().replace(' DH', '').trim() : '';
    const numericAccorde = raw.montantAccorde ? raw.montantAccorde.toString().replace(' DH', '').trim() : '';

    setCurrentPec({
      ...raw,
      montantEstime: numericEstime,
      montantAccorde: numericAccorde,
      datePec: raw.datePec ? raw.datePec.split('T')[0] : '',
      dateReponse: raw.dateReponse ? raw.dateReponse.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    const raw = prisesEnCharge.find(p => p.idPec == item.idPec);
    setViewPec({ ...item, ...raw });
    setIsViewModalOpen(true);
  };

  const handleGeneratePdf = async (idPec) => {
    try {
      const response = await fetch(`${API_URL}/${idPec}/pdf`, {
        headers: { 'Authorization': `Bearer ${user?.token || ''}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pec_${idPec}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error) {
      showAlert('Erreur lors de la génération du PDF', 'error');
    }
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idPec}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchPrisesEnCharge();
        showAlert('Demande supprimée.', 'success');
      }
    } catch (error) {
      showAlert('Erreur de connexion.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentPec.idPec ? 'PUT' : 'POST';
    const url = currentPec.idPec ? `${API_URL}/${currentPec.idPec}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(currentPec)
      });
      if (response.ok) {
        fetchPrisesEnCharge();
        setIsModalOpen(false);
        showAlert(`Demande PEC ${currentPec.idPec ? 'modifiée' : 'ajoutée'} avec succès !`);
      }
    } catch (error) {
      showAlert('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const formattedData = prisesEnCharge.map(item => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    const agent = bene ? agents.find(a => a.idAgent == bene.idAgent) : null;
    return {
      idPec: item.idPec,
      idBeneficiaire: item.idBeneficiaire,
      agent: agent ? agent.matricule : 'N/A',
      beneficiaire: bene ? `${bene.nom} ${bene.prenom}` : `ID: ${item.idBeneficiaire}`,
      datePec: item.datePec ? item.datePec.split('T')[0] : '',
      montantEstime: (item.montantEstime || 0) + ' DH',
      tauxCharge: (item.tauxCharge || 0) + ' %',
      statut: item.statut || 'En cours'
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
            const totalKeywords = [/total/i, /ttc/i, /net/i, /payer/i, /montant/i, /estimé/i];
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
          setCurrentPec(prev => ({ ...prev, scan: savedFileName }));
          if (detectedAmount) setCurrentPec(prev => ({ ...prev, montantEstime: detectedAmount }));
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
      const raw = prisesEnCharge.find(p => p.idPec == viewPec.idPec);
      const updatedPayload = { ...raw, statut: 'En cours d\'analyse' };

      const response = await fetch(`${API_URL}/${viewPec.idPec}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPayload)
      });
      if (response.ok) {
        setViewPec(prev => ({ ...prev, statut: 'En cours d\'analyse' }));
        fetchPrisesEnCharge();

        const bene = beneficiaries.find(b => b.idBeneficiaire == raw.idBeneficiaire);
        const agent = bene ? agents.find(a => a.idAgent == bene.idAgent) : null;
        if (agent && agent.email) {
          await fetch('http://localhost:8081/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: agent.email,
              subject: `[SRM - MS] Prise en charge de votre demande PEC #${viewPec.idPec}`,
              body: `Bonjour ${agent.nomComplet},\n\nVotre demande de prise en charge #${viewPec.idPec} est désormais en cours d'analyse.\n\nCordialement,\nL'équipe SRM - MS`
            })
          });
        }
        showAlert("Prise en charge effectuée.", 'success');
      }
    } catch (error) { showAlert("Erreur lors de la prise en charge.", 'error'); }
  };

  const handleDecision = async () => {
    try {
      const raw = prisesEnCharge.find(p => p.idPec == viewPec.idPec);
      const dateNow = new Date().toISOString().split('T')[0];
      const updatedPayload = {
        ...raw,
        statut: decisionType,
        dateReponse: dateNow,
        montantAccorde: decisionType === 'Accordé' ? parseFloat(tempMontantAccorde) : raw.montantAccorde,
        tauxCharge: decisionType === 'Accordé' ? parseFloat(tempTauxAccorde) : raw.tauxCharge
      };

      const response = await fetch(`${API_URL}/${viewPec.idPec}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPayload)
      });
      if (response.ok) {
        setIsDecisionModalOpen(false);
        fetchPrisesEnCharge();
        
        // Update view modal state
        const updatedData = { 
          ...viewPec, 
          statut: decisionType, 
          dateReponse: dateNow,
          montantAccorde: decisionType === 'Accordé' ? tempMontantAccorde + ' DH' : viewPec.montantAccorde
        };
        setViewPec(updatedData);

        const bene = beneficiaries.find(b => b.idBeneficiaire == raw.idBeneficiaire);
        const agent = bene ? agents.find(a => a.idAgent == bene.idAgent) : null;
        if (agent && agent.email) {
          await fetch('http://localhost:8081/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: agent.email,
              subject: `[SRM - MS] Décision PEC #${viewPec.idPec}`,
              body: `Bonjour ${agent.nomComplet},\n\nUne décision a été prise pour votre PEC #${viewPec.idPec}.\nStatut : ${decisionType}.\n\nCordialement,\nL'équipe SRM - MS`
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
        title="Gestion des Prises en Charge (PEC)"
        columns={['Matricule Agent', 'Bénéficiaire', 'Date Demande', 'Montant Estimé', 'Taux (%)', 'Statut']}
        data={formattedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h3 style={{ borderBottom: '2px solid #006eb7', paddingBottom: '10px' }}>
              {currentPec?.idPec ? 'Modifier Demande PEC' : 'Nouvelle Demande PEC'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Agent</label>
                  <select required value={selectedAgentId} onChange={e => { setSelectedAgentId(e.target.value); setCurrentPec({ ...currentPec, idBeneficiaire: '' }); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="">Choisir un agent</option>
                    {agents.map(a => <option key={a.idAgent} value={a.idAgent}>{a.matricule} - {a.nomComplet}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Bénéficiaire</label>
                  <select required value={currentPec?.idBeneficiaire || ''} onChange={e => setCurrentPec({ ...currentPec, idBeneficiaire: e.target.value })} disabled={!selectedAgentId} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="">{selectedAgentId ? 'Choisir bénéficiaire' : 'Sélectionner agent d\'abord'}</option>
                    {filteredBeneficiaries.map(b => <option key={b.idBeneficiaire} value={b.idBeneficiaire}>{b.nom} {b.prenom}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Montant Estimé (DH)</label>
                  <input required type="number" value={currentPec?.montantEstime || ''} onChange={e => setCurrentPec({ ...currentPec, montantEstime: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Taux Prise en Charge (%)</label>
                  <input required type="number" value={currentPec?.tauxCharge || ''} onChange={e => setCurrentPec({ ...currentPec, tauxCharge: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Nombre de séances</label>
                  <input type="number" value={currentPec?.nombreSeance || ''} onChange={e => setCurrentPec({ ...currentPec, nombreSeance: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Type de soin</label>
                  <input type="text" value={currentPec?.typeSoin || ''} onChange={e => setCurrentPec({ ...currentPec, typeSoin: e.target.value })} placeholder="Ex: Kinésithérapie, Optique..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Établissement</label>
                <select value={currentPec?.idEtablissement || ''} onChange={e => setCurrentPec({ ...currentPec, idEtablissement: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="">Choisir un établissement</option>
                  {etablissements.map(etab => <option key={etab.idEtablissement} value={etab.idEtablissement}>{etab.raisonSociale} ({etab.convention})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Date Demande</label>
                  <input required type="date" value={currentPec?.datePec || ''} onChange={e => setCurrentPec({ ...currentPec, datePec: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Statut</label>
                  <select value={currentPec?.statut || 'En cours'} onChange={e => setCurrentPec({ ...currentPec, statut: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="En cours">En cours</option>
                    <option value="Accordé">Accordé</option>
                    <option value="Refusé">Refusé</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Observation</label>
                <textarea value={currentPec?.observation || ''} onChange={e => setCurrentPec({ ...currentPec, observation: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '60px' }} />
              </div>

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568', marginBottom: '10px' }}>
                  <i className="fas fa-file-medical"></i> Scanner le Devis / Fiche Médicale
                </label>
                <input type="file" accept="image/*,application/pdf" onChange={handleScan} style={{ width: '100%', fontSize: '0.8rem' }} />
                {isScanning && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${scanProgress}%`, height: '100%', background: '#006eb7', transition: 'width 0.2s' }}></div>
                    </div>
                  </div>
                )}
                {currentPec?.scan && !isScanning && <p style={{ fontSize: '0.8rem', color: '#166534', marginTop: '5px' }}>Fichier : {currentPec.scan}</p>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#edf2f7' }}>Annuler</button>
                {currentPec?.idPec && (
                  <button type="button" onClick={() => handleGeneratePdf(currentPec.idPec)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#eab308', color: 'white', fontWeight: 'bold' }}>
                    <i className="fas fa-file-pdf"></i> PDF
                  </button>
                )}
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#006eb7', color: 'white', fontWeight: 'bold' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && viewPec && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '850px', padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', background: '#006eb7', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
              <h3>Prise En Charge #{viewPec.idPec}</h3>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ marginBottom: '1rem', color: '#006eb7' }}>Informations</h4>
                  <p><strong>Bénéficiaire:</strong> {viewPec.beneficiaire}</p>
                  <p><strong>Agent:</strong> {viewPec.agent}</p>
                  <p><strong>Date Demande:</strong> {viewPec.datePec}</p>
                  <p><strong>Statut:</strong> {viewPec.statut}</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ marginBottom: '1rem', color: '#006eb7' }}>Détails Financiers</h4>
                  <p><strong>Montant Estimé:</strong> {viewPec.montantEstime}</p>
                  <p><strong>Taux Demandé:</strong> {viewPec.tauxCharge}</p>
                  <p><strong>Montant Accordé:</strong> <span style={{ color: '#065f46', fontWeight: 'bold' }}>{viewPec.montantAccorde}</span></p>
                  <p><strong>Date Réponse:</strong> {viewPec.dateReponse || 'En attente'}</p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '1rem', color: '#006eb7' }}>Document & Observation</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <p><strong>Type de soin:</strong> {viewPec.typeSoin || 'N/A'}</p>
                  <p><strong>Nb Séances:</strong> {viewPec.nombreSeance || 'N/A'}</p>
                  <p><strong>Établissement:</strong> {etablissements.find(e => e.idEtablissement == viewPec.idEtablissement)?.raisonSociale || 'N/A'}</p>
                </div>
                <p><strong>Observation:</strong> {viewPec.observation || 'N/A'}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  {viewPec.scan && (
                    <a href={`http://localhost:8081/uploads/scans/${viewPec.scan}`} target="_blank" rel="noreferrer" style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      <i className="fas fa-eye"></i> Justificatif
                    </a>
                  )}
                  {viewPec.statut === 'Accordé' && (
                    <button onClick={() => handleGeneratePdf(viewPec.idPec)} style={{ padding: '10px 20px', background: '#eab308', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <i className="fas fa-file-pdf"></i> Générer PDF
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '15px' }}>
                {(viewPec.statut === 'En cours') && (
                  <button onClick={handleTakeCharge} style={{ flex: 1, padding: '15px', background: '#006eb7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Passer en Analyse</button>
                )}
                {viewPec.statut === 'En cours d\'analyse' && (
                  <>
                    <button onClick={() => { setDecisionType('Accordé'); setTempMontantAccorde(viewPec.montantEstime?.toString().replace(' DH', '')); setTempTauxAccorde(viewPec.tauxCharge?.toString().replace(' %', '')); setIsDecisionModalOpen(true); }} style={{ flex: 1, padding: '15px', background: '#065f46', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Accorder</button>
                    <button onClick={() => { setDecisionType('Refusé'); setIsDecisionModalOpen(true); }} style={{ flex: 1, padding: '15px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Refuser</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isDecisionModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ width: '400px', textAlign: 'center' }}>
            <h3>Décision : {decisionType}</h3>
            {decisionType === 'Accordé' && (
              <div style={{ textAlign: 'left', marginTop: '1rem' }}>
                <label>Montant Accordé (DH)</label>
                <input type="number" value={tempMontantAccorde} onChange={e => setTempMontantAccorde(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <label>Taux Accordé (%)</label>
                <input type="number" value={tempTauxAccorde} onChange={e => setTempTauxAccorde(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
              <button onClick={() => setIsDecisionModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px' }}>Annuler</button>
              <button onClick={handleDecision} style={{ flex: 1, padding: '12px', background: decisionType === 'Accordé' ? '#065f46' : '#991b1b', color: 'white', border: 'none', borderRadius: '8px' }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriseEnCharge;
