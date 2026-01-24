/*this file fetches dom xss payloads
using fetch command.*/

 const websiteLinks=["https://raw.githubusercontent.com/adham-hashem/XSS-payloads/main/Payloads.txt",
    "https://raw.githubusercontent.com/yogsec/XSS-Payloads/main/dom_based_xss_payloads.txt",
    "https://raw.githubusercontent.com/pgaijin66/XSS-Payloads/master/payload/payload.txt"
];


async function getDataSet(url,num){//async makes function return a promise
    //trying to get data from website
    try{
        const response= await fetch(url[num]);
        //check if reponse is good
        if(!response.ok){
            throw new Error("HTTP error! status:", response.status);
        }
        
        const data=await response.text();
        console.log("Successfully fetched payload dataset from", url[num]);

        // Split the string into a list
        const payloadDataSet = data.split("\n").filter(Boolean); // Removes empty lines
        
        //encode each item in the dataSet before sotring to localStorage
        const encodedDataSet=payloadDataSet.map(payload=>
            btoa(encodeURIComponent(payload))
        );

        //check if item already exists in storage
        const itemExists=localStorage.getItem('payloadDataset'+num);
        if(itemExists){
            console.log("The dataset that was fetched is already in storage");
        }else{
            //storing payload dataset in local storage
            localStorage.setItem('payloadDataset'+num,JSON.stringify(encodedDataSet));
        }
        
        return payloadDataSet;
    }catch (error){
        alert("Error fetching dom xss payload dataset: ",error);
    }
}

//Calling the function to execute content inside function
//This checks if the data has been fetched and if true displays it as been fetched
//then function triggers event when a promise is (fulfilled or rejected) - syntax .then(fulfilled,rejected)
getDataSet(websiteLinks, 0).then(payloadDataSet => {
    if(payloadDataSet){
    // store result in golbal variable
    // Now it should have the data
        console.log("Dataset been retrieved");
    }
});
getDataSet(websiteLinks, 1).then(payloadDataSet => {
    if(payloadDataSet){
    // store result in golbal variable
    // Now it should have the data
        console.log("Dataset been retrieved");
    }
});

getDataSet(websiteLinks, 2).then(payloadDataSet => {
    if(payloadDataSet){
    // store result in golbal variable
    // Now it should have the data
        console.log("Dataset been retrieved");
    }
});


//was was justing testing how to access global functions in another file
function test(){
    //IT WORKED
    console.log("Testing if the function was imported into the other file");
}
//making function accessible globally
window.test=test;
