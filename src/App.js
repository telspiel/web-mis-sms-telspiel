
//============================Using React Router Dom==============================
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Profile from './components/Profile/Profile';
import Dashboard from './components/Dashboard/Dashboard';
import AddSenderId from './components/AddSenderId/AddSenderId';
import TemplateManagement from './components/TemplateManagement/TemplateManagement';
import SpielyManagement from './components/SpielyManagement/SpielyManagement';
import DomainManager from './components/DomainManager/DomainManager';
import QuickCampaign from './components/QuickCampaign/QuickCampaign';
import UploadCampaign from './components/UploadCampaign/UploadCampaign';
import DynamicCampaign from './components/DynamicCampaign/DynamicCampaign';
import GroupCampaign from './components/GroupCampaign/GroupCampaign';
import ScheduledCampaign from './components/ScheduledCampaign/ScheduledCampaign';
import SummaryReport from './components/SummaryReport/SummaryReport';
import SenderIdReport from './components/SenderIdReport/SenderIdReport';
import TemplateIdReport from './components/TemplateIdReport/TemplateIdReport';
import DetailedReport from './components/DetailedReport.js/DetailedReport';
import CampaignReport from './components/CampaignReport/CampaignReport';
import ClickerReport from './components/ClickerReport/ClickerReport';
import DownloadReport from './components/DownloadReport/DownloadReport';
import VMNReport from './components/VMNReport/VMNReport';
import IndividualContacts from './components/IndividualContacts/IndividualContacts';
import GroupContacts from './components/GroupContacts/GroupContacts';
import CreditHistory from './components/CreditHistory/CreditHistory';
import BlacklistContacts from './components/BlacklistContacts/BlacklistContacts';
import DltChainRegistration from './components/DltChainRegistration/DltChainRegistration';

function App() {
  // const [isLoggedIn, setIsLoggedIn] = useState(
  //   () => JSON.parse(localStorage.getItem('isLoggedIn')) || false
  // );
  // const [userData, setUserData] = useState(
  //   () => JSON.parse(localStorage.getItem('userData')) || null
  // );
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => JSON.parse(sessionStorage.getItem('isLoggedIn')) || false
  );
  const [userData, setUserData] = useState(
    () => JSON.parse(sessionStorage.getItem('userData')) || null
  ); 

  // const [inactiveTimer, setInactiveTimer] = useState(null);

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     startSessionTimeout();
  //     window.addEventListener('mousemove', resetSessionTimeout);
  //     window.addEventListener('keypress', resetSessionTimeout);
  //     window.addEventListener('click', resetSessionTimeout);
  //   }

  //   return () => {
  //     clearTimeout(inactiveTimer);
  //     window.removeEventListener('mousemove', resetSessionTimeout);
  //     window.removeEventListener('keypress', resetSessionTimeout);
  //     window.removeEventListener('click', resetSessionTimeout);
  //   };
  // }, [isLoggedIn]);

  // const startSessionTimeout = () => {
  //   const timer = setTimeout(() => {
  //     handleLogout();
  //   }, 300000); // 5 minutes

  //   setInactiveTimer(timer);
  // };

  // const resetSessionTimeout = () => {
  //   clearTimeout(inactiveTimer);
  //   startSessionTimeout();
  // };
  const inactiveTimer = useRef(null); // Use ref instead of state

  useEffect(() => {
    if (isLoggedIn) {
      startSessionTimeout();
      window.addEventListener('mousemove', resetSessionTimeout);
      window.addEventListener('keypress', resetSessionTimeout);
      window.addEventListener('click', resetSessionTimeout);
    }

    return () => {
      clearTimeout(inactiveTimer.current);
      window.removeEventListener('mousemove', resetSessionTimeout);
      window.removeEventListener('keypress', resetSessionTimeout);
      window.removeEventListener('click', resetSessionTimeout);
    };
  }, [isLoggedIn]);

  const startSessionTimeout = () => {
    clearTimeout(inactiveTimer.current); // Ensure previous timer is cleared
    inactiveTimer.current = setTimeout(() => {
      handleLogout();
    }, 300000); // 5 minutes
  };

  const resetSessionTimeout = () => {
    clearTimeout(inactiveTimer.current);
    startSessionTimeout();
  };

  const handleLogin = (userData) => {
    setUserData(userData);
    setIsLoggedIn(true);
    // localStorage.setItem('isLoggedIn', true);
    // localStorage.setItem('userData', JSON.stringify(userData));
    sessionStorage.setItem('isLoggedIn', true);
    sessionStorage.setItem('userData', JSON.stringify(userData));
    // resetSessionTimeout();

    //new updated code
    startSessionTimeout(); 
  };

  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
    window.location.reload(); 
    // localStorage.removeItem('isLoggedIn');
    // localStorage.removeItem('userData');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userData');
    
    //new updated code
    window.location.reload();
  };

  return (
    <Router>
      <div className="App">
        {!isLoggedIn ? (
          <Routes>
            <Route path="*" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard userData={userData} onLogout={handleLogout} />} />
            <Route path="/profile" element={<Profile userData={userData} onLogout={handleLogout} />} />
            <Route path="/add-senderid" element={<AddSenderId userData={userData} onLogout={handleLogout} />} />
            <Route path="/template-management" element={<TemplateManagement userData={userData} onLogout={handleLogout} />} />
            <Route path="/spiely-link" element={<SpielyManagement userData={userData} onLogout={handleLogout} />} />
            <Route path="/domain-manager" element={<DomainManager userData={userData} onLogout={handleLogout} />} />
            <Route path="/quick-campaign" element={<QuickCampaign userData={userData} onLogout={handleLogout} />} />
            <Route path="/upload-campaign" element={<UploadCampaign userData={userData} onLogout={handleLogout} />} />
            <Route path="/dynamic-campaign" element={<DynamicCampaign userData={userData} onLogout={handleLogout} />} />
            <Route path="/group-campaign" element={<GroupCampaign userData={userData} onLogout={handleLogout} />} />
            <Route path="/scheduled-campaign" element={<ScheduledCampaign userData={userData} onLogout={handleLogout} />} />
            <Route path="/summary-report" element={<SummaryReport userData={userData} onLogout={handleLogout} />} />
            <Route path="/sender-id-report" element={<SenderIdReport userData={userData} onLogout={handleLogout} />} />
            <Route path="/template-id-report" element={<TemplateIdReport userData={userData} onLogout={handleLogout} />} />
            <Route path="/detailed-report" element={<DetailedReport userData={userData} onLogout={handleLogout} />} />
            <Route path="/campaign-report" element={<CampaignReport userData={userData} onLogout={handleLogout} />} />
            <Route path="/clicker-report" element={<ClickerReport userData={userData} onLogout={handleLogout} />} />
            <Route path="/download-report" element={<DownloadReport userData={userData} onLogout={handleLogout} />} />
            <Route path="/vmn-report" element={<VMNReport userData={userData} onLogout={handleLogout} />} />
            <Route path="/individual-contacts" element={<IndividualContacts userData={userData} onLogout={handleLogout} />} />
            <Route path="/group-contacts" element={<GroupContacts userData={userData} onLogout={handleLogout} />} />
            <Route path="/credit-history" element={<CreditHistory userData={userData} onLogout={handleLogout} />} />
            <Route path="/blacklist-contacts" element={<BlacklistContacts userData={userData} onLogout={handleLogout} />} />
            <Route path="/dlt-chain-registration" element={<DltChainRegistration userData={userData} onLogout={handleLogout} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;


