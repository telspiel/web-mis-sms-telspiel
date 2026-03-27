
//-------------------ENABLE REFRESH ON PAGE SWITCH------------------------------
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faTachometerAlt,
  faClipboardList,
  faLink,
  faBullhorn,
  faChartBar,
  faPhone,
  faNetworkWired, 
  faBan,
  faDollar,
  faIndianRupeeSign,
  faChevronDown, faChevronUp, faRightLong
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ isSidebarOpen, dlrType, username, isVisualizeAllowed, userPrivileges}) {

  const navigate = useNavigate();
  const location = useLocation();
  
  const [subMenuVisibility, setSubMenuVisibility] = useState({
    dltManagement: false,
    spielyManagement: false,
    campaignManagement: false,
    reportManagement: false,
    phonemanagement: false,
  });

  console.log(dlrType);
  console.log(username);
  console.log(userPrivileges);

  useEffect(() => {
    const currentPath = location.pathname;

    setSubMenuVisibility({
      dltManagement: ['/add-senderid', '/template-management', '/dlt-chain-registration'].includes(currentPath),
      spielyManagement: ['/spiely-link', '/domain-manager'].includes(currentPath),
      campaignManagement: ['/quick-campaign', '/upload-campaign', '/dynamic-campaign', '/group-campaign', '/scheduled-campaign'].includes(currentPath),
      reportManagement: ['/summary-report', '/sender-id-report', '/template-id-report', '/detailed-report', '/campaign-report', '/clicker-report', '/download-report', '/vmn-report'].includes(currentPath),
      phonemanagement: ['/individual-contacts', '/group-contacts'].includes(currentPath),
    });
  }, [location.pathname]); 

  // const toggleSubMenu = (menu) => {
  //   setSubMenuVisibility((prev) => ({
  //     ...prev,
  //     [menu]: !prev[menu], 
  //   }));
  // };
  const toggleSubMenu = (menu) => {
    setSubMenuVisibility((prev) => {
      const newVisibility = {};
      for (const key in prev) {
        newVisibility[key] = false; 
      }
      newVisibility[menu] = !prev[menu];
      return newVisibility;
    });
  };
  

  // const handleNavigation = (hash) => {
  //   window.location.hash = hash; 
  //   window.location.reload(); 
  // };

  const handleNavigation = (path) => {
    navigate(path);
    window.location.reload(); 
  } //now use "handleNavigation" instead of "navigate"

  const hideDownloadReport = ['testweb', 'apitesting'];

  const showVmnReport = ['user4', 'apitesting'];

  //SPEAK TO SEARCH
  // const [searchInput, setSearchInput] = useState('');
  // const [isListening, setIsListening] = useState(false);

  // const menuRoutes = {
  //   dashboard: '/dashboard',
  //   'add sender id': '/add-senderid',
  //   'add template': '/template-management',
  //   'dlt chain registration': '/dlt-chain-registration',
  //   'new spiely link': '/spiely-link',
  //   'domain manager': '/domain-manager',
  //   'quick campaign': '/quick-campaign',
  //   'upload campaign': '/upload-campaign',
  //   'dynamic campaign': '/dynamic-campaign',
  //   'group campaign': '/group-campaign',
  //   'scheduled campaign': '/scheduled-campaign',
  //   'summary report': '/summary-report',
  //   'sender id report': '/sender-id-report',
  //   'detailed report': '/detailed-report',
  //   'campaign report': '/campaign-report',
  //   'clicker report': '/clicker-report',
  //   'download report': '/download-report',
  //   'vmn report': '/vmn-report',
  //   'individual contacts': '/individual-contacts',
  //   'group contacts': '/group-contacts',
  //   'blacklist contacts': '/blacklist-contacts',
  //   'credit history': '/credit-history',
  // };

  // const handleVoiceSearch = () => {
  //   const SpeechRecognition =
  //     window.SpeechRecognition || window.webkitSpeechRecognition;

  //   if (!SpeechRecognition) {
  //     alert('Speech recognition not supported in this browser.');
  //     return;
  //   }

  //   const recognition = new SpeechRecognition();
  //   recognition.lang = 'en-US';

  //   setIsListening(true);
  //   recognition.start();

  //   recognition.onresult = function (event) {
  //     const transcript = event.results[0][0].transcript.toLowerCase().trim();
  //     setSearchInput(transcript);

  //     const matchedKey = Object.keys(menuRoutes).find((key) =>
  //       transcript.includes(key)
  //     );

  //     setIsListening(false);

  //     if (matchedKey) {
  //       // Small delay to show recognized text before redirect
  //       setTimeout(() => {
  //         handleNavigation(menuRoutes[matchedKey]);
  //       }, 500); // 500ms delay
  //     } else {
  //       alert('No match found');
  //     }
  //   };

  //   recognition.onerror = function (event) {
  //     setIsListening(false);
  //     alert('Voice recognition error: ' + event.error);
  //   };

  //   recognition.onend = function () {
  //     setIsListening(false);
  //   };
  // };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <h3 className="sidebar-title">TelSpiel</h3>

      {/* {dlrType !== 'MIS_PANEL' && (
      <div className="sidebar-search-filter">
            <input
              type="text"
              id="search"
              placeholder="Search Menu Option"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faMicrophone}
              className={`mic-icon ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceSearch}
              title="speak to search"
            />
            </div>
         )}     */}

      <ul className="sidebar-menu">
        <li>
          <a  
            className={`menu-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
            onClick={() => handleNavigation('/dashboard')}>
            <FontAwesomeIcon icon={faTachometerAlt} className="sidebar-icon" />
            Dashboard
          </a>
        </li>
        <li>
          <button className="menu-toggle" onClick={() => toggleSubMenu('dltManagement')}>
            <FontAwesomeIcon icon={faClipboardList} className="sidebar-icon" />
            DLT Management  
            <FontAwesomeIcon
            icon={subMenuVisibility.dltManagement ? faChevronUp : faChevronDown}
            className="arrow-icon"
            />
          </button>
          <div className={`submenu-wrapper ${subMenuVisibility.dltManagement ? 'open' : ''}`}>
          <ul className={`submenu ${subMenuVisibility.dltManagement ? 'visible' : ''}`}>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/add-senderid' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/add-senderid')}> 
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Add Sender ID</a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/template-management' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/template-management')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Add Template
              </a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/dlt-chain-registration' ? 'active' : ''}`}
              onClick={() => handleNavigation('/dlt-chain-registration')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons" />
              DLT Chain Registration
            </a>
          </li>
            </ul>
            </div>
          </li>

          
          {dlrType !== 'MIS_PANEL' && isVisualizeAllowed !== 'N' && (
        <li>
          <button className="menu-toggle" onClick={() => toggleSubMenu('spielyManagement')}>
            <FontAwesomeIcon icon={faLink} className="sidebar-icon" />
            Spiely Link Management
            <FontAwesomeIcon
            icon={subMenuVisibility.spielyManagement ? faChevronUp : faChevronDown}
            className="arrow-icon"
            />
          </button>
          <div className={`submenu-wrapper ${subMenuVisibility.spielyManagement ? 'open' : ''}`}>
          <ul className={`submenu ${subMenuVisibility.spielyManagement ? 'visible' : ''}`}>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/spiely-link' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/spiely-link')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>  
              New Spiely Link</a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/domain-manager' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/domain-manager')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>  
              Domain Manager</a>
            </li>
          </ul>
          </div>
        </li>
        )}
          

          {/* {(
            (dlrType !== 'MIS_PANEL' && isVisualizeAllowed !== 'N') || 
            (dlrType === 'MIS_PANEL' && isVisualizeAllowed === 'Y')
          ) && (
            <li>
              <button className="menu-toggle" onClick={() => toggleSubMenu('spielyManagement')}>
                <FontAwesomeIcon icon={faLink} className="sidebar-icon" />
                Spiely Link Management
                <FontAwesomeIcon
                  icon={subMenuVisibility.spielyManagement ? faChevronUp : faChevronDown}
                  className="arrow-icon"
                />
              </button>
              <div className={`submenu-wrapper ${subMenuVisibility.spielyManagement ? 'open' : ''}`}>
                <ul className={`submenu ${subMenuVisibility.spielyManagement ? 'visible' : ''}`}>
                  <li>
                    <a
                      className={`submenu-link ${location.pathname === '/spiely-link' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/spiely-link')}
                    >
                      <FontAwesomeIcon icon={faRightLong} className="submenu-icons" />
                      New Spiely Link
                    </a>
                  </li>
                  <li>
                    <a
                      className={`submenu-link ${location.pathname === '/domain-manager' ? 'active' : ''}`}
                      onClick={() => handleNavigation('/domain-manager')}
                    >
                      <FontAwesomeIcon icon={faRightLong} className="submenu-icons" />
                      Domain Manager
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          )} */}


        {dlrType !== 'MIS_PANEL' && (
        <li>
          <button className="menu-toggle" onClick={() => toggleSubMenu('campaignManagement')}>
            <FontAwesomeIcon icon={faBullhorn} className="sidebar-icon" />
            Campaign Management
            <FontAwesomeIcon
            icon={subMenuVisibility.campaignManagement ? faChevronUp : faChevronDown}
            className="arrow-icon"
            />
          </button>
          <div className={`submenu-wrapper ${subMenuVisibility.campaignManagement ? 'open' : ''}`}>
          <ul className={`submenu ${subMenuVisibility.campaignManagement ? 'visible' : ''}`}>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/quick-campaign' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/quick-campaign')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>  
              Quick Campaign</a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/upload-campaign' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/upload-campaign')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>  
              Upload Campaign</a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/dynamic-campaign' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/dynamic-campaign')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Dynamic Campaign</a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/group-campaign' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/group-campaign')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Group Campaign</a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/scheduled-campaign' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/scheduled-campaign')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Scheduled Campaign</a>
            </li>
          </ul>
          </div>
        </li>
        )}

        <li>
          <button className="menu-toggle" onClick={() => toggleSubMenu('reportManagement')}>
            <FontAwesomeIcon icon={faChartBar} className="sidebar-icon" />
            Report Management
            <FontAwesomeIcon
            icon={subMenuVisibility.reportManagement ? faChevronUp : faChevronDown}
            className="arrow-icon"
            />
          </button>
          <div className={`submenu-wrapper ${subMenuVisibility.reportManagement ? 'open' : ''}`}>
          <ul className={`submenu ${subMenuVisibility.reportManagement ? 'visible' : ''}`}>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/summary-report' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/summary-report')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Summary Report</a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/sender-id-report' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/sender-id-report')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Sender Id Wise Report</a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/template-id-report' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/template-id-report')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Template Id Wise Report</a>
            </li>  
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/detailed-report' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/detailed-report')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Detailed Report</a>
            </li>

            {dlrType !== 'MIS_PANEL' && (
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/campaign-report' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/campaign-report')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Campaign Report</a>
            </li>
            )}

               
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/clicker-report' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/clicker-report')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Clicker Report</a>
            </li>

            {!hideDownloadReport.includes(username) && (
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/download-report' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/download-report')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Download Report</a>
            </li>
             )}

            {showVmnReport.includes(username) && (     
             <li>
              <a 
              className={`submenu-link ${location.pathname === '/vmn-report' ? 'active' : ''}`} 
              onClick={() => handleNavigation('/vmn-report')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              VMN Report</a>
            </li>
            )}

          </ul>
          </div>
        </li>

        {dlrType !== 'MIS_PANEL' && (
        <li>
          <button className="menu-toggle" onClick={() => toggleSubMenu('phonemanagement')}>
            <FontAwesomeIcon icon={faPhone} className="sidebar-icon" />
            Phonebook Management
            <FontAwesomeIcon
            icon={subMenuVisibility.phonemanagement ? faChevronUp : faChevronDown}
            className="arrow-icon"
            />
          </button>
          <div className={`submenu-wrapper ${subMenuVisibility.phonemanagement ? 'open' : ''}`}>
          <ul className={`submenu ${subMenuVisibility.phonemanagement ? 'visible' : ''}`}>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/individual-contacts' ? 'active' : ''}`}
              onClick={() => handleNavigation('/individual-contacts')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Individual Contacts</a>
            </li>
            <li>
              <a 
              className={`submenu-link ${location.pathname === '/group-contacts' ? 'active' : ''}`}
              onClick={() => handleNavigation('/group-contacts')}>
              <FontAwesomeIcon icon={faRightLong} className="submenu-icons"/>
              Group Contacts</a>
            </li>
          </ul>
          </div>
        </li>
         )}
         
        <li>
            <a 
            className={`submenu-link ${location.pathname === '/blacklist-contacts' ? 'active' : ''}`}
            onClick={() => handleNavigation('/blacklist-contacts')}>
            <FontAwesomeIcon icon={faBan} className="sidebar-icon" />
            Blacklist Contacts
          </a>
        </li>

        {userPrivileges?.includes("SHOW_CREDIT_HISTORY") && (
        <li>
            <a 
            className={`submenu-link ${location.pathname === '/credit-history' ? 'active' : ''}`}
            onClick={() => handleNavigation('/credit-history')}>
            <FontAwesomeIcon icon={faIndianRupeeSign} className="sidebar-icon" />
            Credit History
          </a>
        </li>
        )}
        
        {/* <li>
            <a 
            className={`submenu-link ${location.pathname === '/dlt-chain-registration' ? 'active' : ''}`}
            onClick={() => handleNavigation('/dlt-chain-registration')}>
            <FontAwesomeIcon icon={faNetworkWired} className="sidebar-icon" />
            DLT Chain Registration
          </a>
        </li> */}
      </ul>
    </div>
  );
}

export default Sidebar;

