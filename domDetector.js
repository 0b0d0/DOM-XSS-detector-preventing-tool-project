
/*common sinks list where payload can be executed*/
const commonSinks=["alert","document\\.write","document\\.writeln",
    "javascript:","innerHTML","eval"]; 

//These make the webpage to display url and cookie infor
//and the string
console.log("Testing this function");
/*alert does not work in terminal only on web page*/
//alert(document.URL); //displays a pop up on browser
//alert(document.cookie); //displays a pop up on browser

//trying to detect script tags
function detectSinks(){
    //get some elements in the document (webpage)
    //const vulnerableElements=document.querySelectorAll("input","textarea","div");

    //check for all elements on web page
    const vulnerableElements=document.querySelectorAll("*");
    //combine the regular expression
    const sinkPattern = new RegExp(
        commonSinks.join("\\s*\$.*?\$|") + "\\s*\$.*?\$|" + 
        commonSinks.join("\\s*\\s*") + "\\s*$",
        "i"
    );

    //Double for Loop
    vulnerableElements.forEach(element=>{
        const info=element.innerHTML;
        commonSinks.forEach(sink=>{
            if(info.includes(sink)){
                console.log(info,"is next to sink")
                console.log("Detected sink", sink,"may be dangerous")
            }
        })
    })
}
//calling function
detectSinks(); //this works

