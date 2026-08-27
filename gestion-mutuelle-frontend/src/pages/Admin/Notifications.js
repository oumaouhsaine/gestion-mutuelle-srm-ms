import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericTable from '../../components/GenericTable/GenericTable';
import { useAuth } from '../../context/AuthContext';

const columns = ['Matricule Agent', 'Bénéficiaire', 'Date Dépôt', 'Statut', 'Montant', 'Type Devis'];

const AdminNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user?.token || ''}`
    };
  };

  const fetchPendingDevis = async () => {
    try {
      const [dentaireRes, optiqueRes, agentsRes, beneRes] = await Promise.all([
        fetch('http://localhost:8081/api/devis-dentaire', { headers: getAuthHeaders() }),
        fetch('http://localhost:8081/api/devis-optique', { headers: getAuthHeaders() }),
        fetch('http://localhost:8081/api/agents', { headers: getAuthHeaders() }),
        fetch('http://localhost:8081/api/beneficiaires', { headers: getAuthHeaders() })
      ]);

      if (!dentaireRes.ok || !optiqueRes.ok || !agentsRes.ok || !beneRes.ok) return;

      const [dentaire, optique, agents, beneficiaries] = await Promise.all([
        dentaireRes.json(),
        optiqueRes.json(),
        agentsRes.json(),
        beneRes.json()
      ]);

      const pending = [];

      dentaire
        .filter((d) => d.etatReponse === 'En attente admin')
        .forEach((d) => {
          const bene = beneficiaries.find(b => b.idBeneficiaire == d.idBeneficiaire);
          const agent = agents.find(a => a.idAgent == bene?.idAgent);
          pending.push({
            idDevis: d.idDevis, // hidden in table but accessible in row actions
            matriculeAgent: agent ? agent.matricule : 'N/A',
            nomBeneficiaire: bene 
              ? `${bene.nom} ${bene.prenom}` 
              : (d.idBeneficiaire ? `ID: ${d.idBeneficiaire}` : 'Pas de bénéficiaire'),
            dateDepot: d.dateDepot ? d.dateDepot.split('T')[0] : '',
            etatReponse: d.etatReponse,
            montant: d.montant + ' DH',
            typeDevis: 'Dentaire'
          });
        });

      optique
        .filter((d) => d.etatReponse === 'En attente admin')
        .forEach((d) => {
          const bene = beneficiaries.find(b => b.idBeneficiaire == d.idBeneficiaire);
          const agent = agents.find(a => a.idAgent == bene?.idAgent);
          pending.push({
            idDevis: d.idDevis, // hidden in table but accessible in row actions
            matriculeAgent: agent ? agent.matricule : 'N/A',
            nomBeneficiaire: bene 
              ? `${bene.nom} ${bene.prenom}` 
              : (d.idBeneficiaire ? `ID: ${d.idBeneficiaire}` : 'Pas de bénéficiaire'),
            dateDepot: d.dateDepot ? d.dateDepot.split('T')[0] : '',
            etatReponse: d.etatReponse,
            montant: d.montant + ' DH',
            typeDevis: 'Optique'
          });
        });

      // Sort by id descending
      pending.sort((a, b) => b.idDevis - a.idDevis);
      setDevis(pending);
    } catch (e) {
      console.error('Error fetching pending devis', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDevis();
  }, [user]);

  const handleView = (row) => {
    const page = row.typeDevis === 'Dentaire' ? '/dashboard/devis/dentaire' : '/dashboard/devis/optique';
    navigate(`${page}?openDevis=${row.idDevis}`);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Notifications admin – Devis en attente de validation</h2>
      <GenericTable
        title="Liste des devis soumis"
        data={devis}
        columns={columns}
        loading={loading}
        onView={handleView}
      />
    </div>
  );
};

export default AdminNotifications;
