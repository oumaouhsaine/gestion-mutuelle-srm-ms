import React from 'react';
import { Outlet } from 'react-router-dom';
import AdherentSidebar from './AdherentSidebar';
import Navbar from '../../Dashboard/Navbar';
import '../../Dashboard/DashboardLayout.css'; // Reusing main layout styles
import './Adherent.css';

const AdherentLayout = () => {
  return (
    <div className="dashboard-container">
      <AdherentSidebar />
      <div className="main-content">
        <Navbar />
        <main className="content-area adherent-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdherentLayout;
