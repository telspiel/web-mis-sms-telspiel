// class Endpoints {
//     constructor() {
      
//       this.serverAddress = "https://backend2.quicksmart.in";
//       // this.serverAddress = "https://backend3.quicksmart.in/gui-services";
//       this.endpoints = {
//         login: "file-uploader/userService/login",
//         // login: "user-info/userService/login",

//         verifyOtp: "file-uploader/userService/verifyotp",
//         // verifyOtp: "user-info/userService/verifyotp",

//         dashboard: "file-uploader/mis/dashboard",
//         summaryReport: "file-uploader/reportService/summaryReport",
//         getHourlyReport: "file-uploader/reportService/getHourlySummaryReport",

//         getAllSenderIdList: "file-uploader/senderIdService/viewAllSenderIdList",
//         getAllEntityIdForSenderIdType : "file-uploader/senderIdService/getAllEntityIdForSenderIdType",
//         addSenderId: "file-uploader/senderIdService/addSenderId",
//         addBulkSenderId:"file-uploader/senderIdService/addBulkSenderId1",
//         deleteSenderId: "file-uploader/senderIdService/deleteSenderId",

//         viewSenderIdListByMessageType: "file-uploader/senderIdService/viewSenderIdListByMessageType",
//         viewContentTemplateData: "file-uploader/contentTemplateService/viewAllContentTemplateList",
//         deleteContentTemplate: "file-uploader/contentTemplateService/deleteContentTemplate",

//         getApprovedDomainList: "file-uploader/shortUrlService/getAllActiveAndApprovedHostNameForUser",
//         senderIdListByMessageType: 'file-uploader/senderIdService/viewSenderIdListByMessageType',
//         listShortUrl: "file-uploader/shortUrlService/viewAllActiveShortUrlForUser",
//         addShortUrl: "file-uploader/shortUrlService/addShortUrl",
//         deleteShortUrl: "file-uploader/shortUrlService/deleteShortUrl",

//         addDomainManager: "file-uploader/shortUrlService/addHostName",
//         listDomains: "file-uploader/shortUrlService/viewAllActiveHostNameForUser",
//         deleteDomain: "file-uploader/shortUrlService/deleteHostName",

//         //CAMPAIGN
//         listShortUrlForCampaign: "file-uploader/shortUrlService/viewAllActiveShortUrlForUser",
//         getAllSenderIdForCampaign: 'file-uploader/senderIdService/viewSenderIdListByMessageType',
//         viewAllContentTemplateListByMessageType: "file-uploader/contentTemplateService/viewAllContentTemplateListByMessageType",
//         quickCampaignSave: "file-uploader/sendSMSService/sendQuickSMS",


//         //REPORTS
//         summaryReportData: "file-uploader/reportService/summaryReport",
//       };
//     }
   
//     get(name) {
//       return `${this.serverAddress}/${this.endpoints[name]}`;
//     }
  
//     validateResponse(data) {
//       if (data && typeof data === "object" && data.constructor === Object) {
//         switch (data.code) {
//           case 1001:
//             window.location.pathname !== "/login"
//               ? (window.location.href = "/login")
//               : alert(data.message || "Login failed. Please try again!");
//             return false;
//           default:
//             return data;
//         }
//       } else {
//         alert("Something went wrong. Please try again!");
//         return false;
//       }
//     }
//   }
  
//   export default new Endpoints();
  


  // CALLING API DYNAMICALLY BASED ON SERVER ADDRESS
  class Endpoints {
    constructor() {
      this.serverAddresses = {
        newLogin: "https://backend8.quicksmart.in/user-info/",

        primary:  "https://backend3.quicksmart.in/gui-services/",
        secondary: "https://backend2.quicksmart.in/file-uploader/",
        downloadReportServer: "https://reportdown.quicksmart.in/"
      };
  
      this.endpoints = {
        login: { path: "userService/login", server: "newLogin" },
        verifyOtp: { path: "userService/verifyotp", server: "newLogin" },

        profileDetailsMis: {path: "userProfile/userProfileDetails", server: "primary"},
        profileDetailsWeb: {path: "userProfile/userProfileDetails", server: "secondary"},

        changePasswordUser: {path: "userProfile/updatedPassword", server: "secondary"},
  
        dashboardMis: { path: "mis/dashboard", server: "primary" },
        dashboardWeb: { path: "mis/dashboard", server: "secondary" },

        summaryReportMis: { path: "reportService/summaryReport", server: "primary" },
        summaryReportWeb: { path: "reportService/summaryReport", server: "secondary" },

        getHourlyReportMis: { path: "reportService/getHourlySummaryReport", server: "primary" },
        getHourlyReportWeb: { path: "reportService/getHourlySummaryReport", server: "secondary" },
  

        //SENDER ID
        getAllSenderIdListMis: { path: "senderIdService/viewAllSenderIdList", server: "primary" },
        getAllSenderIdListWeb: { path: "senderIdService/viewAllSenderIdList", server: "secondary" },

        getAllEntityIdForSenderIdTypeMis: { path: "senderIdService/getAllEntityIdForSenderIdType", server: "primary" },
        getAllEntityIdForSenderIdTypeWeb: { path: "senderIdService/getAllEntityIdForSenderIdType", server: "secondary" },

        addSenderIdMis: { path: "senderIdService/addSenderId", server: "primary" },
        addSenderIdWeb: { path: "senderIdService/addSenderId", server: "secondary" },


        addBulkSenderIdMis: { path: "senderIdService/addBulkSenderId1", server: "primary" },
        addBulkSenderIdWeb: { path: "senderIdService/addBulkSenderId1", server: "secondary" },

        deleteSenderIdMis: { path: "senderIdService/deleteSenderId", server: "primary" },
        deleteSenderIdWeb: { path: "senderIdService/deleteSenderId", server: "secondary" },


        //CONTENT TEMPLATE
        viewSenderIdListByMessageTypeMis: { path: "senderIdService/viewSenderIdListByMessageType", server: "primary" },
        viewSenderIdListByMessageTypeWeb: { path: "senderIdService/viewSenderIdListByMessageType", server: "secondary" },

        addContentTemplateMis: {path: "contentTemplateService/saveContentTemplate", server: "primary"},
        addContentTemplateWeb: {path: "contentTemplateService/saveContentTemplate", server: "secondary"},

        viewContentTemplateDataMis: { path: "contentTemplateService/viewAllContentTemplateList", server: "primary" },
        viewContentTemplateDataWeb: { path: "contentTemplateService/viewAllContentTemplateList", server: "secondary" },

        deleteContentTemplateMis: { path: "contentTemplateService/deleteContentTemplate", server: "primary" },
        deleteContentTemplateWeb: { path: "contentTemplateService/deleteContentTemplate", server: "secondary" },

        uploadContentTemplateMis: {path: "uploadDltDataFile", server: "primary"},
        uploadContentTemplateWeb: {path: "uploadDltDataFile", server: "secondary"},
  
        //SPIELY LINK MANAGEMENT
        getApprovedDomainList: { path: "shortUrlService/getAllActiveAndApprovedHostNameForUser", server: "secondary" },
        senderIdListByMessageType: { path: "senderIdService/viewSenderIdListByMessageType", server: "secondary" },
        listShortUrl: { path: "shortUrlService/viewAllActiveShortUrlForUser", server: "secondary" },
        editShortUrl: {path: "shortUrlService/editShortUrl", server: "secondary"},
        addShortUrl: { path: "shortUrlService/addShortUrl", server: "secondary" },
        deleteShortUrl: { path: "shortUrlService/deleteShortUrl", server: "secondary" },
  
        addDomainManager: { path: "shortUrlService/addHostName", server: "secondary" },
        listDomains: { path: "shortUrlService/viewAllActiveHostNameForUser", server: "secondary" },
        deleteDomain: { path: "shortUrlService/deleteHostName", server: "secondary" },
  
        //QUICK CAMPAIGN
        listShortUrlForCampaign: { path: "shortUrlService/viewAllActiveShortUrlForUser", server: "secondary" },
        getAllSenderIdForCampaign: { path: "senderIdService/viewSenderIdListByMessageType", server: "secondary" },
        viewAllContentTemplateListByMessageType: { path: "contentTemplateService/viewAllContentTemplateListByMessageType", server: "secondary" },
        quickCampaignSave: { path: "sendSMSService/sendQuickSMS", server: "secondary" },

        //UPLOAD CAMPAIGN
        uploadFile: {path: "uploadFile", server: "secondary"},
        uploadCampaignSchedule: {path: "scheduleFile", server: "secondary"},


        //DYNAMIC CAMPAIGN
        allHostNameUser: {path: "shortUrlService/getAllActiveAndApprovedHostNameForUser", server: "secondary"},
        uploadDynamicCampaign: {path: "dynamicSMSService/uploadDynamicMessageFile", server: "secondary"},
        dymanicCampaignPreview: {path: "dynamicSMSService/getPreview", server: "secondary"},
        sendDynamicCampaign: {path: "dynamicSMSService/sendDynamicSMS", server: "secondary"},

        //GROUP CAMPAIGN
        getAllGroupList: {path: "groupService/getAllGroupsList", server: "secondary"},
        getAllTemplateData: {path: "templateService/viewAllTemplateList", server: "secondary"},
        sendGroupCampaign: {path: "groupSMSService/sendGroupSMS", server: "secondary"},

        //SCHEDULED CAMPAIGN
        viewScheduledCampaign: {path: "campaignService/viewConsolidateScheduledCampaignForUser", server: "secondary"},
        deleteScheduledCampaign: {path: "campaignService/deleteConsolidateScheduledCampaignForUser", server: "secondary"},

        //SUMMARY REPORT
        summaryReportDataMis: { path: "reportService/summaryReport", server: "primary" },
        summaryReportDataWeb: { path: "reportService/summaryReport", server: "secondary" },

        //SENDER ID REPORT
        senderIdWiseReportMis: { path: "reportService/senderIdWiseReport", server: "primary" },
        senderIdWiseReportWeb: { path: "reportService/senderIdWiseReport", server: "secondary" },

        //DETAILED REPORT
        senderIdAllDataMis: {path: "senderIdService/viewAllSenderIdList", server: "primary"},
        senderIdAllDataWeb: {path: "senderIdService/viewAllSenderIdList", server: "secondary"},
        detailedReportMis: {path: "mis/detailedMis", server: "primary"},
        detailedReportWeb: {path: "reportService/detailedReport", server: "secondary"},

        //CAMPAIGN REPORT
        campaignReportDataWeb: {path: "reportService/campaignReport", server: "secondary"},
        clickerAnalysis: {path: "reportService/clickerAnalytics", server: "secondary"},
        detailedAnalytics: {path: "reportService/detailedAnalytics", server: "secondary"},

        //CLICKER REPORT
        clickerReportMis : {path: "reportService/clickerReportForMis", server: "primary"},
        clickerReportWeb : {path: "reportService/detailedAnalyticsReport", server: "secondary"},

        downloadClickerReportMis: {path: "reportService/downloadDetailsAnalyticsReport/", server: "primary"},
        downloadClickerReportWeb: {path: "reportService/downloadDetailsAnalyticsReport/", server: "secondary"},

        //DOWNLOAD REPORT
        downloadReportMis: {path: "mis/viewGeneratedReports", server: "primary"},
        downloadReportWeb: {path: "mis/viewGeneratedReports", server: "secondary"},
        campaignReportWeb: {path: "reportService/campaignReport", server: "secondary"},

        generatePreviousReportMis: {path: "/mis/generateReport", server: "primary"},
        generatePreviousReportWeb: {path: "mis/generateReport", server: "secondary"},

        generateReportMis: {path: "mis-reporter/mis/generateReport", server: "downloadReportServer"},
        generateReportWeb: {path: "mis-reporter/mis/generateReport", server: "downloadReportServer"},

        //USER BLACKLIST
        addBlacklistMis: {path: "userBlackListService/addNumberInUserBlackList", server: "primary"},
        addBlacklistWeb: {path: "userBlackListService/addNumberInUserBlackList", server: "secondary"},


        uploadBlacklistMis: {path: "userBlackListService/uploadUserBlackListNumberFile", server: "primary"},
        uploadBlacklistWeb: {path: "userBlackListService/uploadUserBlackListNumberFile", server: "secondary"},

        getAllDescriptionMis: {path: "userBlackListService/fetchAllDescriptions", server: "primary"},
        getAllDescriptionWeb: {path: "userBlackListService/fetchAllDescriptions", server: "secondary"},
        getAllBlacklistUserMis: {path: "userBlackListService/getAllBlacklistNumbersForUser", server: "primary"},
        getAllBlacklistUserWeb: {path: "userBlackListService/getAllBlacklistNumbersForUser", server: "secondary"},
        searchBlacklistNumberMis: {path: "userBlackListService/searchUserBlacklistNumber", server: "primary"},
        searchBlacklistNumberWeb: {path: "userBlackListService/searchUserBlacklistNumber", server: "secondary"},
        searchBlacklistDescriptionMis: {path: "userBlackListService/searchUserBlacklistDescription", server: "primary"},
        searchBlacklistDescriptionWeb: {path: "userBlackListService/searchUserBlacklistDescription", server: "secondary"},

        removeBlacklistNumberMis: {path: "userBlackListService/removeNumberFromUserBlackList", server: "primary"},
        removeBlacklistNumberWeb: {path: "userBlackListService/removeNumberFromUserBlackList", server: "secondary"},

        //PHONEBOOK MANAGEMENT - Group Contacts
        addGroupContact: {path: "groupService/addGroup", server: "secondary"},
        allGroupListData: {path: "groupService/getAllGroupsList", server: "secondary"},
        deleteGroupList: {path: "groupService/deleteGroup", server: "secondary"},

        //PHONEBOOK MANAGEMENT - Individual Contacts
        groupNameList: {path: "groupService/getAllGroupsList", server: "secondary"},
        addnewcontacts: {path: "groupNumberDetailsService/addNumberToGroup", server: "secondary"},

        singleContactInGroup: {path: "groupNumberDetailsService/searchNumber", server: "secondary"},
        allContactsInGroup: {path: "groupNumberDetailsService/getAllNumbersInGroup", server: "secondary"},
        removeContactsFromGroupTable: {path: "groupNumberDetailsService/removeNumberFromGroup", server: "secondary"},

        uploadNewContacts: {path: "groupService/uploadNumberInUserGroup", server: "secondary"},

        //CREDIT HISTORY
        creditHistoryDataMis: {path: "creditService/getCreditHistory", server: "primary"},
        creditHistoryDataWeb: {path: "creditService/getCreditHistory", server: "secondary"},

        //DLT Chain Registration
        dltViewDataMis: {path: "dltService/viewDltData", server: "primary"},
        dltViewDataWeb: {path: "dltService/viewDltData", server: "secondary"},

        dltSaveValueMis: {path: "dltService/dltData", server: "primary"},
        dltSaveValueWeb: {path: "dltService/dltData", server: "secondary"},

      };
    }
  
    // Get the full URL for an endpoint
    get(name) {
      const endpoint = this.endpoints[name];
      if (!endpoint) {
        throw new Error(`Endpoint ${name} not found`);
      }
      const serverAddress = this.serverAddresses[endpoint.server];
      return `${serverAddress}${endpoint.path}`;
    }
  
    // Validate response
    validateResponse(data) {
      if (data && typeof data === "object" && data.constructor === Object) {
        switch (data.code) {
          case 1001:
            window.location.pathname !== "/login"
              ? (window.location.href = "/login")
              : alert(data.message || "Login failed. Please try again!");
            return false;
          default:
            return data;
        }
      } else {
        alert("Something went wrong. Please try again!");
        return false;
      }
    }
  }
  
  export default new Endpoints();
  