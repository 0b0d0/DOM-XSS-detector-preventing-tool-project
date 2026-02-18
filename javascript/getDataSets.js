/*this file fetches dom xss payloads
using fetch command.*/

 const websiteLinks=["https://raw.githubusercontent.com/adham-hashem/XSS-payloads/main/Payloads.txt",
    "https://raw.githubusercontent.com/yogsec/XSS-Payloads/main/dom_based_xss_payloads.txt",
    "https://raw.githubusercontent.com/pgaijin66/XSS-Payloads/master/payload/payload.txt",
     "https://raw.githubusercontent.com/payload-box/xss-payload-list/main/Payloads/All-In-One.txt"
];


async function getDataSet(url,num){//async makes function return a promise
    //trying to get data from website
    try{
        let payloadDataSet;
        const response= await fetch(url[num]);
        //check if reponse is good
        if(!response.ok){
            throw new Error("HTTP error! status:", response.status);
        }
        
        
        const data=await response.text();//await for data fetched from website
        console.log("Successfully fetched payload dataset from", url[num]);
        
        //check if item already exists in storage
        const itemExists=localStorage.getItem('payloadDataset'+num);

        if(itemExists){
            console.log("The dataset that was fetched is already in storage dataset number",num );
        }else{
            // Split the string into a list
            payloadDataSet = data.split("\n").filter(Boolean); // Removes empty lines
            
            // Encode each item in the dataSet before storing to localStorage
            const encodedDataSet = payloadDataSet.map(item => btoa(encodeURIComponent(item)));

            //storing payload dataset in local storage
            localStorage.setItem('payloadDataset'+num,JSON.stringify(encodedDataSet));
        }

        return payloadDataSet;
    }catch (error){
        console.error(error);
    }
}

//Calling the function to execute content inside function
//This checks if the data has been fetched and if true displays it as been fetched
//then function triggers event when a promise is (fulfilled or rejected) - syntax .then(fulfilled,rejected)

async function fetchAllData(){// Made this easier to manage 
    for(let a=0;a<4;a++){//added 3 cause i know the length of website links and websitlinks.length only gave dataset of first item
        const payloadDataset= await getDataSet(websiteLinks,a);//await for promise which is data fetched from website
        if (payloadDataset) {
            console.log("Dataset", a, "has been retrieved.");
        }
    }
}

//making function global
window.fetchAllData=fetchAllData;
//fetchAllData();

