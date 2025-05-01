const commandFunctions = {
    'show-alt-text': toggle
};

chrome.commands.onCommand.addListener(function (command) {
    if (commandFunctions[command]) {
        commandFunctions[command]();
    } else {
        console.log(`Command ${command} not found`);
    }
});

function toggle(){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.storage.sync.get("toggle", (data) => {
            if(data.toggle === "on") {
                chrome.storage.sync.set({ toggle: "off" });
                chrome.tabs.sendMessage(tabs[0].id, { action: "off" });
            } else {
                chrome.storage.sync.set({ toggle: "on" });
                chrome.tabs.sendMessage(tabs[0].id, { action: "on" });
            }
        });
    });
}