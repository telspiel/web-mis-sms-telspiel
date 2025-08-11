import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import Endpoints from '../endpoints';
import "./DomainManager.css";

function DomainManager({ userData, onLogout }) {

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [activeTab, setActiveTab] = useState('addDomain'); 

    const [domainForm, setDomainForm] = useState({
        title: '',
        domain: '',
      });
    
    //Domain Manager created Table Data
    const [domainManagerList, setDomainManagerList] = useState([]);

    const [expandedRows, setExpandedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [responseMessage, setResponseMessage] = useState("");
    const responseMsgRef = useRef(null); 

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

      const handleTabSwitch = (tab) => {
        setActiveTab(tab);
      };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDomainForm((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //--------------------To add new Domain Manager----------------------------
  const handleAdd = async (e) => {
    e.preventDefault();
  
    // Basic validation for required fields
    if (!domainForm.title.trim() || !domainForm.domain.trim()) {
      alert('Both Title and Domain are required.');
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await fetch(Endpoints.get("addDomainManager"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          domainName: domainForm.domain,
          title: domainForm.title,
          loggedInUserName: userData.username,
        }),
      });
  
      const result = await response.json();
      console.log("Add Domain API response:", result);
  
      if (result.code === 7001 && result.result === "Success") {
        setResponseMessage(result.message);

        if (responseMsgRef.current) {
            responseMsgRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start", 
            });
          }

        setTimeout(() => {
            setResponseMessage("");
          }, 3000);
        handleCancel(); 
      } else {
        console.log(`Failed to add domain: ${result.message}`);
        setResponseMessage(result.message || "Failed to delete Sender ID.");
      }
    } catch (error) {
      console.error("Error adding domain:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleCancel = () => {
    // Clear the form fields
    setDomainForm({ title: '', domain: '' });
  };

   //------------------Render DOMAIN MANAGER Table Data------------------------
   useEffect(() => {
    const fetchDomainManagerData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(Endpoints.get("listDomains"), {
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
        console.log("Domain Manager API response:", data);
  
        // Check for the actual response code and result
        if (data && data.code === 7003 && data.result === "Success") {
            setDomainManagerList(data.data?.hostNameList || []);
        } else {
          console.error("Invalid response:", data);
        }
      } catch (error) {
        console.error("Error fetching domain manager list:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (activeTab === "viewDomain") {
        fetchDomainManagerData();
    }
  }, [activeTab, userData]);

  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle expansion state
    }));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

   // Filter the domain list based on search input
   const filteredDomains = domainManagerList.filter(
    (domain) =>
      domain.domainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      domain.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //-----------Delete selected Domain Manager from table-------------------------
  const handleDeleteDomainManager = async (id, domainName) => {
    try {
      const response = await fetch(Endpoints.get("deleteDomain"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          loggedInUserName: userData.username,
          operation: "removeHostNameFromList",
          id: id,
          domainName: domainName,
        }),
      });
  
      const result = await response.json();
      console.log("Delete Domain API response:", result);
  
      if (result.code === 7005 && result.result === "Success") {
        setResponseMessage(result.message);

        if (responseMsgRef.current) {
            responseMsgRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start", 
            });
          }

        setTimeout(() => {
            setResponseMessage("");
          }, 3000);

        // Update the table by filtering out the deleted row
        setDomainManagerList((prevList) =>
          prevList.filter((domain) => domain.id !== id)
        );
      } else {
        alert(`Failed to delete domain: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
      alert("An error occurred while deleting the domain. Please try again.");
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
        username={userData.username}
      />
      <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="dashboard-content">
        <h2>Domain Manager</h2>

        
        <div className="domain-manager">
              <button
                className={`tab ${activeTab === 'addDomain' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('addDomain')}
              >
                Add Domain
              </button>
              <button
                className={`tab ${activeTab === 'viewDomain' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('viewDomain')}
              >
                View Domain
              </button>
            </div> 

            <div className="addDomainResponse" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            {activeTab === 'addDomain' && (
                 <form className="domain-manager-form" onSubmit={handleAdd}>
                 <div className="domain-group">
                   <label htmlFor="title">Title</label>
                   <input
                     type="text"
                     id="title"
                     name="title"
                     value={domainForm.title}
                     onChange={handleInputChange}
                     placeholder="Enter Title"
                     required
                   />
                 </div>
 
                 <div className="domain-group">
                   <label htmlFor="domain">Domain</label>
                   <input
                     type="text"
                     id="domain"
                     name="domain"
                     value={domainForm.domain}
                     onChange={handleInputChange}
                     placeholder="Enter Domain Name"
                     required
                   />
                   <p className="alert-note">
                     * Reduce message length. Enter the domain name without http/https.
                   </p>
                 </div>
 
                 <div className="form-buttons">
                   <button type="submit" className="btn btn-add">
                     Add
                   </button>
                   <button
                     type="button"
                     className="btn btn-cancel"
                     onClick={handleCancel}
                   >
                     Cancel
                   </button>
                 </div>
               </form>
            )}

            {activeTab === 'viewDomain' && (
                 <div className="wrap-domain-manager">
                   <div className="senderid-search-filter">
                    <input
                      type="text"
                      id="search"
                      placeholder="Search Domain Name"
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
                  <table className="domain-manager-table">
                    <thead>
                      <tr>
                        <th></th> {/* Expand Button Column */}
                        <th>S.No</th>
                        <th>Title</th>
                        <th>Domain Name</th>
                        <th>Is Approved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDomains.length > 0 ? (
                        <>
                          {filteredDomains.map((domain, index) => (
                            <React.Fragment key={domain.id}>
                              <tr>
                                <td>
                                  <button
                                    className="domain-expand-btn"
                                    onClick={() => toggleRowExpansion(index)}
                                  >
                                    {expandedRows[index] ? "−" : "+"}
                                  </button>
                                </td>
                                <td>{index + 1}</td>
                                <td>{domain.title}</td>
                                <td>{domain.domainName}</td>
                                <td>{domain.isApproved === "\u0000" ? "Yes" : "No"}</td>
                              </tr>

                              {/* Expanded Row */}
                              {expandedRows[index] && (
                                <tr className="domain-expanded-row">
                                  <td></td>
                                  <td colSpan="4">
                                    <div className="domain-expanded-content">
                                      <p>
                                        <strong>Created Date:</strong>{" "}
                                        {new Date(domain.createdDate).toLocaleString()}
                                      </p>
                                      <p>
                                        <strong>Actions:</strong>{" "}
                                        <button
                                          className="delete-domain-manager"
                                          onClick={() =>
                                            handleDeleteDomainManager(domain.id, domain.domainName)
                                          }
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
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <p class="table-entries">There are total <strong>{filteredDomains.length}</strong> entries</p>
                  </>
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

export default DomainManager