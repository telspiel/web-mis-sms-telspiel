import React, {useState,useEffect} from 'react'
import "./VMNReport.css"
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer';
import Endpoints from '../endpoints';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";

const VMNReport = ({ userData, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [vmnReportTable, setVmnReportTable] = useState([]);
    // const [expandedRows, setExpandedRows] = useState({});

    const [vmnNumbers, setVmnNumbers] = useState([]);
    const [selectedVmn, setSelectedVmn] = useState("");

    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    const [isLoading, setIsLoading] = useState(false); 

  
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };
  
    // 👉 Convert system date to IST yyyy-mm-dd
    const getTodayIST = () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(now.getTime() + istOffset);
      return istDate.toISOString().split("T")[0];
    };
  
   // 👉 Only set default dates — DO NOT call API
    useEffect(() => {
      const today = getTodayIST();
      setFromDate(today);
      setToDate(today);
    }, []);

    const fetchVmnNumbersByUser = async () => {
      try {
        const apiBase =
          userData.dlrType === "WEB_PANEL"
            ? Endpoints.get("getVmnNumbersWeb")
            : Endpoints.get("getVmnNumbersMis");
    
        const apiUrl = `${apiBase}?user_id=${userData.userId}`;
    
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: userData.authJwtToken,
          },
        });
    
        const data = await response.json();
    
        if (Array.isArray(data)) {
          // Remove duplicates:
          const uniqueNumbers = [...new Set(data)];
    
          // Set only unique values
          setVmnNumbers(uniqueNumbers);
        } else {
          setVmnNumbers([]);
        }
      } catch (error) {
        console.error("Error fetching VMN numbers", error);
        setVmnNumbers([]);
      }
    };
    

    useEffect(() => {
      fetchVmnNumbersByUser(); 
    }, []);
    


    const fetchVmnReport = async (fd = fromDate, td = toDate, vmn = selectedVmn) => {
      setIsLoading(true);
      try {
        const apiBase =
          userData.dlrType === "WEB_PANEL"
            ? Endpoints.get("getVmnReportsWeb")
            : Endpoints.get("getVmnReportsMis");
    
        const apiUrl = `${apiBase}?fromDate=${fd}&toDate=${td}&vmnNumber=${vmn}`;
    
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: userData.authJwtToken,
          }
        });
    
        const data = await response.json();
    
        if (Array.isArray(data)) {
          setVmnReportTable(data);
        } else {
          setVmnReportTable([]);
        }
    
      } catch (error) {
        console.error("Error fetching VMN report", error);
      }  finally {
        setIsLoading(false); 
     }
    };

    //==================Search Filter Logic==================================
    const [searchTerm, setSearchTerm] = useState('');

        
    //=================Pagination Logic=======================================
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // const indexOfLastRow = currentPage * rowsPerPage;
    // const indexOfFirstRow = indexOfLastRow - rowsPerPage;


    // const currentRows = vmnReportTable.slice(indexOfFirstRow, indexOfLastRow);
    // const totalPages = Math.ceil(vmnReportTable.length / rowsPerPage);
    
    const filteredVmnData = vmnReportTable.filter(row => {
      const search = searchTerm.toLowerCase();
    
      return (
        row.vmnNumber?.toString().toLowerCase().includes(search) ||
        row.mobileNumber?.toString().toLowerCase().includes(search) ||
        row.messageContent?.toLowerCase().includes(search) ||
        row.date?.toLowerCase().includes(search)
      );
    });
    
    const totalPages = Math.ceil(filteredVmnData.length / rowsPerPage);
    
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    
    const currentRows = filteredVmnData.slice(indexOfFirstRow, indexOfLastRow);
    

    //======================Download in .csv and .pdf logic============================
    const handleDownloadVMN = (format) => {
      if (vmnReportTable.length === 0) {
        alert("No Data To Download");
        return;
      }
    
      if (format === "csv") {
        downloadVMNCSV();
      } else if (format === "pdf") {
        downloadVMNPDF();
      }
    };

    const downloadVMNCSV = () => {
      const headers = ["VMN Number", "Mobile Number", "Message Content", "Date", "Carrier Name", "Circle Name"];
    
      const rows = vmnReportTable.map((row) => [
        row.vmnNumber,
        row.mobileNumber,
        row.messageContent,
        row.date,
        row.carrierName,
        row.circleName,
      ]);
    
      const csvContent = [headers, ...rows]
        .map((e) => e.join(","))
        .join("\n");
    
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const fileName = `${userData.username}_vmn_report.csv`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const downloadVMNPDF = () => {
      const doc = new jsPDF();
    
      const headers = [["VMN Number", "Mobile Number", "Message Content", "Date", "Carrier Name", "Circle Name"]];
    
      const rows = vmnReportTable.map((row) => [
        row.vmnNumber,
        row.mobileNumber,
        row.messageContent,
        row.date,
        row.carrierName,
        row.circleName,
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
    
      const fileName = `${userData.username}_vmn_report.pdf`;

      doc.save(fileName);
    };

  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpansion = (index) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [index]: !prevExpandedRows[index], 
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
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          dlrType={userData.dlrType}
          username={userData.username}
          isVisualizeAllowed={userData.isVisualizeAllowed}
          userPrivileges={userData.userPrivileges}
         />
         <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="dashboard-content">
            <h2>VMN Report</h2>

            <div className='vmn-whole-wrap'>
            <div className="input-filter-form-vmn">
              <div className="vmn-report-field">
                <label htmlFor="fromDate">From Date:</label>
                <input 
                     type="date"
                     value={fromDate}
                     max={getTodayIST()}
                     onChange={(e) => setFromDate(e.target.value)}
                 />
              </div>

              <div className="download-report-field">
                <label htmlFor="toDate">To Date:</label>
                <input 
                 type="date"
                 value={toDate}
                 max={getTodayIST()}
                 onChange={(e) => setToDate(e.target.value)}
                  />
              </div>

              <div className="vmn-report-field">
                <label htmlFor="vmnReport">VMN Numbers:</label>
                <select 
                  id="vmnNumbers" 
                  name="vmnNumbers"
                  value={selectedVmn}
                  onChange={(e) => setSelectedVmn(e.target.value)}
                >
                  
                  {/* Placeholder */}
                  <option value="">Select VMN Number</option>

                  {/* If empty, show message */}
                  {vmnNumbers.length === 0 && (
                    <option disabled>No VMN Number Available</option>
                  )}

                  {/* Render list */}
                  {vmnNumbers.map((num, idx) => (
                    <option key={idx} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className="vmn-form-actions"> 
              <button
                  className="btn submit-btn"
                  type="button"
                  onClick={() => {
                    if (!selectedVmn) {
                      alert("Select a VMN Number first");
                      return;
                    }
                    fetchVmnReport(fromDate, toDate, selectedVmn);
                  }}
                >
                  Submit
                </button>
                {!showDownloadOptions && (
                  <button
                    className="btn download-btn"
                    type="button"
                    onClick={() => setShowDownloadOptions(true)}
                  >
                    <FontAwesomeIcon icon={faDownload} /> Download
                  </button>
                )}

                {/* Show CSV + PDF options */}
                {showDownloadOptions && (
                  <div className="download-options">
                    <button
                      className="btn download-btn"
                      type="button"
                      onClick={() => {
                        handleDownloadVMN("csv");
                        setShowDownloadOptions(false); // hides menu after click
                      }}
                    >
                      <FontAwesomeIcon icon={faDownload} /> .csv
                    </button>

                    <button
                      className="btn download-btn"
                      type="button"
                      onClick={() => {
                        handleDownloadVMN("pdf");
                        setShowDownloadOptions(false); // hides menu after click
                      }}
                    >
                      <FontAwesomeIcon icon={faDownload} /> .pdf
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className='wrap-vmn-count-search'>         
            <div className="vmn-total-count">
              <strong>Total VMN Count: {filteredVmnData.length}</strong> 
            </div>

            <div className="vmn-search-filter">
                <input
                  type="text"
                  id="search"
                  placeholder="Search VMN Report"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // reset page on search
                  }}
                />
              </div>
            </div> 

            {isLoading ? ( 
              <div className="loader-overlay">
                <div className="loader"></div>
                <p>Please wait...</p>
              </div>
            ) : (          
            <div>
            <table className="vmn-report-table">
                <thead>
                    <tr>
                    <th className="toggle-button-expansion"></th>
                    <th>VMN Number</th>
                    <th>Mobile Number</th>
                    <th>Message Content</th>
                    <th>Date</th>
                    <th className="under-1000px">Carrier Name</th>
                    <th className="under-1000px">Circle Name</th>
                    </tr>
                </thead>
                <tbody>
                  {currentRows.length > 0 ? (
                    <>
                      {currentRows.map((row, index) => (
                        <React.Fragment key={index}>
                          
                          {/* Main Row */}
                          <tr>
                            <td className="toggle-button-expansion">
                              <button
                                className="senderid-expand-btn"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedRows[index] ? "−" : "+"}
                              </button>
                            </td>
                            <td>{row.vmnNumber}</td>
                            <td>{row.mobileNumber}</td>
                            <td>{row.messageContent}</td>
                            <td>{row.date}</td>
                            <td className="under-1000px" >{row.carrierName || "-"}</td>
                            <td className="under-1000px">{row.circleName || "-"}</td>
                          </tr>

                          {/* Expanded Row */}
                          {expandedRows[index] && window.innerWidth < 1000 && (
                            <tr className="senderid-expanded-row">
                              <td></td>
                              <td colSpan="5">
                                <div className="senderid-expanded-content">
                                  <p> 
                                    <strong>Carrier Name:</strong > {row.carrierName || "-"}
                                  </p>
                                  <p> 
                                    <strong>Circle Name:</strong> {row.circleName || "-"}
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
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
                </table>
              </div>
              )}

              <div className="pagination-controls">
                <button
                  className="previous-btn"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 1 || filteredVmnData.length === 0}
                >
                  Previous
                </button>

                {filteredVmnData.length > 0 && (    
                <span className='page-no'>
                  Page {currentPage} of {totalPages}
                </span>
                )}

                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === totalPages || filteredVmnData.length === 0}
                >
                  Next
                </button>
              </div>
              </div>

            </div>
          <Footer />
         </div>
        </div>
    </div>
  )
}

export default VMNReport