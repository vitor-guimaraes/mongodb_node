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
    await printCheapestSuburbs(client, 'Australia', 'Sidney', 10);


    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
        console.log('ending connection to mongodb!');
    }
}

main().catch(console.error);

// Add functions that make DB calls here

async function printCheapestSuburbs(client, country, market, maxNumberToPrint) {
  console.log('printing cheapest suburbs');

    const pipeline = [
      {
        '$match': {
           'bedrooms': 1,
           'address.country': 'Australia',
           'address.market': 'Sydney',
           'address.suburb': {
             '$exists': 1,
             '$ne': ''
           },
           'room_type': 'Entire home/apt'
         }
      }, {
        '$group': {
           '_id': '$address.suburb',
           'averagePrice': {
             '$avg': '$price'
           }
         }
      }, {
        '$sort': {
          'averagePrice': 1
         }
      }, {
        '$limit': 10
      }
    ];
    
    //RODAR O PIPELINE
    const aggCursor = client.db('sample_airbnb').collection('listingsAndReviews').aggregate(pipeline);

    await aggCursor.forEach(airbnbListing => {
        console.log(`${airbnbListing._id}: ${airbnbListing.averagePrice}`);
        // console.log('aggcursor');
    })
}
