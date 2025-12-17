/*sinks for wehre the attack occurs

[""] allows it look for each element that uses the source*/

const htmlSources = [
    "[href]",            // For <a href=''>
    "[src]",             // For <img src=''>, <iframe src=''>
    "[innerHTML]",      // For setting HTML content
    "[outerHTML]"      // For outer HTML manipulation
];

const jsSources = [
    "[eval]",           // Executes a string as JavaScript
    "[setTimeout]",     // Executes code after a delay, can take a string
    "[setInterval]",    // Repeats execution of code at intervals, can take a string
    "[onclick]",        // Inline event handler
    "[onload]"        // Inline event handler for window load
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

//these only store one array with node lists i want to make each source have its own seperate array to compare
const foundHtmlSources=[]; 
const foundJavascriptSources=[];

/*this stores the sources as well as the elemnts that use them but that contains an array with many arrays inside the one array
so i try it make easier to  manage*/
function searchForSources(sources,li){
    /*loop through each item in the source list*/
    //getting all
    let allElements;
    for(x=0;x<sources.length;x++){
        allElements=document.querySelectorAll("*"+sources[x])
        li.push(allElements);
    }
    return li //stores the values in the array that stores node lists
}


let htmlHolder=searchForSources(htmlSources,foundHtmlSources); //THIS ALSO stores the values in the array that stores node lists
//using flat function with INIFINITY combine sub arrays into one array
//console.log("Elements that use the html sources",htmlHolder.flat(Infinity));  //does not flatten the way i wanted it TO
let javascriptHolder=searchForSources(jsSources,foundJavascriptSources);
//console.log("Elements that use the following javascript source",javascriptHolder);
//console.log("Elements that use the following html source",htmlHolder);


//trying break down list into seperate list
const seperateHtmlArray=[];
const seperateJavascriptArray=[];

 function joinNodeLists(sourceItems,sourceHolder,container){
    for(z=0;z<sourceHolder.length;z++){
        for(y=0;y<sourceHolder[z].length;y++){
            //accesses each item in the node list
            //console.log(sourceHolder[z][y])
            //storing the node list into a seperate list to make them easy to check
            //check if a node list is empty
            
            container.push(sourceHolder[z][y]);
            

        }
    }
    return container;
}
let jsElements=joinNodeLists(jsSources,javascriptHolder,seperateJavascriptArray);
let htmlElements=joinNodeLists(htmlSources,htmlHolder,seperateHtmlArray);
console.log("Here is the array combined with the node lists length of javascript elements",jsElements);
console.log("Here is the array combined with the node lists length of html elements",htmlElements);

//getDataSet(websiteLinks);
const test='alert("XSS")';



