
import React, {useState, useEffect} from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer';
import "./DetailedReport.css";
import Endpoints from '../endpoints';

function DetailedReport({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [detailedReport, setDetailedReport] = useState([]);

    const today = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);

    const [mobileNumber, setMobileNumber] = useState("");
    const [senderId, setSenderId] = useState("");
    const [messageId, setMessageId] = useState("");

    const [showDownloadBtn, setShowDownloadBtn] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

      const fetchAllSenderIds = async () => {
            try {
                const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                  ? Endpoints.get("senderIdAllDataWeb")
                  : Endpoints.get("senderIdAllDataMis");

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
            console.log("Summary Report API response:", data);

            const validatedResponse = Endpoints.validateResponse(data);
            if (validatedResponse && validatedResponse.code === 10001) {
                const gridData = validatedResponse.data.grid || []; 
            } else {
                console.error("Invalid response:", validatedResponse);
            }
            } catch (error) {
            console.error("Error fetching Summary Report data:", error);
            }
        };

        useEffect(() => {
            fetchAllSenderIds();
        }, []);


        const callDetailedReportApi = async () => {
           setIsLoading(true);
            try {
                const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                  ? Endpoints.get("detailedReportWeb")
                  : Endpoints.get("detailedReportMis");

              const payload = {
                fromDate,
                toDate,
                ...(userData.dlrType === "WEB_PANEL"
                ? { loggedInUserName: userData.username }
                : { username: userData.username }),
                ...(userData.dlrType === "MIS_PANEL" && { mobileNumber }),
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
              console.log("detailedMis API response:", data);
        
              const validatedResponse = Endpoints.validateResponse(data);
              if (
                (userData.dlrType === "WEB_PANEL" && validatedResponse.code === 16000) ||
                (userData.dlrType === "MIS_PANEL" && validatedResponse.code === 1000)
              ) {
                console.log("Valid response from API:", validatedResponse.data);
                setDetailedReport(validatedResponse.data.grid);
              } else {
                console.error("Invalid response from API:", validatedResponse);
              }
            } catch (error) {
              console.error("Error calling API:", error);
            } finally {
              setIsLoading(false); // Hide loader
           }
          };

          useEffect(() => {
            callDetailedReportApi();
        }, []);

        //When we call api on submit by selecting input fields
        // const callDetailedReportApiOnSubmit = async () => {
        //   setIsLoading(true);
        //     try {
        //         const apiEndpoint =
        //         userData.dlrType === "WEB_PANEL"
        //           ? Endpoints.get("detailedReportWeb")
        //           : Endpoints.get("detailedReportMis");

        //       const payload = {
        //         fromDate,
        //         toDate,
        //         senderId,
        //         messageId,
        //         mobileNumber,
        //         ...(userData.dlrType === "WEB_PANEL"
        //         ? { loggedInUserName: userData.username }
        //         : { username: userData.username }),
        //       };
        
        //       const response = await fetch(apiEndpoint, {
        //         method: "POST",
        //         headers: {
        //           "Content-Type": "application/json",
        //           Authorization: userData.authJwtToken,
        //         },
        //         body: JSON.stringify(payload),
        //       });
        
        //       const data = await response.json();
        //       console.log("detailedMis API response:", data);
        
        //       const validatedResponse = Endpoints.validateResponse(data);
        //       if (
        //         (userData.dlrType === "WEB_PANEL" && validatedResponse.code === 16000) ||
        //         (userData.dlrType === "MIS_PANEL" && validatedResponse.code === 1000)
        //       ) {
        //         console.log("Valid response from API:", validatedResponse.data);
        //         setDetailedReport(validatedResponse.data.grid);
        //       } else {
        //         console.error("Invalid response from API:", validatedResponse);
        //       }
        //     } catch (error) {
        //       console.error("Error calling API:", error);
        //     }  finally {
        //       setIsLoading(false); // Hide loader
        //    }
        //   };

        //Calling the function but showing the download button as per filter search of messageId or senderId and mobileNumber
        const callDetailedReportApiOnSubmit = async () => {
          setIsLoading(true);
          setShowDownloadBtn(false); // Hide before request
        
          try {
            const apiEndpoint =
              userData.dlrType === "WEB_PANEL"
                ? Endpoints.get("detailedReportWeb")
                : Endpoints.get("detailedReportMis");
        
            const payload = {
              fromDate,
              toDate,
              senderId,
              messageId,
              mobileNumber,
              ...(userData.dlrType === "WEB_PANEL"
                ? { loggedInUserName: userData.username }
                : { username: userData.username }),
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
            console.log("detailedMis API response:", data);
        
            const validatedResponse = Endpoints.validateResponse(data);
        
            const isSuccess =
              (userData.dlrType === "WEB_PANEL" && validatedResponse.code === 16000) ||
              (userData.dlrType === "MIS_PANEL" && validatedResponse.code === 1000);
        
            // check if the search input is valid for download
            const isSearchValid =
              messageId.trim() !== "" ||
              (mobileNumber.trim() !== "" && senderId.trim() !== "");
        
            if (isSuccess) {
              setDetailedReport(validatedResponse.data.grid);
              setShowDownloadBtn(isSearchValid);
            } else {
              setShowDownloadBtn(false);
            }
          } catch (error) {
            console.error("API Error:", error);
            setShowDownloadBtn(false);
          } finally {
            setIsLoading(false);
          }
        };
        

          const handleKeyPress = (event) => {
            if (event.key === "Enter") {
                callDetailedReportApiOnSubmit();  // Call the API function
            }
        };     

//===================Download Detailed Report Table Data in CSV Format=======================    
//   const handleDownload = () => {
//     if (detailedReport.length === 0) {
//         alert("No Data To Download");
//         return;
//     }

//     // Prepare CSV headers
//     const headers = [
//         "Receive Date",
//         "Message Id",
//         "Mobile Number",
//         "Sent Date",
//         "Sender Id",
//         "Delivery Status",
//         "Error Code",
//         "Delivery Date Time",
//         "Message Text",
//         "Message Type",
//         "Error Description",
//         "Circle",
//         "Carrier",
//         "Template Id"
//     ];

//     // Prepare CSV rows including expanded row data
//     const rows = detailedReport.map((row) => [
//         row.receiveDate || "-",
//         row.messageId || "-",
//         row.mobileNumber || "-",
//         row.sentDate || "-",
//         row.senderId || "-",
//         row.deliveryStatus || "-",
//         row.deliveryErrorCode || "-",
//         row.deliveryDateTime || "-",
//         row.messageText || "-",
//         row.messageCount || "-",
//         row.errorDesc || "-",
//         row.circleName || "-",
//         row.carrierName || "-",
//         row.templateId || "-"
//     ]);

//     // Convert to CSV format
//     const csvContent = [headers, ...rows]
//         .map((e) => e.map((field) => `"${field}"`).join(",")) // Ensure proper CSV formatting
//         .join("\n");

//     // Create a Blob and trigger download
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "detailed_report.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };

const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const formatAsExcelSafeText = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return `="${value}"`;
};


const handleDownload = () => {
  if (detailedReport.length === 0) {
    alert("No Data To Download");
    return;
  }

  const headers = [
    "Receive Date",
    "Message Id",
    "Mobile Number",
    "Sent Date",
    "Sender Id",
    "Delivery Status",
    "Error Code",
    "Delivery Date Time",
    "Message Text",
    "Message Type",
    "Error Description",
    "Circle",
    "Carrier",
    "Template Id"
  ];

  const rows = detailedReport.map((row) => [
    row.receiveDate || "-",
    formatAsExcelSafeText(row.messageId),
    formatAsExcelSafeText(row.mobileNumber),
    row.sentDate || "-",
    formatAsExcelSafeText(row.senderId),
    row.deliveryStatus || "-",
    formatAsExcelSafeText(row.deliveryErrorCode),
    row.deliveryDateTime || "-",

    // decodeHtml(row.messageText || "-"),
      userData.username === "user4"
    ? (row.messageText
        ? row.messageText
            .split(" ")
            .map((word) => "x".repeat(word.length))
            .join(" ")
        : "-")
    : (row.messageText
      ? row.messageText.replace(/\d{3,}/g, (match) => "x".repeat(match.length))
      : "-"),
        
    row.messageCount || "-",
    row.errorDesc || "-",
    row.circleName || "-",
    row.carrierName || "-",
    (userData.username === "user4" || userData.username === "apitesting")
    ? (row.templateId ? 'x'.repeat(row.templateId.length) : "-")
    : (row.templateId || "-")
  ]);

  const csvContent = [headers, ...rows]
    .map((e) =>
      e.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "detailed_report.csv");
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

const filteredReport = detailedReport.filter((row) =>
  Object.values(row).some(
    (value) =>
      value &&
      value.toString().includes(searchQuery.toLowerCase())
  )
);

//Pagination Code
const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 15;

const totalPages = Math.ceil(filteredReport.length / rowsPerPage);

// Slice data for pagination
const paginatedData = filteredReport.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

// Handle page change
const changePage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    setCurrentPage(pageNumber);
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
                <h2>Detailed Report</h2>

                <div className="wrap-detailed-report">
                <div className="date-filter-form-detailed">
                <div className="detailed-date-field">
                <label htmlFor="fromDate">From Date:</label>
                <input
                  type="date"
                  id="fromDate"
                  name="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  onKeyDown={handleKeyPress}
                />
                </div>
                <div className="detailed-date-field">
                    <label htmlFor="toDate">To Date:</label>
                    <input
                    type="date"
                    id="toDate"
                    name="toDate"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    min={
                      fromDate
                        ? new Date(new Date(fromDate).setDate(new Date(fromDate).getDate()))
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    max={
                      fromDate
                        ? (() => {
                            const from = new Date(fromDate);
                            const today = new Date();
                            const isToday =
                              from.toISOString().split("T")[0] ===
                              today.toISOString().split("T")[0];
                  
                            return new Date(
                              isToday
                                ? from // only today allowed
                                : new Date(from.setDate(from.getDate() + 6)) 
                            )
                              .toISOString()
                              .split("T")[0];
                          })()
                        : new Date().toISOString().split("T")[0]
                    }
                    onKeyDown={handleKeyPress}
                    />
                </div>
                <div className="detailed-date-field">
                <label htmlFor="mobileNumber">Mobile Number:</label>
                <input
                  type="text"
                  id="mobileNumber"
                  name="mobileNumber"
                  placeholder="Enter Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setMobileNumber(value);
                  }}
                  inputMode="numeric"
                  pattern="\d*"
                />
                </div>
                <div className="detailed-date-field">
                <label htmlFor="senderId">Sender ID:</label>
                <input
                  type="text"
                  id="senderId"
                  name="senderId"
                  placeholder='Enter Sender Id'
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                </div>
                <div className="detailed-date-field">
                <label htmlFor="messageId">Message ID:</label>
                <input
                  type="text"
                  id="messageId"
                  name="messageId"
                  placeholder='Enter Message Id'
                  value={messageId}
                  onChange={(e) => setMessageId(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                </div>
                <div className="detailed-form-actions">
                    <button className="btn submit-btn" type="button" onClick={callDetailedReportApiOnSubmit}>
                    Submit
                    </button>
                    {showDownloadBtn && (
                      <button className="btn download-btn" type="button" onClick={handleDownload}>
                        Download
                      </button>
                    )}
                </div>
                </div>
               

                {/* <div className="senderid-search-filter">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search Detailed Report"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div> */}
                </div>

              <div className="wrap-detailed-report">
              {isLoading ? ( 
              <div className="loader-overlay">
                <div className="loader"></div>
                <p>Please wait...</p>
              </div>
              ) : (
                <>
                <table className="detailed-report-table">
                <thead>
                  <tr>
                    <th></th> 
                    <th>Receive Date</th>
                    <th>Message Id</th>
                    <th>Mobile Number</th>
                    <th>Sent Date</th>
                    <th>Sender Id</th>
                    <th>Delivery Status</th>
                    <th>Error Code</th>
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
                                className="detailed-expand-btn"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedRows[index] ? "−" : "+"}
                              </button>
                            </td>
                            <td>{row.receiveDate || "-"}</td>
                            <td>{row.messageId || "-"}</td>
                            <td>{row.mobileNumber || "-"}</td>
                            <td>{row.sentDate || "-"}</td>
                            <td>{row.senderId || "-"}</td>
                            <td>{row.deliveryStatus || "-"}</td>
                            <td>{row.deliveryErrorCode || "-"}</td>
                          </tr>
                          {expandedRows[index] && (
                            <tr className="detailed-expanded-row">
                              <td></td>
                              <td colSpan="9">
                                <div className="detailed-expanded-content">
                                  <p>
                                    <strong>Delivery Date Time:</strong> {row.deliveryDateTime || "-"}
                                  </p>
                                  <p>
                                  <strong>Message Text:</strong>{" "}
                                  {userData.username === "user4"
                                    ? (row.messageText
                                        ? row.messageText
                                            .split(" ")
                                            .map((word) => "x".repeat(word.length))
                                            .join(" ")
                                        : "-")
                                    : (row.messageText
                                      ? row.messageText.replace(/\d{3,}/g, (match) => "x".repeat(match.length))
                                      : "-")}
                                  </p>
                                  <p>
                                    <strong>Message Type:</strong> {row.messageCount || "-"}
                                  </p>
                                  <p>
                                    <strong>Error Description:</strong> {row.errorDesc || "-"}
                                  </p>
                                  <p>
                                    <strong>Circle:</strong> {row.circleName || "-"}
                                  </p>
                                  <p>
                                    <strong>Carrier:</strong> {row.carrierName || "-"}
                                  </p>
                                  <p>
                                  <strong>Template Id:</strong>{" "}
                                  {(userData.username === "user4" || userData.username === "apitesting")
                                    ? 'x'.repeat(row.templateId?.length || 0)
                                    : row.templateId}
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
                      <td colSpan="10" style={{ textAlign: "center" }}>No Data Available</td>
                    </tr> 
                  )}
                </tbody>
              </table>
              {/* <p class="table-entries">There are total <strong>{filteredReport.length}</strong> entries</p> */}
              <div className="pagination-footer">
              <p class="table-entries">There are total <strong>{filteredReport.length}</strong> entries</p>
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

export default DetailedReport