import React, { useState, useEffect } from 'react';
import './Adherent.css';
import { useAuth } from '../../context/AuthContext';

const Historique = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  const fetchSafely = async (url, defaultValue = []) => {
    try {
      const response = await fetch(url, { headers: getAuthHeaders() });
      if (response.ok) return await response.json();
      return defaultValue;
    } catch (e) {
      console.error(`Error fetching ${url}:`, e);
      return defaultValue;
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Fetch Agents and Beneficiaries to filter for current adherent
        const [agents, beneficiaries] = await Promise.all([
          fetchSafely('http://localhost:8081/api/agents'),
          fetchSafely('http://localhost:8081/api/beneficiaires')
        ]);

        const myAgent = agents.find(a => Number(a.idUser) === Number(user.id));
        if (!myAgent) {
          setLoading(false);
          return;
        }

        const myBeneficiaries = beneficiaries.filter(b => Number(b.idAgent) === Number(myAgent.idAgent));
        const myBeneIds = myBeneficiaries.map(b => b.idBeneficiaire);

        // 2. Fetch all domains in parallel
        const [
          remboursements,
          ordonnances,
          prisesEnCharge,
          radios,
          cartes,
          analyses,
          maladiesSpeciales
        ] = await Promise.all([
          fetchSafely('http://localhost:8081/api/remboursements'),
          fetchSafely('http://localhost:8081/api/ordonnances'),
          fetchSafely('http://localhost:8081/api/prises-en-charge'),
          fetchSafely('http://localhost:8081/api/radios'),
          fetchSafely('http://localhost:8081/api/cartes'),
          fetchSafely('http://localhost:8081/api/analyses'),
          fetchSafely('http://localhost:8081/api/maladies-speciales')
        ]);

        const allEvents = [];

        const getBeneName = (idBene) => {
          const b = myBeneficiaries.find(bene => bene.idBeneficiaire == idBene);
          return b ? `${b.nom} ${b.prenom} (${b.lienParente})` : `ID: ${idBene}`;
        };

        // Normalize Remboursements
        remboursements.forEach(r => {
          if (myBeneIds.includes(r.idBeneficiaire)) {
            let desc = `Dossier de remboursement d'un montant de ${r.montantDemande} DH (Accordé: ${r.montantAccorde || 0} DH) pour ${getBeneName(r.idBeneficiaire)}.`;
            if ((r.statut === 'Refusé' || r.statut === 'Rejeté') && r.motifRefus) {
              desc += ` Motif : ${r.motifRefus}`;
            }
            allEvents.push({
              id: `remb_${r.idRemboursement}`,
              type: 'Remboursements',
              date: r.dateReponse || r.dateDemande,
              title: `Remboursement (${r.type})`,
              description: desc,
              status: (r.statut === 'Accordé' || r.statut === 'Accepté') ? 'success' : (r.statut === 'Refusé' || r.statut === 'Rejeté') ? 'danger' : 'warning',
              statusLabel: r.statut || 'En attente',
              icon: 'fa-hand-holding-dollar'
            });
          }
        });

        // Normalize Ordonnances
        ordonnances.forEach(o => {
          if (myBeneIds.includes(o.idBeneficiaire)) {
            allEvents.push({
              id: `ord_${o.idOrdonnance}`,
              type: 'Ordonnances',
              date: o.dateOrdonnance,
              title: `Ordonnance n°${o.numeroOrdonnance || o.idOrdonnance}`,
              description: `Ordonnance médicale d'un montant de ${o.montantTotal} DH pour ${getBeneName(o.idBeneficiaire)}. Obs: ${o.observation || 'Aucune'}.`,
              status: 'info',
              statusLabel: 'Enregistrée',
              icon: 'fa-file-prescription'
            });
          }
        });

        // Normalize Prises en charge
        prisesEnCharge.forEach(p => {
          if (myBeneIds.includes(p.idBeneficiaire)) {
            allEvents.push({
              id: `pec_${p.idPec}`,
              type: 'Prises en charge',
              date: p.dateReponse || p.datePec,
              title: `Prise en charge (${p.typeSoin})`,
              description: `Prise en charge estimée à ${p.montantEstime} DH (Accordée: ${p.montantAccorde || 0} DH) pour ${p.nombreSeance || 0} séance(s) (Taux: ${p.tauxCharge}%). Bénéficiaire: ${getBeneName(p.idBeneficiaire)}.`,
              status: p.statut === 'Accordé' ? 'success' : p.statut === 'Refusé' ? 'danger' : 'warning',
              statusLabel: p.statut || 'En cours',
              icon: 'fa-file-invoice-dollar'
            });
          }
        });

        // Normalize Radios
        radios.forEach(rad => {
          if (myBeneIds.includes(rad.idBeneficiaire)) {
            allEvents.push({
              id: `radio_${rad.idRadio}`,
              type: 'Radios',
              date: rad.dateReponse || rad.dateDemande,
              title: `Radiographie (${rad.typeRadio})`,
              description: `Examen radiologique d'un montant de ${rad.total} DH (Accordé: ${rad.montantAccorde || 0} DH) pour ${getBeneName(rad.idBeneficiaire)}. Obs: ${rad.observation || 'Aucune'}.`,
              status: rad.statut === 'Accordé' ? 'success' : rad.statut === 'Refusé' ? 'danger' : 'warning',
              statusLabel: rad.statut || 'En cours',
              icon: 'fa-x-ray'
            });
          }
        });

        // Normalize Cartes
        cartes.forEach(c => {
          if (myBeneIds.includes(c.idBeneficiaire)) {
            allEvents.push({
              id: `carte_${c.idCarte}`,
              type: 'Cartes',
              date: c.dateValidation || c.dateDemande,
              title: `Demande de carte mutuelle (${c.typeDemande})`,
              description: `Demande de carte pour ${getBeneName(c.idBeneficiaire)}. ${c.raisonChangement ? 'Raison: ' + c.raisonChangement : ''}`,
              status: (c.statut === 'Accordée' || c.statut === 'Validée') ? 'success' : c.statut === 'Refusée' ? 'danger' : 'warning',
              statusLabel: c.statut || 'En attente',
              icon: 'fa-id-card'
            });
          }
        });

        // Normalize Analyses
        analyses.forEach(a => {
          if (myBeneIds.includes(a.idBeneficiaire)) {
            allEvents.push({
              id: `ana_${a.idAnalyse}`,
              type: 'Analyses',
              date: null, // No date field on model
              title: `Analyse médicale`,
              description: `Dossier d'analyses d'un montant total de ${a.total} DH pour ${getBeneName(a.idBeneficiaire)}. Obs: ${a.observation || 'Aucune'}.`,
              status: 'info',
              statusLabel: 'Soumise',
              icon: 'fa-flask'
            });
          }
        });

        // Normalize Maladies Spéciales
        maladiesSpeciales.forEach(m => {
          if (myBeneIds.includes(m.idBeneficiaire)) {
            allEvents.push({
              id: `mal_${m.idMaladie}`,
              type: 'Maladies Spéciales',
              date: m.dateEnvoi || m.dateDepot,
              title: `Dossier Maladie Spéciale (${m.type})`,
              description: `Demande d'affection longue durée pour ${getBeneName(m.idBeneficiaire)}. Obs: ${m.observation || 'Aucune'}.`,
              status: (m.etatMaladie === 'Accordé' || m.etatMaladie === 'Validé') ? 'success' : m.etatMaladie === 'Refusé' ? 'danger' : 'warning',
              statusLabel: m.etatMaladie || 'En attente',
              icon: 'fa-heartbeat'
            });
          }
        });

        // Sort: items with dates first (descending), items without dates at the bottom
        allEvents.sort((evtA, evtB) => {
          if (!evtA.date) return 1;
          if (!evtB.date) return -1;
          return new Date(evtB.date) - new Date(evtA.date);
        });

        setEvents(allEvents);
      } catch (err) {
        console.error("Error loading comprehensive history", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const categories = ['Tous', 'Remboursements', 'Ordonnances', 'Prises en charge', 'Radios', 'Cartes', 'Analyses', 'Maladies Spéciales'];

  const filteredEvents = events.filter(evt => {
    const matchesTab = activeTab === 'Tous' || evt.type === activeTab;
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      evt.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date non spécifiée';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'success':
        return { borderColor: '#10b981', color: '#10b981' };
      case 'danger':
        return { borderColor: '#ef4444', color: '#ef4444' };
      case 'warning':
        return { borderColor: '#f59e0b', color: '#f59e0b' };
      default:
        return { borderColor: '#3b82f6', color: '#3b82f6' };
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'success':
        return 'status-badge status-traite';
      case 'danger':
        return 'status-badge status-rejete';
      case 'warning':
        return 'status-badge status-en-cours';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="historique-page" style={{ fontFamily: 'Asap, sans-serif' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>Historique Complet</h1>
        <p style={{ color: '#64748b' }}>Retrouvez la chronologie de toutes vos interactions et dossiers avec la mutuelle.</p>
      </div>

      {/* Tabs & Search controls */}
      <div className="adherent-card" style={{ marginBottom: '1.5rem', padding: '1.2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <i className="fas fa-search"></i>
            </span>
            <input 
              type="text" 
              placeholder="Rechercher par mot clé, maladie, médecin, bénéficiaire..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Categories Tab list */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '5px',
            whiteSpace: 'nowrap'
          }}>
            {categories.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: activeTab === tab ? '#006eb7' : '#cbd5e1',
                  background: activeTab === tab ? '#006eb7' : 'white',
                  color: activeTab === tab ? 'white' : '#475569',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="adherent-card">
        <h2><i className="fas fa-stream"></i> Ligne de temps (Timeline)</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#006eb7', marginBottom: '10px' }}></i>
            <p>Chargement de votre historique...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="timeline">
            {filteredEvents.map((evt) => (
              <div className="timeline-item" key={evt.id}>
                <div className="timeline-icon" style={getStatusStyle(evt.status)}>
                  <i className={`fas ${evt.icon}`}></i>
                </div>
                <div className="timeline-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '0.5rem' }}>
                    <span className="timeline-date"><i className="far fa-calendar-alt" style={{ marginRight: '6px' }}></i>{formatDate(evt.date)}</span>
                    <span className={getStatusBadgeClass(evt.status)}>
                      {evt.statusLabel}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: '700', marginBottom: '0.5rem' }}>{evt.title}</h3>
                  <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.5' }}>{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
            <i className="fas fa-history" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '1.2rem' }}></i>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>Aucun historique trouvé</h4>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>Il n'y a aucun dossier ou événement correspondant à vos critères actuels.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Historique;
