
/*common sinks list where payload can be executed*/
const commonSinks=["alert","document\\.write","document\\.writeln",
    "javascript:","innerHTML","eval","document\\.cookie"]; 
/*list for sources which is the input where 
payload is executed*/
const sources=["href","src","script ","oneerror=","onmouseover"];

//get HTML content of web page
const HTMLContent=document.documentElement.innerHTML;
//These make the webpage to display url and cookie infor
//and the string
console.log("Testing this function");

function detectSources(HTMLContent,sources){
    //try catch error
   try{
    //filters sources that are found into a list
    const foundSources=sources.filter(sources=>HTMLContent.includes(sources));
    //logs found sources
    //console.log(foundSources);
    return foundSources;
   }catch(error){
    console.error(error);
   }
}
detectSources(HTMLContent,sources);

function contentInSources(list,HTMLContent){
    
}
let li=detectSources(HTMLContent,sources);
contentInSources(li);
