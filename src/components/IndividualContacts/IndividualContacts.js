import React, { useState, useEffect, useRef } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import "./IndividualContacts.css"
import Endpoints from '../endpoints';

function IndividualContacts({ userData, onLogout }) {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('addContacts'); 

  const [groupList, setGroupList] = useState([]);

  //To add new contacts
  const [selectedGroup, setSelectedGroup] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  //Seach Contacts states
  //For single contact
  const [selectedGroupSearch, setSelectedGroupSearch] = useState("");
  const [singleMobileNumberSearch, setSingleMobileNumberSearch] = useState("");

  //For all contacts
  const [contacts, setContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  //Select To delete
  const [selectedContacts, setSelectedContacts] = useState([]);

  //To upload new contacts
  const [selectedGroupSearchUpload, setSelectedGroupSearchUpload] = useState("");
  const [selectedFile, setSelectedFile] =  useState(null);
  const [fileName, setFileName] = useState("");

  //To Search Contacts
  const [searchQuery, setSearchQuery] = useState("");


  const [responseMessage, setResponseMessage] = useState("");
  const responseMsgRef = useRef(null); 

  const [isLoading, setIsLoading] = useState(false);

  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    //Reset input fields
    setSelectedGroup("");
    setName("");
    setMobileNumber("");
    setSelectedGroupSearchUpload("");
    setSelectedFile("");
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value); // Update selected group
  };


  //To get all the created group name
  const fetchAllGroupList = async () => {
    try {
      const response = await fetch(Endpoints.get("groupNameList"), {
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
      console.log("Group Name list API response:", data);

      // Validate and extract senderIdList
      if (data && data.code === 5001 && data.result === "Success") {
        setGroupList(data.data?.groupList || []); 

      } else {
        console.error("Invalid response:", data);
      }
    } catch (error) {
      console.error("Error Group Name List:", error);
    } 
  };

  useEffect(() => {
    if (activeTab === "addContacts") {
        fetchAllGroupList();
      }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "searchContacts") {
        fetchAllGroupList();
      }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "uploadContacts") {
        fetchAllGroupList();
      }
  }, [activeTab]);


  //To add new contact data
  const handleAddContact = async () => {
    if (!selectedGroup || !name || !mobileNumber) {
      alert('Please fill all fields before adding a contact.');
      return;
    }

    setIsLoading(true); 
    try {
        const response = await fetch(Endpoints.get("addnewcontacts"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: userData.authJwtToken,
          },
          body: JSON.stringify({
            contactName: name,
            contactNumber: `91${mobileNumber}`,
            groupName: selectedGroup,
            loggedInUsername: userData.username,
            operation: 'addContactNumber',
          }),
        });
  
        const data = await response.json();
        console.log("Group Name list API response:", data);
  
        // Validate and extract senderIdList
        if (data && data.code === 4001 && data.result === "Success") {
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

        // Reset input fields
        setSelectedGroup('');
        setName('');
        setMobileNumber('');
  
        } else {
            console.log('Failed to add contact. Please try again.');
          }
        } catch (error) {
          console.error('Error adding contact:', error);
        } finally {
          setIsLoading(false); 
        }
    };

    //============================Search Contacts Section================================

    const handleGroupChangeInSearch = (e) => {
        setSelectedGroupSearch(e.target.value);
      };
    
      const handleMobileNumberChangeInSearch = (e) => {
        setSingleMobileNumberSearch(e.target.value);
      };
    

    //===============To get a single contact list API call===========================

    // const fetchSingleContactInGroup = async () => {
    //     if (!selectedGroupSearch || !singleMobileNumberSearch) {
    //       alert("Please select a group and enter a mobile number.");
    //       return;
    //     }
    
    //     setIsLoading(true);
    //     try {
    //       const response = await fetch(Endpoints.get("singleContactInGroup"), {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: userData.authJwtToken,
    //         },
    //         body: JSON.stringify({
    //           groupName: selectedGroupSearch,
    //           contactNumber: `91${singleMobileNumberSearch}`,
    //           loggedInUsername: userData.username,
    //           operation: "",
    //         }),
    //       });
    
    //       const data = await response.json();
    //       console.log("Single Contact Search API response:", data);
    
    //       if (data && data.code === 4001 && data.result === "Success") {
    //         setResponseMessage(data.message)
    //             if (responseMsgRef.current) {
    //                 responseMsgRef.current.scrollIntoView({
    //                 behavior: "smooth",
    //                 block: "start", 
    //              });
    //             }
                
    //             setTimeout(() => {
    //                 setResponseMessage("");
    //             }, 3000);

    //             if (data.data && data.data.phonebookList) {
    //                 // Set contacts if data exists
    //                 setContacts(data.data.phonebookList);
    //               } else {
    //                 // Reset contacts if data is null
    //                 setContacts([]);
    //               }

    //          //reset input fields
    //          setSelectedGroupSearch("")
    //          setSingleMobileNumberSearch("");

    //       } else {
    //         console.error("Failed to fetch contact. Please try again.");
    //       }
    //     } catch (error) {
    //       console.error("Error in fetching contact:", error);
    //     } finally {
    //         setIsLoading(false); // Hide loader
    //      }
    //   };
    const fetchSingleContactInGroup = async () => {
      if (!selectedGroupSearch) {
          alert("Please select a group.");
          return;
      }
  
      setIsLoading(true);
      try {
          const response = await fetch(Endpoints.get("singleContactInGroup"), {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: userData.authJwtToken,
              },
              body: JSON.stringify({
                  groupName: selectedGroupSearch,
                  contactNumber: singleMobileNumberSearch ? `91${singleMobileNumberSearch}` : "", // Pass empty string if no number
                  loggedInUsername: userData.username,
                  operation: "",
              }),
          });
  
          const data = await response.json();
          console.log("Single Contact Search API response:", data);
  
          if (data && data.code === 4001 && data.result === "Success") {
              setResponseMessage(data.message);
  
              if (responseMsgRef.current) {
                  responseMsgRef.current.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                  });
              }
  
              setTimeout(() => {
                  setResponseMessage("");
              }, 3000);
  
              // Set contacts if data exists, otherwise reset contacts
              setContacts(data.data?.phonebookList || []);
  
              // Reset input fields
              // setSelectedGroupSearch("");
              // setSingleMobileNumberSearch("");
  
          } else {
              console.error("Failed to fetch contact. Please try again.");
          }
      } catch (error) {
          console.error("Error in fetching contact:", error);
      } finally {
          setIsLoading(false); // Hide loader
      }
  };
  

    //To get all the contacts list
    const fetchAllNumbersInGroup = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(Endpoints.get("allContactsInGroup"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: userData.authJwtToken,
              },
              body: JSON.stringify({
                groupId: "",
                loggedInUsername: userData.username,
                operation: 'getAllNumbersInTheGroup',
              }),
            });
      
            const data = await response.json();
            console.log("Group Numbers list API response:", data);
      
            if (data && data.code === 15001 && data.result === "Success") {
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

                setContacts(data.data.phonebookList || []);

                //Reset input fieldsss
                setSelectedGroupSearch("");
                setSingleMobileNumberSearch("");

      
            } else {
                console.log('Failed to fetch group numbers list. Please try again.');
              }
            } catch (error) {
              console.error('Error in fetching Group Numbers list:', error);
            } finally {
                setIsLoading(false); // Hide loader
             }
        };

      // Function to handle search input changes  
      const handleSearch = (event) => {
          setSearchQuery(event.target.value);
      };
  
      // Filter contacts based on search query
      const filteredContacts = contacts.filter((contact) =>
          contact.groupName.toLowerCase().includes(searchQuery) ||
          contact.contactNumber.includes(searchQuery) ||
          (contact.contactName && contact.contactName.toLowerCase().includes(searchQuery))
      );

        const handleSelectAll = () => {
            setSelectAll(!selectAll);
            if (!selectAll) {
              setSelectedContacts(contacts.map((contact) => contact.id));
            } else {
              setSelectedContacts([]);
            }
          };
        
          const handleCheckboxChange = (id) => {
            if (selectedContacts.includes(id)) {
              setSelectedContacts(selectedContacts.filter((contactId) => contactId !== id));
            } else {
              setSelectedContacts([...selectedContacts, id]);
            }
          };

    //==============================API to delete contacts from table===========================
        const deleteSelectedContacts = async () => {
            if (selectedContacts.length === 0) {
              alert("Please select at least one contact to delete.");
              return;
            }
        
            setIsLoading(true);
            try {
              const response = await fetch(Endpoints.get("removeContactsFromGroupTable"), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: userData.authJwtToken,
                },
                body: JSON.stringify({
                  contactIdsToRemove: selectedContacts,
                  loggedInUsername: userData.username,
                  operation: "removeContactNumber",
                }),
              });
        
              const data = await response.json();
              console.log("Delete API response:", data);
        
              if (data && data.code === 4001 && data.result === "Success") {
                setResponseMessage(data.message);
        
                // Remove deleted contacts from the table
                setContacts((prevContacts) =>
                  prevContacts.filter((contact) => !selectedContacts.includes(contact.id))
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
        
                // Reset selected contacts
                setSelectedContacts([]);
                setSelectAll(false);
              } else {
                console.log(data.message || "Failed to delete contacts. Please try again.");
              }
            } catch (error) {
              console.error("Error deleting contacts:", error);
            } finally {
              setIsLoading(false);
            }
          };  

    //============================Upload Contacts Section================================
    const handleGroupChangeInUpload = (e) => {
        setSelectedGroupSearchUpload(e.target.value);
      };
    
      // const handleFileChange = (e) => {
      //   const file = e.target.files[0];
      //   if (file && (file.type === "text/plain" || file.name.endsWith(".csv"))) {
      //     setSelectedFile(file);
      //   } else {
      //     alert("Only .txt and .csv files are allowed.");
      //     e.target.value = null; // Reset file input
      //     setSelectedFile(null);
      //   }
      // };

    //   const handleFileChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const fileType = file.type;
    //         const fileName = file.name;
    //             if (fileType === "text/plain" || fileName.toLowerCase().endsWith(".csv")) {
    //             setSelectedFile(file);
    //         } else {
    //             alert("Only .txt and .csv files are allowed.");
    //             e.target.value = ""; // Reset file input
    //             setSelectedFile(null);
    //         }
    //     } else {
    //         setSelectedFile(null); // Reset if no file is selected
    //     }
    // };
    
    const handleFileChange = (e) => {
      const file = e.target.files[0];
    
      if (file) {
        const fileType = file.type;
        const fileName = file.name;
    
        //Check for spaces in file name
        if (fileName.includes(" ")) {
          alert("File name should not contain any space");
          e.target.value = "";
          setSelectedFile(null);
          return;
        }
    
        //Check file type (.txt or .csv)
        if (fileType === "text/plain" || fileName.toLowerCase().endsWith(".csv")) {
          setSelectedFile(file);
        } else {
          alert("Only .txt and .csv files are allowed.");
          e.target.value = ""; // Reset file input
          setSelectedFile(null);
        }
      } else {
        setSelectedFile(null); // Reset if no file is selected
      }
    };
    

      //API to upload contacts
      const handleUpload = async () => {
        if (!selectedGroupSearchUpload) {
          alert("Please select a group.");
          return;
        }
        if (!selectedFile) {
          alert("Please choose a valid file.");
          return;
        }
    
        setIsLoading(true);
        const formData = new FormData();
        formData.append("userName", userData.username);
        formData.append("fileType", selectedFile.type);
        formData.append("file", selectedFile);
        formData.append("groupId", selectedGroupSearchUpload);
        formData.append("fileName", selectedFile.name);
    
        try {
            const response = await fetch(Endpoints.get("uploadNewContacts"), {
                method: "POST",
                headers: {
                  Authorization: userData.authJwtToken,
                },
                body: formData,
              });
    
          const data = await response.json();
          console.log("Upload API response:", data);
    
          if (data && data.result === "Success") {
            setResponseMessage(data.message);

            if (responseMsgRef.current) {
                responseMsgRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start", 
             });
            }
            
            setTimeout(() => {
                setResponseMessage("");
            }, 3000);

            // Reset the form
            setSelectedGroupSearchUpload("");
            setSelectedFile(null);
          } else {
            console.log(data.message);
          }
        } catch (error) {
          console.error("Error uploading contacts:", error);
        } finally {
          setIsLoading(false);
        }
      };


   //Download individual Contacts table data in csv format
  const handleDownload = () => {
    if (contacts.length === 0) {
      alert("No Data To Download");
      return;
    }
  
    // Prepare CSV content
    const headers = [
      "Group Name",
      "Contact Number",
      "Contact Name",
    ];
    const contact = contacts.map((contact) => [
      contact.groupName,
      contact.contactNumber,
      contact.contactName,
    ]);
  
    const csvContent = [headers, ...contact]
      .map((e) => e.join(","))
      .join("\n");
  
    // Create a Blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "individual_contacts_data.csv");
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
            userPrivileges={userData.userPrivileges}
            />
         <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
         <div className="dashboard-content">
            <h2>Individual Contacts</h2>

              {/* Tabs for Add Group and List Group*/}
              <div className="senderid-add">
              <button
                className={`tab ${activeTab === 'addContacts' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('addContacts')}
              >
                Add Contacts
              </button>
              <button
                className={`tab ${activeTab === 'uploadContacts' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('uploadContacts')}
              >
                Upload Contacts
              </button>
              <button
                className={`tab ${activeTab === 'searchContacts' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('searchContacts')}
              >
                Search Contacts
              </button>
            </div>

            <div className="individual-contact-response" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            {activeTab === 'addContacts' && (
              <>
                <div className="wrap-individual-contacts">
                 <div className="individual-filter-contacts-wrap">
                 <div className="individual-input-filed">
                   <label htmlFor="groupName">Group Name</label>
                   <select
                    id="groupName"
                    name="groupName"
                    value={selectedGroup}
                    onChange={handleGroupChange}
                  >
                    <option value="" disabled>
                      Select a Group
                    </option>
                    {groupList.map((group) => (
                      <option key={group.groupId} value={group.groupName}>
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                 </div>
                 <div className="individual-input-filed">
                   <label htmlFor="name">Name</label>
                   <input
                     type="text"
                     id="name"
                     name="name"
                     placeholder='Name'
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                   />
                 </div>
                 <div className="individual-input-filed">
                    <label htmlFor="mobileNumber">Mobile Number</label>
                    <div className="mobile-number-wrapper">
                    <span className="prefix">+91</span>
                    <input
                        type="text"
                        id="mobileNumber"
                        name="mobileNumber"
                        className="mobile-number"
                        placeholder="Mobile Number"
                        value={mobileNumber}
                        maxLength={10}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, ''); // Remove non-digits
                          setMobileNumber(onlyNums);
                        }}
                        onPaste={(e) => {
                          const pastedData = e.clipboardData.getData('text/plain');
                          if (!/^\d+$/.test(pastedData)) {
                            e.preventDefault(); 
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevent e, +, -, ., etc.
                          if (["e", "E", "+", "-", "."].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                </div>
                 <div className="individual-form-actions">
                   <button className="btn submit-btn" type="button" onClick={handleAddContact}>
                     Add Contact
                   </button>
                 </div>
               </div>
               </div>
                </>
            )}

            {activeTab === 'searchContacts' && ( 
                <>
                <div className="wrap-individual-contacts">
                 <div className="individual-filter-contacts-wrap">
                    <div className="individual-input-filed">
                   <label htmlFor="groupName">Group Name</label>
                   <select
                    id="groupName"
                    name="groupName"
                    value={selectedGroupSearch}
                    onChange={handleGroupChangeInSearch}
                  >
                    <option value="" disabled>
                      Select a Group
                    </option>
                    {groupList.map((group) => (
                      <option key={group.groupId} value={group.groupName}>
                        {group.groupName}({group.numbersInGroupCount})
                      </option>
                    ))}
                  </select>
                 </div>
                 <div className="individual-input-filed">
                    <label htmlFor="mobileNumber">Mobile Number</label>
                    <div className="mobile-number-wrapper">
                    <span className="prefix">+91</span>
                    <input
                      type="text"
                      id="mobileNumber"
                      name="mobileNumber"
                      className="mobile-number"
                      placeholder="Mobile Number"
                      value={singleMobileNumberSearch}
                      maxLength={10}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, '');
                        handleMobileNumberChangeInSearch({
                          target: { value: onlyNums },
                        });
                      }}
                      onPaste={(e) => {
                        const pastedData = e.clipboardData.getData('text/plain');
                        if (!/^\d+$/.test(pastedData)) {
                          e.preventDefault();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    </div>
                 </div>
                <div className="individual-form-actions">
                   <button className="btn submit-btn" type="button" onClick={fetchSingleContactInGroup}>
                     Search
                   </button>
                   <button className="btn allContacts-btn" type="button" onClick={fetchAllNumbersInGroup}>
                     All Contacts
                   </button>
                   {/* <button className="btn export-btn" type="button" >
                     Export
                   </button> */}
                 </div>
                 </div>

                <div className='individual-contact-buttons-wrap'>
                <button className="download-blacklist-button" onClick={handleDownload}>
                    Download
                </button>
                <button className="delete-selected-button" onClick={deleteSelectedContacts}>
                    Delete Selected
                </button>
                </div>

                  <div className="senderid-search-filter">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search Contact List"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                </div>
                
                <div className="wrap-individual-contacts">
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
                        <th>
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                        />
                        </th>
                        <th>Group Name</th>
                        <th>Contact Number</th>
                        <th>Contact Name</th>
                        </tr>
                    </thead>
                    <tbody>
                    {filteredContacts.length > 0 ? (
                        filteredContacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>
                        <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleCheckboxChange(contact.id)}
                        />
                        </td>
                        <td>{contact.groupName}</td>
                        <td>{contact.contactNumber}</td>
                        <td>{contact.contactName || "-"}</td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="4">No contacts found.</td>
                    </tr>
                )}
                    </tbody>
                    </table>
                    <p>There are total <strong>{filteredContacts.length}</strong> entries</p>
                    </div>
                    )}
                    </div>
                    </>
                )}

            {activeTab === 'uploadContacts' && ( 
              <>
              <div className="wrap-individual-contacts">
                <div className="individual-filter-contacts-wrap">
                <div className="individual-input-filed">
                  <label htmlFor="groupName">Group Name</label>
                  <select
                   id="groupName"
                   name="groupName"
                   value={selectedGroupSearchUpload}
                   onChange={handleGroupChangeInUpload}
                 >
                   <option value="" disabled>
                     Select a Group
                   </option>
                   {groupList.map((group) => (
                     <option key={group.groupId} value={group.groupId}>
                       {group.groupName}
                     </option>
                   ))}
                 </select>
                </div>
                <div className='individual-input-filed'>
                <label>Choose File:</label>
                <div className="input-alert-combine">
                <input
                    type="file"
                    accept=".csv,.txt"
                    className="file-input"
                    onChange={handleFileChange}
                />
                 {fileName && <small>Selected File: <strong>{fileName}</strong></small>}
                 <small><strong>NOTE:</strong> only .txt/.csv allowed</small>
                </div>
                </div>
                <div className="individual-form-actions">
                  <button className="btn submit-btn" type="button"  onClick={handleUpload}>
                    Upload Contact
                  </button>
                </div>
              </div>
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

export default IndividualContacts