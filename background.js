chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes(".mp4") || details.url.includes(".m3u8")) {
      chrome.tabs.sendMessage(details.tabId, {
        type: "video_loaded",
      });
    }
  },
  { urls: ["*://*.rutube.ru/*"] }
);

chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.scripting.executeScript({
    target: { tabId: details.tabId },
    files: ["content.js"],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.activity !== undefined) {
    fetch("http://localhost:5326/activity-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        activity: request.activity,
        type: request.type,
        src: request.src,
      }),
    })
      .then((response) => {
        sendResponse({ status: "success" });
      })
      .catch((error) => {
        return true;
      });
  }
  return true;
});
