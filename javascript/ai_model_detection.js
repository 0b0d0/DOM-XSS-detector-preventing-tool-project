/*This file is to be used to used for detection afor xss
instead of using regular expression only for detection and encoding only for prevention*/
/*if a function is async has has an asynchronus nature without the async the logic cannot work */

//Adding patterns to train the models
const safePatterns = [
    /^<p>(?:[^<]*|<br\s*\/?>)*<\/p>$/, // Matches <p> tags containing safe text or <br> tags
    /^<div>(?:[^<]*|<br\s*\/?>)*<\/div>$/, // Matches <div> tags with safe content
    /^<span>(?:[^<]*|<br\s*\/?>)*<\/span>$/, // Matches <span> tags to ensure inline safe text
    /^<strong>(?:[^<]*|<br\s*\/?>)*<\/strong>$/, // Matches <strong> tags for bold text
    /^<em>(?:[^<]*|<br\s*\/?>)*<\/em>$/, // Matches <em> tags for emphasized text
    /^[a-zA-Z0-9\s]+$/, // Allows only alphanumeric input (including spaces)
    /^(hello|world|example|test)$/i, // Matches specific harmless words
    /^&lt;[^&]*&gt;$/, // Matches HTML encoded tags (like &lt;tag&gt;)
    /^<a\s+href="(https?:\/\/[^\s"']+)"[^>]*>([^<]*)<\/a>$/, // Matches <a> tags with clean URLs
    /^<img\s+src="(https?:\/\/[^\s"']+)"\s+alt="[^"]*"\s*\/?$/, // Matches <img> tags with valid src and alt attributes
    /^<ul>(<li>(?:[^<]*|<br\s*\/?>)*<\/li>)+<\/ul>$/, // Matches <ul> tags that contain <li> items with safe content
    /^<ol>(<li>(?:[^<]*|<br\s*\/?>)*<\/li>)+<\/ol>$/, // Matches <ol> tags with safe <li> items
    /^<blockquote>(?:[^<]*|<br\s*\/?>)*<\/blockquote>$/, // Matches <blockquote> tags with safe content
    /^<!--(?:[^-]|-\s?)*-->$/, // Matches HTML comments
    // Allow script tags that do not contain any harmful JavaScript
    /^<script\b[^>]*>(?:\s*|\s*\/\/.*?\s*|\/\*.*?\*\/|[^<>]*)<\/script>$/, // Safe script tags (allow empty or commented scripts)
    // or alternatively, just empty script tags
    /^<script\s*\/?>$/ // Matches empty <script> tags
];

const dangerousPatterns = /(?:\b(alert|eval|fetch|document\.cookie|document\.write|prompt|window\.location|innerHTML|outerHTML|setAttribute|insertAdjacentHTML|location\.href)\b|javascript:|data:|vbscript:|on\w+=)/i;
//Adding extra context-aware checks for potential malicious patterns
const obfuscatedDangerousPatterns = new RegExp(
    `(?:` +
    `(?:%3C|<).*?(?:%3E|>).*?(?:(?:document|window|eval|alert|write|cookie|location|innerHTML).*)` + // Matches obfuscated < and >
    `|(?:javascript:|data:|vbscript:).*?(?:<script(?:.*?)(?:<\\/script>)?)` + // Matches possibly malicious scripts (including obfuscated)
    `|(?:<[^>]*?on[a-z]+=[^>]*?)` + // Matches elements with JavaScript event handlers like onmouseover, onclick, etc.
    `)`, 'i'
);

arraysForData=['payloadDataset0','payloadDataset1','payloadDataset2','payloadDataset3'];
arraysForModelInStorage=["model1","model2","model3","model4"];


function getStoredData(item){ //if this is async it would wait for the promise of fetching all the data
    //using the key
    const storedData = localStorage.getItem(item); // Retrieve the string
    try{
        if (storedData) {//if found in storage
        const payloadDataSet = JSON.parse(storedData); // Parse the JSON string back to an array
        
        //decode each element to string
        const decodedDataset=payloadDataSet.map(encodedPayload=>
            decodeURIComponent(atob(encodedPayload))
        );
        return decodedDataset
    }
    }catch(error){
        console.error("Error parsing data set",error);//if error is found
        return [];
    }
} 


function collectDatasets(){
    //set dataSets
    let dataSets=[];
    for(const data of arraysForData){ // data is each item in arraysForData
        const dataset=getStoredData(data);//for each item call the function and waits for decodedDataset to be returned
        dataSets.push(dataset);
    }
    return dataSets;

}

function arrangeTrainingData(data){
    //makes arrays and for each payload
    //calculates the length as a feature and classifies payload as safe or dangerous
    const xs=[];//defines array to store feature data
    const ys=[];//defines array to store label data
    data.forEach(payload => {//loop through each payload in the provided array
        //assuming payload is string
        const length=payload.length; //length of payload string

        /*count of tokens or words in the payload*/
        //split payload by whitespace and count the elements
        const tokenCount=payload.split(/\s+/).length;

        //is payload matching at least one of the safe patterns - done with some function
        const isSafe=safePatterns.some(pattern=>
        typeof pattern==='string' ? payload.includes(pattern): // checks for strings and regular expressions
    pattern.test(payload));
    
    //check if payload is dangerous if it does not match the safe pattern
    //or matches a dangerous or obfuscated pattern
        const isDangerous=!isSafe && (dangerousPatterns.test(payload) ||
    obfuscatedDangerousPatterns.test(payload));//see if it matches the dangerous or obfuscated patterns
        xs.push([length,tokenCount]);

        //includes one hot encoding which converts data into numbers format
        ys.push(isSafe ? [1, 0, 0] : isDangerous ? [0, 1, 0] : [0, 0, 1]); // [safe, dangerous, neutral or unknown payload]
    });

    return{
        xs: tf.tensor2d(xs), // Features tensor
        ys: tf.tensor2d(ys) // Labels tensor
        
        //converts feature and label arrays to tensorFlow tensors
    };
}



//each dataset has a model
async function trainModel(dataSets){ //async returns a promise
    let completeCounter=0;//checks if training for each model is done
    const trainedPromises=[];//holds asynchronus training promises
    //for each calls a function for each item in array
    dataSets.forEach((data,index)=>{ //data is datsets
        //The trainng process
        const trainingData=arrangeTrainingData(data); //calls dataset to get formatted tensors
    
        //makes object for sequential model
    const model=tf.sequential();
    // Create a neural network architecture consisting of two layers:
    // - The first layer is a dense layer with 64 units and ReLU activation, 
    //   which processes the input features (length and token count) to extract
    //   patterns and relationships.
    // - The second layer is a dense layer with 3 units using softmax activation,
    //   which outputs probabilities for the three classification categories: 
    //   safe, dangerous, and neutral.
model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [2] }));
model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));

    //comiples prepares neural network for training
    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
    
    //this is the asynchronus part of the model
    //.fit function trains machine learning model on dataset
    const trainedPromise=model.fit(trainingData.xs,trainingData.ys,{
        epochs: 50,
        callbacks: {
            onEpochEnd: function(epoch, logs) {
                console.log("Epoch: " + epoch + ", Loss: " + logs.loss + ", Accuracy: " + logs.acc);
            }
        }
    }).then(() => { //uses the promise if it was successful
        console.log("Model training complete for the model",index+1);
        completeCounter++;//add counter by 1
        localStorage.setItem("model"+(completeCounter), JSON.stringify(model.toJSON()));
        if(completeCounter===dataSets.length){
            console.log("ALL MODELS TRAINED, READY TO COMBINE ");
        }
    }).catch(error => {
        console.error("Error during training:", error);
    });
    trainedPromises.push(trainedPromise);
    });
    //Promise.all() method returns a single Promise from a list of promises, when all promises fulfill
    await Promise.all(trainedPromises);
}

//passing datasets as a array into function parameter
//to run each dataSet and store them to combine them later


async function checkAndTrainModels() {
    //wait for returned array which promise
    let dataSets= collectDatasets();//using  array returned in function
    if(dataSets){//if true
        console.log("Datasets have been collected");
        
    }else{
        console.log("No datasets found");
    }
    
    
    if (checkModelsInStorage()==false) {
        console.log("No models found in local storage. Starting training models...");
        await trainModel(dataSets); // Call the trainModel function with the datasets
        //when the promise in the trainModel function is complete a statement is logged
        console.log("All models are now trained and stored in local storage.");
        
    } else {
         console.log("All models are already trained and stored in local storage.");
    }
}

function checkModelsInStorage(){
    return arraysForModelInStorage.every(modelName=>localStorage.getItem(modelName));
    //returns true of false if every model is in storage
}

//trying to load models from storage array to store models
let models=[];
// i know the length of the model array
async function loadModels(){
    if(models.length>0){
        return "Models have already been added";
    }else{
        for(z=1;z<4;z++){
        const modelData=JSON.parse(localStorage.getItem("model"+z));
        if(!modelData){
            console.error("Model data is not valid:", modelName);
            }
        //if false
        try {
            const modelParse = JSON.parse(modelData);
            // Reconstructing the model from JSON data
            const model = await tf.models.modelFromJSON(modelParse); //wait for promise
            models.push(model); // Add the model to the array
            } catch (error) {
            console.error("Error loading model", error);
            }
        }
        //outside loop
        z++;
        return models
    }
    

}


//trying to combine the models to get final predciton
//prediction will be used to check if the input matches is safe, dangerous or neutral

async function combineModels(models,inputData){//makes a prediction for one element
    // Ensure that models array is valid
    //console.log("Checking what is inside inputData: ",inputData);
    if (!models || models.length === 0) {
        throw new Error("No valid models available for prediction.");
    }else if(inputData.length===0){
        throw new Error("No valid input data available for prediction.");
    }
    // Get predictions from all models
    let predictions = await Promise.all(models.map(model => model.predict(inputData)));

    // Ensure all predictions are valid and have the same shape
    if (predictions.some(prediction => !prediction || prediction.shape.length !== 2)) {
        throw new Error("One or more predictions are invalid.");
    }

    // Assuming all predictions share the same shape, calculate the average
    const combinedPrediction = predictions.reduce((acc, curr) => acc.add(curr), tf.zeros(predictions[0].shape)).div(predictions.length);

    return combinedPrediction; // Returns combined prediction
}


//function to assign category for final prediction for one element
function assignCategory(prediction){
    const values=prediction.dataSync();//;Get value of regular array
    //arrays with the 3 numbers are from the categroy assignmenets given in
    //arrange training data function
    //check which values have the highest value
    if(values[0]>values[1]&& values[0]>values[2]){
        return { category: [1, 0, 0], label: "Safe" }; //is safe category
    } else if(values[1]>values[0] && values[1]>values[2]){
        return { category: [0, 1, 0], label: "Dangerous" }; //Dangerous category
    } else if(values[2]>values[0] && values[2]>values[1]){
       return { category: [0, 0, 1], label: "Neutral or Unknown" }; // neutral or unkown category
    } else{
        return { category: [0.5, 0.5, 0], label: "Ambiguous Result" }; //Unclear
    }
}

//this is incase the input parameter in processPayloads is not a string
//this was done so it can process trhe string of the DOM element so it does
//not break the program
function domElementToString(element){
    if(element instanceof HTMLElement){// is it a html element
            //return the full element tag
        return element.outerHTML; //outer html returns a string
    }else if(element instanceof Location){//if it is a string return
        return element.href;
    }else{
        return ""; //return empty string for invalid input
    }   
    } 


async function processPayloads(input,models){
    //return tf.tensor2d means a new tensor object is returned 
    const inputDataTensors = input.map(payload => { //loops through each item
    if (typeof payload === 'string') {//is the variable a string
        if(payload.length!==0){// if the payload is not empty
            return tf.tensor2d([[payload.length, payload.split(/\s+/).length]]);
        //this return statement allows predictions to be done on an element that is a string
        }
    } 
    else if(payload instanceof HTMLElement || payload instanceof Location){//checking if it is a  DOM element
        let payloadString=domElementToString(payload);//get html string
        return tf.tensor2d([[payloadString.length, payloadString.split(/\s+/).length]]);
         
        //this return statement allow prediction to be done on html elements
    }
    else {
        console.error("Invalid:", payload);
        //return tf.tensor2d([[0, 0]]); // Or handle as appropriate
    }
    }).filter(tensor => tensor !== undefined);//filtering out undefined values
    //inputDataTensors returns an array containing 2D tensors

    //iterate through each input in the array that will be predicted
    for(const inputData of inputDataTensors){
        const finalPrediction=await combineModels(models,inputData);//calls function which return value and //returns results from function
        //console.log("Final prediction for payload: ",finalPrediction); //may not need to log the object

        //assign a categroy based on prediction
        //finalprediction as the parameter
        const classfication=assignCategory(finalPrediction);
        //get original payload
        const originalPayload=input[inputDataTensors.indexOf(inputData)];//get index of value

        //checks if the data matches one of these labels

        if(classfication.label==="Dangerous"){ //awaits for promise then checks
            //display dangerous payload found
            console.log("Dangerous payload found",originalPayload);
            window.prevention(originalPayload);//calls this function which is from another file

        }else if( classfication.label==="Safe"){
            console.log("Element is safe",originalPayload);
        }else if(classfication.label==="Neutral or Unknown",originalPayload){
            console.log("Cannot classify what this is",originalPayload);
        }
    }
}


//making example array of payloads
let arrayOfPayloads=['<a href="data:text/html;base64_,<svg/onload=\u0061&#x6C;&#101%72t(1)>">X</a','<img src=xss onerror=alert(1)>'];

async function runPrediction(input){
    //console.log("Checking this function works",loadModels());
    //length of datasets is equal to length of models
    try {
        //calling the function from ther file
        await window.main(); // called to use the domDetector file before the other function in this file are called

        if(input.length==0){//if there is no data do nothing
        console.warn("There is no data to process");
    }else{
        await window.fetchAllData(); // Using await for cleaner promise handling

        await checkAndTrainModels(); // Wait for models to be trained

        const models = await loadModels(); // Load models only once
        //console.log("Checking if this works", models);
        
        // Process payloads with the loaded models
        //await processPayloads(arrayOfPayloads, models);
        await processPayloads(input, models);
        console.log("Processing complete. If any change in the web page occurs information will be logged.");
    }
        
    } catch (error) {
        console.error("Error during processing:", error); // Handle errors
    }
}
//calling main function
runPrediction(window.allSources);    
window.runPrediction=runPrediction; //make global


