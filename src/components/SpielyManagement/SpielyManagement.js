import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import Endpoints from '../endpoints';
import "./SpielyManagement.css";

function SpielyManagement({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('create'); // Default active tab

    const [domainList, setDomainList] = useState([]);

    const [selectedMessageType, setSelectedMessageType] = useState('trans');
    
    const [senderIdList, setSenderIdList] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    //For Preview Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUrl, setSelectedUrl] = useState(null);


    const [responseMessage, setResponseMessage] = useState("");
    const responseMsgRef = useRef(null); 

    //To save new short url
    const [formData, setFormData] = useState({
        name: "",
        isActive: "yes",
        isDynamic: "no",
        domainName: "",
        senderId: "",
        longUrl: "",
        callbackUrl: "",
      });

    //Short Url Table Data
    const [shortUrlList, setShortUrlList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filteredShortUrlList, setFilteredShortUrlList] = useState([]);

    const [expandedRows, setExpandedRows] = useState({});

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

      const handleTabSwitch = (tab) => {
        setActiveTab(tab);

        // Reset form fields when switching tabs
        setFormData({
          name: "",
          isActive: "yes",
          isDynamic: "no",
          domainName: "",
          senderId: "",
          longUrl: "",
          callbackUrl: "",
          shortUrlCode: "",
          longUrlProtocol: "http://",
          callbackUrlProtocol: "http://",
        });
      
        // Reset selected message type if needed
        setSelectedMessageType('trans');
      };

      //Fetch all the Domain Name List Data
      useEffect(() => {
        const fetchDomainNameData = async () => {
          try {
            const response = await fetch(Endpoints.get("getApprovedDomainList"), {
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
      
            // Validate and extract hostNameList
            if (data && data.code === 7003 && data.result === "Success") {
              const domainNameList = data.data?.hostNameList || [];
              setDomainList(domainNameList);
            } else {
              console.error("Invalid response:", data);
            }
          } catch (error) {
            console.error("Error fetching domain names:", error);
          }
        };
      
        if (activeTab === "create") {
          fetchDomainNameData();
        }
      }, [activeTab, userData]);

      // API Call for Sender ID List according to mwssage type
      const fetchSenderIdList = async (messageType) => {
        try {
          const response = await fetch(Endpoints.get('senderIdListByMessageType'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: userData.authJwtToken,
            },
            body: JSON.stringify({
              loggedInUserName: userData.username,
              messageType: messageType,
              messageSubType: '',
            }),
          });
    
          const data = await response.json();
          console.log('Sender ID List API Response:', data);
    
          if (data?.data?.senderIdList) {
            setSenderIdList(data.data.senderIdList); // Store senderIdList in state
          }
        } catch (error) {
          console.error('Error fetching Sender ID List:', error);
        }
      };
    
      // Fetch Sender ID List on initial load with default "others" type
      useEffect(() => {
        fetchSenderIdList('others');
      }, []);
    
      // Handle radio button change
      const handleMessageTypeChange = (event) => {
        const selectedType = event.target.value;
        setSelectedMessageType(selectedType);
    
        const messageTypePayload = selectedType === 'trans' ? 'others' : 'promo';
        fetchSenderIdList(messageTypePayload);
      };
      

    //------------------Render Short URL Table data------------------------
    const fetchShortUrlData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(Endpoints.get("listShortUrl"), {
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
        console.log("List Short URL API response:", data);
    
        if (data && data.code === 11003 && data.result === "Success") {
          setShortUrlList(data.data?.shortUrlList || []);
          setFilteredShortUrlList(data.data?.shortUrlList || []);
        } else {
          console.error("Invalid response:", data);
        }
      } catch (error) {
        console.error("Error fetching short URL list:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Call `fetchShortUrlData` inside useEffect
    useEffect(() => {
      if (activeTab === "view") {
        fetchShortUrlData();
      }
    }, [activeTab, userData]);
    


    //HANDLE EDIT URL API CALL
    const handleEditShortUrl = async () => {
      const editUrlProtocol = document.getElementById("editUrlProtocol").value;
      const callBackUrlInput = document.querySelector("input[name='callBackUrl']").value.trim();
    
      if (!callBackUrlInput) {
        alert("Please enter a valid Callback URL.");
        return;
      }
    
      const fullCallbackUrl = `${editUrlProtocol}${callBackUrlInput}`;
    
      const payload = {
        callbackUrl: fullCallbackUrl,
        loggedInUserName: userData.username,
        name: selectedUrl?.name,
        operation: "editshorturl",
        shortUrlId: selectedUrl?.shortUrlId,
      };
    
      try {
        const response = await fetch(Endpoints.get("editShortUrl"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: userData.authJwtToken,
          },
          body: JSON.stringify(payload),
        });
    
        const data = await response.json();
        console.log("Edit Short URL API response:", data);
    
        if (data && data.code === 16000 && data.result === "Success") {
          setResponseMessage(data.message);
          closeModal();
          fetchShortUrlData();

          if (responseMsgRef.current) {
            responseMsgRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start", 
            });
          }

        setTimeout(() => {
            setResponseMessage("");
          }, 3000);
        } else {
          alert("Failed to update Callback URL.");
        }
      } catch (error) {
        console.error("Error updating Callback URL:", error);
      }
    };
      

      // Handle filter
      const handleSearch = (e) => {
        const value = e.target.value;
        setSearchText(value); // preserve what user types (upper/lower)
      
        const searchValue = value.toLowerCase(); // use lowercase for comparison
        const filteredData = shortUrlList.filter(
          (url) =>
            url.name.toLowerCase().includes(searchValue) ||
            url.shortCode.toLowerCase().includes(searchValue) ||
            (url.callbackUrl && url.callbackUrl.toLowerCase().includes(searchValue))
        );
        setFilteredShortUrlList(filteredData);
      };
      

  //-----------Delete created short url/spiely link from table-------------------------
  const handleDeleteShortUrl = async (shortUrlId) => {
    const payload = {
      loggedInUserName: userData.username, 
      operation: "removeShortUrlFromList",
      shortUrlId,
    };
  
    setIsLoading(true)
    try {
      const response = await fetch(Endpoints.get("deleteShortUrl"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken, 
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log("Delete Short URL API response:", data);
  
      if (data && data.code === 11005 && data.result === "Success") {
        setResponseMessage("Short URL deleted successfully!");
        fetchShortUrlData();

        if (responseMsgRef.current) {
            responseMsgRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start", 
            });
          }

        setTimeout(() => {
            setResponseMessage("");
          }, 3000);
  
        // Update the table data by removing the deleted row
        setShortUrlList((prevList) =>
          prevList.filter((url) => url.shortUrlId !== shortUrlId)
        );
      } else {
        console.log("Failed to delete Short URL: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error calling deleteShortUrl API:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

 //------------------ADD SHORT URL-------------------------------------
 const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Handle protocol selection changes
    if (name === "longUrlProtocol" || name === "callbackUrlProtocol") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value, // Update the selected protocol
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const payload = {
      callbackUrl: formData.callbackUrl || "",
      domainName: formData.domainName,
      isActive: formData.isActive === "yes" ? "Y" : "N",
      isDynamic: formData.isDynamic === "yes" ? "Y" : "N",
      loggedInUserName: userData.username,
      longUrl: (formData.longUrlProtocol || "http://") + formData.longUrl,
      name: formData.name,
      senderId: formData.senderId,
    };

    setIsLoading(true);
    try {
      const response = await fetch(Endpoints.get("addShortUrl"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log("Add Short URL API response:", data);
  
      // Check for success based on code and result
      if (data && data.code === 11001 && data.result === "Success") {
        console.log("Short URL added successfully!");
        setResponseMessage(data.message);
        //clear the for data on successful submission of API
        setFormData({
          name: "",
          isActive: "yes",  // Default to "yes"
          isDynamic: "no",  // Default to "no"
          domainName: "",
          senderId: "",
          longUrl: "",
          longUrlProtocol: "http://", // Reset protocol
          callbackUrl: "",
          callbackUrlProtocol: "http://",
          shortUrlCode: data.data.data.shortCode, 
        });

        if (responseMsgRef.current) {
            responseMsgRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start", 
            });
          }

        setTimeout(() => {
            setResponseMessage("");
          }, 3000);
      } else {
        console.log("Failed to add Short URL: " + (data.message || "Unknown error"));
        setResponseMessage(data.message || "Failed to delete Sender ID.");

        if (responseMsgRef.current) {
            responseMsgRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start", 
            });
          }

        setTimeout(() => {
            setResponseMessage("");
          }, 3000);
      }
    } catch (error) {
      console.error("Error calling addShortUrl API:", error);
    } finally {
      setIsLoading(false);
    }
  };
   
  
  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  //To open modal page to Add/Edit Callback URL
  const openModal = (url) => {
    setModalOpen(true);
    setSelectedUrl(url);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUrl(null);
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
        username={userData.username}
      />
      <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="dashboard-content">
            <h2>New Short URL</h2>

            <div className="spiely-options">
              <button
                className={`tab ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('create')}
              >
                Create
              </button>
              <button
                className={`tab ${activeTab === 'view' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('view')}
              >
                View
              </button>
            </div> 

            <div className="shortUrlResponse" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            {/* Create Spiely Link */}
            {activeTab === 'create' && (     
                <form className="spiely-form" onSubmit={handleSubmit}>
                <div className="form-group-spiely">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
          
                {/* <div className="form-group-spiely-radio">
                  <label>Is Active</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="isActive"
                        value="yes"
                        checked={formData.isActive === "yes"}
                        onChange={handleInputChange}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="isActive"
                        value="no"
                        checked={formData.isActive === "no"}
                        onChange={handleInputChange}
                      />{" "}
                      No
                    </label>
                  </div>
                </div> */}
          
                <div className="form-group-spiely-radio">
                  <label>Is Dynamic</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="isDynamic"
                        value="yes"
                        checked={formData.isDynamic === "yes"}
                        onChange={handleInputChange}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="isDynamic"
                        value="no"
                        checked={formData.isDynamic === "no"}
                        onChange={handleInputChange}
                      />{" "}
                      No
                    </label>
                  </div>
                </div>

                
          
                <div className="form-group-sender-header">
                   <div className="domain-header-wrap">
                    <label htmlFor="selectDomain">Select Domain</label>
                    <select
                     id="selectDomain"
                     name="domainName"
                     value={formData.domainName}
                     onChange={handleInputChange} 
                     required>
                        <option value="">-- Select --</option>
                        {domainList.map((domain) => (
                        <option key={domain.id} value={domain.domainName}>
                            {domain.domainName}
                        </option>
                        ))}
                    </select>
                    </div>
                     
                    <div className="domain-header-wrap">
                        <div className='header-msg-type'>
                        <label htmlFor="header">Header</label>

                        <div className="radio-group">    
                        <label>
                          <input
                            type="radio"
                            name="type"
                            value="trans"
                            checked={selectedMessageType === 'trans'}
                            onChange={handleMessageTypeChange}
                          />{' '}
                          Trans
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="type"
                            value="promo"
                            checked={selectedMessageType === 'promo'}
                            onChange={handleMessageTypeChange}
                          />{' '}
                          Promo
                        </label>
                        </div>
                        </div>

                        <select
                        id="header"
                        name="senderId"
                        value={formData.senderId}
                        onChange={handleInputChange} 
                        required >
                        <option value="">-- Select --</option>
                        {senderIdList.map((sender) => (
                            <option key={sender.idOfSenderId} value={sender.senderId}>
                            {sender.senderId}
                            </option>
                        ))}
                       </select>
                    </div>
                   </div>
          
                   <div className="form-group-spiely-url">
                    <label htmlFor="longurl">Long URL</label>
                    <select
                        id="longurlProtocol"
                        name="longUrlProtocol"
                        value={formData.longUrlProtocol || "http://"}
                        onChange={handleInputChange}
                    >
                        <option value="http://">http://</option>
                        <option value="https://">https://</option>
                    </select>
                    <input
                        type="text"
                        name="longUrl"
                        placeholder="Enter Long URL"
                        value={formData.longUrl}
                        onChange={handleInputChange}
                        required
                    />
                    </div>

                    <div className="form-group-spiely-url">
                    <label htmlFor="callbackurl">Callback URL</label>
                    <select
                        id="callbackurlProtocol"
                        name="callbackUrlProtocol"
                        value={formData.callbackUrlProtocol || "http://"}
                        onChange={handleInputChange}
                    >
                        <option value="http://">http://</option>
                        <option value="https://">https://</option>
                    </select>
                    <input
                        type="text"
                        name="callbackUrl"
                        placeholder="Enter Callback URL"
                        value={formData.callbackUrl}
                        onChange={handleInputChange}
                    />
                    </div>

                    <div className="form-group-spiely">
                    <label>Short URL Code</label>
                    <input 
                        type="text" 
                        name="shortUrlCode" 
                        value={formData.shortUrlCode || ""}
                        placeholder="Short URL code will be generated after hitting submit button" 
                        readOnly
                    />
                    </div> 
          
                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    Save
                  </button>
                  <button type="reset" className="btn-reset" onClick={() => setFormData({
                    name: "",
                    isActive: "",
                    isDynamic: "",
                    domainName: "",
                    senderId: "",
                    longUrl: "",
                    callbackUrl: "",
                  })}>
                    Reset
                  </button>
                </div>
              </form>        
            )}

            {/* Table Spiely Link Data*/}
            {activeTab === 'view' && (
               <div className="wrap-add-spiely-link">
                 <div className="filter-short-url">
                  <label htmlFor="filter-input">Search:</label>
                  <input
                    type="text"
                    id="filter-input"
                    value={searchText}
                    onChange={handleSearch}
                    placeholder="Search Here"
                  />
                </div>

                {isLoading ? ( 
                <div className="loader-overlay">
                  <div className="loader"></div>
                  <p>Please wait...</p>
                </div>
                ) : (
                  <>
                <table className="spiely-template-table">
                <thead>
                  <tr>
                    <th></th> {/* Expand Button Column */}
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Short Code</th>
                    <th>Is Active</th>
                    <th>Is Dynamic</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShortUrlList.length > 0 ? (
                    <>
                      {filteredShortUrlList.map((url, index) => (
                        <React.Fragment key={url.shortUrlId}>
                          <tr>
                            <td>
                              <button
                                className="spiely-expand-btn"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedRows[index] ? "−" : "+"}
                              </button>
                            </td>
                            <td>{index + 1}</td>
                            <td>{url.name}</td>
                            <td>{url.shortCode}</td>
                            <td>{url.isActive === "Y" ? "Yes" : "No"}</td>
                            <td>{url.isDynamic === "Y" ? "Yes" : "No"}</td>
                          </tr>
                          {expandedRows[index] && (
                            <tr className="spiely-expanded-row">
                              <td></td>
                              <td colSpan="5">
                                <div className="spiely-expanded-content">
                                  <p>
                                    <strong>Callback URL:</strong> {url.callbackUrl || "N/A"}
                                  </p>
                                  <p>
                            <strong>Actions:</strong>{" "}
                            <button
                              className="btn-edit-callback"
                              onClick={() => openModal(url)}
                            >
                              {url.callbackUrl ? "Edit Callback URL" : "Add Callback URL"}
                            </button>
                            <button
                              className="delete-short-url"
                              onClick={() => handleDeleteShortUrl(url.shortUrlId)}
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
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p class="table-entries">There are total <strong>{filteredShortUrlList.length}</strong> entries</p>
              </>
              )}

              {modalOpen && (
                <div className="spliely-modal-campaign">
                  <div className="spiely-modal-content-campaign">
                    <h2>ADD/EDIT Callback URL - {selectedUrl?.name}</h2>
                    <div className="form-group-spiely-url">
                    <select
                        id="editUrlProtocol"
                        name="editUrlProtocol"
                    >
                        <option value="http://">http://</option>
                        <option value="https://">https://</option>
                    </select>
                    <input
                        type="text"
                        name="callBackUrl"
                        placeholder="Enter Callback URL"
                        required
                    />
                    </div>

                    <div className="modal-buttons-spiely">
                      <button className="send-btn" onClick={handleEditShortUrl}> Send Now</button>
                      <button className="close-btn" onClick={closeModal}>Close</button>
                    </div>
                  </div>
                </div>
              )}

             </div>

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
  )
}

export default SpielyManagement