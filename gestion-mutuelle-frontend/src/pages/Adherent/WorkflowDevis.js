import React, { useState } from 'react';
import './Adherent.css';

const WorkflowDevis = () => {
  const [typeDevis, setTypeDevis] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
        setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Votre devis a été soumis avec succès et est en attente de traitement.');
    // In real app, call API here
  };

  return (
    <div className="workflow-page">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>Soumettre un Devis (Workflow)</h1>
        <p style={{ color: '#64748b' }}>Envoyez vos devis optiques ou dentaires pour obtenir une estimation de remboursement avant d'engager les frais.</p>
      </div>

      <div className="adherent-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2><i className="fas fa-file-upload"></i> Nouveau dossier de devis</h2>
        
        <form className="workflow-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type de soins concerné *</label>
            <select value={typeDevis} onChange={(e) => setTypeDevis(e.target.value)} required>
              <option value="">-- Sélectionnez --</option>
              <option value="optique">Optique (Montures, Verres, Lentilles)</option>
              <option value="dentaire">Dentaire (Prothèses, Implants, Orthodontie)</option>
            </select>
          </div>

          {typeDevis && (
            <>
              <div className="form-group">
                <label>Médecin / Établissement *</label>
                <input type="text" placeholder="Nom du médecin ou de la clinique" required />
              </div>

              <div className="form-group">
                <label>Montant total devisé (MAD) *</label>
                <input type="text" placeholder="Ex: 5000" required />
              </div>

              <div className="form-group">
                <label>Importer le devis numérisé *</label>
                <div 
                  className="file-drop-zone" 
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>{fileName ? fileName : 'Cliquez ici ou glissez votre fichier PDF/Image (Max 5Mo)'}</p>
                  <input 
                    type="file" 
                    id="file-upload" 
                    style={{ display: 'none' }} 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-primary" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-paper-plane"></i> Soumettre pour accord
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default WorkflowDevis;
