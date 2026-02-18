// Background service worker — handles keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-highlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" });
    });
  }
});
