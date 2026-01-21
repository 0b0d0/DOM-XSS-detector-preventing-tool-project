/*This file is not completed not everything is working
it is meant to be used to used for detection and prevent for xss
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

arraysForData=['payloadDataset0','payloadDataset1','payloadDataset2'];
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
    //calculates the lrngth as a feature and classifies payload as safe or dangerous
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

//global models array
let models=[];

async function trainModel(dataSets){
    let completeCounter=0;//checks if training for each model is done
    //for each calls a function for each item in array
    dataSets.forEach((data,index)=>{
        const trainingData=arrangeTrainingData(data); //calls dataset to get formatted tensors
    //makes object for sequential model
    const model=tf.sequential();
    //adds 64 units(ReLU) layer and 2 units(softmax binary calssification) layer
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [1] }));
    model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));
    //comiples it with adam

    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
    
    model.fit(trainingData.xs,trainingData.ys,{
        epochs: 50,
        callbacks: {
            onEpochEnd: function(epoch, logs) {
                console.log("Epoch: " + epoch + ", Loss: " + logs.loss + ", Accuracy: " + logs.acc);
            }
        }
    }).then(() => {
        console.log("Model training complete for the model",index+1);
        //push models into models array
        models.push(model);
        completeCounter++;//add counter by 1

        if(completeCounter===dataSets.length){
            console.log("ALL MODELS TRAINED ");
        }
    }).catch(error => {
        console.error("Error during training:", error);
    });

    });
}

//passing datasets as a array into function parameter
//to run each dataSet and store them to combine them later
trainModel(dataSets);

//trying to combine the models to get final predciton
//prediction will be used to check if the input matches is safe, dangerous or neutral
async function combineModels(models,inputData){
    const predictions=await Promise.all(models.map(model=>
    model.predict(inputData)));

    //get average or combine models
    const combinedPrediction=predictions.reduce((acc,curr)=> acc.add(curr),
    tf.zeros(predictions[0].shape)).div(models.length);
    
    return combinedPrediction; 
}

combineModels(trainModel(dataSets),'<sVg><scRipt %00>alert&lpar;1&rpar; {Opera').then(finalPrediction=>{
    console.log("Final prediction: ",finalPrediction);
    //returns promise of final predcition
});


// Call the function from another file
test();
