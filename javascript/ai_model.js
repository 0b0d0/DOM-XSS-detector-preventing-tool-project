//const module=require('./getDatasets.js');
/*This file is not completed not everything is working
it is meant to be used to used for detection and prevent for xss
instead of using regular expression for detection and encoding for prevention*/

arraysForData=['payloadDataset0'];
function getStoredData(item){
    //using the key
    const storedData = localStorage.getItem(item); // Retrieve the string
    if (storedData) {//if found
        const payloadDataSet = JSON.parse(storedData); // Parse the JSON string back to an array
        //console.log("Retrieved Payload Dataset: ", payloadDataSet);
        return payloadDataSet;
    } else {
        return [];
    }
}

const dataSetOne=getStoredData(arraysForData[0]);

function arrangeTrainingData(data){
    //makes arrays and for each payload
    //calculates the lrngth as a feature and classifies payload as safe or dangerous
    const xs=[];//features
    const ys=[];//labels
    data.forEach(payload => {
        //assuming payload is string
        const length=payload.length; //example feature
        const isDangerous=  //logic to put payload in a category
        xs.push([length]);

        //includes one hot encoding which converts data into numbers format
        ys.push(isDangerous ? [1,0]:[0,1]);
    });

    return{
        xs: tf.tensor2d(xs), // Features tensor
        ys: tf.tensor2d(ys) // Labels tensor
        //converts feature and label arrays to tensorFlow tensors
    };
}

function trainModel(data){
    const trainingData=arrangeTrainingData(data); //calls dataset to get formatted tensors
    //makes object for sequential model
    const model=tf.sequential();
    //adds 64 units(ReLU) layer and 2 units(softmax binary calssification) layer
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [1] }));
    model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));
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
        console.log("Model training complete.");
    }).catch(error => {
        console.error("Error during training:", error);
    });
}


if(dataSetOne.length==0){
    console.log("No data found to train model");
}else{
    console.log("Data found to train model");
    trainModel(dataSetOne);
}

window.dataSetOne=dataSetOne;
// Call the function from another file
test();
