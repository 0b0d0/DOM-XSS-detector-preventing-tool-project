/*This file is to be used to used for detection afor xss
instead of using regular expression only for detection and encoding only for prevention*/
/*if a function is async has has an asynchronus nature without the async the logic cannot work */

const safePatterns = [
    /^<p>(?:[^<]*|<br\s*\/?>)*<\/p>$/,
    /^<div>(?:[^<]*|<br\s*\/?>)*<\/div>$/,
    /^<span>(?:[^<]*|<br\s*\/?>)*<\/span>$/,
    /^<strong>(?:[^<]*|<br\s*\/?>)*<\/strong>$/,
    /^<em>(?:[^<]*|<br\s*\/?>)*<\/em>$/,
    /^[a-zA-Z0-9\s]+$/, // Alphanumeric input (may remain as is)
    /^(hello|world|example|test)$/i,
    /^&lt;[^&]*&gt;$/,
    /^<a\s+href="(https?:\/\/[^\s"']+)"[^>]*>([^<]*)<\/a>$/, // Ensure the href is clean
    /^<img\s+src="(https?:\/\/[^\s"']+)"\s+alt="[^"]*"\s*\/?$/, // Ensure src and alt are clean
    /^<ul>(<li>(?:[^<]*|<br\s*\/?>)*<\/li>)+<\/ul>$/,
    /^<ol>(<li>(?:[^<]*|<br\s*\/?>)*<\/li>)+<\/ol>$/,
    /^<blockquote>(?:[^<]*|<br\s*\/?>)*<\/blockquote>$/,
    /^<!--(?:[^-]|-\s?)*-->$/
];


const dangerousPatterns = /(?:\b(alert|eval|fetch|document\.cookie|document\.write|prompt|window\.location|innerHTML|outerHTML|setAttribute|insertAdjacentHTML|location\.href)\b|javascript:|data:|vbscript:|on\w+=)/i;
//Adding extra context-aware checks for potential malicious patterns
const obfuscatedDangerousPatterns = new RegExp(
    `(?:` +
    `(?:%3C|<).*?(?:%3E|>).*?(?:(?:document|window|eval|alert|write|cookie|location|innerHTML).*)` +
    `|(?:javascript:|data:|vbscript:).*?(?:<script(?:.*?)(?:<\\/script>)?)` +
    `|(?:<[^>]*?on[a-z]+=[^>]*?)` +
    `)`, 'i'
);

arraysForData=['payloadDataset0','payloadDataset1','payloadDataset2'];
arraysForModelInStorage=["model1","model2","model3"];



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
    const xs=[];//features
    const ys=[];//labels
    data.forEach(payload => {
        //assuming payload is string
        const length=payload.length; //example feature
        //is payload matching at least one of the safe patterns - done with some function
        const isSafe=safePatterns.some(pattern=>
        typeof pattern==='string' ? payload.includes(pattern): // checks for strings and regular expressions
    pattern.test(payload));
        const isDangerous=!isSafe && (dangerousPatterns.test(payload) ||
    obfuscatedDangerousPatterns.test(payload));//see if it matches the dangerous or obfuscated patterns
        xs.push([length]);

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
    //this builds a neural network
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [1] }));
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

//trying to see if i can run function if model are not in storage
async function checkAndTrainModels() {
    //wait for returned array which promise
    let dataSets= collectDatasets();//using  array returned in function
    if(dataSets){//if true
        console.log("Datasets have been collected");
        //console.log(dataSets); //was checking if data was really there
    }else{
        console.log("No datasets found");
    }
    
    //let dataSets=await collectDatasets();// waits for all the datasets to be stored into one array and returns one array
    if (checkModelsInStorage()==false) {
        console.log("No models found in local storage. Starting training models...");
        await trainModel(dataSets); // Call the trainModel function with the datasets
        console.log("All models are now trained and stored in local storage.");
        
    } else {
         console.log("All models are already trained and stored in local storage.");
    }
}

function checkModelsInStorage(){
    return arraysForModelInStorage.every(modelName=>localStorage.getItem(modelName));
    //returns true of false if every model is in storage
}

//trying to load models from storag//array to store models
let models=[];
// i know the length of the model array
async function loadModels(){
    //await fetchDataAndTrainModel();
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
            console.error("Error loading model", z);
            }
        }
        //outside loop
        z++;
        return models
    }
    

}

//console.log("Checking for loaded model",loadModels());

//trying to combine the models to get final predciton
//prediction will be used to check if the input matches is safe, dangerous or neutral

async function combineModels(models,inputData){//fetch data from local storage
    // Ensure that models array is valid
    if (!models || models.length === 0) {
        throw new Error("No valid models available for prediction.");
    }

    // Get predictions from all models
    const predictions = await Promise.all(models.map(model => model.predict(inputData)));

    // Ensure all predictions are valid and have the same shape
    if (predictions.some(prediction => !prediction || prediction.shape.length !== 2)) {
        throw new Error("One or more predictions are invalid.");
    }

    // Assuming all predictions share the same shape, calculate the average
    const combinedPrediction = predictions.reduce((acc, curr) => acc.add(curr), tf.zeros(predictions[0].shape)).div(predictions.length);

    return combinedPrediction; // Returns combined prediction
}


//function to assign category for final prediction
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

async function processPayloads(input,models){
    const inputDataTensors=input.map(payload=>
    tf.tensor2d([[payload.length]]));//pass each payload as a 2d array

    //iterate through each input that will be predicted
    for(const inputData of inputDataTensors){
        const finalPrediction=await combineModels(models,inputData);//calls function which return value and //returns results from function
        //console.log("Final prediction for payload: ",finalPrediction); //may not need to log the object

        //assign a categroy based on prediction
        //finalprediction as the parameter
        const classfication=assignCategory(finalPrediction);
        //get original payload
        const originalPayload=input[inputDataTensors.indexOf(inputData)];//get index of value

        if(classfication.label==="Dangerous"){ //awaits for promise then checks
            //display dangerous payload found
            console.log("Dangerous payload found",originalPayload);
        }else if( classfication.label==="Safe"){//awaits promise then checks
            console.log("Payload is safe",originalPayload);
        }else if(classfication.label==="Neutral or Unknown",originalPayload){
            console.log("Cannot classify what this is",originalPayload);
        }
    }
}

//making processpayloads function global
window.processPayloads=processPayloads;


//making example array of payloads
let arrayOfPayloads=['<a href="data:text/html;base64_,<svg/onload=\u0061&#x6C;&#101%72t(1)>">X</a','<img src=xss onerror=alert(1)>'];
async function runPrediction(input){
    //console.log("Checking this function works",loadModels());
    //length of datasets is equal to length of models
    try {
        await window.fetchAllData(); // Using await for cleaner promise handling

        await checkAndTrainModels(); // Wait for models to be trained

        const models = await loadModels(); // Load models only once
        console.log("Checking if this works", models);
        
        // Process payloads with the loaded models
        await processPayloads(input, models);
        console.log("Processing complete.");
        //console.log(processPayloads.label,"Trying to see diplsaying the label from processPyaloads function works\n");// this did not show the label
    
    } catch (error) {
        console.error("Error during processing:", error); // Handle errors
    }
}    
runPrediction(arrayOfPayloads);

// Call the function from another file
test();
