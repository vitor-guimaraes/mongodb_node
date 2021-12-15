const { MongoClient } = require ('mongodb');

async function main () {

    const userdb = 'admin';
    const passdb = 'password1234';

    // const uri = 'mongodb+srv://admin:password1234@cluster0.8bj40.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
    const uri = `mongodb+srv://${userdb}:${passdb}@cluster0.8bj40.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('connected to mongodb')

        // await listDatabases(client); 

        // await createListing(client, { 
        //     name: 'Lovely Loft',
        //     summary: 'Loft in Paris',
        //     bedrooms: 1,
        //     bathrooms: 1
        // })

    //     await createMultipleListings(client, [
    //     {
    //         name: 'Amsterdam Loft',
    //         summary: 'Loft in Amsterdam',
    //         property_type: 'House',
    //         bedrooms: 3,
    //         bathrooms: 2,
    //         beds: 3
    //     }, 
    //     {
    //         name: 'Zurich Loft',
    //         summary: 'Loft in Zurich',
    //         property_type: 'Apartment',
    //         bedrooms: 6,
    //         bathrooms: 3
    //     }, 
    //     {
    //         name: 'Edinburgh Loft',
    //         summary: 'Loft in Edinburgh',
    //         property_type: 'Apartment',
    //         bedrooms: 3,
    //         bathrooms: 5,
    //         beds: 3,
    //         last_review: new Date()
    //     }
    // ]);

    // await findOneListingByName(client, 'Edinburgh Loft');

    await updateListingByName(client, 'Amsterdam Loft', {beds: 2, bedrooms: 2}); //NÃO FAZ A MERDA DO UPDATE, PORQUE?????

    } catch (err) {
        console.error(err);
    } finally {
        await client.close()
    }
}

main().catch(console.error);

async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();

    console.log('Databases:');
    databasesList.databases.forEach(db => {
        console.log(`- ${db.name}`);
    });
}

async function createListing(client, newListing) {
    const result = await client.db('sample_airbnb').collection('listingsAndReviews').insertOne(newListing);

    console.log(`New listing created with id: ${result.insertedId}`);
}

async function createMultipleListings(client, newListings) {
    const result = await client.db('sample_airbnb').collection('listingsAndReviews').insertMany(newListings);

    console.log(`${result.insertedCount} new listings with ids:`);
    console.log(`${result.insertedIds}`); //NÃO IMPRIME AS IDS
}

async function findOneListingByName(client, nameOfListing) {
    const result = await client.db('sample_airbnb').collection('listingsAndReviews').findOne({ name: nameOfListing });

    if (result) {
        console.log(`Found listing in the collectionwith the name '${nameOfListing}'`);
        console.log(result);
    } else {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}

async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db('sample_airbnb').collection('listingAndReviews').updateOne( { name: nameOfListing }, 
        { $set:updatedListing });

        console.log(`${result.matchedCount} documents matched the criteria`);
        console.log(`${result.modifiedCount} documents were updated`);

}