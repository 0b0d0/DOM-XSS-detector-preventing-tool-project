/*sinks for wehre the attack occurs

[""] allows it look for each element that uses the source*/

const htmlSources = [
    "[href]",            // For <a href=''>
    "[src]",             // For <img src=''>, <iframe src=''>
    "[src]",             // Could also include <iframe src=''>
    "[innerHTML]",      // For setting HTML content
    "[outerHTML]"      // For outer HTML manipulation
];

const jsSources = [
    "[eval]",           // Executes a string as JavaScript
    "[setTimeout]",     // Executes code after a delay, can take a string
    "[setInterval]",    // Repeats execution of code at intervals, can take a string
    "[onclick]",        // Inline event handler
    "[onload]"         // Inline event handler for window load
];
//css may not work so i will stick with html and javascript for now
const cssSources = [
    "background-image", // Can take URLs, potentially dangerous
    "expression",       // (Only in older IE versions)
    "style"             // Any inline style attribute that can take user input
];

const sourceCalls={};


function isItSuspicous(input){
    /*there is alot of data in the innerHTML*/
   try{
    
    /**/
   }catch(error){
    console.error(error);
   }
}

let foundSources=[];
let htmlSet={};
/*this stores the sources as well as the elemnts that use them */
function searchForSources(sources){
    /*loop through each item in the source list*/
    //getting all
    let allElements;
    for(x=0;x<sources.length;x++){
        allElements=document.querySelectorAll("*"+sources[x])
        foundSources.push(allElements);
    }
    return foundSources //stores the values in the array that stores node lists
}


let htmlHolder=searchForSources(htmlSources); //THIS ALSO stores the values in the array that stores node lists
//using flat function with INIFINITY combine sub arrays into one array
console.log("Elements that use the html sources",htmlHolder.flat(Infinity));  //does not flatten the way i wanted it TO
let javascriptHolder=searchForSources(jsSources);
//console.log("Elements that use the following javascript source",javascriptHolder);

//getDataSet(websiteLinks);
const test='alert("XSS")';



