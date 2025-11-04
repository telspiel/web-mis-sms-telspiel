import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import Endpoints from '../endpoints';
import "./Profile.css";
import telspielLogo from "../../images/telspLogo-nobg1.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";


function Profile({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [activeTab, setActiveTab] = useState('profile'); 

    const [userDataState, setUserData] = useState({});

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const [responseMessage, setResponseMessage] = useState("");
    const responseMsgRef = useRef(null); 


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };
    
      const handleTabSwitch = (tab) => {
        setActiveTab(tab);
      };

      //Set eye icon to see the password entered 
      const [showCurrentPassword, setShowCurrentPassword] = useState(false);
      const [showNewPassword, setShowNewPassword] = useState(false);
      const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);



     //To get profile details
     useEffect(() => {
        const fetchProfileDetails = async () => {
          try {
            const apiEndpoint =
              userData.dlrType === "WEB_PANEL"
                ? Endpoints.get("profileDetailsWeb")
                : Endpoints.get("profileDetailsMis");
    
            const response = await fetch(apiEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: userData.authJwtToken,
              },
              body: JSON.stringify({
                loggedInUserName: userData.username,
              }),
            });
    
            const data = await response.json();
            console.log("Profile Details API response:", data);
    
            const validatedResponse = Endpoints.validateResponse(data);
            if (validatedResponse && validatedResponse.code === 16000) {
                // Update state with fetched user data
                setUserData(data.data.user);
              } else {
                console.error("Invalid response:", validatedResponse);
              }
          } catch (error) {
            console.error("Error fetching Profile Details data:", error);
          }
        };
    
        fetchProfileDetails();
      }, []); 

      //New Password Validation
      const validatePasswordRules = (password) => {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasCapital = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasMinLength = password.length >= 8;
      
        return hasLetter && hasCapital && hasNumber && hasSpecial && hasMinLength;
      };
      


      //Change Password for web user only
      const changeUserPassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
          alert("All fields are required.");
          return;
        }
    
        if (newPassword !== confirmNewPassword) {
          alert("New Password and Confirm Password do not match.");
          return;
        }

        if (!validatePasswordRules(newPassword)) {
          alert("New password does not meet the required criteria.");
          return;
        }
      
    
        try {
          const response = await fetch(Endpoints.get('changePasswordUser'), {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              Authorization: userData.authJwtToken,
            },
            body: JSON.stringify({
              loggedInUserName: userData.username,
              oldPassword: currentPassword,
              newPassword: newPassword,
            }),
          });
    
          const data = await response.json();
          console.log("Changed Password API response:", data);
    
          const validatedResponse = Endpoints.validateResponse(data);
          if (validatedResponse && validatedResponse.code === 16000) {
            setResponseMessage('Password updated. It may take up to 5 minutes to take effect');

            if (responseMsgRef.current) {
              responseMsgRef.current.classList.add("visible");
              responseMsgRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start", 
              });
            }
    
            setTimeout(() => {
              setResponseMessage("");
              responseMsgRef.current.classList.remove("visible");
            }, 6000);

            //Reset Input Fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

          } else {
            console.error("Invalid response:", validatedResponse);
            alert("Failed to change password.");
          }
        } catch (error) {
          console.error("Error Changing the password:", error);
          alert("An error occurred while changing the password.");
        }
      };

  return (
    <div className="dashboard-container">
    <Header
    toggleSidebar={toggleSidebar}
    username={userData.username}
    lastLoginTime={userData.lastLoginTime}
    lastLoginIp={userData.lastLoginIp}
    onLogout={onLogout}
    />
    <div className="dashboard-layout">
    <Sidebar isSidebarOpen={isSidebarOpen}  username={userData.username} dlrType={userData.dlrType}/>
    <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
    <div className="dashboard-content">
        <h2>Profile</h2>

        <div className="quickAlertMessage" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

         <div className="senderid-add">
              <button
                className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('profile')}
              >
                Profile 
              </button>

              {/* To hide change password section for MIS and SMPP users */}
              {!(
                userData.dlrType === 'MIS_PANEL' &&
                userData.username !== 'apitesting' &&
                userData.username !== 'newapi'
              ) && (
              <button
                className={`tab ${activeTab === 'changePassword' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('changePassword')}
              >
                Change Password
              </button>
              )}
            </div>

            {activeTab === 'profile' && (
              <div className="wrap-profile-page">
                <div className="profile-contact-container">
                    <div className='profile-logo-wrap'>
                    <img
                     src={telspielLogo}
                     alt="TelSpiel Logo"
                     className="profile-logo"
                    />
                    </div>
                  <div className='profile-contact-fetch-data'>
                   <label htmlFor="userName">Name</label>
                   <input type="text" id="userName" name="userName"
                   value={userDataState.username || ''}
                   readOnly 
                   />
                 </div>
                  <div className='profile-contact-fetch-data'>
                   <label htmlFor="password">Password</label>
                   <input 
                    type="text" 
                    id="password" 
                    name="password"
                    value={userDataState.password ? '*'.repeat(userDataState.password.length) : ''}
                    readOnly 
                   />
                 </div>
                  <div className='profile-contact-fetch-data'>
                   <label htmlFor="emailId">Email Id</label>
                   <input type="text" id="emailId" name="emailId"
                    value={userDataState.emailID || ''}
                    readOnly
                   />
                 </div>
                  <div className='profile-contact-fetch-data'>
                   <label htmlFor="mobileNumber">Mobile Number</label>
                   <input type="text" id="mobileNumber" name="mobileNumber"
                    value={userDataState.mobileNumber || ''}
                    readOnly
                   />
                 </div>
                  <div className='profile-contact-fetch-data'>
                   <label htmlFor="organization">Organization</label>
                   <input type="text" id="organization" name="organization"
                    value={userDataState.organization || ''}
                    readOnly
                   />
                 </div>
                  <div className='profile-contact-fetch-data'>
                   <label htmlFor="department">Department</label>
                   <input type="text" id="department" name="department"
                   value={userDataState.department || ''}
                   readOnly
                   />
                 </div>
                </div>
                </div>
            )}

            {activeTab === 'changePassword' && ( 
              <div className="wrap-profile-page">
                <div className="profile-contact-container">
                   <div className='change-password-field'>
                   <label htmlFor="currentPassword">Current Password</label>
                   <div className="profile-password-wrapper">
                       <input
                         type={showCurrentPassword ? "text" : "password"}
                         id="currentPassword"
                         name="currentPassword"
                         placeholder="Enter Current Password"
                         value={currentPassword}
                         onChange={(e) => setCurrentPassword(e.target.value)}
                       />
                       <span className="profile-eye-icon" onClick={() => setShowCurrentPassword(prev => !prev)}>
                         <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                       </span>
                   </div>
                   </div>
                   <div className='change-password-field'>
                   <label htmlFor="newpassword">New Password</label>
                   <div className="profile-password-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        placeholder="Enter New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                      />
                     <span className="profile-eye-icon" onClick={() => setShowNewPassword(prev => !prev)}>
                      <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                     </span>
                  </div>
                   </div>
                   <div className='change-password-field'>
                   <label htmlFor="confirmNewPassword">Confirm New Password</label>
                   <div className="profile-password-wrapper">
                     <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      placeholder="Confirm New Password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                     />
                   <span className="profile-eye-icon" onClick={() => setShowConfirmNewPassword(prev => !prev)}>
                     <FontAwesomeIcon icon={showConfirmNewPassword ? faEyeSlash : faEye} />
                   </span>
                   </div>
                   </div>

                   <div className="change-password-btn">
                     <button className="submit-button" onClick={changeUserPassword}>Submit</button>
                     <button className="cancel-button"
                     onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}>
                      Cancel
                    </button>
                    </div>

                    {/* Password requirements alert */}
                    {isPasswordFocused && (
                      <div className="password-requirements">
                        <strong>Password must meet the following requirements:</strong>
                        <ul>
                          <li>At least one letter</li>
                          <li>At least one capital letter</li>
                          <li>At least one number</li>
                          <li>At least one special character</li>
                          <li>Be at least <strong>8 characters</strong></li>
                        </ul>
                      </div>
                    )}
                </div>
                </div>
            )}

        </div>
            <Footer/>
        </div>
    </div>
    </div>
  )
}

export default Profile