import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import Endpoints from '../endpoints';
import "./QuickCampaign.css";

function QuickCampaign({ userData, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [isLoading, setIsLoading] = useState(false);

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    const [senderIdList, setSenderIdList] = useState([]); 
    const [messageType, setMessageType] = useState("trans");
    const [serviceType, setServiceType] = useState("service-implicit"); 

    const [campaignName, setCampaignName] = useState("");
    const [mobileNumbers, setMobileNumbers] = useState("");
    const [totalMobileNumbers, setTotalMobileNumbers] = useState(0);

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

    const [shortUrlCampaign, setShortUrlCampaign] =  useState([]);
    const [selectedShortUrl, setSelectedShortUrl] = useState("");
    const [isShortUrlSelected, setIsShortUrlSelected] = useState("N"); 

    const [isFromTemplate, setIsFromTemplate] = useState(false);


    const [responseMessage, setResponseMessage] = useState("");
    const responseMsgRef = useRef(null); 

    //For Preview Modal
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const [previewData, setPreviewData] = useState({
      senderId: "",
      encoding: "",
      messageText: "",
      characterCount: 0,
      smsCredit: 0,
    });

    //State to handle input search select options
    const [isSenderFocused, setIsSenderFocused] = useState(false);
    const [isTemplateFocused, setIsTemplateFocused] = useState(false);

    const [isShortUrlFocused, setIsShortUrlFocused] = useState(false);

    const [selectedShortUrls, setSelectedShortUrls] = useState([]);

    const [shortUrlMap, setShortUrlMap] = useState({});


  // Handle form submit to open preview modal
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Set the preview data
    setPreviewData({
      senderId: senderId,
      encoding,
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
    setMobileNumbers("");
    setMessageType("trans");
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
      
      // Capture cursor position before clicking the dropdown
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
      
        // Track the index of the removed name (for reinsertion)
        if (removedNames.length > 0) {
          const indexToRemove = selectedShortUrls.findIndex(name => name === removedNames[0]);
          setLastRemovedIndex(indexToRemove);
        }
      
        // Remove logic
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
      
        // Add logic
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
      
              // Insert new short URL at the previously removed index
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
          // If no new items added, just update selected list normally (e.g., all removed case)
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
    setContentTemplateId(""); 
    setOperatorTemplateId(""); // Reset Operator Template ID
    setTemplateText(""); // Reset templateText
    fetchContentTemplateList(selectedId); // Fetch Content Templates for selected Sender ID
    setIsShortUrlSelected('N');
    setSelectedShortUrl("");
  };

  // =================Handle Content Template Selection===================
  // const handleContentTemplateChange = (selectedOption) => {
  //   const selectedTemplateTitle = selectedOption ? selectedOption.value : "";
  //   setSelectedContentTemplate(selectedTemplateTitle);
  
  //   const selectedTemplate = contentTemplateList.find(
  //     (template) => template.templateTitle === selectedTemplateTitle
  //   );
  
  //   if (selectedTemplate) {
  //     setIsFromTemplate(true); // 🔒 Set flag to true when values come from template
  
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
  //     setIsFromTemplate(false); // Reset if nothing is selected
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
      const hasUnicode = /[^\x00-\x7F]/.test(newText);
      const detectedEncoding = hasUnicode ? "unicode" : "plain";
      setEncoding(detectedEncoding);
      setTemplateText(newText);
      updateCharacterCountAndCredit(newText, detectedEncoding);
    } else {
      setIsFromTemplate(false);
    }
  };
  
  
  

//To calculate characters and sms credit count which we get based on content template name

// const updateCharacterCountAndCredit = (text) => {
//   if (encoding === "plain") {
//     const charCount = text.length;
//     setCharacterCount(charCount);

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
//     const charCount = text.length;
//     setCharacterCount(charCount);

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





//To handle the text change for plain and unicode
// const handleTextChange = (e) => {
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
  

  // const handleMobileNumberChange = (e) => {
  //   const input = e.target.value;

  //   // Allow only numbers, commas, spaces, and newlines
  //   const numericInput = input.replace(/[^0-9,\n ]/g, "");
  
  //   // Update mobile numbers
  //   setMobileNumbers(numericInput);
  
  //   // Split input by newlines and filter out empty lines
  //   const numbers = numericInput
  //     .split("\n")
  //     .map((num) => num.trim())
  //     .filter((num) => num !== "");
  
  //   // Update total mobile number count
  //   setTotalMobileNumbers(numbers.length);
  // };
  const handleMobileNumberChange = (e) => {
    let input = e.target.value;
    // Allow only numbers, spaces, and newlines
    let numericInput = input.replace(/[^0-9\n]/g, "");
    // Split input by newlines
    let numbers = numericInput.split("\n");
    // Ensure each number has a max length of 12
    numbers = numbers.map((num) => num.slice(0, 12));
    // Join the numbers back with new lines
    const formattedNumbers = numbers.join("\n");
  
    // Update state
    setMobileNumbers(formattedNumbers);
    setTotalMobileNumbers(numbers.filter((num) => num.trim() !== "").length);
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

  //TO SAVE THE QUICK CAMPAIGN DETAILS
  const handleSendNow = async () => {
    const payload = {
      campaignName: String(campaignName),
      // contentTemplateId: String(contentTemplateId),
      // dltTemplateId: String(operatorTemplateId),
      // entityId: String(entityId),
      isShortUrlSelected: String(isShortUrlSelected),
      loggedInUserName: String(userData.username),
      mobileNumber: mobileNumbers.replace(/\n/g, "\r\n"), // Replace \n with \r\n
      msgPart: String(messagePart),
      msgText: String(templateText),
      msgType: String(encoding),
      perMsgCredit: String(smsCredit),
      senderId: String(senderId),
      serviceType: String(messageType),
      shortUrlName: selectedShortUrls.length > 0 ? selectedShortUrls : [], // Handle empty shortUrlName
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
  
    setIsLoading(true); 
    try {
      // API call
      const response = await fetch(Endpoints.get("quickCampaignSave"), {
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

        setResponseMessage(result.message);

        if (responseMsgRef.current) {
          responseMsgRef.current.classList.add("visible");
          responseMsgRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start", 
          });
        }

        setTimeout(() => {
          setResponseMessage("");
          responseMsgRef.current.classList.remove("visible");
        }, 3000);

         // Clear all fields on success
        setCampaignName(getDefaultCampaignName());
        setContentTemplateId("");
        setOperatorTemplateId("");
        setEntityId("");
        setIsShortUrlSelected("N");
        setMobileNumbers("");
        setMessagePart("single");
        setTemplateText("");
        setEncoding("plain");
        setSmsCredit("");
        setSenderId("");
        setSelectedContentTemplate("");
        setMessageType("trans");
        setSelectedShortUrl("");
        setSelectedShortUrls([]);
  
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An unexpected error occurred.");
    } finally {
  
      // Close the modal
      setIsPreviewVisible(false);
      setIsLoading(false); 
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
       />
       <div className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="dashboard-content">
            <h2>Quick Campaign</h2>

            <div className="quickAlertMessage" ref={responseMsgRef}>
                {responseMessage && <p>{responseMessage}</p>}
            </div>

            <form className="quick-campaign-form" onSubmit={handleFormSubmit}>
              <div className="quick-input-field">
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
  
              <div className="quick-input-field">
                <label>Mobile Number(s)</label>
                <textarea
                  placeholder="Enter Mobile Number(s)"
                  rows="3"
                  value={mobileNumbers}
                  onChange={handleMobileNumberChange}
                  required
                ></textarea>
              </div>
              <div className="character-count">
                {totalMobileNumbers} Mobile Number{totalMobileNumbers !== 1 ? "s" : ""}
              </div>

              <div className="quick-input-field">
              <label>Message Type</label>
                <div className="radio-group-msg-type">
                <label>
                    <input
                    type="radio"
                    name="messageType"
                    value="trans"
                    checked={messageType === "trans"}
                    onChange={handleMessageTypeChange}
                    />{" "}
                    Transactional
                </label>
                <label>
                    <input
                    type="radio"
                    name="messageType"
                    value="promo"
                    checked={messageType === "promo"}
                    onChange={handleMessageTypeChange}
                    />{" "}
                    Promotional
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
                <div className="quick-input-field">
                <label>Service Type</label>
                <div className="radio-group">
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
              <label>Message Encoding</label>
            <div className="radio-group">
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

              <div className="quick-input-field">
              <label>Message Part</label>
              <div className="radio-group">
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

              <div className="quick-input-field">
              <label>Message Text</label>
              <div className="input-alert-combine">
                <textarea
                  ref={textareaRef}
                  placeholder="Original Message Text"
                  rows="5"
                  value={templateText}
                  onChange={handleTextChange}
                  onClick={handleCursorPosition} 
                  onKeyUp={handleCursorPosition}
                  required
                ></textarea>
                <small><strong>NOTE:</strong> xxxxxx will be replaced by actual shortcode up to 6 chars.</small>
                </div>
              </div>
              <div className="character-count">
                {characterCount} Character Count | {smsCredit} SMS Credit
            </div>
              

              <div className="quick-input-field">
              <label>Is ShortUrl Selected</label>
                <div className="radio-group">
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
                <div className="quick-input-field">
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

                  <div className="quick-input-field">
                    <label>Entity ID</label>
                    <input
                      type="text"
                      placeholder="Entity ID"
                      value={entityId}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        setEntityId(numericValue);
                        setIsFromTemplate(false); // Unlock if user starts typing
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
                        setIsFromTemplate(false); // Unlock if user starts typing
                      }}
                      // required
                      readOnly={isFromTemplate}
                    />
                  </div>

              <div className="quick-campaign-buttons">
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
                <div className="quick-modal-content-campaign">
                  <h2>Confirm Request</h2>
                  <p><strong>Sender ID:</strong> {previewData.senderId}</p>
                  <p><strong>Message Encoding:</strong> {previewData.encoding}</p>
                  <p><strong>Message Text:</strong> {previewData.messageText}</p>
                  <p><strong>Character Count:</strong> {previewData.characterCount}</p>
                  <p><strong>SMS Credit:</strong> {previewData.smsCredit}</p>

                  <div className="modal-buttons-campaign">
                    <button onClick={handleCloseModal}>Close</button>
                    <button onClick={handleSendNow}>Send Now</button>
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

export default QuickCampaign;