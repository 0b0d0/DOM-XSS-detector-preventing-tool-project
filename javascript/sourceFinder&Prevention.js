/*Sources wehre the attack occurs by placing the sink in the source
[""] allows it look for each element that uses the source
and it applies to jquery style selectors*/

//this rray contains commands that contain values
const otherSources = [document.URL, document.documentURI, document.URLUnencoded, document.baseURI,
     location, location.href, location.search, location.hash, location.pathname, document.cookie, 
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
function searchForSources(sources,li){
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
function getScriptTags(elementsArray){
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
 function joinNodeLists(sourceHolder,container){
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
            } else if (container.includes(sourceHolder[z][y])){
                var index=container.indexOf(sourceHolder[z][y]);
                //remove item by splicing
                container.splice(index,1); //removes element if already found in the array
            }
        }
    }
    return container;
}
//the elements are seperate arrays to be analysed and the function combines the node lists into one ARRAY


function prevention(element){//if dangerous label is found this function is called
    /*loop through each item in the source list*/
    //getting all
    let allElements;
    let sanitizedHTML; //intialise variable

    //using pattern to check if script tag is typed dodgy
    const scriptTagPattern = /&lt;script\b[^&gt;]*&gt;([\s\S]*?)&lt;\/script&gt;|&lt;script\b[^&gt;]*&gt;[\s\S]*?&lt;\/script|&lt;script\b[^&gt;]*&gt;|<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*>/i;
    // if element is a string
    if (typeof element === 'string') {//assuming string will only apply to script tags or any source that produces a string output
        if(scriptTagPattern.test(element)){// if a pattern found is true
         let javaScriptTags=document.querySelectorAll('script'); // Get all script tags
        javaScriptTags.forEach(script=>{
            if(script.outerHTML===element){// if match is found with element update the value with sanitized tag
                script.outerHTML=DOMPurify.sanitize(element);
                console.log("Sanitized the script tag: ",script, " ",script.outerHTML);
            }   
        })
        }else{ //if it does not match script tag pattern
            console.log("This is not a DOM element",element);
            console.log("Sanitizing element ...");
            sanitizedHTML=DOMPurify.sanitize(element); //sanitise element
            element=sanitizedHTML;//replace former element with sanitised element
            console.log("sanitised element",element);
        }
        
    }
    
    else if((element instanceof HTMLElement)){ // if it is a html DOM element should be for HTML events
        allElements=document.querySelectorAll(htmlSources); //gets elements that use sources in the given variable
        console.log("The element is a DOM element: ",element);
        console.log("Sanitizing element ...");
        
        //using DOMParser to convert string to DOM element
        const parser=new DOMParser;
        
        for(x=0;x<allElements.length;x++){//loop through allElements
            //need to sort this out cause i do not want a string being put in the new element i want a dom element
        if(allElements[x].isEqualNode(element)){// if a match is found
            //parse string to document object
            const parseDoc=parser.parseFromString(DOMPurify.sanitize(element.outerHTML),"text/html");
            //get elemets from parse documents body
            const parsedElement=parseDoc.body.children; //get parsed element
            
            if(parsedElement.length>0){//check if parsedElement has any children
                allElements[x].replaceWith(parsedElement);//replace the outer element
                console.log("Element was replaced",allElements[x]);
            } else if(parsedElement.length==0){
                console.warn("Parsed element is empty, cannot replace: ",allElements[x]);
            }
        }
       
    }
    }
    //this should be for the source in the otherSources array that is a location object
    else if(element instanceof Location){ //if element is a location object
        let newLink=DOMPurify.sanitize(element.href);
        element.href=newLink;//replacing old link with sanitised link
        console.log("Element is a location object, converting to string ...: \n",
        "\n here is the sanitised link",element.href);
        //converting location object string and sanitising the location string
    }
    
}

/*DOM observer allows the code to check for any changes in the web page source code*/
function observeWebpage(){ //this function works
    const bodyObserver = new MutationObserver((mutations) => { //intialise mutation object
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'attributes'
                || mutation.type==='subtree' ||mutation.type==='characterData') {
                //if true function triggers
                console.log("Changes detected in the web page");

                htmlHolder=searchForSources(htmlSources,foundHtmlSources); //THIS ALSO stores the values in the array that stores node lists(sub arrays)
                htmlElements=joinNodeLists(htmlHolder,seperateHtmlArray);//stores the DOM elements of the webpage
                scriptTag=getScriptTags(scriptElements); //store script tags

                window.processPayloads(window.allSources,window.models);   //process elements function
    
                    
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

let htmlHolder;
let htmlElements;
let scriptTag;
/*Where main program starts */
async function main(){
    let allSources;//combing the two arrays with the sources
    
     htmlHolder=searchForSources(htmlSources,foundHtmlSources); //THIS ALSO stores the values in the array that stores node lists(sub arrays)
     htmlElements=joinNodeLists(htmlHolder,seperateHtmlArray);//stores the DOM elements of the webpage
     scriptTag=getScriptTags(scriptElements); //store script tags

    window.otherSources=otherSources.filter(item => item !== undefined);//make global and filter out undefined elements
    window.scriptTag=scriptTag; //make global
    window.htmlElements=htmlElements; //make global
    window.prevention=prevention;
    allSources=[...window.htmlElements,... window.otherSources,...scriptTag];//use spread operator
    window.allSources=allSources;// make global

    observeWebpage(); //observe for changes in web page
}
main(); //calling the function twice to intialise the variables in the function to be used in the other file
window.main=main; //making it global




