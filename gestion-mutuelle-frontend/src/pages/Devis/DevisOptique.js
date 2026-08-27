import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';
import Tesseract from 'tesseract.js';



const DevisOptique = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isClient = user?.roles?.includes('ROLE_CLIENT') || user?.roles?.includes('ROLE_ADHERENT');
  const columns = ['Matricule Agent', 'Bénéficiaire', 'Date Devis', 'Date Dépôt', 'Date Réponse', 'Etat Réponse', 'Montant', 'Type Optique'];

  const [devisList, setDevisList] = useState([]);
  const [agents, setAgents] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [currentDevis, setCurrentDevis] = useState(null);
  const [viewDevis, setViewDevis] = useState(null);
  const [decisionType, setDecisionType] = useState('');
  const [refusalReason, setRefusalReason] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  // Affiche les détails d'un devis dans la modal de vue
  const handleView = (item) => {
    setViewDevis(item);
    setIsViewModalOpen(true);
    if (user) {
      localStorage.setItem(`read_${user.id}_${item.idDevis}_${item.etatReponse}`, 'true');
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlertModal({ show: true, message, type });
  };

  const API_URL = 'http://localhost:8081/api/devis-optique';
  const BENE_API_URL = 'http://localhost:8081/api/beneficiaires';
  const AGENTS_API_URL = 'http://localhost:8081/api/agents';

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token || ''}`
    };
  };

  useEffect(() => {
    fetchDevis();
    fetchAgents();
    fetchBeneficiaries();

    const interval = setInterval(fetchDevis, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openDevisId = params.get('openDevis');
    if (openDevisId && devisList.length > 0 && beneficiaries.length > 0 && agents.length > 0) {
      const devisIdNum = Number(openDevisId);
      const foundItem = formattedDevis.find(d => Number(d.idDevis) === devisIdNum);
      if (foundItem) {
        setViewDevis(foundItem);
        setIsViewModalOpen(true);
        if (user) {
          localStorage.setItem(`read_${user.id}_${foundItem.idDevis}_${foundItem.etatReponse}`, 'true');
        }
        // Nettoyer l'URL en enlevant le paramètre openDevis pour éviter l'ouverture répétée
        const newParams = new URLSearchParams(location.search);
        newParams.delete('openDevis');
        const newSearch = newParams.toString();
        navigate({
          search: newSearch ? `?${newSearch}` : ''
        }, { replace: true });
      }
    }
  }, [location.search, devisList, beneficiaries, agents, user, navigate]);

  const fetchDevis = async () => {
    try {
      const response = await fetch(API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setDevisList(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des devis", error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(AGENTS_API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des agents", error);
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      const response = await fetch(BENE_API_URL, { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        setBeneficiaries(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des bénéficiaires", error);
    }
  };

  // Filtrer les bénéficiaires quand l'agent change
  useEffect(() => {
    if (selectedAgentId) {
      const filtered = beneficiaries.filter(b => b.idAgent == selectedAgentId);
      setFilteredBeneficiaries(filtered);

      const agent = agents.find(a => a.idAgent == selectedAgentId);
      const isAgentSingle = agent?.situationFamiliale === 'Célibataire';

      if (isAgentSingle || filtered.length === 1) {
        const selfBene = filtered.find(b => b.lienParente === 'Lui-même') || filtered[0];
        if (selfBene) {
          setCurrentDevis(prev => {
            if (prev) {
              return { ...prev, idBeneficiaire: selfBene.idBeneficiaire };
            }
            return prev;
          });
        }
      }
    } else {
      setFilteredBeneficiaries([]);
    }
  }, [selectedAgentId, beneficiaries, agents]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsScanning(true);
      setScanProgress(0);
      try {
        let detectedAmount = null;
        const fileName = file.name.toLowerCase();
        const isImage = file.type.startsWith('image/') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

        // Étape 1 : Tentative de lecture OCR (IA) - Uniquement pour les images reconnues
        if (isImage) {
          try {
            const result = await Tesseract.recognize(file, 'fra+eng', {
              logger: m => {
                if (m.status === 'recognizing text') {
                  setScanProgress(Math.round(m.progress * 100));
                }
              }
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
          } catch (ocrError) {
            console.warn("L'IA n'a pas pu lire l'image.", ocrError);
          }
        }

        // Étape 2 : Upload réel vers le backend
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('http://localhost:8081/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const savedFileName = await uploadResponse.text();
          setCurrentDevis(prev => ({
            ...prev,
            scan: savedFileName
          }));
        }

        setIsScanning(false);
        showAlert(detectedAmount ? `Fichier envoyé ! Montant détecté : ${detectedAmount} DH.` : "Fichier envoyé avec succès.", 'success');

      } catch (error) {
        console.error("Erreur globale scan:", error);
        setIsScanning(false);
        showAlert("Erreur lors du traitement du document.", 'error');
      }
    }
  };


  // Envoi du devis à l'admin
  const handleSendToAdmin = async (item) => {
    try {
      const updatedPayload = { ...item, etatReponse: 'En attente admin' };
      const response = await fetch(`${API_URL}/${item.idDevis}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPayload)
      });
      if (response.ok) {
        fetchDevis();
        showAlert('Devis envoyé à l\'admin.', 'success');
        // Notification admin (à adapter selon votre backend)
        // Notification admin via email endpoint
        fetch('http://localhost:8081/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'admin@mutuelle.com',
            subject: `[SRM - MS] Nouveau devis optique à valider (ID: ${item.idDevis})`,
            body: `Un nouveau devis optique a été soumis et nécessite votre validation.\n\nID Devis: ${item.idDevis}\nVeuillez vous connecter à l'application pour le traiter.`
          })
        });
      }
    } catch (error) {
      showAlert('Erreur lors de l\'envoi.', 'error');
    }
  };

  const handleTakeCharge = async () => {
    try {
      const raw = devisList.find(d => d.idDevis == viewDevis.idDevis);
      const updatedPayload = { ...raw, etatReponse: 'En cours d\'analyse' };

      const response = await fetch(`${API_URL}/${viewDevis.idDevis}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPayload)
      });
      if (response.ok) {
        setViewDevis(prev => ({ ...prev, etatReponse: 'En cours d\'analyse' }));
        fetchDevis();
        showAlert('Dossier pris en charge. Passage à la phase d\'analyse.', 'success');

        // Notification par Email (Prise en charge)
        const bene = beneficiaries.find(b => b.idBeneficiaire == viewDevis.idBeneficiaire);
        const agent = agents.find(a => a.idAgent == bene?.idAgent);
        const emailAgent = agent?.email || '';
        const nomAgent = agent?.nomComplet || 'Agent';
        const beneName = bene ? `${bene.nom} ${bene.prenom}` : viewDevis.nomBeneficiaire;

        const subject = `[SRM - MS] Prise en charge de votre demande de devis n°${viewDevis.idDevis}`;
        const body = `Bonjour ${nomAgent},\n\n` +
          `Nous vous informons que votre demande de devis pour le bénéficiaire ${beneName} a été prise en charge par nos services.\n\n` +
          `Votre dossier est actuellement en cours d'analyse par nos experts. Vous recevrez une notification dès qu'une décision sera prise.\n\n` +
          `Cordialement,\n` +
          `L'équipe SRM - MS`;

        if (emailAgent) {
          fetch('http://localhost:8081/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: emailAgent, subject, body })
          }).then(() => {
            showAlert('Dossier pris en charge et notification envoyée.', 'success');
          });
        }
      }
    } catch (error) {
      showAlert('Erreur lors de la prise en charge.', 'error');
    }
  };

  const openDecisionModal = (type) => {
    setDecisionType(type);
    setRefusalReason('');
    setIsDecisionModalOpen(true);
  };

  const handleDecision = async () => {
    try {
      const raw = devisList.find(d => d.idDevis == viewDevis.idDevis);
      const updatedPayload = {
        ...raw,
        etatReponse: decisionType,
        dateReponse: new Date().toISOString().split('T')[0],
        motifRefus: decisionType === 'Refusé' ? refusalReason : null
      };

      const response = await fetch(`${API_URL}/${viewDevis.idDevis}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedPayload)
      });
      if (response.ok) {
        setViewDevis(prev => ({
          ...prev,
          etatReponse: decisionType,
          dateReponse: updatedPayload.dateReponse,
          motifRefus: updatedPayload.motifRefus
        }));
        fetchDevis();
        setIsDecisionModalOpen(false);

        // Notification par Email (Professionnel)
        const bene = beneficiaries.find(b => b.idBeneficiaire == viewDevis.idBeneficiaire);
        const agent = agents.find(a => a.idAgent == bene?.idAgent);
        const emailAgent = agent?.email || '';
        const nomAgent = agent?.nomComplet || 'Agent';
        const beneName = bene ? `${bene.nom} ${bene.prenom}` : viewDevis.nomBeneficiaire;

        const subject = `[SRM - MS] Décision concernant votre demande de devis n°${viewDevis.idDevis}`;
        let body = `Bonjour ${nomAgent},\n\n` +
          `Nous vous informons que votre demande de devis pour le bénéficiaire ${beneName} a été traitée par nos services.\n\n` +
          `Détails de la décision :\n` +
          `- Statut : ${decisionType.toUpperCase()}\n`;
        
        if (decisionType === 'Refusé') {
          body += `- Motif du refus : ${refusalReason}\n`;
        }

        body += `- Montant : ${viewDevis.montant}\n` +
          `- Type : Devis Optique (${viewDevis.typeOptique})\n\n` +
          `Vous pouvez consulter les détails complets sur votre espace personnel.\n\n` +
          `Cordialement,\n` +
          `L'équipe SRM - MS`;

        if (emailAgent) {
          fetch('http://localhost:8081/api/notifications/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: emailAgent, subject, body })
          }).then(() => {
            showAlert(`Décision enregistrée et notification envoyée à ${emailAgent}.`, 'success');
          });
        } else {
          showAlert(`Décision enregistrée, mais l'agent n'a pas d'email configuré.`, 'warning');
        }
      }
    } catch (error) {
      showAlert('Erreur lors de l\'enregistrement de la décision.', 'error');
    }
  };

  const handleEditFromView = () => {
    setIsViewModalOpen(false);
    handleEdit(viewDevis);
  };

  const handleAdd = () => {
    setCurrentDevis({ idBeneficiaire: '', dateDevis: '', dateDepot: new Date().toISOString().split('T')[0], dateReponse: '', etatReponse: isClient ? 'En attente admin' : 'En attente', montant: '', typeOptique: '', observation: '' });
    if (isClient && myAgent) {
      setSelectedAgentId(myAgent.idAgent);
    } else {
      setSelectedAgentId('');
    }
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    setSelectedAgentId(bene ? bene.idAgent : '');

    // Nettoyer le montant (enlever " DH")
    const numericAmount = item.montant ? item.montant.toString().replace(' DH', '').trim() : '';

    setCurrentDevis({
      ...item,
      montant: numericAmount,
      scan: item.idScan,
      dateDevis: item.dateDevis ? item.dateDevis.split('T')[0] : '',
      dateDepot: item.dateDepot ? item.dateDepot.split('T')[0] : '',
      dateReponse: item.dateReponse ? item.dateReponse.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`${API_URL}/${item.idDevis}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchDevis();
        showAlert('Devis supprimé avec succès !', 'success');
      } else {
        showAlert('Erreur lors de la suppression.', 'error');
      }
    } catch (error) {
      showAlert('Erreur de connexion au serveur.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const payload = { ...currentDevis };
    if (!payload.dateDevis) payload.dateDevis = null;
    if (!payload.dateDepot) payload.dateDepot = null;
    if (!payload.dateReponse) payload.dateReponse = null;

    try {
      if (currentDevis.idDevis) {
        const response = await fetch(`${API_URL}/${currentDevis.idDevis}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          fetchDevis();
          showAlert('Devis modifié avec succès !', 'success');
        } else {
          showAlert('Erreur lors de la modification.', 'error');
        }
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          fetchDevis();
          showAlert('Devis ajouté avec succès !', 'success');
        } else {
          showAlert("Erreur lors de l'ajout.", 'error');
        }
      }
    } catch (error) {
      showAlert('Erreur de connexion au serveur.', 'error');
    }
    setIsModalOpen(false);
  };

  const myAgent = isClient ? agents.find(a => Number(a.idUser) === Number(user?.id)) : null;
  const selectedAgent = agents.find(a => Number(a.idAgent) === Number(selectedAgentId));
  const isSelectedAgentSingle = selectedAgent?.situationFamiliale === 'Célibataire';

  const formattedDevis = devisList.map(item => {
    const bene = beneficiaries.find(b => b.idBeneficiaire == item.idBeneficiaire);
    const agent = agents.find(a => a.idAgent == bene?.idAgent);
    const resolvedAgent = agent || (isClient && myAgent ? myAgent : null);
    
    const beneName = bene 
      ? `${bene.nom} ${bene.prenom}` 
      : (item.idBeneficiaire ? `ID: ${item.idBeneficiaire}` : 'Pas de bénéficiaire');
      
    const matricule = resolvedAgent ? resolvedAgent.matricule : 'N/A';

    return {
      idDevis: item.idDevis,
      idBeneficiaire: item.idBeneficiaire,
      matriculeAgent: matricule,
      nomBeneficiaire: beneName,
      dateDevis: item.dateDevis ? item.dateDevis.split('T')[0] : '',
      dateDepot: item.dateDepot ? item.dateDepot.split('T')[0] : '',
      dateReponse: item.dateReponse ? item.dateReponse.split('T')[0] : '',
      etatReponse: item.etatReponse,
      montant: item.montant + ' DH',
      typeOptique: item.typeOptique,
      idScan: item.scan,
      motifRefus: item.motifRefus
    };
  });

  const displayDevis = formattedDevis.filter(item => {
    if (!isClient) return true;
    if (!myAgent) return false;
    return item.matriculeAgent === myAgent.matricule;
  });

  return (
    <div style={{ position: 'relative' }}>

      {alertModal.show && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-content" style={{ width: '350px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: alertModal.type === 'success' ? '#10b981' : '#ef4444', marginBottom: '1rem' }}>
              <i className={`fas ${alertModal.type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </div>
            <h3 style={{ marginTop: 0, color: '#1e293b', marginBottom: '1rem' }}>
              {alertModal.type === 'success' ? 'Succès !' : 'Erreur'}
            </h3>
            <p style={{ color: '#475569', marginBottom: '2rem' }}>{alertModal.message}</p>
            <button
              onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}
              style={{
                padding: '10px 24px', border: 'none', background: alertModal.type === 'success' ? '#10b981' : '#ef4444',
                color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%'
              }}>
              OK
            </button>
          </div>
        </div>
      )}

      <GenericTable
        title="Gestion des Devis Optiques"
        columns={columns}
        data={displayDevis}
        onAdd={isClient ? handleAdd : undefined}
        onEdit={!isClient ? handleEdit : undefined}
        onDelete={!isClient ? handleDelete : undefined}
        onView={handleView}
        renderActions={row =>
          isClient && row.etatReponse === 'En attente' ? (
            <button
              style={{ background: '#006eb7', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', marginLeft: 8, cursor: 'pointer', fontWeight: 600 }}
              onClick={() => handleSendToAdmin(row)}
              title="Envoyer à l'admin"
            >
              Envoyer à admin
            </button>
          ) : null
        }
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1a202c', borderBottom: '2px solid #006eb7', paddingBottom: '10px' }}>
              {currentDevis?.idDevis ? 'Modifier le Devis Workflow' : 'Nouveau Workflow Devis'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', border: '1px dashed #006eb7' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#006eb7', fontWeight: 'bold' }}>
                  <i className="fas fa-file-medical"></i> SCAN DU DEVIS
                </label>
                <input
                  type="file"
                  onChange={handleScan}
                  style={{ width: '100%', padding: '5px', fontSize: '0.8rem' }}
                />
                {isScanning && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', color: '#006eb7', fontWeight: '600' }}>Analyse OCR en cours... {scanProgress}%</p>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${scanProgress}%`, height: '100%', background: '#006eb7', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                )}
                {currentDevis?.scan && !isScanning && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#166534', fontWeight: 'bold' }}>
                    <i className="fas fa-check-circle"></i> Fichier sélectionné : {currentDevis.scan}
                  </p>
                )}
              </div>

              {(!isClient || !isSelectedAgentSingle) && (
                <div style={{ display: 'grid', gridTemplateColumns: (!isClient && !isSelectedAgentSingle) ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  {!isClient && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568', fontWeight: '600' }}>Agent (Matricule)</label>
                      <select
                        required
                        value={selectedAgentId}
                        onChange={e => {
                          setSelectedAgentId(e.target.value);
                          setCurrentDevis({ ...currentDevis, idBeneficiaire: '' }); // Reset bene if agent changes
                        }}
                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }}
                      >
                        <option value="">Sélectionner un matricule</option>
                        {agents.map(a => (
                          <option key={a.idAgent} value={a.idAgent}>
                            {a.matricule} - {a.nomComplet}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {!isSelectedAgentSingle && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568', fontWeight: '600' }}>Bénéficiaire</label>
                      <select
                        required
                        value={currentDevis?.idBeneficiaire || ''}
                        onChange={e => setCurrentDevis({ ...currentDevis, idBeneficiaire: e.target.value })}
                        style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }}
                        disabled={!selectedAgentId}
                      >
                        <option value="">{selectedAgentId ? 'Choisir le bénéficiaire' : 'Sélectionner d\'abord un agent'}</option>
                        {filteredBeneficiaries.map(b => (
                          <option key={b.idBeneficiaire} value={b.idBeneficiaire}>
                            {b.nom} {b.prenom} ({b.lienParente})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568', fontWeight: '600' }}>Montant (DH)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={currentDevis?.montant || ''}
                  onChange={e => setCurrentDevis({ ...currentDevis, montant: e.target.value })}
                  placeholder="Ex: 850.00"
                  style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 'bold', color: '#006eb7', fontSize: '1rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Date Devis</label>
                  <input required type="date" value={currentDevis?.dateDevis || ''} onChange={e => setCurrentDevis({ ...currentDevis, dateDevis: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Date Dépôt</label>
                  <input required type="date" value={currentDevis?.dateDepot || ''} onChange={e => setCurrentDevis({ ...currentDevis, dateDepot: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Type Optique (Lentilles, Verres, etc.)</label>
                <input required type="text" value={currentDevis?.typeOptique || ''} onChange={e => setCurrentDevis({ ...currentDevis, typeOptique: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
              </div>

              {!isClient && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Etat Réponse</label>
                  <select value={currentDevis?.etatReponse || 'En attente'} onChange={e => setCurrentDevis({ ...currentDevis, etatReponse: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <option value="En attente">En attente</option>
                    <option value="En cours d'analyse">En cours d'analyse</option>
                    <option value="Accordé">Accordé</option>
                    <option value="Refusé">Refusé</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#4a5568' }}>Observation</label>
                <textarea value={currentDevis?.observation || ''} onChange={e => setCurrentDevis({ ...currentDevis, observation: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', minHeight: '60px' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', border: 'none', background: '#edf2f7', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Annuler</button>
                <button type="submit" style={{ padding: '10px 20px', border: 'none', background: '#006eb7', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }} disabled={isScanning}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails / Workflow */}
      {isViewModalOpen && viewDevis && (
        <div className="modal-overlay" style={{ zIndex: 1500 }}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '90%', padding: '0', overflow: 'hidden' }}>
            {/* Header style image */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>
                  Détails de la Demande #{viewDevis.idDevis}
                </h2>
                <span style={{
                  padding: '4px 10px',
                  background: viewDevis.etatReponse === 'Accordé' ? '#dcfce7' :
                    viewDevis.etatReponse === 'Refusé' ? '#fee2e2' :
                      viewDevis.etatReponse === 'En cours d\'analyse' ? '#fef3c7' :
                        (viewDevis.etatReponse === 'En attente' || viewDevis.etatReponse === 'En attente admin') ? '#e0f2fe' : '#f1f5f9',
                  color: viewDevis.etatReponse === 'Accordé' ? '#166534' :
                    viewDevis.etatReponse === 'Refusé' ? '#991b1b' :
                      viewDevis.etatReponse === 'En cours d\'analyse' ? '#92400e' :
                        (viewDevis.etatReponse === 'En attente' || viewDevis.etatReponse === 'En attente admin') ? '#0369a1' : '#475569',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '0.72rem',
                  border: `1px solid ${viewDevis.etatReponse === 'Accordé' ? '#166534' :
                      viewDevis.etatReponse === 'Refusé' ? '#991b1b' :
                        viewDevis.etatReponse === 'En cours d\'analyse' ? '#92400e' :
                          (viewDevis.etatReponse === 'En attente' || viewDevis.etatReponse === 'En attente admin') ? '#0ea5e9' : '#475569'
                    }33`
                }}>
                  {viewDevis.etatReponse === 'En attente admin' ? 'ATTENTE ADMIN' :
                   viewDevis.etatReponse === "En cours d'analyse" ? 'EN ANALYSE' :
                   viewDevis.etatReponse.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsViewModalOpen(false)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontWeight: '600' }}>
                  <i className="fas fa-arrow-left"></i> Retour
                </button>
                {isClient && viewDevis.etatReponse === 'En attente' && (
                  <button
                    onClick={async () => {
                      const rawItem = devisList.find(d => d.idDevis === viewDevis.idDevis);
                      if (rawItem) {
                        await handleSendToAdmin(rawItem);
                        setIsViewModalOpen(false);
                      }
                    }}
                    style={{ padding: '8px 16px', background: '#006eb7', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600' }}
                  >
                    <i className="fas fa-paper-plane"></i> Envoyer à l'admin
                  </button>
                )}
                {!isClient && (viewDevis.etatReponse === 'En attente' || viewDevis.etatReponse === 'En attente admin') && (
                  <button onClick={handleTakeCharge} style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600' }}>
                    <i className="fas fa-play"></i> Prendre en charge
                  </button>
                )}
                {!isClient && viewDevis.etatReponse === 'En cours d\'analyse' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => openDecisionModal('Accordé')} style={{ padding: '8px 16px', background: '#10b981', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600' }}>
                      <i className="fas fa-check"></i> Valider
                    </button>
                    <button onClick={() => openDecisionModal('Refusé')} style={{ padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600' }}>
                      <i className="fas fa-times"></i> Refuser
                    </button>
                  </div>
                )}
                {!isClient && (
                  <button onClick={handleEditFromView} style={{ padding: '8px 16px', background: '#f59e0b', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600' }}>
                    <i className="fas fa-edit"></i> Modifier
                  </button>
                )}

              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2.5rem' }}>
              {/* Data Table for details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Informations Agent</h4>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Bénéficiaire:</strong> {viewDevis.nomBeneficiaire}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Montant:</strong> {viewDevis.montant}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Type Optique:</strong> {viewDevis.typeOptique}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Matricule Agent:</strong> {viewDevis.matriculeAgent}</p>
                  {viewDevis.etatReponse === 'Refusé' && viewDevis.motifRefus && (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#fee2e2', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b', fontWeight: 'bold' }}>Motif du refus :</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#ef4444' }}>{viewDevis.motifRefus}</p>
                    </div>
                  )}
                </div>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Document (Scan)</h4>
                  {viewDevis.idScan ? (
                    <div style={{ paddingTop: '10px' }}>
                      <a href={`http://localhost:8081/uploads/scans/${viewDevis.idScan}`} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '12px', background: '#006eb7', color: 'white', borderRadius: '8px',
                        textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}>
                        <i className="fas fa-file-download"></i> Télécharger le Devis
                      </a>
                    </div>
                  ) : (
                    <div style={{ height: '50px', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <i className="fas fa-file-image" style={{ marginRight: '8px' }}></i> Aucun scan disponible
                    </div>
                  )}
                </div>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Dates & Suivi</h4>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Date Devis:</strong> {viewDevis.dateDevis}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Date Dépôt:</strong> {viewDevis.dateDepot}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Date Réponse:</strong> {viewDevis.dateReponse || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Confirmation Décision */}
      {isDecisionModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ width: '400px', textAlign: 'center', padding: '2rem' }}>
            <div style={{
              fontSize: '4rem',
              color: decisionType === 'Accordé' ? '#10b981' : '#ef4444',
              marginBottom: '1rem'
            }}>
              <i className={`fas ${decisionType === 'Accordé' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            </div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>
              Confirmer la décision : {decisionType} ?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Cette action va changer l'état du devis et envoyer une notification <strong>Email</strong> officielle à l'agent.
            </p>

            {decisionType === 'Refusé' && (
              <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569', fontWeight: 'bold' }}>
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

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsDecisionModalOpen(false)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}
              >
                Annuler
              </button>
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

export default DevisOptique;
