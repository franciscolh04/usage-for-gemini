const RULE_ID = 1;

const RULE = {
  id: RULE_ID,
  priority: 1,
  action: {
    type: "modifyHeaders",
    responseHeaders: [
      { header: "x-frame-options", operation: "remove" },
      { header: "content-security-policy", operation: "remove" },
    ],
  },
  condition: {
    requestDomains: ["gemini.google.com"],
    urlFilter: "/usage",
    resourceTypes: ["sub_frame"],
  },
};

function registerRule() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [RULE],
  });
}

chrome.runtime.onInstalled.addListener(registerRule);
chrome.runtime.onStartup.addListener(registerRule);
registerRule();
