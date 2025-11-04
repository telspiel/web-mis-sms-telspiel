import React, {useState, useEffect, useRef} from 'react'
import Header from '../Header/Header'
import Footer from '../Footer/Footer';
import Sidebar from '../Sidebar/Sidebar'
import "./DltChainRegistration.css";
import Endpoints from '../endpoints';

function DltChainRegistration({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [dltChainNumber, setDltChainNumber] = useState('');

    const [dltData, setDltData] = useState([]);

    const [responseMessage, setResponseMessage] = useState("");
    const [showResponseMessage, setShowResponseMessage] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

      const fetchDltData = async () => {
        try {
            const apiEndpoint =
            userData.dlrType === "WEB_PANEL"
              ? Endpoints.get("dltViewDataWeb")
              : Endpoints.get("dltViewDataMis");

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
        console.log("DLT Data API response:", data);

        if (data.dltHashValue && data.dltValue) {
            setDltData([{ dltHashValue: data.dltHashValue, dltValue: data.dltValue }]);
        } else {
            console.error("Unexpected response format:", data);
        }
        } catch (error) {
        console.error("Error fetching DLT data:", error);
        }
    };

    useEffect(() => {
        fetchDltData();
    }, []);  

    const handleDltChainNumberChange = (value) => {
        // Allow only numbers and commas
        const regex = /^[0-9,]*$/;
        if (regex.test(value)) {
            setDltChainNumber(value);
        }
    };

    const saveDltUpdateValue = async (e) => {
        e.preventDefault();
        setIsLoading(true); 

        try {
            const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                    ? Endpoints.get("dltSaveValueWeb")
                    : Endpoints.get("dltSaveValueMis");

            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: userData.authJwtToken,
                },
                body: JSON.stringify({
                    dltValue: dltChainNumber,
                    loggedInUserName: userData.username,
                }),
            });

            const data = await response.text();
            console.log("DLT Save API response (text):", data);

            if (response.ok) {
                setResponseMessage("DLT data saved successfully...");
                setShowResponseMessage(true);
                setDltChainNumber(""); // Clear input
                await fetchDltData(); // update dlt table data

                setTimeout(() => {
                    setShowResponseMessage(false);
                }, 3000);
            } else {
                console.error("Error response:", data);
            }
        } catch (error) {
            console.error("Error calling DLT Save API:", error);
        } finally {
          setIsLoading(false); // Hide loader after API call completes
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
        <Sidebar isSidebarOpen={isSidebarOpen} 
        dlrType={userData.dlrType}
        username={userData.username}
        isVisualizeAllowed={userData.isVisualizeAllowed}
        userPrivileges={userData.userPrivileges}
        />
        <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="dashboard-content">
            <h2>DLT Chain Registration</h2>

            <div  className={`dltChainResponse ${showResponseMessage ? 'visible' : ''}`}>
                <p>{responseMessage}</p>
            </div>

            <div className="wrap-dlt-chain">
            <div className="dlt-form-container">
              <form onSubmit={saveDltUpdateValue}>
                <input
                  type="text"
                  id="dltChainNumber"
                  placeholder="Enter DLT Chain Number"
                  value={dltChainNumber}
                  onChange={(e) => handleDltChainNumberChange(e.target.value)}
                  required
                />
                <p className="dlt-info-text">
                  <strong>Input String:</strong> PEID, TM1ID, TM2ID, TVL <br />
                  <strong>Sample:</strong> 1000000000,1000000001,1000000002,1000000004
                </p>
                <button type="submit" className="dlt-form-submit">
                  Submit
                </button>
              </form>
            </div>
            </div>

            <div className="wrap-dlt-chain">
                <table className="dlt-chain-table">
                  <thead>
                    <tr>
                      <th>DLT Value</th>
                      <th>DLT Hash Value</th>
                    </tr>
                  </thead>
                  <tbody>
                  {dltData.length > 0 ? (
                    dltData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.dltValue}</td>
                        <td>{row.dltHashValue}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center' }}>
                        No data available
                      </td>
                    </tr>
                  )}
                  </tbody>
                </table>  
                </div>          
          </div>
        <Footer /> 
          </div>
        </div>

        {isLoading && (
        <div className="loader-overlay">
          <div className="loader"></div>
          <p>Please wait...</p>
        </div>
      )}
      
    </div>
  )
}

export default DltChainRegistration