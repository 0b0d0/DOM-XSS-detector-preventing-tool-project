arraysForData=['payloadDataset0'];
function getStoredData(item){
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
