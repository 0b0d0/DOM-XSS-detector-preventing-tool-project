/*this file is for storing the datasets into a json file */
const http=require('http');//get http service

const server=http.createServer((req,res)=>{
    //set response http with http status and content type
    res.writeHead(200,{'Content-Type':'text/plain'});

    //send response
    res.end("Hi client user\n");
});


//define port
const port=2555;

//start server and listen on port
server.listen(port,()=>{
    console.log('Server running on local host');
})
