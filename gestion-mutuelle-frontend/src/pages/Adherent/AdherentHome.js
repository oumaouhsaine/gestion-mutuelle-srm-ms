import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Adherent.css';

const AdherentHome = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    optiqueCount: 0,
    dentaireCount: 0,
    totalOnline: 0,
    accordeCount: 0,
    refuseCount: 0,
    pendingCount: 0,
    totalReimbursed: 0,
    totalRequested: 0,
    beneficiairesCount: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s.includes('accordé') || s.includes('traité') || s.includes('validé')) {
      return <span className="status-badge status-traite">Accordé</span>;
    } else if (s.includes('refusé') || s.includes('rejeté')) {
      return <span className="status-badge status-rejete">Refusé</span>;
    } else {
      return <span className="status-badge status-en-cours">En cours</span>;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // 1. Fetch agents & beneficiaries
        const [agentsRes, beneRes] = await Promise.all([
          fetch('http://localhost:8081/api/agents', { headers: getAuthHeaders() }),
          fetch('http://localhost:8081/api/beneficiaires', { headers: getAuthHeaders() })
        ]);

        if (!agentsRes.ok || !beneRes.ok) return;

        const agents = await agentsRes.json();
        const beneficiaries = await beneRes.json();

        // 2. Find matching agent for logged-in user
        const myAgent = agents.find(a => Number(a.idUser) === Number(user?.id));
        if (!myAgent) {
          setLoading(false);
          return;
        }

        // 3. Find family beneficiaries
        const myBeneficiaries = beneficiaries.filter(b => Number(b.idAgent) === Number(myAgent.idAgent));
        const myBeneficiaryIds = myBeneficiaries.map(b => b.idBeneficiaire);

        // 4. Fetch devis and remboursements
        const [optiqueRes, dentaireRes, rembRes] = await Promise.all([
          fetch('http://localhost:8081/api/devis-optique', { headers: getAuthHeaders() }),
          fetch('http://localhost:8081/api/devis-dentaire', { headers: getAuthHeaders() }),
          fetch('http://localhost:8081/api/remboursements', { headers: getAuthHeaders() })
        ]);

        const optiqueList = optiqueRes.ok ? await optiqueRes.json() : [];
        const dentaireList = dentaireRes.ok ? await dentaireRes.json() : [];
        const rembList = rembRes.ok ? await rembRes.json() : [];

        // 5. Filter records for household
        const myOptique = optiqueList.filter(d => myBeneficiaryIds.includes(d.idBeneficiaire));
        const myDentaire = dentaireList.filter(d => myBeneficiaryIds.includes(d.idBeneficiaire));
        const myRemb = rembList.filter(r => myBeneficiaryIds.includes(r.idBeneficiaire));

        // 6. Compute counts
        const optiqueCount = myOptique.length;
        const dentaireCount = myDentaire.length;
        const totalOnline = optiqueCount + dentaireCount + myRemb.length;

        // Accepted (Accordé)
        const optiqueAcc = myOptique.filter(d => d.etatReponse === 'Accordé' || d.etatReponse === 'Prise en charge').length;
        const dentaireAcc = myDentaire.filter(d => d.etatReponse === 'Accordé' || d.etatReponse === 'Prise en charge').length;
        const rembAcc = myRemb.filter(r => r.statut === 'Accordé').length;
        const accordeCount = optiqueAcc + dentaireAcc + rembAcc;

        // Rejected (Refusé)
        const optiqueRef = myOptique.filter(d => d.etatReponse === 'Refusé').length;
        const dentaireRef = myDentaire.filter(d => d.etatReponse === 'Refusé').length;
        const rembRef = myRemb.filter(r => r.statut === 'Rejeté' || r.statut === 'Refusé').length;
        const refuseCount = optiqueRef + dentaireRef + rembRef;

        // Pending (En cours)
        const pendingCount = totalOnline - (accordeCount + refuseCount);

        // Sums
        const totalReimbursed = myRemb.filter(r => r.statut === 'Accordé').reduce((sum, r) => sum + (r.montantAccorde || 0), 0);
        const totalRembRequested = myRemb.reduce((sum, r) => sum + (r.montantDemande || 0), 0);
        const totalOptiqueRequested = myOptique.reduce((sum, d) => sum + (d.montant || 0), 0);
        const totalDentaireRequested = myDentaire.reduce((sum, d) => sum + (d.montant || 0), 0);
        const totalRequested = totalRembRequested + totalOptiqueRequested + totalDentaireRequested;

        setStats({
          optiqueCount,
          dentaireCount,
          totalOnline,
          accordeCount,
          refuseCount,
          pendingCount,
          totalReimbursed,
          totalRequested,
          beneficiairesCount: myBeneficiaries.length
        });

        // 7. Recent activities mapping
        const activities = [];
        myOptique.forEach(d => {
          activities.push({
            date: d.dateDepot || d.dateDevis,
            type: 'Devis Optique',
            montant: d.montant ? `${d.montant} DH` : '-',
            statut: d.etatReponse || 'En cours'
          });
        });

        myDentaire.forEach(d => {
          activities.push({
            date: d.dateDepot || d.dateDevis,
            type: 'Devis Dentaire',
            montant: d.montant ? `${d.montant} DH` : '-',
            statut: d.etatReponse || 'En cours'
          });
        });

        myRemb.forEach(r => {
          activities.push({
            date: r.dateDemande,
            type: `Remboursement (${r.type})`,
            montant: r.montantDemande ? `${r.montantDemande} DH` : '-',
            statut: r.statut || 'En cours'
          });
        });

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivities(activities.slice(0, 5));

      } catch (error) {
        console.error("Erreur calcul stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid #e2e8f0', borderTop: '5px solid #006eb7', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#64748b', fontWeight: '500' }}>Chargement du tableau de bord...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Calculate actual coverage rate or default to typical default mutuelle percentage if totalRequested is 0
  const coverageRate = stats.totalRequested > 0 
    ? Math.round((stats.totalReimbursed / stats.totalRequested) * 100) 
    : 80;

  return (
    <div className="adherent-home">
      <div className="page-header">
        <h1>Bienvenue dans votre Espace Adhérent</h1>
        <p>Retrouvez ici la synthèse de votre dossier médical et de vos remboursements.</p>
      </div>

      {/* Top Cards row */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-header">
            <span>Remboursements Reçus</span>
            <i className="fas fa-wallet"></i>
          </div>
          <div className="stat-value">{stats.totalReimbursed.toLocaleString()} DH</div>
          <div className="stat-label">Somme totale approuvée</div>
        </div>

        <div className="stat-item orange">
          <div className="stat-header">
            <span>Dossiers en cours</span>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-value">{stats.pendingCount}</div>
          <div className="stat-label">En cours d'analyse</div>
        </div>

        <div className="stat-item green">
          <div className="stat-header">
            <span>Membres couverts</span>
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-value">{stats.beneficiairesCount}</div>
          <div className="stat-label">Foyer & Ayants droit</div>
        </div>
      </div>

      {/* Live Statistics Cards Grid */}
      <div className="adherent-columns-layout">
        
        {/* Core requested stats */}
        <div className="adherent-card zero-margin">
          <h2>
            <i className="fas fa-chart-line header-icon-orange"></i> Statistiques de vos Dossiers
          </h2>

          <div className="adherent-two-columns">
            
            {/* Devis Counts */}
            <div className="adherent-sub-card">
              <h4>
                <i className="fas fa-file-invoice header-icon-blue"></i> Devis Soumis
              </h4>
              <div className="adherent-flex-list">
                <div className="adherent-flex-row">
                  <span className="adherent-row-label">
                    <i className="fas fa-glasses label-icon"></i> Devis Optiques
                  </span>
                  <strong className="adherent-row-value">{stats.optiqueCount}</strong>
                </div>
                <div className="adherent-flex-row">
                  <span className="adherent-row-label">
                    <i className="fas fa-tooth label-icon"></i> Devis Dentaires
                  </span>
                  <strong className="adherent-row-value">{stats.dentaireCount}</strong>
                </div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="adherent-sub-card">
              <h4>
                <i className="fas fa-folder-open header-icon-orange"></i> Distribution des Dossiers
              </h4>
              <div className="adherent-progress-list">
                <div className="adherent-progress-item-flat">
                  <div className="adherent-flex-row">
                    <span className="progress-label-blue">Dossiers en ligne</span>
                    <strong>{stats.totalOnline}</strong>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill fill-blue" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="adherent-progress-item-flat">
                  <div className="adherent-flex-row">
                    <span className="progress-label-green">Dossiers Accordés</span>
                    <strong>{stats.accordeCount}</strong>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill fill-green" style={{ width: stats.totalOnline > 0 ? `${(stats.accordeCount / stats.totalOnline) * 100}%` : '0%' }}></div>
                  </div>
                </div>

                <div className="adherent-progress-item-flat">
                  <div className="adherent-flex-row">
                    <span className="progress-label-red">Dossiers Refusés</span>
                    <strong>{stats.refuseCount}</strong>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill fill-red" style={{ width: stats.totalOnline > 0 ? `${(stats.refuseCount / stats.totalOnline) * 100}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Other Premium Adherent Stats */}
        <div className="adherent-card zero-margin">
          <h2>
            <i className="fas fa-heartbeat header-icon-green"></i> Indicateurs de Couverture
          </h2>

          <div className="adherent-progress-list gap-large">
            
            {/* Taux de couverture */}
            <div>
              <div className="adherent-flex-row">
                <span className="coverage-title">Taux effectif de remboursement</span>
                <span className="coverage-percentage">{coverageRate}%</span>
              </div>
              <div className="progress-bar-track height-large">
                <div className="progress-bar-fill fill-gradient-green" style={{ width: `${coverageRate}%` }}></div>
              </div>
              <span className="coverage-sub">Sur la base de tous vos remboursements demandés vs accordés</span>
            </div>

            {/* Healthcare Expenses Summary */}
            <div className="adherent-summary-row">
              <div>
                <span className="summary-label">COÛT TOTAL LOGUÉ</span>
                <strong className="summary-value value-dark">{stats.totalRequested.toLocaleString()} DH</strong>
              </div>
              <div>
                <span className="summary-label">RESTE À VOTRE CHARGE</span>
                <strong className="summary-value value-red">{(stats.totalRequested - stats.totalReimbursed).toLocaleString()} DH</strong>
              </div>
            </div>
            
          </div>
        </div>

      </div>

      {/* Dynamic Recent Activities */}
      <div className="adherent-card">
        <h2><i className="fas fa-bell"></i> Vos dernières activités</h2>
        {recentActivities.length > 0 ? (
          <table className="adherent-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activité</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((act, index) => (
                <tr key={index}>
                  <td>{formatDate(act.date)}</td>
                  <td style={{ fontWeight: '500', color: '#1e293b' }}>{act.type}</td>
                  <td>{act.montant}</td>
                  <td>{getStatusBadge(act.statut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <i className="fas fa-history" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
            <p>Aucune activité récente à afficher.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdherentHome;
