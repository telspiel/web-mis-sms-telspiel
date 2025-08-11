import React, {useState, useEffect, useRef} from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer';
import "./DownloadReport.css";
import Endpoints from '../endpoints';

function DownloadReport({ userData, onLogout }) {
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('currentReport'); 

    const handleTabSwitch = (tab) => {
      setActiveTab(tab);

     // Reset any selected campaign name and dlr report to default on tab switch
     setSelectedCampaignName("");
     setDlrReport("all");
     setFromPreviousDate(getYesterday());
     setToPreviousDate(getYesterday());

    
      if (tab === 'previousReport') {
        fetchDownloadPreviousReport();
        fetchCampaignPreviousReport();
      } else if (tab === 'currentReport') {
        fetchDownloadReport();
        fetchCampaignReport();
      }
    };
    


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

    //for current report  
    const [fromDate, setFromDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);

    //for previous report
    const getYesterday = () => {
      const today = new Date();
      today.setDate(today.getDate() - 1);
      return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
    };
    
    const [fromPreviousDate, setFromPreviousDate] = useState(getYesterday());
    const [toPreviousDate, setToPreviousDate] = useState(getYesterday());


    const [selectedCampaignId, setSelectedCampaignId] = useState("");
    
    const [selectedMobileNumber, setSelectedMobileNumber] = useState("");

    //render Campaign Name

    const [campaignList, setCampaignList] = useState([]);
    const [selectedCampaignName, setSelectedCampaignName] = useState("");

    //To handle download report table data
    const [gridData, setGridData] = useState([]); 

    //Manage dlrReport in payload
    const [dlrReport, setDlrReport] = useState("all");

    const [isLoading, setIsLoading] = useState(false);

    const [responseMessage, setResponseMessage] = useState("");
    const responseMsgRef = useRef(null); 

    //Send payload like dd-mm-yyyy format
    const formatDateToDDMMYYYY = (dateStr) => {
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    };


    //To fetch download report table data for current report
    const fetchDownloadReport = async () => {
        setIsLoading(true);
        try {
          const apiEndpoint =
            userData.dlrType === "WEB_PANEL"
              ? Endpoints.get("downloadReportWeb")
              : Endpoints.get("downloadReportMis");
      
          // Construct the payload dynamically
          const payload =
            userData.dlrType === "WEB_PANEL"
              ? {
                  username: userData.username,
                  campaignId: selectedCampaignId,
                  campaignName: selectedCampaignName,
                  fromDate: formatDateToDDMMYYYY(fromDate),
                  toDate: formatDateToDDMMYYYY(toDate),
                }
              : {
                  username: userData.username,
                  mobileNumber: selectedMobileNumber,
                  fromDate: formatDateToDDMMYYYY(fromDate),
                  toDate: formatDateToDDMMYYYY(toDate),
                };
      
          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: userData.authJwtToken,
            },
            body: JSON.stringify(payload),
          });
      
          const data = await response.json();
          console.log("Download Report API response:", data);
      
          const validatedResponse = Endpoints.validateResponse(data);
          if (validatedResponse && validatedResponse.code === 1000) {
            setGridData(validatedResponse.data.grid || []);
          } else {
            console.error("Invalid response:", validatedResponse);
          }
        } catch (error) {
          console.error("Error fetching Download Report data:", error);
        } finally {
            setIsLoading(false); // Hide loader
         }
      };

      //To fetch download report table data for previous report
    const fetchDownloadPreviousReport = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);
              yesterday.setHours(0, 0, 0, 0);
          
              const from = new Date(fromPreviousDate);
              const to = new Date(toPreviousDate);
              from.setHours(0, 0, 0, 0);
              to.setHours(0, 0, 0, 0);

              const formatToDDMMYYYYPrevious = (dateStr) => {
                const [year, month, day] = dateStr.split("-");
                return `${day}-${month}-${year}`;
              };

        const apiEndpoint =
          userData.dlrType === "WEB_PANEL"
            ? Endpoints.get("downloadReportWeb")
            : Endpoints.get("downloadReportMis");
    
        // Construct the payload dynamically
        const payload =
          userData.dlrType === "WEB_PANEL"
            ? {
                username: userData.username,
                campaignId: selectedCampaignId,
                campaignName: selectedCampaignName,
                fromDate: formatToDDMMYYYYPrevious(fromPreviousDate),
                toDate: formatToDDMMYYYYPrevious(toPreviousDate), 
              }
            : {
                username: userData.username,
                mobileNumber: selectedMobileNumber,
                fromDate: formatToDDMMYYYYPrevious(fromPreviousDate),
                toDate: formatToDDMMYYYYPrevious(toPreviousDate), 
              };
    
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: userData.authJwtToken,
          },
          body: JSON.stringify(payload),
        });
    
        const data = await response.json();
        console.log("Download Report API response:", data);
    
        const validatedResponse = Endpoints.validateResponse(data);
        if (validatedResponse && validatedResponse.code === 1000) {
          setGridData(validatedResponse.data.grid || []);
        } else {
          console.error("Invalid response:", validatedResponse);
        }
      } catch (error) {
        console.error("Error fetching Download Report data:", error);
      } finally {
          setIsLoading(false); // Hide loader
       }
    };

    useEffect(() => {
      const intervalId = setInterval(() => {
        if (activeTab === 'previousReport') {
          fetchDownloadPreviousReport();
        } else if (activeTab === 'currentReport') {
          fetchDownloadReport();
        }
      }, 10000); // every 10 seconds
    
      return () => clearInterval(intervalId);
    }, [activeTab]);
    
      
      useEffect(() => {
        fetchDownloadReport();
      }, []);

     //To get all the campaign name created for current report
      const fetchCampaignReport = async () => {
            try {
                const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                  ? Endpoints.get("campaignReportWeb")
                  : null;

                  if (!apiEndpoint) return;  

                const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: userData.authJwtToken,
                },
                body: JSON.stringify({
                loggedInUserName: userData.username,
                fromDate,
                toDate,
                // fromDate: formatDateToDDMMYYYY(fromDate),
                // toDate: formatDateToDDMMYYYY(toDate),
                }),
            });

            const data = await response.json();
            console.log("Campaign Report API response:", data);

            const validatedResponse = Endpoints.validateResponse(data);
            if (validatedResponse && validatedResponse.code === 17000) {
                const gridData = validatedResponse.data.grid || []; 
                setCampaignList(gridData);
               
            } else {
                console.error("Invalid response:", validatedResponse);
               
            }
            } catch (error) {
            console.error("Error fetching Campaign Report data:", error);
            }
        };

        //To get all the campaign name created for previous report
        const fetchCampaignPreviousReport = async () => {
          try {
            const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);
              yesterday.setHours(0, 0, 0, 0);
          
              const from = new Date(fromPreviousDate);
              const to = new Date(toPreviousDate);
              from.setHours(0, 0, 0, 0);
              to.setHours(0, 0, 0, 0);

              const formatToDDMMYYYYPrevious = (dateStr) => {
                const [year, month, day] = dateStr.split("-");
                return `${year}-${month}-${day}`;
              };

              const apiEndpoint =
              userData.dlrType === "WEB_PANEL"
                ? Endpoints.get("campaignReportWeb")
                : null;

                if (!apiEndpoint) return;  

              const response = await fetch(apiEndpoint, {
              method: "POST",
              headers: {
              "Content-Type": "application/json",
              Authorization: userData.authJwtToken,
              },
              body: JSON.stringify({
                loggedInUserName: userData.username,
                fromDate: formatToDDMMYYYYPrevious(fromPreviousDate),
                toDate: formatToDDMMYYYYPrevious(toPreviousDate),  
              }),
          });

          const data = await response.json();
          console.log("Campaign Report API response:", data);

          const validatedResponse = Endpoints.validateResponse(data);
          if (validatedResponse && validatedResponse.code === 17000) {
              const gridData = validatedResponse.data.grid || []; 
              setCampaignList(gridData);
             
          } else {
              console.error("Invalid response:", validatedResponse);
             
          }
          } catch (error) {
          console.error("Error fetching Campaign Report data:", error);
          }
      };

      useEffect(() => {
        if (
          activeTab === 'previousReport' &&
          fromPreviousDate &&
          toPreviousDate
        ) {
          fetchCampaignPreviousReport();
        }
      }, [activeTab, fromPreviousDate, toPreviousDate]);
      
      


        // useEffect(() => {
        //     if (userData.dlrType === "WEB_PANEL") {
        //       fetchCampaignReport();
        //     }
        //   }, [userData.dlrType]);


        //To Generate Report to Download for CURRENT REPORT    
        const generateReportToDownload = async () => {
            setIsLoading(true);
            try {
              const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                  ? Endpoints.get("generateReportWeb")
                  : Endpoints.get("generateReportMis");

                // Get the campaignId of that selectedCampaignName
                const campaignIdToSend =
                selectedCampaignName === ""
                  ? "0"
                  : campaignList.find(c => c.campaignName === selectedCampaignName)?.campaignId.toString() || "0";
          
              const payload =
                userData.dlrType === "WEB_PANEL"
                  ? {
                      username: userData.username,
                      campaignId: campaignIdToSend,
                      extension: "csv",
                      campaignName: selectedCampaignName,
                      fromDate: formatDateToDDMMYYYY(fromDate),
                      toDate: formatDateToDDMMYYYY(toDate), 
                      dlrStatus: dlrReport,
                    }
                  : {
                      username: userData.username,
                      mobileNumber: "Download",
                      fromDate: formatDateToDDMMYYYY(fromDate),
                      toDate: formatDateToDDMMYYYY(toDate),
                      dlrStatus: dlrReport,
                    };
          
              const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: userData.authJwtToken,
                },
                body: JSON.stringify(payload),
              });
          
              const data = await response.json();
              console.log("Generate Report API response:", data);
          
              const validatedResponse = Endpoints.validateResponse(data);
              if (validatedResponse && validatedResponse.code === 1000) {
                setGridData(validatedResponse.data.grid || []);
              } else {
                console.error("Invalid response:", validatedResponse);
              }
            } catch (error) {
              console.error("Error fetching Generate Report data:", error);
            } finally {
                setIsLoading(false); // Hide loader
             }
          }; 

          //To Generate Report to Download for PREVIOUS REPORT  
          const generatePreviousReportToDownload = async () => {
            setIsLoading(true);
            try {
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);
              yesterday.setHours(0, 0, 0, 0);
          
              const from = new Date(fromPreviousDate);
              const to = new Date(toPreviousDate);
              from.setHours(0, 0, 0, 0);
              to.setHours(0, 0, 0, 0);

              const formatToDDMMYYYYPrevious = (dateStr) => {
                const [year, month, day] = dateStr.split("-");
                return `${day}-${month}-${year}`;
              };

              const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                  ? Endpoints.get("generateReportWeb")
                  : Endpoints.get("generateReportMis");

                // Get the campaignId of that selectedCampaignName
                const campaignIdToSend =
                selectedCampaignName === ""
                  ? "0"
                  : campaignList.find(c => c.campaignName === selectedCampaignName)?.campaignId.toString() || "0";
          
              const payload =
                userData.dlrType === "WEB_PANEL"
                  ? {
                      username: userData.username,
                      campaignId: campaignIdToSend,
                      extension: "csv",
                      campaignName: selectedCampaignName,
                      fromDate: formatToDDMMYYYYPrevious(fromPreviousDate),
                      toDate: formatToDDMMYYYYPrevious(toPreviousDate),
                      dlrStatus: dlrReport, 
                    }
                  : {
                      username: userData.username,
                      mobileNumber: "Download",
                      fromDate: formatToDDMMYYYYPrevious(fromPreviousDate),
                       toDate: formatToDDMMYYYYPrevious(toPreviousDate),
                       dlrStatus: dlrReport,
                    };
          
              const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: userData.authJwtToken,
                },
                body: JSON.stringify(payload),
              });
          
              const data = await response.json();
              console.log("Generate Report API response:", data);
          
              const validatedResponse = Endpoints.validateResponse(data);
              if (validatedResponse && validatedResponse.code === 1000) {
                setGridData(validatedResponse.data.grid || []);

                //force refresh the page to get the default fields
                setActiveTab(""); 
                setTimeout(() => handleTabSwitch("previousReport"), 0);
              } else {
                console.error("Invalid response:", validatedResponse);
              }
            } catch (error) {
              console.error("Error fetching Generate Report data:", error);
            } finally {
                setIsLoading(false); // Hide loader
             }
          };

          useEffect(() => {
            if (fromDate && toDate) {
              fetchCampaignReport();
            }
          }, [fromDate, toDate]);
          
          const handleDownloadClick = async () => {
            await generateReportToDownload();   
          }; 

          const handlePreviousDownloadClick = async () => {
            await  generatePreviousReportToDownload();
          }; 



          const [expandedRows, setExpandedRows] = useState({});

          const toggleRowExpansion = (index) => {
            setExpandedRows((prevExpandedRows) => ({
              ...prevExpandedRows,
              [index]: !prevExpandedRows[index], // Toggle expansion
            }));
          };  
          
          
          const isBeforeAugustFirst2025 = (dateStr) => {
            if (!dateStr) return false;
            const selectedDate = new Date(dateStr);
            const augustFirst2025 = new Date("2025-08-08T00:00:00+05:30"); // IST
            return selectedDate < augustFirst2025;
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
          isVisualizeAllowed={userData.isVisualizeAllowed}
         />
         <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="dashboard-content">
            <h2>Download Report</h2>

            <div className="senderid-add">
              <button
                className={`tab ${activeTab === 'currentReport' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('currentReport')}
              >
                Current Report
              </button>
              <button
                className={`tab ${activeTab === 'previousReport' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('previousReport')}
              >
                Previous Report
              </button>
            </div>

            <div className="shortUrlResponse" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            {/* ================code structure for current report====================== */}
            {activeTab === 'currentReport' && (
            <>
            <div className="wrap-download-report">
            <div className="input-filter-form-download"> 
              <div className="download-report-field">
                <label htmlFor="fromDate">From Date:</label>
                <input 
                  type="date" 
                  id="fromDate" 
                  name="fromDate" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  disabled
                 />
              </div>

              <div className="download-report-field">
                <label htmlFor="toDate">To Date:</label>
                <input 
                  type="date" 
                  id="toDate" 
                  name="toDate"  
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  disabled
                  />
              </div>

              {userData.dlrType === "WEB_PANEL" && (
                <div className="download-report-field">
                    <label htmlFor="campaignName">Campaign Name:</label>
                    <select
                    id="campaignName"
                    name="campaignName"
                    value={selectedCampaignName}
                    onChange={(e) => setSelectedCampaignName(e.target.value)}
                    disabled={dlrReport !== "all"}
                    >
                    <option value="">All</option>
                    {campaignList.map((campaign) => (
                        <option key={campaign.campaignId} value={campaign.campaignName}  disabled={dlrReport !== "all"}>
                        {campaign.campaignName}
                        </option>
                    ))}
                    </select>
                </div>
                )}

                <div className="download-report-field">
                <label htmlFor="dlrReport">DLR Report:</label>
                <select
                   id="dlrReport"
                   name="dlrReport"
                   value={dlrReport}
                   onChange={(e) => setDlrReport(e.target.value)}
                   disabled={selectedCampaignName !== ""}
                >
                   <option value="all">All</option>
                   <option value="delivered">Delivered</option>
                   <option value="failed">Failed</option>
                </select>
                </div>

              <div className="download-form-actions">
                <button className="btn download-btn" type="button" onClick={handleDownloadClick}>
                  Download
                </button>
              </div>
            </div>
            </div>

            <div className="wrap-download-report">
            {isLoading ? ( 
              <div className="loader-overlay">
                <div className="loader"></div>
                <p>Please wait...</p>
              </div>
            ) : (  
              <>          
                <table className="download-report-table">
                  <thead>
                    <tr>
                      {/* <th></th> */}
                      <th>From Date</th>
                      <th>To Date</th>
                      {userData.dlrType === "WEB_PANEL" && (
                      <th>Campaign Name</th>
                      )}
                      <th>DLR Status</th>
                      <th>Report Status</th>
                      <th>Download Report Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridData.length > 0 ? (
                      <>
                        {[...gridData].reverse().map((row, index) => (
                          <React.Fragment key={index}>
                            <tr>
                              {/* <td>
                                <button
                                  className="download-report-expand-btn"
                                  onClick={() => toggleRowExpansion(index)}
                                >
                                  {expandedRows[index] ? "−" : "+"}
                                </button>
                              </td> */}
                              <td>{row.fromDate}</td>
                              <td>{row.toDate}</td>
                              {userData.dlrType === "WEB_PANEL" && (
                              <td>{row.campaignName}</td>
                              )}
                              <td>{row.dlrStatus}</td>
                              <td>{row.status}</td>
                              <td dangerouslySetInnerHTML={{ __html: row.downloadReportLink }} />
                            </tr>
                            {/* {expandedRows[index] && (
                              <tr className="download-report-expanded-row">
                                <td></td>
                                <td colSpan="4">
                                  <div className="download-report-expanded-content">
                                    <p>
                                      <strong>Status:</strong> {row.status}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )} */}
                          </React.Fragment>
                        ))}
                      </>
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center" }}>
                          No Data Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <p class="table-entries">There are total <strong>{gridData.length}</strong> entries</p>
                </>
               )}
             </div>
             </>
            )}

          {/* ================code structure for previous report====================== */}
          {activeTab === 'previousReport' && (
            <>
            <div className="wrap-download-report">
            <div className="input-filter-form-download"> 
            <div className="download-report-field">
                <label htmlFor="fromPreviousDate">From Date:</label>
                <input 
                type="date" 
                id="fromPreviousDate" 
                name="fromPreviousDate" 
                value={fromPreviousDate}
                onChange={(e) => setFromPreviousDate(e.target.value)}
                max={getYesterday()}
              />
              </div>
              <div className="download-report-field">
                <label htmlFor="toPreviousDate">To Date:</label>
                <input 
                  type="date" 
                  id="toPreviousDate" 
                  name="toPreviousDate"  
                  value={toPreviousDate}
                  onChange={(e) => setToPreviousDate(e.target.value)}
                  min={fromPreviousDate}
                  max={getYesterday()}
                />
              </div>

              {userData.dlrType === "WEB_PANEL" && (
                <div className="download-report-field">
                    <label htmlFor="campaignName">Campaign Name:</label>
                    <select
                    id="campaignName"
                    name="campaignName"
                    value={selectedCampaignName}
                    onChange={(e) => setSelectedCampaignName(e.target.value)}
                    disabled={dlrReport !== "all"}
                    >
                    <option value="">All</option>
                    {campaignList.map((campaign) => (
                        <option key={campaign.campaignId} value={campaign.campaignName}  disabled={dlrReport !== "all"}>
                        {campaign.campaignName}
                        </option>
                    ))}
                    </select>
                </div>
                )}

                <div className="download-report-field">
                <label htmlFor="dlrReport">DLR Report:</label>
                <select
                   id="dlrReport"
                   name="dlrReport"
                   value={dlrReport}
                   onChange={(e) => setDlrReport(e.target.value)}
                  disabled={
                    selectedCampaignName !== "" || isBeforeAugustFirst2025(fromPreviousDate)
                  }
                >
                   <option value="all">All</option>
                   <option value="delivered">Delivered</option>
                   <option value="failed">Failed</option>
                </select>
                </div>

              <div className="download-form-actions">
                <button className="btn download-btn" type="button" onClick={handlePreviousDownloadClick}>
                  Download
                </button>
              </div>
            </div>
            <p className='date-note-alert'>*DLR Status-wise report is available from 8th August 2025 onwards.</p>
            </div>

            <div className="wrap-download-report">
            {isLoading ? ( 
              <div className="loader-overlay">
                <div className="loader"></div>
                <p>Please wait...</p>
              </div>
            ) : (  
              <>          
                <table className="download-report-table">
                  <thead>
                    <tr>
                      {/* <th></th> */}
                      <th>From Date</th>
                      <th>To Date</th>
                      {userData.dlrType === "WEB_PANEL" && (
                      <th>Campaign Name</th>
                      )}
                      <th>DLR Status</th>
                      <th>Report Status</th>
                      <th>Download Report Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridData.length > 0 ? (
                      <>
                        {[...gridData].reverse().map((row, index) => (
                          <React.Fragment key={index}>
                            <tr>
                              {/* <td>
                                <button
                                  className="download-report-expand-btn"
                                  onClick={() => toggleRowExpansion(index)}
                                >
                                  {expandedRows[index] ? "−" : "+"}
                                </button>
                              </td> */}
                              <td>{row.fromDate}</td>
                              <td>{row.toDate}</td>
                              {userData.dlrType === "WEB_PANEL" && (
                              <td>{row.campaignName}</td>
                              )}
                              <td>{row.dlrStatus}</td>
                              <td>{row.status}</td>
                              <td dangerouslySetInnerHTML={{ __html: row.downloadReportLink }} />
                            </tr>
                            {/* {expandedRows[index] && (
                              <tr className="download-report-expanded-row">
                                <td></td>
                                <td colSpan="4">
                                  <div className="download-report-expanded-content">
                                    <p>
                                      <strong>Status:</strong> {row.status}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )} */}
                          </React.Fragment>
                        ))}
                      </>
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center" }}>
                          No Data Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <p class="table-entries">There are total <strong>{gridData.length}</strong> entries</p>
                </>
               )}
             </div>
             </>
            )}

          </div>

          <Footer/>
          
         </div>
        </div>
    </div>
  )
}

export default DownloadReport