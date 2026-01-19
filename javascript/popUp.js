 /*This should have worked but because
 the extension is loaded as a temporary extension the maagement API
 does not work*/
 document.addEventListener("DOMContentLoaded",function(){
        const b1 = document.getElementById("b1"); // ON button
        const b2 = document.getElementById("b2"); // OFF button

        //set extension id
        const extensionId="sample@example.com";
        // Add event listener for the ON button
    b1.onclick = function() {
        //get extension details
        chrome.management.get(extensionId,function(extensionInfo){
        if (chrome.runtime.lastError) {
            alert("Error retrieving extension details: " + chrome.runtime.lastError.message);
        }

        if(extensionInfo.disabled){//checks if it is disabled
            chrome.management.setEnabled(extensionId,true,function(){
                 if (chrome.runtime.lastError) {
            alert("Error retrieving extension details: " + chrome.runtime.lastError.message);
        } else{
            alert("Extension has been enabled");
        }
            });
        }

        });
    };

    // Add event listener for the OFF button
    b2.onclick = function() {
         //get extension details
        chrome.management.get(extensionId,function(extensionInfo){
        if (chrome.runtime.lastError) {
            alert("Error retrieving extension details: " + chrome.runtime.lastError.message);
        }

        if(extensionInfo.enabled){//checks if it is disabled
            chrome.management.setEnabled(extensionId,false,function(){
                 if (chrome.runtime.lastError) {
            alert("Error retrieving extension details: " + chrome.runtime.lastError.message);
        } else{
            alert("Extension has been disabled");
        }
            });
        }

        });
        
    };
    
    });
