import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import "./BlacklistContacts.css"
import Endpoints from '../endpoints';

function BlacklistContacts({ userData, onLogout }) {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('add'); 

  //To add blacklist number
  const [addMobileNumber, setAddMobileNumber] = useState("");
  const [addDescription, setAddDescription] = useState("");

  //To upload blacklist number
  const [uploadFile, setUploadFile] = useState(null); 
  const [uploadDescription, setUploadDescription] = useState("");

  //To get all the description created
  const [descriptionOptions, setDescriptionOptions] = useState([]);

  //To Get all the blacklist data in the table when we click on list all
  const [blacklistData, setBlacklistData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); 

  //To Get data on table based on a particular description
  const [selectedDescription, setSelectedDescription] = useState("");

  //To get data on table based on particular number
  const [mobileNumber, setMobileNumber] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [responseMessage, setResponseMessage] = useState("");
  const responseMsgRef = useRef(null); 


  //Pagination starts================================================
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Calculate the indexes for slicing the data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = blacklistData.slice(indexOfFirstRow, indexOfLastRow);

  // Calculate total pages
  const totalPages = Math.ceil(blacklistData.length / rowsPerPage);

  // Handlers for pagination controls
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  //Pagination ends==================================================


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    //Reset input fields
    setAddMobileNumber("");
    setAddDescription("");
    setUploadFile(null);
    setUploadDescription("");
  };

  //================================ADD SECTION==========================================
  const handleAddBlacklist = async () => {
    if (addMobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
  
    if (!addDescription.trim()) {
      alert("Please enter a description.");
      return;
    }

    setIsLoading(true); 
  
    const payload = {
      loggedInUserName: userData.username,
      mobileNumber: `91${addMobileNumber}`,
      description: addDescription,
      operation: "addUserBlackListNumber",
    };

    try {
      const apiEndpoint = userData.dlrType === "WEB_PANEL"
        ? Endpoints.get("addBlacklistWeb")
        : Endpoints.get("addBlacklistMis");
  
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify(payload),
      });
  
      const responseText = await response.text(); // Read the response as text
  
      console.log("Add Blacklist API response (text):", responseText);
  
      if (response.ok) {
        setResponseMessage(responseText); // Display the plain text response
        if (responseText.includes("Successfully")) {

            if (responseMsgRef.current) {
                responseMsgRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "start", 
                });
              }
    
            setTimeout(() => {
                setResponseMessage("");
              }, 3000);

          // Reset the input fields on success
          setAddMobileNumber("");
          setAddDescription("");
        }
      } else {
        // Handle errors from the server
        alert(`Error: ${responseText}`);
      }
    } catch (error) {
      console.error("Error adding blacklist number:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); 
    }
  };

  //===============================UPLOAD SECTION=========================================
  const handleUploadBlacklist = async () => {
    if (!uploadFile) {
      alert("Please select a .txt file to upload.");
      return;
    }
  
    if (!uploadDescription.trim()) {
      alert("Please enter a description.");
      return;
    }
  
    if (uploadFile.type !== "text/plain") {
      alert("Only .txt files are allowed.");
      return;
    }

    setIsLoading(true); 
  
    const formData = new FormData();
    formData.append("userName", userData.username); // Pass the username
    formData.append("fileType", "txt"); // Specify the file type
    formData.append("file", uploadFile); // Attach the binary file
    formData.append("description", uploadDescription); // Add the description
  
    try {
      const apiEndpoint = userData.dlrType === "WEB_PANEL"
        ? Endpoints.get("uploadBlacklistWeb")
        : Endpoints.get("uploadBlacklistMis");
  
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: userData.authJwtToken, // Add authentication token
        },
        body: formData, // Use FormData for file upload
      });
  
      const data = await response.json(); // Parse the response as JSON
      console.log("Upload Blacklist API response (JSON):", data);
  
      if (response.ok) {
        setResponseMessage(
          `Message: ${data.msg}
          Total Count: ${data.totalCount}
          Duplicate Numbers: ${data.duplicateNumber}
          Numbers Saved: ${data.totalNumberSave}`
        );
  
        if (responseMsgRef.current) {
          responseMsgRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
  
        setTimeout(() => {
          setResponseMessage("");
        }, 3000);
  
        // Reset the form fields on success
        setUploadFile(null);
        setUploadDescription("");
      } else {
        // Handle server-side errors
        alert(`Error: ${data.msg || "An error occurred."}`);
      }
    } catch (error) {
      console.error("Error uploading blacklist file:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  //============================VIEW/DELETE SECTION=======================================
  //To get all the description name created
  useEffect(() => {
    const fetchAllDescriptionName = async () => {
      try {
        const apiEndpoint =
        userData.dlrType === "WEB_PANEL"
          ? Endpoints.get("getAllDescriptionWeb")
          : Endpoints.get("getAllDescriptionMis");

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
        console.log("Promotional Msg API response:", data);
  
        // Validate and extract senderIdList
        if (Array.isArray(data)) {
            setDescriptionOptions(data); // Set options for rendering
          } else {
          console.error("Invalid response:", data);
        }
      } catch (error) {
        console.error("Error fetching Promotional Msg:", error);
      }
    };
  
    if (activeTab === "view") {
        fetchAllDescriptionName();
      }
    }, [activeTab, userData]); 

  //To Get all the blacklist numbers present in DB
  const fetchAllUserBlacklist = async () => {
    setIsLoading(true);
        try {
            const apiEndpoint =
            userData.dlrType === "WEB_PANEL"
              ? Endpoints.get("getAllBlacklistUserWeb")
              : Endpoints.get("getAllBlacklistUserMis");

            const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: userData.authJwtToken,
            },
            body: JSON.stringify({
            loggedInUserName: userData.username,
            operation: "getAllBlackListNumbersForUser",
            }),
        });

        const data = await response.json();
        console.log("Blacklist User API response:", data);

        if (data.code === 15001) {
            setResponseMessage(data.message)
            if (responseMsgRef.current) {
                responseMsgRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start", 
             });
            }
            
            setTimeout(() => {
                setResponseMessage("");
            }, 3000);
            
            setBlacklistData(data.data.userBlackListNumberList || []);
          } else {
            console.error("Invalid response:", data);
        }
        } catch (error) {
        console.error("Error fetching Blacklist User data:", error);
        } finally {
            setIsLoading(false); 
            setSelectedDescription("");
            setMobileNumber("");
         }
    };  

    const handleRowSelection = (id) => {
        setSelectedRows((prevSelected) =>
          prevSelected.includes(id)
            ? prevSelected.filter((rowId) => rowId !== id)
            : [...prevSelected, id]
        );
      };
      
      const handleSelectAll = () => {
        if (selectedRows.length === blacklistData.length) {
          setSelectedRows([]); // Deselect all
        } else {
          setSelectedRows(blacklistData.map((row) => row.id)); // Select all
        }
      };

  //Change description name before searching
  const handleDescriptionChange = (event) => {
    setSelectedDescription(event.target.value); // Update selected description
  };

  //To Search data based on a particular description
  const searchBlacklistDescription = async () => {
    if (!selectedDescription || selectedDescription === "--Select Description--") {
        alert("Please select a valid description!");
        return;
      }

    setIsLoading(true);
        try {
            const apiEndpoint =
            userData.dlrType === "WEB_PANEL"
              ? Endpoints.get("searchBlacklistDescriptionWeb")
              : Endpoints.get("searchBlacklistDescriptionMis");

            const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: userData.authJwtToken,
            },
            body: JSON.stringify({
            loggedInUserName: userData.username,
            description: selectedDescription,
            operation: "searchUserBlackListNumber",
            }),
        });

        const data = await response.json();
        console.log("Blacklist Description API response:", data);

        if (data.code === 7001) {
            setBlacklistData(data.data.userBlackListNumberList || []);
          } else {
            console.error("Invalid response:", data);
        }
        } catch (error) {
        console.error("Error fetching Blacklist Description data:", error);
        } finally {
            setIsLoading(false); 
            setMobileNumber("");
         }
    };  

    //To handle mobile number change
    const handleMobileNumberChange = (event) => {
        setMobileNumber(event.target.value); // Update mobile number state
      };

    //To search a particular blacklist number
    const searchBlacklistNumber = async () => {
        if (!/^\d{10}$/.test(mobileNumber)) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
          }
        setIsLoading(true);
            try {
                const apiEndpoint =
                userData.dlrType === "WEB_PANEL"
                  ? Endpoints.get("searchBlacklistNumberWeb")
                  : Endpoints.get("searchBlacklistNumberMis");
    
                const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                Authorization: userData.authJwtToken,
                },
                body: JSON.stringify({
                loggedInUserName: userData.username,
                mobileNumber: `91${mobileNumber}`,
                operation: "searchUserBlackListNumber",
                }),
            });
    
            const data = await response.json();
            console.log("Blacklist Mobile Number API response:", data);
    
            if (data.code === 7001) {
                setBlacklistData(data.data.userBlackListNumberList || []);
              } else {
                console.error("Invalid response:", data);
            }
            } catch (error) {
            console.error("Error fetching Blacklist Mobile Number:", error);
            } finally {
                setIsLoading(false); 
                setSelectedDescription("");
             }
        };  

     //Delete Blacklist Numbers
     const deleteSelectedRows = async () => {
        if (selectedRows.length === 0) {
          alert("Please select rows to delete.");
          return;
        }
      
        try {
          setIsLoading(true);
          console.log("Loader is activated: " + isLoading);
      
          // Determine the correct API endpoint
          const apiEndpoint =
            userData.dlrType === "WEB_PANEL"
              ? Endpoints.get("removeBlacklistNumberWeb")
              : Endpoints.get("removeBlacklistNumberMis");
      
          // Payload for the API call
          const payload = {
            loggedInUserName: userData.username,
            numberToBeRemoved: selectedRows,
            operation: "removeUserBlackListNumber",
          };
      
          // Log API endpoint and payload for debugging
          console.log("API Endpoint:", apiEndpoint);
          console.log("Payload:", JSON.stringify(payload, null, 2));
      
          // Make the API call
          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: userData.authJwtToken,
            },
            body: JSON.stringify(payload),
          });
      
      
          // Parse the response
          const data = await response.json();
      
          // Handle a successful response
          if (response.ok && data.code === 5001) {
            setResponseMessage(data.message);

            if (responseMsgRef.current) {
                responseMsgRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
        
              setTimeout(() => {
                setResponseMessage("");
              }, 5000);
      
            // Remove the deleted rows from the table
            setBlacklistData((prevData) =>
              prevData.filter((row) => !selectedRows.includes(row.id))
            );
            // Clear the selected rows
            setSelectedRows([]);
          } else {
            console.log(`Error: ${data.message || "Unable to delete selected rows."}`);
          }
        } catch (error) {
          console.error("Error deleting rows:", error.message || error);
        } finally {
          setIsLoading(false);
        }
      };

  //Download Blacklist Contacts table data in csv format
  const handleDownload = () => {
    if (currentRows.length === 0) {
      alert("No Data To Download");
      return;
    }
  
    // Prepare CSV content
    const headers = [
      "User Blacklist Number",
      "Description",
      "Created Date",
    ];
    const row = currentRows.map((row) => [
        row.userBlackListNumber,
        row.description,
        row.createdDate,
    ]);
  
    const csvContent = [headers, ...row]
      .map((e) => e.join(","))
      .join("\n");
  
    // Create a Blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user_blacklist_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <h2>Blacklist Contacts</h2>

            {/* Tabs for Add, Upload and View/Delete*/}
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
                className={`tab ${activeTab === 'view' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('view')}
                >
                View/Delete
                </button>
            </div>

            <div className="blacklistResponseMsg" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            {/* Add Blacklist Number Section */}
            {activeTab === 'add' && (
              <div className="wrap-blacklist-contacts">
             <div className="add-section">
             <p>Add Blacklist Number</p>
             <div className="blacklist-option-wrap">
               <label>Mobile Number</label>
               <span className="prefix">+91</span>
               <input type="text" placeholder="Enter Blacklist Number" 
               value={addMobileNumber}
               onChange={(e) => setAddMobileNumber(e.target.value)}/>
             </div>

             <div className="blacklist-option-wrap">
                <label>Description:</label>
                <textarea placeholder="Enter Description"
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}></textarea>
            </div>

             <div className="blacklist-btn"> 
               <button className="add-button" onClick={handleAddBlacklist}>Add</button>
               <button className="cancel-button" onClick={() => {setAddMobileNumber(""); setAddDescription("");}}>Cancel</button>
             </div>
           </div>
           </div>
            )}

            {activeTab === 'upload' && (
              <div className="wrap-blacklist-contacts">
                 <div className="upload-section">
                 <p>Upload Blacklist Number</p>
                 <div className="blacklist-option-wrap">
                <label>Choose File:</label>
                <div className="input-alert-combine">
                <input
                    type="file"
                    accept=".txt"
                    className="file-input"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                />
                <small className="file-name">{uploadFile ? uploadFile.name : ""}</small>
                <small><strong>NOTE:</strong> only .txt files are allowed, It'll only accept a file having numbers max. 50,000</small>
                </div>
                </div>
    
                 <div className="blacklist-option-wrap">
                    <label>Description:</label>
                    <textarea
                    placeholder="Enter Description"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    ></textarea>
                </div>
    
                 <div className="blacklist-btn">
                   <button className="add-button" onClick={handleUploadBlacklist}>Upload</button>
                   <button className="cancel-button"
                   onClick={() => {
                    setUploadFile(null);
                    setUploadDescription("");
                  }}
                   >Cancel</button>
                 </div>
               </div>
               </div>
            )}

            {activeTab === 'view' && (
                <>
                <div className="wrap-blacklist-contacts">
                 <div className="view-section">
                 <div className="view-section-all-wrap">
                   <button className="list-all-button" onClick={fetchAllUserBlacklist}>List All</button>
                 </div>
             
                 <div className="view-search-section"> 
                   <div className="search-wrap">
                     <label>Search Mobile Number</label>
                     <div className="input-group">
                       <span className="prefix">+91</span>
                       <input type="text" placeholder="Mobile Number"  
                       value={mobileNumber}
                       onChange={handleMobileNumberChange}
                       />
                     </div>
                     <button className="view-blacklist-search-button-mobile" onClick={searchBlacklistNumber}>Search</button>
                   </div>
             
                   <div className="search-wrap">
                     <label>Description</label>
                     <select className="view-description-select" 
                     value={selectedDescription}
                     onChange={handleDescriptionChange}
                     >
                        <option>--Select Description--</option>
                        {descriptionOptions.map((description, index) => (
                        <option key={index} value={description}>
                            {description}
                        </option>
                        ))}
                    </select>
                     <button className="view-blacklist-search-button"  onClick={searchBlacklistDescription}>Search</button>
                   </div>
                 </div>
               </div>

               <div className='blacklist-buttons-wrap'>
                <button 
                className="download-blacklist-button" onClick={handleDownload}>
                  Download
                </button>
                <button
                className="delete-selected-button"
                onClick={deleteSelectedRows}
                disabled={selectedRows.length === 0}
                >
                Delete Selected
                </button>
               </div>
               </div>
              
               <div className="wrap-blacklist-contacts">
               {isLoading ? ( 
              <div className="loader-overlay">
                <div className="loader"></div>
                <p>Please wait...</p>
              </div>
            ) : (
               <div className='blacklist-contacts-table-container'>
                <table className='blacklist-contacts-table'>
                  <thead>
                    <tr>
                      <th>
                        <input
                        type="checkbox"
                        checked={
                            blacklistData.length > 0 &&
                            selectedRows.length === blacklistData.length
                        }
                        onChange={handleSelectAll}
                        />
                      </th>
                      {/* <th>Id</th> */}
                      <th>User Blacklist Number</th>
                      <th>Description</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {/* Individual row checkbox */}
                        <input
                          type="checkbox"
                          className='blacklist-checkbox'
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleRowSelection(row.id)}
                        />
                      </td>
                      {/* <td>{row.id}</td> */}
                      <td>{row.userBlackListNumber}</td>
                      <td>{row.description}</td>
                      <td>{row.createdDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No data available
                    </td>
                  </tr>
                )}
                  </tbody>
                </table>

                <div className="pagination-controls">
                <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="pagination-button"
                >
                Previous
                </button>
                <span className="pagination-info">
                Page {currentPage} of {totalPages}
                </span>
                <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="pagination-button"
                >
                Next
                </button>
                </div>
              </div>
               )}
               </div>
               </>
            )}

         </div>

        <Footer/>
        </div>
        </div>

        {isLoading && (
        <div className="loader-overlay">
          <div className="loader"></div>
          <p>Please wait...</p>
        </div>
      )}
    </div>
  )
}

export default BlacklistContacts