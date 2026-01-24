/*This file is to be used to used for detection afor xss
instead of using regular expression only for detection and encoding only for prevention*/

const safePatterns = [//safe patterns for model know which patterns are good and bad
   // Safe paragraphs without nested tags
    /^<p>(?:[^<]*|<br\s*\/?>)*<\/p>$/,                          
    // Safe divs without nested tags
    /^<div>(?:[^<]*|<br\s*\/?>)*<\/div>$/,                      
    // Safe spans without nested tags
    /^<span>(?:[^<]*|<br\s*\/?>)*<\/span>$/,                    
    // Safe strong, em tags
    /^<strong>(?:[^<]*|<br\s*\/?>)*<\/strong>$/,                 
    /^<em>(?:[^<]*|<br\s*\/?>)*<\/em>$/,                         
    // Alphanumeric input (for text inputs)
    /^[a-zA-Z0-9\s]+$/,                                        
    // Specific benign strings
    /^(hello|world|example|test)$/i,                            
    // HTML-escaped characters
    /^&lt;[^&]*&gt;$/,                                         
    // Valid <a> tags with safe hrefs
    /^<a\s+href="(https?:\/\/[^\s"']+)"[^>]*>([^<]*)<\/a>$/,   
    // Valid <img> tags with safe src and alt attributes
    /^<img\s+src="(https?:\/\/[^\s"']+)"\s+alt="[^"]*"\s*\/?>$/, 
    // Safe unordered and ordered lists
    /^<ul>(<li>(?:[^<]*|<br\s*\/?>)*<\/li>)+<\/ul>$/,         
    /^<ol>(<li>(?:[^<]*|<br\s*\/?>)*<\/li>)+<\/ol>$/,         
    // Safe blockquotes
    /^<blockquote>(?:[^<]*|<br\s*\/?>)*<\/blockquote>$/,        
    // HTML comments
    /^<!--(?:[^-]|-\s?)*-->$/,  
];

const dangerousPatterns = /(?:alert|eval\(|fetch\(|document\.cookie|document\.write|prompt\(|eval|window\.location|innerHTML|outerHTML|setAttribute|insertAdjacentHTML|location\.href|javascript:|data:|vbscript:|on(blur|change|click|dblclick|error|focus|keydown|keypress|keyup|load|mousedown|mousemove|mouseout|mouseover|mouseup|resize|scroll|submit|unload|wheel|pointermove|pointerover)=)/i;

//Adding extra context-aware checks for potential malicious patterns
const obfuscatedDangerousPatterns = new RegExp(
    `(?:` +
    `(?:%3C|<)(?:.*?)(?:%3E|>)(?:.*?)(?:(?:document|window|eval|alert|write|cookie|location|innerHTML).*)` +
    `|(?:javascript:|data:|vbscript:)(?:.*?)(?:<script(?:.*?)(?:<\/script>)?)` +
    `|(?:<[^>]*?on[a-z]+=[^>]*?)` +
    `)`, 'i'
);
const inputPayload=['<sVg><scRipt %00>alert&lpar;1&rpar; {Opera}'];
//making example array of payloads
arrayOfPyalods=['<a href="data:text/html;base64_,<svg/onload=\u0061&#x6C;&#101%72t(1)>">X</a','<img src=xss onerror=alert(1)>'];

arraysForData=['payloadDataset0','payloadDataset1','payloadDataset2'];
arraysForModelInStorage=["model1","model2","model3"];
function getStoredData(item){
    //using the key
    const storedData = localStorage.getItem(item); // Retrieve the string
    try{
        if (storedData) {//if found
        const payloadDataSet = JSON.parse(storedData); // Parse the JSON string back to an array
        
        //decode each element to string
        const decodedDataset=payloadDataSet.map(encodedPayload=>
            decodeURIComponent(atob(encodedPayload))
        );
        return decodedDataset
    }
    }catch(error){
        console.error("Error parsing data set");
        return [];
    }
}

//making an array to make this easier to maintain
let dataSets=[];
//go through each  array for data
arraysForData.forEach((data)=>{
    const dataset=getStoredData(data);
    dataSets.push(dataset); //add each dataset to the array to be used to train each model
});

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

async function checkExistingModel(index){
    
}

//global models array to store models to use for predition combination
let models=[]; //does  not handle asynchronous training

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
        //push models into models array
        models.push(model); 
        completeCounter++;//add counter by 1

        //storing model in local storage
        localStorage.setItem('model'+(completeCounter),JSON.stringify(model));

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
trainModel(dataSets);



//when model has been trained

// Train models and wait for completion of all model training , before running predictions
/*trainModel(dataSets)
    .then(() => {//after training all models it calls a function
        // Now that the models are trained, call the prediction function
        return runPrediction(); // Call to run prediction after training
    })
    .then(() => {
        console.log("Processing complete."); // Indicate processing is complete
    })
    .catch(error => {
        console.error("Error during processing:", error); // Handle any errors
    });*/



//trying to combine the models to get final predciton
//prediction will be used to check if the input matches is safe, dangerous or neutral
async function combineModels(models,inputData){
    const predictions=await Promise.all(models.map(model=>
    model.predict(inputData)));

    //get average or combine models makes a combinedprediction
    const combinedPrediction=predictions.reduce((acc,curr)=> acc.add(curr),
    tf.zeros(predictions[0].shape)).div(models.length);

    
    return combinedPrediction;// returns al the information about the object which stores information
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

async function processPayloads(inputPayload,models){
    const inputDataTensors=inputPayload.map(payload=>
    tf.tensor2d([[payload.length]]));//pass each payload as a 2d array

    //iterate through each input that will be predicted
    for(const inputData of inputDataTensors){
        const finalPrediction=await combineModels(models,inputData);//calls function which return value and //returns results from function
        //console.log("Final prediction for payload: ",finalPrediction); //may not need to log the object

        //assign a categroy based on prediction
        //finalprediction as the parameter
        const classfication=assignCategory(finalPrediction);
        //get original payload
        const originalPayload=inputPayload[inputDataTensors.indexOf(inputData)];//get index of value

        if(await classfication.label==="Dangerous"){ //awaits for promise then checks
            //display dangerous payload found
            console.log("Dangerous payload found",originalPayload);
        }else if(await classfication.label==="Safe"){//awaits promise then checks
            console.log("Payload is safe",originalPayload);
        }else if(await classfication.label==="Neutral or Unknown",originalPayload){
            console.log("Cannot classify what this is");
        }
    }
}

//making processpayloads function global
window.processPayloads=processPayloads;

async function runPrediction(){
    try {
        await processPayloads(arrayOfPyalods,models);//waits for the function value
        console.log("Processing complete.");
        //console.log(processPayloads.label,"Trying to see diplsaying the label from processPyaloads function works\n");// this did not show the label
    } catch (error) {
        console.error("Error during processing:", error); // Handle errors
    }
}    


// Call the function from another file
test();
