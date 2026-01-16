/*this file fetches dom xss payloads
using fetch command.*/

 const websiteLinks=["https://raw.githubusercontent.com/adham-hashem/XSS-payloads/main/Payloads.txt"
];


async function getDataSet(url,num){
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
        //storing payload in local storage
        localStorage.setItem('payloadDataset'+num,JSON.stringify(payloadDataSet));

        return payloadDataSet;

    }catch (error){
        alert("Error fetching dom xss payload dataset: ",error);
    }
}

//Calling the function to execute content inside function
getDataSet(websiteLinks, 0).then(payloadDataSet => {
    if(payloadDataSet){
    // store result in golbal variable
    // Now it should have the data
        //console.log(payloadDataSet);
        console.log("Checking if i really imported this");
    }
});




