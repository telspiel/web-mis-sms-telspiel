import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import "./GroupContacts.css"
import Endpoints from '../endpoints';

function GroupContacts({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('addGroup'); 

  //To add Group Contact Name
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  //To get the Group Contact List table data
  const [groupContactList, setGroupContactList] = useState([]);

  const [responseMessage, setResponseMessage] = useState("");
  const responseMsgRef = useRef(null); 

  const [isLoading, setIsLoading] = useState(false);

  //Filter Search
  const [filteredGroupList, setFilteredGroupList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    //Reset on tab switch
    setGroupName("");
    setGroupDescription("");

  };

  //To add group contact data api
  const handleAddGroup = async () => {
    if (!groupName.trim() || !groupDescription.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(Endpoints.get('addGroupContact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          groupName,
          groupDescription,
          loggedInUserName: userData.username,
        }),
      });

      const result = await response.json();
      if (result.code === 6001 && result.result === 'Success') {
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
        
        //To empty input fields
        setGroupName('');
        setGroupDescription('');
      } else {
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error adding group:', error);
    } finally {
      setIsLoading(false); 
   }
  };

  //Fetch all created Group Contacts List
    const fetchGroupContactslist = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(Endpoints.get("allGroupListData"), {
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
        console.log("Group Contact list API response:", data);
  
        // Validate and extract senderIdList
        if (data && data.code === 5001 && data.result === "Success") {
          const groupContactList = data.data?.groupList || []; 

          setGroupContactList(groupContactList);
          setFilteredGroupList(groupContactList);
        } else {
          console.error("Invalid response:", data);
        }
      } catch (error) {
        console.error("Error Group Contact List:", error);
      } finally {
        setIsLoading(false); // Hide loader
     }
    };
  
    // Call API when activeTab is "listGroup"
useEffect(() => {
  if (activeTab === "listGroup") {
    fetchGroupContactslist();
  }
}, [activeTab]);

     // Handle search input change
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter groupContactList based on the query
    const filteredList = groupContactList.filter(
      (group) =>
        group.groupName.toLowerCase().includes(query) ||
        group.groupDescription.toLowerCase().includes(query)
    );

    setFilteredGroupList(filteredList);
  };


    //To Delete group contact from the table
    const handleDeleteGroup = async (groupName, groupDescription) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
          try {
            const response = await fetch(Endpoints.get('deleteGroupList'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: userData.authJwtToken,
              },
              body: JSON.stringify({
                groupName,
                groupDescription,
                loggedInUserName: userData.username,
                operation: "removeGroupFromList",
              }),
            });
      
            const result = await response.json();
            if (result.code === 8001 && result.result === 'Success') {
              setResponseMessage(result.message);  
              fetchGroupContactslist();            
              if (responseMsgRef.current) {
                responseMsgRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "start", 
                });
              }
    
             setTimeout(() => {
                setResponseMessage("");
              }, 3000);

              setGroupContactList((prevList) =>
              prevList.filter(
                (group) =>
                  group.groupName !== groupName &&
                  group.groupDescription !== groupDescription
              )
            );
            } else {
              console.error('Failed to delete group:', result);
              alert('Failed to delete group');
            }
          } catch (error) {
            console.error('Error deleting group:', error);
            alert('An error occurred while deleting the group');
          }
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
        <h2>Group Contacts</h2>

            <div className="senderid-add">
              <button
                className={`tab ${activeTab === 'addGroup' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('addGroup')}
              >
                Add Group
              </button>
              <button
                className={`tab ${activeTab === 'listGroup' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('listGroup')}
              >
                List Group
              </button>
            </div>

            <div className="shortUrlResponse" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            {activeTab === 'addGroup' && (
              <>
               <div className="wrap-group-contacts">
                <div className="group-filter-contacts-wrap">
                <div className="group-input-filed">
                  <label htmlFor="groupName">Group Name</label>
                  <div className="input-alert-combine">
                  <input
                    type="text"
                    id="groupName"
                    name="groupName"
                    placeholder='Group Name'
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value.replace(/\s/g, ""))}
                  />
                   <small><strong>NOTE:</strong> *no space allowed</small>
                  </div>
                </div>
                <div className="group-input-filed">
                  <label htmlFor="description">Description</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    placeholder='Department Name'
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                  />
                </div>
                <div className="group-form-actions">
                  <button className="btn submit-btn" type="button" onClick={handleAddGroup}>
                    Submit
                  </button>
                  <button className="btn cancel-btn" type="button"
                  onClick={() => {
                    setGroupName('');
                    setGroupDescription('');
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
              </div>
                </>
            )}  

            {activeTab === 'listGroup' && ( 
                <>
                 <div className="wrap-group-contacts">
                  <div className="group-contact-search-filter">
                  <input
                    type="text"
                    id="filter-input"
                    placeholder="Search Group Contact"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                {isLoading ? ( 
                    <div className="loader-overlay">
                      <div className="loader"></div>
                      <p>Please wait...</p>
                    </div>
                  ) : (
                <div className="individual-contacts-table-container">
                <table className="individual-contacts-table">
                    <thead>
                        <tr>
                        <th>Sr. No.</th>
                        <th>Group Name</th>
                        <th>Description</th>
                        <th>Total Numbers in Group</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {filteredGroupList.map((group, index) => (
                        <tr key={group.groupId}>
                            <td>{index + 1}</td>
                            <td>{group.groupName}</td>
                            <td>{group.groupDescription}</td>
                            <td>{group.numbersInGroupCount}</td>
                            <td>
                            <button
                                className="btn delete-btn"
                                onClick={() =>
                                    handleDeleteGroup(group.groupName, group.groupDescription)
                                  }
                            >
                                Delete
                            </button>
                            </td>
                        </tr>
                        ))}
                        {filteredGroupList.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center" }}>
                                No matching records found.
                            </td>
                            </tr>
                        )}
                    </tbody>
                    </table>
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

export default GroupContacts