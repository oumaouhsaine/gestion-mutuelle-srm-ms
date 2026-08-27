import React, { useState, useEffect } from 'react';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';
import Tesseract from 'tesseract.js';

const Remboursement = () => {
  const { user } = useAuth();

  const [remboursements, setRemboursements] = useState([]);
  const [agents, setAgents] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [currentRemb, setCurrentRemb] = useState(null);
  const [viewRemb, setViewRemb] = useState(null);
  const [decisionType, setDecisionType] = useState('');
  const [tempMontantAccorde, setTempMontantAccorde] = useState('');
  const [refusalReason, setRefusalReason] = useState('');

  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  const API_URL = 'http://localhost:8081/api/remboursements';
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
    fetchRemboursements();
    fetchAgents();
    fetchBeneficiaries();
  }, []);

  const fetchRemboursements = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setRemboursements(data);
      }
    } catch (error) {
      console.error("Erreur récupération remboursements", error);
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
    setCurrentRemb({ idBeneficiaire: '', dateDemande: '', montantDemande: '', montantAccorde: '0', statut: 'En cours', type: 'Soin' });
    setSelectedAgentId('');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    setSelectedAgentId(bene ? bene.idAgent : '');

    // Nettoyer le montant (enlever " DH")
    const numericAmount = item.montantDemande ? item.montantDemande.toString().replace(' DH', '').trim() : '';
    const numericAccorde = item.montantAccorde ? item.montantAccorde.toString().replace(' DH', '').trim() : '';

    setCurrentRemb({
      ...item,
      montantDemande: numericAmount,
      montantAccorde: numericAccorde,
      scan: item.scan,
      dateDemande: item.dateDemande ? item.dateDemande.split('T')[0] : '',
      dateReponse: item.dateReponse ? item.dateReponse.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    const raw = remboursements.find(r => r.idRemboursement == item.idRemboursement);
    setViewRemb({ ...item, ...raw });
    setIsViewModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idRemboursement}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchRemboursements();
        showAlert('Remboursement supprimé.', 'success');
      }
    } catch (error) {
      showAlert('Erreur de connexion.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = currentRemb.idRemboursement ? 'PUT' : 'POST';
    const url = currentRemb.idRemboursement ? `${API_URL}/${currentRemb.idRemboursement}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(currentRemb)
      });
      if (response.ok) {
        fetchRemboursements();
        setIsModalOpen(false);
        showAlert(`Remboursement ${currentRemb.idRemboursement ? 'modifié' : 'ajouté'} avec succès !`);
      }
    } catch (error) {
      showAlert('Erreur lors de la sauvegarde.', 'error');
    }
  };

  const formattedData = remboursements.map(item => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    const agent = bene ? agents.find(a => a.idAgent == bene.idAgent) : null;
    return {
      idRemboursement: item.idRemboursement,
      idBeneficiaire: item.idBeneficiaire,
      agent: agent ? agent.matricule : 'N/A',
      beneficiaire: bene ? `${bene.nom} ${bene.prenom}` : `ID: ${item.idBeneficiaire}`,
      dateDemande: item.dateDemande ? item.dateDemande.split('T')[0] : '',
      montantDemande: (item.montantDemande || 0) + ' DH',
      montantAccorde: (item.montantAccorde || 0) + ' DH',
      statut: item.statut || 'En cours',
      type: item.type || 'Soin',
      motifRefus: item.motifRefus
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
          setCurrentRemb(prev => ({ ...prev, scan: savedFileName }));
          if (detectedAmount) setCurrentRemb(prev => ({ ...prev, montantDemande: detectedAmount }));
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
      const raw = remboursements.find(r => r.idRemboursement == viewRemb.idRemboursement);
      const updatedPayload = { ...raw, statut: 'En cours d\'analyse' };

      const response = await fetch(`${API_URL}/${viewRemb.idRemboursement}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPayload)
      });
      if (response.ok) {
        setViewRemb(prev => ({ ...prev, statut: 'En cours d\'analyse' }));
        fetchRemboursements();

        const agent = agents.find(a => a.idAgent == selectedAgentId);
        if (agent && agent.email) {
          await fetch('http://localhost:8081/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: agent.email,
              subject: `[SRM - MS] Prise en charge de votre remboursement #${viewRemb.idRemboursement}`,
              body: `Bonjour ${agent.nomComplet},\n\nVotre demande de remboursement #${viewRemb.idRemboursement} est désormais en cours d'analyse par nos services.\n\nCordialement,\nL'équipe SRM - MS`
            })
          });
        }
        showAlert("Prise en charge effectuée et email envoyé.", 'success');
      }
    } catch (error) { showAlert("Erreur lors de la prise en charge.", 'error'); }
  };

  const handleDecision = async () => {
    try {
      const raw = remboursements.find(r => r.idRemboursement == viewRemb.idRemboursement);
      const dateNow = new Date().toISOString().split('T')[0];
      const updatedPayload = {
        ...raw,
        statut: decisionType,
        dateReponse: dateNow,
        montantAccorde: decisionType === 'Accordé' ? parseFloat(tempMontantAccorde) : raw.montantAccorde,
        motifRefus: decisionType === 'Refusé' ? refusalReason : null
      };

      const response = await fetch(`${API_URL}/${viewRemb.idRemboursement}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPayload)
      });
      if (response.ok) {
        setIsDecisionModalOpen(false);
        setIsViewModalOpen(false);
        fetchRemboursements();

        const agent = agents.find(a => a.idAgent == selectedAgentId);
        if (agent && agent.email) {
          let emailBody = `Bonjour ${agent.nomComplet},\n\nUne décision a été prise concernant votre remboursement #${viewRemb.idRemboursement}.\nStatut final : ${decisionType}.\n`;
          if (decisionType === 'Refusé') {
            emailBody += `Motif du refus : ${refusalReason}\n`;
          }
          emailBody += `\nCordialement,\nL'équipe SRM - MS`;

          await fetch('http://localhost:8081/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: agent.email,
              subject: `[SRM - MS] Décision sur votre remboursement #${viewRemb.idRemboursement}`,
              body: emailBody
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
        title="Gestion des Remboursements"
        columns={['Matricule Agent', 'Bénéficiaire', 'Date Demande', 'Montant Demandé', 'Montant Accordé', 'Statut', 'Type']}
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
              {currentRemb?.idRemboursement ? 'Modifier Remboursement' : 'Nouveau Remboursement'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Agent (Matricule)</label>
                  <select required value={selectedAgentId} onChange={e => { setSelectedAgentId(e.target.value); setCurrentRemb({ ...currentRemb, idBeneficiaire: '' }); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="">Choisir un agent</option>
                    {agents.map(a => <option key={a.idAgent} value={a.idAgent}>{a.matricule} - {a.nomComplet}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Bénéficiaire</label>
                  <select required value={currentRemb?.idBeneficiaire || ''} onChange={e => setCurrentRemb({ ...currentRemb, idBeneficiaire: e.target.value })} disabled={!selectedAgentId} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="">{selectedAgentId ? 'Choisir bénéficiaire' : 'Sélectionner agent d\'abord'}</option>
                    {filteredBeneficiaries.map(b => <option key={b.idBeneficiaire} value={b.idBeneficiaire}>{b.nom} {b.prenom} ({b.lienParente})</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Montant Demandé (DH)</label>
                  <input required type="number" step="0.01" value={currentRemb?.montantDemande || ''} onChange={e => setCurrentRemb({ ...currentRemb, montantDemande: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Montant Accordé (DH)</label>
                  <input required type="number" step="0.01" value={currentRemb?.montantAccorde || ''} onChange={e => setCurrentRemb({ ...currentRemb, montantAccorde: e.target.value })} disabled={!currentRemb?.idRemboursement} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#006eb7', fontWeight: 'bold', backgroundColor: !currentRemb?.idRemboursement ? '#f1f5f9' : 'white', cursor: !currentRemb?.idRemboursement ? 'not-allowed' : 'auto' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Date Demande</label>
                  <input required type="date" value={currentRemb?.dateDemande || ''} onChange={e => setCurrentRemb({ ...currentRemb, dateDemande: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Type</label>
                  <select value={currentRemb?.type || 'Soin'} onChange={e => setCurrentRemb({ ...currentRemb, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <option value="Soin">Soin</option>
                    <option value="Optique">Optique</option>
                    <option value="Dentaire">Dentaire</option>
                    <option value="Pharmacie">Pharmacie</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Statut</label>
                <select value={currentRemb?.statut || 'En cours'} onChange={e => setCurrentRemb({ ...currentRemb, statut: e.target.value })} disabled={!currentRemb?.idRemboursement} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: !currentRemb?.idRemboursement ? '#f1f5f9' : 'white', cursor: !currentRemb?.idRemboursement ? 'not-allowed' : 'auto' }}>
                  <option value="En cours">En cours</option>
                  <option value="Clôturé">Clôturé</option>
                  <option value="Rejeté">Rejeté</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568', marginBottom: '10px' }}>
                  <i className="fas fa-barcode"></i> Scanner la Facture / Ordonnance
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
                {currentRemb?.scan && !isScanning && (
                  <p style={{ fontSize: '0.8rem', color: '#166534', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fas fa-check-circle"></i> Fichier prêt : {currentRemb.scan}
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

      {isViewModalOpen && viewRemb && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '900px', padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
            <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #006eb7 0%, #004e82 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Suivi Remboursement #{viewRemb.idRemboursement}</h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Dossier ouvert le {viewRemb.dateDemande}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>

            <div style={{ background: 'white' }}>
              {/* Status Header */}
              <div style={{ padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-shield-alt" style={{ color: '#3b82f6' }}></i>
                  <span style={{ fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.9rem' }}>Autorisation de Flux</span>
                </div>
                <div style={{
                  padding: '6px 16px',
                  background: viewRemb.statut === 'Accordé' ? '#dcfce7' :
                    viewRemb.statut === 'Refusé' ? '#fee2e2' :
                      viewRemb.statut === 'En cours d\'analyse' ? '#fef3c7' : '#f1f5f9',
                  color: viewRemb.statut === 'Accordé' ? '#166534' :
                    viewRemb.statut === 'Refusé' ? '#991b1b' :
                      viewRemb.statut === 'En cours d\'analyse' ? '#92400e' : '#475569',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  border: `1px solid ${viewRemb.statut === 'Accordé' ? '#166534' :
                      viewRemb.statut === 'Refusé' ? '#991b1b' :
                        viewRemb.statut === 'En cours d\'analyse' ? '#92400e' : '#475569'
                    }33`
                }}>
                  {viewRemb.statut.toUpperCase()}
                </div>
              </div>

              {/* Graphical Workflow */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 40px', marginTop: '3rem' }}>
                <div style={{ position: 'absolute', top: '25px', left: '80px', right: '80px', height: '2px', background: '#e2e8f0', zIndex: 1 }}></div>

                {/* Step 1: Soumission */}
                <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%', background: '#3b82f6', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
                    boxShadow: '0 0 0 5px white'
                  }}>
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '0.9rem' }}>Soumission</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{viewRemb.dateDemande}</div>
                </div>

                {/* Step 2: Analyse */}
                <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: (viewRemb.statut === 'En cours d\'analyse' || viewRemb.statut === 'Accordé' || viewRemb.statut === 'Refusé') ? '#3b82f6' : 'white',
                    color: (viewRemb.statut === 'En cours d\'analyse' || viewRemb.statut === 'Accordé' || viewRemb.statut === 'Refusé') ? 'white' : '#e2e8f0',
                    border: '2px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
                    boxShadow: '0 0 0 5px white'
                  }}>
                    <i className="fas fa-search"></i>
                  </div>
                  <div style={{ fontWeight: 'bold', color: (viewRemb.statut === 'En cours d\'analyse' || viewRemb.statut === 'Accordé' || viewRemb.statut === 'Refusé') ? '#3b82f6' : '#94a3b8', fontSize: '0.9rem' }}>Analyse</div>
                </div>

                {/* Step 3: Décision */}
                <div style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: (viewRemb.statut === 'Accordé' || viewRemb.statut === 'Refusé') ? '#3b82f6' : 'white',
                    color: (viewRemb.statut === 'Accordé' || viewRemb.statut === 'Refusé') ? 'white' : '#e2e8f0',
                    border: '2px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
                    boxShadow: '0 0 0 5px white'
                  }}>
                    <i className="fas fa-flag-checkered"></i>
                  </div>
                  <div style={{ fontWeight: 'bold', color: (viewRemb.statut === 'Accordé' || viewRemb.statut === 'Refusé') ? '#3b82f6' : '#94a3b8', fontSize: '0.9rem' }}>Décision</div>
                </div>
              </div>

              {/* Main Content */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.5rem', padding: '3rem 2.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Informations</h4>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Bénéficiaire:</strong> {viewRemb.beneficiaire}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Type:</strong> {viewRemb.type}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Montant Demandé:</strong> {viewRemb.montantDemande}</p>
                  {(viewRemb.statut === 'Refusé' || viewRemb.statut === 'Rejeté') && viewRemb.motifRefus && (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#fee2e2', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b', fontWeight: 'bold' }}>Motif du refus :</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#ef4444' }}>{viewRemb.motifRefus}</p>
                    </div>
                  )}
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Scan (Justificatif)</h4>
                  {viewRemb.scan ? (
                    <div style={{ paddingTop: '10px' }}>
                      <a href={`http://localhost:8081/uploads/scans/${viewRemb.scan}`} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '12px', background: '#006eb7', color: 'white', borderRadius: '8px',
                        textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}>
                        <i className="fas fa-file-download"></i> Voir Justificatif
                      </a>
                    </div>
                  ) : (
                    <div style={{ height: '50px', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <i className="fas fa-file-image" style={{ marginRight: '8px' }}></i> Aucun scan
                    </div>
                  )}
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Décision Finale</h4>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Accordé:</strong> <span style={{ color: '#166534', fontWeight: 'bold' }}>{viewRemb.montantAccorde}</span></p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Date Réponse:</strong> {viewRemb.dateReponse || 'En attente'}</p>
                </div>
              </div>

              {/* Action Buttons Workflow */}
              <div style={{ padding: '1.5rem 2.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '15px' }}>
                {viewRemb.statut === 'En cours' && (
                  <button onClick={handleTakeCharge} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '10px', backgroundColor: '#006eb7', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0, 110, 183, 0.2)' }}>
                    <i className="fas fa-play-circle"></i> Prendre en charge le dossier
                  </button>
                )}

                {viewRemb.statut === 'En cours d\'analyse' && (
                  <>
                    <button onClick={() => {
                      setDecisionType('Accordé');
                      setTempMontantAccorde(viewRemb.montantDemande ? viewRemb.montantDemande.toString().replace(' DH', '').trim() : '');
                      setRefusalReason('');
                      setIsDecisionModalOpen(true);
                    }} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '10px', backgroundColor: '#065f46', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.95rem' }}>
                      <i className="fas fa-check-circle"></i> Valider le Remboursement
                    </button>
                    <button onClick={() => { setDecisionType('Refusé'); setRefusalReason(''); setIsDecisionModalOpen(true); }} style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '10px', backgroundColor: '#991b1b', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.95rem' }}>
                      <i className="fas fa-times-circle"></i> Refuser le dossier
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Décision */}
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
                  placeholder="Ex: 150.00"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #065f46', fontSize: '1rem', fontWeight: 'bold' }}
                />
              </div>
            )}

            {decisionType === 'Refusé' && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568', marginBottom: '8px' }}>
                  Motif de refus <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  required
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  placeholder="Saisissez la raison du refus..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    minHeight: '80px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Cette action va envoyer une notification <strong>Email</strong> officielle à l'agent.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setIsDecisionModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>Annuler</button>
              <button
                type="button"
                onClick={handleDecision}
                disabled={decisionType === 'Refusé' && !refusalReason.trim()}
                style={{
                  flex: 1, padding: '12px',
                  background: decisionType === 'Accordé' ? '#065f46' : '#991b1b',
                  color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  opacity: (decisionType === 'Refusé' && !refusalReason.trim()) ? 0.5 : 1
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Remboursement;
