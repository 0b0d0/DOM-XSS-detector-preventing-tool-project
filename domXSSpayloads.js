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
                //console.log(data.split("\n"));
                storeData(data.split("\n"),a)
            })
        }
        
    }catch (error){
        alert("Error fetching dom xss payload dataset")
    }
}

/*will try to store dataset into a large database
using the indexed DB database
will request to open the database*/

function storeData(list,count){
    //convert array to json string
    let jsonString=JSON.stringify(list);
    count=count=1 //every time it is called
    //store JSON string in session storage
    //check if item already exists
    if(sessionStorage.getItem("payloads"+count)==false){
        sessionStorage.setItem("payloads"+count,list); //this worked
    }else{
        console.log("Payload"+count, "already exists")
    }


}

function getData(num){
    //convert array to json string
    let key="payloads"+num;
    let jsonString=sessionStorage.getItem(key);
    if(jsonString!==null){
        return JSON.parse(jsonString);//changes format to array
    }
    
}

getDataSet(websiteLinks);

