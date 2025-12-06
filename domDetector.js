
function regExpDetection(){

    /* checks if the script tag is present using regular expression
    i means incase sensitive
    \s* means to match 0 or more space characters around the script tag
    'script' means to match script
    '< match opening angle bracket' 
    '[^>]*' match any character except'>'
    '>' match closing angle bracket*/
    //expression for script tag
    const CaseInsensitivesimpleRegEx=/<\s*script\s*[^>]*\/?>/i;

    const input='<    script type="text/javascript" >';//input of a string

    //returns true or false value if the script tag exists
    /*checks if the regular expressions are in the 
    string with 0 or more changes to RegEx */
    return CaseInsensitivesimpleRegEx.test(input);
}
//displays result
let checker=regExpDetection();
console.log(checker);



