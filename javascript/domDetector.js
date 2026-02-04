/*sinks */
const sinks=["alert","eval","fetch","document.cookie","document.write","prompt"
];

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

const plainHtmlSources=["href","src","onclick", "onload","onkeydown","onmousedown","onerror",
    "ondrag","oncopy","onmouseoever","onloadstart","style","iframe"];


/*regular expression for sinks to detect if a string is found */
//using BOTH of them

// Build the regex for sinks  
const sinkPattern = sinks.map(sink => sink.replace(/([.*+?^${}()|[\]\\])/g, '\\$1')).join("|"); // Escape special characters

// Consolidated regex for detecting XSS payloads with and without attribute names
const htmlRegexPattern = new RegExp(
    `(?:\\b(?:[a-zA-Z-]+)\\s*=\\s*)?["']?\\s*(?:(javascript|vbscript|data|file|livescript|about|blob|ftp):[^"'>]+|[^"'>]*)?[^"'>]*(${sinkPattern})`, 
    'i'
);


const scriptTagsSinksRegex = new RegExp(
    `\\b(?:${sinks.join("|")})\\s*\\(` +                                  
    `([^()]*|\\([^()]*\\)|'[^']*'|"[^"]*")\\)|` +                       
    `\\b(?:${sinks.join("|")})\\s*=\\s*([^;]*?)(?:;|$)|` +              
    `\\b(?:${sinks.join("|")})\\s*\\+\\s*(['"])(.*?)(?:\\1|$)|` +      
    `\\b(?:${sinks.join("|")})\\s*\\+\\s*([^\\s;]+)` +                 
    `(?=[;\n]|$)`,                                                       
    'gi'   
);


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


/*trying tp get script tag becuase this is a hard source to check */
function detectScriptsWithRegExp(){
    const scriptTags=document.querySelectorAll("script");
    let x=0;
    try{
        scriptTags.forEach((script)=>{//check if script content is null and see if it matches regular expressions
        //text context contains the syntax inside the script tags etc <script>console.log("bye")</script>
        x++;
        if(script.textContent!==""){ /*check for empty string*/
            const matches=scriptTagsSinksRegex.test(script.textContent); /*For scrip tag*/
            //.exec(script.textContent)
            //matches[0]
            
            if(matches){
                console.log("Payload found",matches,"\n"); //match is like test but it returns the part of the code that is suspicious
                //encoding is done to prevent the dom payload from executing
                encodeNow=btoa(String.fromCharCode(...new TextEncoder().encode(script.textContent)));
                script.textContent=encodeNow;
                console.log("Script tag text content after being encoded", script.textContent,"\n");
        }}
    })
    }catch(error){
        console.log("Error occured",error);
    } 
}


//this needs to check for the value of the sources based on the array of xss sources
//loop through each element and checks the event id attribute value
function detectSinksWithRegExp(sourceArray,sources){
    for(k=0;k<sourceArray.length;k++){
        for(a=0;a<sources.length;a++){
            try{
            const attributeValue=sourceArray[k].getAttribute(sources[a]);//originally was meant to loop through teh source values
                if(htmlRegexPattern.test(attributeValue)){ 
                    //checking attribute value matches the pattern with the sinks regular expression 
                    console.log("Found dom xss payload at",attributeValue,"in",sourceArray[k]);
                    const encodedValue=btoa(attributeValue);
                    
                    //encoding is done to prevent the dom payload from executing and changing the original sourceArray value
                    //trying to set the new attribute value in the DOM   
                    sourceArray[k].setAttribute(sources[a],encodedValue);
                    console.log("Element after the attribute value was encoded",sourceArray[k]);
            }           
        }catch(error){
                console.error("Could not process",sourceArray[k],"Error: ",error);
            }
        }
}
}


function prevention(element){//if dangerous label is found this function is called
    /*loop through each item in the source list*/
    //getting all
    let allElements=document.querySelectorAll(htmlSources)//gets elements that use sources in the given variable
    let sanitizedHTML; //intialise variable

    // if element is not a html DOM element
    if (!(element instanceof HTMLElement)) {
        console.log("This is not a DOM element",element);
        console.log("Sanitizing element ...");
        sanitizedHTML=DOMPurify.sanitize(element); //sanitise element
        element=sanitizedHTML;//replace former element with sanitised element
        console.log("sanitised element",element);
    }
    
    else if((element instanceof HTMLElement)){ // if it is a html DOM element
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
                runPrediction(window.htmlElements);    
                runPrediction(window.otherSources);
                    
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

/*Where main program starts */
async function main(){
    let allSources;//combing the two arrays with the sources
    
    let htmlHolder=searchForSources(htmlSources,foundHtmlSources); //THIS ALSO stores the values in the array that stores node lists(sub arrays)
    let htmlElements=joinNodeLists(htmlHolder,seperateHtmlArray);//stores the DOM elements of the webpage
    window.htmlElements=htmlElements; //make global
    window.otherSources=otherSources.filter(item => item !== undefined);//make global and filter out undefined elements
    window.prevention=prevention;
    observeWebpage();
    allSources=[...window.htmlElements,... window.otherSources];//use spread operator
    window.allSources=allSources;// make global
}
main();
window.main=main;





