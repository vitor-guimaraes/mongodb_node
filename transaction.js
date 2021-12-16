const { MongoClient } = require('mongodb');

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
    // const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/sample_airbnb?retryWrites=true&w=majority";
    
    const userdb = 'admin';
    const passdb = 'password1234';

    // const uri = 'mongodb+srv://admin:password1234@cluster0.8bj40.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
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
        
        // console.log(
        //     createReservationDocument("Infinite Views", [new Date("2019-12-31"), new Date("2020-01-01")],
        //     { pricePerNight: 180, specialRequests: "Late checkout", breakfastIncluded: true })
        //     );

        await createReservation(client,
            "leslie@example.com",
            "Infinite Views",
            [new Date("2019-12-31"), new Date("2020-01-01")],
            { pricePerNight: 180, specialRequests: "Late checkout", breakfastIncluded: true });
        
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
        console.log('ending connection to mongodb!');1

    }
}

main().catch(console.error);

// Add functions that make DB calls here

function createReservationDocument(nameOfListing, reservationDates, reservationDetails) {
    // Create the reservation
    let reservation = {
        name: nameOfListing,
        dates: reservationDates,
    }

    // Add additional properties from reservationDetails to the reservation
    for (let detail in reservationDetails) {
        reservation[detail] = reservationDetails[detail];
    }

    return reservation;
}

async function createReservation(client, userEmail, nameOfListing, reservationDates, reservationDetails) {
    const usersCollection = client.db("sample_airbnb").collection("users");
    const listingsAndReviewsCollection = client.db("sample_airbnb").collection("listingsAndReviews");

    const reservation = createReservationDocument(nameOfListing, reservationDates, reservationDetails);

    const session = client.startSession();

    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };

    try {
        const transactionResults = await session.withTransaction(async () => {
            
            const usersUpdateResults = await usersCollection.updateOne(
                { email: userEmail },
                { $addToSet: { reservations: reservation } },
                { session });
            console.log(`${usersUpdateResults.matchedCount} document(s) found in the users collection with the email address ${userEmail}.`);
            console.log(`${usersUpdateResults.modifiedCount} document(s) was/were updated to include the reservation.`);
        }, transactionOptions);

        const isListingReservedResults = await listingsAndReviewsCollection.findOne(
            { name: nameOfListing, datesReserved: { $in: reservationDates } },
            { session });
      if (isListingReservedResults) {
            await session.abortTransaction();
            console.error("This listing is already reserved for at least one of the given dates. The reservation could not be created.");
            console.error("Any operations that already occurred as part of this transaction will be rolled back.");
            return;
         }

        const listingsAndReviewsUpdateResults = await listingsAndReviewsCollection.updateOne(
            { name: nameOfListing },
            { $addToSet: { datesReserved: { $each: reservationDates } } },
            { session });
        console.log(`${listingsAndReviewsUpdateResults.matchedCount} document(s) found in the listingsAndReviews collection with the name ${nameOfListing}.`);
        console.log(`${listingsAndReviewsUpdateResults.modifiedCount} document(s) was/were updated to include the reservation dates.`);

        if (transactionResults) {
            console.log("The reservation was successfully created.");
       } else {
            console.log("The transaction was intentionally aborted.");
       }
       
    } catch(e){
        console.log("The transaction was aborted due to an unexpected error: " + e);
    
    } finally {
        await session.endSession();
    
    }
}