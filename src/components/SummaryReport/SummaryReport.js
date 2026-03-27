import React, {useState, useEffect} from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer';
import "./SummaryReport.css";
import Endpoints from '../endpoints';

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SummaryReport({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

    const [fromDate, setFromDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
    const [toDate, setToDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);

    const [summaryReportTable, setSummaryReportTable] = useState([]);

    const [totals, setTotals] = useState({});

    const [isLoading, setIsLoading] = useState(false);


       const fetchSummaryReport = async () => {
        setIsLoading(true);
            try {
                const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                  ? Endpoints.get("summaryReportDataWeb")
                  : Endpoints.get("summaryReportDataMis");

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
            if (validatedResponse && validatedResponse.code === 14000) {
                const gridData = validatedResponse.data.grid || []; 
                setSummaryReportTable(gridData);
                calculateTotals(gridData);
            } else {
                console.error("Invalid response:", validatedResponse);
                setSummaryReportTable([]);
                setTotals({});
            }
            } catch (error) {
            console.error("Error fetching Summary Report data:", error);
            setSummaryReportTable([]);
            setTotals({});
            } finally {
                setIsLoading(false); // Hide loader
             }
        };

        useEffect(() => {
            fetchSummaryReport();
        }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "fromDate") setFromDate(value);
    if (name === "toDate") setToDate(value);
  };

  const handleSubmit = () => {
    fetchSummaryReport();
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

  //Download Summary Table Data in CSV Format
  const handleDownload = () => {
    if (summaryReportTable.length === 0) {
      alert("No Data To Download");
      return;
    }
  
    // Prepare CSV content
    const headers = [
      "Summary Date",
      "Total Request",
      "Total Rejected",
      "Total Submit",
      "Total Delivered",
      "Total Failed",
      "Total Awaited",
    ];
    const rows = summaryReportTable.map((row) => [
      row.summaryDate,
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
    link.setAttribute("download", "summary_report.csv");
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

const [viewMode, setViewMode] = useState("table");

// ✅ Calculate total values for the graph
const totalData = [
  summaryReportTable.reduce((acc, row) => acc + Number(row.totalRequest || 0), 0),
  summaryReportTable.reduce((acc, row) => acc + Number(row.totalRejected || 0), 0),
  summaryReportTable.reduce((acc, row) => acc + Number(row.totalSubmit || 0), 0),
  summaryReportTable.reduce((acc, row) => acc + Number(row.totalDelivered || 0), 0),
  summaryReportTable.reduce((acc, row) => acc + Number(row.totalFailed || 0), 0),
  summaryReportTable.reduce((acc, row) => acc + Number(row.totalAwaited || 0), 0),
];

// ✅ Chart.js dataset
const chartData = {
  labels: [
    "Total Request",
    "Total Rejected",
    "Total Submit",
    "Total Delivered",
    "Total Failed",
    "Total Awaited",
  ],
  datasets: [
    {
      label: "Summary Totals",
      data: totalData,
      backgroundColor: [
        "#3b82f6",
        "#ef4444",
        "#22c55e",
        "#facc15",
        "#a855f7",
        "#14b8a6",
      ],
      borderRadius: 6,
    },
  ],
};

// ✅ Chart.js options
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: true, position: "top" },
    title: {
      display: true,
      text: "Summary Report Overview",
    },
  },
  scales: {
    x: {
      ticks: { font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      ticks: { stepSize: 100 },
    },
  },
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
            <h2>Summary Report</h2>

            <div className="wrap-summary-report">
            <div className="summary-report-form-filter">
              <div className="summary-date-field">
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
              <div className="summary-date-field">
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
              <div className="summary-form-actions">
                <button className="btn submit-btn" type="button" onClick={handleSubmit}>
                  Submit
                </button>
                <button className="btn download-btn" type="button"  onClick={handleDownload}>
                  Download
                </button>
              </div>
            </div>
            </div>

            <div className="wrap-summary-report">
      {isLoading ? (
        <div className="loader-overlay">
          <div className="loader"></div>
          <p>Please wait...</p>
        </div>
      ) : (
        <>
          {/* <div className="view-toggle-container">
            <button
              className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              Table
            </button>
            <button
              className={`toggle-btn ${viewMode === "graph" ? "active" : ""}`}
              onClick={() => setViewMode("graph")}
            >
              Graph
            </button>
          </div> */}

          {/* --- TABLE VIEW --- */}
          {viewMode === "table" ? (
            <>
              <div className="summary-table-container">
                <table className="summary-report-table">
                  <thead>
                    <tr>
                      <th className="toggle-button-expansion"></th>
                      <th>Summary Date</th>
                      <th>Total Request</th>
                      <th>Total Rejected</th>
                      <th>Total Submit</th>
                      <th>Total Delivered</th>
                      <th className="under-1000px">Total Failed</th>
                      <th className="under-1000px">Total Awaited</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryReportTable.length > 0 ? (
                      <>
                        {summaryReportTable.map((row, index) => (
                          <React.Fragment key={index}>
                            <tr>
                              <td className="toggle-button-expansion">
                                <button
                                  className="summary-report-expand-btn"
                                  onClick={() => toggleRowExpansion(index)}
                                >
                                  {expandedRows[index] ? "−" : "+"}
                                </button>
                              </td>
                              <td>{row.summaryDate}</td>
                              <td>{row.totalRequest}</td>
                              <td>{row.totalRejected}</td>
                              <td>{row.totalSubmit}</td>
                              <td>{row.totalDelivered}</td>
                              <td className="under-1000px">{row.totalFailed}</td>
                              <td className="under-1000px">{row.totalAwaited}</td>
                            </tr>
                            {expandedRows[index] && (
                              <tr className="summary-report-expanded-row">
                                <td></td>
                                <td colSpan="2">
                                  <div className="summary-report-expanded-content">
                                    <p>
                                      <strong>Total Failed:</strong>{" "}
                                      {row.totalFailed || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Total Awaited:</strong>{" "}
                                      {row.totalAwaited || "N/A"}
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}

                        {/* Total Row */}
                        <tr className="summary-report-total-row">
                          <td className="toggle-button-expansion"><strong></strong></td>
                          <td>Total</td>
                          <td><strong>
                            {summaryReportTable.reduce((acc, row) => acc + Number(row.totalRequest || 0), 0)}
                          </strong></td>
                          <td><strong>
                            {summaryReportTable.reduce((acc, row) => acc + Number(row.totalRejected || 0), 0)}
                          </strong></td>
                          <td><strong>
                            {summaryReportTable.reduce((acc, row) => acc + Number(row.totalSubmit || 0), 0)}
                          </strong></td>
                          <td><strong>
                            {summaryReportTable.reduce((acc, row) => acc + Number(row.totalDelivered || 0), 0)}
                          </strong></td>
                          <td className="under-1000px"><strong>
                            {summaryReportTable.reduce((acc, row) => acc + Number(row.totalFailed || 0), 0)}
                          </strong></td>
                          <td className="under-1000px"><strong>
                            {summaryReportTable.reduce((acc, row) => acc + Number(row.totalAwaited || 0), 0)}
                          </strong></td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center" }}>
                          No Data Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="table-entries">
                There are total <strong>{summaryReportTable.length}</strong> entries
              </p>
            </>
          ) : (
            // --- GRAPH VIEW ---
            <div className="graph-container">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
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

export default SummaryReport