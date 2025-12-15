/*this fetches dom xss payloads using fetch command.*/

const websiteLinks=["https://raw.githubusercontent.com/adham-hashem/XSS-payloads/main/Payloads.txt"];
let retrieved=false;
let payloadDataSet=[];

function getDataSet(url, list){
    //trying to get data from website
    try{
        for(let a=0;a<url.length;a++){ //for loop to loop through websites to collect data set of dom xss payloads
            fetch(url[a])
            .then(response=>response.text())
            .then(data=>{
                
                    console.log("Succesful getting payload dataset added to list from",url[a])
                    //divides string into list
                    //displaying the data as a list due to split function and storing the list
                    console.log(data.split("\n"));

                   
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

function detectPayloads(listOfPayloads){
    var allElements=document.getElementsByTagName('*'); //contains all tags and their content
    const d= new Date();
    //try catch error
    /*there is alot of data in the innerHTML*/
   try{
     Array.from(allElements).forEach(element => {
        listOfPayloads.forEach(payload=>{
            if(element.innerHTML.includes(payload)){
                console.log(payload,"detected at",element.innerHTML);
            } else{
                console.log("None detected")
            }
        });
        });
   }catch(error){
    console.error(error);
   }
}

getDataSet(websiteLinks);
