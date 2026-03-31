chrome.runtime.onMessage.addListener((msg, sender,sendResponse) => {
    console.log("Message recieved: ",msg);
    //listens for sent message
    if (msg.action === "saveSources") {
        const tabId = sender.tab.id;

        chrome.storage.local.set({//sets a unique storage id
            ['sourcesCounter_'+ tabId]: msg.count
        },()=>{
            //send confirmation back to sender
            console.log("Value stored")
            sendResponse({
                status:"ok",
                message:"Saved Sources Counter",
                storedValue:msg.count
            })
        });
    }
});
