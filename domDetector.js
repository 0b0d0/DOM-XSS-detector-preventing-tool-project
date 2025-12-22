
sinks=["alert","eval","fetch","document.cookie","document.write","prompt","attr",
    "$"
];
/*regular expression for sinks to detect if a string is found 
regular expression for base64 encoding as well*/
const sinksRegex = /\b(alert|eval|fetch|document\.cookie|document\.write|prompt|attr)\s*\(?.*?\)?\b/g;
const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;


const plainJsSources=[ "onclick", "onload","onkeydown","onmousedown","onerror"
];
const plainHtmlSources=["href","src"];
const plainCssSources=["background-image","expression","style"
];

/*Sources wehre the attack occurs by placing the sink in the source
[""] allows it look for each element that uses the source
and it applies to jquery style selectors*/

const htmlSources = [
    "[href]","[src]"             
];


const jsSources = [
    "[onclick]","[onload]","[onkeydown]","[onmousedown]","[onerror]"
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
//console.log("Elements that use the following javascript source",javascriptHolder);
//console.log("Elements that use the following css source",cssHolder);



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
//the elements are their seperate arrays to be analysed and the function stores the array
let jsElements=joinNodeLists(javascriptHolder,seperateJavascriptArray);
let htmlElements=joinNodeLists(htmlHolder,seperateHtmlArray);
let cssElements=joinNodeLists(cssHolder,seperateCssArray);
//console.log("JavScript sources",jsElements);

/*trying tp get script tag becuase this is a hard source to check */
function detectContentFromScriptElement(){
    const scriptTags=document.querySelectorAll("script");

    scriptTags.forEach((script)=>{//check if script content is null and see if it matches regular expressions
        if(script.textContent!==null){
            if(sinksRegex.test(script.textContent) ||base64regex.test(script.textContent)){
                console.log("Payload found at",script.textContent);
                //changing text content when found to prevent payload execution
                script.textContent='console.log("Change the value of the payload")';

            }
            

        }

    })

}
//detectContentFromScriptElement();

//this needs to check for the value of the sources based on the array of xss sources
function detectSinks(sourceArray,sources){
    for(k=0;k<sourceArray.length;k++){
        //console.log("Element",k,sourceArray[k]);
        for(a=0;a<sources.length;a++){
            try{
                const attributeValue=sourceArray[k].getAttribute(sources[a]);

                if(attributeValue!==null){//is attribute value empty
                    if(sinksRegex.test(attributeValue) || base64regex.test(attributeValue)){ 
                        //checking attribute value matches with the sinks regular expression or the base64 regular expression
                        console.log("Found dom xss payload at",sourceArray[k]);
                        //const cleanedValue=DOMPurify.sanitize(attributeValue);
                        //console.log("Element attribute after being santised",cleanedValue); //gets attribute
                        //when payload has been found it is santised
                        //replacing the ttribute
                        sourceArray[k].setAttribute(sources[a],"");
                        console.log("Element tag after being sanitised",sourceArray[k]);
            }
            } 

            }catch(error){
                console.error("Could not process",sourceArray[k],"Error: ",error);
            }
           
        }
    }
}

/*detectSinks(jsElements,plainJsSources);
detectSinks(cssElements,plainCssSources);
detectSinks(htmlElements,plainHtmlSources);*/
/*Would like to call function every x minutes */






