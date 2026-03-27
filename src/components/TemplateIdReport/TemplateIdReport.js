import React, {useState, useEffect} from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer';
import "./TemplateIdReport.css";
import Endpoints from '../endpoints';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";

const TemplateIdReport = ({ userData, onLogout }) => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

      const [expandedRows, setExpandedRows] = useState({});

      const [filteredData, setFilteredData] = useState([]);

      const [searchTerm, setSearchTerm] = useState("");

      const [isLoading, setIsLoading] = useState(false); 

      const [apiError, setApiError] = useState(false);

      const toggleRowExpansion = (index) => {
        setExpandedRows((prevExpandedRows) => ({
          ...prevExpandedRows,
          [index]: !prevExpandedRows[index],
        }));
      };

      const fetchTemplateIdReportData = async () => {

        setIsLoading(true);
        setApiError(false);
      
        try {
      
          const apiUrl =
            userData.dlrType === "WEB_PANEL"
              ? Endpoints.get("templateIdWiseReportWeb")
              : Endpoints.get("templateIdWiseReportMis");
      
          const payload = {
            loggedInUserName: userData.username,
            date: selectedDate,
          };
      
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: userData.authJwtToken,
            },
            body: JSON.stringify(payload),
          });
      
          const data = await response.json();
      
          if (data?.code === 18000) {
      
            if (Array.isArray(data.grid) && data.grid.length > 0) {
              setFilteredData(data.grid);
            } else {
              setFilteredData([]);
            }
      
            setApiError(false); 
      
          } else {
            setFilteredData([]);
            setApiError(true);
          }
      
        } catch (error) {
          console.error("Error fetching Template ID Report", error);
      
          setFilteredData([]);
          setApiError(true);
      
        } finally {
          setIsLoading(false);
        }
      };

      useEffect(() => {
        fetchTemplateIdReportData(); 
      }, []);
      

      const getTodayDate = () => {
        return new Date().toISOString().split("T")[0];
      };
      
      const [selectedDate, setSelectedDate] = useState(getTodayDate());
    
      const searchedData = filteredData.filter((row) =>
      row.templateId
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
      setExpandedRows({});
    }, [searchTerm]);

    //======================Download in .csv and .pdf logic============================
    const handleDownloadTemplateId = (format) => {
      if (filteredData.length === 0) {
        alert("No Data To Download");
        return;
      }
    
      if (format === "csv") {
        downloadTemplateIdCSV();
      } else if (format === "pdf") {
        downloadTemplateIdPDF();
      }
    };

    const downloadTemplateIdCSV = () => {
      const headers = ["Date", "Template Id", "Total Submit", "Total Delivered", "Total Failed", "Total Awaited"];
    
      const rows = filteredData.map((row) => {
        const totalSubmitted = Number(row.totalSubmitted || 0);
        const delivered = Number(row.delivered || 0);
        const failed = Number(row.failed || 0);
        const totalAwaited = totalSubmitted - (delivered + failed);
    
        return [
          row.date,
          row.templateId,
          totalSubmitted,
          delivered,
          failed,
          totalAwaited,
        ];
      });
    
      const csvContent = [headers, ...rows]
        .map((e) => e.join(","))
        .join("\n");
    
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const fileName = `${userData.username}_templateId_report.csv`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const downloadTemplateIdPDF = () => {
      const doc = new jsPDF();
    
      const headers = [["Date", "Template Id", "Total Submit", "Total Delivered", "Total Failed", "Total Awaited"]];
    
      const rows = filteredData.map((row) => {
        const totalSubmitted = Number(row.totalSubmitted || 0);
        const delivered = Number(row.delivered || 0);
        const failed = Number(row.failed || 0);
        const totalAwaited = totalSubmitted - (delivered + failed);
    
        return [
          row.date,
          row.templateId,
          totalSubmitted,
          delivered,
          failed,
          totalAwaited,
        ];
      });
    
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
    
      const fileName = `${userData.username}_templateId_report.pdf`;

      doc.save(fileName);
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
              <h2>Template ID Report</h2>

            <div className="wrap-templateid-report">
            <div className="template-date-filter-form-summary">
            <div className="templateid-input-actions">
              <div className="templateid-date-field">
                <label htmlFor="date">Date:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <button className="btn submit-btn" type="button" onClick={fetchTemplateIdReportData}>
                  Submit
                </button>
              </div>

              <div className="templateid-form-actions">
                <button className="btn download-btn csv-btn" type="button" onClick={() => handleDownloadTemplateId("csv")}>
                <FontAwesomeIcon icon={faDownload} /> .csv
                </button>

                <button className="btn download-btn pdf-btn" type="button"  onClick={() => handleDownloadTemplateId("pdf")}>
                <FontAwesomeIcon icon={faDownload} /> .pdf
                </button>
              </div>
            </div>


            <div className="templateid-search-filter">
              <input
                type="text"
                id="search"
                placeholder="Enter Template ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            </div>  

            <div className="wrap-templateid-report">
            {isLoading ? ( 
              <div className="loader-overlay">
                <div className="loader"></div>
                <p>Please wait...</p>
              </div>
            ) : (
              <>
            <div className="templateid-table-container">
              <table className="templateid-table">
                <thead>
                  <tr>
                    <th className="toggle-button-expansion"></th>
                    <th>Date</th>
                    <th>Template Id</th>
                    <th>Total Submit</th>
                    <th>Total Delivered</th>
                    <th className="under-1000px">Total Failed</th>
                    <th className="under-1000px">Total Awaited</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedData.length > 0 ? (
                    <>
                      {searchedData.map((row, index) => {
                      const totalSubmitted = Number(row.totalSubmitted || 0);
                      const delivered = Number(row.delivered || 0);
                      const failed = Number(row.failed || 0);

                      const totalAwaited = totalSubmitted - (delivered + failed);

                      return (
                        <React.Fragment key={index}>
                          <tr>
                            <td className="toggle-button-expansion">
                              <button
                                className="templateid-expand-btn"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedRows[index] ? "−" : "+"}
                              </button>
                            </td>

                            <td>{row.date}</td>
                            <td>{row.templateId}</td>
                            <td>{row.totalSubmitted}</td>
                            <td>{row.delivered}</td>
                            <td className="under-1000px">{row.failed}</td>
                            <td className="under-1000px">{totalAwaited}</td>
                          </tr>

                          {expandedRows[index] && (
                            <tr className="templateid-expanded-row">
                              <td></td>
                              <td colSpan="7">
                                <div className="templateid-expanded-content">
                                  <p>
                                    <strong>Total Failed:</strong> {row.failed || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Total Awaited:</strong> {totalAwaited ?? "N/A"}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    </>
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: "center",
                          color: apiError ? "red" : "#666",
                          fontWeight: apiError ? "600" : "normal",
                        }}
                      >
                        {apiError ? "Please Contact To Concerned Team" : "No Data Available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

export default TemplateIdReport