import React, { useState, useEffect } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import "./AddSenderId.css"
import Endpoints from '../endpoints';


function AddSenderId({ userData, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('add'); // Default active tab

  const [senderIdList, setSenderIdList] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [senderIdType, setSenderIdType] = useState('promo'); // Default selected sender type
  const [entityId, setEntityId] = useState('');
  const [headerId, setHeaderId] = useState('');
  const [senderId, setSenderId] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const [responseMessage, setResponseMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    // Reset form fields when switching tabs
    setSenderIdType('promo')
    setEntityId('');
    setHeaderId('');
    setSenderId('');
    setFile(null);
    setFileName('');
  };

  //Fetch all the created Sender ID List Data
  useEffect(() => {
    const fetchSenderIdData = async () => {
      setIsLoading(true);
      try {
        const apiEndpoint =
        userData.dlrType === "WEB_PANEL"
          ? Endpoints.get("getAllSenderIdListWeb")
          : Endpoints.get("getAllSenderIdListMis");
  
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
        console.log("Sender Id Data API response:", data);
  
        // Validate and extract senderIdList
        if (data && data.code === 10001 && data.result === "Success") {
          const senderIdList = data.data?.senderIdList || []; // Extract senderIdList safely
          setSenderIdList(senderIdList);
        } else {
          console.error("Invalid response:", data);
        }
      } catch (error) {
        console.error("Error Sender Id Data:", error);
      } finally {
        setIsLoading(false); // Hide loader
     }
    };
  
    if (activeTab === "list") {
        fetchSenderIdData();
      }
    }, [activeTab]); 

    const toggleRowExpansion = (index) => {
      setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
    };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter sender ID list based on search term
  const filteredSenderIdList = senderIdList.filter((row) =>
  row.senderId.toLowerCase().includes(searchTerm.toLowerCase())
);


    // Function to handle deletion of a senderId
    const handleDeleteSenderId = async (id, senderId) => {
      setIsLoading(true);
        try {
          const apiEndpoint =
          userData.dlrType === "WEB_PANEL"
            ? Endpoints.get("deleteSenderIdWeb")
            : Endpoints.get("deleteSenderIdMis");
    
          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: userData.authJwtToken,
            },
            body: JSON.stringify({
              idOfSenderId: id,
              senderId: senderId,
              operation: "removeSenderIdFromList",
              loggedInUserName: userData.username,
            }),
          });
      
          const data = await response.json();
          console.log("Delete Sender ID API response:", data);
      
          // Check for successful response with correct code
          if (data && data.code === 8001 && data.result === 'Success') {
            setResponseMessage("Sender ID deleted successfully.");
      
            // After successful API call, remove the row from the table
            setSenderIdList(senderIdList.filter((item) => item.id !== id));
      
            // Hide the response message after 3 seconds
            setTimeout(() => {
              setResponseMessage("");
            }, 3000);
          } else {
            // If API returns success but with unexpected code
            console.error("Failed to delete Sender ID:", data);
            setResponseMessage(data.message || "Failed to delete Sender ID.");
          }
        } catch (error) {
          console.error("Error deleting Sender ID:", error);
          setResponseMessage("An error occurred while deleting Sender ID.");
        } finally {
          setIsLoading(false); 
       }
      };
      


  //Function to call when we toggle between "promotioanl" and "others" sender type
  const fetchEntityIdForSenderIdType = async (messageType) => {
    try {
      const apiEndpoint =
      userData.dlrType === "WEB_PANEL"
        ? Endpoints.get("getAllEntityIdForSenderIdTypeWeb")
        : Endpoints.get("getAllEntityIdForSenderIdTypeMis");

    const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          loggedInUserName: userData.username,
          messageType: messageType,
        }),
      });
  
      const data = await response.json();
      console.log("Sender ID API Response:", data);

    } catch (error) {
      console.error("Error fetching Sender ID data:", error);
    }
  };
  
  // Call API when the page loads with default sender type
  useEffect(() => {
    fetchEntityIdForSenderIdType(senderIdType);
  }, [senderIdType]);
  
  const handleSenderTypeChange = (event) => {
    setSenderIdType(event.target.value); // Update the sender type
    setSenderId("");
  };
  


  //=====================To ADD sender id===============================
  const handleAddSenderId = async () => {
    if (!entityId || !headerId || !senderId) {
      alert("Please fill all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const apiEndpoint =
      userData.dlrType === "WEB_PANEL"
        ? Endpoints.get("addSenderIdWeb")
        : Endpoints.get("addSenderIdMis");

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          entityId,
          headerId,
          senderId,
          senderIdType,
          loggedInUserName: userData.username,
          operation: "addSenderId",
          userId: userData.userId,
        }),
      });

      const data = await response.json();
      console.log("Add Sender ID API response:", data);

      if (data && (data.code === 10001 || data.code === 11002)) {
        setResponseMessage(data.message || "Sender ID added successfully");
      
        // Reset the form only if it's a success
        if (data.code === 10001) {
          setEntityId('');
          setHeaderId('');
          setSenderId('');
          setSenderIdType('promo');
        }
      
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        console.error("Failed to add Sender ID:", data);
        setResponseMessage(data.message || "Failed to add Sender ID.");
      }
       // Hide the message after 3 seconds
       setTimeout(() => {
        setResponseMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error adding Sender ID:", error);
    } finally {
      setIsLoading(false); 
   }
  };

  //========================To UPLOAD sender id=============================
  
  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];
  
  //   if (file) {
  //     const fileName = file.name.toLowerCase();
  //     const fileSizeMB = file.size / (1024 * 1024); // convert bytes → MB
  
  //     if (!fileName.endsWith(".csv")) {
  //       event.target.value = "";
  //       setFile(null);
  //       setFileName("");
  //       alert("Invalid file type. Only .csv files are allowed.");
  //       return;
  //     }
  
  //     if (fileSizeMB > 10) {
  //       event.target.value = "";
  //       setFile(null);
  //       setFileName("");
  //       alert("File is too large. Maximum allowed size is 10 MB.");
  //       return;
  //     }
  
  //     // Valid case
  //     setFile(file);
  //     setFileName(file.name);
  //   }
  // };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
  
    if (!file) return;
  
    const fileName = file.name;
    const fileNameLower = fileName.toLowerCase();
    const fileSizeMB = file.size / (1024 * 1024);
  
    //Check for spaces in file name
    if (fileName.includes(" ")) {
      event.target.value = "";
      setFile(null);
      setFileName("");
      alert("File name should not contain any space");
      return;
    }
  
    //Check file type
    if (!fileNameLower.endsWith(".csv")) {
      event.target.value = "";
      setFile(null);
      setFileName("");
      alert("Invalid file type. Only .csv files are allowed.");
      return;
    }
  
    //Check file size
    if (fileSizeMB > 10) {
      event.target.value = "";
      setFile(null);
      setFileName("");
      alert("File is too large. Maximum allowed size is 10 MB.");
      return;
    }
  
    //Valid case
    setFile(file);
    setFileName(fileName);
  };
  

  
  const handleUpload = async () => {
    if (!entityId || !headerId || !file) {
      alert("Please fill all fields and upload a file.");
      return;
    }
  
    const formData = new FormData();
    formData.append("loggedInUserName", userData.username);
    formData.append("operation", "addBulkSenderId");
    formData.append("userId", userData.userId);
    formData.append("senderIdType", senderIdType);
    formData.append("senderIdSubType", null); // Explicitly setting as null
    formData.append("status", "active");
    formData.append("defaultSenderId", "ret");
    formData.append("file", file);
    formData.append("headerId", headerId);
    formData.append("entityId", entityId);
  
    setIsLoading(true);
    try {
      const apiEndpoint =
      userData.dlrType === "WEB_PANEL"
        ? Endpoints.get("addBulkSenderIdWeb")
        : Endpoints.get("addBulkSenderIdMis");

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: userData.authJwtToken, // Token for authentication
        },
        body: formData, // Sending the FormData object
      });
  
      const data = await response.json();
      console.log("Add Bulk Sender ID API response:", data);
  
      // Adjust condition to match actual API response
      if (data && data.code === 200 && data.result === "SUCCESS") {
        setResponseMessage(`File uploaded successfully. Total Count: ${data.totalCount}, Duplicates: ${data.duplicateCount}, Saved: ${data.countSaved}`);
        // Reset form fields
        setEntityId("");
        setHeaderId("");
        setSenderId('');
        setFile(null);
        setFileName('');
        setSenderIdType('promo');
  
        // Hide the message after 3 seconds
        setTimeout(() => {
          setResponseMessage("");
        }, 3000);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        console.error("Failed to upload file:", data);
        setResponseMessage(data.message || "Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setResponseMessage("An error occurred while uploading the file.");
    } finally {
      setIsLoading(false); 
   }
  };
  

  //------------------------------INPUT VALIDATION---------------------------
  // Handler to allow only numeric input
  const handleNumericInput = (value, setter) => {
    const numericValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    setter(numericValue);
  };

  // Handler for Sender ID with length constraint
  const handleSenderIdInput = (value) => {
    let validValue = value;

    if (senderIdType === "promo") {
      validValue = value.replace(/[^0-9]/g, ""); // Allow only numeric values
    } else if (senderIdType === "others") {
      validValue = value.replace(/[^a-zA-Z0-9]/g, ""); // Allow alphanumeric values
    }

    // Restrict length to 14 characters
    if (validValue.length <= 14) {
      setSenderId(validValue);
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
            <h2>Add Sender ID</h2>

            {/* Tabs for Add and Upload */}
            <div className="senderid-add">
              <button
                className={`tab ${activeTab === 'add' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('add')}
              >
                Add
              </button>
              <button
                className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('upload')}
              >
                Upload
              </button>
              <button
                className={`tab ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('list')}
                >
                Sender ID List
                </button>
            </div>

            <div className='responseMsg'>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            {/* Add Section */}
            {activeTab === 'add' && (
              <div className="add-section-senderId">
                <div className="senderid-option-radio">
                  <label>Sender ID Type:</label>
                  <div className='wrap-radio-btns'>
                  <label>
                      <input
                        type="radio"
                        name="senderIdType"
                        value="promo"
                        checked={senderIdType === 'promo'}
                        onChange={handleSenderTypeChange}
                      /> Promotional
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="senderIdType"
                        value="others"
                        checked={senderIdType === 'others'}
                        onChange={handleSenderTypeChange}
                      /> Others (Transactional/Service Implicit/Service Explicit)
                    </label>
                  </div>
                </div>

                <div className="senderid-option-wrap">
                  <label>New / Existing Entity ID:</label>
                  <input
                    type="text"
                    placeholder="Enter Entity ID"
                    value={entityId}
                    maxLength={50} 
                    onChange={(e) => handleNumericInput(e.target.value, setEntityId)}
                  />
                </div>

                <div className="senderid-option-wrap">
                  <label>Header ID:</label>
                  <input
                    type="text"
                    placeholder="Enter Header ID"
                    value={headerId}
                    maxLength={50}
                    onChange={(e) => handleNumericInput(e.target.value, setHeaderId)}
                  />
                </div>

                <div className="senderid-option-wrap">
                  <label>Sender ID:</label>
                  <input
                     type="text"
                     placeholder={
                     senderIdType === "promo"
                     ? "Enter Numeric Sender ID"
                     : "Enter Alpha Numeric Sender ID"
                     }
                     value={senderId}
                     onChange={(e) => handleSenderIdInput(e.target.value)}
                  />
                  {senderId.length > 0 && senderId.length < 3 && (
                    <small style={{ color: "red" }}>
                        Sender ID must be at least 3 characters long.
                    </small>
                    )}
                </div>

                <button className="btn submit-buttons" onClick={handleAddSenderId}>Add</button>
              </div>
            )}

            {/* Upload Section */}
            {activeTab === 'upload' && (
              <div className="upload-section-senderId">
                <div className="senderid-option-radio">
                  <label>Sender ID Type:</label>
                  <div className='wrap-radio-btns'>
                  <label>
                      <input
                        type="radio"
                        name="senderIdType"
                        value="promo"
                        checked={senderIdType === 'promo'}
                        onChange={handleSenderTypeChange}
                      /> Promotional
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="senderIdType"
                        value="others"
                        checked={senderIdType === 'others'}
                        onChange={handleSenderTypeChange}
                      /> Others (Transactional/Service Implicit/Service Explicit)
                    </label>
                  </div>
                </div>

                <div className="senderid-option-wrap">
                  <label>New / Existing Entity ID:</label>
                  <input
                    type="text"
                    placeholder="Enter Entity ID"
                    value={entityId}
                    maxLength={50}
                    onChange={(e) => handleNumericInput(e.target.value, setEntityId)}
                    />
                </div>

                <div className="senderid-option-wrap">
                  <label>Header ID:</label>
                  <input
                    type="text"
                    placeholder="Enter Header ID"
                    value={headerId}
                    maxLength={50}
                    onChange={(e) => handleNumericInput(e.target.value, setHeaderId)}
                    />
                </div>

                <div className="senderid-option-wrap">
                  <label>Add Sender ID File:</label>
                  <div className="input-alert-combine">
                  <input type="file" accept=".csv" onChange={handleFileChange} />
                  <small className="file-name">{fileName ? fileName : ""}</small>
                  <small className="note"><strong>NOTE:</strong> only .csv (comma separated) file is allowed</small>
                  </div>
                </div>

                <button className="btn upload-buttons" onClick={handleUpload}>Upload</button>
              </div>
            )}

            {/* Sender ID List Section */}
          {activeTab === 'list' && (
            <>
            <div className="wrap-add-senderid">
            <div className="senderid-search-filter">
              <input
                type="text"
                id="search"
                placeholder="Search Sender ID"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
              {isLoading ? ( 
                <div className="loader-overlay">
                <div className="loader"></div>
                    <p>Please wait...</p>
                </div>
              ) : (
                <>
                <div className="addSenderId-table-container">
                <table className="addSenderId-table">
                  <thead>
                    <tr>
                      <th></th> {/* Expand Button Column */}
                      <th>Sender Id</th>
                      <th>Active</th>
                      <th>Default</th>
                      <th>Entity Id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSenderIdList.length > 0 ? (
                      <>
                        {filteredSenderIdList.map((row, index) => (
                          <React.Fragment key={index}>
                            <tr>
                              <td>
                                <button
                                  className="senderid-expand-btn"
                                  onClick={() => toggleRowExpansion(index)}
                                >
                                  {expandedRows[index] ? "−" : "+"}
                                </button>
                              </td>
                              <td>{row.senderId}</td>
                              <td>{row.isActive}</td>
                              <td>{row.isDefault}</td>
                              <td>
                              {(userData.username === "user4" || userData.username === "apitesting")
                                ? 'x'.repeat(row.entityId?.length || 0)
                                : row.entityId}
                            </td>
                            </tr>
                            {expandedRows[index] && (
                              <tr className="sender-idexpanded-row">
                                <td></td>
                                <td colSpan="4">
                                  <div className="senderid-expanded-content">
                                    <p>
                                    <strong>Header Id:</strong>{' '}
                                    {(userData.username === "user4" || userData.username === "apitesting")
                                      ? 'x'.repeat(row.headerId?.length || 0)
                                      : row.headerId}
                                    </p>
                                    <p>
                                      <strong>Sender Id Type:</strong> {row.senderIdType}
                                    </p>
                                    <p>
                                      <strong>Actions:</strong>{" "}
                                      <button
                                        className="btn delete-btn"
                                        onClick={() => handleDeleteSenderId(row.id, row.senderId)}
                                      >
                                        Delete
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
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          No Data Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p class="table-entries">There are total <strong>{filteredSenderIdList.length}</strong> entries</p>
              
              </>
              
                )}
                 </div>
                 </>
                )}
          </div>

          <Footer /> 
        </div>
      </div>

      {isLoading && (
        <div className="loader-overlay">
          <div className="loader"></div>
          <p>Please wait...</p>
        </div>
      )}
      
    </div>
  );
}

export default AddSenderId;
