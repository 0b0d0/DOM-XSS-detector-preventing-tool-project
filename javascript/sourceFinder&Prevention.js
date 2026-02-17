/*Sources wehre the attack occurs by placing the sink in the source
[""] allows it look for each element that uses the source
and it applies to jquery style selectors*/

//this rray contains commands that contain values
const otherSources = [document.URL, document.documentURI, document.URLUnencoded, document.baseURI,
     location.href, location.search, location.hash, location.pathname, document.cookie, 
     document.referrer, window.name];
     
//most of the sources output data types that are strings
//only one of them displays Location object

const htmlSources = [ //query selector function returns elemets using this format [source]
    "[href]","[src]","[onclick]","[onload]","[onkeydown]","[onmousedown]","[onerror]",
    "[ondrag]","[oncopy]","[onmouseover]","[onloadstart]","[style]","[iframe]"          
];

//these only store one array with node lists i want to make each source have its own seperate array to compare
const foundHtmlSources=[]; 

/*this stores the sources as well as the elemnts that use them but that contains an array with many arrays inside the one array
so i try it make easier to  manage

it gets the elements that use the selected sources depending on the source array chosen*/
async function searchForSources(sources,li){
    /*loop through each item in the source list*/
    //getting all
    let allElements;
    for(x=0;x<sources.length;x++){
        allElements=document.querySelectorAll("*"+sources[x])/*stores elements that have use a certain source*/
        li.push(allElements);
    }
    return li //stores the values in the array that stores node lists
}

let scriptElements=[]; //array to store script tags
async function getScriptTags(elementsArray){
    const scriptTags=document.querySelectorAll("script"); //gets every script tag
    for(x=0;x<scriptTags.length;x++){
        //check if script tags content is short
        let content =scriptTags[x].textContent; //stored as a string
        if(!elementsArray.includes(scriptTags[x].outerHTML)){//prevent copies of the same data
            if(content.length<=50){
            elementsArray.push(scriptTags[x].outerHTML); //push script tag into elements array
        } //insert full element with opening and closing tags as a string   
        
        }
    }
    return elementsArray; //stores the values in the array that stores node lists
}

//These values store the elemets that use the sources but the elements are stored in seperate arrays inside the one array

//trying break down list into seperate list
const seperateHtmlArray=[];

//this functions combines the sources for each categratory into one array because the previous list contains sub lists
 async function joinNodeLists(sourceHolder,container){
    //if it will called again i must make sure 
    // the same elements are not being checked every call back

    /*array length is but it has other lists inside etc:
     array [node list1, node list 2]*/
    for(z=0;z<sourceHolder.length;z++){
        for(y=0;y<sourceHolder[z].length;y++){
            //accesses each item in the node list
            //storing the node list into a seperate list to make them easy to check
            //these if statement do not do what i wanted
            if(!container.includes(sourceHolder[z][y])){
                //if container does not cotain this element add it inside
                container.push(sourceHolder[z][y]);
            } 
        }
    }
    return container;
}
//the elements are seperate arrays to be analysed and the function combines the node lists into one ARRAY

function replaceValuesInOtherSources(item){//returns the sanitised value in the array
    let sanitisedVersion;
    //get item of item in the array and replace it with sanitised version
    sanitisedVersion=otherSources[otherSources.indexOf(item)]=DOMPurify.sanitize(item);
    return sanitisedVersion;
}


async function prevention(elements){//if dangerous label is found this function is called
    /*loop through each item in the source list*/
    //getting all
    let allElements;
    let sanitizedHTML; //intialise variable
    const scriptTagPattern = /<script\b[^>]*>|<\/script>/i; // Regex for <script> or </script>
    
    if(elements.length===0){
        console.log("No dangerous XSS commands found");
    }else{
        for(let element of elements){//loop through array of dangerous commmands
        if(otherSources.includes(element)){// if element is in the other sources array
        console.log("Sanitized this element: ",replaceValuesInOtherSources(element));
    }
    
    else if((element instanceof HTMLElement || element instanceof SVGElement)){ // if it is a html DOM element, SVG Element or Location object
        console.log("Dealing with this element...");
        Array.from(element.attributes).forEach(attr => {//loop through each attribute
            element.removeAttribute(attr.name);
        });
        console.log("All attributes removed from the element.");

        // no match needs to be done cause it is being done on DOM nodes
        //this means there is no need to check for equality
        //and any changes will change the original node
               
    }else{ //if both of those statements are false assuming it is a string and contains javascript
        let javaScriptTags=document.querySelectorAll('script'); // Get all script tags
        javaScriptTags.forEach(script=>{
            if(script.outerHTML.trim()===element.trim()){// if match is found with element update the value with sanitized tag
                script.outerHTML=DOMPurify.sanitize(element.trim()); //sanitisation fremoves the script tag
                console.log("Sanitized the script tag by removing it: ",script);
            }   //trim removes whitespace
        })
    }
    }
    }
    
}

/*DOM observer allows the code to check for any changes in the web page source code*/
function observeWebpage(){ //this function works
    const bodyObserver = new MutationObserver((mutations) => { //intialise mutation object
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'attributes'
                || mutation.type==='subtree' ||mutation.type==='characterData') {
                //if true function triggers
                console.log("Change in the web page source code has been detected");
            
            }
        });
    });

    bodyObserver.observe(document.documentElement, { /*documentElement allows it scan every thing in the HTML*/
        childList: true, //watch children
        attributes: true, //watch for attribute changes
        subtree: true, // Observe all descendants of the <body>
        characterData: true //watch for changes in character data
    });
}

//done this so the variables are easier to access and change values when needed
let htmlHolder;
let htmlElements;
let scriptTag;
let allSources;//combing the two arrays with the sources

async function arrangeTheSources(){
    htmlHolder=await searchForSources(htmlSources,foundHtmlSources); //THIS ALSO stores the values in the array that stores node lists(sub arrays)
    htmlElements=await joinNodeLists(htmlHolder,seperateHtmlArray);//stores the DOM elements of the webpage
    scriptTag=await getScriptTags(scriptElements); //store script tags

    //remove undefined and empty
    window.otherSources=otherSources.filter(item => item !== undefined && item!=='');//make global and filter out undefined elements
    window.scriptTag=scriptTag; //make global
    
    window.htmlElements=htmlElements; //make global
    
    window.prevention=prevention;
    allSources=[...window.htmlElements,... window.otherSources,...scriptTag];//use spread operator
    window.allSources=allSources;// make global

}

/*Where main program starts */
async function main(){
    await arrangeTheSources(); // wait for this to finish before calling next function
    window.runPrediction(window.allSources); // Call runPrediction with allSources
    observeWebpage(); //observe for changes in web page

    // Now trying to display number of all the elemenets that were scanned based on all sources length
    chrome.storage.local.set({ sourcesCounter: window.allSources.length }, function() {
        console.log("Number of sources that have been analysed are saved to storage:", window.allSources.length);
        //when the info is stored something is logged
        });
        //each time this function is called the value will refresh to become a new value
}
main(); //calling the function twice to intialise the variables in the function to be used in the other file

// Set an interval to call the main function every 2 minutes (120000 milliseconds)
setInterval(main, 120000);



