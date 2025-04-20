chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.activity !== undefined ) {
    fetch("http://localhost:5326/activity-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ activity: request.activity, type: request.type, src: request.src }),
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
