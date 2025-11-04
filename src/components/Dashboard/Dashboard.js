import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCalendarDay, faCalendarAlt, faIndianRupeeSign} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './Dashboard.css';
import Endpoints from '../endpoints';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { LineElement, PointElement } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';

import { motion } from "motion/react";


// Register the required chart components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ userData, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    totalSmsToday: 0,
    totalSmsMonth: 0,
    availableCredits: 0,
    effectiveCredits: 0,
    creditData: [],
  });

  const [smsData, setSmsData] = useState([]);

  const [hourlyData, setHourlyData] = useState(null);

  const [allScheduledCampaign, setAllScheduledCampaign] = useState([]);
  const [fromDate, setFromDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [popupMessages, setPopupMessages] = useState([]);

  const [showAlert, setShowAlert] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const apiEndpoint =
          userData.dlrType === "WEB_PANEL"
            ? Endpoints.get("dashboardWeb")
            : Endpoints.get("dashboardMis");

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: userData.authJwtToken,
          },
          body: JSON.stringify({
            username: userData.username,
          }),
        });

        const data = await response.json();
        console.log("Dashboard API response:", data);

        const validatedResponse = Endpoints.validateResponse(data);
        if (validatedResponse && validatedResponse.code === 1000) {
          setDashboardData({
            totalSmsToday: validatedResponse.data.totalSmsToday || 0,
            totalSmsMonth: validatedResponse.data.totalSmsMonth || 0,
            availableCredits: validatedResponse.data.availableCredits || 0,
            effectiveCredits: validatedResponse.data.effectiveCredits || 0,
            smsData: validatedResponse.data.smsData || [],
            creditData: validatedResponse.data.creditData || [],
          });
        } else {
          console.error("Invalid response:", validatedResponse);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);


  //Fetch Today's Chart Data
  useEffect(() => {
    const fetchSmsData = async () => {
      try {
        const today = new Date();
        const fromDate = today.toISOString().split('T')[0]; // Today's date in yyyy-mm-dd format
        const toDate = fromDate; // Same day for today

        const apiEndpoint =
          userData.dlrType === "WEB_PANEL"
            ? Endpoints.get("summaryReportWeb")
            : Endpoints.get("summaryReportMis");
  
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
          const gridData = validatedResponse.data.grid[0] || {}; // Use an empty object if the grid is empty
          setSmsData(gridData); // Save gridData to smsData state
        } else {
          console.error("Invalid response:", validatedResponse);
          setSmsData({}); // Set an empty object if the response is invalid
        }
      } catch (error) {
        console.error("Error fetching SMS data:", error);
        setSmsData({}); // Set an empty object if there's an error
      }
    };
  
    fetchSmsData();
  }, []);


  //Fetch Hourly Chart Data
  useEffect(() => {
    const fetchHourlyReport = async () => {
      try {
        const apiEndpoint =
          userData.dlrType === "WEB_PANEL"
            ? Endpoints.get("getHourlyReportWeb")
            : Endpoints.get("getHourlyReportMis");

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
        console.log("Hourly Report API response:", data);
  
        const validatedResponse = Endpoints.validateResponse(data);
        if (validatedResponse && validatedResponse.code === 14000) {
          setHourlyData(validatedResponse.data.grid); // Save the entire grid array
        } else {
          console.error("Invalid response:", validatedResponse);
        }
      } catch (error) {
        console.error("Error fetching hourly report:", error);
      }
    };
  
    fetchHourlyReport();
  }, []);
  

  // -----------------------------------------------------------------------------------------------

   // Today's SMS Report
   const smsChartData = {
    labels: ['Request', 'Rejected', 'Submit', 'Delivered', 'Failed', 'Awaited'], // X-axis labels
    datasets: [{
      label: "Today's SMS Count", // Internal label for the dataset (won't be shown as legend)
      data: [
        parseInt(smsData.totalRequest || 0),
        parseInt(smsData.totalRejected || 0),
        parseInt(smsData.totalSubmit || 0),
        parseInt(smsData.totalDelivered || 0),
        parseInt(smsData.totalFailed || 0),
        parseInt(smsData.totalAwaited || 0),
      ], // Y-axis data
      backgroundColor: [
        '#373435',  
        '#373435', 
        '#373435', 
        '#373435',  
        '#373435',
        '#373435', 
      ],
      borderColor: [
        '#373435', 
        '#373435', 
        '#373435', 
        '#373435', 
        '#373435', 
        '#373435',
      ],
      borderWidth: 1,

      barThickness: 40, 
      categoryPercentage: 0.5,
      barPercentage: 0.7,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hides the legend and its color box
      },
      title: {
        display: true,
        text: "Today's SMS Count", // Title of the chart
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hides the grid lines on the x-axis
        },
      },
      y: {
        grid: {
          display: true, // Keeps the grid lines on the y-axis
        },
      },
    },
  };
  

//--------------------HOURLY SMS REPORT----------------------------------
// Generate dynamic time labels with a 2-hour difference
const generateTimeLabels = (startHour, count) => {
  const labels = [];
  for (let i = 0; i < count; i++) {
    const hour = (startHour + i * 2) % 24; // Increment by 2 hours and handle rollover
    labels.push(`${hour}:00`);
  }
  return labels;
};

// Process hourly data to match the dynamic time intervals
const processHourlyData = (hourlyData) => {
  if (!hourlyData || hourlyData.length === 0) return null;

  const startHour = parseInt(hourlyData[0].summaryHour, 10); // Assume data starts at the first summaryHour
  const labels = generateTimeLabels(startHour, Math.ceil(24 / 2)); // Generate labels for a full day with 2-hour intervals

  const datasets = {
    totalRequest: new Array(labels.length).fill(0),
    totalSubmit: new Array(labels.length).fill(0),
    totalDelivered: new Array(labels.length).fill(0),
    totalFailed: new Array(labels.length).fill(0),
    totalAwaited: new Array(labels.length).fill(0),
  };

  hourlyData.forEach((item) => {
    const hour = parseInt(item.summaryHour, 10);
    const index = Math.floor((hour - startHour) / 2); // Map hour to the closest 2-hour interval

    if (index >= 0 && index < labels.length) {
      datasets.totalRequest[index] += parseInt(item.totalRequest || 0);
      datasets.totalSubmit[index] += parseInt(item.totalSubmit || 0);
      datasets.totalDelivered[index] += parseInt(item.totalDelivered || 0);
      datasets.totalFailed[index] += parseInt(item.totalFailed || 0);
      datasets.totalAwaited[index] += parseInt(item.totalAwaited || 0);
    }
  });

  return { labels, datasets };
};

const processedData = processHourlyData(hourlyData);

const lineChartData = processedData
  ? {
      labels: processedData.labels,
      datasets: [
        {
          label: 'Total Requests',
          data: processedData.datasets.totalRequest,
          borderColor: '#ffb400',
          backgroundColor: '#ffb400',
          tension: 0.4,
        },
        {
          label: 'Total Submit',
          data: processedData.datasets.totalSubmit,
          borderColor: '#a57c1b',
          backgroundColor: '#a57c1b',
          tension: 0.4,
        },
        {
          label: 'Total Delivered',
          data: processedData.datasets.totalDelivered,
          borderColor: '#786028',
          backgroundColor: '#786028',
          tension: 0.4,
        },
        {
          label: 'Total Failed',
          data: processedData.datasets.totalFailed,
          borderColor: '#2e2b28',
          backgroundColor: '#2e2b28',
          tension: 0.4,
        },
        {
          label: 'Total Awaited',
          data: processedData.datasets.totalAwaited,
          borderColor: '#3b3734',
          backgroundColor: '#3b3734',
          tension: 0.4,
        },
      ],
    }
  : {
      // Fallback for empty data
      labels: generateTimeLabels(0, Math.ceil(24 / 2)), // Create labels for 24 hours with 2-hour intervals
      datasets: [
        {
          label: 'No Data',
          data: new Array(Math.ceil(24 / 2)).fill(0), // Fill the data array with zeros
          borderColor: 'rgba(200, 200, 200, 1)',
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          tension: 0.4,
        },
      ],
    };



    const lineChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Hourly SMS Summary',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time (Hours)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Count',
          },
          beginAtZero: true, // Ensure the Y-axis starts from 0
          min: 0, // Explicitly set the minimum value to 0
        },
      },
    };

    const handleCloseMessage = (index) => {
      setPopupMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
    };
    

    //To get all the scheduled campaign
    const getAllScheduledCampaign = async () => {
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
            campaignType: "All",
          }),
        });
    
        const data = await response.json();
        console.log('Scheduled Campaign API Response:', data);
    
        if (data?.data?.consolidateCampaignList?.length > 0) {
          setAllScheduledCampaign(data.data.consolidateCampaignList);
    
          const now = new Date();
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTime = currentHours * 60 + currentMinutes;
    
          // Filter and format messages
          const validMessages = data.data.consolidateCampaignList
            .filter((campaign) => {
              const [hours, minutes] = campaign.scheduledTime.split(":").map(Number);
              const scheduledMinutes = hours * 60 + minutes;
              return scheduledMinutes > currentTime; // Keep only future times
            })
            .map((campaign) => {
              let formattedName =
                campaign.campaignName.length > 10
                  ? `${campaign.campaignName.substring(0, 10)}-n...`
                  : campaign.campaignName;
    
              return {
                text: `${formattedName} at ${campaign.scheduledTime}`,
                time: campaign.scheduledTime, // Store time for sorting
                fading: false,
              };
            })
            .sort((a, b) => {
              // Sorting campaigns based on `scheduledTime`
              const [hoursA, minutesA] = a.time.split(":").map(Number);
              const [hoursB, minutesB] = b.time.split(":").map(Number);
              return hoursA * 60 + minutesA - (hoursB * 60 + minutesB);
            });
    
          setPopupMessages(validMessages);       
        } else { 
          setAllScheduledCampaign([]);
        }
        
      } catch (error) {
        console.error('Error fetching Scheduled Campaign List:', error);
      }
    };
    
  
    useEffect(() => {
      getAllScheduledCampaign();
    }, [])  

    const navigate = useNavigate();
    const handleNavigation = (path) => {
      navigate(path);
      window.location.reload(); 
    } 
    

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar}
        username={userData.username}
        dlrType={userData.dlrType}
        lastLoginTime={userData.lastLoginTime}
        lastLoginIp={userData.lastLoginIp} 
        onLogout={onLogout}/>
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

          {/*Alert message to shown on dashboard after login  */}
          {showAlert && (
            <div className="alert-overlay">
              <div className="alert-popup">
                <button className="close-button" onClick={() => setShowAlert(false)}>×</button>
                <h2>Important Information</h2>
                <p>
                  Dear User,<br /><br />
                  Please be informed that when creating any user from the panel, kindly update the respective customer support team so they can verify the configuration according to the TM-PE binding protocol.
                  Additionally, you are advised not to input any value through the option provided on the panel named <strong>"DLT Chain Registration"</strong>.
                </p>
              </div>
            </div>
          )}

            {popupMessages.length > 0 && (
              <div className="report-bar">
                <strong
                  className="report-heading"
                  onClick={() => handleNavigation('/scheduled-campaign')}
                >
                  Today's Upcoming Campaigns:
                </strong>
                <div className="scrolling-wrapper">
                  <div className="scrolling-text">
                    {popupMessages.map((message, index) => (
                      <span key={index} className="campaign-text">
                        {message.text} &nbsp;|&nbsp;
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}


            <div className="dashboard-stats"> 
            <motion.div
                  className="stat-box"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 250 }}
                >
                <i className="stat-icon fas fa-sms"></i>
                <div className="stat-info">
                  <h3>{dashboardData.totalSmsToday}</h3>
                  <p>Today's SMS Count</p>
                </div>
                <FontAwesomeIcon icon={faCalendarDay} className="dashboard-icon"/>
                </motion.div>
                <motion.div
                    className="stat-box"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.15)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 250 }}
                  >
                <i className="stat-icon fas fa-calendar-alt"></i>
                <div className="stat-info">
                  <h3>{dashboardData.totalSmsMonth}</h3>
                  <p>Current Month SMS Count</p>
                </div>
                <FontAwesomeIcon icon={faCalendarAlt} className="dashboard-icon"/>
                </motion.div>
                <motion.div
                  className="stat-box"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 250 }}
                >
                <i className="stat-icon fas fa-wallet"></i>
                <div className="stat-info-credit">
                  <div className='credit-wrap'>
                  <h3>{dashboardData.availableCredits}</h3>
                  <p>Available Credit</p>
                  </div>
                </div>
                <FontAwesomeIcon icon={faIndianRupeeSign} className="dashboard-icon"/>
                </motion.div>
            </div>

            <div className="charts-container">
              <div className="chart-box">
                {/* <h4>SMS Count per Day</h4> */}
                <Bar data={smsChartData}  options={chartOptions}  />
              </div>
              <div className="chart-box">
               
                    <Line data={lineChartData} options={lineChartOptions} />
                
              </div>
            </div>
          </div>
          <Footer /> 
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
