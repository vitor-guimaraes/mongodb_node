const { MongoClient } = require ('mongodb');

async function main () {

    const userdb = 'admin';
    const passdb = 'password1234';

    // const uri = 'mongodb+srv://admin:password1234@cluster0.8bj40.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
    const uri = `mongodb+srv://${userdb}:${passdb}@cluster0.8bj40.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('connected o mongodb')
    } catch (err) {
        console.error(err);
    } finally {
        await client.close()
    }
}

main().catch(console.error);