import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import Endpoints from '../endpoints';
import "./DynamicCampaign.css";

function DynamicCampaign({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    const [hostNameList, setHostNameList] = useState([]);

    const [campaignName, setCampaignName] = useState("");
    const [msgEncoding, setMsgEncoding] = useState("plain")

    const [senderIdList, setSenderIdList] = useState([]); 
    const [messageType, setMessageType] = useState("trans");
    const [serviceType, setServiceType] = useState("service-implicit"); 

    const [senderId, setSenderId] = useState(""); 
    const [contentTemplateList, setContentTemplateList] = useState([]); 

    const [selectedContentTemplate, setSelectedContentTemplate] = useState("");

    const [contentTemplateId, setContentTemplateId] = useState(""); 
    const [entityId, setEntityId] = useState(""); 
    const [operatorTemplateId, setOperatorTemplateId] = useState(""); 

    //Message Text
    const [templateText, setTemplateText] = useState("");
    const [characterCount, setCharacterCount] = useState(0); 
    const [smsCredit, setSmsCredit] = useState(0);

    const [shortUrlCampaign, setShortUrlCampaign] =  useState([]);
    const [selectedShortUrl, setSelectedShortUrl] = useState("");
    const [isConvertShortUrlSelected, setIsConvertShortUrlSelected] = useState("N"); 
    const [callbackUrlProtocol, setCallbackUrlProtocol] = useState("");
    const [selectedDomain, setSelectedDomain] = useState("");
    const [callbackUrl, setCallbackUrl] = useState("");

    //Upload Dynamic Campaign 
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [columnHeaderMap, setColumnHeaderMap] = useState({});
    const [selectedColumn, setSelectedColumn] = useState("");
    const [selectedMobileNumber, setSelectedMobileNumber] = useState("");

    const [fileNameUpload, setFileNameUpload] = useState("");
    const [uploadedDynamicfileName, setUploadedDynamicfileName] = useState([]);

    const [isFromTemplate, setIsFromTemplate] = useState(false);

    //Handle Scheduled Message option
    const [scheduleMessage, setScheduleMessage] = useState("no");
    const [scheduleDate, setScheduleDate] = useState(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
    const [scheduleHour, setScheduleHour] = useState("");
    const [scheduleMinute, setScheduleMinute] = useState("");

    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [currentMinute, setCurrentMinute] = useState(new Date().getMinutes());

    useEffect(() => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentMinute(now.getMinutes());
    }, []);

    const [splitFile, setSplitFile] = useState("no");
    const [rows, setRows] = useState([
      { from: "", to: "", hour: "", min: "" }, // Default initial row
    ]);

   //Response Message
   const [responseMessage, setResponseMessage] = useState("");
   const responseMsgRef = useRef(null);    

   const [isLoading, setIsLoading] = useState(false);

   //For Preview Screen
   const [previewData, setPreviewData] = useState({});
   const [totalCount, setTotalCount] = useState(0);
   const [plainCount, setPlainCount] = useState(0);
   const [plainCredit, setPlainCredit] = useState(0);
   const [unicodeCount, setUnicodeCount] = useState(0);
   const [unicodeCredit, setUnicodeCredit] = useState(0);
   const [isModalOpen, setIsModalOpen] = useState(false);  

   //State to handle input search select options
   const [isSenderFocused, setIsSenderFocused] = useState(false);
   const [isTemplateFocused, setIsTemplateFocused] = useState(false);
    

   // Function to map radio value to API messageType
   const getMessageTypeForApi = (type) => {
    if (type === "trans") return "other";
    if (type === "promo") return "promo";
    if (type === "service") return "other";
};


  // Fetch Sender ID List API Call
  const fetchSenderIdList = async (type) => {
    const apiMessageType = getMessageTypeForApi(type);

    try {
      const response = await fetch(Endpoints.get("getAllSenderIdForCampaign"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          loggedInUserName: userData.username,
          messageType: apiMessageType, // Correct messageType here
          messageSubType: "",
        }),
      });

      const data = await response.json();
      console.log("Sender ID List API Response:", data);

      if (data?.data?.senderIdList) {
        setSenderIdList(data.data.senderIdList); // Update state with senderIdList
      }
    } catch (error) {
      console.error("Error fetching Sender ID List:", error);
    }
  };

//Handle Message Encoding Change
const handleMessageEncodingChange = (e) => {
  const selectedEncodingType = e.target.value;
  setMsgEncoding(selectedEncodingType);
}  

// Handle Message Type Change
const handleMessageTypeChange = (e) => {
const selectedType = e.target.value;
setMessageType(selectedType); // Update state

 // Set default Service Type when Message Type is "Service"
 if (selectedType === "service") {
    setServiceType("service-implicit"); // Default to service-implicit
  }
};

// Handle Service Type Change
const handleServiceTypeChange = (e) => {
setServiceType(e.target.value);
};

// Fetch All Active and Approved Host Name for user
const fetchHostNameForUser = async () => {
    try {
      const response = await fetch(Endpoints.get('allHostNameUser'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userData.authJwtToken,
        },
        body: JSON.stringify({
          loggedInUserName: userData.username,
        }),
      });

      const data = await response.json();
      console.log('Short URL List API Response:', data);

      if (data?.data?.hostNameList) {
        setHostNameList(data.data.hostNameList); // Update state with shortUrlList
      }
    } catch (error) {
      console.error('Error fetching Short URL List:', error);
    }
  };

// Call the API when the component mounts
useEffect(() => {
    fetchSenderIdList(messageType);
}, [messageType]);

useEffect(() => {
    fetchHostNameForUser();
}, []);

const handleShortUrlSelectedChange = (e) => {
setIsConvertShortUrlSelected(e.target.value);
if (e.target.value === "N") {
  setSelectedShortUrl(""); // Clear the dropdown value if "N" is selected
}
};


// Fetch Content Template List API after selecting the Sender ID
const fetchContentTemplateList = async (senderId) => {
try {
  // Determine the messageSubType based on messageType and serviceType
  const messageSubType = messageType === "service" ? serviceType : "";

  const response = await fetch(Endpoints.get("viewAllContentTemplateListByMessageType"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.authJwtToken,
    },
    body: JSON.stringify({
      loggedInUserName: userData.username,
      messageType: messageType, // Use the selected message type
      messageSubType: messageSubType, // Dynamic value based on messageType
      senderId: senderId,
    }),
  });

  const data = await response.json();
  console.log("Content Template List API Response:", data);

  if (data?.data?.contentTemplateList) {
    setContentTemplateList(data.data.contentTemplateList); // Update state with content templates
  }
} catch (error) {
  console.error("Error fetching Content Template List:", error);
}
};


// Handle Sender ID Selection
const handleSenderIdChange = (selectedOption) => {

  const selectedId = selectedOption ? selectedOption.value : "";

setSenderId(selectedId); // Update Sender ID state
setContentTemplateList([]); // Reset Content Template List
setSelectedContentTemplate(""); // Reset selected Content Template
setEntityId(""); // Reset Entity ID
setContentTemplateId(""); //Reset Content Template ID
setOperatorTemplateId(""); // Reset Operator Template ID
setTemplateText(""); // Reset templateText
fetchContentTemplateList(selectedId); // Fetch Content Templates for selected Sender ID
};

// ===================Handle Content Template Selection==========================

// const handleContentTemplateChange = (selectedOption) => {

//   const selectedTemplateTitle = selectedOption ? selectedOption.value : "";

//   setSelectedContentTemplate(selectedTemplateTitle);

//   const selectedTemplate = contentTemplateList.find(
//     (template) => template.templateTitle === selectedTemplateTitle
//   );

//   if (selectedTemplate) {
//     setIsFromTemplate(true); // 🔒 Make inputs read-only

//     setEntityId(selectedTemplate.entityId);
//     setOperatorTemplateId(selectedTemplate.operatorTemplateId);
//     setContentTemplateId(selectedTemplate.templateId);

//     const newText = selectedTemplate.templateText;
//     setTemplateText(newText);

//     const count = newText.length;
//     setCharacterCount(count);

//     const credit = Math.ceil(count / 70);
//     setSmsCredit(credit);
//   }
// };
const handleContentTemplateChange = (selectedOption) => {
  const selectedTemplateTitle = selectedOption ? selectedOption.value : "";
  setSelectedContentTemplate(selectedTemplateTitle);

  const selectedTemplate = contentTemplateList.find(
    (template) => template.templateTitle === selectedTemplateTitle
  );

  if (selectedTemplate) {
    setIsFromTemplate(true);

    setEntityId(selectedTemplate.entityId);
    setOperatorTemplateId(selectedTemplate.operatorTemplateId);
    setContentTemplateId(selectedTemplate.templateId);

    const newText = selectedTemplate.templateText;
    setTemplateText(newText);

    extractAndSetTags(newText); 

    const count = newText.length;
    setCharacterCount(count);

    const hasUnicode = /[^\x00-\x7F]/.test(newText);

    let credit = 0;
    if (!hasUnicode) {
      if (count > 0 && count <= 160) credit = 1;
      else if (count <= 306) credit = 2;
      else credit = 2 + Math.ceil((count - 306) / 153);
    } else {
      if (count > 0 && count <= 70) credit = 1;
      else if (count <= 134) credit = 2;
      else credit = 2 + Math.ceil((count - 134) / 67);
    }

    setSmsCredit(credit);
  }
};



//To count message text characters and sms credit 
// const handleTextChange = (event) => {
//   const text = event.target.value;
//   setTemplateText(text);

//   // Calculate character count
//   const count = text.length;
//   setCharacterCount(count);

//   // Calculate SMS credit (1 credit per 70 characters, rounded up)
//   const credit = Math.ceil(count / 70);
//   setSmsCredit(credit);
// };
const handleTextChange = (event) => {
  const text = event.target.value;
  setTemplateText(text);

  const count = text.length;
  setCharacterCount(count);

  extractAndSetTags(text);



  // Detect if the message contains any Unicode characters
  const hasUnicode = /[^\x00-\x7F]/.test(text);

  let credit = 0;
  if (!hasUnicode) {
    // GSM encoding logic
    if (count > 0 && count <= 160) credit = 1;
    else if (count <= 306) credit = 2;
    else credit = 2 + Math.ceil((count - 306) / 153);
  } else {
    // Unicode encoding logic
    if (count > 0 && count <= 70) credit = 1;
    else if (count <= 134) credit = 2;
    else credit = 2 + Math.ceil((count - 134) / 67);
  }

  setSmsCredit(credit);
};



//To handle schedule message input field
const handleScheduleMessageChange = (event) => {
  const value = event.target.value;
  setScheduleMessage(value);

  if (value === "yes") {
    setScheduleDate(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]); // Set default scheduleDate to today's date
  }

  setSplitFile("no"); // Reset splitFile when scheduleMessage changes
  setRows([{ from: "", to: "", hour: "", min: "" }]); // Reset rows
};

const handleSplitFileChange = (event) => {
  setSplitFile(event.target.value);
};

const handleRowChange = (index, field, value) => {
  const updatedRows = rows.map((row, rowIndex) =>
    rowIndex === index ? { ...row, [field]: value } : row
  );
  setRows(updatedRows);
};

const addRow = () => {
  setRows([...rows, { from: "", to: "", hour: "", min: "" }]);
};

const removeRow = (index) => {
  const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index);
  setRows(updatedRows);
};


//==============================UPLOAD DYNAMIC NUMBERS===========================
// const handleFileChange = (event) => {
//   const selectedFile = event.target.files[0];
//   setFile(selectedFile);
//   setFileName(selectedFile ? selectedFile.name : "");
//   setIsFileUploaded(false);
// };

const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];

  if (!selectedFile) return;

  const fileName = selectedFile.name;

  // Check if filename contains space
  if (fileName.includes(" ")) {
    alert("File name should not contain any space");

    // Reset states
    setFile(null);
    setFileName("");
    setIsFileUploaded(false);

    // Reset input so same file can be re-selected
    event.target.value = "";

    return;
  }

  // If valid file
  setFile(selectedFile);
  setFileName(fileName);
  setIsFileUploaded(false);
};

// ================================================================== 
const [showConflictModal, setShowConflictModal] = useState(false);

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
        fromDate: scheduleDate,
        toDate: scheduleDate,
        campaignType: "All",
      }),
    });

    const res = await response.json();

    const campaignList = res?.data?.consolidateCampaignList || [];

    // Format selected time (HH:mm)
    const selectedTime = `${scheduleHour.toString().padStart(2, '0')}:${scheduleMinute.toString().padStart(2, '0')}`;

    // Convert scheduleDate (yyyy-mm-dd) → dd-mm-yyyy
    const formattedDate = scheduleDate.split("-").reverse().join("-");

    const isAlreadyScheduled = campaignList.some((campaign) => {
      return (
        campaign.schdeuledDate === formattedDate &&
        campaign.scheduledTime === selectedTime
      );
    });

    if (isAlreadyScheduled) {
      if (isAlreadyScheduled) {
        setShowConflictModal(true);
      
        setScheduleDate(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
        setScheduleHour("");
        setScheduleMinute("");
      
        return;
      }

      // Reset fields after alert OK
      setScheduleDate(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setScheduleHour("");
      setScheduleMinute("");

      return;
    }
  
  } catch (error) {
    console.error("Error fetching scheduled campaigns:", error);
  }
};

useEffect(() => {
  if (
    scheduleDate &&
    scheduleHour !== "" &&
    scheduleMinute !== ""
  ) {
    getAllScheduledCampaign();
  }
}, [scheduleDate, scheduleHour, scheduleMinute]);
// ================================================================== 

const handleCampaignNameChange = (e) => {
  const validValue = e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""); // Allow only A-Z, a-z, 0-9, -, _
  setCampaignName(validValue);
};

 // Function to generate the default campaign name
 const getDefaultCampaignName = () => {
  const username = userData.username || "defaultUser"; // Use a fallback if username is unavailable
  const today = new Date();

  // Format date as DDMMYYYY
  const date = `${today.getDate().toString().padStart(2, "0")}${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${today.getFullYear()}`;

  // Format time as HHMM
  const hours = today.getHours().toString().padStart(2, "0");
  const minutes = today.getMinutes().toString().padStart(2, "0");
  const time = `${hours}${minutes}`;

  return `${username}-campaign-${date}-${time}`;
};

// Set default value when the component mounts
useEffect(() => {
  setCampaignName(getDefaultCampaignName());
}, []);

const [isFileUploaded, setIsFileUploaded] = useState(false);

const [isUploadDisabled, setIsUploadDisabled] = useState(false);

//To upload dymanic campaign file
const handleFileUpload = async () => { 
  if (!campaignName) {
    alert("Please enter a Campaign Name before uploading.");
    return;
  }

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append("userName", userData.username);
  formData.append("fileType", file.type);
  formData.append("campaignName", campaignName);
  formData.append("msgType", "plain");
  formData.append("file", file);

  setIsLoading(true);
  try {
    const response = await fetch(Endpoints.get("uploadDynamicCampaign"), {
      method: "POST",
      headers: {
        Authorization: userData.authJwtToken,
      },
      body: formData,
    });

    const data = await response.json();
    console.log("Upload Dynamic Campaign API response (JSON):", data);

    if (response.ok) {
      setResponseMessage(data.message);
      setFileNameUpload(data.data.fileName); // Store fileName in state
      setUploadedDynamicfileName(data.data.uploadedDynamicfileName);
      setIsFileUploaded(true);
      setIsUploadDisabled(true);

      if (responseMsgRef.current) {
        responseMsgRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start", 
        });
      }

      setTimeout(() => {
        setResponseMessage("");
      }, 3000);

      // Set the columnHeaderMap in state
      setColumnHeaderMap(data.data.columnHeaderMap || {});
    } else {
      alert(`Error: ${data.msg || "An error occurred."}`);
      setIsFileUploaded(true);
    }
  } catch (error) {
    console.error("Error uploading Dynamic Campaign file:", error);
    alert("An error occurred. Please try again.");
  } finally {
    setIsLoading(false); 
 }
};

// ======================================
const handleMobileNumberChange = (event) => {
  setSelectedMobileNumber(event.target.value);
};

const handleColumnChange = (event) => {
  setSelectedColumn(event.target.value);
};


const handleAddToText = () => {
  if (!selectedColumn) {
    alert("Please select a column from the list.");
    return;
  }

  // Replace the first occurrence of {#var#}
  const updatedText = templateText.replace("{#var#}", columnHeaderMap[selectedColumn]);
  setTemplateText(updatedText);

  // Update character count and SMS credit
  const count = updatedText.length;
  setCharacterCount(count);
  setSmsCredit(Math.ceil(count / 70));
};

// const [selectedTagIndex, setSelectedTagIndex] = useState(null);


// const handleAddToText = () => {
//   if (!selectedColumn) {
//     alert("Please select a column from the list.");
//     return;
//   }

//   if (selectedTagIndex === null) {
//     alert("Please select a detected tag.");
//     return;
//   }

//   const selectedTag = detectedTags[selectedTagIndex];
//   const replacement = `#${selectedColumn}#`;

//   // replace only the first occurrence
//   const updatedText = templateText.replace(selectedTag, replacement);
//   setTemplateText(updatedText);

//   // remove ONLY the selected index
//   const newTags = [...detectedTags];
//   newTags.splice(selectedTagIndex, 1);
//   setDetectedTags(newTags);

//   setSelectedTagIndex(null);

//   const count = updatedText.length;
//   setCharacterCount(count);

//   const hasUnicode = /[^\x00-\x7F]/.test(updatedText);

//   let credit = 0;
//   if (!hasUnicode) {
//     if (count > 0 && count <= 160) credit = 1;
//     else if (count <= 306) credit = 2;
//     else credit = 2 + Math.ceil((count - 306) / 153);
//   } else {
//     if (count > 0 && count <= 70) credit = 1;
//     else if (count <= 134) credit = 2;
//     else credit = 2 + Math.ceil((count - 134) / 67);
//   }

//   setSmsCredit(credit);
// };




//====================HANDLE PREVIEW PAGE===============================
const [showMobileNote, setShowMobileNote] = useState(false);

const handlePreviewpage = async () => {
  const splitPartPayload = splitFile === "yes"
  ? rows.map((row, index) => ({
      id: String(index + 1),
      from: row.from,
      to: row.to,
      hh: row.hour,
      mm: row.min,
    }))
  : [];
  console.log("Selected Column:", selectedColumn);
  console.log("Selected Mobile Number:", selectedMobileNumber);

  if (!isFileUploaded) {
    alert("Please upload the file by clicking Upload button.");
    return;
  }

  const payload = {
    loggedInUserName: String(userData.username),
    campaignName: String(campaignName),
    msgType: String(msgEncoding),
    fileName: String(fileNameUpload),
    serviceType: String(messageType),
    senderId: String(senderId),
    contentTemplateId: String(contentTemplateId),
    mobileNumber: `#${selectedMobileNumber}#`,
    columnList: `#${selectedColumn}#`,
    msgText: String(templateText),
    convertShortUrl: String(isConvertShortUrlSelected),
    entityId: String(entityId),
    dltTemplateId: String(operatorTemplateId),
    scheduleMessage: String(scheduleMessage),
    splitFile: String(splitFile),
    // scheduleInfo: {splitPart: []},
    scheduleInfo: {
      splitPart: splitPartPayload,
    },
    uploadedDynamicfileName: uploadedDynamicfileName,
  };

  if (!selectedMobileNumber) {
    alert("Please select the mobile header from the input field");
    setShowMobileNote(true); 

    setTimeout(() => {
      setShowMobileNote(false);
    }, 5000);
    return;
  } else {
    setShowMobileNote(false); 
  }

  if (isConvertShortUrlSelected === "Y") {
    payload.userDomain = selectedDomain; // Assuming you store selectedDomain in state
    //payload.callbackUrl = `${callbackUrl}`; // Assuming callbackUrl and protocol are stored in state
  }

  if (scheduleMessage === "yes") {
    payload.scheduleDate = scheduleDate;
    payload.scheduleHour = scheduleHour || "00"; // Default to "00" if empty
    payload.scheduleMinute = scheduleMinute || "00"; // Default to "00" if empty
  }

  setIsLoading(true);
  try {
    // API call
    const response = await fetch(Endpoints.get("dymanicCampaignPreview"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userData.authJwtToken,
      },
      body: JSON.stringify(payload),
    });

    // Parse the response
    if (response.ok) {
      const result = await response.json();
      console.log("API Response:", result);

        // Store response data
        setPreviewData(result.previewDataMap || {});
        setTotalCount(result.totalCount || 0);
        setPlainCount(result.plainCount || 0);
        setPlainCredit(result.plainCredit || 0);
        setUnicodeCount(result.unicodeCount || 0);
        setUnicodeCredit(result.unicodeCredit || 0);


       setIsModalOpen(true);

    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    alert("An unexpected error occurred.");
  }  finally {
    setIsLoading(false); 
 }
 }


 //=======================SEND DYNAMIC CAMPAIGN========================
 const sendDynamicCampaign = async () => {
  const splitPartPayload = splitFile === "yes"
  ? rows.map((row, index) => ({
      id: String(index + 1),
      from: row.from,
      to: row.to,
      hh: row.hour,
      mm: row.min,
    }))
  : [];

  const payload = {
    loggedInUserName: String(userData.username),
    campaignName: String(campaignName),
    msgType: String(msgEncoding),
    perMsgCredit: String(smsCredit),
    fileName: String(fileNameUpload),
    serviceType: String(messageType),
    senderId: String(senderId),
    // contentTemplateId: String(contentTemplateId),
    // dltTemplateId: String(operatorTemplateId),
    // entityId: String(entityId),
    mobileNumber: `#${selectedMobileNumber}#`,
    columnList: `#${selectedColumn}#`,
    msgText: String(templateText),
    convertShortUrl: String(isConvertShortUrlSelected),
    scheduleMessage: String(scheduleMessage),
    splitFile: String(splitFile),
    // scheduleInfo: {splitPart: []},
    scheduleInfo: {
      splitPart: splitPartPayload,
    },
    uploadedDynamicfileName: uploadedDynamicfileName,
  };

   //Not sending contentTemplateId, operatorTemplateId and entityId in payload if they are empty
   if (contentTemplateId) {
    payload.contentTemplateId = String(contentTemplateId);
  }
  if (operatorTemplateId) {
    payload.dltTemplateId = String(operatorTemplateId);
  }
  if (entityId) {
    payload.entityId = String(entityId);
  }

  if (isConvertShortUrlSelected === "Y") {
    payload.userDomain = selectedDomain; // Assuming you store selectedDomain in state
    payload.callbackUrl = `${callbackUrlProtocol}${callbackUrl}`;
  }

  if (scheduleMessage === "yes") {
    payload.scheduleDate = scheduleDate;
    payload.scheduleHour = scheduleHour || "00"; // Default to "00" if empty
    payload.scheduleMinute = scheduleMinute || "00"; // Default to "00" if empty
  }

  setIsLoading(true);
  try {
    // API call
    const response = await fetch(Endpoints.get("sendDynamicCampaign"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userData.authJwtToken,
      },
      body: JSON.stringify(payload),
    });

    // Parse the response
    if (response.ok) {
      const result = await response.json();
      console.log("API Response:", result);
      setResponseMessage(result.message)

        //reset input fields
        setCampaignName(getDefaultCampaignName());
        setContentTemplateId("");
        setOperatorTemplateId("");
        setEntityId("");
        setFile(null);
        setFileName("");
        setMsgEncoding("plain");
        setTemplateText("");
        setCharacterCount(0);
        setSmsCredit(0);
        setSenderId("");
        setSelectedContentTemplate("");
        setMessageType("trans");
        setIsConvertShortUrlSelected("N")
        setScheduleMessage("no");
        setScheduleDate(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
        setScheduleHour("");
        setScheduleMinute("");

        // setSelectedTagIndex(null);
        // setDetectedTags([]);
        // setColumnHeaderMap({});
        // setSelectedColumn(""); 

      if (responseMsgRef.current) {
        responseMsgRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start", 
        });
      }

      setTimeout(() => {
        setResponseMessage("");
      }, 3000);

      setIsModalOpen(false);

    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    alert("An unexpected error occurred.");
  }  finally {
    setIsLoading(false); 
  }
 }

 const [detectedTags, setDetectedTags] = useState([]);
 const [selectedTag, setSelectedTag] = useState("");

 const extractAndSetTags = (text) => {
  const regex = /\{#([^}]+)#\}/g;
  const matches = text.match(regex) || [];
  setDetectedTags(matches); // KEEP duplicates
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
           isVisualizeAllowed={userData.isVisualizeAllowed}
           userPrivileges={userData.userPrivileges}
        />
        <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="dashboard-content">
            <h2>Dynamic Campaign</h2>

            <div className="shortUrlResponse" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            {isLoading ? ( 
                <div className="loader-overlay">
                <div className="loader"></div>
                    <p>Please wait...</p>
                </div>
              ) : ( 
            <form className="dynamic-campaign-form">
              <div className="quick-input-field">

                <label>Campaign Name</label>
                <div className="input-alert-combine">
                <input
                  type="text" id="campaignNameInput" placeholder="Enter Campaign Name"
                  value={campaignName}
                  onChange={handleCampaignNameChange}
                  maxLength={100}
                  required
                />
                <small><strong>NOTE:</strong> Special characters like SPACE % , [ ] { } | \ ; : " ' <></> . ? / ~ ` are not allowed in campaign name.</small>
                </div>
              </div>

              <div className="quick-input-field">
              <label>Message Encoding</label>
                <div className="radio-group">
                <label>
                    <input
                    type="radio" name="msgEncoding" value="plain"
                    checked={msgEncoding === "plain"}
                    onChange={handleMessageEncodingChange}
                    />
                    SMS
                </label>
                <label>
                    <input
                    type="radio" name="msgEncoding" value="FL"
                    checked={msgEncoding === "FL"}
                    onChange={handleMessageEncodingChange}
                    />
                    Flash
                </label>
                </div>
              </div>

              <div className="upload-input-field">
                  <label>File Upload</label>
                  <div className="input-alert-combine">
                  <input
                    className='upload-input' 
                    type="file" 
                    accept=".xlsx,.csv,.zip"
                    onChange={handleFileChange}
                  />
                  <small className="file-name"> {fileName}</small>
                  <small><strong>NOTE:</strong> Only .xlsx, .csv and zip files are allowed</small>
                  </div>
                </div>

                <div className="dynamic-campaign-buttons-wrap"> 
                  <button  type="button"  className="dynamic-campaign-button" onClick={handleFileUpload} disabled={isUploadDisabled}>Upload</button>
                </div>

              <div className="quick-input-field">
              <label>Message Type</label>
                <div className="radio-group-msg-type">
                <label>
                    <input
                    type="radio" name="messageType" value="trans"
                    checked={messageType === "trans"}
                    onChange={handleMessageTypeChange}
                    />
                    Transactional
                </label>
                <label>
                    <input
                    type="radio" name="messageType" value="promo"
                    checked={messageType === "promo"}
                    onChange={handleMessageTypeChange}
                    />
                    Promotional
                </label>
                <label>
                    <input
                    type="radio" name="messageType" value="service"
                    checked={messageType === "service"}
                    onChange={handleMessageTypeChange}
                    />
                    Service
                </label>
                </div>
              </div>

              {messageType === "service" && (
                <div className="quick-input-field">
                <label>Service Type</label>
                <div className="radio-group">
                    <label>
                    <input
                        type="radio" name="serviceType" value="service-implicit"
                        checked={serviceType === "service-implicit"}
                        onChange={handleServiceTypeChange}
                    />{" "}
                    Service Implicit
                    </label>
                    <label>
                    <input
                        type="radio" name="serviceType" value="service-explicit"
                        checked={serviceType === "service-explicit"}
                        onChange={handleServiceTypeChange}
                    />{" "}
                    Service Explicit
                    </label>
                </div>
                </div>
            )}

              <div className="quick-input-field">
              <label>Sender ID</label>
              <Select
                className={`custom-react-select ${isSenderFocused ? 'search-mode' : ''}`}
                classNamePrefix="custom-select"
                value={
                  senderIdList
                    .map((s) => ({ label: s.senderId, value: s.senderId }))
                    .find((opt) => opt.value === senderId) || null
                }
                options={senderIdList.map((s) => ({
                  label: s.senderId,
                  value: s.senderId,
                }))}
                onChange={handleSenderIdChange}
                onFocus={() => setIsSenderFocused(true)}
                onBlur={() => setIsSenderFocused(false)}
                placeholder={isSenderFocused ? "Search here..." : "-- Select --"}
                isClearable
              />
              </div>

              <div className="quick-input-field">
                <label>Content Template Name</label>
                <Select
                  className={`custom-react-select ${isTemplateFocused ? 'search-mode' : ''}`}
                  classNamePrefix="custom-select"
                  value={
                    contentTemplateList
                      .map((t) => ({ label: t.templateTitle, value: t.templateTitle }))
                      .find((opt) => opt.value === selectedContentTemplate) || null
                  }
                  options={contentTemplateList.map((t) => ({
                    label: t.templateTitle,
                    value: t.templateTitle,
                  }))}
                  onChange={handleContentTemplateChange}
                  onFocus={() => setIsTemplateFocused(true)}
                  onBlur={() => setIsTemplateFocused(false)}
                  placeholder={isTemplateFocused ? "Search here..." : "-- Select --"}
                  isClearable
                />
              </div>

              <div className="quick-input-field">
                <label>Mobile Number</label>
                <div className="select-mobile-number-alert">
                <select required value={selectedMobileNumber} onChange={handleMobileNumberChange}>
                   <option value="">-- Select --</option>
                  {Object.entries(columnHeaderMap)
                    .sort(([keyA], [keyB]) => {
                      if (keyA === "Mobile") return -1;
                      if (keyB === "Mobile") return 1;
                      return 0; 
                    })
                    .map(([key, value]) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                </select>
                {showMobileNote && (
                  <small><strong>NOTE:</strong> Please select the mobile header from the input field</small>
                )}
                </div>
              </div>

              {/* <div className="quick-input-row">
              <div className="quick-input-field">
                <label>Column List</label>
                <select required onChange={handleColumnChange}>
                <option value="">-- Select --</option>
                  {Object.entries(columnHeaderMap).map(([key, value]) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mapping-arrow">⇒</div>

                  <div className="quick-input-field">
                  <select
                      value={selectedTagIndex ?? ""}
                      onChange={(e) => setSelectedTagIndex(
                        e.target.value === "" ? null : Number(e.target.value)
                      )}
                    >
                      <option value="">-- Select Tag --</option>
                      {detectedTags.map((tag, index) => (
                        <option key={index} value={index}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>
                  </div> */}

               <div className="quick-input-field">
                <label>Column List</label>
                <select required onChange={handleColumnChange}>
                <option value="">-- Select --</option>
                  {Object.entries(columnHeaderMap).map(([key, value]) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>   

              <div className="dynamic-campaign-buttons-wrap"> 
                <button type="button" className="dynamic-campaign-button" onClick={handleAddToText} >Add To Text</button>
              </div>


              <div className="quick-input-field">
              <label>Message Text</label>
              <div className="input-alert-combine">
                 <textarea
                    rows="5" placeholder="Original Message Text" value={templateText} onChange={handleTextChange} required
                ></textarea>
                <small><strong>NOTE:</strong> xxxxxx will be replaced by actual shortcode up to 6 chars.</small>
                </div>
              </div>
              <div className="character-count">
                {characterCount} Character Count | {smsCredit} SMS Credit
              </div>
              

              <div className="quick-input-field">
              <label>Convert Short URL</label>
                <div className="radio-group">
                <label>
                    <input
                    type="radio" name="shortUrl" value="Y"
                    checked={isConvertShortUrlSelected === "Y"}
                    onChange={handleShortUrlSelectedChange}
                    />
                    Yes
                </label>
                <label>
                    <input type="radio" name="shortUrl" value="N"
                    checked={isConvertShortUrlSelected === "N"}
                    onChange={handleShortUrlSelectedChange}
                    />
                    No
                </label>
                </div>
              </div>

              {isConvertShortUrlSelected === "Y" && ( 
                <>   
              <div className="quick-input-field">
                <label>Select Domain</label>
                <select  required  onChange={(e) => setSelectedDomain(e.target.value)}>
                  <option value="">-- Select --</option>
                  {hostNameList.map((domain) => (
                    <option key={domain.id} value={domain.domainName}>
                      {domain.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="quick-input-field">
              <label htmlFor="callbackurl">Callback URL</label>
              <select
                  id="callbackurlProtocol"
                  name="callbackUrlProtocol"
                  onChange={(e) => setCallbackUrlProtocol(e.target.value)}
              >
                  <option value="">-- Select --</option>
                  <option value="http://">http://</option>
                  <option value="https://">https://</option>
              </select>
              <input
                  type="text"
                  name="callbackUrl"
                  placeholder="Enter Callback URL"
                  onChange={(e) => setCallbackUrl(e.target.value)}
              />
              </div>
              </>  
                )}

              <div className="quick-input-field">
                <label>Entity ID</label>
                <input
                  type="text"
                  placeholder="Entity ID"
                  value={entityId}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    setEntityId(numericValue);
                    setIsFromTemplate(false); 
                  }}
                  // required
                  readOnly={isFromTemplate}
                />
              </div>

              <div className="quick-input-field">
                <label>Operator Template ID</label>
                <input
                  type="text"
                  placeholder="Operator Template ID"
                  value={operatorTemplateId}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    setOperatorTemplateId(numericValue);
                    setIsFromTemplate(false); 
                  }}
                  // required
                  readOnly={isFromTemplate}
                />
              </div>

              <div className="upload-input-field">
              <label>Schedule Message</label>
                <div className="radio-upload">
                <label>
                    <input type="radio" name="scheduleMessage" value="yes" checked={scheduleMessage === "yes"} onChange={handleScheduleMessageChange}/>
                    Yes
                </label>
                <label>
                    <input type="radio" name="scheduleMessage" value="no" checked={scheduleMessage === "no"} onChange={handleScheduleMessageChange}/>
                    No
                </label>
                </div>
              </div>

              {scheduleMessage === "yes" && (
              <>
             <div className="upload-input-field">
                <label>Schedule Date</label>
                <input
                  className="date-input"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} 
                  required
                />
              </div>

              {splitFile !== "yes" && ( 
              <div className="upload-input-field">
                <label>Schedule Time</label>

                <div className="dynamicWrapHourTime">
                <select
                className="hourAndMinute"
                value={scheduleHour}
                onChange={(e) => {
                  setScheduleHour(e.target.value);
                  setScheduleMinute('');
                }}
                required
                >
                <option value="">Hour</option>
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                  const isDisabled =
                    scheduleDate === new Date().toISOString().split("T")[0] &&
                    hour < currentHour;
                  return (
                    <option key={hour} value={hour} disabled={isDisabled}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  );
                })}
              </select>

              <select
                className="hourAndMinute"
                value={scheduleMinute}
                onChange={(e) => setScheduleMinute(e.target.value)}
                required
              > 
              <option value="">Minute</option>
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => {
                  const isDisabled =
                    scheduleDate === new Date().toISOString().split("T")[0] &&
                    parseInt(scheduleHour) === currentHour &&
                    minute <= currentMinute;
                  return (
                    <option key={minute} value={minute} disabled={isDisabled}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  );
                })}
              </select>
                </div>
              </div>
               )}


              <div className="upload-input-field">
                <label>Split File</label>
                <div className="radio-upload">
                  <label>
                    <input type="radio" name="splitFile" value="yes" checked={splitFile === "yes"} onChange={handleSplitFileChange}/>
                    Yes
                  </label>
                  <label>
                    <input type="radio" name="splitFile" value="no" checked={splitFile === "no"} onChange={handleSplitFileChange}/>
                    No
                  </label>
                </div>
              </div>

              {splitFile === "yes" && (
              <div className="split-file-rows">
                <div className="split-input-container">
                  <button type="button" onClick={addRow} className="add-row-btn">
                    + Add Rows
                  </button>
                  {rows.map((row, index) => (
                    <div key={index} className="split-input-rows">
                      <input
                        type="text"
                        placeholder="From"
                        value={row.from}
                        onChange={(e) => handleRowChange(index, "from", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="To"
                        value={row.to}
                        onChange={(e) => handleRowChange(index, "to", e.target.value)}
                      />
                      <select
                        value={row.hour}
                        onChange={(e) => handleRowChange(index, "hour", e.target.value)}
                      >
                        <option value="">Hour</option>
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                      <span>:</span>
                      <select
                        value={row.min}
                        onChange={(e) => handleRowChange(index, "min", e.target.value)}
                      >
                        <option value="">Min</option>
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                      {index > 0 && (
                        <button
                          type="button"
                          className="remove-row-btn"
                          onClick={() => removeRow(index)}
                        >
                          Remove Row
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}

              <div className="dynamic-form-buttons">
                <button type="submit" className="btn-preview" onClick={handlePreviewpage}>
                  Preview
                </button>
                <button type="button" className="btn-cancel" >
                  Cancel
                </button>
              </div>
            </form>
            )}

            {isModalOpen && (
              <div className="preview-modal-campaign">
                <div className="quick-modal-content-campaign">
                <div className="preview-table-container">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th>Mobile</th>
                        <th>Text Message</th>
                      </tr>
                    </thead>
                    <tbody>
                    {previewData && Object.entries(previewData).map(([key, value], index) => {
                      const parts = key.split(" Æ ");
                      const mobileNumber = parts[0] || "N/A";
                      const textMessage = parts[1] || "N/A";
                      return (
                        <tr key={index}>
                          <td>{mobileNumber}</td>
                          <td>{textMessage}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  </table>
                  </div>
                  <div className="numeric-details">
                    <strong>Total Count: {totalCount}</strong> | <strong>Plain Count: {plainCount}</strong> | <strong>Plain Credit: {plainCredit}</strong> | <strong>Unicode Count: {unicodeCount}</strong> | <strong>Unicode Credit: {unicodeCredit}</strong>
                  </div>
                  <div className="modal-buttons-campaign">
                    <button onClick={() => setIsModalOpen(false)}>Close</button>
                    <button onClick={sendDynamicCampaign} >Schedule Now</button>
                  </div>
                </div>
              </div>
            )}

            </div>
            <Footer/>
        </div>
      </div>
      {showConflictModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>A campaign is already scheduled for the selected date and time. Please choose a different time.</p>
            <button onClick={() => setShowConflictModal(false)}>OK</button>
          </div>
        </div>
)}
    </div>
  )
}

export default DynamicCampaign