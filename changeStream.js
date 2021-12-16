const { MongoClient } = require('mongodb');

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
    // const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/sample_airbnb?retryWrites=true&w=majority";
    const userdb = 'admin';
    const passdb = 'password1234';

    const uri = `mongodb+srv://${userdb}:${passdb}@cluster0.8bj40.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    
    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client =  new MongoClient(uri, {useUnifiedTopology: true})
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();
        console.log('connected to mongodb!');


        // Make the appropriate DB calls

        // const pipeline = [
        //     {
        //         '$match': {
        //             'operationType': 'insert',
        //             'fullDocument.address.country': 'Australia',
        //             'fullDocument.address.market': 'Sydney'
        //         },
        //     }
        // ];

        // await monitorListingsUsingEventEmitter(client, 30000, pipeline);

        // await monitorListingsUsingEventEmitter(client);

        await monitorListingsUsingHasNext(client);

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
        console.log('ending connection to mongodb!');

    }
}

main().catch(console.error);

// Add functions that make DB calls here

function closeChangeStream(timeInMs = 60000, changeStream) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Closing the change stream");
            changeStream.close();
            resolve();
        }, timeInMs)
    })
};

async function monitorListingsUsingEventEmitter(client, timeInMs = 60000, pipeline = []){
    const collection = client.db("sample_airbnb").collection("listingsAndReviews");
    const changeStream = collection.watch(pipeline);
    
    changeStream.on('change', (next) => {
        console.log(next);
   });

   await closeChangeStream(timeInMs, changeStream);
}

async function monitorListingsUsingHasNext(client, timeInMs = 60000, pipeline = []) {
    const collection = client.db("sample_airbnb").collection("listingsAndReviews");
    const changeStream = collection.watch(pipeline);
    closeChangeStream(timeInMs, changeStream);

    try {
        while (await changeStream.hasNext()) {
           console.log(await changeStream.next());
        }
     } catch (error) {
        if (changeStream.isClosed()) {
           console.log("The change stream is closed. Will not wait on any more changes.")
        } else {
           throw error;
       }
    }
}