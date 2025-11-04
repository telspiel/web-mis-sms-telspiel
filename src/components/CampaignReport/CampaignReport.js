import React, {useState, useEffect} from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer';
import "./CampaignReport.css";
import Endpoints from '../endpoints';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faClock, 
  faCalendar, 
  faCheckSquare, 
  faEnvelope, 
  faMousePointer 
} from "@fortawesome/free-solid-svg-icons";

function CampaignReport({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

    const [fromDate, setFromDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);

    const [campaignReportTable, setCampaignReportTable] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    
    const [isPreviewVisibleClicker, setIsPreviewVisibleClicker] = useState(false);
    const [clickerData, setClickerData] = useState(null);


    const fetchCampaignReport = async () => {
        setIsLoading(true);
            try {
                const response = await fetch(Endpoints.get("campaignReportDataWeb"), {
                 method: "POST",
                 headers: {
                  "Content-Type": "application/json",
                  Authorization: userData.authJwtToken,
                 },
                 body: JSON.stringify({
                    loggedInUserName: userData.username,
                    fromDate,
                    toDate,
                 }),
            });

            const data = await response.json();
            console.log("Campaign Report API response:", data);

            const validatedResponse = Endpoints.validateResponse(data);
            if (validatedResponse && validatedResponse.code === 17000) {
                const gridData = validatedResponse.data.grid || []; 
                setCampaignReportTable(gridData);
            } else {
                console.error("Invalid response:", validatedResponse);
                setCampaignReportTable([]);
            }
            } catch (error) {
            console.error("Error fetching Campaign Report data:", error);
            setCampaignReportTable([]);
            } finally {
                setIsLoading(false); // Hide loader
             }
        };

        useEffect(() => {
            fetchCampaignReport();
        }, []);

        //To handle analysis report API CALL
        const handleAnalyticsReport = async (row) => {
          const payload = {
              campaignId: row.campaignId,
              campaignName: row.campaignName,
              loggedInUserName: userData.username
          };
  
          console.log("Sending payload to analytics API:", payload);
  
          try {
              const response = await fetch(Endpoints.get("clickerAnalysis"), {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      Authorization: userData.authJwtToken
                  },
                  body: JSON.stringify(payload)
              });
  
              const data = await response.json();
              console.log("Analytics Analysis API response:", data);
  
              if (data.code === 10000) {
                  setAnalyticsData(data.data.grid[0]); // Store the first row of grid data
                  setIsPreviewVisible(true); // Show the modal
              } else {
                  console.error("Invalid response from API:", data);
              }
          } catch (error) {
              console.error("Error in Analytics API call:", error);
          }
      };


      //To handle CLICKER REPORT api call
      const handleClickerReport = async (row) => {
        const payload = {
            campaignId: row.campaignId,
            campaignName: row.campaignName,
            loggedInUserName: userData.username
        };
    
        console.log("Sending payload to clickerAnalysis API:", payload);
    
        try {
            const response = await fetch(Endpoints.get("detailedAnalytics"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: userData.authJwtToken
                },
                body: JSON.stringify(payload)
            });
    
            const data = await response.json();
            console.log("Clicker Analysis API response:", data);
    
            if (data.code === 15000) {
                setClickerData(data.data);  // Store the full data object
                setIsPreviewVisibleClicker(true);
            } else {
                console.error("Invalid response from API:", data);
            }
        } catch (error) {
            console.error("Error in Clicker API call:", error);
        }
    };
    
          

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === "fromDate") setFromDate(value);
        if (name === "toDate") setToDate(value);
    };

    const handleSubmit = () => {
        fetchCampaignReport();
    };


//============handle campaign report download functionality==============

//   const handleDownloadCampaign = () => {
//     if (campaignReportTable.length === 0) {
//         alert("No Data To Download");
//         return;
//     }

//     // Prepare CSV headers including expanded row data
//     const headers = [
//         "Summary Date",
//         "Campaign Name",
//         "Total Request",
//         "Total Rejected",
//         "Total Submit",
//         "Total Delivered",
//         "Sender ID",
//         "Scheduled Time",
//         "Message Text"
//     ];

//     const rows = campaignReportTable.map((row) => [
//         row.summaryDate || "-",
//         row.campaignName || "-",
//         row.totalRequest || "-",
//         row.totalRejected || "-",
//         row.totalSubmit || "-",
//         row.totalDelivered || "-",
//         row.senderId || "-",
//         row.scheduleTime || "-",
//         row.messageText || "-"
//     ]);

//     const csvContent = [headers, ...rows]
//         .map((e) => e.map((field) => `"${field}"`).join(",")) 
//         .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "campaign_report.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };
const handleDownloadCampaign = () => {
  if (campaignReportTable.length === 0) {
    alert("No Data To Download");
    return;
  }

  const headers = [
    "Summary Date",
    "Campaign Name",
    "Total Request",
    "Total Rejected",
    "Total Submit",
    "Total Delivered",
    "Total Failed",
    "Total Awaited",
    "Total Clicks",
    "Sender ID",
    "Scheduled Time",
    "Message Text"
  ];

  const escapeCSV = (text) => {
    if (text === null || text === undefined) return '""';
    const cleanText = String(text)
      .replace(/\r?\n|\r/g, ' ') // Convert newlines to spaces
      .replace(/"/g, '""');      // Escape quotes
    return `"${cleanText}"`;
  };

  const maskMessageText = (text) => {
    if (!text) return "-";
    if (userData.username === "user4") {
      return text
        .split(" ")
        .map((word) => "x".repeat(word.length))
        .join(" ");
    } else {
      return text.replace(/\d{3,}/g, (match) => "x".repeat(match.length));
    }
  };

  const rows = campaignReportTable.map((row) => [
    escapeCSV(row.summaryDate || "-"),
    escapeCSV(row.campaignName || "-"),
    escapeCSV(row.totalRequest || "-"),
    escapeCSV(row.totalRejected || "-"),
    escapeCSV(row.totalSubmit || "-"),
    escapeCSV(row.totalDelivered || "-"),
    escapeCSV(row.totalFailed || "-"),
    escapeCSV(row.totalAwaited || "-"),                 
    escapeCSV(row.totalClicks),
    escapeCSV(row.senderId || "-"),
    escapeCSV(row.scheduleTime || "-"),
    // escapeCSV(row.messageText || "-")
    escapeCSV(maskMessageText(row.messageText || "-"))
  ]);

  const csvContent = [headers.map(escapeCSV), ...rows]
    .map((e) => e.join(","))
    .join("\n");

  // Add UTF-8 BOM for Hindi/Unicode
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "campaign_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ========================================================================================s

//Download Analytical Report
const handleDownloadAnalyticsReport = () => {
  // Define CSV headers
  const headers = [
    "Total Submit",
    "Total Delivered",
    "Total Failed",
    "Total Awaited",
    "Total Clicks"
  ];
  
  // Define data rows
  const rows = [
    [
      analyticsData.totalSubmit || "-",
      analyticsData.totalDelivered || "-",
      analyticsData.totalFailed || "-",
      analyticsData.totalAwaited || "-",
      analyticsData.totalClicks,
    ]
  ];

  // Convert array to CSV format
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map((e) => e.join(",")).join("\n");

  // Create a downloadable link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "analytics_summary.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  


  const [expandedRows, setExpandedRows] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleRowExpansion = (index) => {
      setExpandedRows((prevExpandedRows) => ({
        ...prevExpandedRows,
      [index]: !prevExpandedRows[index], // Toggle expansion
    }));
  };  

  const filteredCampaignReport = campaignReportTable.filter((row) =>
  Object.values(row).some(
    (value) =>
      value &&
      value.toString().includes(searchQuery.toLowerCase())
  )
);

//Pagination Code
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 15;

const totalPages = Math.ceil(filteredCampaignReport.length / rowsPerPage);

// Slice data for pagination
const paginatedData = filteredCampaignReport.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

// Handle page change
const changePage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    setCurrentPage(pageNumber);
  }
};

const [expandedClickerRows, setExpandedClickerRows] = useState({});

const toggleClickerRowExpansion = (index) => {
  setExpandedClickerRows((prev) => ({
    ...prev,
    [index]: !prev[index]
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
           userPrivileges={userData.userPrivileges}
        />
          <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="dashboard-content">
              <h2>Campaign Report</h2>

              <div className="wrap-detailed-report">
              <div className="date-filter-form-campaign">
              <div className="campaign-date-field">
                <label htmlFor="fromDate">From Date:</label>
                <input
                  type="date"
                  id="fromDate"
                  name="fromDate"
                  value={fromDate}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="campaign-date-field">
                <label htmlFor="toDate">To Date:</label>
                <input
                  type="date"
                  id="toDate"
                  name="toDate"
                  value={toDate}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="campaign-form-actions">
                <button className="btn submit-btn" type="button" onClick={handleSubmit}>
                  Submit
                </button>
                <button className="btn download-btn" type="button" onClick={handleDownloadCampaign}>
                  Download
                </button>
              </div>
            </div>

            <div className="senderid-search-filter">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search Campaign Report"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                </div>

              <div className="wrap-detailed-report ">
              {isLoading ? ( 
                <div className="loader-overlay">
                  <div className="loader"></div>
                  <p>Please wait...</p>
                </div>
              ) : (
              <>
              <div className="campaign-report-table-container">
               <table className="campaign-report-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Summary Date</th>
                    <th>Campaign Name</th>
                    <th>Total Request</th>
                    <th>Total Rejected</th>
                    <th>Total Submit</th>
                    <th>Total Delivered</th>
                    <th>Total Failed</th>
                    <th>Total Awaited</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    <>
                      {paginatedData.map((row, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            <td>
                              <button
                                className="campaign-expand-btn"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedRows[index] ? "−" : "+"}
                              </button>
                            </td>
                            <td>{row.summaryDate}</td>
                            <td>{row.campaignName}</td>
                            <td>{row.totalRequest}</td>
                            <td>{row.totalRejected}</td>
                            <td>{row.totalSubmit}</td>
                            <td>{row.totalDelivered}</td>
                            <td>{row.totalFailed}</td>
                            <td>{row.totalAwaited}</td>
                          </tr>
                          {expandedRows[index] && (
                            <tr className="campaign-expanded-row">
                              <td></td>
                              <td colSpan="10">
                                <div className="campaign-expanded-content">
                                  <p>
                                    <strong>Total Clicks:</strong> {row.totalClicks}
                                  </p>
                                  <p>
                                    <strong>Sender ID:</strong> {row.senderId || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Scheduled Time:</strong> {row.scheduleTime || "N/A"}
                                  </p>
                                  <p>
                                  <strong>Message Text:</strong>{" "}
                                  {userData.username === "user4"
                                    ? (row.messageText
                                        ? row.messageText
                                            .split(" ")
                                            .map((word) => "x".repeat(word.length))
                                            .join(" ")
                                        : "N/A")
                                    : (row.messageText
                                      ? row.messageText.replace(/\d{3,}/g, (match) => "x".repeat(match.length))
                                      : "N/A")}
                                  </p>
                                  <p>
                                    <strong>Actions:</strong>
                                    <button className="analytics-btn" onClick={() => handleAnalyticsReport(row)}
                                    >
                                    Analytics Report
                                    </button>
                                    <button className="clicker-btn" onClick={() => handleClickerReport(row)}
                                    >
                                    Clicker Details
                                    </button>
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan="11" style={{ textAlign: "center" }}>
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            {/* To open Analysis Report modal page */}
            {isPreviewVisible && analyticsData && (
                    <div className="preview-modal-campaign-analytics">
                      <div className="preview-inside-content-analytics">
                        <h3>Analytics Summary</h3>

                        <div className="analytics-container">
                          <div className="analytics-card">
                            <FontAwesomeIcon icon={faClock} className="card-icon" />
                            <div className="card-text">
                              <span>Total Submit</span>
                              <strong>{analyticsData.totalSubmit}</strong>
                            </div>
                          </div>

                          <div className="analytics-card">
                            <FontAwesomeIcon icon={faCalendar} className="card-icon" />
                            <div className="card-text">
                              <span>Total Delivered</span>
                              <strong>{analyticsData.totalDelivered}</strong>
                            </div>
                          </div>

                          <div className="analytics-card">
                            <FontAwesomeIcon icon={faCheckSquare} className="card-icon" />
                            <div className="card-text">
                              <span>Total Failed</span>
                              <strong>{analyticsData.totalFailed}</strong>
                            </div>
                          </div>

                          <div className="analytics-card">
                            <FontAwesomeIcon icon={faEnvelope} className="card-icon" />
                            <div className="card-text">
                              <span>Total Awaited</span>
                              <strong>{analyticsData.totalAwaited}</strong>
                            </div>
                          </div>

                          <div className="analytics-card">
                            <FontAwesomeIcon icon={faMousePointer} className="card-icon" />
                            <div className="card-text"> 
                              <span>Total Clicks</span>
                              <strong>{analyticsData.totalClicks}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="modal-buttons-wrap">
                        <button className="cancel-btn" onClick={() => setIsPreviewVisible(false)}>Back</button>
                        <button className="back-btn" type="button"  onClick={handleDownloadAnalyticsReport}>
                          Download
                        </button>
                        </div>
                      </div>
                    </div>
                  )}

                   {/* To open Analysis Report modal page */}
                   {isPreviewVisibleClicker && clickerData && (
                    <div className="preview-modal-campaign-clicker">
                      <div className="preview-inside-content-clicker">
                        <h3>Clicker Details</h3>

                        {/* Table for Clicker Details */}
                        <table className="campaign-report-table">
                            <thead>
                              <tr>
                                <th></th>
                                <th>Campaign Name</th>
                                <th>Short URL</th>
                                <th>Mobile Number</th>
                                <th>Created Date</th>
                                <th>User IP</th>
                                <th>Browser</th>
                              </tr>
                            </thead>
                            <tbody>
                            {clickerData?.grid?.length > 0 ? (
                              <>
                                {clickerData.grid.map((item, index) => (
                                  <React.Fragment key={index}>
                                    <tr>
                                      <td >
                                        <button
                                          className="campaign-expand-btn"
                                          onClick={() => toggleClickerRowExpansion(index)}
                                        >
                                          {expandedClickerRows[index] ? "−" : "+"}
                                        </button>
                                      </td>
                                      <td>{item.campaignName}</td>
                                      <td>{item.childShortUrl}</td>
                                      <td>{item.mobileNumber}</td>
                                      <td>{item.createdDate}</td>
                                      <td>{item.userIpAddress}</td>
                                      <td>{item.browserDetails}</td>
                                    </tr>
                                    {expandedClickerRows[index] && (
                                      <tr className="senderid-expanded-row">
                                        <td></td>
                                        <td colSpan="3">
                                          <div className="senderid-expanded-content">
                                            <p><strong>OS:</strong> {item.operatingSystem || "-"}</p>
                                            <p><strong>Device:</strong> {item.deviceDetails || "-"}</p>
                                            <p><strong>Country:</strong> {item.country || "-"}</p>
                                            <p><strong>Region:</strong> {item.region || "-"}</p>
                                            <p><strong>City:</strong> {item.city || "-"}</p>
                                            <p><strong>Zip:</strong> {item.zip || "-"}</p>
                                            <p><strong>Long Url:</strong> {item.longUrl || "-"}</p>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </>
                            ) : (
                              <tr>
                                <td colSpan="14" style={{ textAlign: "center" }}>No Data Available</td>
                              </tr>
                            )}
                          </tbody>

                          </table>
                        <button className="cancel-btn-clicker" onClick={() => setIsPreviewVisibleClicker(false)}>Back</button>
                      </div>
                    </div>
                  )}

              </div>
              <div className="pagination-footer">
              <p class="table-entries">There are total <strong>{filteredCampaignReport.length}</strong> entries</p>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>Previous</button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button key={index + 1} onClick={() => changePage(index + 1)} className={currentPage === index + 1 ? "active" : ""}>
                      {index + 1}
                    </button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>Next</button>
                </div>
              )}
              </div>
              </>
            )}
            </div>
            </div>

            <Footer /> 

          </div>
        </div>
    </div>
  )
}

export default CampaignReport