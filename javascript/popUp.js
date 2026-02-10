 /*This does not work cause the extension is loaded temporariliy*/
 
 function updateCounter(){
    let counterElement=document.getElementById("counter");
            //display current value
    counterElement.innerHTML=window.counter; //changed the value
    }

   window.updateCounter=updateCounter;
 
 document.addEventListener("DOMContentLoaded",function(){
    updateCounter();
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
    function update(num){
           if(num==null){
                alert("Num has no value")
            }else{
                document.getElementById('counter').innerHTML=num;
            }
        }
    b3.onclick=function (){
        
        let previousValue=document.getElementById('counter').innerHTML;

        //get currecnt value from chrome storage insetad of local storage
        chrome.storage.local.get(['counter'],function(result){
            let currentValue=result.counter; //default 0 if not set
            if(currentValue!==previousValue){
                update(currentValue);//update current value

                //send message to popup if it is open
                chrome.runtime.sendMessage({type:'UPDATE_COUNTER',counter:currentValue});
            } else{
                alert("Values are the same");
            }
        });
    }
        
    });

    
    
