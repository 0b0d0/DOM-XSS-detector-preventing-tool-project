/*global set to store contents in script tags */
let infoOnScriptTags= new Set();

//These make the webpage to display url and cookie infor
//and the string
console.log("Testing this function");
/*alert does not work in terminal only on web page*/
//alert(document.URL); //displays a pop up on browser
//alert(document.cookie); //displays a pop up on browser

function regExpDetection(){

    /* checks if the script tag is present using regular expression, i means incase sensitive,
    \s* means to match 0 or more space characters around the script tag, 'script' means to match script
    '< match opening angle bracket','[^>]*' match any character except'>','>' match closing angle bracket*/

    //expression for script tag
    const CaseInsensitivesimpleRegEx=/<\s*script\s*[^>]*\/?>/i;

    const input='<    script type="text/javascript" >';//input of a script tag as a string

    //returns true value if the script tag can be read 
    /*checks if the regular expressions are in the 
    string with 0 or more changes to RegEx */
    return CaseInsensitivesimpleRegEx.test(input);
}
//displays result
let checker=regExpDetection();
console.log(checker);

//trying to detect script tags
function detectTags(){
    //gets all script tags
    let scriptTags=document.querySelectorAll('script');
    scriptTags.forEach(script=>{
        //console.log(script.src);//logs source file of javascript
        //console.log(script.innerHTML);//gets content in the tag
        infoOnScriptTags.add(script.innerHTML);//adding script tags to set
    })
}
//calling function
detectTags(); //this works
console.log(infoOnScriptTags);
