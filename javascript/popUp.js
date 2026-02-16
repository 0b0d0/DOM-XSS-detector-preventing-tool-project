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
        previousValue=document.getElementById('counter').innerHTML;

        //get currecnt value from chrome storage insetad of local storage
        chrome.storage.local.get(['counter','sourcesCounter'],function(result){
            currentValue=result.counter; //default 0 if not set
            if(currentValue!==previousValue){
                update(currentValue,'counter'); //update current value
                //current value contains the number from chrome storage
            } else{
                alert("Values are the same for first row");
            }

            //handle sourceCounter in the same call back
            previousValue=document.getElementById('counterTwo').innerHTML; //get value of inner HTML    
            currentValue=result.sourcesCounter; //this is equal to the value stored in chrome storage
            if(currentValue!==previousValue){
                update(currentValue,'counterTwo'); //length of the array is passed
                } else{
                    alert("Values are the same for second row");
                }
            });

    }

    });

    
    
