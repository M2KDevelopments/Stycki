//Configures the side panel.
chrome.sidePanel.setOptions({
    // Whether sidepanel is enabled or not. By default it's true. 
    enabled: true,
    // html file path
    path: "index.html"
})

chrome.action.onClicked.addListener((tab) => chrome.sidePanel.open({ tabId: tab.id }));