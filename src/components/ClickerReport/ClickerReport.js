import React, {useState, useEffect} from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer';
import "./ClickerReport.css";
import Endpoints from '../endpoints';

function ClickerReport({ userData, onLogout }) {

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

    const [fromDate, setFromDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
    const [mobileNumber, setMobileNumber] = useState('');

    const [clickerReportTable, setClickerReportTable] = useState([]);

    const [isLoading, setIsLoading] = useState(false); 

    const [pageNumber, setPageNumber] = useState(1);

    const fetchClickerReport = async (page = 1) => {
        setIsLoading(true);
            try {
                const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                  ? Endpoints.get("clickerReportWeb")
                  : Endpoints.get("clickerReportMis");

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
                    mobileNumber: mobileNumber ? `${mobileNumber}` : "",
                    pageNumber: page,
                 }),
            });

            const data = await response.json();
            console.log("Clicker Report API response:", data);

            const validatedResponse = Endpoints.validateResponse(data);
            if (validatedResponse && validatedResponse.code === 15000) {
                const gridData = validatedResponse.data.grid || []; 
                setClickerReportTable(gridData);
            } else {
                console.error("Invalid response:", validatedResponse);
                setClickerReportTable([]);
            }
            } catch (error) {
            console.error("Error fetching Clicker Report data:", error);
            setClickerReportTable([]);
            } finally {
                setIsLoading(false); 
             }
        };

        // useEffect(() => {
        //     fetchClickerReport();
        // }, []);

        useEffect(() => {
          if (fromDate && toDate) {
            fetchClickerReport(pageNumber);
          }
        }, [fromDate, toDate, pageNumber]);

        const handleNextPage = () => {
          setPageNumber(prev => prev + 1);
        };
        
        const handlePreviousPage = () => {
          setPageNumber(prev => (prev > 1 ? prev - 1 : 1));
        };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === "fromDate") setFromDate(value);
        if (name === "toDate") setToDate(value);
        if (name === "mobileNumber") {
          // Allow only numeric input
          const numericValue = value.replace(/\D/g, ''); // Remove any non-digit characters
          setMobileNumber(numericValue);
        }
    };

    const handleSubmit = () => {
        fetchClickerReport();
    };

const [expandedRows, setExpandedRows] = useState({});

const toggleRowExpansion = (index) => {
  setExpandedRows((prevExpandedRows) => ({
    ...prevExpandedRows,
    [index]: !prevExpandedRows[index], // Toggle expansion
  }));
};

// const formatAsExcelSafeText = (value) => {
//   if (value === null || value === undefined || value === "") return "-";
//   return `="${value}"`;
// };

//Clicker Report Download Data
// const downloadClickerData = () => {
//   if (!clickerReportTable.length) {
//     alert("No data available to download!");
//     return;
//   }

//   const headers = [
//     "Campaign Name",
//     "Child ShortUrl",
//     "Mobile Number",
//     "Created Date",
//     "User IP Address",
//     "Browser Details",
//     "Operating System",
//     "Device Details",
//     "Country",
//     "Region",
//     "City",
//     "Zip",
//     "Long URL"
//   ];

//   const rows = clickerReportTable.map(row => [
//     formatAsExcelSafeText(row.campaignName),
//     row.childShortUrl,
//     formatAsExcelSafeText(row.mobileNumber),
//     row.createdDate,
//     row.userIpAddress,
//     row.browserDetails,
//     row.operatingSystem,
//     row.deviceDetails,
//     row.country,
//     row.region,
//     row.city,
//     row.zip,
//     row.longUrl
//   ]);

//   const csvContent =
//     "data:text/csv;charset=utf-8," +
//     [headers, ...rows].map(e => e.map(value => `"${value}"`).join(",")).join("\n");

//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", "clicker_report.csv");
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

const downloadClickerData = async () => {
  if (!fromDate || !toDate) {
    alert("Please select both From and To dates.");
    return;
  }

  const baseUrl =
    userData.dlrType === "WEB_PANEL"
      ? Endpoints.get("downloadClickerReportWeb")
      : Endpoints.get("downloadClickerReportMis");

  const queryParams = new URLSearchParams({
    loggedInUserName: userData.username,
    fromDate,
    toDate,
  });

  const fullUrl = `${baseUrl}?${queryParams.toString()}`;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: userData.authJwtToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Download failed:", errorData);
      alert(errorData?.error || "Download failed");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${userData.username}_clicker_report.csv`); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Cleanup
  } catch (error) {
    console.error("Error during download:", error);
    alert("Something went wrong while downloading the report.");
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
         />
         <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="dashboard-content">
              <h2>Clicker Report</h2>

              <div className='clicker-whole-wrap'>
              <div className="input-filter-form-clicker">
              <div className="clicker-report-field">
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

              <div className="clicker-report-field">
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

              <div className="clicker-report-field">
                <label htmlFor="mobileNumber">Mobile Number:</label>
                <div className="input-alert-combine">
                <input
                    type="text"  
                    id="mobileNumber"
                    name="mobileNumber"
                    placeholder="Enter Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => handleDateChange(e)}
                    inputMode="numeric" 
                    pattern="\d*"     
                  />
                {/* <small><strong>NOTE:</strong>Mobile Number (+91)</small> */}
                </div>
              </div>

              <div className="clicker-form-actions"> 
                <button className="btn submit-btn" type="button" onClick={handleSubmit}>
                  Submit
                </button>
                {clickerReportTable.length > 0 && (
                <button className="btn download-btn" type="button" onClick={downloadClickerData} >
                  Download
                </button>
                )}
              </div>
            </div>

            {isLoading ? ( 
              <div className="loader-overlay">
                <div className="loader"></div>
                <p>Please wait...</p>
              </div>
            ) : (
              <>
            <div>
                <table className="clicker-report-table">
                <thead>
                  <tr>
                    <th></th> {/* Expand Button Column */}
                    <th>Campaign Name</th>
                    <th>Child ShortUrl</th>
                    <th>Mobile Number</th>
                    <th>Created Date</th>
                    <th>User IP Address</th>
                    <th>Browser Details</th>
                  </tr>
                </thead>
                <tbody>
                  {clickerReportTable.length > 0 ? (
                    <>
                      {clickerReportTable.map((row, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            <td>
                              <button
                                className="clicker-expand-btn"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedRows[index] ? "−" : "+"}
                              </button>
                            </td>
                            <td>{row.campaignName}</td>
                            <td>{row.childShortUrl}</td>
                            <td>{row.mobileNumber}</td>
                            <td>{row.createdDate}</td>
                            <td>{row.userIpAddress}</td>
                            <td>{row.browserDetails}</td>
                          </tr>
                          {expandedRows[index] && (
                            <tr className="clicker-expanded-row">
                              <td></td>
                              <td colSpan="9">
                                <div className="clicker-expanded-content">
                                  <p>
                                    <strong>Operating System:</strong> {row.operatingSystem}
                                  </p>
                                  <p>
                                    <strong>Device Details:</strong> {row.deviceDetails}
                                  </p>
                                  <p>
                                    <strong>Country:</strong> {row.country}
                                  </p>
                                  <p>
                                    <strong>Region:</strong> {row.region}
                                  </p>
                                  <p>
                                    <strong>City:</strong> {row.city}
                                  </p>
                                  <p>
                                    <strong>Zip:</strong> {row.zip}
                                  </p>
                                  <p>
                                    <strong>Long URL:</strong> {row.longUrl}
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
                      <td colSpan="10" style={{ textAlign: "center" }}>
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
              <p className="table-entries">There are total <strong>{clickerReportTable.length}</strong> entries</p>

              <div className="clicker-pagination-buttons">
              <button onClick={handlePreviousPage} disabled={pageNumber === 1}>Previous</button>
              <button onClick={handleNextPage}>Next</button>
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

export default ClickerReport