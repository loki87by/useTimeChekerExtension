const body = document.querySelector("body");
const iframes = body.querySelectorAll("iframe");
let time = 0,
  x = 0,
  y = 0;

let lastActivityTime = Date.now();
let isActive = false;
let isKeyPressed = false;
let reason = "";
let src = "";

function sendData(data) {
  chrome.runtime.sendMessage(data, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Message failed:", chrome.runtime.lastError);
    }
  });
}

function addVideoEventHandlers(video) {
  video.addEventListener("play", () => {
    isActive = true;
    reason = "Воспроизведение видео";
    src = window.origin;
    sendData({ activity: true, type: "Воспроизведение видео", src: src });
  });

  video.addEventListener("pause", () => {
    isActive = false;
    reason = "Video paused";
    src = window.origin;
  });

  video.addEventListener("ended", () => {
    isActive = false;
    reason = "Video ended";
    src = window.origin;
  });
}

function extractAttributes(iframeString) {
  const regex = /(\w+)\s*=\s*["']?([^"'>]+)["']?/g;
  const attributes = {};
  let match;

  while ((match = regex.exec(iframeString)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
}

function replaceIframesWithVideos() {
  const iframes = document.querySelectorAll("iframe");

  iframes.forEach((iframe) => {
    const attributes = extractAttributes(iframe.outerHTML);
    const styles = 'color: green; fontSize: "3em"; fontWeight: 900;';
    if (attributes.src) {
      const link = document.createElement("a");
      const updSrc = attributes.src.includes("http")
        ? attributes.src
        : `https:` + attributes.src;
      link.href = updSrc;
      link.target = "_blank";
      link.textContent = "ССЫЛКА НА ПРОСМОТР";
      link.setAttribute("style", styles);
      iframe.parentNode.replaceChild(link, iframe);
    } else {
      const text = document.createElement("h3");
      text.textContent = "Не доступно в этом проигрывателе";
      text.setAttribute("style", styles);
      iframe.parentNode.replaceChild(text, iframe);
    }
  });
}

function checkActivity() {
  const currentTime = Date.now();
  if (isActive || isKeyPressed || currentTime - lastActivityTime <= 1000) {
    sendData({ activity: true, type: reason, src: src });
  } else {
    sendData({ activity: false, type: reason, src: src });
  }
}
setInterval(checkActivity, 1000);

function mouseHandler() {
  lastActivityTime = Date.now();
  if (reason === "Воспроизведение видео" && isActive) return;
  reason = `Активность мыши`;
  src = window.origin;
}

function keyHandler(event) {
  lastActivityTime = Date.now();
  if (reason === "Воспроизведение видео" && isActive) return;
  if (event.type === 'keydown') {
    isKeyPressed = true;
    reason = `Ввод текста`;
  } else if (event.type === 'keyup') {
    isKeyPressed = false;
  }
  reason = `Ввод текста`;
  src = window.origin;
}

function scrollHandler() {
  lastActivityTime = Date.now();
  if (reason === "Воспроизведение видео" && isActive) return;
  reason = "Активность мыши";
  src = window.origin;
  isActive = true;
}

function handleVideoEvents(video) {
  addVideoEventHandlers(video);
  video.addEventListener("play", () => {
    body.removeEventListener("mousemove", mouseHandler);
    body.removeEventListener("mousedown", mouseHandler);
    body.removeEventListener("keypress", keyHandler);
  });
  video.addEventListener("pause", () => {
    body.addEventListener("mousemove", mouseHandler);
    body.addEventListener("mousedown", mouseHandler);
    body.addEventListener("keypress", keyHandler);
  });
  video.addEventListener("ended", () => {
    body.addEventListener("mousemove", mouseHandler);
    body.addEventListener("mousedown", mouseHandler);
    body.addEventListener("keypress", keyHandler);
  });
}

replaceIframesWithVideos();
const videos = body.querySelectorAll("video");

// Добавляем обработчики для мыши и клавиатуры
body.addEventListener("mousemove", mouseHandler);
body.addEventListener("keydown", keyHandler);
body.addEventListener("keyup", keyHandler);
body.addEventListener("scroll", scrollHandler);
videos.forEach((video) => handleVideoEvents(video));
