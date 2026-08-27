import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import './DashboardHome.css';

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/stats/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Chargement des statistiques...</div>;

  // Préparation des données pour les graphiques
  const rembStatusData = stats && stats.remboursementsStatusDist ? Object.keys(stats.remboursementsStatusDist).map(key => ({
    name: key,
    value: stats.remboursementsStatusDist[key]
  })) : [];

  const monthlyRembData = stats && stats.monthlyRembEvolution ? Object.keys(stats.monthlyRembEvolution).map(key => ({
    name: key,
    dossiers: stats.monthlyRembEvolution[key]
  })) : [];

  const devisTypeData = stats && stats.devisTypeDist ? Object.keys(stats.devisTypeDist).map(key => ({
    name: key,
    value: stats.devisTypeDist[key]
  })) : [];

  const beneficiaireData = stats && stats.beneficiaireDist ? Object.keys(stats.beneficiaireDist).map(key => ({
    name: key,
    value: stats.beneficiaireDist[key]
  })) : [];

  const directionData = stats && stats.agentByDirection ? Object.keys(stats.agentByDirection).map(key => ({
    name: key,
    value: stats.agentByDirection[key]
  })) : [];

  const pecStatusData = stats && stats.pecStatusDist ? Object.keys(stats.pecStatusDist).map(key => ({
    name: key,
    value: stats.pecStatusDist[key]
  })) : [];

  const COLORS_REMB = ['#10b981', '#ef4444', '#f59e0b']; // Acceptés (Green), Rejetés (Red), En cours (Amber)
  const COLORS_DEVIS = ['#0ea5e9', '#ec4899']; // Dentaires (Sky), Optiques (Pink)
  const COLORS_BENE = ['#8b5cf6', '#f43f5e']; // Conjoints (Purple), Enfants (Rose)
  const COLORS_PEC = ['#10b981', '#ef4444', '#64748b']; // Acceptées (Green), Refusées (Red), En attente (Slate)
  const COLOR_LINE = '#3b82f6'; // Blue line
  const COLOR_BAR_DIR = '#6366f1'; // Indigo bar

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <h1>Tableau de Bord Décisionnel</h1>
        <p>Analyse et statistiques de l'activité SRM-MS en temps réel</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card cyan">
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-details">
            <span className="stat-title">Adhérents</span>
            <h3 className="stat-value">{stats?.totalAdherents || 0}</h3>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon"><i className="fas fa-child"></i></div>
          <div className="stat-details">
            <span className="stat-title">Bénéficiaires</span>
            <h3 className="stat-value">{stats?.totalBeneficiaires || 0}</h3>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon"><i className="fas fa-file-invoice-dollar"></i></div>
          <div className="stat-details">
            <span className="stat-title">Dossiers Remboursement</span>
            <h3 className="stat-value">{stats?.totalRemboursements || 0}</h3>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon"><i className="fas fa-hand-holding-medical"></i></div>
          <div className="stat-details">
            <span className="stat-title">Prises en Charge (PEC)</span>
            <h3 className="stat-value">{stats?.totalPec || 0}</h3>
          </div>
        </div>

        <div className="stat-card rose">
          <div className="stat-icon"><i className="fas fa-arrow-trend-up"></i></div>
          <div className="stat-details">
            <span className="stat-title">Montant Demandé</span>
            <h3 className="stat-value">{stats?.montantDemandeTotal?.toLocaleString()} DH</h3>
          </div>
        </div>

        <div className="stat-card emerald">
          <div className="stat-icon"><i className="fas fa-money-bill-wave"></i></div>
          <div className="stat-details">
            <span className="stat-title">Montant Remboursé</span>
            <h3 className="stat-value">{stats?.montantAccordeTotal?.toLocaleString()} DH</h3>
          </div>
        </div>

        <div className="stat-card indigo">
          <div className="stat-icon"><i className="fas fa-id-card"></i></div>
          <div className="stat-details">
            <span className="stat-title">Cartes Mutuelles Actives</span>
            <h3 className="stat-value">{stats?.totalCartesActives || 0}</h3>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Statistiques des remboursements par statut */}
        <div className="chart-card">
          <h3><i className="fas fa-chart-pie"></i> Statut des remboursements</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rembStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {rembStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_REMB[index % COLORS_REMB.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} dossier(s)`, 'Nombre']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistiques des devis */}
        <div className="chart-card">
          <h3><i className="fas fa-hand-holding-medical"></i> Répartition des Devis</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={devisTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {devisTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_DEVIS[index % COLORS_DEVIS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} devis`, 'Nombre']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Évolution mensuelle des remboursements */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3><i className="fas fa-chart-line"></i> Évolution mensuelle des remboursements</h3>
          <div className="chart-container" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRembData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} dossier(s)`, 'Traités']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="dossiers" 
                  stroke={COLOR_LINE} 
                  strokeWidth={3} 
                  activeDot={{ r: 8 }} 
                  name="Nombre de dossiers traités" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistiques des bénéficiaires */}
        <div className="chart-card">
          <h3><i className="fas fa-users-line"></i> Répartition des bénéficiaires</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={beneficiaireData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {beneficiaireData.map((entry, index) => {
                    let fill = COLORS_BENE[index % COLORS_BENE.length];
                    if (entry.name.toLowerCase().includes('autre')) {
                      fill = '#94a3b8'; // Slate/gray color for "Autres"
                    }
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Pie>
                <Tooltip formatter={(value) => [`${value} personne(s)`, 'Nombre']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistiques des PEC */}
        <div className="chart-card">
          <h3><i className="fas fa-shield-halved"></i> PEC par Statut</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pecStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pecStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PEC[index % COLORS_PEC.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} demande(s)`, 'Nombre']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistiques organisationnelles */}
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3><i className="fas fa-sitemap"></i> Répartition des adhérents par direction</h3>
          <div className="chart-container" style={{ height: '350px' }}>
            {directionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={directionData} layout="vertical" margin={{ left: 50, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${value} adhérent(s)`, 'Total']} />
                  <Legend />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Nombre d'adhérents">
                    {directionData.map((entry, index) => {
                      const isOther = entry.name.toLowerCase().includes("sans") || entry.name.toLowerCase().includes("autre");
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isOther ? '#94a3b8' : COLOR_BAR_DIR} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
                Aucun adhérent lié à une direction.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
