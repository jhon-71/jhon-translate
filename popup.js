document.getElementById('translateBtn').addEventListener('click', async () => {
  const targetLang = document.getElementById('targetLang').value;
  
  // Save preference
  chrome.storage.local.set({ targetLang });

  // Get current active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  // Execute content script if not already injected, then send message
  // Using scripting.executeScript allows us to inject content.js dynamically
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    chrome.tabs.sendMessage(tab.id, { action: "START_TRANSLATE", targetLang }).catch(() => {});
  } catch(e) {
    console.warn("Could not execute script on this page", e);
  }
});

// Load saved preference
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['targetLang'], (result) => {
    if (result.targetLang) {
      document.getElementById('targetLang').value = result.targetLang;
    }
  });
});
