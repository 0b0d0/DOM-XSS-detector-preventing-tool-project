/*this fetches dom xss payloads using fetch command.*/

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
                    //console.log(payloadDataSet);
                   

            })

        }
        
    }catch (error){
        alert("Error fetching dom xss payload dataset")
    }
}

//get HTML content of web page
//const HTMLContent=document.documentElement.innerHTML;
//These make the webpage to display url and cookie infor
//and the string
console.log("Testing this function");

function detectSources(){
    //try catch error
   try{
    
   
   }catch(error){
    console.error(error);
   }
}
detectSources();
getDataSet(websiteLinks);
