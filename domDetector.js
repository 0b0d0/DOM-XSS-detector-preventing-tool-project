/*sinks */
sinks=["alert","eval","fetch","document.cookie","document.write","prompt","attr",
    "document.location"
];

//using either one of them
const sinksRegex = new RegExp(`\\b(${sinks.join("|")})\\s*[^)\\s]*`, 'g');
const improvedSinksRegex = new RegExp(
    `\\b(?:${sinks.join("|")})\\s*\\([^()]*\\)|` +  // Function calls
    `\\b(?:${sinks.join("|")})\\s*=[^;]*|` +        // Assignments
    `\\b(?:${sinks.join("|")})\\s*\\([^)]*[^()]*\\)|` + // Nested function calls
    `\\b(?:${sinks.join("|")})\\s*\\+\\s*["']|` +   // String concatenation
    `\\b(?:${sinks.join("|")})\\s*\\s*[^.;]+`,       // Any other usage forms
    'gi'  // Flags: g (global), i (case-insensitive)
);

//AN IMPROVED sinksRegex will test later


const plainHtmlSources=["href","src","onclick", "onload","onkeydown","onmousedown","onerror",
    "ondrag","oncopy","onmouseoever","onloadstart"];
const plainCssSources=["background-image","expression","style"
];

/*Sources wehre the attack occurs by placing the sink in the source
[""] allows it look for each element that uses the source
and it applies to jquery style selectors*/

const htmlSources = [
    "[href]","[src]","[onclick]","[onload]","[onkeydown]","[onmousedown]","[onerror]",
    "[ondrag]","[oncopy]","[onmouseover]","[onloadstart]"           
];

//css may not work so i will stick with html and javascript for now
const cssSources = [
    "[background-image]","[expression]","[style]"             
];


/*functions   */

//these only store one array with node lists i want to make each source have its own seperate array to compare
const foundHtmlSources=[]; 
const foundJavascriptSources=[];
const foundCssSources=[];

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

//These values store the elemets that use the sources but the elements are stored in seperate arrays
let htmlHolder=searchForSources(htmlSources,foundHtmlSources); //THIS ALSO stores the values in the array that stores node lists

let javascriptHolder=searchForSources(jsSources,foundJavascriptSources);
let cssHolder=searchForSources(cssSources,foundCssSources);


//trying break down list into seperate list
const seperateHtmlArray=[];
const seperateJavascriptArray=[];
const seperateCssArray=[];

//this functions combines the sources for each categratory into one array
 function joinNodeLists(sourceHolder,container){
    /*array length is but it has other lists inside etc:
     array [node list1, node list 2]*/
    for(z=0;z<sourceHolder.length;z++){
        for(y=0;y<sourceHolder[z].length;y++){
            //accesses each item in the node list
          
            //storing the node list into a seperate list to make them easy to check
            //check if a node list is empty
            
            container.push(sourceHolder[z][y]);
            

        }
    }
    return container;
}
//the elements are seperate arrays to be analysed and the function combines the node lists into one ARRAY
let jsElements=joinNodeLists(javascriptHolder,seperateJavascriptArray);
let htmlElements=joinNodeLists(htmlHolder,seperateHtmlArray);
let cssElements=joinNodeLists(cssHolder,seperateCssArray);

/*console.log("JavaScript sources",jsElements);
console.log("Html sources",htmlElements);
console.log("CSS sources",cssElements);*/

/*trying tp get script tag becuase this is a hard source to check */
/*trying tp get script tag becuase this is a hard source to check */
function detectContentFromScriptElement(){
    const scriptTags=document.querySelectorAll("script");
    let arr=[];
    scriptTags.forEach((script)=>{//check if script content is null and see if it matches regular expressions
        arr.push(script.textContent.split(", "));
        //text context contains the syntax inside the script tags etc <script>console.log("bye")</script>
        /*if(script.textContent!==null){
            if(improvedSinksRegex.test(script.textContent)){
                console.log("Payload found at",script.textContent);
                //encoding is done to prevent the dom payload from executing
                console.log("Script tag text content after being encoded", 
                btoa(String.fromCharCode(...new TextEncoder().encode(script.textContent)))); //this works

            }
        }*/

    })
    return arr

}
let foundScripts=detectContentFromScriptElement();

/*this search through each item of the array, because the array stored contains sub arrays which contain elements.
so eq=ach item in the sub array need to be checked*/
function findSuspiciousScripts(scripts){
    //console.log(scripts);
    let flattenArray=scripts.flat(); /*Flat combines sub arrays into single array*/
    console.log(flattenArray);
}


//this needs to check for the value of the sources based on the array of xss sources
function detectSinks(sourceArray,sources){
    for(k=0;k<sourceArray.length;k++){
        //console.log("Element",k,sourceArray[k]);
       try{
            //const attributeValue=sourceArray[k].getAttribute(sources[a]);
            //if(sourceArray[k]!==null){//is attribute value empty
                if(sinksRegex.test(String(sourceArray[k]))){ 
                            //checking attribute value matches the pattern with the sinks regular expression 
                    console.log("Found dom xss payload at",sourceArray[k]);
                            //encoding is done to prevent the dom payload from executing
                    console.log("Element tag attribute after being encoded",btoa(sourceArray[k]));
                    //if i want to rpevent the xss by removing the element
                    //sourceArray[k].remove()
            
            } 

            //}
           
        }catch(error){
                console.error("Could not process",sourceArray[k],"Error: ",error);
            }
    }
   
}

/*Would like to call main function every x minutes */

/*Where main program starts */
function main(){

    /*detectSinks(jsElements,plainJsSources);
    detectSinks(cssElements,plainCssSources);
    detectSinks(htmlElements,plainHtmlSources);
    detectContentFromScriptElement();*/
    //i THINK setting the array lengths to zero worked

    console.log("JavaScript sources",jsElements[0]);
    console.log("Html sources",htmlElements[0]);
    console.log("CSS sources",cssElements[0])

}
main();











