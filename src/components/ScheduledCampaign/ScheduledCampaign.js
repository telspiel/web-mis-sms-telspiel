import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import Endpoints from '../endpoints';
import "./ScheduledCampaign.css";

function ScheduledCampaign({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
    const [allScheduledCampaign, setAllScheduledCampaign] = useState([]);
    const [campaignType, setCampaignType] = useState('All');

    const [deletingId, setDeletingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const responseMsgRef = useRef(null);   


    useEffect(() => {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      setFromDate(today);
      setToDate(today);
  }, []);

  //API to get all the scheduled campaign 
  const getAllScheduledCampaign = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(Endpoints.get('viewScheduledCampaign'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          loggedInUserName: userData.username,
          fromDate: fromDate,  
          toDate: toDate,    
          campaignType: campaignType,
        }),
      });

      const data = await response.json();
      console.log('Scheduled Campaign API Response:', data);

      if (data?.data?.consolidateCampaignList) {
        setAllScheduledCampaign(data.data.consolidateCampaignList); // Update state with shortUrlList
      }  else {
        setAllScheduledCampaign([]);
    }
    } catch (error) {
      console.error('Error fetching Scheduled Campaign List:', error);
    }  finally {
      setIsLoading(false); 
   }
  };  

  useEffect(() => {
    getAllScheduledCampaign();
  }, [])


  //API to delete scheduled campaign
  const handleDeleteCampaign = async (campaignId, campaignType) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this campaign?");

    if (!confirmDelete) return; // Stop if the user cancels

    // Set deleting row ID for animation
    setDeletingId(campaignId);

    let operationType = campaignType === "Dynamic Message" ? "Dynamic" : 
        campaignType === "Bulk Message" ? "Bulk" : campaignType;
  
    setIsLoading(true);                    
    try {
      const response = await fetch(Endpoints.get('deleteScheduledCampaign'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          loggedInUserName: userData.username,
          campaignId: campaignId,
          operation: operationType,
        }),
      });
  
      const data = await response.json();
      console.log('Delete API Response:', data);
  
      if (data.code === 1002 && data.result === "Success") {
        setResponseMessage(data.message);

      if (responseMsgRef.current) {
        responseMsgRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start", 
        });
      }

      setTimeout(() => {
        setAllScheduledCampaign(prevCampaigns => 
          prevCampaigns.filter(campaign => campaign.campaignId !== campaignId)
        );
        setDeletingId(null);
        setResponseMessage("");
      }, 3000);
        // Remove the deleted campaign from the state
        setAllScheduledCampaign(prevCampaigns => 
        prevCampaigns.filter(campaign => campaign.campaignId !== campaignId)
        );
      } else {
        console.error('Failed to delete campaign:', data.message);
        setDeletingId(null); 
      }
    } catch (error) {
      console.error('Error deleting scheduled campaign:', error);
      setDeletingId(null);
    } finally {
      setIsLoading(false); 
   }
  };



  // Filter campaigns based on search term
  const filteredCampaigns = allScheduledCampaign.filter((campaign) =>
    Object.values(campaign).some((value) =>
      typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

// =========Code to get coundown timer to scheduled time, show processed if its is done====================
const [timers, setTimers] = useState({});

useEffect(() => {
  const interval = setInterval(() => {
    const updatedTimers = {};
    filteredCampaigns.forEach((campaign) => {
      const remainingTime = calculateTimeLeft(campaign.schdeuledDate, campaign.scheduledTime);
      updatedTimers[campaign.campaignId] = remainingTime;
    });
    setTimers(updatedTimers);
  }, 1000);

  return () => clearInterval(interval);
}, [filteredCampaigns]);


// Function to calculate time left
const calculateTimeLeft = (scheduledDate, scheduledTime) => {
  const [hours, minutes] = scheduledTime.split(":").map(Number);

  // Detect the format of scheduledDate: supports YYYY-MM-DD or DD-MM-YYYY
  let year, month, day;
  if (scheduledDate.includes("-")) {
    const parts = scheduledDate.split("-");
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      [year, month, day] = parts.map(Number);
    } else {
      // DD-MM-YYYY
      [day, month, year] = parts.map(Number);
    }
  }

  const now = new Date();
  const scheduledDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

  const timeDiff = scheduledDateTime - now;

  if (timeDiff <= 0) {
    return `${scheduledTime} (Processed)`;
  }

  const remainingHours = Math.floor(timeDiff / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return `(${remainingHours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")})`;
};

// ======================================================================  

const [expandedRows, setExpandedRows] = useState({});

const toggleRowExpansion = (index) => {
  setExpandedRows((prevExpandedRows) => ({
    ...prevExpandedRows,
    [index]: !prevExpandedRows[index], // Toggle expansion
  }));
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
       username={userData.username}
       isVisualizeAllowed={userData.isVisualizeAllowed}
    />
    <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
    <div className="dashboard-content">
        <h2>Scheduled Campaign</h2>

        <div className="shortUrlResponse" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
          </div>

        <div className="wrap-schedule-campaign">
        <div className="scheduled-campaign-form">
        <div className="scheduled-campaign-report-field">
                <label htmlFor="fromDate">From Date:</label>
                <input type="date" id="fromDate" name="fromDate" 
                  value={fromDate} 
                  onChange={(e) => setFromDate(e.target.value)}/>
              </div>

              <div className="scheduled-campaign-report-field">
                <label htmlFor="toDate">To Date:</label>
                <input type="date" id="toDate" name="toDate" 
                  value={toDate} 
                  onChange={(e) => setToDate(e.target.value)}/>
              </div>

              <div className="scheduled-campaign-report-field">
                    <label htmlFor="campaignType">Campaign Type:</label>
                    <select
                    id="campaignType"
                    name="campaignType"
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    >
                    <option value="All">All</option>
                    <option value="Bulk">Bulk</option>
                    <option value="Dynamic">Dynamic</option>

                    </select>
                </div>

                <div className="scheduled-campaign-form-actions">
                <button className="btn submit-btn" type="button" onClick={getAllScheduledCampaign}>
                  Submit
                </button>
              </div>
        </div>

        <div className="senderid-search-filter">
            <input
              type="text"
              id="search"
              placeholder="Search Campaign"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          </div>


          <div className="wrap-schedule-campaign">
          {isLoading ? ( 
                <div className="loader-overlay">
                <div className="loader"></div>
                    <p>Please wait...</p>
                </div>
              ) : ( 
              <div>
              <table className="schedule-campaign-table">
              <thead>
                <tr>
                  <th></th> 
                  <th>Campaign Type</th>
                  <th>Campaign Name</th>
                  <th>Scheduled Date</th>
                  <th>Scheduled Time</th>
                  <th>Sender Id</th>
                  <th>Message Text</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign, index) => (
                    <React.Fragment key={campaign.campaignId}>
                      <tr className={deletingId === campaign.campaignId ? "deleting" : ""}>
                        <td>
                          <button
                            className="schedule-campaign-expand-btn"
                            onClick={() => toggleRowExpansion(index)}
                          >
                            {expandedRows[index] ? "−" : "+"}
                          </button>
                        </td>
                        <td>{campaign.campaignType}</td>
                        <td>{campaign.campaignName}</td>
                        <td>{campaign.schdeuledDate}</td>
                        <td>
                          {campaign.scheduledTime}{" "}
                          {timers[campaign.campaignId] !== `${campaign.scheduledTime} (Processed)` && timers[campaign.campaignId]
                            ? `${timers[campaign.campaignId]}`
                            : "(Processed)"}
                        </td>
                        <td>{campaign.senderId}</td>
                        <td>{campaign.massageText}</td>
                      </tr>
                      {expandedRows[index] && (
                        <tr className="schedule-campaign-expanded-row">
                          <td></td>
                          <td colSpan="8">
                            <div className="schedule-campaign-expanded-content">
                              <p>
                                <strong>Message Count:</strong> {campaign.massageCount || "N/A"}
                              </p>
                              <p>
                                <strong>Actions:</strong>{" "}
                                {/* <button
                                  className="delete-short-url"
                                  onClick={() => handleDeleteCampaign(campaign.campaignId, campaign.campaignType)}
                                >
                                  Delete
                                </button> */}
                              <button
                                className="delete-short-url"
                                onClick={() => handleDeleteCampaign(campaign.campaignId, campaign.campaignType)}
                                disabled={timers[campaign.campaignId] === `${campaign.scheduledTime} (Processed)`}
                              >
                                Delete
                              </button>
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>No scheduled campaigns found</td>
                  </tr>
                )}
              </tbody>
            </table>
            <p class="table-entries">There are total <strong>{filteredCampaigns.length}</strong> entries</p>
              </div>
               )}
              </div>

          </div>
        <Footer/>
      </div>
    </div>
    </div>
  )
}

export default ScheduledCampaign