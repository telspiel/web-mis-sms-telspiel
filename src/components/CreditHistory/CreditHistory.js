
import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import "./CreditHistory.css"
import Endpoints from '../endpoints';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';


function CreditHistory({ userData, onLogout }) {

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [fromDate, setFromDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);

    const [CreditHistoryTable, setCreditHistoryTable] = useState([]);

    const [responseMessage, setResponseMessage] = useState("");
    const responseMsgRef = useRef(null); 

    const [isLoading, setIsLoading] = useState(false);

    const [expandedRows, setExpandedRows] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState("csv");


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

      //To get credit history data API
      const fetchCreditHistoryData = async () => {
        setIsLoading(true);
            try {
                const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                  ? Endpoints.get("creditHistoryDataWeb")
                  : Endpoints.get("creditHistoryDataMis");

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
                }),
            });

            const data = await response.json();
            console.log("Credit History API response:", data);

            const validatedResponse = Endpoints.validateResponse(data);
            if (validatedResponse) {
                if (validatedResponse.code === 16000) {
                    const gridData = validatedResponse.data?.grid || [];
                    setCreditHistoryTable(gridData);

                    setResponseMessage("Data Fetched Successfully")
                    if (responseMsgRef.current) {
                        responseMsgRef.current.scrollIntoView({
                          behavior: "smooth",
                          block: "start", 
                        });
                      }
            
                    setTimeout(() => {
                        setResponseMessage("");
                      }, 3000);
                } else if (validatedResponse.code === 16001) {

                    // setResponseMessage("No Data Found For The Given Date")
                    if (responseMsgRef.current) {
                        responseMsgRef.current.scrollIntoView({
                          behavior: "smooth",
                          block: "start", 
                        });
                      }
            
                    setTimeout(() => {
                        setResponseMessage("");
                      }, 3000);

                    setCreditHistoryTable([]);
                } else {
                    console.error("Unexpected response code:", validatedResponse);
                    setCreditHistoryTable([]);
                }
            } else {
                console.error("Invalid response:", validatedResponse);
                setCreditHistoryTable([]);
            }
            } catch (error) {
            console.error("Credit History data:", error);
            setCreditHistoryTable([]);
            } finally {
               setIsLoading(false); // Hide loader
             }
        };

        useEffect(() => {
            fetchCreditHistoryData();
        }, []);  

      const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === "fromDate") setFromDate(value);
        if (name === "toDate") setToDate(value);
      };
      
      const handleSubmitCredit = () => {
        fetchCreditHistoryData();
      };

  //Download Summary Table Data in CSV or PDF Format
  const handleDownloadCredit = (format) => {
    if (filteredData.length === 0) {
      alert("No Data To Download");
      return;
    }
  
    // Update format state
    setDownloadFormat(format);
  
    // Directly trigger based on the clicked button
    if (format === "csv") {
      downloadCSV();
    } else if (format === "pdf") {
      downloadPDF();
    }
  };

  // const handleDownloadConfirm = () => {
  //   if (downloadFormat === "csv") {
  //     downloadCSV();
  //   } else if (downloadFormat === "pdf") {
  //     downloadPDF();
  //   }
  //   setShowDownloadModal(false);
  // };

  const downloadCSV = () => {
    const headers = [
      "Credit Date",
      "Credit",
      "Status",
      "Updated Credit",
      "Updated By",
      "Comment",
    ];
    const rows = filteredData.map((row) => [
      row.createdDate,
      row.credit,
      row.status,
      row.updatedCredit,
      row.updatedBy,
      row.comment,
    ]);

    const csvContent = [headers, ...rows]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "credit_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
  
    const headers = [["Credit Date", "Credit", "Status", "Updated Credit", "Updated By", "Comment"]];
    const rows = filteredData.map((row) => [
      row.createdDate,
      row.credit,
      row.status,
      row.updatedCredit,
      row.updatedBy,
      row.comment,
    ]);
  
    autoTable(doc, {
      head: headers,
      body: rows,
      styles: {
        fontSize: 10,
        halign: "center", 
        valign: "middle",
      },
      headStyles: {
        fillColor: [55, 52, 53],   
        textColor: [255, 204, 41],
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: [255, 255, 255], 
        textColor: [55, 52, 53],   
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], 
      },
    });
  
    doc.save("credit_history.pdf");
  };

  //Serach table data
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Filter data based on search query
  const filteredData = CreditHistoryTable.filter((row) =>
    Object.values(row).some(
      (value) =>
        value && value.toString().toLowerCase().includes(searchQuery)
    )
  );
    
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
                <h2>Credit History</h2>

            <div className="blacklistResponseMsg" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            <div className="wrap-credit-history">
            <div className="credit-history-filter-wrap">
              <div className="credit-date-field">
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
              <div className="credit-date-field">
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
              <div className="credit-form-actions">
                <button className="btn submit-btn" type="button" onClick={handleSubmitCredit}>
                  Submit
                </button>

               {/* {!showDownloadModal && (
                  <button
                    className="btn download-btn"
                    type="button"
                    onClick={handleDownloadCredit}
                  >
                    Download
                  </button>
                )}


                {showDownloadModal && (
                  <div className="download-modal">
                    <div className='download-format-wrap'>
                    <label>
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={downloadFormat === "csv"}
                        onChange={() => setDownloadFormat("csv")}
                      />
                      CSV
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="format"
                        value="pdf"
                        checked={downloadFormat === "pdf"}
                        onChange={() => setDownloadFormat("pdf")}
                      />
                      PDF
                    </label>
                    </div>
                    <div className='action-download-btns'>
                    <button onClick={handleDownloadConfirm} className='download'>Download</button>
                    <button onClick={() => setShowDownloadModal(false)} className='cancel'>Cancel</button>
                    </div>
                  </div>
                )} */}

                <button
                  className="btn download-btn"
                  type="button"
                  onClick={() => handleDownloadCredit("csv")}
                >
                  <FontAwesomeIcon icon={faDownload} /> .csv
                </button>

                <button
                  className="btn download-btn"
                  type="button"
                  onClick={() => handleDownloadCredit("pdf")}
                >
                  <FontAwesomeIcon icon={faDownload} /> .pdf
                </button>
              </div>
            </div>

            <div className="senderid-search-filter">
              <input
                type="text"
                id="search"
                placeholder="Search Credit History"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            </div> 

            <div className="wrap-credit-history">
            {isLoading ? ( 
              <div className="loader-overlay">
                <div className="loader"></div>
                <p>Please wait...</p>
              </div>
            ) : (
              <>
            <div className="credit-history-table-container">
                <table className="credit-history-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Created Date</th>
                      <th>Credit</th>
                      <th>Status</th>
                      <th>Updated Credit</th>
                      <th>Updated By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      <>
                        {filteredData.map((row, index) => (
                          <React.Fragment key={index}>
                            <tr>
                              <td>
                                <button
                                  className="credit-history-expand-btn"
                                  onClick={() => toggleRowExpansion(index)}
                                >
                                  {expandedRows[index] ? "−" : "+"}
                                </button>
                              </td>
                              <td>{row.createdDate}</td>
                              <td>{row.credit}</td>
                              <td>{row.status}</td>
                              <td>{row.updatedCredit}</td>
                              <td>{row.updatedBy}</td>
                            </tr>
                            {expandedRows[index] && (
                              <tr className="credit-history-expanded-row">
                                <td></td>
                                <td colSpan="5">
                                  <div className="credit-history-expanded-content">
                                    <p>
                                      <strong>Comment:</strong> {row.comment || "N/A"}
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
                        <td colSpan="6" style={{ textAlign: "center" }}>No Data Available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p class="table-entries">There are total <strong>{filteredData.length}</strong> entries</p>
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

export default CreditHistory