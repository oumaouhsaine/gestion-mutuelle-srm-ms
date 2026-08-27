import React, { useState, useEffect } from 'react';
import './Adherent.css';
import { useAuth } from '../../context/AuthContext';

const Medicaments = () => {
  const { user } = useAuth();
  const [medicaments, setMedicaments] = useState([]);
  const [filters, setFilters] = useState({
    codeean13: '',
    nomdelaspecialite: '',
    classeTherapeutique: '',
    forme: '',
    presentation: '',
    princepsOuGenerique: '',
    remboursable: '',
    noteObs: ''
  });
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token || ''}`
  });

  useEffect(() => {
    fetchMedicaments();
  }, []);

  const fetchMedicaments = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/medicaments', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setMedicaments(await response.json());
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des médicaments", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicaments = medicaments.filter(med => {
    const codeMatch = !filters.codeean13 || (med.codeean13 && med.codeean13.toLowerCase().includes(filters.codeean13.toLowerCase()));
    const nomMatch = !filters.nomdelaspecialite || (med.nomdelaspecialite && med.nomdelaspecialite.toLowerCase().includes(filters.nomdelaspecialite.toLowerCase()));
    const classeMatch = !filters.classeTherapeutique || (med.classeTherapeutique && med.classeTherapeutique.toLowerCase().includes(filters.classeTherapeutique.toLowerCase()));
    const formeMatch = !filters.forme || (med.forme && med.forme.toLowerCase().includes(filters.forme.toLowerCase()));
    const presMatch = !filters.presentation || (med.presentation && med.presentation.toLowerCase().includes(filters.presentation.toLowerCase()));
    const typeMatch = !filters.princepsOuGenerique || (med.princepsOuGenerique && med.princepsOuGenerique.toLowerCase().includes(filters.princepsOuGenerique.toLowerCase()));
    const rembMatch = !filters.remboursable || (med.remboursable && med.remboursable.toLowerCase().includes(filters.remboursable.toLowerCase()));
    const noteObsMatch = !filters.noteObs ||
      (med.note && med.note.toLowerCase().includes(filters.noteObs.toLowerCase())) ||
      (med.observation && med.observation.toLowerCase().includes(filters.noteObs.toLowerCase()));

    return codeMatch && nomMatch && classeMatch && formeMatch && presMatch && typeMatch && rembMatch && noteObsMatch;
  });

  const clearFilters = () => {
    setFilters({
      codeean13: '',
      nomdelaspecialite: '',
      classeTherapeutique: '',
      forme: '',
      presentation: '',
      princepsOuGenerique: '',
      remboursable: '',
      noteObs: ''
    });
  };

  return (
    <div className="medicaments-page">
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#1e293b', margin: 0 }}>Médicaments</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Consultez la liste complète des médicaments enregistrés en base et filtrez par colonne.</p>
        </div>
      </div>

      {!loading && (
        <div className="adherent-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #edf2f7', paddingBottom: '0.8rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#006eb7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-filter" style={{ color: '#fb8c00' }}></i> Filtres de recherche par colonne
            </h3>
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 14px',
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <i className="fas fa-undo"></i> Réinitialiser les filtres
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Code EAN13</label>
              <input
                type="text"
                placeholder="Filtrer par code..."
                value={filters.codeean13}
                onChange={e => setFilters({ ...filters, codeean13: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nom Spécialité</label>
              <input
                type="text"
                placeholder="Filtrer par nom..."
                value={filters.nomdelaspecialite}
                onChange={e => setFilters({ ...filters, nomdelaspecialite: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Classe Thérapeutique</label>
              <input
                type="text"
                placeholder="Filtrer par classe..."
                value={filters.classeTherapeutique}
                onChange={e => setFilters({ ...filters, classeTherapeutique: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Forme</label>
              <input
                type="text"
                placeholder="Filtrer par forme..."
                value={filters.forme}
                onChange={e => setFilters({ ...filters, forme: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Présentation</label>
              <input
                type="text"
                placeholder="Filtrer par présentation..."
                value={filters.presentation}
                onChange={e => setFilters({ ...filters, presentation: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Type (Princeps/Gén.)</label>
              <input
                type="text"
                placeholder="Filtrer par type..."
                value={filters.princepsOuGenerique}
                onChange={e => setFilters({ ...filters, princepsOuGenerique: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Remboursable</label>
              <input
                type="text"
                placeholder="Filtrer..."
                value={filters.remboursable}
                onChange={e => setFilters({ ...filters, remboursable: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Note / Observation</label>
              <input
                type="text"
                placeholder="Filtrer par note/obs..."
                value={filters.noteObs}
                onChange={e => setFilters({ ...filters, noteObs: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#f8fafc', outline: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="adherent-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Chargement des médicaments...
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="adherent-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontWeight: '700' }}>Code EAN13</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontWeight: '700' }}>Nom Spécialité</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontWeight: '700' }}>Classe Thérapeutique</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontWeight: '700' }}>Forme</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontWeight: '700' }}>Présentation</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontWeight: '700' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontWeight: '700' }}>Remboursable</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#475569', fontWeight: '700' }}>Note / Obs</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicaments.length > 0 ? (
                  filteredMedicaments.map(med => (
                    <tr key={med.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#0f172a' }}>{med.codeean13 || 'N/A'}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#006eb7' }}>{med.nomdelaspecialite || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{med.classeTherapeutique || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{med.forme || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '0.9rem', color: '#475569' }}>{med.presentation || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{med.princepsOuGenerique || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`status-badge ${med.remboursable === 'Oui' || med.remboursable === 'OUI' || med.remboursable === 'YES' || med.remboursable === 'yes' ? 'status-traite' : 'status-rejete'}`}>
                          {med.remboursable || 'Non'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                        {med.note ? `Note: ${med.note}` : ''} {med.observation ? `Obs: ${med.observation}` : ''}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      Aucun médicament trouvé correspondant à vos critères de recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medicaments;
