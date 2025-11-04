import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import Endpoints from '../endpoints';
import "./UploadCampaign.css";

function UploadCampaign({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
      };

      const [senderIdList, setSenderIdList] = useState([]); 
      const [messageType, setMessageType] = useState("trans");
      const [serviceType, setServiceType] = useState("service-implicit"); 
  
      const [campaignName, setCampaignName] = useState("");

      const [fileType, setFileType] = useState("txt");
      const [selectedFile, setSelectedFile] = useState(null);

      //upload file
      const [file, setFile] = useState(null);
      const [fileName, setFileName] = useState("");

  
      const [senderId, setSenderId] = useState(""); // State for selected senderId
      const [contentTemplateList, setContentTemplateList] = useState([]); 
  
      const [selectedContentTemplate, setSelectedContentTemplate] = useState(""); // State for selected Content Template
  
      const [contentTemplateId, setContentTemplateId] = useState(""); 
      const [entityId, setEntityId] = useState(""); 
      const [operatorTemplateId, setOperatorTemplateId] = useState(""); 
      const [templateText, setTemplateText] = useState("");
      const [characterCount, setCharacterCount] = useState(0); 
      const [smsCredit, setSmsCredit] = useState(0);
      const [encoding, setEncoding] = useState("plain"); 
      const [messagePart, setMessagePart] = useState("single");
  
      const[shortUrlCampaign, setShortUrlCampaign] =  useState([]);
      const[selectedShortUrl, setSelectedShortUrl] = useState("");
      const[isShortUrlSelected, setIsShortUrlSelected] = useState("N"); 

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

      const [uploadedBulkfileName, setUploadedBulkfileName] = useState([]);
  
      //For Preview Modal
      const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  
      const [previewData, setPreviewData] = useState({
        senderId: "",
        encoding: "",
        messageText: "",
        characterCount: 0,
        smsCredit: 0,
      });

      const [isFromUploadTemplate, setIsFromUploadTemplate] = useState(false);

    //State to handle input search select options
    const [isSenderFocused, setIsSenderFocused] = useState(false);
    const [isTemplateFocused, setIsTemplateFocused] = useState(false);

    const [isShortUrlFocused, setIsShortUrlFocused] = useState(false);

    const [selectedShortUrls, setSelectedShortUrls] = useState([]);

    const [shortUrlMap, setShortUrlMap] = useState({});

  
    // Handle form submit to open preview modal
    const handleFormSubmitUpload = (e) => {
      e.preventDefault();

      if (!isFileUploaded) {
        alert("Please upload the file by clicking Upload button.");
        return;
      }
  
      // Set the preview data
      setPreviewData({
        senderId: senderId,
        // encoding,
        messageText: templateText,
        characterCount,
        smsCredit,
      });
  
      // Show the modal
      setIsPreviewVisible(true);
    };

    //To reset the entered input fields
  const resetForm = () => {
    setCampaignName(getDefaultCampaignName());
    setMessageType("trans");
    setFile(null);
    setServiceType("service-implicit");
    setSenderId("");
    setSelectedContentTemplate("");
    setEncoding("plain");
    setMessagePart("single");
    setTemplateText("");
    setIsShortUrlSelected("N");
    setSelectedShortUrl("");
    setContentTemplateId("");
    setEntityId("");
    setOperatorTemplateId("");
    setCharacterCount(0);
    setSmsCredit(0);
    setScheduleMessage("no");

  };
  
     // Handle modal close
     const handleCloseModal = () => {
      setIsPreviewVisible(false);
    };
  
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
  
      // Fetch Short URL List
      const fetchShortUrlList = async () => {
          try {
            const response = await fetch(Endpoints.get('listShortUrlForCampaign'), {
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
      
            if (data?.data?.shortUrlList) {
              setShortUrlCampaign(data.data.shortUrlList); // Update state with shortUrlList
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
          fetchShortUrlList();
      }, []);
      

const textareaRef = useRef(null);
const [cursorPosition, setCursorPosition] = useState(0);

// Capture cursor position when focusing on the textarea
const handleCursorPosition = (e) => {
  setCursorPosition(e.target.selectionStart);
};


// ========================Insert correct Short URL for mapped sender ID=======================
// const handleShortUrlChange = (selectedOptions) => {
//   const newSelectedNames = selectedOptions.map(opt => opt.value);
//   const removedNames = selectedShortUrls.filter(name => !newSelectedNames.includes(name));
//   const addedNames = newSelectedNames.filter(name => !selectedShortUrls.includes(name));

//   setSelectedShortUrls(newSelectedNames);

//   // Remove logic (accurate even with same URLs)
//   if (removedNames.length > 0) {
//     let updatedText = templateText;

//     // Build an ordered array of current short URLs in the text
//     const currentShortUrlSequence = selectedShortUrls.map(name => {
//       const urlData = shortUrlCampaign.find(item => item.name === name);
//       if (urlData) {
//         const parts = urlData.shortCode.split("/");
//         parts[2] = "xxxxxx";
//         return {
//           name,
//           shortUrl: parts.join("/")
//         };
//       }
//       return null;
//     }).filter(Boolean);

//     // Loop through removedNames and remove corresponding instance of shortUrl
//     removedNames.forEach(nameToRemove => {
//       const indexToRemove = currentShortUrlSequence.findIndex(entry => entry.name === nameToRemove);
//       if (indexToRemove !== -1) {
//         const urlToRemove = currentShortUrlSequence[indexToRemove].shortUrl;

//         // Find Nth occurrence of the shortUrl in the text
//         let occurrence = -1;
//         let lastIndex = -1;
//         for (let i = 0; i <= indexToRemove; i++) {
//           lastIndex = updatedText.indexOf(urlToRemove, lastIndex + 1);
//           if (lastIndex === -1) break;
//           occurrence = lastIndex;
//         }

//         // Remove that exact occurrence
//         if (occurrence !== -1) {
//           updatedText = updatedText.slice(0, occurrence) + updatedText.slice(occurrence + urlToRemove.length);
//         }
//       }
//     });

//     setTemplateText(updatedText.trim());
//     updateCharacterCountAndCredit(updatedText.trim());
//   }

//   // Add logic
//   if (addedNames.length > 0) {
//     const latestAdded = addedNames[addedNames.length - 1];
//     const url = shortUrlCampaign.find(item => item.name === latestAdded);
//     if (url) {
//       const parts = url.shortCode.split("/");
//       if (parts.length >= 3) {
//         const extractedSenderId = parts[1];
//         if (extractedSenderId !== senderId) {
//           alert("Please select the correct Short Url for mapped Sender Id");
//           setSelectedShortUrls(prev => prev.filter(name => name !== latestAdded));
//           return;
//         }

//         parts[2] = "xxxxxx";
//         const formattedUrl = parts.join("/");

//         setTemplateText(prevText => {
//           const start = prevText.substring(0, cursorPosition);
//           const end = prevText.substring(cursorPosition);
//           const newText = start + formattedUrl + end;
//           updateCharacterCountAndCredit(newText);
//           return newText;
//         });

//         setTimeout(() => {
//           if (textareaRef.current) {
//             const newPos = cursorPosition + formattedUrl.length;
//             textareaRef.current.focus();
//             textareaRef.current.setSelectionRange(newPos, newPos);
//             setCursorPosition(newPos);
//           }
//         }, 0);
//       }
//     }
//   }
// };  

const [lastRemovedIndex, setLastRemovedIndex] = useState(null);


const handleShortUrlChange = (selectedOptions) => {
  const newSelectedNames = selectedOptions.map(opt => opt.value);
  const removedNames = selectedShortUrls.filter(name => !newSelectedNames.includes(name));
  const addedNames = newSelectedNames.filter(name => !selectedShortUrls.includes(name));

  // Track the index where removal happened
  if (removedNames.length > 0) {
    const indexToRemove = selectedShortUrls.findIndex(name => name === removedNames[0]);
    setLastRemovedIndex(indexToRemove);
  }

  // Removal logic
  if (removedNames.length > 0) {
    let updatedText = templateText;

    const currentShortUrlSequence = selectedShortUrls.map(name => {
      const urlData = shortUrlCampaign.find(item => item.name === name);
      if (urlData) {
        const parts = urlData.shortCode.split("/");
        parts[2] = "xxxxxx";
        return {
          name,
          shortUrl: parts.join("/")
        };
      }
      return null;
    }).filter(Boolean);

    removedNames.forEach(nameToRemove => {
      const indexToRemove = currentShortUrlSequence.findIndex(entry => entry.name === nameToRemove);
      if (indexToRemove !== -1) {
        const urlToRemove = currentShortUrlSequence[indexToRemove].shortUrl;

        let occurrence = -1;
        let lastIndex = -1;
        for (let i = 0; i <= indexToRemove; i++) {
          lastIndex = updatedText.indexOf(urlToRemove, lastIndex + 1);
          if (lastIndex === -1) break;
          occurrence = lastIndex;
        }

        if (occurrence !== -1) {
          updatedText = updatedText.slice(0, occurrence) + updatedText.slice(occurrence + urlToRemove.length);
        }
      }
    });

    const newTrimmedText = updatedText.trim();
    setTemplateText(newTrimmedText);

    const hasUnicode = /[^\x00-\x7F]/.test(newTrimmedText);
    const currentEncoding = hasUnicode ? "unicode" : "plain";
    let credit = 0;

    if (currentEncoding === "plain") {
      credit = newTrimmedText.length <= 160 ? 1 :
               newTrimmedText.length <= 306 ? 2 :
               2 + Math.ceil((newTrimmedText.length - 306) / 153);
    } else {
      credit = newTrimmedText.length <= 70 ? 1 :
               newTrimmedText.length <= 134 ? 2 :
               2 + Math.ceil((newTrimmedText.length - 134) / 67);
    }

    setCharacterCount(newTrimmedText.length);
    setEncoding(currentEncoding);
    setSmsCredit(credit);
    setMessagePart(newTrimmedText.length > (currentEncoding === "plain" ? 160 : 70) ? "multi" : "single");
  }

  // Addition logic
  if (addedNames.length > 0) {
    const latestAdded = addedNames[addedNames.length - 1];
    const url = shortUrlCampaign.find(item => item.name === latestAdded);
    if (url) {
      const parts = url.shortCode.split("/");
      if (parts.length >= 3) {
        const extractedSenderId = parts[1];
        if (extractedSenderId !== senderId) {
          alert("Please select the correct Short Url for mapped Sender Id");
          return;
        }

        parts[2] = "xxxxxx";
        const formattedUrl = parts.join("/");

        setTemplateText(prevText => {
          const start = prevText.substring(0, cursorPosition);
          const end = prevText.substring(cursorPosition);
          const newText = start + formattedUrl + end;

          const hasUnicode = /[^\x00-\x7F]/.test(newText);
          const currentEncoding = hasUnicode ? "unicode" : "plain";
          let credit = 0;

          if (currentEncoding === "plain") {
            credit = newText.length <= 160 ? 1 :
                     newText.length <= 306 ? 2 :
                     2 + Math.ceil((newText.length - 306) / 153);
          } else {
            credit = newText.length <= 70 ? 1 :
                     newText.length <= 134 ? 2 :
                     2 + Math.ceil((newText.length - 134) / 67);
          }

          setCharacterCount(newText.length);
          setEncoding(currentEncoding);
          setSmsCredit(credit);
          setMessagePart(newText.length > (currentEncoding === "plain" ? 160 : 70) ? "multi" : "single");

          return newText;
        });

        setTimeout(() => {
          if (textareaRef.current) {
            const newPos = cursorPosition + formattedUrl.length;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newPos, newPos);
            setCursorPosition(newPos);
          }
        }, 0);

        // Insert at removed index instead of appending
        setSelectedShortUrls(prev => {
          const updated = [...prev];
          if (
            lastRemovedIndex !== null &&
            lastRemovedIndex >= 0 &&
            lastRemovedIndex <= updated.length
          ) {
            updated.splice(lastRemovedIndex, 0, latestAdded);
          } else {
            updated.push(latestAdded);
          }
          return updated;
        });

        setLastRemovedIndex(null);
      }
    }
  } else {
    // If only removal happened (no addition), update directly
    setSelectedShortUrls(newSelectedNames);
  }
};




  
    const handleShortUrlSelectedChange = (e) => {
      setIsShortUrlSelected(e.target.value);
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
  
    // ================Handle Content Template Selection===================
   
    // const handleContentTemplateChange = (selectedOption) => {

    //   const selectedTemplateTitle = selectedOption ? selectedOption.value : "";

    //   setSelectedContentTemplate(selectedTemplateTitle);
    
    //   const selectedTemplate = contentTemplateList.find(
    //     (template) => template.templateTitle === selectedTemplateTitle
    //   );
    
    //   if (selectedTemplate) {
    //     setIsFromUploadTemplate(true); // 🔒 Mark inputs as readOnly
    
    //     setEntityId(selectedTemplate.entityId);
    //     setOperatorTemplateId(selectedTemplate.operatorTemplateId);
    //     setContentTemplateId(selectedTemplate.templateId);
    
    //     const newText = selectedTemplate.templateText;
    //     const hasUnicode = /[^\x00-\x7F]/.test(newText);
    
    //     if (newText.length === 0) {
    //       setEncoding("plain");
    //     } else if (hasUnicode) {
    //       setEncoding("unicode");
    //     }
    
    //     setTemplateText(newText);
    //     updateCharacterCountAndCredit(newText);
    //   } else {
    //     setIsFromUploadTemplate(false); // Reset if no template selected
    //   }
    // };
    const handleContentTemplateChange = (selectedOption) => {
      const selectedTemplateTitle = selectedOption ? selectedOption.value : "";
      setSelectedContentTemplate(selectedTemplateTitle);
    
      const selectedTemplate = contentTemplateList.find(
        (template) => template.templateTitle === selectedTemplateTitle
      );
    
      if (selectedTemplate) {
        setIsFromUploadTemplate(true); // Mark fields as readonly
    
        setEntityId(selectedTemplate.entityId);
        setOperatorTemplateId(selectedTemplate.operatorTemplateId);
        setContentTemplateId(selectedTemplate.templateId);
    
        const newText = selectedTemplate.templateText;
        const hasUnicode = /[^\x00-\x7F]/.test(newText);
        const detectedEncoding = newText.length === 0 ? "plain" : hasUnicode ? "unicode" : "plain";
    
        setEncoding(detectedEncoding);
        setTemplateText(newText);
        updateCharacterCountAndCredit(newText, detectedEncoding);
      } else {
        setIsFromUploadTemplate(false);
      }
    };
    
    
    
  
  //To calculate characters and sms credit count which we get based on content template name
  
  // const updateCharacterCountAndCredit = (text) => {
  //   const charCount = text.length; // Count ALL characters exactly as they are
  //   setCharacterCount(charCount);
  
  //   if (encoding === "plain") {
  //     let credit = 0;
  //     if (charCount > 0 && charCount <= 160) {
  //       credit = 1;
  //     } else if (charCount > 160 && charCount <= 306) {
  //       credit = 2;
  //     } else if (charCount > 306) {
  //       credit = 2 + Math.ceil((charCount - 306) / 153);
  //     }
  //     setSmsCredit(credit);
  //     setMessagePart(charCount > 160 ? "multi" : "single");
  //   } else if (encoding === "unicode") {
  //     let credit = 0;
  //     if (charCount > 0 && charCount <= 70) {
  //       credit = 1;
  //     } else if (charCount > 70 && charCount <= 134) {
  //       credit = 2;
  //     } else if (charCount > 134) {
  //       credit = 2 + Math.ceil((charCount - 134) / 67);
  //     }
  //     setSmsCredit(credit);
  //     setMessagePart(charCount > 70 ? "multi" : "single");
  //   }
  // };
  const updateCharacterCountAndCredit = (text, currentEncoding) => {
    const charCount = text.length;
    setCharacterCount(charCount);
  
    let credit = 0;
    if (currentEncoding === "plain") {
      if (charCount > 0 && charCount <= 160) credit = 1;
      else if (charCount <= 306) credit = 2;
      else credit = 2 + Math.ceil((charCount - 306) / 153);
      setMessagePart(charCount > 160 ? "multi" : "single");
    } else {
      if (charCount > 0 && charCount <= 70) credit = 1;
      else if (charCount <= 134) credit = 2;
      else credit = 2 + Math.ceil((charCount - 134) / 67);
      setMessagePart(charCount > 70 ? "multi" : "single");
    }
  
    setSmsCredit(credit);
  };
  
  
  
  //===============To handle the text change for plain and unicode=========================

//   const handleTextChange = (e) => {
//   const text = e.target.value;
//   const hasUnicode = /[^\x00-\x7F]/.test(text); // Detect Unicode characters

//   if (text.length === 0) {
//     // Reset encoding to plain when input is cleared
//     setEncoding("plain");
//   } else if (encoding === "plain" && hasUnicode) {
//     // If user enters Unicode text, switch encoding and allow full text
//     setEncoding("unicode");
//   } else if (encoding === "plain") {
//     // Remove non-ASCII characters if plain encoding is selected
//     const validatedText = text.replace(/[^\x00-\x7F]/g, ""); 
//     setTemplateText(validatedText);
//   }

//   setTemplateText(text);

//   // **Update character count and SMS credit calculation**
//   const charCount = text.length;
//   setCharacterCount(charCount);

//   let credit = 0;
//   if (encoding === "plain") {
//     if (charCount > 0 && charCount <= 160) credit = 1;
//     else if (charCount > 160 && charCount <= 306) credit = 2;
//     else credit = 2 + Math.ceil((charCount - 306) / 153);
//   } else {
//     if (charCount > 0 && charCount <= 70) credit = 1;
//     else if (charCount > 70 && charCount <= 134) credit = 2;
//     else credit = 2 + Math.ceil((charCount - 134) / 67);
//   }

//   setSmsCredit(credit);

//   // **Update messagePart automatically based on charCount**
//   const limit = encoding === "plain" ? 160 : 70;
//   setMessagePart(charCount > limit ? "multi" : "single");
// };

// const handleTextChange = (e) => {
//   const inputText = e.target.value;
//   const hasUnicode = /[^\x00-\x7F]/.test(inputText); // Check for Unicode characters

//   let currentEncoding = encoding;
//   let processedText = inputText;

//   // Auto-switch encoding
//   if (inputText.length === 0) {
//     setEncoding("plain");
//     currentEncoding = "plain";
//   } else if (hasUnicode) {
//     if (encoding !== "unicode") {
//       setEncoding("unicode");
//       currentEncoding = "unicode";
//     }
//   } else {
//     if (encoding !== "plain") {
//       setEncoding("plain");
//       currentEncoding = "plain";
//     }
//   }

//   // Enforce plain encoding (remove Unicode) only if "plain" is selected
//   if (currentEncoding === "plain" && hasUnicode) {
//     processedText = inputText.replace(/[^\x00-\x7F]/g, "");
//   }

//   setTemplateText(processedText);

//   const charCount = processedText.length;
//   setCharacterCount(charCount);

//   let credit = 0;
//   if (currentEncoding === "plain") {
//     if (charCount > 0 && charCount <= 160) credit = 1;
//     else if (charCount <= 306) credit = 2;
//     else credit = 2 + Math.ceil((charCount - 306) / 153);
//   } else {
//     if (charCount > 0 && charCount <= 70) credit = 1;
//     else if (charCount <= 134) credit = 2;
//     else credit = 2 + Math.ceil((charCount - 134) / 67);
//   }

//   setSmsCredit(credit);

//   const limit = currentEncoding === "plain" ? 160 : 70;
//   setMessagePart(charCount > limit ? "multi" : "single");
// };

const handleTextChange = (e) => {
  const text = e.target.value;
  const hasUnicode = /[^\x00-\x7F]/.test(text); // Check for Unicode characters

  setTemplateText(text);
  setCharacterCount(text.length);

  // Auto switch encoding
  if (text.length === 0) {
    setEncoding("plain");
  } else if (hasUnicode) {
    if (encoding !== "unicode") setEncoding("unicode");
  } else {
    if (encoding !== "plain") setEncoding("plain");
  }

  // Determine credits based on encoding
  const currentEncoding = hasUnicode ? "unicode" : "plain";
  let credit = 0;

  if (currentEncoding === "plain") {
    if (text.length <= 160) credit = 1;
    else if (text.length <= 306) credit = 2;
    else credit = 2 + Math.ceil((text.length - 306) / 153);
  } else {
    if (text.length <= 70) credit = 1;
    else if (text.length <= 134) credit = 2;
    else credit = 2 + Math.ceil((text.length - 134) / 67);
  }

  setSmsCredit(credit);

  const limit = currentEncoding === "plain" ? 160 : 70;
  setMessagePart(text.length > limit ? "multi" : "single");

  // 🔥 NEW LOGIC: remove short URLs one by one as their snippet is deleted
  setSelectedShortUrls((prev) => {
    const newSelected = [];
    let remainingText = text; // Copy of message text to track each match separately

    prev.forEach((name) => {
      const item = shortUrlCampaign.find((it) => it.name === name);
      if (!item) return;

      const parts = item.shortCode.split("/");
      if (parts.length < 3) return;
      parts[2] = "xxxxxx";
      const maskedUrl = parts.join("/");

      // Find the FIRST occurrence in remainingText
      const index = remainingText.indexOf(maskedUrl);
      if (index !== -1) {
        newSelected.push(name); 
        // Remove only this occurrence from our copy so duplicates can be handled separately
        remainingText = 
          remainingText.slice(0, index) + 
          " ".repeat(maskedUrl.length) + 
          remainingText.slice(index + maskedUrl.length);
      }
    });

    return newSelected;
  });
};


  
  
  
    // const handleEncodingChange = (e) => {
    //   const selectedEncoding = e.target.value;
    //   setEncoding(selectedEncoding);
    //   setTemplateText(""); // Clear textarea when switching encoding
    //   setCharacterCount(0); // Reset character count
    //   setSmsCredit(0); // Reset SMS credit
    //   setMessagePart("single")
    // };
    const handleEncodingChange = (e) => {
      const selectedEncoding = e.target.value;
      const hasUnicode = /[^\x00-\x7F]/.test(templateText); // Detect Unicode characters
    
      // Prevent incorrect manual changes
      if (hasUnicode && selectedEncoding === "plain") {
        alert("Cannot select Message Encoding as Plain Text when message contains unicode characters.");
        return;
      }
      
      if (!hasUnicode && selectedEncoding === "unicode") {
        alert("Cannot select Message Encoding Unicode when message contains only English characters.");
        return;
      }
    
      // Apply encoding change only if valid
      setEncoding(selectedEncoding);
      setTemplateText(""); // Clear textarea when switching encoding
      setCharacterCount(0); // Reset character count
      setSmsCredit(0); // Reset SMS credit
      setMessagePart("single");
    };


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


    const handleFileTypeChange = (event) => {
      const selectedType = event.target.value;
      setFileType(selectedType);
      setFile(null);       
      setFileName("");
    };
    
    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0]; // Update file state
      setFile(selectedFile);
      setFileName(selectedFile ? selectedFile.name : "");
      setIsFileUploaded(false);
    };

    const [isFileUploaded, setIsFileUploaded] = useState(false);

    const [isFileTypeLocked, setIsFileTypeLocked] = useState(false);

    const [isUploadDisabled, setIsUploadDisabled] = useState(false);

    //API to uplaod file
    const handleFileUpload = async () => {
      if (!file) {
        alert("Please select a file to upload.");
        return;
      }
    
      const formData = new FormData();
      formData.append("userName", userData.username);
      formData.append("fileType", file.type);
      formData.append("file", file);
    
      setIsLoading(true);
      try {
        const response = await fetch(Endpoints.get("uploadFile"), {
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
          setUploadedBulkfileName(data.data.uploadedBulkfileName);
          setIsFileUploaded(true);
          setIsFileTypeLocked(true); 
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
    
        } else {
          alert(`Error: ${data.msg || "An error occurred."}`);
          setIsFileUploaded(false);
        }
      } catch (error) {
        console.error("Error uploading Dynamic Campaign file:", error);
        alert("An error occurred. Please try again.");
      } finally {
        setIsLoading(false); 
     }
    };


  
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
  
    //===================TO SAVE THE UPLOAD CAMPAIGN DETAILS================================
    const handlUploadCampaign = async () => {
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
        campaignName: String(campaignName),
        // contentTemplateId: String(contentTemplateId),
        // dltTemplateId: String(operatorTemplateId),
        // entityId: String(entityId),
        isShortUrlSelected: String(isShortUrlSelected),
        username: String(userData.username),
        msgPart: String(messagePart),
        msgText: String(templateText),
        msgType: String(encoding),
        perMsgCredit: String(smsCredit),
        senderId: String(senderId),
        serviceType: String(messageType),
        scheduleMessage: String(scheduleMessage), 
        splitFile: String(splitFile),
        scheduleInfo: {
          splitPart: splitPartPayload,
        },
        shortUrlName: selectedShortUrls.length > 0 ? selectedShortUrls : [],
        uploadedBulkfileName: uploadedBulkfileName,
      };

      if (scheduleMessage === "yes") {
        payload.scheduleDate = scheduleDate;
        payload.scheduleHour = scheduleHour || "00"; // Default to "00" if empty
        payload.scheduleMinute = scheduleMinute || "00"; // Default to "00" if empty
      }

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
    
      setIsLoading(true);
      try {
        // API call
        const response = await fetch(Endpoints.get("uploadCampaignSchedule"), {
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
        setFile(null);
        setFileName("");
        setOperatorTemplateId("");
        setEntityId("");
        setEncoding("plain");
        setTemplateText("");
        setCharacterCount(0);
        setSmsCredit(0);
        setSenderId("");
        setSelectedContentTemplate("");
        setMessageType("trans");
        setIsShortUrlSelected("N")
        setScheduleMessage("no");
        setScheduleDate(() => new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0]);
        setScheduleHour("");
        setScheduleMinute("");
        setSelectedShortUrls([]);

          
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
          // Handle errors
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        alert("An unexpected error occurred.");
      } finally {
        setIsLoading(false); 
        // Close the modal
        setIsPreviewVisible(false);
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
        isVisualizeAllowed={userData.isVisualizeAllowed}
        userPrivileges={userData.userPrivileges}
       />
       <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="dashboard-content">
            <h2>Upload Campaign</h2>

            <div className="shortUrlResponse" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            <form className="upload-campaign-form" onSubmit={handleFormSubmitUpload}>
              <div className="upload-input-field">
                <label>Campaign Name</label>
                <div className="input-alert-combine">
                <input
                  type="text"
                  placeholder="Enter Campaign Name"
                  value={campaignName}
                  onChange={handleCampaignNameChange}
                  maxLength={100}
                  required
                />
                 <small><strong>NOTE:</strong> Special characters like SPACE % , [ ] { } | \ ; : " ' <></> . ? / ~ ` are not allowed in campaign name.</small>
                 </div>
              </div>

              <div className="upload-input-field">
                <label>File Type</label>
                {/* <div className="radio-upload-msg-type">
                  <label>
                    <input
                      type="radio"
                      name="fileType"
                      value="txt"
                      checked={fileType === "txt"}
                      onChange={handleFileTypeChange}
                    />
                    Txt
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="fileType"
                      value="xlsx"
                      checked={fileType === "xlsx"}
                      onChange={handleFileTypeChange}
                    />
                    Xlsx
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="fileType"
                      value="xls"
                      checked={fileType === "xls"}
                      onChange={handleFileTypeChange}
                    />
                    Xls
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="fileType"
                      value="csv"
                      checked={fileType === "csv"}
                      onChange={handleFileTypeChange}
                    />
                    Csv
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="fileType"
                      value="zip"
                      checked={fileType === "zip"}
                      onChange={handleFileTypeChange}
                    />
                    Zip
                  </label>
                </div> */}
                <div className="radio-upload-msg-type">
                {["txt", "xlsx", "xls", "csv", "zip"].map((type) => (
                  <label key={type}>
                    <input
                      type="radio"
                      name="fileType"
                      value={type}
                      checked={fileType === type}
                      onChange={handleFileTypeChange}
                      disabled={isFileTypeLocked}
                    />
                    {type.toUpperCase()}
                  </label>
                ))}
              </div>
              </div>


                <div className="upload-input-field">
                  <label>Select File</label>
                  <div className="input-alert-combine">
                  <input
                    className='upload-input'
                    type="file"
                    // accept=".txt,.xls,.xlsx,.csv,.zip"
                    accept={`.${fileType}`}
                    onChange={handleFileChange}
                    required
                  />
                  <small className="file-name"> {fileName}</small>
                  <small><strong>NOTE:</strong> .txt,.xls,.xlsx,.csv,.zip are the allowed file types</small>
                  </div>
                </div>
                <div className="upload-character-count"> 
                <button  type="button"  className="upload-campaign-button" onClick={handleFileUpload} disabled={isUploadDisabled}>Upload</button>
                </div>

              

              <div className="upload-input-field">
              <label>Message Type</label>
                <div className="radio-upload-msg-type">
                <label>
                    <input
                    type="radio"
                    name="messageType"
                    value="trans"
                    checked={messageType === "trans"}
                    onChange={handleMessageTypeChange}
                    />{" "}
                    Trans
                </label>
                <label>
                    <input
                    type="radio"
                    name="messageType"
                    value="promo"
                    checked={messageType === "promo"}
                    onChange={handleMessageTypeChange}
                    />{" "}
                    Promo
                </label>
                <label>
                    <input
                    type="radio"
                    name="messageType"
                    value="service"
                    checked={messageType === "service"}
                    onChange={handleMessageTypeChange}
                    />{" "}
                    Service
                </label>
                </div>
              </div>

              {messageType === "service" && (
                <div className="upload-input-field">
                <label>Service Type</label>
                <div className="radio-upload">
                    <label>
                    <input
                        type="radio"
                        name="serviceType"
                        value="service-implicit"
                        checked={serviceType === "service-implicit"}
                        onChange={handleServiceTypeChange}
                    />{" "}
                    Service Implicit
                    </label>
                    <label>
                    <input
                        type="radio"
                        name="serviceType"
                        value="service-explicit"
                        checked={serviceType === "service-explicit"}
                        onChange={handleServiceTypeChange}
                    />{" "}
                    Service Explicit
                    </label>
                </div>
                </div>
            )}


              <div className="upload-input-field">
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

              <div className="upload-input-field">
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

              <div className="upload-input-field">
              <label>Message Encoding</label>
              <div className="radio-upload">
                <label>
                  <input
                    type="radio"
                    name="encoding"
                    value="plain"
                    checked={encoding === "plain"}
                    onChange={handleEncodingChange}
                  />{" "}
                  Plain Text
                </label>
                <label>
                  <input
                    type="radio"
                    name="encoding"
                    value="unicode"
                    checked={encoding === "unicode"}
                    onChange={handleEncodingChange}
                  />{" "}
                  Unicode
                </label>
                </div>
              </div>

              <div className="upload-input-field">
              <label>Message Part</label>
              <div className="radio-upload">
                <label>
                  <input
                    type="radio"
                    name="messagePart"
                    value="single"
                    checked={messagePart === "single"}
                    onChange={() => setMessagePart("single")}
                  />{" "}
                  Singlepart
                </label>
                <label>
                  <input
                    type="radio"
                    name="messagePart"
                    value="multi"
                    checked={messagePart === "multi"}
                    onChange={() => setMessagePart("multi")}
                  />{" "}
                  Multipart
                </label>
                </div>
              </div>

              <div className="upload-input-field">
              <label>Message Text</label>
              <div className="input-alert-combine">
              <textarea
                ref={textareaRef}
                placeholder="Original Message Text"
                rows="5"
                value={templateText}
                onChange={handleTextChange}
                onClick={handleCursorPosition} // Store cursor position when clicked
                onKeyUp={handleCursorPosition} // Store cursor position on key events
                required
              ></textarea>
                 <small><strong>NOTE:</strong> xxxxxx will be replaced by actual shortcode up to 6 chars.</small>
                 </div>
              </div>
              <div className="upload-character-count">
                {characterCount} Character Count | {smsCredit} SMS Credit
            </div>
              

              <div className="upload-input-field">
              <label>Is ShortUrl Selected</label>
                <div className="radio-upload">
                <label>
                    <input
                    type="radio"
                    name="shortUrl"
                    value="Y"
                    checked={isShortUrlSelected === "Y"}
                    onChange={handleShortUrlSelectedChange}
                    />{" "}
                    Yes
                </label>
                <label>
                    <input
                    type="radio"
                    name="shortUrl"
                    value="N"
                    checked={isShortUrlSelected === "N"}
                    onChange={handleShortUrlSelectedChange}
                    />{" "}
                    No
                </label>
                </div>
              </div>
              
              {isShortUrlSelected === "Y" && (
                <div className="upload-input-field">
                <label>Short Url Name</label>
                {/* <select value={selectedShortUrl} onChange={handleShortUrlChange}>
                    <option value="">-- Select --</option>
                    {shortUrlCampaign.map((shortUrl) => (
                    <option key={shortUrl.shortUrlId} value={shortUrl.name}>
                        {shortUrl.name}
                    </option>
                    ))}
                </select> */}
                <Select
                  isMulti
                  className={`custom-react-select ${isShortUrlFocused ? 'search-mode' : ''}`}
                  classNamePrefix="custom-select"
                  value={selectedShortUrls.map(name => ({
                    label: name,
                    value: name
                  }))}
                  options={shortUrlCampaign.map((url) => ({
                    label: url.name,
                    value: url.name,
                  }))}
                  onChange={(selectedOptions) => handleShortUrlChange(selectedOptions || [])}
                  onFocus={() => setIsShortUrlFocused(true)}
                  onBlur={() => setIsShortUrlFocused(false)}
                  placeholder={isShortUrlFocused ? 'Search here...' : '-- Select --'}
                  isClearable
              />
                </div>
            )}

                {/* <div className="upload-input-field">
                <label>Content Template ID</label>
                <input
                  type="text"
                  placeholder="Entity ID"
                  value={contentTemplateId}
                  readOnly
                  required
                  />
                </div> */}

              <div className="upload-input-field">
                <label>Entity ID</label>
                <input
                  type="text"
                  placeholder="Entity ID"
                  value={entityId}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    setEntityId(numericValue);
                    setIsFromUploadTemplate(false); 
                  }}
                  // required
                  readOnly={isFromUploadTemplate}
                />
              </div>

              <div className="upload-input-field">
                <label>Operator Template ID</label>
                <input
                  type="text"
                  placeholder="Operator Template ID"
                  value={operatorTemplateId}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, "");
                    setOperatorTemplateId(numericValue);
                    setIsFromUploadTemplate(false); 
                  }}
                  // required
                  readOnly={isFromUploadTemplate}
                />
              </div>

              <div className="upload-input-field">
              <label>Schedule Message</label>
                <div className="radio-upload">
                <label>
                    <input type="radio" name="scheduleMessage" value="yes"
                    checked={scheduleMessage === "yes"}
                    onChange={handleScheduleMessageChange}/>
                    Yes
                </label>
                <label>
                    <input type="radio" name="scheduleMessage" value="no" 
                    checked={scheduleMessage === "no"}
                    onChange={handleScheduleMessageChange}/>
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

            <div className="uploadWrapHourTime">
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
                    <input type="radio" name="splitFile" value="yes" 
                    checked={splitFile === "yes"}
                    onChange={handleSplitFileChange}/>
                    Yes
                  </label>
                  <label>
                    <input type="radio" name="splitFile" value="no" 
                     checked={splitFile === "no"}
                     onChange={handleSplitFileChange}/>
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

              <div className="upload-form-buttons">
                <button type="submit" className="btn-submit">
                  Submit
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>

            {isPreviewVisible && (
              <div className="preview-modal-campaign">
                <div className="modal-content-campaign">
                  <h2>Confirm Request</h2>
                  <p><strong>Sender ID:</strong> {previewData.senderId}</p>
                  {/* <p><strong>Message Encoding:</strong> {previewData.encoding}</p> */}
                  <p><strong>Message Text:</strong> {previewData.messageText}</p>
                  <p><strong>Character Count:</strong> {previewData.characterCount}</p>
                  <p><strong>SMS Credit:</strong> {previewData.smsCredit}</p>

                  <div className="modal-buttons-campaign">
                    <button onClick={handleCloseModal}>Close</button>
                    <button onClick={handlUploadCampaign}>Send Now</button>
                  </div>
                </div>
              </div>
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

export default UploadCampaign