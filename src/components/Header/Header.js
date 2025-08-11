import React from 'react';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

function Header({ toggleSidebar, username, lastLoginTime, lastLoginIp, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); 
    window.location.reload(); 
    handleNavigation("/login");
  };

   const handleNavigation = (path) => {
    navigate(path);
    window.location.reload(); 
  } //now use "handleNavigation" instead of "navigate"

  return (
    <div className="header">
      <button className="hamburger-menu" onClick={toggleSidebar}>
        ☰
      </button>
      {/* <h1 className="header-title">Welcome</h1> */}
      <div className="header-right">
        <div className="header-info">
          
          <p className="login-time">
            <strong>Last Login:</strong> {lastLoginTime}
          </p>
          <p className="login-ip">
            <strong>IP:</strong> {lastLoginIp}
          </p>
          <p className='profile-page'>
           <a onClick={() => handleNavigation("/profile")}>
            <FontAwesomeIcon icon={faUser} className="userIcon" /> {username}
            </a> 
          </p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;
