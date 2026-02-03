/*sinks */
const sinks=["alert","eval","fetch","document.cookie","document.write","prompt","attr",
    "document.location","innerHTML,outerHTML","setAttribute","insertAdjacementHTML",
    "location.href"
];

/*Sources wehre the attack occurs by placing the sink in the source
[""] allows it look for each element that uses the source
and it applies to jquery style selectors*/

const htmlSources = [
    "[href]","[src]","[onclick]","[onload]","[onkeydown]","[onmousedown]","[onerror]",
    "[ondrag]","[oncopy]","[onmouseover]","[onloadstart]","[style]","[iframe]","[script]"           
];

const plainHtmlSources=["href","src","onclick", "onload","onkeydown","onmousedown","onerror",
    "ondrag","oncopy","onmouseoever","onloadstart","style","iframe","script"];

const plainHtmlSources=["href","src","onclick", "onload","onkeydown","onmousedown","onerror",
    "ondrag","oncopy","onmouseoever","onloadstart","style","iframe","script","xml, application/xml"];

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


/*functions   */

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

function prevention(elements){
    /*loop through each item in the source list*/
    //getting all
    let allElements=document.querySelectorAll("*")//gets all elements in the web page
    for(x=0;x<allElements.length;x++){
        if(allElements[x]==elements){
            allElements[x].replaceWith(elements);
            console.log("Element replaced",allElements[x]);
        }
       //console.log("Displaying text content of each element",content);
    }
    for(x=0;x<allElements.length;x++){//loop through allElements

/*DOM observer allows the code to check for any changes in the web page source code*/
function observeWebpage(){ //this function works
    const bodyObserver = new MutationObserver((mutations) => { //intialise mutation object
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'attributes'
                || mutation.type==='subtree' ||mutation.type==='characterData') {
                //if true function triggers
                console.log("Changes detected in web page");
                window.processPayloads(window.htmlElements,window.models); //MADE SURE THIS FUNCTION GETS CALLED TO DETECT FOR dangerous payload
                //console.log("HTML & CSS sources",window.htmlElements,"\n");
                    
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
    let htmlHolder=searchForSources(htmlSources,foundHtmlSources); //THIS ALSO stores the values in the array that stores node lists(sub arrays)
    let htmlElements=joinNodeLists(htmlHolder,seperateHtmlArray);
    window.htmlElements=htmlElements; //make global
    window.prevention=prevention;

    /*console.log("HTML WHERE XSS PAYLOADS HAVE BEEN FOUND")
    detectSinksWithRegExp(htmlElements,plainHtmlSources);
    console.log("JAVASCRIPT ELEMENTS");
    detectScriptsWithRegExp();*/

    //set up observer to add real time detection
    observeWebpage();
}
//main();
window.main=main;





