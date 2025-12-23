/*this file fetches dom xss payloads
using fetch command.*/

const websiteLinks=["https://raw.githubusercontent.com/adham-hashem/XSS-payloads/main/Payloads.txt",
    "https://raw.githubusercontent.com/payloadbox/xss-payload-list/master/Intruder/xss-payload-list.txt"
];


function getDataSet(url,num){
    //trying to get data from website
    try{
        return fetch(url[num]).then(response=>response.text()).then(data=>{
        console.log("Succesful getting payload dataset added to list from",url[num])
        //divides string into list
        //displaying the data as a list due to split function and storing the list
        payloadDataSet=data.split("\n");
        return payloadDataSet;
       
    })
        
        
    }catch (error){
        alert("Error fetching dom xss payload dataset")
    }
}
//variables to store datasets depending on if they come from diffrent web links
let updatedDataset1,updatedDataset2,updatedDataset3;
/*Gets data from function and passes it to  */
getDataSet(websiteLinks, 1).then(payloadDataSet => {
    // store result in golbal variable
    // Now it should have the data
    console.log(payloadDataSet);
    //updatedDataset1=console.log(payloadDataSet);
});
//console.log("New location to store paylaods from dataset",updatedDataset1);