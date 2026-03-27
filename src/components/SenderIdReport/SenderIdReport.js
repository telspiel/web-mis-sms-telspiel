import React, {useState, useEffect} from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer';
import "./SenderIdReport.css";
import Endpoints from '../endpoints';

function SenderIdReport({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

    const [fromDate, setFromDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);

    const [senderIdReportTable, setSenderIdReportTable] = useState([]);

    const [totals, setTotals] = useState({});

    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [isLoading, setIsLoading] = useState(false); // Loader state

    const fetchSenderIdReport = async () => {
        setIsLoading(true);
        try {
            const apiEndpoint =
            userData.dlrType === "WEB_PANEL"
              ? Endpoints.get("senderIdWiseReportWeb")
              : Endpoints.get("senderIdWiseReportMis");

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
        console.log("Summary Report API response:", data);

        const validatedResponse = Endpoints.validateResponse(data);
        if (validatedResponse && validatedResponse.code === 15000) {
            const gridData = validatedResponse.data.grid || []; 
            setSenderIdReportTable(gridData);
            setFilteredData(gridData);
            calculateTotals(gridData);
        } else {
            console.error("Invalid response:", validatedResponse);
            setSenderIdReportTable([]);
            setFilteredData([]);
            setTotals({});
        }
        } catch (error) {
        console.error("Error fetching Summary Report data:", error);
        setSenderIdReportTable([]);
        setFilteredData([]);
        setTotals({});
        } finally {
            setIsLoading(false); // Hide loader
         }
    };

    useEffect(() => {
        fetchSenderIdReport();
    }, []);

    const handleDateChange = (e) => {
      const { name, value } = e.target;
      if (name === "fromDate") setFromDate(value);
      if (name === "toDate") setToDate(value);
    };

    const handleSubmit = () => {
        fetchSenderIdReport();
    };

const calculateTotals = (data) => {
    const totalCounts = data.reduce(
      (acc, row) => {
        acc.totalRequest += parseInt(row.totalRequest || 0, 10);
        acc.totalRejected += parseInt(row.totalRejected || 0, 10);
        acc.totalSubmit += parseInt(row.totalSubmit || 0, 10);
        acc.totalDelivered += parseInt(row.totalDelivered || 0, 10);
        acc.totalFailed += parseInt(row.totalFailed || 0, 10);
        acc.totalAwaited += parseInt(row.totalAwaited || 0, 10);
        return acc;
      },
      {
        totalRequest: 0,
        totalRejected: 0,
        totalSubmit: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalAwaited: 0,
      }
    );
    setTotals(totalCounts);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = senderIdReportTable.filter((row) =>
      row.senderId.includes(query)
    );
    setFilteredData(filtered);
    calculateTotals(filtered);
  };

  //Download Sender Id Table Data in CSV Format
  const handleDownload = () => {
    if (senderIdReportTable.length === 0) {
      alert("No Data To Download");
      return;
    }
  
    // Prepare CSV content
    const headers = [
      "Summary Date",
      "Sender Id",
      "Total Request",
      "Total Rejected",
      "Total Submit",
      "Total Delivered",
      "Total Failed",
      "Total Awaited",
    ];
    const rows = senderIdReportTable.map((row) => [
      row.summaryDate,
      row.senderId,
      row.totalRequest,
      row.totalRejected,
      row.totalSubmit,
      row.totalDelivered,
      row.totalFailed,
      row.totalAwaited,
    ]);
  
    const csvContent = [headers, ...rows]
      .map((e) => e.join(","))
      .join("\n");
  
    // Create a Blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "senderId_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const [expandedRows, setExpandedRows] = useState({});

const toggleRowExpansion = (index) => {
  setExpandedRows((prevExpandedRows) => ({
    ...prevExpandedRows,
    [index]: !prevExpandedRows[index], // Toggle expansion
  }));
};

//Pagination code
const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;
  
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Slice data based on the current page
  const paginatedData = filteredData.slice(
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
            <h2>Sender ID Report</h2>

            <div className="wrap-senderid-report"> 
            <div className="date-filter-form-summary">
              <div className="senderid-date-field">
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
              <div className="senderid-date-field">
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
              <div className="senderid-form-actions">
                <button className="btn submit-btn" type="button" onClick={handleSubmit}>
                  Submit
                </button>
                <button className="btn download-btn" type="button"  onClick={handleDownload}>
                  Download
                </button>
              </div>
            </div>

            <div className="senderid-search-filter">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Enter Sender ID"
              />
            </div>
            </div>

            <div className="wrap-senderid-report">
            {isLoading ? ( 
              <div className="loader-overlay">
                <div className="loader"></div>
                <p>Please wait...</p>
              </div>
            ) : (
              <>
            <div className="senderid-table-container">
              <table className="senderid-table">
                <thead>
                  <tr>
                    <th className="toggle-button-expansion"></th>
                    <th>Summary Date</th>
                    <th>Sender Id</th>
                    <th>Total Request</th>
                    <th>Total Rejected</th>
                    <th>Total Submit</th>
                    <th className="under-1000px">Total Delivered</th>
                    <th className="under-1000px">Total Failed</th>
                    <th className="under-1000px">Total Awaited</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    <>
                      {paginatedData.map((row, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            <td className="toggle-button-expansion">
                              <button
                                className="senderid-expand-btn"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedRows[index] ? "−" : "+"}
                              </button>
                            </td>
                            <td>{row.summaryDate}</td>
                            <td>{row.senderId}</td>
                            <td>{row.totalRequest}</td>
                            <td>{row.totalRejected}</td>
                            <td>{row.totalSubmit}</td>
                            <td className="under-1000px">{row.totalDelivered}</td>
                            <td className="under-1000px">{row.totalFailed}</td>
                            <td className="under-1000px">{row.totalAwaited}</td>
                          </tr>
                          {expandedRows[index] && (
                            <tr className="senderid-expanded-row">
                              <td></td>
                              <td colSpan="8">
                                <div className="senderid-expanded-content">
                                  <p>
                                    <strong>Total Delivered:</strong> {row.totalDelivered || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Total Failed:</strong> {row.totalFailed || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Total Awaited:</strong> {row.totalAwaited || "N/A"}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {filteredData.length > 0 && (
                        <tr className="senderid-total-row">
                          <td className="toggle-button-expansion"><strong></strong></td>
                          <td>Total</td>
                          <td>-</td>
                          <td><strong>
                            {filteredData.reduce((acc, row) => acc + Number(row.totalRequest || 0), 0)}
                          </strong></td>
                          <td><strong>
                            {filteredData.reduce((acc, row) => acc + Number(row.totalRejected || 0), 0)}
                          </strong></td>
                          <td><strong>
                            {filteredData.reduce((acc, row) => acc + Number(row.totalSubmit || 0), 0)}
                          </strong></td>
                          <td className="under-1000px"><strong>
                            {filteredData.reduce((acc, row) => acc + Number(row.totalDelivered || 0), 0)}
                          </strong></td>
                          <td className="under-1000px"><strong>
                            {filteredData.reduce((acc, row) => acc + Number(row.totalFailed || 0), 0)}
                          </strong></td>
                          <td className="under-1000px"><strong>
                            {filteredData.reduce((acc, row) => acc + Number(row.totalAwaited || 0), 0)}
                          </strong></td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center" }}>No Data Available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination-footer">
            <p class="table-entries">There are total <strong>{filteredData.length}</strong> entries</p>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button 
                    key={index + 1} 
                    onClick={() => changePage(index + 1)}
                    className={currentPage === index + 1 ? "active" : ""}
                  >
                    {index + 1}
                  </button>
                ))}

                <button disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>
                  Next
                </button>
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

export default SenderIdReport