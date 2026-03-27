import React, {useState, useEffect, useRef} from 'react'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer';
import "./TemplateManagement.css";
import Endpoints from '../endpoints';

function TemplateManagement({ userData, onLogout}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('addContent'); 

    const [senderIdType, setSenderIdType] = useState('trans');
    const [messageSubType, setMessageSubType] = useState("service-implicit");

    const [senderIdList, setSenderIdList] = useState([]); 
    const [selectedSenderId, setSelectedSenderId] = useState(""); 
    const [entityId, setEntityId] = useState(""); 

    const [templateName, setTemplateName] = useState("");
    const [templateDescription, setTemplateDescription] = useState("");
    const [operatorTemplate, setOperatorTemplate] = useState("");
    const [templateType, setTemplateType] = useState("PM");
    const [messageText, setMessageText] = useState("");
    const [status, setStatus] = useState("active");

    const [responseMessage, setResponseMessage] = useState("");
    const responseMsgRef = useRef(null); 

    const [isLoading, setIsLoading] = useState(false);

    const [expandedRows, setExpandedRows] = useState({});
    

    //SECTION-2 
    //To fetch content template list data
    const [contentTemplateList, setContentTemplateList] = useState([]);

    //SECTION-3
    const [fileType, setFileType] = useState('template_file');
    const [templateFileType, setTemplateFileType] = useState('csv');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const [operator, setOperator] = useState('');
    

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

      const handleTabSwitch = (tab) => {
        setActiveTab(tab);

         // Reset form fields when switching tabs
         setSenderIdType('trans')
         setMessageSubType('service-implicit');
         setSenderIdList([]);
         setEntityId('');
         setTemplateName('');
         setTemplateDescription('');
         setOperatorTemplate('');
         setTemplateType('PM');
         setMessageText('');
         setStatus('active');

         setFileType("template_file");
         setTemplateFileType('csv');
         setSelectedFile(null);
         setSelectedFileName("");
         setOperator("");
      };

  //---------------Fetch all the Content Template List Data in the table-------------------
  useEffect(() => {
    const fetchContentTemplateData = async () => {
      setIsLoading(true);
      try {
        const apiEndpoint =
        userData.dlrType === "WEB_PANEL"
          ? Endpoints.get("viewContentTemplateDataWeb")
          : Endpoints.get("viewContentTemplateDataMis");
  
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
  
        // Validate and extract content template data
        if (data && data.code === 12000 && data.result === "Success") {
          const contentTemplateData = data.data?.contentTemplateList || []; 
          setContentTemplateList(contentTemplateData);
        } else {
          console.error("Invalid response:", data);
        }
      } catch (error) {
        console.error("Error fetching Promotional Msg:", error);
      } finally {
        setIsLoading(false);
     }
    };
  
    if (activeTab === "viewContent") {
        fetchContentTemplateData();
      }
    }, [activeTab]); 

//=================To render the table in responsive manner=============================
const toggleRowExpansion = (key) => {
  setExpandedRows((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};

const [searchQuery, setSearchQuery] = useState("");

const handleSearchChange = (e) => {
  setSearchQuery(e.target.value.toLowerCase());
  setExpandedRows({}); // optional: collapse rows on search
};

// Filter Content Template Name list based on search term
const filteredTemplates = contentTemplateList.filter((template) => {
  const combinedText = [
    template.templateTitle,
    template.templateText,
    template.senderId,
    template.status,
    template.contentTemplateType,
    template.templateDescription,
    template.operatorTemplateId,
  ]
    .join(" ")
    .toLowerCase();
  return combinedText.includes(searchQuery);
})
.slice()    //creating copy of response    
.reverse(); //reversing order of response displaying in the


//Delete the selected content type from the table
const handleDeleteContentTemplate = async (templateTitle, operatorTemplateId) => {
    try {
      setIsLoading(true);
      const apiEndpoint =
        userData.dlrType === "WEB_PANEL"
          ? Endpoints.get("deleteContentTemplateWeb")
          : Endpoints.get("deleteContentTemplateMis");
  
        const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          loggedInUserName: userData.username,
          operation: "removeTemplateFromList",
          operatorTemplateId: operatorTemplateId,
          templateName: templateTitle,
        }),
      });
  
      const result = await response.json();
      console.log("Delete Domain API response:", result);
  
      if (result.code === 8001 && result.result === "Success") {
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

         // Remove the deleted template from the table
         setContentTemplateList((prevTemplates) =>
         prevTemplates.filter((template) => template.operatorTemplateId !== operatorTemplateId)
       );
       
      } else {
        alert(`Failed to delete content template: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting content template:", error);
    } finally {
      setIsLoading(false);
   }
  };    

//Fetch Sender Id list based on Message Type
const fetchEntityIdForSenderIdType = async (messageType, subType = null) => {
    try {
      const payload = {
        loggedInUserName: userData.username,
        messageType: messageType,
      };

      if (subType) {
        payload.messageSubType = subType;
      }

      const apiEndpoint =
        userData.dlrType === "WEB_PANEL"
          ? Endpoints.get("viewSenderIdListByMessageTypeWeb")
          : Endpoints.get("viewSenderIdListByMessageTypeMis");
  
        const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Sender ID API Response:", data);

      if (data.code === 10007 && data.result === "Success") {
        setSenderIdList(data.data.senderIdList); // Update sender ID list from API response
      } else {
        console.error("Failed to fetch sender ID list.");
      }
    } catch (error) {
      console.error("Error fetching Sender ID data:", error);
    }
  };
  

  // Call API when `senderIdType` or `messageSubType` changes

  // useEffect(() => {
  //   if (senderIdType === "service") {
  //     fetchEntityIdForSenderIdType("trans", messageSubType);
  //   } else {
  //     fetchEntityIdForSenderIdType(senderIdType);
  //   }
  // }, [senderIdType, messageSubType]);

  useEffect(() => {
    if (activeTab === "addContent") {
      if (senderIdType === "service") {
        fetchEntityIdForSenderIdType("trans", messageSubType);
      } else {
        fetchEntityIdForSenderIdType(senderIdType);
      }
    }
  }, [activeTab, senderIdType, messageSubType]);


  const handleSenderTypeChange = (event) => {
    const selectedType = event.target.value;
    setSenderIdType(selectedType);

    if (selectedType === "service") {
      setMessageSubType("service-implicit");
    }
  };

  const handleMessageSubTypeChange = (event) => {
    setMessageSubType(event.target.value);
  };

  // const hendleTemplateTypeChange = (event) => {
  //   setTemplateType(event.target.value);
  // };
  const hendleTemplateTypeChange = (event) => {
    const selectedType = event.target.value;
    const hasUnicode = /[^\x00-\x7F]/.test(messageText);

  if (hasUnicode && selectedType === "PM") {
    alert("Cannot select Plain Text when message contains non-English characters.");
    return;
  }

  if (!hasUnicode && selectedType === "UC") {
    alert("Cannot select Unicode when message contains only English characters.");
    return;
  }

  setTemplateType(selectedType);
  };
  
  // Function to detect Unicode characters in message text
  const handleMessageTextChange = (e) => {
    const text = e.target.value;
    setMessageText(text);
  
    // Regular expression to check for non-ASCII (Unicode) characters
    const hasUnicode = /[^\x00-\x7F]/.test(text);
  
    // Only update template type automatically if user has not manually changed it
    setTemplateType(hasUnicode ? "UC" : "PM");
  };
  

  const handleSenderIdChange = (event) => {
    const selectedId = event.target.value;
    setSelectedSenderId(selectedId);

    // Find the corresponding entity ID and update it
    const selectedSender = senderIdList.find((item) => item.senderId === selectedId);
    if (selectedSender) {
      setEntityId(selectedSender.entityId || "");
    } else {
      setEntityId("");
    }
  };

  //TO ADD VARIABLE IN THE MESSAGE TEXT
  // const handleAddVariable = () => {
  //   setMessageText((prevText) => prevText + "{#var#}");
  // };

const textareaRef = useRef(null);
const [cursorPosition, setCursorPosition] = useState(0);

// Capture cursor position when focusing on the textarea
const handleCursorPosition = (e) => {
  setCursorPosition(e.target.selectionStart);
};

// Insert {#var#} at the last known cursor position
const handleAddVariable = () => {
  setMessageText((prevText) => {
    const start = prevText.substring(0, cursorPosition);
    const end = prevText.substring(cursorPosition);
    return start + "{#var#}" + end;
  });

  // Restore cursor position after updating state
  setTimeout(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newCursorPos = cursorPosition + "{#var#}".length;
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  }, 0);
};


  //Restrict Preview Screen to open, until all the form input fileds gets filled
  const handleValidation = () => {
    if (
      senderIdType &&
      (senderIdType !== "service" || messageSubType) &&
      selectedSenderId &&
      templateName &&
      templateDescription &&
      operatorTemplate &&
      templateType &&
      messageText &&
      status
    ) {
      openModal();
    } else {
      alert("Please fill in all required fields before proceeding.");

    }
  };

  const handleReset = () => {
    setSenderIdType("trans");  
    setMessageSubType("service-implicit"); 
    setSelectedSenderId(""); 
    setEntityId(""); 
    setTemplateName(""); 
    setTemplateDescription(""); 
    setOperatorTemplate(""); 
    setTemplateType("PM"); 
    setMessageText(""); 
    setStatus("active");
  };
  

  //=============TO ADD CONTENT TEMPLATE API=================================
  const handleSubmit = async () => {
  
    // Construct the payload
    const payload = {
      contentTemplateType: senderIdType, 
      ...(senderIdType === "service" && { contentTemplateSubType: messageSubType }), 
      entityId: entityId,
      loggedInUserName: userData.username,
      operation: "addContentTemplate",
      operatorTemplateId: operatorTemplate,
      senderId: selectedSenderId,
      status: status,
      templateDescription: templateDescription,
      templateText: messageText,
      templateTitle: templateName,
      templateType: templateType,
      userId: String(userData.userId), 
      variableCount: (messageText.match(/{#var#}/g) || []).length, 
    };
  
    setIsLoading(true);
    try {
      const apiEndpoint =
        userData.dlrType === "WEB_PANEL"
          ? Endpoints.get("addContentTemplateWeb")
          : Endpoints.get("addContentTemplateMis");
  
        const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setResponseMessage(result.message);
        handleReset(); 
        closeModal();

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
        alert(`Failed: ${result.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // Hide loader
   }
  };

    // Handle file selection
  
    // const handleFileUpload = (event) => {
    //   const file = event.target.files[0];
    
    //   if (file) {
    //     const fileName = file.name.toLowerCase();
    
    //     let allowedExtensions = [];
    //     if (fileType === "header_file") {
    //       allowedExtensions = [".csv"];
    //     } else if (fileType === "template_file") {
    //       allowedExtensions = [".csv", ".xlsx", ".xls"];
    //     }
    
    //     // Check if file extension matches allowed ones
    //     const isValid = allowedExtensions.some((ext) => fileName.endsWith(ext));
    
    //     if (isValid) {
    //       setSelectedFile(file);
    //       setSelectedFileName(file.name);
    //     } else {
    //       // Reset file input
    //       event.target.value = "";
    //       setSelectedFile(null);
    //       setSelectedFileName("");
    //       alert(
    //         `Invalid file type. Allowed types are: ${allowedExtensions.join(", ")}`
    //       );
    //     }
    //   }
    // };

    // const handleFileUpload = (event) => {
    //   const file = event.target.files[0];
    //   if (!file) return;
    
    //   const ext = file.name.split(".").pop().toLowerCase();
    
    //   // what extension is required right now?
    //   let required = [];
    //   if (fileType === "header_file") {
    //     required = ["csv"];
    //   } else if (fileType === "template_file") {
    //     if (templateFileType === "csv") required = ["csv"];
    //     else if (templateFileType === "xlsx") required = ["xlsx"];
    //     else if (templateFileType === "xls") required = ["xls"];
    //   }
    
    //   const isValid = required.includes(ext);
    
    //   if (!isValid) {
    //     // reject and reset
    //     event.target.value = "";
    //     setSelectedFile(null);
    //     setSelectedFileName("");
    //     alert(
    //       `Invalid file type. Selected ".${ext}", but ${required
    //         .map((e) => "." + e)
    //         .join(" or ")} is allowed based on current Template File Type.`
    //     );
    //     return;
    //   }
    
    //   // accept
    //   setSelectedFile(file);
    //   setSelectedFileName(file.name);
    // };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      const fileName = file.name;
      const ext = fileName.split(".").pop().toLowerCase();
    
      // 🔴 Check for spaces in file name
      if (fileName.includes(" ")) {
        event.target.value = "";
        setSelectedFile(null);
        setSelectedFileName("");
        alert("File name should not contain any space");
        return;
      }
    
      // what extension is required right now?
      let required = [];
      if (fileType === "header_file") {
        required = ["csv"];
      } else if (fileType === "template_file") {
        if (templateFileType === "csv") required = ["csv"];
        else if (templateFileType === "xlsx") required = ["xlsx"];
        else if (templateFileType === "xls") required = ["xls"];
      }
    
      const isValid = required.includes(ext);
    
      if (!isValid) {
        // reject and reset
        event.target.value = "";
        setSelectedFile(null);
        setSelectedFileName("");
        alert(
          `Invalid file type. Selected ".${ext}", but ${required
            .map((e) => "." + e)
            .join(" or ")} is allowed based on current Template File Type.`
        );
        return;
      }
    
      // ✅ accept
      setSelectedFile(file);
      setSelectedFileName(fileName);
    };
    
    

  //========= Determine accepted file types according to selected values ============
  //    const getAcceptedFileTypes = () => {
  //     if (fileType === "header_file") return ".csv";
  //     if (fileType === "template_file") {
  //         return templateFileType === "csv"
  //             ? ".csv"
  //             : templateFileType === "xlsx"
  //             ? ".xlsx"
  //             : ".xls";
  //     }
  //     return "";
  // };
  const getAcceptedFileTypes = () => {
    if (fileType === "header_file") return ".csv";
    if (fileType === "template_file") {
      if (templateFileType === "csv") return ".csv";
      if (templateFileType === "xlsx") return ".xlsx";
      return ".xls";
    }
    return "";
  };
  

  //==========================API TO UPLOAD CONTENT TEMPLATE=================================
  const uploadtemplateContent = async () => {
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }

    if (!entityId.trim()) {
      alert("Entity ID is required.");
      return;
    }
  
    if (!operator) {
      alert("Please select an Operator.");
      return;
    }
  
  
    const formData = new FormData();
    formData.append("userName", userData.username);
    formData.append("fileType", fileType);
    formData.append("file", selectedFile);
    formData.append("operatorId", operator);
    formData.append("entityId", entityId);

    setIsLoading(true);
    try {
      const apiEndpoint =
        userData.dlrType === "WEB_PANEL"
          ? Endpoints.get("uploadContentTemplateWeb")
          : Endpoints.get("uploadContentTemplateMis");
  
        const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: userData.authJwtToken,
        },
        body: formData,
      });
  
      const data = await response.json();
      console.log("Upload API response:", data);
  
      if (response.ok) {
        setResponseMessage(data.message);

        //reset input fields
        setFileType("template_file");
        setTemplateFileType("csv");
        setSelectedFile(null);
        setEntityId("");
        setOperator("");
        
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
        alert(`Error: ${data.msg || "An error occurred."}`);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); 
   }
  };
  
  
 

  return (
    <div className="dashboard-container">
      <Header toggleSidebar={toggleSidebar}
        username={userData.username}
        lastLoginTime={userData.lastLoginTime}
        lastLoginIp={userData.lastLoginIp} 
        onLogout={onLogout}/>
      <div className="dashboard-layout">
        <Sidebar isSidebarOpen={isSidebarOpen} 
        dlrType={userData.dlrType}
        username={userData.username}
        isVisualizeAllowed={userData.isVisualizeAllowed}
        userPrivileges={userData.userPrivileges}
        />
        <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="dashboard-content">
            <h2>Template Management</h2>
           
            <div className="section-division">
              <button
                className={`tab ${activeTab === 'addContent' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('addContent')}
              >
                Add Content Template
              </button>
              <button
                className={`tab ${activeTab === 'uploadContent' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('uploadContent')}
                >
                Upload Content Template
                </button>
                <button
                className={`tab ${activeTab === 'viewContent' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('viewContent')}
              >
                View Content Template
              </button>
            </div>

            

            <div className="templateResponseMsg" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            {/* Add Template Section */}
            {activeTab === "addContent" && (
              <form className="template-content-form">
                 <div className="content-template-field">
                    <label>Content Template Type:</label>
                    <div  className="radio-group-msg-type">
                    <label>
                        <input
                        type="radio" name="senderIdType" value="trans" checked={senderIdType === "trans"}
                        onChange={handleSenderTypeChange}
                        />
                        Transactional
                    </label>
                    <label>
                        <input
                        type="radio" name="senderIdType" value="promo" checked={senderIdType === "promo"}
                        onChange={handleSenderTypeChange}
                        />
                        Promotional
                    </label>
                    <label>
                        <input
                        type="radio" name="senderIdType" value="service" checked={senderIdType === "service"}
                        onChange={handleSenderTypeChange}
                        />
                        Service
                    </label>
                    </div>
                </div>

                {/* Service Type Options */}
                {senderIdType === "service" && (
                    <div className="content-template-field">
                    <label>Service Type:</label>
                    <div className="template-radio-btns">
                        <label>
                        <input
                            type="radio" name="messageSubType" value="service-implicit" checked={messageSubType === "service-implicit"}
                            onChange={handleMessageSubTypeChange}
                        />
                        Service Implicit
                        </label>
                        <label>
                        <input
                            type="radio" name="messageSubType" value="service-explicit" checked={messageSubType === "service-explicit"}
                            onChange={handleMessageSubTypeChange}
                        />
                        Service Explicit
                            </label>
                        </div>
                        </div>
                    )}

                    <div className="content-template-field">
                        <label>Select Sender ID:</label>
                        <select name="senderId" value={selectedSenderId} onChange={handleSenderIdChange}>
                        <option value="">-- Select --</option>
                        {senderIdList.map((item) => (
                            <option key={item.idOfSenderId} value={item.senderId}>
                            {item.senderId}
                            </option>
                        ))}
                        </select>
                    </div>

                    <div className="content-template-field">
                        <label>Entity ID:</label>
                        <input type="text" name="entityId" value={entityId} readOnly placeholder="Entity ID" />
                    </div>

                <div className="content-template-field">
                  <label>Content Template Name:</label> 
                  <div className="input-alert-combine">
                  <input
                    type="text" 
                    name="templateName" 
                    placeholder="Template Name"
                    maxLength={100}
                    value={templateName}
                    // onChange={(e) => setTemplateName(e.target.value)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const validValue = value.replace(/[^A-Za-z0-9 ]/g, "");  // Allow only A-Z, a-z, 0-9, and spaces
                      setTemplateName(validValue);
                    }}
                  />
                  <small className="note">
                    <strong>NOTE:</strong>
                    Special characters like % , [ ] | \ ; : " ' . ? / ~ ` &lt; &gt; are not allowed in template name
                  </small>
                  </div>
                </div>

                <div className="content-template-field">
                  <label>Content Template Description:</label>
                  <div className="input-alert-combine">
                  <input
                    type="text" 
                    name="templateDescription" 
                    placeholder="Template Description"
                    value={templateDescription}
                    // onChange={(e) => setTemplateDescription(e.target.value)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const validValue = value.replace(/[^A-Za-z0-9 ]/g, "");
                      setTemplateDescription(validValue);
                    }}
                  />
                  <small className="note">
                    <strong>NOTE:</strong>
                    Special characters like % , [ ] | \ ; : " ' . ? / ~ ` &lt; &gt; are not allowed in template description
                  </small>
                  </div>
                </div>

                <div className="content-template-field">
                  <label>Operator Template ID:</label>
                  <input
                    type="text" 
                    name="operatorTemplateId" 
                    placeholder="Operator Template ID"
                    value={operatorTemplate}
                    maxLength={50} 
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setOperatorTemplate(value);
                    }}
                    inputMode="numeric"
                    pattern="\d*"
                  /> 
                </div>

                <div className="content-template-field">
                  <label>Template Type:</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio" name="templateType" value="PM" checked={templateType === "PM"}
                        onChange={hendleTemplateTypeChange}
                      />
                      Plain Text
                    </label>
                    <label>
                      <input
                        type="radio" name="templateType" value="UC" checked={templateType === "UC"}
                        onChange={hendleTemplateTypeChange}
                      />
                      Unicode
                    </label>
                  </div>
                </div>

                <div className="content-template-field">
                  <label>Message Text:</label>
                  <textarea
                    ref={textareaRef}
                    rows="5"
                    name="messageText"
                    placeholder="Message Text"
                    value={messageText}
                    onChange={handleMessageTextChange}
                    onClick={handleCursorPosition}
                    onKeyUp={handleCursorPosition} 
                  />
                </div>

                <div className="upload-character-count"> 
                  <button type="button"  className="upload-campaign-button" onClick={handleAddVariable}>Add Variable</button>
                </div>

                <div className="content-template-field">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="content-form-actions">
                <button type="submit" className="btn-submit" onClick={(event) => {event.preventDefault(); handleValidation(); }}>
                  Preview
                </button>
                <button type="button" className="btn-cancel" onClick={handleReset}>
                  Cancel
                </button>
                </div>
              </form>
            )}

            {isModalOpen && (
                    <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Request</h3>
                        <div className='preview-input-modal'>
                         <p>
                        <strong>Template Type: </strong> {senderIdType}
                        </p>
                        <p>
                        <strong>Template Name: </strong> {templateName}
                        </p>
                        <p>
                        <strong>Template Type: </strong> {templateType}
                        </p>
                        <p>
                        <strong>Message Text: </strong> {messageText}
                        </p>
                        <p>
                        <strong>Selected Sender Id: </strong> {selectedSenderId}
                        </p>
                        <p>
                        <strong>Status: </strong> {status}
                        </p>
                        <p>
                        <strong>Operator Template Id: </strong> {operatorTemplate}
                        </p>
                        {senderIdType === "service" && (  
                            <p>
                              <strong>Service Type: </strong> {messageSubType}
                            </p>
                          )}
                         <p>
                        <strong>Variable Count: </strong> {messageText.match(/{#var#}/g)?.length || 0}
                        </p>
                        </div>
                    <div className="modal-footer">
                        <button className='cancel-template-button' type="button" onClick={closeModal}>Cancel</button>
                        <button className='submit-template-button' type="button" onClick={handleSubmit}>Submit</button>
                    </div>
                    </div>
                    </div>
                )}

            {/* View Template Section */}
            {activeTab === "viewContent" && (
              <>
              <div className="wrap-add-template-management">
                <div className="senderid-search-filter">
                <input
                  type="text"
                  id="search"
                  placeholder="Search Template"
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
                <div className="content-table-container">
                <table className="content-template-table">
                  <thead>
                    <tr>
                      <th></th> {/* Expand Button Column */}
                      <th>Template Title</th>
                      <th>Template Text</th>
                      <th>Sender ID</th>
                      <th>Status</th>
                      <th>Content Template Type</th>
                    </tr>
                  </thead>
                  <tbody>
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template, index) => {
              const rowKey = `${template.operatorTemplateId}-${index}`;
              return (
                <React.Fragment key={rowKey}>
                  <tr>
                    <td>
                      <button
                        className="template-expand-btn"
                        onClick={() => toggleRowExpansion(rowKey)}
                      >
                        {expandedRows[rowKey] ? "−" : "+"}
                      </button>
                    </td>
                    <td>{template.templateTitle}</td>
                    <td className="template-text-cell">
                      {template.templateText}
                    </td>
                    <td>{template.senderId}</td>
                    <td>{template.status}</td>
                    <td>{template.contentTemplateType}</td>
                  </tr>
                  {expandedRows[rowKey] && (
                    <tr className="template-expanded-row">
                      <td></td>
                      <td colSpan="5">
                        <div className="template-expanded-content">
                          <p>
                            <strong>Template Description:</strong>{" "}
                            {template.templateDescription}
                          </p>
                          <p>
                          <strong>Template ID:</strong>{" "}
                          {(userData.username === "user4" || userData.username === "apitesting")
                            ? 'x'.repeat(template.operatorTemplateId?.length || 0)
                            : template.operatorTemplateId}
                          </p>
                          <p>
                            <strong>Actions:</strong>{" "}
                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteContentTemplate(
                                  template.templateTitle,
                                  template.operatorTemplateId
                                )
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
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No templates available
              </td>
            </tr>
          )}
        </tbody>
                </table>
              </div>
              <p class="table-entries">There are total <strong>{filteredTemplates.length}</strong> entries</p>
              </>
              
            )}
             </div>
            </>
            )}

        {activeTab === 'uploadContent' && (
          <>
          {isLoading ? ( 
            <div className="loader-overlay">
            <div className="loader"></div>
                <p>Please wait...</p>
            </div>
          ) : (
          <form className="template-content-form">
            <div className="content-template-field-upload">
              <label className='label-header'>File Type</label>
              <div className="radio-group-msg-type">
                {/* <label>
                  <input
                    type="radio"
                    name="fileType"
                    value="header_file"
                    checked={fileType === 'header_file'}
                    onChange={() => setFileType('header_file')}
                  />
                  HEADER_FILE
                </label> */}
                <label>
                  <input
                    type="radio"
                    name="fileType"
                    value="template_file"
                    checked={fileType === 'template_file'}
                    onChange={() => setFileType('template_file')}
                  />
                  TEMPLATE_FILE
                </label>
              </div>
            </div>

            <div className="content-template-field-upload">
              <label className='label-header' htmlFor="entityId">Entity ID</label>
              <input type="text" id="entityId" placeholder="Enter Entity ID" 
              value={entityId} 
              onChange={(e) => setEntityId(e.target.value)}
              required/>
            </div>

            <div className="content-template-field-upload">
              <label className='label-header'>Template File Type</label>
              <div className="radio-group-msg-type">
                <label>
                  <input
                    type="radio"
                    name="templateFileType"
                    value="csv"
                    checked={templateFileType === 'csv'}
                    onChange={() => setTemplateFileType('csv')}
                  />
                  CSV
                </label>
                {fileType === 'template_file' && (
                <> 
                <label>
                  <input
                    type="radio"
                    name="templateFileType"
                    value="xlsx"
                    checked={templateFileType === 'xlsx'}
                    onChange={() => setTemplateFileType('xlsx')}
                  />
                  XLSX
                </label>
                <label>
                  <input
                    type="radio"
                    name="templateFileType"
                    value="xls"
                    checked={templateFileType === 'xls'}
                    onChange={() => setTemplateFileType('xls')}
                  />
                  XLS
                </label>
                </>
              )}
              </div>
            </div>

            <div className="content-template-field-upload">
              <label className='label-header' htmlFor="fileUpload">File</label>
              <div class="file-upload-content">
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileUpload}
                accept={getAcceptedFileTypes()}
              />
               <small className="file-name">{selectedFileName ? selectedFileName : ""}</small>
               <small className="alert">
                  {fileType === "template_file"
                      ? "Only .csv, .xlsx, and .xls files are allowed"
                      : "Only .csv (comma separated) file is allowed"}
                </small>
              </div>
            </div>

            <div className="content-template-field-upload">
              <label className='label-header' htmlFor="operator">Operator</label>
              <select
                id="operator"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                required
              >
                <option value="">-- Select --</option>
                <option value="ALL">All</option>
                <option value="VIL">Vodafone Idea</option>
                <option value="JIO">Jio</option>
                <option value="AIRTEL">Airtel</option>
                <option value="BSNL">BSNL</option>
                <option value="VIDEOCON">Videocon</option>
              </select>
            </div>

            <div className="content-form-actions">
              <button
                type="button"
                className="btn-submit"
                onClick={uploadtemplateContent}
              >
                Upload
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setSelectedFile(null)}
              >
                Cancel
              </button>
            </div>
          </form>
           )}
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
  )
}

export default TemplateManagement;