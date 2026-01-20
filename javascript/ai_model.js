/*This file is not completed not everything is working
it is meant to be used to used for detection and prevent for xss
instead of using regular expression only for detection and encoding only for prevention*/

const safePatterns = [//safe patterns for model know which patterns are good and bad
    /^<p>.*<\/p>$/,      // Safe paragraph tags
    /^<div>.*<\/div>$/,  // Safe div tags
    /^<span>.*<\/span>$/, // Safe span tags
    /^<strong>.*<\/strong>$/, // Safe strong tags
    /^<em>.*<\/em>$/,    // Safe em tags
    /^\w+$/,            // Alphanumeric input
    /^(hello|world|example)$/i, // Common benign strings
    /&lt;.*&gt;/       // HTML-escaped characters
];

const dangerousPatterns=/alert|eval|fetch|document\.cookie|document\.write|prompt|attr|document\.location|innerHTML|outerHTML|setAttribute|insertAdjacentHTML|location\.href/i;   //logic to put payload in a category
arraysForData=['payloadDataset0','payloadDataset1'];
function getStoredData(item){
    //using the key
    const storedData = localStorage.getItem(item); // Retrieve the string
    if (storedData) {//if found
        const payloadDataSet = JSON.parse(storedData); // Parse the JSON string back to an array
        
        //decode each element to string
        const decodedDataset=payloadDataSet.map(encodedPayload=>
            decodeURIComponent(atob(encodedPayload))
        );
        //console.log("Retrieved Payload Dataset");
        //return payloadDataSet;
        return decodedDataset
    } else {
        return [];
    }
}

const dataSetOne=getStoredData(arraysForData[0]);
const dataSetTwo=getStoredData(arraysForData[1])

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
        const isDangerous=!isSafe && dangerousPatterns.test(payload);//see if it matches any dangerous pattern
        xs.push([length]);

        //includes one hot encoding which converts data into numbers format
        ys.push(isSafe ? [1, 0, 0] : isDangerous ? [0, 1, 0] : [0, 0, 1]); // [safe, dangerous, neutral]
    });

    return{
        xs: tf.tensor2d(xs), // Features tensor
        ys: tf.tensor2d(ys) // Labels tensor
        //converts feature and label arrays to tensorFlow tensors
    };
}

function trainModel(dataSets){
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
    }).catch(error => {
        console.error("Error during training:", error);
    });

    });
    
}


dataSetArray=[dataSetOne, dataSetTwo];
//passing datasets as a array into function parameter
//to run each dataSet and store them to combine them later
trainModel(dataSetArray);

//Adding a function to deal with webGL and tensor not being available
function resolveAvailablityIssue(dataSets){
    //check if webGL is available
    if(!tf.getBackend()==='webgl'){
        console.error("WebGL may be disabled, enable it in browser settings");
        //retry after some time
        setTimeout(()=>resolveAvailablityIssue(dataSets),5000);//retry every 5 seconds 1000=1 second
    }

    let isDataValid=true;//verify validity of dataset

    dataSets.forEach((data,index)=>{
        const trainingData = arrangeTrainingData(data); // Retrieve training data for this dataset

        // Check tensor shapes
        if (trainingData.xs.shape[0] === 0 || trainingData.ys.shape[0] === 0) {
            console.error("Dataset", index + 1," is empty or incorrectly shaped.");
            isDataValid = false; // Mark as invalid
        }
    });

    //redo if data is invalid
    if (!isDataValid) {
        setTimeout(() => resolveAvailablityIssue(dataSets), 5000); // Retry after 5 seconds 1000=1 second
        
    }
    //if checks pass model is trained
    trainModel(dataSets);
}

//start checking and training model
//resolveAvailablityIssue(dataSetArray);



