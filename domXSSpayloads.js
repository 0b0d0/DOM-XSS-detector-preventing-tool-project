/*this file fetches dom xss payloads
using fetch command.*/

const websiteLinks=["https://raw.githubusercontent.com/adham-hashem/XSS-payloads/main/Payloads.txt"];
let retrieved=false;


function getDataSet(url){
    //datasets numbered according to how many links there are
        let payloadDataSet;
    //trying to get data from website
    try{
        for(let a=0;a<url.length;a++){ //for loop to loop through websites to collect data set of dom xss payloads
            fetch(url[a])
            .then(response=>response.text())
            .then(data=>{
                
                    console.log("Succesful getting payload dataset added to list from",url[a])
                    //divides string into list
                    //displaying the data as a list due to split function and storing the list
                    payloadDataSet=data.split("\n");
                    console.log(payloadDataSet);

            })

        }
        
    }catch (error){
        alert("Error fetching dom xss payload dataset")
    }
}

/*will try to store dataset into a large database
using the indexed DB database
will request to open the database*/
/*function openDataSet(){
    let db;
    const request=window.indexedDB.open("PayloadsDatabase");
    request.onerror=(event)=>{
        console.error("Not allowed to use IndexedDB");
    };
    request.onsuccess=(event)=>{
        db=event.target.result;
        console.log("success")
    };
}*/

//openDataSet();
getDataSet(websiteLinks);
