

const plainJsSources=[ "onclick", "onload","onkeydown","onmousedown"
];
const plainHtmlSources=["href","src"];

/*Sources wehre the attack occurs by placing the sink in the source
[""] allows it look for each element that uses the source
and it applies to jquery style selectors*/

const htmlSources = [
    "[href]",            // For <a href=''>
    "[src]"             // For <img src=''>, <iframe src=''>
];


const jsSources = [
    "[onclick]",        // Inline event handler
    "[onload]",        // Inline event handler for window load
    "[onkeydown]",
    "[onmousedown]"
];
//css may not work so i will stick with html and javascript for now
const cssSources = [
    "background-image", // Can take URLs, potentially dangerous
    "expression",       // (Only in older IE versions)
    "style"             // Any inline style attribute that can take user input
];


/*functions   */

//these only store one array with node lists i want to make each source have its own seperate array to compare
const foundHtmlSources=[]; 
const foundJavascriptSources=[];

/*this stores the sources as well as the elemnts that use them but that contains an array with many arrays inside the one array
so i try it make easier to  manage

it gets the tags that use the selected sources*/
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
//the elements are their seperate arrays to be analysed and the function stores the array
let jsElements=joinNodeLists(jsSources,javascriptHolder,seperateJavascriptArray);
let htmlElements=joinNodeLists(htmlSources,htmlHolder,seperateHtmlArray);
/*console.log("Here is the array combined with the node lists length of javascript elements",jsElements);
console.log("Here is the array combined with the node lists length of html elements",htmlElements);*/

//this needs to check for the value of the sources based on the array of xss sources
function detectSinks(sourceArray,sources){
    for(k=0;k<sourceArray.length;k++){
        //console.log("Element",k,sourceArray[k]);
        for(a=0;a<sources.length;a++){
            if(sourceArray[k].getAttribute(sources[a])!==null){
                 console.log("Value of attribute",sources[a],"in",sourceArray[k], "is", sourceArray[k].getAttribute(sources[a]));
            }
           
        }
    }
}
//detectSinks(jsElements,plainJsSources);
detectSinks(htmlElements,plainHtmlSources);

//getDataSet(websiteLinks);
const test='alert("XSS")';


