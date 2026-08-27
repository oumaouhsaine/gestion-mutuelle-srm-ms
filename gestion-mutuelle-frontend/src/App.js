import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login/Login';
import DashboardLayout from './Dashboard/DashboardLayout';
import DashboardHome from './pages/DashboardHome/DashboardHome';
import Agents from './pages/Agents/Agents';
import DevisDentaire from './pages/Devis/DevisDentaire';
import DevisOptique from './pages/Devis/DevisOptique';
import AdminNotifications from './pages/Admin/Notifications';
import Utilisateurs from './pages/Admin/Utilisateurs';
import Corbeille from './pages/Corbeille/Corbeille';

import Direction from './pages/Organisation/Direction';
import Departement from './pages/Organisation/Departement';
import Division from './pages/Organisation/Division';
import Service from './pages/Organisation/Service';
import Entite from './pages/Organisation/Entite';

import Radio from './pages/Radio/Radio';
import PriseEnCharge from './pages/PriseEnCharge/PriseEnCharge';
import MaladieSpeciale from './pages/MaladieSpeciale/MaladieSpeciale';
import Analyse from './pages/Analyse/Analyse';
import Ordonnance from './pages/Ordonnance/Ordonnance';
import Etablissement from './pages/Etablissement/Etablissement';
import Medecin from './pages/Medecin/Medecin';
import Remboursement from './pages/Remboursement/Remboursement';
import CarteMutuelle from './pages/CarteMutuelle/CarteMutuelle';
import AdherentLayout from './pages/Adherent/AdherentLayout';
import AdherentHome from './pages/Adherent/AdherentHome';
import Medicaments from './pages/Adherent/Medicaments';
import SuiviRemboursements from './pages/Adherent/SuiviRemboursements';
import WorkflowDevis from './pages/Adherent/WorkflowDevis';
import Historique from './pages/Adherent/Historique';
import Compte from './pages/Adherent/Compte';
import ChatBot from './components/ChatBot/ChatBot';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_OPERATEUR', 'ROLE_CONSULTANT']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="agents" element={<Agents />} />
            <Route path="devis/dentaire" element={<DevisDentaire />} />
            <Route path="devis/optique" element={<DevisOptique />} />
            <Route 
              path="notifications" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminNotifications />
                </ProtectedRoute>
              } 
            />
            <Route path="radio" element={<Radio />} />
            <Route path="prise-en-charge" element={<PriseEnCharge />} />
            <Route path="maladie-speciale" element={<MaladieSpeciale />} />
            <Route path="analyse" element={<Analyse />} />
            <Route path="ordonnance" element={<Ordonnance />} />
            <Route path="etablissement" element={<Etablissement />} />
            <Route path="medecin" element={<Medecin />} />
            <Route path="remboursement" element={<Remboursement />} />
            <Route path="carte-mutuelle" element={<CarteMutuelle />} />
            
            {/* Organisation Hierarchy Routes */}
            <Route path="organisation/direction" element={<Direction />} />
            <Route path="organisation/departement" element={<Departement />} />
            <Route path="organisation/division" element={<Division />} />
            <Route path="organisation/service" element={<Service />} />
            <Route path="organisation/entite" element={<Entite />} />
            <Route 
              path="utilisateurs" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Utilisateurs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="corbeille" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Corbeille />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          {/* Adhérent Routes */}
          <Route 
            path="/adherent" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_CLIENT']}>
                <AdherentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdherentHome />} />
            <Route path="medicaments" element={<Medicaments />} />
            <Route path="remboursements" element={<SuiviRemboursements />} />
            <Route path="devis/nouveau" element={<WorkflowDevis />} />
            <Route path="devis/dentaire" element={<DevisDentaire />} />
            <Route path="devis/optique" element={<DevisOptique />} />
            <Route path="historique" element={<Historique />} />
            <Route path="compte" element={<Compte />} />
          </Route>
        </Routes>
        <ChatBot />
      </Router>
    </AuthProvider>
  );
}

export default App;
