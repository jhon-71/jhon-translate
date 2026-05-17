// Simple queue to prevent rate limiting
const queue = [];
let isProcessing = false;

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "translate_page") {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    
    chrome.storage.local.get(['targetLang'], async (result) => {
      const targetLang = result.targetLang || 'zh-CN';
      
      try {
        // Ensure content script is injected
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        // Send message and catch any connection errors (e.g., if page just reloaded)
        chrome.tabs.sendMessage(tab.id, { action: "START_TRANSLATE", targetLang }).catch(() => {});
      } catch (e) {
        // Cannot inject into chrome:// or other restricted pages
        console.warn("Could not inject or message content script:", e);
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "TRANSLATE_TEXT") {
    queue.push({
      text: request.text,
      targetLang: request.targetLang,
      sendResponse
    });
    processQueue();
    return true; // Indicates async response
  }
});

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const item = queue.shift();
    try {
      const translated = await translateText(item.text, item.targetLang);
      item.sendResponse({ translated });
    } catch (error) {
      console.error("Translation error:", error);
      item.sendResponse({ error: error.message });
    }
    // Delay between requests to avoid slamming the free API (rate limit)
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  isProcessing = false;
}

async function translateText(text, targetLang) {
  // Google Translate Free API endpoint
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  // Google returns an array where data[0] contains the translated sentences
  let translatedText = '';
  if (data && data[0]) {
    for (let i = 0; i < data[0].length; i++) {
      if (data[0][i][0]) {
        translatedText += data[0][i][0];
      }
    }
  }
  return translatedText || text;
}
