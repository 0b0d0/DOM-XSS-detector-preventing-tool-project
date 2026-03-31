chrome.runtime.onMessage.addListener((msg, sender,sendResponse) => {
    console.log("Message recieved: ",msg);
    //listens for sent message
    if (msg.action === "saveSources") {
        const tabId = sender.tab.id;

        chrome.storage.local.set({//sets a unique storage id and stores data
            ['sourcesCounter'+ tabId]: msg.count
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

chrome.runtime.onMessage.addListener((msg, sender,sendResponse) => {
    console.log("Message recieved: ",msg);
    //listens for sent message
    if (msg.action === "saveTwoCounters") {
        const tabId = sender.tab.id;

        // Build two  keys
        const dataToStore = {//sets unique storage id
            ['dangerousCounter'+tabId]: msg.counter,
            ['safeSourcesCounter'+tabId]: msg.safeSourcesCounter
        };

        //stores data
        chrome.storage.local.set(dataToStore,()=>{
            //send confirmation back to sender
            console.log("Values stored")
            sendResponse({
                status:"ok",
                message:"Saved values",
                storedValue:dataToStore
            })
        });
    }
});

