import React from 'react';
import './Adherent.css';

const SuiviRemboursements = () => {
  const remboursements = [
    { id: 'RMB-2026-001', date: '15 Mars 2026', type: 'Consultation + Pharmacie', montantDeclare: '250 MAD', montantRembourse: '175 MAD', statut: 'traite', labelStatut: 'Traité' },
    { id: 'RMB-2026-002', date: '05 Avril 2026', type: 'Analyses Médicales', montantDeclare: '450 MAD', montantRembourse: '360 MAD', statut: 'traite', labelStatut: 'Traité' },
    { id: 'RMB-2026-003', date: '20 Avril 2026', type: 'Soins Dentaires', montantDeclare: '800 MAD', montantRembourse: '-', statut: 'en-cours', labelStatut: 'En cours de traitement' },
    { id: 'RMB-2025-104', date: '10 Décembre 2025', type: 'Consultation Spécialiste', montantDeclare: '350 MAD', montantRembourse: '0 MAD', statut: 'rejete', labelStatut: 'Rejeté (Dossier incomplet)' }
  ];

  return (
    <div className="remboursements-page">
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#1e293b', margin: 0 }}>Suivi des Remboursements</h1>
          <p style={{ color: '#64748b' }}>Consultez l'état d'avancement de vos dossiers de remboursement.</p>
        </div>
        <button className="btn-primary">
          <i className="fas fa-file-invoice-dollar"></i>
          Déclarer un nouveau soin
        </button>
      </div>

      <div className="adherent-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2><i className="fas fa-list-ul"></i> Vos dossiers</h2>
          <select style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option>Tous les états</option>
            <option>En cours</option>
            <option>Traités</option>
            <option>Rejetés</option>
          </select>
        </div>

        <table className="adherent-table">
          <thead>
            <tr>
              <th>Réf. Dossier</th>
              <th>Date Dépôt</th>
              <th>Type de Soins</th>
              <th>Montant Engagé</th>
              <th>Montant Remboursé</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {remboursements.map(remb => (
              <tr key={remb.id}>
                <td style={{ fontWeight: '600', color: '#006eb7' }}>{remb.id}</td>
                <td>{remb.date}</td>
                <td>{remb.type}</td>
                <td>{remb.montantDeclare}</td>
                <td style={{ fontWeight: '600' }}>{remb.montantRembourse}</td>
                <td>
                  <span className={`status-badge status-${remb.statut}`}>
                    {remb.labelStatut}
                  </span>
                </td>
                <td>
                  <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}>
                    <i className="fas fa-eye" title="Voir les détails"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuiviRemboursements;
