document.addEventListener("DOMContentLoaded",function(){
        const b1 = document.getElementById("b1"); // ON button
        const b2 = document.getElementById("b2"); // OFF button
        const b3=document.getElementById("b3"); //refresh number button

        //set extension id
        const extensionId="sample@example.com";
    
        // Add event listener for the ON button
    b1.onclick = function() {
        //get extension details
        browser.management.get(extensionId,function(extensionInfo){
        if (browser.runtime.lastError) {
            alert("Error retrieving extension details: " + chrome.runtime.lastError.message);
        }

        if(extensionInfo.disabled){//checks if it is disabled
            browser.management.setEnabled(extensionId,true,function(){
                 if (chrome.runtime.lastError) {
            alert("Error retrieving extension details: " + chrome.runtime.lastError.message);
        } else{
            alert("Extension has been enabled"); //enable extension
        }
            });
        }

        });
    };

    // Add event listener for the OFF button
    b2.onclick = function() {
         //get extension details
        browser.management.get(extensionId,function(extensionInfo){
        if (chrome.runtime.lastError) {
            alert("Error retrieving extension details: " + chrome.runtime.lastError.message);
        }

        if(extensionInfo.enabled){//checks if it is disabled
            browser.management.setEnabled(extensionId,false,function(){
                 if (chrome.runtime.lastError) {
            alert("Error retrieving extension details: " + chrome.runtime.lastError.message);
        } else{
            alert("Extension has been disabled"); //disable extension
        }
            });
        }

        }); 
    };
    function update(num,id){
           if(num==null){
                alert("Element id is empty")
            }else{
                document.getElementById(id).innerHTML=num;
            }
        }
    b3.onclick= async function (){
        let currentValue;
        let previousValue;

        //Number command converts inner HTML to integer
        //get currecnt value from chrome storage insetad of local storage
        chrome.storage.local.get(['counter','sourcesCounter','safeSourcesCounter'],function(result){
            const counters=[
                {storageKey:'counter',elementId: 'counter'},
                {storageKey:'sourcesCounter',elementId: 'counterTwo'},
                {storageKey:'safeSourcesCounter',elementId: 'counterThree'}
            ]
            //loop through array and check each map and replace the element values
            //result accesses the value of the storagekey
            counters.forEach(({storageKey,elementId})=>{
                previousValue=Number(document.getElementById(elementId).innerHTML);
                currentValue=result[storageKey];//gets value that is stored in chrome storage
                if(currentValue!==previousValue){
                    update(currentValue,elementId);
                }
            });
            
        });

    }

    });

    
    
