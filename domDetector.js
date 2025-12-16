/*sinks for wehre the attack occurs*/
const htmlSinks = [
    "href",            // For <a href=''>
    "src",             // For <img src=''>, <iframe src=''>
    "src",             // Could also include <iframe src=''>
    "innerHTML",      // For setting HTML content
    "outerHTML",      // For outer HTML manipulation
    "document.write"   // Directly writing to HTML
];

const jsSinks = [
    "eval",           // Executes a string as JavaScript
    "setTimeout",     // Executes code after a delay, can take a string
    "setInterval",    // Repeats execution of code at intervals, can take a string
    "innerHTML",      // Can set HTML content from user input
    "outerHTML",      // Similar to innerHTML but affects the entire element
    "document.write",  // Writes HTML directly
    "onclick",        // Inline event handler
    "onload"         // Inline event handler for window load
];

const cssSinks = [
    "background-image", // Can take URLs, potentially dangerous
    "expression",       // (Only in older IE versions)
    "style"             // Any inline style attribute that can take user input
];




function isItSuspicous(input){
    /*there is alot of data in the innerHTML*/
   try{
    
    /**/
   }catch(error){
    console.error(error);
   }
}

function searchSources(elements){
    elements.forEach(element => {
        //display tag name of each source
        console.log("Found",element.tagName)
    });
}
searchSources(sources);
//getDataSet(websiteLinks);
const test='alert("XSS")';

