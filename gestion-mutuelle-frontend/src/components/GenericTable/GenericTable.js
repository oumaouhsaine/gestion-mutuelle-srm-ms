import React, { useState, useEffect } from 'react';
import './GenericTable.css';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

const GenericTable = ({ title, columns, data = [], onAdd, onEdit, onDelete, onView, onExport }) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isConsultant = user?.roles?.includes('ROLE_CONSULTANT');

  // Reset to page 1 on filter or data change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, data.length]);

  // Dynamic normalization of columns
  const sampleRow = data && data.length > 0 ? data[0] : null;

  const normalizedColumns = columns.map((col, index) => {
    if (typeof col === 'object' && col !== null && col.Header && col.accessor) {
      return col;
    }

    const Header = col;
    const accessor = (() => {
      if (!sampleRow) return col;
      const keys = Object.keys(sampleRow);

      const exactMatch = keys.find(k => k.toLowerCase() === col.toLowerCase());
      if (exactMatch) return exactMatch;

      const normalize = (str) => {
        if (typeof str !== 'string') return '';
        return str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "");
      };

      const normCol = normalize(col);
      const normMatch = keys.find(k => normalize(k) === normCol);
      if (normMatch) return normMatch;

      const containsId = normCol.includes('id');
      const substringMatch = keys.find(k => {
        const normKey = normalize(k);
        if (!containsId && (normKey === 'id' || normKey.startsWith('id') || normKey.endsWith('id'))) {
          return false;
        }
        return normKey.includes(normCol) || normCol.includes(normKey);
      });
      if (substringMatch) return substringMatch;

      const nonIdKeys = keys.filter(k => {
        const normKey = normalize(k);
        return !(normKey === 'id' || normKey.startsWith('id') || normKey.endsWith('id'));
      });
      if (nonIdKeys[index] !== undefined) {
        return nonIdKeys[index];
      }

      return keys[index] || col;
    })();

    return { Header, accessor };
  });

  // Filtrage par colonne
  const filteredData = data.filter(row => {
    return normalizedColumns.every(col => {
      const filterValue = (filters[col.accessor] || '').toLowerCase();
      if (!filterValue) return true;

      const value = row[col.accessor];
      if (value === null || value === undefined) return false;

      if (React.isValidElement(value)) {
        const textContent = value.props.children;
        return textContent ? textContent.toString().toLowerCase().includes(filterValue) : false;
      }
      
      return value.toString().toLowerCase().includes(filterValue);
    });
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (accessor, value) => {
    setFilters(prev => ({ ...prev, [accessor]: value }));
  };

  const handleDefaultExport = () => {
    const exportData = filteredData.map(row => {
      const cleanRow = {};
      normalizedColumns.forEach(col => {
        cleanRow[col.Header] = row[col.accessor];
      });
      return cleanRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données");
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
  };

  const renderStatusBadge = (value) => {
    if (value === null || value === undefined) return '';
    const stringVal = value.toString().trim();
    const lowerVal = stringVal.toLowerCase();

    if (
      lowerVal === 'actif' ||
      lowerVal === 'active' ||
      lowerVal === 'activé' ||
      lowerVal === 'activee' ||
      lowerVal === 'validé' ||
      lowerVal === 'valide' ||
      lowerVal === 'accepté' ||
      lowerVal === 'accepte' ||
      lowerVal === 'accordé' ||
      lowerVal === 'accorde'
    ) {
      return (
        <span className="status-badge status-active">
          <span className="status-dot"></span>
          {stringVal}
        </span>
      );
    }

    if (
      lowerVal === 'inactif' ||
      lowerVal === 'inactive' ||
      lowerVal === 'désactivé' ||
      lowerVal === 'desactive' ||
      lowerVal === 'refusé' ||
      lowerVal === 'refuse' ||
      lowerVal === 'rejeté' ||
      lowerVal === 'rejete' ||
      lowerVal === 'rejetee'
    ) {
      return (
        <span className="status-badge status-inactive">
          <span className="status-dot"></span>
          {stringVal}
        </span>
      );
    }

    if (
      lowerVal === "en cours d'analyse" ||
      lowerVal === 'en cours' ||
      lowerVal === 'analyse' ||
      lowerVal === "en cours d'analyse..." ||
      lowerVal === 'en_cours'
    ) {
      const displayVal = lowerVal.includes("analyse") ? "En analyse" : stringVal;
      return (
        <span className="status-badge status-analyzing">
          <span className="status-dot"></span>
          {displayVal}
        </span>
      );
    }

    if (
      lowerVal === 'en attente' ||
      lowerVal === 'en attente admin' ||
      lowerVal === 'attente' ||
      lowerVal === 'en_attente'
    ) {
      const displayVal = lowerVal === 'en attente admin' ? "Attente Admin" : stringVal;
      return (
        <span className="status-badge status-pending">
          <span className="status-dot"></span>
          {displayVal}
        </span>
      );
    }

    return value;
  };

  return (
    <div className="table-container">
      {/* Header avec Titre et Boutons */}
      <div className="table-header-action">
        <h2>{title}</h2>
        <div className="table-header-buttons">
          {(onExport || data.length > 0) && (
            <button className="export-btn" onClick={onExport || handleDefaultExport} title="Exporter Excel">
              <i className="fas fa-file-excel"></i> <span className="btn-text">Export Excel</span>
            </button>
          )}
          {onAdd && !isConsultant && (
            <button className="add-btn" onClick={onAdd} title="Nouveau">
              <i className="fas fa-plus"></i>
            </button>
          )}
        </div>
      </div>

      {/* Section des Filtres (Sur une seule ligne) */}
      <div className="filters-container">
        {normalizedColumns.map((col, index) => (
          <div key={index} className="filter-item">
            <div className="search-box small">
              <input
                type="text"
                placeholder={`Filtre ${col.Header}...`}
                value={filters[col.accessor] || ''}
                onChange={(e) => handleFilterChange(col.accessor, e.target.value)}
                className="filter-input"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              {normalizedColumns.map((col, index) => (
                <th key={index}>{col.Header}</th>
              ))}
              {!isConsultant && <th style={{ textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {normalizedColumns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.Cell ? col.Cell({ value: row[col.accessor], row }) : renderStatusBadge(row[col.accessor])}
                    </td>
                  ))}
                    <td className="actions-cell">
                      {onView && (
                        <button className="action-btn view-btn" onClick={() => onView(row)} title="Voir détails">
                          <i className="fas fa-eye"></i>
                        </button>
                      )}
                      {!isConsultant && onEdit && (
                        <button className="action-btn edit-btn" onClick={() => onEdit(row)} title="Modifier">
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      {!isConsultant && onDelete && isAdmin && (
                        <button className="action-btn delete-btn" onClick={() => {
                          setRowToDelete(row);
                          setShowDeleteModal(true);
                        }} title="Supprimer">
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={normalizedColumns.length + (!isConsultant ? 1 : 0)} className="empty-state">
                  Aucune donnée ne correspond à vos filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-pagination">
        <span>
          Affichage de {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} entrée(s) sur {data.length} au total
          {filteredData.length !== data.length && ` (filtré de ${data.length} entrées au total)`}
        </span>
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-icon">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h4>Confirmer la suppression</h4>
            <p>Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</p>
            <div className="delete-modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">Annuler</button>
              <button onClick={() => {
                onDelete(rowToDelete);
                setShowDeleteModal(false);
              }} className="btn btn-danger">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericTable;
