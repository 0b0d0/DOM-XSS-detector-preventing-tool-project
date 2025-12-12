/*this file fetches dom xss payloads
using fetch command*/
let payloads=[];
const websiteLinks=["https://github.com/adham-hashem/XSS-payloads/blob/main/Payloads.txt"];
let retrieved=false;


function getDataSet(url){
  //trying to get data from website
    try{
        for(let a=0;a<websiteLinks.length;a++){ //for loop to loop through websites to collect data set of dom xss payloads
            fetch(url[a])
            .then(response=>response.text())
            .then(data=>{
                //logs data received
                //console.log(data);
                
                //console.log("Succesful getting payload dataset")
                /*checking if dataset exists*/
                if(url[0].includes(data)){
                    console.log("Data is already included")
                }else if(!url[a].includes(data)){
                    //add data to the array
                    payloads.push(data);
                    console.log("Succesful getting payload dataset added to list")
                    //console.log(data);   //just displaying the data
            }

            })

        }
        
    }catch (error){
        alert("Error fetching dom xss payload dataset")
    }
}

getDataSet(websiteLinks);

//console.log("List of payloads",payloads)
